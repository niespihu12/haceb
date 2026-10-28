import { memo } from 'react';
import { CircleCheck, CircleX, Info, TriangleAlert, type LucideIcon } from 'lucide-react';
import type { AccionUI, NivelUI, PasoPlan } from '@/types/agentes';
import { progresoAccion } from '@/components/agentes/guion';

const NIVEL: Record<NivelUI, { Icono: LucideIcon; color: string; borde: string; fondo: string }> = {
  ok: { Icono: CircleCheck, color: '#059669', borde: '#a7f3d0', fondo: '#ecfdf5' },
  aviso: { Icono: TriangleAlert, color: '#d97706', borde: '#fde68a', fondo: '#fffbeb' },
  error: { Icono: CircleX, color: '#dc2626', borde: '#fecaca', fondo: '#fef2f2' },
  info: { Icono: Info, color: '#2563eb', borde: '#bfdbfe', fondo: '#eff6ff' },
};

export interface PropsToast {
  /** Acciones 'toast' activas (`toastsActivos(paso, p)`). */
  acciones: AccionUI[];
  /** Progreso del paso (0–1): fija la barra de vida de cada toast. */
  progreso: number;
  paso?: PasoPlan;
  /** 'arriba-derecha': pila flotante; 'barra': una sola línea para incrustar en la barra de estado. */
  posicion?: 'arriba-derecha' | 'barra';
}

/**
 * Notificaciones del sistema. Solo animación de entrada (key por paso+índice);
 * la barra de vida es 1 − progresoAccion, así que retrocede con el progreso y
 * nunca avanza sola.
 */
function Toast({ acciones, progreso, paso, posicion = 'arriba-derecha' }: PropsToast) {
  if (!acciones.length) return null;
  const ui = paso?.ui ?? [];
  const clavePaso = paso?.id ?? 'p';

  if (posicion === 'barra') {
    const a = acciones[acciones.length - 1];
    const idx = ui.indexOf(a);
    const n = NIVEL[a.nivel ?? 'info'];
    const vida = 1 - progresoAccion(a, progreso);
    return (
      <span
        key={`${clavePaso}-${idx}`}
        data-ancla="dlg.toast.barra"
        className="animate-toast-in relative inline-flex items-center gap-1 h-4 px-1.5 max-w-[60%] text-[10.5px] leading-none border overflow-hidden"
        style={{ color: n.color, borderColor: n.borde, backgroundColor: n.fondo }}
        title={a.texto}
      >
        <n.Icono className="w-3 h-3 shrink-0" />
        <span className="truncate">{a.texto}</span>
        <span className="absolute left-0 bottom-0 h-[2px]" style={{ width: `${Math.round(vida * 100)}%`, backgroundColor: n.color, opacity: 0.6 }} />
      </span>
    );
  }

  return (
    <div className="absolute top-2 right-2 z-20 space-y-1 pointer-events-none max-w-[min(300px,80%)]">
      {acciones.map(a => {
        const idx = ui.indexOf(a);
        const n = NIVEL[a.nivel ?? 'info'];
        const vida = 1 - progresoAccion(a, progreso);
        return (
          <div
            key={`${clavePaso}-${idx}`}
            data-ancla={`dlg.toast.${idx}`}
            className="animate-toast-in relative min-w-[220px] rounded-md border px-2.5 py-1.5 text-[11px] bg-white shadow-md overflow-hidden"
            style={{ borderColor: n.borde }}
          >
            <div className="flex items-start gap-1.5">
              <n.Icono className="w-3.5 h-3.5 shrink-0 mt-[1px]" style={{ color: n.color }} />
              <span className="text-slate-800 leading-snug">{a.texto}</span>
            </div>
            <span
              className="absolute left-0 bottom-0 h-[2px]"
              style={{ width: `${Math.round(vida * 100)}%`, backgroundColor: n.color, transition: 'width 120ms linear' }}
            />
          </div>
        );
      })}
    </div>
  );
}

export default memo(Toast);
