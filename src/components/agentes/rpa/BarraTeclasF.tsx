import { memo } from 'react';

const TECLAS: { tecla: string; etiqueta: string }[] = [
  { tecla: 'F2', etiqueta: 'Buscar' },
  { tecla: 'F3', etiqueta: 'Nuevo' },
  { tecla: 'F5', etiqueta: 'Refrescar' },
  { tecla: 'F9', etiqueta: 'Guardar' },
  { tecla: 'F10', etiqueta: 'Salir' },
  { tecla: 'Esc', etiqueta: 'Cancelar' },
];

const BISEL = 'border border-t-white border-l-white border-b-slate-500 border-r-slate-500';

/**
 * Fila de teclas de función de un ERP clásico (CoreERP). La tecla `activa`
 * (de `teclaActiva(paso, p)`) se ilumina en azul; todo es función de las props.
 */
function BarraTeclasF({ activa }: { activa?: string }) {
  const act = activa?.toLowerCase();
  return (
    <div
      className="h-5 shrink-0 flex items-center gap-1 px-1 bg-[#ece9d8] border-t border-t-white text-[10px] leading-none select-none"
      style={{ fontFamily: 'Tahoma, "Segoe UI", system-ui, sans-serif' }}
    >
      {TECLAS.map(({ tecla, etiqueta }) => {
        const on = act === tecla.toLowerCase();
        return (
          <span
            key={tecla}
            data-ancla={`erp.tecla.${tecla.toLowerCase()}`}
            className={`h-4 px-1.5 inline-flex items-center gap-1 whitespace-nowrap ${on ? 'bg-[#0a246a] text-white border border-[#0a246a]' : `${BISEL} bg-[#ece9d8] text-black`}`}
          >
            <span className={`font-mono font-semibold ${on ? 'text-white' : 'text-[#0a246a]'}`}>{tecla}</span>
            <span>{etiqueta}</span>
          </span>
        );
      })}
    </div>
  );
}

export default memo(BarraTeclasF);
