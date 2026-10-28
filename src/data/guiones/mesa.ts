import type { Alternativa, DecisionHumana, TipoExcepcion } from '@/types';
import type { AccionUI, DatosCaso, Humano } from '@/types/agentes';
import { EXCEPCION_LABEL, PLANTILLA_EXCEPCION } from '@/data/mockData';
import type { CtxGuion, Guion, Guiones } from './tipos';

/* ═══════════════ Mesa del coordinador · x3 (espera humana) ═══════════════
 * Compartido entre el guion (qué lee y qué pulsa la persona) y la ventana
 * (qué ve en cada instante): así los dos cuentan lo mismo.
 */

export type SecMesa = 'causa' | 'impacto' | 'evidencia' | 'alternativas' | 'recomendacion';
export type BotonMesa = 'autorizar' | 'alternativa' | 'rechazar' | 'cancelar';

/** PIN que teclea la persona (simulado, enmascarado). */
export const PIN_MESA = '4821';
export const TOKEN_MESA = '482916';

/** Instantes del guion x3 que la ventana necesita para derivar su estado. */
export const T_MESA = {
  leerDesde: 0.08,
  leerHasta: 0.58,
  clicAlternativa: 0.64,
  clicBoton: 0.72,
  dialogoDesde: 0.74,
  dialogoHasta: 0.955,
} as const;

export const TITULO_SEC: Record<SecMesa, string> = {
  causa: 'Causa',
  impacto: 'Impacto',
  evidencia: 'Evidencia',
  alternativas: 'Alternativas',
  recomendacion: 'Recomendación del agente',
};

export const ETIQUETA_BOTON: Record<BotonMesa, string> = {
  autorizar: 'Autorizar propuesta del agente',
  alternativa: 'Elegir alternativa',
  rechazar: 'Rechazar propuesta',
  cancelar: 'Cancelar el servicio',
};

/** Decisión real de la persona (de `caso.datos.decision`; sin decisión, autoriza lo recomendado). */
export function decisionMesa(d: DatosCaso): { decision: DecisionHumana; letra: Alternativa['id'] | null; alt?: Alternativa; boton: BotonMesa } {
  const exc = d.excepcion;
  const dec = d.decision;
  const decision: DecisionHumana = dec?.decision ?? 'AUTORIZAR';
  const letra: Alternativa['id'] | null = decision === 'RECHAZAR' ? null : (dec?.alternativa ?? (decision === 'CANCELAR' ? null : exc?.recomendada ?? null));
  const alt = letra ? exc?.alternativas.find(a => a.id === letra) : undefined;
  const boton: BotonMesa =
    decision === 'RECHAZAR' ? 'rechazar'
    : decision === 'CANCELAR' ? 'cancelar'
    : decision === 'ALTERNATIVA' ? (alt?.efecto.tipo === 'cancelar' ? 'cancelar' : 'alternativa')
    : 'autorizar';
  return { decision, letra, alt, boton };
}

/** Etiqueta del botón pulsado con la letra cuando aplica («Elegir alternativa C»). */
export function etiquetaBoton(boton: BotonMesa, letra: string | null): string {
  return boton === 'alternativa' && letra ? `${ETIQUETA_BOTON.alternativa} ${letra}` : ETIQUETA_BOTON[boton];
}

/** Texto del sello: «AUTORIZADO · alternativa B». */
export function textoSelloMesa(boton: BotonMesa, letra: string | null): string {
  const verbo = boton === 'autorizar' ? 'AUTORIZADO' : boton === 'alternativa' ? 'ALTERNATIVA ELEGIDA' : boton === 'rechazar' ? 'RECHAZADO' : 'SERVICIO CANCELADO';
  return letra && boton !== 'rechazar' && boton !== 'cancelar' ? `${verbo} · ${letra}` : verbo;
}

/* ─── Qué resalta la persona en cada tipo de novedad ─── */
interface Enfoque {
  /** Orden en que lee las cinco secciones. */
  orden: SecMesa[];
  /** Línea de evidencia que subraya (índice). */
  evid: number;
  /** Pasa el cursor por todas las alternativas (comparar) o solo por la recomendada. */
  compara: boolean;
}

const ORD = {
  clasico: ['causa', 'impacto', 'evidencia', 'alternativas', 'recomendacion'] as SecMesa[],
  evidenciaPrimero: ['causa', 'evidencia', 'alternativas', 'impacto', 'recomendacion'] as SecMesa[],
  impactoPrimero: ['impacto', 'causa', 'evidencia', 'alternativas', 'recomendacion'] as SecMesa[],
  costos: ['causa', 'evidencia', 'alternativas', 'recomendacion', 'impacto'] as SecMesa[],
  alternativasPrimero: ['causa', 'impacto', 'alternativas', 'evidencia', 'recomendacion'] as SecMesa[],
};

const ENFOQUE_GENERICO: Enfoque = { orden: ORD.clasico, evid: 0, compara: true };

const ENFOQUES: Partial<Record<TipoExcepcion, Enfoque>> = {
  Tarifa_sobre_tope: { orden: ORD.costos, evid: 0, compara: true },
  Sin_transportador: { orden: ORD.alternativasPrimero, evid: 1, compara: true },
  Seleccion_manual: { orden: ORD.evidenciaPrimero, evid: 0, compara: true },
  Mercancia_no_lista: { orden: ORD.impactoPrimero, evid: 1, compara: false },
  Retraso_transportador: { orden: ORD.impactoPrimero, evid: 0, compara: true },
  Diferencia_llegada: { orden: ORD.evidenciaPrimero, evid: 1, compara: false },
  Espera_en_cargue: { orden: ORD.clasico, evid: 0, compara: true },
  Diferencia_despacho: { orden: ORD.evidenciaPrimero, evid: 0, compara: false },
  Novedad_en_ruta: { orden: ORD.impactoPrimero, evid: 0, compara: true },
  Destinatario_no_recibe: { orden: ORD.alternativasPrimero, evid: 0, compara: true },
  Demora_en_descargue: { orden: ORD.clasico, evid: 1, compara: true },
  Diferencia_entrega: { orden: ORD.evidenciaPrimero, evid: 1, compara: false },
  Inconformidad_cliente: { orden: ORD.impactoPrimero, evid: 0, compara: true },
  Sobrecosto_liquidacion: { orden: ORD.costos, evid: 1, compara: true },
};

/** Tipos de novedad que escalan a la persona (una variante del guion x3 por cada uno). */
export const TIPOS_MESA = Object.keys(ENFOQUES) as TipoExcepcion[];

/* ─── Fábrica del guion x3 ─── */
function fabrica(tipo?: TipoExcepcion): Guion {
  const enfoque = (tipo && ENFOQUES[tipo]) || ENFOQUE_GENERICO;
  return (c: CtxGuion) => {
    const d = c.d;
    const exc = d.excepcion;
    const humano: Humano = c.humano ?? d.decision?.humano ?? { nombre: 'Coordinación', rol: 'Coordinador', area: 'Operaciones' };
    const { decision, letra, alt, boton } = decisionMesa(d);
    const numero = d.trayectoria[0]?.id ?? '';
    const plantilla = exc ? PLANTILLA_EXCEPCION[exc.tipo] : undefined;
    const regla = boton === 'cancelar' ? 'R28' : alt?.reglas[0] ?? plantilla?.regla;
    const usaToken = boton === 'autorizar' || boton === 'rechazar';

    const n = enfoque.orden.length;
    const tramo = (T_MESA.leerHasta - T_MESA.leerDesde) / n;
    const r3 = (x: number) => Math.round(x * 1000) / 1000;

    const ui: AccionUI[] = [
      { t: 0, tipo: 'ventana', vista: 'mesa.paquete', actor: 'humano' },
      { t: 0.01, hasta: 0.3, tipo: 'toast', texto: `Decisión pendiente · ${numero} · ${exc?.titulo ?? 'novedad escalada'}`, nivel: 'info', actor: 'humano' },
      { t: 0.02, hasta: T_MESA.dialogoHasta, tipo: 'estado', texto: `Paquete de decisión abierto · ${humano.nombre}`, nivel: 'aviso', actor: 'humano' },
      { t: 0.04, tipo: 'mover', ancla: 'mesa.panel.paquete', actor: 'humano' },
      { t: T_MESA.leerDesde, hasta: T_MESA.leerHasta, tipo: 'scroll', ancla: 'mesa.panel.paquete', actor: 'humano' },
    ];

    enfoque.orden.forEach((sec, i) => {
      const t0 = r3(T_MESA.leerDesde + i * tramo);
      const t1 = r3(t0 + tramo);
      ui.push(
        { t: t0, tipo: 'mover', ancla: `mesa.sec.${sec}`, actor: 'humano' },
        { t: t0, hasta: t1, tipo: 'resaltar', ancla: `mesa.sec.${sec}`, texto: TITULO_SEC[sec], actor: 'humano' },
      );
      if (sec === 'evidencia' && exc && exc.evidencia.length > 0) {
        const k = Math.min(enfoque.evid, exc.evidencia.length - 1);
        const te = r3(t0 + tramo * 0.35);
        ui.push(
          { t: te, tipo: 'mover', ancla: `mesa.evid.${k}`, actor: 'humano' },
          { t: te, hasta: t1, tipo: 'resaltar', ancla: `mesa.evid.${k}`, texto: 'Evidencia', actor: 'humano' },
        );
      }
      if (sec === 'alternativas' && exc) {
        const letras = enfoque.compara ? exc.alternativas.map(a => a.id) : [exc.recomendada];
        letras.forEach((l, j) => {
          ui.push({ t: r3(t0 + (tramo * 0.9 * (j + 1)) / (letras.length + 1)), tipo: 'mover', ancla: `mesa.alt.${l.toLowerCase()}`, actor: 'humano' });
        });
      }
    });

    // La persona decide: elige alternativa (si aplica), pulsa el botón y firma con su PIN.
    if (decision === 'ALTERNATIVA' && letra) {
      ui.push(
        { t: 0.6, tipo: 'mover', ancla: `mesa.alt.${letra.toLowerCase()}`, actor: 'humano' },
        { t: T_MESA.clicAlternativa, tipo: 'clic', ancla: `mesa.alt.${letra.toLowerCase()}`, actor: 'humano' },
      );
    } else if (letra) {
      ui.push({ t: 0.62, tipo: 'mover', ancla: `mesa.alt.${letra.toLowerCase()}`, actor: 'humano' });
    }

    const accion = decision === 'RECHAZAR'
      ? `Rechazar la propuesta del agente para ${numero}.`
      : boton === 'cancelar'
        ? `Cancelar el servicio ${numero}${alt ? ` (alternativa ${alt.id}: ${alt.titulo})` : ''}.`
        : decision === 'ALTERNATIVA'
          ? `Elegir la alternativa ${letra ?? ''}: ${alt?.titulo ?? ''}`
          : `Autorizar la propuesta del agente (${letra ?? ''}): ${alt?.titulo ?? ''}`;
    const cuerpo = `${humano.nombre} · ${humano.rol}\n${accion}`;

    ui.push(
      { t: 0.68, tipo: 'mover', ancla: `mesa.btn.${boton}`, actor: 'humano' },
      { t: T_MESA.clicBoton, tipo: 'clic', ancla: `mesa.btn.${boton}`, actor: 'humano' },
      {
        t: T_MESA.dialogoDesde, hasta: T_MESA.dialogoHasta, tipo: 'dialogo', actor: 'humano',
        dialogo: usaToken
          ? { tipo: 'token', titulo: `Confirmar decisión · ${ETIQUETA_BOTON[boton]}`, cuerpo, casillas: 6, campo: 'Código de seguridad', botones: ['Confirmar'], regla }
          : { tipo: 'firma', titulo: `Confirmar decisión · ${etiquetaBoton(boton, letra)}`, cuerpo, casillas: 4, botones: ['Firmar'], regla },
      },
      { t: 0.745, tipo: 'clic', ancla: 'dlg.campo.pin', actor: 'humano' },
      { t: 0.76, hasta: usaToken ? 0.88 : 0.86, tipo: 'teclear', ancla: 'dlg.campo.pin', texto: usaToken ? TOKEN_MESA : PIN_MESA, mascara: true, actor: 'humano' },
    );
    if (usaToken) {
      ui.push(
        { t: 0.9, tipo: 'mover', ancla: 'dlg.btn.confirmar', actor: 'humano' },
        { t: 0.945, hasta: 0.955, tipo: 'clic', ancla: 'dlg.btn.confirmar', actor: 'humano' },
      );
    } else {
      ui.push(
        { t: 0.87, tipo: 'mover', ancla: 'dlg.campo.firma', actor: 'humano' },
        { t: 0.87, hasta: 0.94, tipo: 'firmar', ancla: 'dlg.campo.firma', actor: 'humano' },
        { t: 0.945, hasta: 0.955, tipo: 'clic', ancla: 'dlg.btn.firmar', actor: 'humano' },
      );
    }
    ui.push(
      { t: 0.96, tipo: 'mover', ancla: 'mesa.sello', actor: 'humano' },
      { t: 0.96, hasta: 1, tipo: 'toast', texto: 'Decisión enviada al proceso · el agente retoma el caso', nivel: boton === 'rechazar' || boton === 'cancelar' ? 'aviso' : 'ok', actor: 'humano' },
      { t: 0.96, hasta: 1, tipo: 'estado', texto: `${textoSelloMesa(boton, letra)} · ${humano.nombre}`, nivel: boton === 'rechazar' || boton === 'cancelar' ? 'aviso' : 'ok', actor: 'humano' },
    );

    const etiqueta = exc ? (EXCEPCION_LABEL[exc.tipo] ?? exc.titulo) : 'la novedad';
    const cita = [plantilla?.regla, plantilla?.politica].filter(Boolean).join(' · ');
    return {
      vista: 'mesa.paquete' as const,
      ui,
      pensamiento: `Mientras decide ${humano.nombre}, sigo con el siguiente caso: «${etiqueta}» de ${numero} queda en su mesa${cita ? ` por ${cita}` : ''} y retomo cuando responda.`,
    };
  };
}

/** Guiones de la ventana «mesa». Clave: `x3` genérico y `Tipo:x3` por novedad. */
export const mesa: Guiones = {
  x3: fabrica(),
  ...Object.fromEntries(TIPOS_MESA.map(t => [`${t}:x3`, fabrica(t)])),
};
