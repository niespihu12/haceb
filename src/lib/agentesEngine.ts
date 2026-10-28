// ============================================================================
// Motor discreto de la pestaña «Agentes» (tick de 100 ms × velocidad).
//
// Cada agente atiende un caso a la vez con su cola; las esperas humanas
// liberan al agente. Cuando un paso declara `snapshot`, la operación publicada
// al pipeline general pasa a ser ese snapshot de la trayectoria (calculada
// con motor.transicionar()). Expone un store para useSyncExternalStore y
// `window.__agentes` para depurar.
// ============================================================================

import type { Operacion } from '@/types';
import type {
  AgenteId, Caso, EntradaBitacora, EstadoAgente, OpcionesCaso, PasoPlan, Snapshot,
} from '@/types/agentes';
import { AGENTES, AGENTES_MAP, generarCaso, type ContextoGeneracion } from '@/data/agentesData';
import { CANAL_INFO } from '@/data/mockData';

export interface EngineCallbacks {
  /** Una solicitud nueva entra por el canal: se registra en el pipeline general. */
  onNuevaOperacion: (o: Operacion) => void;
  /** La operación cambió de estado (snapshot de la trayectoria): se actualiza en el pipeline. */
  onOperacion: (o: Operacion, mensaje: string, t: number) => void;
}

const TICK_MS = 100;
const ENTRADA_MIN = 9_000;
const ENTRADA_MAX = 16_000;
const SEQ_INICIAL = 7001;
const MAX_CASOS = 60;
const MAX_BITACORA = 400;
const SEMILLA_MS = 80_000;

function agentesIniciales(): Record<AgenteId, EstadoAgente> {
  const r = {} as Record<AgenteId, EstadoAgente>;
  for (const a of AGENTES) r[a.id] = { id: a.id, activo: null, cola: [], procesadas: 0, ocupadoMs: 0, ultimaAccion: 'En espera de trabajo' };
  return r;
}

class AgentesEngine {
  private casos: Caso[] = [];
  private agentes = agentesIniciales();
  private bitacora: EntradaBitacora[] = [];
  private handoffs: Snapshot['handoffs'] = [];
  private relojSim = 0;
  private ahora = Date.now();
  private proximaEntradaEn = 1_500;
  private seq = SEQ_INICIAL;
  private idBitacora = 1;
  private idHandoff = 1;
  private velocidad = 1;
  private timer: ReturnType<typeof setInterval> | null = null;
  private listeners = new Set<() => void>();
  private version = 0;
  private snapshot: Snapshot | null = null;
  private callbacks: EngineCallbacks | null = null;
  private focoId: string | null = null;
  private autoSeguir = true;
  private sembrando = false;
  private contexto: ContextoGeneracion = { seleccionAutomatica: true, ahoraSim: Date.now() };
  private acumulado = { terminados: 0, cerradas: 0, canceladas: 0, stp: 0, escalados: 0, excepciones: 0, acciones: 0, cicloTotalMs: 0 };

  /* ─── API pública ─── */
  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => { this.listeners.delete(fn); };
  };

  getSnapshot = (): Snapshot => {
    if (this.snapshot && this.snapshot.version === this.version) return this.snapshot;
    const terminados = this.acumulado.terminados;
    this.snapshot = {
      version: this.version,
      ahora: this.ahora,
      relojSim: this.relojSim,
      velocidad: this.velocidad,
      casos: [...this.casos],
      agentes: Object.fromEntries(Object.entries(this.agentes).map(([k, v]) => [k, { ...v, cola: [...v.cola] }])) as Record<AgenteId, EstadoAgente>,
      bitacora: [...this.bitacora],
      focoId: this.focoId,
      autoSeguir: this.autoSeguir,
      corriendo: this.timer !== null,
      handoffs: [...this.handoffs],
      stats: {
        recibidos: this.seq - SEQ_INICIAL,
        terminados,
        cerradas: this.acumulado.cerradas,
        canceladas: this.acumulado.canceladas,
        stp: this.acumulado.stp,
        escalados: this.acumulado.escalados,
        excepciones: this.acumulado.excepciones,
        cicloPromedioMs: terminados ? this.acumulado.cicloTotalMs / terminados : 0,
        accionesTotales: this.acumulado.acciones,
      },
    };
    return this.snapshot;
  };

  setCallbacks(cb: EngineCallbacks) { this.callbacks = cb; }

  /** Selección automática y reloj de la operación con los que se generan los casos nuevos. */
  setContexto(ctx: Partial<ContextoGeneracion>) {
    this.contexto = { ...this.contexto, ...ctx };
  }

  getSeleccionAutomatica(): boolean { return this.contexto.seleccionAutomatica; }

  setVelocidad(v: number) {
    if (this.velocidad === v) return;
    this.velocidad = v;
    this.emitir();
  }

  start() {
    if (this.timer) return;
    if (this.casos.length === 0) this.sembrar();
    this.timer = setInterval(() => this.tick(TICK_MS * this.velocidad, Date.now()), TICK_MS);
    this.emitir();
  }

  pause() {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
    this.emitir();
  }

  reset() {
    this.pause();
    this.casos = [];
    this.agentes = agentesIniciales();
    this.bitacora = [];
    this.handoffs = [];
    this.relojSim = 0;
    this.proximaEntradaEn = 1_500;
    this.seq = SEQ_INICIAL;
    this.focoId = null;
    this.autoSeguir = true;
    this.acumulado = { terminados: 0, cerradas: 0, canceladas: 0, stp: 0, escalados: 0, excepciones: 0, acciones: 0, cicloTotalMs: 0 };
    this.emitir();
  }

  setFoco(id: string | null) {
    this.focoId = id;
    this.autoSeguir = id === null;
    this.emitir();
  }

  setAutoSeguir(v: boolean) {
    this.autoSeguir = v;
    if (v) this.elegirFoco(Date.now(), true);
    this.emitir();
  }

  /** Genera una entrada ya mismo (botón «Solicitud entrante» / Director de escena). */
  forzarEntrada(opts?: OpcionesCaso, etiquetaEscena?: string) {
    this.nuevaEntrada(Date.now(), true, opts, etiquetaEscena);
    this.emitir();
  }

  /* ─── Internos ─── */
  private emitir() {
    this.version++;
    if (this.sembrando) return;
    for (const l of this.listeners) l();
  }

  private sembrar() {
    this.sembrando = true;
    const fin = Date.now();
    const pasos = SEMILLA_MS / TICK_MS;
    for (let i = 0; i < pasos; i++) {
      this.tick(TICK_MS, fin - SEMILLA_MS + i * TICK_MS);
    }
    this.handoffs = [];
    this.sembrando = false;
    // Abrimos la pantalla con una solicitud entrando ahora mismo y seguimos ese caso.
    this.nuevaEntrada(fin, true);
  }

  private byId(id: string | null): Caso | undefined {
    return id ? this.casos.find(c => c.id === id) : undefined;
  }

  private log(caso: Caso, agente: AgenteId, mensaje: string, t: number, nivel: EntradaBitacora['nivel'], extra: Partial<EntradaBitacora> = {}) {
    this.bitacora.unshift({
      id: this.idBitacora++,
      t,
      agente,
      casoId: caso.id,
      numero: caso.operacion.id,
      mensaje,
      nivel,
      ...extra,
    });
    if (this.bitacora.length > MAX_BITACORA) this.bitacora.length = MAX_BITACORA;
  }

  private nuevaEntrada(ahora: number, enfocar = false, opts?: OpcionesCaso, etiquetaEscena?: string) {
    const seq = this.seq++;
    const caso = generarCaso(seq, ahora, this.contexto, opts);
    if (etiquetaEscena) caso.escenaForzada = etiquetaEscena;
    this.casos.push(caso);
    this.agentes.receptor.cola.push(caso.id);
    const e = caso.datos.solicitud;
    this.log(caso, 'receptor', `Entrada por ${CANAL_INFO[caso.canal].label} · ${e.remitente} · «${e.asunto}»`, ahora, 'info', { sistema: 'canal' });
    this.callbacks?.onNuevaOperacion(caso.operacion);
    if (enfocar || !this.focoId) {
      this.focoId = caso.id;
      this.autoSeguir = true;
    }
    this.podar();
  }

  private podar() {
    if (this.casos.length <= MAX_CASOS) return;
    const terminadas = this.casos.filter(c => c.estado === 'terminada' && c.id !== this.focoId);
    const sobrantes = this.casos.length - MAX_CASOS;
    const quitar = new Set(terminadas.slice(0, sobrantes).map(c => c.id));
    this.casos = this.casos.filter(c => !quitar.has(c.id));
  }

  private pasoActual(caso: Caso): PasoPlan | undefined {
    return caso.plan[caso.etapaIdx]?.pasos[caso.pasoIdx];
  }

  private tomar(agenteId: AgenteId, caso: Caso, ahora: number) {
    const est = this.agentes[agenteId];
    est.activo = caso.id;
    caso.estado = 'procesando';
    if (caso.pasoIdx === 0) {
      caso.tiemposEtapa[agenteId] = { inicio: ahora };
      this.log(caso, agenteId, `${AGENTES_MAP[agenteId].nombre} toma ${caso.operacion.id} (${caso.operacion.cliente.nombre})`, ahora, 'handoff');
    }
    this.iniciarPaso(caso, ahora);
  }

  private iniciarPaso(caso: Caso, ahora: number) {
    const p = this.pasoActual(caso);
    if (!p) return;
    const agenteId = caso.plan[caso.etapaIdx].agente;
    caso.restante = p.duracion;
    caso.ultimoEvento = ahora;
    this.agentes[agenteId].ultimaAccion = p.texto;
    if (p.snapshot !== undefined) {
      const snap = caso.datos.trayectoria[p.snapshot];
      if (snap && snap !== caso.operacion) {
        caso.operacion = { ...snap, origen: 'agentes' };
        this.callbacks?.onOperacion(caso.operacion, `${AGENTES_MAP[agenteId].nombre}: ${p.texto}`, ahora);
      }
    }
    if (p.tipo === 'espera_humana') {
      caso.estado = 'esperando';
      this.agentes[agenteId].activo = null;
      this.agentes[agenteId].ultimaAccion = 'En espera de trabajo';
      this.log(caso, agenteId, `${p.texto} · ${p.humano?.nombre} (${p.humano?.rol}) · el agente sigue con el siguiente caso`, ahora, 'aviso', { sistema: p.sistema });
    }
  }

  private completarPaso(caso: Caso, ahora: number) {
    const etapa = caso.plan[caso.etapaIdx];
    const p = etapa.pasos[caso.pasoIdx];
    const agenteId = etapa.agente;
    const est = this.agentes[agenteId];
    const ok = p.ok !== false;
    caso.pasosHechos[p.id] = { ok, resultado: p.resultado, t: ahora };
    caso.ultimoEvento = ahora;
    this.acumulado.acciones++;
    if (!ok && p.tipo !== 'espera_humana') { caso.excepciones++; }
    if (p.id.startsWith('x1')) this.acumulado.excepciones++;
    if (p.tipo === 'espera_humana') this.acumulado.escalados++;
    const mensaje = p.bitacora ?? (p.resultado ? `${p.texto} → ${p.resultado}` : p.texto);
    const esHandoff = /^Entregando a /.test(p.texto);
    if (!esHandoff) {
      this.log(caso, agenteId, mensaje, ahora, !ok ? (p.termina ? 'error' : 'aviso') : 'ok', { sistema: p.sistema, regla: p.regla });
    }

    const veniaEsperando = caso.estado === 'esperando';
    caso.pasoIdx++;

    if (caso.pasoIdx < etapa.pasos.length) {
      if (veniaEsperando) {
        caso.estado = 'en_cola';
        est.cola.unshift(caso.id);
      } else {
        this.iniciarPaso(caso, ahora);
      }
      return;
    }

    // Etapa terminada
    const te = caso.tiemposEtapa[agenteId];
    if (te) te.fin = ahora;
    est.procesadas++;
    if (!veniaEsperando) {
      est.activo = null;
      est.ultimaAccion = 'En espera de trabajo';
    }
    caso.etapaIdx++;
    caso.pasoIdx = 0;
    if (caso.etapaIdx < caso.plan.length) {
      const siguiente = caso.plan[caso.etapaIdx].agente;
      caso.estado = 'en_cola';
      this.agentes[siguiente].cola.push(caso.id);
      this.handoffs.push({ id: this.idHandoff++, de: agenteId, a: siguiente, numero: caso.operacion.id, t: ahora });
      this.log(caso, siguiente, `${caso.operacion.id} en cola de ${AGENTES_MAP[siguiente].nombre} (posición ${this.agentes[siguiente].cola.length})`, ahora, 'handoff');
    } else {
      this.finalizar(caso, ahora);
    }
  }

  private finalizar(caso: Caso, ahora: number) {
    caso.estado = 'terminada';
    caso.terminadoEn = ahora;
    const fin = caso.datos.trayectoria[caso.datos.trayectoria.length - 1];
    caso.resultado = fin.etapa === 'Cerrada' ? 'cerrada' : 'cancelada';
    this.acumulado.terminados++;
    this.acumulado.cicloTotalMs += ahora - caso.recibidoEn;
    if (caso.resultado === 'cerrada') {
      this.acumulado.cerradas++;
      if (!fin.intervencionHumana) this.acumulado.stp++;
    } else {
      this.acumulado.canceladas++;
    }
    const etiqueta = caso.resultado === 'cerrada'
      ? `CERRADA${fin.intervencionHumana ? ' · con intervención humana' : ' · STP'}`
      : `CANCELADA · ${fin.causaCancelacion ?? 'con causa registrada'}`;
    this.log(caso, 'torre', `Expediente ${caso.datos.expediente.numero} cerrado · ${etiqueta} · ${Object.keys(caso.pasosHechos).length} acciones`, ahora, caso.resultado === 'cerrada' ? 'ok' : 'error', { sistema: 'expediente' });
  }

  private elegirFoco(ahora: number, forzar = false) {
    if (!this.autoSeguir) return;
    const actual = this.byId(this.focoId);
    if (!forzar && actual && !(actual.estado === 'terminada' && ahora - (actual.terminadoEn ?? ahora) > 3_500)) return;
    const activos = this.casos.filter(c => c.estado !== 'terminada');
    if (activos.length === 0) return;
    activos.sort((a, b) => (a.etapaIdx - b.etapaIdx) || (b.recibidoEn - a.recibidoEn));
    this.focoId = activos[0].id;
  }

  private tick(dt: number, ahora: number) {
    this.relojSim += dt;
    this.ahora = ahora;

    this.proximaEntradaEn -= dt;
    if (this.proximaEntradaEn <= 0) {
      this.nuevaEntrada(ahora);
      this.proximaEntradaEn = ENTRADA_MIN + Math.random() * (ENTRADA_MAX - ENTRADA_MIN);
    }

    for (const caso of this.casos) {
      if (caso.estado !== 'esperando') continue;
      caso.restante -= dt;
      if (caso.restante <= 0) this.completarPaso(caso, ahora);
    }

    for (const a of AGENTES) {
      const est = this.agentes[a.id];
      if (!est.activo && est.cola.length > 0) {
        const id = est.cola.shift()!;
        const caso = this.byId(id);
        if (caso) this.tomar(a.id, caso, ahora);
      }
      if (est.activo) {
        const caso = this.byId(est.activo);
        if (!caso) { est.activo = null; continue; }
        caso.restante -= dt;
        est.ocupadoMs += dt;
        if (caso.restante <= 0) this.completarPaso(caso, ahora);
      }
    }

    this.handoffs = this.handoffs.filter(h => ahora - h.t < 2_500);
    this.elegirFoco(ahora);
    this.emitir();
  }
}

export const agentesEngine = new AgentesEngine();

// Acceso de depuración desde la consola del navegador.
(window as unknown as { __agentes?: AgentesEngine }).__agentes = agentesEngine;
