/**
 * Utilidades sin dependencias del resto de agentesData: las importan los
 * guiones (src/data/guiones/*) y las ventanas del escritorio RPA, evitando
 * ciclos de importación.
 */
import type { Canal } from '@/types';
import { CANAL_INFO } from '@/data/mockData';

export { formatCOP, formatCOPLargo, formatFechaDia } from '@/lib/utils';

/* ─── Aleatoriedad determinista por caso ─── */
export function rngDesde(seed: number): () => number {
  let h = (seed * 2654435761) >>> 0 || 1;
  return () => {
    h ^= h << 13; h >>>= 0;
    h ^= h >>> 17;
    h ^= h << 5; h >>>= 0;
    return (h >>> 0) / 4294967296;
  };
}

export const pick = <T,>(rand: () => number, arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)];
export const entre = (rand: () => number, a: number, b: number): number => Math.floor(a + rand() * (b - a + 1));
export const hex = (rand: () => number, n: number): string => Array.from({ length: n }, () => '0123456789abcdef'[Math.floor(rand() * 16)]).join('');

/* ─── Formato ─── */
export function fechaCorta(ts: number): string {
  return new Date(ts).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function fechaLarga(ts: number): string {
  return new Date(ts).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export function horaMin(ts: number): string {
  return new Date(ts).toLocaleTimeString('es-CO', { hour12: false, hour: '2-digit', minute: '2-digit' });
}

export function iniciales(nombre: string): string {
  return nombre.split(' ').filter(Boolean).map(p => p[0]).slice(0, 2).join('').toUpperCase();
}

/** «Sí» → 'si', «Guardar todos los datos adjuntos…» → 'guardar-todos-los-datos-adjuntos'. */
export function slugAncla(etiqueta: string): string {
  return etiqueta
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Número con separador de miles es-CO (12.345). */
export function miles(n: number): string {
  return new Intl.NumberFormat('es-CO').format(n);
}

/** Pesos completos con separador: $ 1.890.000 */
export function pesos(n: number): string {
  return `$ ${miles(Math.round(n))}`;
}

/** «1 línea» / «3 líneas» (plural regular en -s salvo que se indique la forma). */
export function plural(n: number, singular: string, formaPlural = `${singular}s`): string {
  return `${n} ${n === 1 ? singular : formaPlural}`;
}

/** «hace 5 min»-style para horas: «14:32». */
export function hhmm(ts: number): string {
  return horaMin(ts);
}

/* ─── Canales ─── */
export const CANAL_LABEL: Record<Canal, string> = Object.fromEntries(
  (Object.keys(CANAL_INFO) as Canal[]).map(c => [c, CANAL_INFO[c].label]),
) as Record<Canal, string>;

export const CANAL_CORTO: Record<Canal, string> = Object.fromEntries(
  (Object.keys(CANAL_INFO) as Canal[]).map(c => [c, CANAL_INFO[c].corto]),
) as Record<Canal, string>;

/** Máquina virtual del agente (sesión del escritorio RPA). */
export const SESION_VM = 'RPA-VM-COORD-01';

/** Línea de contacto del agente de voz (ficticia). */
export const LINEA_AGENTE = '+57 604 555 0900';
