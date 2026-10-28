/**
 * Escritorio RPA — lectura del guion de interfaz de un paso.
 * Todo es función pura del progreso del paso (0–1); nada avanza por sí solo.
 */
import { useCallback, useEffect, useState, type RefObject } from 'react';
import type { AccionUI, ActorUI, AgenteId, Caso, NivelUI, PasoPlan, Vista } from '@/types/agentes';

export interface Rect { x: number; y: number; w: number; h: number }

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** A velocidad ≥ 5 los pasos duran 1–2 ticks: se pinta directamente el estado final. */
export function progresoEfectivo(p: number, velocidad: number): number {
  return velocidad >= 5 && p > 0 ? 1 : p;
}

/** Fin de una acción; por defecto: tecla t+0.06, clic t+0.05, toast/estado t+0.25, resto hasta el fin del paso. */
export function finAccion(a: AccionUI): number {
  if (a.hasta !== undefined) return a.hasta;
  switch (a.tipo) {
    case 'tecla': return Math.min(1, a.t + 0.06);
    case 'clic':
    case 'clicDerecho': return Math.min(1, a.t + 0.05);
    case 'toast':
    case 'estado': return Math.min(1, a.t + 0.25);
    default: return 1;
  }
}

/** 0–1 dentro de la acción. */
export function progresoAccion(a: AccionUI, p: number): number {
  const fin = finAccion(a);
  if (fin <= a.t) return p >= a.t ? 1 : 0;
  return clamp01((p - a.t) / (fin - a.t));
}

const actorDe = (a: AccionUI): ActorUI => a.actor ?? 'agente';

/** Acciones con t ≤ p < fin del actor indicado (por defecto el agente). */
export function accionesActivas(paso: PasoPlan | undefined, p: number, actor: ActorUI = 'agente'): AccionUI[] {
  return (paso?.ui ?? []).filter(a => actorDe(a) === actor && a.t <= p && p < finAccion(a));
}

const TIPOS_CURSOR = new Set<AccionUI['tipo']>(['mover', 'clic', 'clicDerecho', 'teclear', 'pegar', 'arrastrar']);

/** Última acción con ancla (mover/clic/teclear/pegar/arrastrar) ya iniciada: ahí apunta el cursor. */
export function ultimaAccionCursor(paso: PasoPlan | undefined, p: number, actor: ActorUI = 'agente'): { accion: AccionUI; idx: number } | undefined {
  const ui = paso?.ui ?? [];
  for (let i = ui.length - 1; i >= 0; i--) {
    const a = ui[i];
    if (actorDe(a) === actor && TIPOS_CURSOR.has(a.tipo) && a.ancla && a.t <= p) return { accion: a, idx: i };
  }
  return undefined;
}

export interface EstadoAncla {
  foco: boolean;
  /** 0–1 del tecleo (undefined si aún no empezó). */
  tecleo?: number;
  pegado: boolean;
  resaltado: boolean;
  clic: boolean;
  mascara: boolean;
}

/** Qué le pasa a un elemento anclado en este instante del paso. */
export function estadoAncla(paso: PasoPlan | undefined, p: number, ancla: string): EstadoAncla {
  const ui = paso?.ui ?? [];
  let tecleo: number | undefined;
  let pegado = false;
  let resaltado = false;
  let clic = false;
  let mascara = false;
  let ultimoCursor: AccionUI | undefined;
  for (const a of ui) {
    if (a.t > p) continue;
    if (TIPOS_CURSOR.has(a.tipo) && a.ancla) ultimoCursor = a;
    if (a.ancla !== ancla) continue;
    if (a.tipo === 'teclear') { tecleo = progresoAccion(a, p); if (a.mascara) mascara = true; }
    if (a.tipo === 'pegar') pegado = true;
    if (a.tipo === 'resaltar' && p < finAccion(a)) resaltado = true;
    if ((a.tipo === 'clic' || a.tipo === 'clicDerecho') && p < finAccion(a)) clic = true;
  }
  const foco = !!ultimoCursor && ultimoCursor.ancla === ancla && ultimoCursor.tipo !== 'mover';
  return { foco, tecleo, pegado, resaltado, clic, mascara };
}

export function dialogoActivo(paso: PasoPlan | undefined, p: number): AccionUI | undefined {
  const activos = (paso?.ui ?? []).filter(a => a.tipo === 'dialogo' && a.t <= p && p < finAccion(a));
  return activos[activos.length - 1];
}

export function toastsActivos(paso: PasoPlan | undefined, p: number): AccionUI[] {
  return (paso?.ui ?? []).filter(a => a.tipo === 'toast' && a.t <= p && p < finAccion(a));
}

/** Última acción 'estado' iniciada (la barra de estado conserva el último mensaje). */
export function estadoBarra(paso: PasoPlan | undefined, p: number): { texto: string; nivel: NivelUI } | undefined {
  const ui = paso?.ui ?? [];
  for (let i = ui.length - 1; i >= 0; i--) {
    const a = ui[i];
    if (a.tipo === 'estado' && a.t <= p) return { texto: a.texto ?? '', nivel: a.nivel ?? 'info' };
  }
  return undefined;
}

export function teclaActiva(paso: PasoPlan | undefined, p: number): string | undefined {
  const a = (paso?.ui ?? []).find(x => x.tipo === 'tecla' && x.t <= p && p < finAccion(x));
  return a?.tecla;
}

export const VISTA_POR_DEFECTO: Record<AgenteId, Vista> = {
  receptor: 'canal.bandeja',
  validador: 'revision.datos',
  planeador: 'plataforma.operacion',
  buscador: 'proveedores.base',
  negociador: 'proveedores.negociacion',
  asignador: 'plataforma.seleccion',
  confirmador: 'agenda.central',
  origen: 'revision.cruzada',
  seguimiento: 'tablero.seguimiento',
  destino: 'revision.entrega',
  cierre: 'revision.cierre',
  torre: 'expediente.expediente',
};

function vistaDePaso(paso: PasoPlan | undefined, p: number): Vista | undefined {
  if (!paso) return undefined;
  const ui = paso.ui ?? [];
  for (let i = ui.length - 1; i >= 0; i--) {
    const a = ui[i];
    if (a.tipo === 'ventana' && a.vista && a.t <= p) return a.vista;
  }
  return paso.vista;
}

/**
 * Pantalla abierta en el escritorio: la declara el paso en curso; si no, la
 * última que declaró un paso anterior de la misma etapa; si no, la del agente.
 */
export function vistaActiva(caso: Caso, etapaIdx: number, p: number, pasoIdx?: number): Vista {
  const etapa = caso.plan[etapaIdx];
  if (!etapa) return VISTA_POR_DEFECTO[caso.plan[caso.plan.length - 1]?.agente ?? 'torre'];
  const idx = pasoIdx ?? (etapaIdx === caso.etapaIdx ? caso.pasoIdx : etapa.pasos.length - 1);
  const actual = vistaDePaso(etapa.pasos[idx], p);
  if (actual) return actual;
  for (let i = Math.min(idx, etapa.pasos.length) - 1; i >= 0; i--) {
    const v = vistaDePaso(etapa.pasos[i], 1);
    if (v) return v;
  }
  return VISTA_POR_DEFECTO[etapa.agente];
}

/** 'humano' mientras el paso muestra la pantalla de una persona (espera humana). */
export function actorActivo(paso: PasoPlan | undefined, p: number): ActorUI {
  if (!paso) return 'agente';
  if (paso.tipo === 'espera_humana') return 'humano';
  return accionesActivas(paso, p, 'humano').some(a => a.tipo === 'ventana') ? 'humano' : 'agente';
}

/** Ancla de un botón de diálogo: «Sí» → dlg.btn.si. */
export function anclaBoton(etiqueta: string): string {
  return `dlg.btn.${etiqueta.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`;
}

/**
 * Mide un elemento `[data-ancla]` relativo al contenedor. Sin caché: se llama
 * al cambiar de acción, nunca por tick. La función cambia de identidad cuando
 * el contenedor cambia de tamaño o de vista, para que quien la use re-mida.
 */
export function useAnclas(ref: RefObject<HTMLElement | null>, claveVista: string): (ancla: string) => Rect | undefined {
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => setVersion(v => v + 1));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return useCallback((ancla: string) => {
    const el = ref.current;
    if (!el) return undefined;
    const objetivo = el.querySelector<HTMLElement>(`[data-ancla="${ancla}"]`);
    if (!objetivo) return undefined;
    const a = el.getBoundingClientRect();
    const b = objetivo.getBoundingClientRect();
    return { x: b.left - a.left + el.scrollLeft, y: b.top - a.top + el.scrollTop, w: b.width, h: b.height };
    // claveVista y version fuerzan una nueva identidad → re-medición en los consumidores.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, claveVista, version]);
}
