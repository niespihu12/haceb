import { useEffect, useRef, useState } from 'react';
import { Clapperboard, Play } from 'lucide-react';
import { ESCENAS } from '@/data/agentesData';
import { agentesEngine } from '@/lib/agentesEngine';

const N_GUION = 6;

type EscenaDef = (typeof ESCENAS)[number];

function Item({ e, n, onReproducir }: { e: EscenaDef; n?: number; onReproducir: (id: string) => void }) {
  return (
    <button
      onClick={() => onReproducir(e.id)}
      className="w-full flex items-start gap-2 px-2 py-1.5 rounded-md text-left hover:bg-slate-50"
    >
      {n !== undefined && <span className="w-4 h-4 rounded-full bg-violet-600 text-white text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">{n}</span>}
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[12px] font-semibold text-slate-800">{e.etiqueta}</span>
          {e.categoria && <span className="text-[9px] px-1 rounded border border-amber-200 bg-amber-50 text-amber-700">cat. {e.categoria}</span>}
          {e.regla && <span className="text-[9px] px-1 rounded border border-slate-200 bg-slate-50 text-slate-600 font-mono">{e.regla}</span>}
          <span className={`text-[9px] px-1 rounded border ${e.fin === 'Cerrada' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`}>{e.fin}</span>
        </span>
        <span className="block text-[10px] text-slate-500 leading-snug">{e.sinopsis}</span>
      </span>
      <Play className="w-3 h-3 text-violet-600 shrink-0 mt-1 fill-current" />
    </button>
  );
}

/**
 * Director de escena: el presentador decide qué solicitud entra ahora (canal y
 * escenario) en vez de esperar a que el azar lo produzca. El determinismo de
 * los demás casos no cambia: solo se sobreescribe el próximo.
 */
export default function DirectorEscena({ compacto = false }: { compacto?: boolean }) {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!abierto) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setAbierto(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setAbierto(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onClick); document.removeEventListener('keydown', onKey); };
  }, [abierto]);

  const guion = ESCENAS.slice(0, N_GUION);
  const resto = ESCENAS.slice(N_GUION);
  const reproducir = (id: string) => {
    const e = ESCENAS.find(x => x.id === id);
    if (e) agentesEngine.forzarEntrada({ canal: e.canal, escenario: e.escenario }, e.etiqueta);
    setAbierto(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setAbierto(v => !v)}
        className="flex items-center gap-1 px-2 py-1.5 rounded-md border text-[11px] font-medium bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100 transition-colors"
        title="Elegir qué solicitud entra ahora (canal y escenario)"
      >
        <Clapperboard className="w-3.5 h-3.5" />
        {!compacto && 'Escena…'}
      </button>
      {abierto && (
        <div className="absolute left-0 mt-1.5 w-[360px] max-h-[70vh] overflow-y-auto bg-white rounded-xl border border-slate-200 shadow-slide p-1 z-50">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 px-2 py-1">Guion de la demo</div>
          {guion.map((e, i) => <Item key={e.id} e={e} n={i + 1} onReproducir={reproducir} />)}
          <div className="my-1 border-t border-slate-100" />
          <div className="text-[10px] uppercase tracking-wider text-slate-400 px-2 py-1">Todas las novedades del catálogo</div>
          {resto.map(e => <Item key={e.id} e={e} onReproducir={reproducir} />)}
          <div className="my-1 border-t border-slate-100" />
          <div className="px-2 py-1 font-mono text-[9.5px] text-slate-400 leading-snug">
            Sin director, la mayoría de las solicitudes sigue el flujo normal y el resto reparte las 17 novedades del catálogo según su peso ({ESCENAS.length} escenas).
          </div>
        </div>
      )}
    </div>
  );
}
