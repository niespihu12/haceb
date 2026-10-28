// ============================================================================
// Datos de la pestaña «Agentes»: escenarios, trayectoria de cada caso (con el
// motor real del simulador) y caso completo. El catálogo (agentes, ventanas,
// personas, escenas) vive en agentesCatalogo.ts; los datos sintéticos en
// agentesDatos.ts; el plan de pasos en agentesPlan.ts.
// ============================================================================

import type { Canal, Operacion } from '@/types';
import type { Caso, Escenario, OpcionesCaso } from '@/types/agentes';
import { CANALES, esTerminal, idOperacion } from '@/data/mockData';
import { nuevaOperacion, transicionar, type DecisionSimulada } from '@/data/motor';
import type { Excepcion, TipoExcepcion } from '@/types';
import { ETAPA_DE_NOVEDAD, excepcionDelEscenario, humanoPara } from './agentesCatalogo';
import { construirDatos } from './agentesDatos';
import { generarPlan } from './agentesPlan';
import { entre, rngDesde } from './agentesUtil';

export { AGENTES, AGENTES_MAP, ESCENAS, ESCENARIO_LABEL, ETAPA_AGENTE, HUMANOS, SISTEMAS, excepcionDelEscenario, humanoPara, nombreSistema } from './agentesCatalogo';
export { generarPlan } from './agentesPlan';
export { miles, slugAncla } from './agentesUtil';

export interface ContextoGeneracion {
  /** Interruptor «Selección automática» de la barra (R09). */
  seleccionAutomatica: boolean;
  /** Reloj de la operación del simulador (SimulationContext.ahora). */
  ahoraSim: number;
}

/* ─── Elección determinista de escenario y canal ─── */
const ESCENARIOS_PONDERADOS: { escenario: Escenario; peso: number }[] = [
  { escenario: 'feliz', peso: 34 },
  { escenario: 'Datos_incompletos', peso: 5 },
  { escenario: 'Sin_respuesta', peso: 4 },
  { escenario: 'Tarifa_sobre_tope', peso: 6 },
  { escenario: 'Sin_transportador', peso: 3 },
  { escenario: 'Mercancia_no_lista', peso: 4 },
  { escenario: 'Retraso_transportador', peso: 4 },
  { escenario: 'Diferencia_llegada', peso: 3 },
  { escenario: 'Espera_en_cargue', peso: 4 },
  { escenario: 'Diferencia_despacho', peso: 3 },
  { escenario: 'Novedad_en_ruta', peso: 6 },
  { escenario: 'Conductor_ocupado', peso: 4 },
  { escenario: 'Destinatario_no_recibe', peso: 3 },
  { escenario: 'Demora_en_descargue', peso: 3 },
  { escenario: 'Diferencia_entrega', peso: 4 },
  { escenario: 'Inconformidad_cliente', peso: 3 },
  { escenario: 'Sobrecosto_liquidacion', peso: 3 },
  { escenario: 'consulta_entrante', peso: 3 },
  { escenario: 'cancelada', peso: 2 },
];

function elegirEscenario(rand: () => number, seleccionAutomatica: boolean): Escenario {
  const total = ESCENARIOS_PONDERADOS.reduce((s, e) => s + e.peso, 0);
  let r = rand() * total;
  for (const e of ESCENARIOS_PONDERADOS) {
    r -= e.peso;
    if (r <= 0) return e.escenario === 'feliz' && !seleccionAutomatica ? 'feliz_manual' : e.escenario;
  }
  return 'feliz';
}

function elegirCanal(rand: () => number, escenario: Escenario): Canal {
  if (escenario === 'Datos_incompletos') return 'llamada_ia';
  const pesos: Canal[] = ['llamada_ia', 'llamada_ia', 'formulario', 'formulario', 'integracion', 'coordinador'];
  return pesos[Math.floor(rand() * pesos.length)] ?? CANALES[0];
}

const usaSeleccionManual = (e: Escenario) => e === 'feliz_manual' || e === 'Seleccion_manual';

/* ─── Decisión de la persona, determinista por caso ─── */
function decisionPara(exc: Excepcion, escenario: Escenario, seq: number): DecisionSimulada {
  const por = `${humanoPara(exc.tipo).nombre} · ${humanoPara(exc.tipo).rol}`;
  if (escenario === 'cancelada') return { decision: 'CANCELAR', por };
  // La persona autoriza la tarifa de ese candidato (B) o un punto medio (C): no se reabre la búsqueda.
  if (exc.tipo === 'Tarifa_sobre_tope') return { decision: 'ALTERNATIVA', alternativa: seq % 2 === 0 ? 'C' : 'B', por };
  if (exc.tipo === 'Sin_transportador' && seq % 2 === 0) return { decision: 'ALTERNATIVA', alternativa: 'B', por };
  if (exc.tipo === 'Seleccion_manual' && seq % 3 === 1) return { decision: 'ALTERNATIVA', alternativa: 'B', por };
  if (exc.tipo === 'Sobrecosto_liquidacion' && seq % 2 === 1) return { decision: 'ALTERNATIVA', alternativa: 'A', por };
  return { decision: 'AUTORIZAR', por };
}

/* ─── Reloj de la trayectoria: salta noches (20:00–06:00) y domingos ─── */
function avanzar(ts: number, minutos: number): number {
  const f = new Date(ts + minutos * 60_000);
  if (f.getHours() >= 20) {
    f.setDate(f.getDate() + 1);
    f.setHours(6, entre(rngDesde(f.getTime()), 0, 30), 0, 0);
  } else if (f.getHours() < 6) {
    f.setHours(6, 0, 0, 0);
  }
  if (f.getDay() === 0) f.setDate(f.getDate() + 1);
  return f.getTime();
}

/* ─── Trayectoria: la operación recorre el flujo con motor.transicionar() ─── */
function recorrer(op0: Operacion, escenario: Escenario, seleccionAutomatica: boolean, ahoraSim: number, rand: () => number, seq: number): Operacion[] {
  const tipo = excepcionDelEscenario(escenario);
  const etapaObj = tipo ? ETAPA_DE_NOVEDAD[tipo] : null;
  const ops: Operacion[] = [op0];
  let p = op0;
  let reloj = ahoraSim;
  let detectada = false;
  for (let i = 0; i < 80 && !esTerminal(p.etapa); i++) {
    reloj = avanzar(reloj, entre(rand, 4, 22));
    const forzarAqui = !!tipo && !detectada && p.etapa === etapaObj;
    const decision = p.etapa === 'Escalada' && p.excepcion ? decisionPara(p.excepcion, escenario, seq) : undefined;
    const r = transicionar(p, {
      ahora: reloj,
      rng: rand,
      seleccionAutomatica: !usaSeleccionManual(escenario) && seleccionAutomatica !== undefined,
      decisionHumana: decision,
      forzar: forzarAqui ? { excepcion: tipo! } : { resolver: true },
    });
    if (!r) break;
    p = r.operacion;
    ops.push(p);
    if (p.excepcion) detectada = true;
  }
  return ops;
}

/**
 * El escenario pedido se materializó de verdad y la historia no se contradice:
 * la novedad detectada es la esperada, el flujo termina en el estado de fin
 * correcto y un caso normal no trae novedades.
 */
function coherente(tr: Operacion[], escenario: Escenario): boolean {
  const tipo = excepcionDelEscenario(escenario);
  const fin = tr[tr.length - 1];
  const todas = new Set<TipoExcepcion>([...tr.flatMap((o) => (o.excepcion ? [o.excepcion.tipo] : [])), ...fin.excepcionesPrevias.map((e) => e.tipo)]);
  const esperada = escenario === 'cancelada' ? 'Cancelada' : 'Cerrada';
  if (fin.etapa !== esperada) return false;
  if (escenario === 'feliz') return todas.size === 0;
  if (escenario === 'feliz_manual') return todas.size === 1 && todas.has('Seleccion_manual');
  if (escenario === 'consulta_entrante') return todas.size === 0 && fin.llamadas.some((l) => l.sentido === 'entrante' && l.objetivo === 'Consulta de estado');
  if (!tipo || !todas.has(tipo)) return false;
  // Una novedad de otro tipo solo se tolera si es la selección manual provocada por la barra
  for (const t of todas) if (t !== tipo && t !== 'Seleccion_manual') return false;
  const exc = tr.find((o) => o.excepcion?.tipo === tipo)?.excepcion;
  if (!exc) return false;
  const humana = exc.categoria !== 'automatico';
  const prev = fin.excepcionesPrevias.find((e) => e.tipo === tipo);
  if (humana && prev?.resueltaPor !== 'coordinador') return false;
  if (escenario === 'cancelada' && prev?.decisionHumana !== 'CANCELAR') return false;
  return true;
}

const INTENTOS = 24;

export function generarCaso(seq: number, ahora: number, ctx: ContextoGeneracion, opts?: OpcionesCaso): Caso {
  const randBase = rngDesde(seq * 7919 + 11);
  const escenario = opts?.escenario ?? elegirEscenario(randBase, ctx.seleccionAutomatica);
  const canal = opts?.canal ?? elegirCanal(randBase, escenario);
  const tipo = excepcionDelEscenario(escenario);
  let tr: Operacion[] | null = null;
  let rand = randBase;
  for (let intento = 0; intento < INTENTOS; intento++) {
    rand = rngDesde(seq * 31 + intento * 97 + 5);
    const { operacion } = nuevaOperacion(ctx.ahoraSim, rand, seq, canal);
    const op0: Operacion = { ...operacion, id: idOperacion(seq), origen: 'agentes' };
    op0.datosPendientes = tipo === 'Datos_incompletos' ? [rand() < 0.5 ? 'Volumen de la carga' : 'Contacto de recibo en destino'] : [];
    if (new Date(op0.fechaCargue).getDay() === 0) op0.fechaCargue += 24 * 3_600_000;
    const candidata = recorrer(op0, escenario, ctx.seleccionAutomatica, ctx.ahoraSim, rand, seq);
    if (coherente(candidata, escenario) || intento === INTENTOS - 1) {
      tr = candidata;
      break;
    }
  }
  const trayectoria = tr!;
  const datos = construirDatos(seq, trayectoria, rand, ctx.ahoraSim);
  const plan = generarPlan(seq, canal, escenario, datos);
  const p0 = trayectoria[0];
  return {
    id: `caso-${seq}`,
    seq,
    operacion: p0,
    canal,
    datos,
    escenario,
    plan,
    etapaIdx: 0,
    pasoIdx: 0,
    restante: plan[0].pasos[0].duracion,
    estado: 'en_cola',
    recibidoEn: ahora,
    tiemposEtapa: {},
    pasosHechos: {},
    excepciones: 0,
    ultimoEvento: ahora,
  };
}

