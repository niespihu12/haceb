import type { Caso } from '@/types/agentes';
import { AGENTES_MAP } from '@/data/agentesData';
import { BarraProgreso, ChipRegla, ChipSistema, IconoEstadoPaso } from './ui';
import { estadoDePaso, formatDuracion, horaCorta } from './helpers';

/** Pasos de una etapa del plan con su estado, resultado y sistema (función pura del snapshot). */
export default function ListaPasos({ caso, etapaIdx }: { caso: Caso; etapaIdx: number }) {
  const etapa = caso.plan[etapaIdx];
  if (!etapa) return null;
  const color = AGENTES_MAP[etapa.agente].color;
  return (
    <div className="space-y-0.5">
      {etapa.pasos.map((p, i) => {
        const est = estadoDePaso(caso, etapaIdx, i);
        const hecho = caso.pasosHechos[p.id];
        const activo = est === 'en_curso' || est === 'esperando';
        const progreso = activo ? Math.max(0, Math.min(1, 1 - caso.restante / p.duracion)) : hecho ? 1 : 0;
        return (
          <div
            key={p.id}
            className={`rounded-md px-2 py-1.5 border ${activo ? 'bg-white border-slate-200 shadow-xs' : 'border-transparent'}`}
          >
            <div className="flex items-start gap-2">
              <span className="mt-[1px] shrink-0"><IconoEstadoPaso estado={est} color={color} /></span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-1.5">
                  <span className={`text-[11px] leading-tight ${est === 'pendiente' ? 'text-slate-400' : est === 'fallo' ? 'text-red-700 font-medium' : 'text-slate-800 font-medium'}`}>{p.texto}</span>
                  {p.regla && est !== 'pendiente' && <ChipRegla codigo={p.regla} />}
                </div>
                {hecho?.resultado && (
                  <div className={`text-[10px] leading-tight mt-0.5 line-clamp-2 ${hecho.ok ? 'text-slate-500' : 'text-red-600'}`}>{hecho.resultado}</div>
                )}
                {est === 'esperando' && (
                  <div className="text-[10px] leading-tight mt-0.5 text-amber-700">Esperando a {p.humano?.nombre} · {formatDuracion(caso.restante)}</div>
                )}
                {activo && est !== 'esperando' && (
                  <div className="mt-1"><BarraProgreso valor={progreso} color={color} alto={3} /></div>
                )}
                {(hecho || (p.sistema && est !== 'pendiente')) && (
                  <div className="mt-1 flex items-center gap-1.5">
                    {p.sistema && est !== 'pendiente' && <ChipSistema id={p.sistema} />}
                    {hecho && <span className="text-[9px] font-mono text-slate-400">{horaCorta(hecho.t)}</span>}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

