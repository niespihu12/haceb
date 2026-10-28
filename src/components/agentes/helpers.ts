import { Inbox, ClipboardCheck, ClipboardList, Search, Handshake, PackageCheck, PhoneCall, Warehouse, Navigation, MapPinCheck, FileCheck2, Radar } from 'lucide-react';
import type { AgenteId, Caso, PasoPlan } from '@/types/agentes';

/* ─── Iconos por agente ─── */
export const ICONO_AGENTE: Record<AgenteId, typeof Inbox> = {
  receptor: Inbox,
  validador: ClipboardCheck,
  planeador: ClipboardList,
  buscador: Search,
  negociador: Handshake,
  asignador: PackageCheck,
  confirmador: PhoneCall,
  origen: Warehouse,
  seguimiento: Navigation,
  destino: MapPinCheck,
  cierre: FileCheck2,
  torre: Radar,
};

export const NOMBRE_CORTO: Record<AgenteId, string> = {
  receptor: 'Receptor',
  validador: 'Validador',
  planeador: 'Planeación',
  buscador: 'Buscador',
  negociador: 'Negociador',
  asignador: 'Asignador',
  confirmador: 'Confirmador',
  origen: 'Origen',
  seguimiento: 'Seguimiento',
  destino: 'Destino',
  cierre: 'Cierre',
  torre: 'Torre',
};

/* ─── Estado de un paso del plan ─── */
export type EstadoPaso = 'hecho' | 'fallo' | 'en_curso' | 'esperando' | 'pendiente';

export function estadoDePaso(caso: Caso, etapaIdx: number, pasoIdx: number): EstadoPaso {
  const p = caso.plan[etapaIdx]?.pasos[pasoIdx];
  if (!p) return 'pendiente';
  const hecho = caso.pasosHechos[p.id];
  if (hecho) return hecho.ok ? 'hecho' : 'fallo';
  if (caso.etapaIdx === etapaIdx && caso.pasoIdx === pasoIdx) {
    if (caso.estado === 'esperando') return 'esperando';
    if (caso.estado === 'procesando') return 'en_curso';
  }
  return 'pendiente';
}

export function progresoPaso(caso: Caso, p: PasoPlan): number {
  if (caso.pasosHechos[p.id]) return 1;
  const actual = caso.plan[caso.etapaIdx]?.pasos[caso.pasoIdx];
  if (actual?.id !== p.id || caso.estado === 'en_cola') return 0;
  return Math.max(0, Math.min(1, 1 - caso.restante / p.duracion));
}

export function formatDuracion(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

const FMT_HORA = new Intl.DateTimeFormat('es-CO', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
const FMT_HM = new Intl.DateTimeFormat('es-CO', { hour12: false, hour: '2-digit', minute: '2-digit' });

export function horaCorta(t: number): string {
  return FMT_HORA.format(t);
}

export function horaMinuto(t: number): string {
  return FMT_HM.format(t);
}

export const COLOR_RESULTADO = {
  cerrada: '#059669',
  cancelada: '#dc2626',
} as const;

export const TEXTO_RESULTADO = {
  cerrada: 'Cerrada',
  cancelada: 'Cancelada',
} as const;

/* ─── Helpers de estado por paso ─── */
export interface InfoPaso { estado: EstadoPaso; progreso: number; paso?: PasoPlan; resultado?: string; t?: number }

export function infoPaso(caso: Caso, id: string): InfoPaso {
  for (let e = 0; e < caso.plan.length; e++) {
    const pasos = caso.plan[e].pasos;
    for (let p = 0; p < pasos.length; p++) {
      if (pasos[p].id !== id) continue;
      const paso = pasos[p];
      const hecho = caso.pasosHechos[id];
      if (hecho) return { estado: hecho.ok ? 'hecho' : 'fallo', progreso: 1, paso, resultado: hecho.resultado, t: hecho.t };
      if (caso.etapaIdx === e && caso.pasoIdx === p && caso.estado !== 'en_cola') {
        const progreso = Math.max(0, Math.min(1, 1 - caso.restante / paso.duracion));
        return { estado: caso.estado === 'esperando' ? 'esperando' : 'en_curso', progreso, paso };
      }
      return { estado: 'pendiente', progreso: 0, paso };
    }
  }
  return { estado: 'pendiente', progreso: 0 };
}

/** Primer paso hecho cuyo id empieza por `prefijo` (p. ej. 'x5c' → la espera humana). */
export function pasoHechoPorPrefijo(caso: Caso, prefijo: string): { paso: PasoPlan; t: number } | undefined {
  for (const et of caso.plan) {
    for (const p of et.pasos) {
      if (p.id.startsWith(prefijo) && caso.pasosHechos[p.id]) return { paso: p, t: caso.pasosHechos[p.id].t };
    }
  }
  return undefined;
}
