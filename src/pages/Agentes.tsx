import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Play, Projector, Keyboard } from 'lucide-react';
import { agentesEngine } from '@/lib/agentesEngine';
import { useSimulation } from '@/hooks/useSimulation';
import { useAgentes } from '@/hooks/useAgentes';
import { AGENTES } from '@/data/agentesData';
import CintaAgentes from '@/components/agentes/CintaAgentes';
import Bandeja from '@/components/agentes/Bandeja';
import Estacion from '@/components/agentes/Estacion';
import Bitacora from '@/components/agentes/Bitacora';
import Expediente from '@/components/agentes/Expediente';
import { formatDuracion } from '@/components/agentes/helpers';

function Kpi({ etiqueta, valor, color = '#141b2d', mono = true, className = '' }: { etiqueta: string; valor: string | number; color?: string; mono?: boolean; className?: string }) {
  return (
    <div className={`flex flex-col items-end leading-none ${className}`}>
      <span className={`${mono ? 'font-mono' : ''} text-[16px] font-bold`} style={{ color }}>{valor}</span>
      <span className="text-[9px] uppercase tracking-wider text-slate-400 mt-0.5">{etiqueta}</span>
    </div>
  );
}

type Panel = 'ambos' | 'bitacora' | 'expediente' | 'teatro';
const CLAVE_PANEL = 'agentes.panel';

function leerPanel(): Panel {
  try {
    const v = localStorage.getItem(CLAVE_PANEL);
    return v === 'bitacora' || v === 'expediente' || v === 'teatro' ? v : 'ambos';
  } catch {
    return 'ambos';
  }
}

export default function Agentes() {
  const { isRunning, play, pause, setSpeed } = useSimulation();
  const snap = useAgentes();
  const [panel, setPanelState] = useState<Panel>(leerPanel);
  const setPanel = (p: Panel) => {
    setPanelState(p);
    try { localStorage.setItem(CLAVE_PANEL, p); } catch { /* sin almacenamiento */ }
  };
  const teatro = panel === 'teatro';
  const alternarTeatro = () => setPanel(teatro ? 'ambos' : 'teatro');

  // En teatro se oculta el pie de página y se aprovecha todo el alto (ver index.css).
  useEffect(() => {
    document.documentElement.toggleAttribute('data-teatro', teatro);
    return () => document.documentElement.removeAttribute('data-teatro');
  }, [teatro]);

  // Atajos de teclado del presentador.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName ?? '';
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) || e.ctrlKey || e.metaKey || e.altKey) return;
      switch (e.key) {
        case ' ': case 'p': case 'P': if (isRunning) pause(); else play(); break;
        case '1': setSpeed(1); break;
        case '2': setSpeed(2); break;
        case '5': setSpeed(5); break;
        case '0': setSpeed(10); break;
        case 't': case 'T': alternarTeatro(); break;
        case 'f': case 'F':
          if (document.fullscreenElement) void document.exitFullscreen?.();
          else void document.documentElement.requestFullscreen?.();
          break;
        case 'Escape': if (teatro) setPanel('ambos'); break;
        case 'n': case 'N': agentesEngine.forzarEntrada(); break;
        case 'ArrowRight': {
          const s = agentesEngine.getSnapshot();
          const activos = s.casos.filter(c => c.estado !== 'terminada');
          if (activos.length === 0) break;
          const i = activos.findIndex(c => c.id === s.focoId);
          agentesEngine.setFoco(activos[(i + 1) % activos.length].id);
          break;
        }
        default: return;
      }
      e.preventDefault();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teatro, isRunning]);

  // La pantalla debe verse viva desde que se abre (solo al entrar: «Detener» sigue deteniendo).
  const yaArranco = useRef(false);
  useEffect(() => {
    if (yaArranco.current) return;
    yaArranco.current = true;
    if (!isRunning) play();
  }, [isRunning, play]);

  const agentesActivos = AGENTES.filter(a => snap.agentes[a.id].activo).length;
  const enCola = AGENTES.reduce((s, a) => s + snap.agentes[a.id].cola.length, 0);
  const esperandoHumano = snap.casos.filter(c => c.estado === 'esperando').length;
  const { stats } = snap;
  const stpPct = stats.cerradas ? Math.round((stats.stp / stats.cerradas) * 100) : 0;

  return (
    <div className={`${teatro ? 'h-[calc(100dvh-4.5rem)] gap-2 px-4 pb-2' : 'h-[calc(100dvh-5.5rem)] gap-3 [@media(max-height:840px)]:gap-2 px-6 pb-1'} max-w-[1920px] mx-auto flex flex-col min-h-0`}>
      {/* Encabezado */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4 shrink-0">
        <div className="min-w-0">
          <h1 className={`${teatro ? 'text-[15px]' : 'text-[22px] min-[1400px]:text-[24px]'} whitespace-nowrap font-bold text-aion-ink leading-tight tracking-tight flex items-center gap-2`}>
            <Bot className={`${teatro ? 'w-4 h-4' : 'w-6 h-6'} text-captura`} />
            Equipo de agentes · coordinación logística
          </h1>
          {!teatro && (
            <p className="text-[12px] text-aion-muted mt-0.5 hidden 2xl:block">
              De la solicitud al cierre administrativo: {AGENTES.length} agentes, 9 pantallas, cada decisión trazada y cada operación visible en el pipeline.
            </p>
          )}
        </div>
        <div className="ml-auto flex items-center gap-4 flex-wrap justify-end">
          <Kpi etiqueta="agentes activos" valor={`${agentesActivos}/${AGENTES.length}`} color="#2563eb" />
          {!teatro && <Kpi etiqueta="en cola" valor={enCola} color={enCola > 4 ? '#d97706' : '#141b2d'} className="hidden min-[1600px]:flex" />}
          <Kpi etiqueta="en la Mesa" valor={esperandoHumano} color={esperandoHumano ? '#d97706' : '#141b2d'} />
          {!teatro && <div className="w-px h-8 bg-slate-200" />}
          {!teatro && <Kpi etiqueta="recibidas" valor={stats.recibidos} />}
          <Kpi etiqueta="cerradas" valor={stats.cerradas} color="#059669" />
          {!teatro && <Kpi etiqueta="canceladas" valor={stats.canceladas} color={stats.canceladas ? '#dc2626' : '#141b2d'} className="hidden min-[1600px]:flex" />}
          <Kpi etiqueta="STP" valor={`${stpPct} %`} color="#4f46e5" />
          {!teatro && <Kpi etiqueta="escaladas" valor={stats.escalados} color={stats.escalados ? '#d97706' : '#141b2d'} />}
          {!teatro && <Kpi etiqueta="ciclo promedio" valor={stats.cicloPromedioMs ? formatDuracion(stats.cicloPromedioMs) : '—'} className="hidden min-[1600px]:flex" />}
          <Kpi etiqueta="acciones trazadas" valor={stats.accionesTotales} className="hidden min-[1500px]:flex" />
          <button
            onClick={alternarTeatro}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[12px] font-semibold transition-colors ${teatro ? 'bg-aion-ink text-white border-aion-ink hover:bg-slate-700' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
            title="Modo teatro (T): oculta la bandeja y la columna derecha para el proyector"
          >
            <Projector className="w-3.5 h-3.5" /> {teatro ? 'Salir del teatro' : 'Modo teatro'}
          </button>
          {teatro && (
            <span className="hidden min-[1700px]:flex items-center gap-1 text-[10px] text-slate-400" title="Atajos del presentador">
              <Keyboard className="w-3 h-3" /> Espacio pausa · 1/2/5/0 velocidad · N solicitud · → siguiente · F pantalla completa · Esc salir
            </span>
          )}
          {!isRunning && (
            <button onClick={play} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success text-white text-[12px] font-semibold hover:bg-emerald-700 transition-colors">
              <Play className="w-3.5 h-3.5 fill-current" /> Reanudar
            </button>
          )}
        </div>
      </motion.div>

      {/* Mapa de agentes */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="shrink-0">
        <CintaAgentes snap={snap} compacta={teatro} />
      </motion.div>

      {/* Bandeja · Estación · Bitácora/Expediente */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex-1 min-h-0 grid gap-3"
        style={{ gridTemplateColumns: teatro ? 'minmax(0, 1fr)' : '260px minmax(0, 1fr) 360px' }}
      >
        {!teatro && <Bandeja snap={snap} />}
        <Estacion snap={snap} teatro={teatro} />
        {!teatro && <div className="flex flex-col gap-3 min-h-0">
          {panel !== 'expediente' && (
            <div className={`${panel === 'bitacora' ? 'flex-1' : 'h-[46%]'} min-h-0 flex flex-col`}>
              <Bitacora snap={snap} maximizada={panel === 'bitacora'} onToggle={() => setPanel(panel === 'bitacora' ? 'ambos' : 'bitacora')} />
            </div>
          )}
          {panel !== 'bitacora' && (
            <div className="flex-1 min-h-0 flex flex-col">
              <Expediente snap={snap} maximizada={panel === 'expediente'} onToggle={() => setPanel(panel === 'expediente' ? 'ambos' : 'expediente')} />
            </div>
          )}
        </div>}
      </motion.div>
    </div>
  );
}
