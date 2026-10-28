import { memo } from 'react';
import { motion } from 'framer-motion';

export interface PropsTeclaPulsada {
  /** Texto de la tecla: 'F2', 'Enter', 'Ctrl+V', … */
  tecla: string;
  /** En ventanas clásicas (CoreERP) el chip va sin sombra: la barra F ya la ilumina. */
  clasico?: boolean;
  /** Sin posicionamiento absoluto (para incrustarlo en otra pieza). */
  enLinea?: boolean;
}

/**
 * Chip «keycap» que aparece en la esquina inferior derecha del escritorio
 * mientras el guion tiene una acción `tecla` activa. Solo animación de entrada
 * (scale .85→1): quien lo monte debe darle `key` por acción para que se
 * anime una sola vez.
 */
function TeclaPulsada({ tecla, clasico = false, enLinea = false }: PropsTeclaPulsada) {
  const partes = tecla.split('+');
  return (
    <motion.div
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.12, ease: 'easeOut' }}
      className={`${enLinea ? 'relative' : 'absolute bottom-6 right-3 z-30'} pointer-events-none flex items-center gap-1`}
      data-ancla="tecla.chip"
    >
      {partes.map((p, i) => (
        <span key={`${p}-${i}`} className="flex items-center gap-1">
          {i > 0 && <span className="text-[10px] text-slate-500">+</span>}
          <span
            className={`rounded-md border border-slate-400 bg-slate-100 px-2 py-0.5 font-mono text-[11px] leading-tight text-slate-800 ${clasico ? '' : 'shadow-[0_2px_0_#94a3b8]'}`}
          >
            {p}
          </span>
        </span>
      ))}
    </motion.div>
  );
}

export { TeclaPulsada };
export default memo(TeclaPulsada);
