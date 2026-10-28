import { memo, useMemo } from 'react';
import { MessageSquareQuote } from 'lucide-react';
import { ChipRegla, TextoEnVivo } from '../ui';
import { progresoEfectivo } from '../guion';

interface Props {
  texto?: string;
  progreso: number;
  velocidad: number;
  color: string;
  humano?: boolean;
}

/**
 * El agente explica en una línea, en lenguaje de negocio, qué hace y qué regla
 * aplica. Se escribe con máquina de escribir durante el primer 35 % del paso.
 */
function PensamientoAgente({ texto, progreso, velocidad, color, humano = false }: Props) {
  const completo = useMemo(() => texto ?? '', [texto]);
  if (!texto) return null;
  const p = Math.min(1, progresoEfectivo(progreso, velocidad) / 0.35);
  const reglas = completo.match(/POL-[A-Z]{3}-\d{2}/g) ?? [];
  return (
    <div className={`mt-1.5 flex items-start gap-1.5 text-[11px] leading-snug ${humano ? 'text-amber-800' : 'text-slate-600'}`}>
      <MessageSquareQuote className="w-3 h-3 mt-[2px] shrink-0" style={{ color: humano ? '#d97706' : color }} />
      <span className="min-w-0 flex-1 line-clamp-1 hover:line-clamp-none">
        <TextoEnVivo texto={completo} progreso={p} />
      </span>
      {p >= 1 && reglas.length > 0 && (
        <span className="flex items-center gap-1 shrink-0">
          {Array.from(new Set(reglas)).map(r => <ChipRegla key={r} codigo={r} />)}
        </span>
      )}
    </div>
  );
}

export default memo(PensamientoAgente);
