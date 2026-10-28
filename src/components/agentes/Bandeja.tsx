import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Inbox, FilePlus2, Eye, EyeOff } from 'lucide-react';
import type { Caso, Snapshot } from '@/types/agentes';
import { AGENTES_MAP } from '@/data/agentesData';
import { CANAL_INFO } from '@/data/mockData';
import { agentesEngine } from '@/lib/agentesEngine';
import DirectorEscena from './DirectorEscena';
import { COLOR_RESULTADO, NOMBRE_CORTO, TEXTO_RESULTADO, horaMinuto } from './helpers';

interface Props {
  snap: Snapshot;
}

function estadoCaso(caso: Caso): { texto: string; color: string; pulso: boolean } {
  if (caso.estado === 'terminada' && caso.resultado) {
    return { texto: TEXTO_RESULTADO[caso.resultado], color: COLOR_RESULTADO[caso.resultado], pulso: false };
  }
  const agente = caso.plan[caso.etapaIdx]?.agente;
  if (!agente) return { texto: 'Cerrando', color: '#475569', pulso: false };
  const def = AGENTES_MAP[agente];
  if (caso.estado === 'esperando') return { texto: 'Mesa del coordinador · espera humana', color: '#d97706', pulso: true };
  if (caso.estado === 'en_cola') return { texto: `Cola · ${NOMBRE_CORTO[agente]}`, color: def.color, pulso: false };
  return { texto: NOMBRE_CORTO[agente], color: def.color, pulso: true };
}

/**
 * Bandeja del disparador: la bandeja de solicitudes de transporte (4 canales).
 * Cada solicitud muestra por qué canal llegó, en qué agente va o cómo terminó.
 */
export default function Bandeja({ snap }: Props) {
  const casos = [...snap.casos].sort((a, b) => b.recibidoEn - a.recibidoEn).slice(0, 30);
  const activos = snap.casos.filter(c => c.estado !== 'terminada').length;
  const listaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = listaRef.current?.querySelector<HTMLElement>('[data-foco="1"]');
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [snap.focoId]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-card flex flex-col min-h-0 overflow-hidden">
      {/* Cabecera de la bandeja */}
      <div className="px-3 py-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-slate-700 text-white flex items-center justify-center shrink-0">
            <Inbox className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[12px] font-semibold text-slate-800 leading-tight">Bandeja de solicitudes</div>
            <div className="text-[10px] font-mono text-slate-400 truncate">llamada IA · formulario · integración · registro del coordinador</div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[14px] font-bold text-blue-600 leading-none">{activos}</div>
            <div className="text-[9px] text-slate-400 uppercase tracking-wider">en curso</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          <button
            onClick={() => agentesEngine.forzarEntrada()}
            className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100 text-[11px] font-medium hover:bg-blue-100 transition-colors"
          >
            <FilePlus2 className="w-3.5 h-3.5" />
            Solicitud entrante
          </button>
          <DirectorEscena compacto />
          <button
            onClick={() => agentesEngine.setAutoSeguir(!snap.autoSeguir)}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-md border text-[11px] font-medium transition-colors ${
              snap.autoSeguir
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
            }`}
            title={snap.autoSeguir ? 'Siguiendo automáticamente cada solicitud nueva' : 'Seguimiento manual: haz clic en una solicitud'}
          >
            {snap.autoSeguir ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            Auto
          </button>
        </div>
        <div className="mt-1.5 text-[9.5px] text-slate-400 leading-tight">Atajos: Espacio pausa · 1/2/5/0 velocidad · N solicitud · T teatro · → siguiente</div>
      </div>

      {/* Lista de entradas */}
      <div ref={listaRef} className="flex-1 overflow-y-auto min-h-0">
        {casos.map(caso => {
          const sel = caso.id === snap.focoId;
          const est = estadoCaso(caso);
          const primerPaso = caso.plan[0]?.pasos[0]?.id;
          const noLeido = !primerPaso || !caso.pasosHechos[primerPaso];
          const e = caso.datos.solicitud;
          const op = caso.operacion;
          const canal = CANAL_INFO[caso.canal];
          return (
            <motion.button
              key={caso.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => agentesEngine.setFoco(caso.id)}
              data-foco={sel ? '1' : undefined}
              className={`w-full text-left px-3 py-2 border-b border-slate-100 flex gap-2.5 transition-colors ${
                sel ? 'bg-blue-50/80 border-l-[3px] border-l-blue-600' : 'border-l-[3px] border-l-transparent hover:bg-slate-50'
              }`}
            >
              <div className="relative shrink-0 mt-0.5">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[9.5px] font-bold"
                  style={{ backgroundColor: canal.color }}
                  title={canal.label}
                >
                  {canal.corto.slice(0, 4)}
                </div>
                {noLeido && <span className="absolute -top-0.5 -left-0.5 w-2.5 h-2.5 rounded-full bg-blue-600 ring-2 ring-white" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[12px] truncate ${noLeido ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}>
                    {op.cliente.nombre}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {horaMinuto(caso.recibidoEn)}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 truncate leading-tight">{e.asunto}</div>
                <div className="flex items-center gap-1.5 mt-1 min-w-0">
                  <span className="font-mono text-[10px] text-blue-600 whitespace-nowrap">{op.id}</span>
                  <span className="text-[10px] text-slate-400 truncate min-w-0">{op.nodoOrigen.ciudad} → {op.nodoDestino.ciudad}</span>
                  <span className="ml-auto inline-flex items-center gap-0.5 text-[10px] text-slate-400 shrink-0">
                    {op.vehiculoRequerido}
                  </span>
                </div>
                <div className="mt-1">
                  <span
                    className="inline-flex items-center gap-1 px-1.5 py-[1px] rounded-full text-[10px] font-medium border"
                    style={{ color: est.color, borderColor: `${est.color}40`, backgroundColor: `${est.color}0f` }}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${est.pulso ? 'animate-pulse' : ''}`} style={{ backgroundColor: est.color }} />
                    {est.texto}
                  </span>
                </div>
              </div>
            </motion.button>
          );
        })}
        {casos.length === 0 && (
          <div className="p-6 text-center text-[12px] text-slate-400">Esperando solicitudes…</div>
        )}
      </div>
    </div>
  );
}
