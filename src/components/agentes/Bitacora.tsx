import { memo, useState } from 'react';
import { motion } from 'framer-motion';
import { ScrollText, Maximize2, Minimize2 } from 'lucide-react';
import type { EntradaBitacora, Snapshot } from '@/types/agentes';
import { AGENTES_MAP, SISTEMAS } from '@/data/agentesData';
import { NOMBRE_CORTO, horaCorta } from './helpers';

interface Props {
  snap: Snapshot;
  maximizada: boolean;
  onToggle: () => void;
}

const COLOR_NIVEL: Record<EntradaBitacora['nivel'], string> = {
  info: '#38bdf8',
  ok: '#34d399',
  aviso: '#fbbf24',
  error: '#f87171',
  handoff: '#64748b',
};

const FilaBitacora = memo(function FilaBitacora({ e, soloFoco }: { e: EntradaBitacora; soloFoco: boolean }) {
  const color = AGENTES_MAP[e.agente].color;
  return (
    <motion.div
      initial={{ opacity: 0, backgroundColor: 'rgba(148,163,184,0.18)' }}
      animate={{ opacity: 1, backgroundColor: 'rgba(148,163,184,0)' }}
      transition={{ duration: 0.9 }}
      className="px-3 py-1 border-l-2 flex gap-2 items-start hover:bg-slate-800/60 border-b border-b-slate-800/60"
      style={{ borderLeftColor: COLOR_NIVEL[e.nivel] }}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 shrink-0">{horaCorta(e.t)}</span>
          <span className="shrink-0 font-semibold" style={{ color }}>{NOMBRE_CORTO[e.agente]}</span>
          {!soloFoco && <span className="shrink-0 text-sky-300/80">{e.numero}</span>}
          {e.regla && <span className="px-1 rounded bg-amber-400/15 text-amber-300 text-[9px] font-bold">{e.regla}</span>}
          {e.sistema && (
            <span className="ml-auto shrink-0 text-[9px] px-1 rounded border" style={{ color: SISTEMAS[e.sistema].color, borderColor: `${SISTEMAS[e.sistema].color}55` }}>{SISTEMAS[e.sistema].nombre}</span>
          )}
        </div>
        <div className={`break-words ${e.nivel === 'error' ? 'text-red-300' : e.nivel === 'aviso' ? 'text-amber-200' : e.nivel === 'handoff' ? 'text-slate-400' : 'text-slate-200'}`}>
          {e.mensaje}
        </div>
      </div>
    </motion.div>
  );
});

export default function Bitacora({ snap, maximizada, onToggle }: Props) {
  const [soloFoco, setSoloFoco] = useState(true);
  const foco = snap.casos.find(c => c.id === snap.focoId);
  const entradas = (soloFoco && foco ? snap.bitacora.filter(e => e.casoId === foco.id) : snap.bitacora).slice(0, 120);

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-card flex flex-col min-h-0 h-full overflow-hidden">
      <div className="px-3 py-2 border-b border-slate-800 flex items-center gap-2">
        <ScrollText className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-[11px] font-semibold text-slate-200 uppercase tracking-wider">Bitácora en vivo</span>
        <span className="relative flex h-2 w-2 ml-0.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
        </span>
        <div className="ml-auto flex items-center bg-slate-800 rounded-md p-0.5">
          <button onClick={() => setSoloFoco(true)} className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${soloFoco ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}>Esta operación</button>
          <button onClick={() => setSoloFoco(false)} className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${!soloFoco ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}>Todos</button>
        </div>
        <button onClick={onToggle} className="text-slate-500 hover:text-slate-200 transition-colors" title={maximizada ? 'Restaurar' : 'Ampliar'}>
          {maximizada ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto font-mono text-[10.5px] leading-snug">
        {entradas.length === 0 && <div className="p-3 text-slate-500 italic">Sin eventos todavía…</div>}
        {entradas.map(e => <FilaBitacora key={e.id} e={e} soloFoco={soloFoco} />)}
      </div>
    </div>
  );
}
