import { motion } from 'framer-motion';
import type { Snapshot } from '@/types/agentes';
import { AGENTES, SISTEMAS } from '@/data/agentesData';
import { agentesEngine } from '@/lib/agentesEngine';
import { AvatarAgente, BarraProgreso } from './ui';
import { NOMBRE_CORTO } from './helpers';

interface Props {
  snap: Snapshot;
  /** Modo teatro: menos alto (sin rol ni línea de sistema). */
  compacta?: boolean;
}

// En pantallas bajas (portátiles 1366×768) la cinta se compacta sola con la
// variante `[@media(max-height:840px)]` (escrita literal para que Tailwind la genere).
// Con 12 puestos cada columna mide al menos 92 px: por debajo de ~1150 px de ancho
// la cinta se desplaza en horizontal en vez de apretar los textos.

/**
 * Mapa vivo del proceso: los doce agentes en línea, cada uno con la operación
 * que tiene en manos, lo que está haciendo ahora y cuántas esperan en su cola.
 * Cuando un agente entrega, el número de la operación "viaja" al siguiente nodo.
 */
export default function CintaAgentes({ snap, compacta = false }: Props) {
  const n = AGENTES.length;
  const centro = (i: number) => `${((i + 0.5) / n) * 100}%`;
  const margenLinea = `${(0.5 / n) * 100}%`;

  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-card px-2 overflow-x-auto [scrollbar-width:thin] ${compacta ? 'py-1.5' : 'py-3 [@media(max-height:840px)]:py-2'}`}>
      <div className="relative" style={{ minWidth: n * 92 }}>
        {/* Línea base del flujo */}
        <div className={`absolute ${compacta ? 'top-[17px]' : 'top-[22px]'} h-[2px] bg-slate-100 rounded-full`} style={{ left: margenLinea, right: margenLinea }} />

        {/* Puntos que recorren el flujo continuamente */}
        {[0, 1, 2].map(k => (
          <div key={k} className={`absolute ${compacta ? 'top-[14px]' : 'top-[19px]'} h-2 pointer-events-none`} style={{ left: margenLinea, right: margenLinea }}>
            <motion.div
              className="w-full h-2"
              animate={{ x: ['0%', '100%'], opacity: [0, 1, 1, 0] }}
              transition={{ duration: 9, repeat: Infinity, ease: 'linear', delay: k * 3 }}
            >
              <span className="block w-2 h-2 rounded-full bg-blue-400/70" />
            </motion.div>
          </div>
        ))}

        {/* Entregas entre agentes */}
        {snap.handoffs.map(h => {
          const de = AGENTES.findIndex(a => a.id === h.de);
          const a = AGENTES.findIndex(x => x.id === h.a);
          return (
            <motion.div
              key={h.id}
              className={`absolute ${compacta ? 'top-[6px]' : 'top-[10px]'} -translate-x-1/2 px-1.5 py-0.5 rounded bg-slate-900 text-white font-mono text-[10px] shadow-md pointer-events-none z-20`}
              initial={{ left: centro(de), opacity: 0, scale: 0.8 }}
              animate={{ left: centro(a), opacity: [0, 1, 1, 0], scale: 1 }}
              transition={{ duration: 1.4, ease: 'easeInOut' }}
            >
              {h.numero}
            </motion.div>
          );
        })}

        <div className="relative grid" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
          {AGENTES.map(a => {
            const est = snap.agentes[a.id];
            const caso = est.activo ? snap.casos.find(c => c.id === est.activo) : undefined;
            const activo = !!caso;
            const esFoco = !!caso && caso.id === snap.focoId;
            const paso = caso ? caso.plan[caso.etapaIdx]?.pasos[caso.pasoIdx] : undefined;
            const progreso = caso && paso ? Math.max(0, Math.min(1, 1 - caso.restante / paso.duracion)) : 0;
            const enCola = est.cola.length;
            const tam = compacta ? 30 : 38;

            return (
              <button
                key={a.id}
                onClick={() => caso && agentesEngine.setFoco(caso.id)}
                className={`group flex flex-col items-center text-center px-0.5 min-w-0 rounded-lg transition-colors ${caso ? 'cursor-pointer hover:bg-slate-50' : 'cursor-default'}`}
                title={`${a.nombre} · ${a.etapa}. ${a.descripcion}`}
              >
                <div className="relative">
                  <div className={compacta ? '' : '[@media(max-height:840px)]:hidden'}><AvatarAgente id={a.id} size={tam} activo={activo} /></div>
                  {!compacta && <div className="hidden [@media(max-height:840px)]:block"><AvatarAgente id={a.id} size={30} activo={activo} /></div>}
                  {enCola > 0 && (
                    <span className="absolute -top-1 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center shadow ring-2 ring-white">
                      {enCola}
                    </span>
                  )}
                  {esFoco && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
                  )}
                </div>
                <div className={`${compacta ? 'mt-1 text-[10.5px]' : 'mt-1.5 text-[11.5px]'} w-full truncate font-semibold text-slate-800 leading-tight`}>{NOMBRE_CORTO[a.id]}</div>
                {!compacta && <div className="w-full truncate text-[9.5px] text-slate-400 leading-tight [@media(max-height:840px)]:hidden">{a.etapa}</div>}
                <div className={`mt-0.5 w-full items-center justify-center gap-1 min-w-0 ${compacta ? 'hidden' : 'flex [@media(max-height:840px)]:hidden'}`}>
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: SISTEMAS[a.sistema].color }} />
                  <span className="text-[9.5px] text-slate-500 truncate">{SISTEMAS[a.sistema].nombre}</span>
                  <span className="text-[9.5px] font-mono text-slate-400 shrink-0">· {est.procesadas}</span>
                </div>

                <div className={`${compacta ? 'mt-0.5 min-h-[28px]' : 'mt-1 min-h-[34px]'} w-full`}>
                  {caso && paso ? (
                    <div className="w-full">
                      <div className="flex items-center justify-center gap-1">
                        <span className="font-mono text-[10px] font-semibold" style={{ color: a.color }}>{caso.operacion.id}</span>
                      </div>
                      <div className="text-[9.5px] text-slate-500 truncate px-0.5" title={paso.texto}>{paso.texto}</div>
                      <div className="px-1.5 mt-0.5">
                        <BarraProgreso valor={progreso} color={a.color} alto={3} />
                      </div>
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-300 italic mt-1">en espera</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
