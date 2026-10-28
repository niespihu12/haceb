import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router';
import { ArrowRight, Clock, ExternalLink, CircleCheck, History, Undo2, LayoutGrid, Monitor, Clapperboard } from 'lucide-react';
import type { AgenteId, Caso, Snapshot } from '@/types/agentes';
import { AGENTES_MAP, ESCENARIO_LABEL } from '@/data/agentesData';
import { CANAL_INFO } from '@/data/mockData';

import { AvatarAgente, BarraProgreso, ChipSistema, Spinner } from './ui';
import { NOMBRE_CORTO, COLOR_RESULTADO, TEXTO_RESULTADO, formatDuracion, horaCorta } from './helpers';
import Tarjetas from './Tarjetas';
import ListaPasos from './ListaPasos';
import EscritorioRPA from './rpa/EscritorioRPA';
import PensamientoAgente from './rpa/PensamientoAgente';
import { accionesActivas } from './guion';

interface Props {
  snap: Snapshot;
  teatro?: boolean;
}

type ModoVista = 'escritorio' | 'tarjetas';
const CLAVE_VISTA = 'agentes.vista';

function leerModoVista(): ModoVista {
  try {
    return localStorage.getItem(CLAVE_VISTA) === 'tarjetas' ? 'tarjetas' : 'escritorio';
  } catch {
    return 'escritorio';
  }
}

function Stepper({ caso, seleccion, onSeleccionar }: { caso: Caso; seleccion: number | null; onSeleccionar: (i: number | null) => void }) {
  return (
    <div className="flex items-center gap-1">
      {caso.plan.map((et, i) => {
        const def = AGENTES_MAP[et.agente];
        const hecho = i < caso.etapaIdx || caso.estado === 'terminada';
        const actual = i === caso.etapaIdx && caso.estado !== 'terminada';
        const viendo = seleccion === i;
        const fallo = hecho && et.pasos.some(p => caso.pasosHechos[p.id] && !caso.pasosHechos[p.id].ok);
        return (
          <div key={`${et.agente}-${i}`} className="flex items-center gap-1">
            <button
              onClick={() => hecho && onSeleccionar(viendo || actual ? null : i)}
              disabled={!hecho}
              title={hecho ? 'Ver lo que hizo este agente' : undefined}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] font-medium transition-all ${actual ? 'shadow-sm' : ''} ${hecho ? 'cursor-pointer hover:shadow-sm' : 'cursor-default'}`}
              style={{
                borderColor: hecho || actual ? `${def.color}55` : '#e2e8f0',
                backgroundColor: actual || viendo ? `${def.color}14` : hecho ? '#fff' : '#f8fafc',
                color: hecho || actual ? def.color : '#94a3b8',
                boxShadow: viendo ? `0 0 0 2px #fff, 0 0 0 4px ${def.color}66` : undefined,
              }}
            >
              {hecho ? (fallo ? <span className="w-2 h-2 rounded-full bg-amber-500" /> : <CircleCheck className="w-3 h-3" />) : actual ? <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: def.color }} /> : <span className="w-2 h-2 rounded-full bg-slate-300" />}
              {NOMBRE_CORTO[et.agente]}
            </button>
            {i < caso.plan.length - 1 && <ArrowRight className="w-3 h-3 text-slate-300" />}
          </div>
        );
      })}
    </div>
  );
}

export default function Estacion({ snap, teatro = false }: Props) {
  const navigate = useNavigate();
  const caso = snap.casos.find(c => c.id === snap.focoId);
  const ahora = snap.ahora;
  const [modoVista, setModoVista] = useState<ModoVista>(leerModoVista);
  const cambiarModoVista = (m: ModoVista) => {
    setModoVista(m);
    try { localStorage.setItem(CLAVE_VISTA, m); } catch { /* sin almacenamiento */ }
  };
  // Etapa ya completada que el usuario quiere revisar (solo vale para el caso en foco).
  const [revision, setRevision] = useState<{ casoId: string; idx: number } | null>(null);
  const revisando = caso && revision && revision.casoId === caso.id && (revision.idx < caso.etapaIdx || caso.estado === 'terminada') ? revision.idx : null;

  if (!caso) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-card flex items-center justify-center text-[12px] text-slate-400">
        Esperando la primera solicitud…
      </div>
    );
  }

  const etapaActualIdx = Math.min(caso.etapaIdx, caso.plan.length - 1);
  const etapaVistaIdx = revisando ?? etapaActualIdx;
  const etapa = caso.plan[etapaActualIdx];
  const etapaVista = caso.plan[etapaVistaIdx];
  const agenteId: AgenteId = etapaVista.agente;
  const agenteActualId: AgenteId = etapa.agente;
  const def = AGENTES_MAP[agenteActualId];
  const defVista = AGENTES_MAP[agenteId];
  const estAgente = snap.agentes[agenteActualId];
  const posicion = estAgente.cola.indexOf(caso.id) + 1;
  const ocupadoCon = estAgente.activo ? snap.casos.find(c => c.id === estAgente.activo) : undefined;
  const pasoActual = etapa.pasos[caso.pasoIdx];
  const transcurrido = (caso.terminadoEn ?? ahora) - caso.recibidoEn;
  const terminada = caso.estado === 'terminada';
  const surfaceKey = `${caso.id}-${agenteId}-${revisando ?? 'actual'}`;
  const op = caso.operacion;
  const canal = CANAL_INFO[caso.canal];

  // Progreso del paso para el escritorio: cuantizado a 0.02 salvo cuando se está tecleando.
  const escritorio = modoVista === 'escritorio';
  const pasoEscritorio = revisando !== null || terminada
    ? [...etapaVista.pasos].reverse().find(p => p.vista || p.ui?.length) ?? etapaVista.pasos[etapaVista.pasos.length - 1]
    : caso.estado === 'en_cola' ? undefined : pasoActual;
  // Reloj y hora cuantizados al segundo: así el React.memo del escritorio y las ventanas sí evita renders.
  const relojSimSeg = Math.floor(snap.relojSim / 1000) * 1000;
  const ahoraSeg = Math.floor(ahora / 1000) * 1000;
  const progresoRaw = revisando !== null || terminada
    ? 1
    : pasoActual && caso.estado !== 'en_cola' ? Math.max(0, Math.min(1, 1 - caso.restante / pasoActual.duracion)) : 0;
  const hayTecleo = accionesActivas(pasoEscritorio, progresoRaw).some(a => a.tipo === 'teclear' || a.tipo === 'firmar') || accionesActivas(pasoEscritorio, progresoRaw, 'humano').some(a => a.tipo === 'teclear' || a.tipo === 'firmar');
  // Cuantizado a 0.02 y nunca 1 en un paso vivo (1 significa «estado final» para el escritorio).
  const progresoEscritorio = progresoRaw >= 1 ? 1 : Math.min(0.98, hayTecleo ? progresoRaw : Math.floor(progresoRaw * 50) / 50);

  let titulo: React.ReactNode;
  let subtitulo: string;
  if (terminada && caso.resultado) {
    titulo = <>Expediente cerrado · <span style={{ color: COLOR_RESULTADO[caso.resultado] }}>{TEXTO_RESULTADO[caso.resultado].toUpperCase()}</span></>;
    subtitulo = `${def.nombre} cerró el expediente ${caso.datos.expediente.numero}`;
  } else if (caso.estado === 'en_cola') {
    titulo = <>{op.id} en cola de <span style={{ color: def.color }}>{def.nombre}</span></>;
    subtitulo = ocupadoCon ? `Posición ${posicion} · el agente está terminando ${ocupadoCon.operacion.id} (${ocupadoCon.operacion.cliente.nombre})` : `Posición ${posicion} · el agente lo toma en un instante`;
  } else if (caso.estado === 'esperando') {
    titulo = <>Esperando a <span className="text-amber-600">{pasoActual?.humano?.nombre}</span> · {pasoActual?.humano?.rol}</>;
    subtitulo = `${def.nombre} dejó la operación en la Mesa del coordinador y sigue con la siguiente · la persona decide fuera del software del agente`;
  } else {
    titulo = <><span style={{ color: def.color }}>{def.nombre}</span> está trabajando en {op.id}</>;
    subtitulo = `${def.etapa} · ${def.descripcion}`;
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-card flex flex-col min-h-0 overflow-hidden">
      {/* Cabecera de la estación */}
      <div className={`px-4 border-b border-slate-100 ${teatro ? 'pt-2 pb-2' : 'pt-3 pb-2.5 [@media(max-height:840px)]:pt-2 [@media(max-height:840px)]:pb-2'}`}>
        <div className="flex items-start gap-3">
          <AvatarAgente id={agenteActualId} size={teatro ? 32 : 42} activo={caso.estado === 'procesando'} />
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-semibold text-slate-900 leading-tight truncate">{titulo}</div>
            {!teatro && <div className="text-[11px] text-slate-500 mt-0.5 truncate [@media(max-height:840px)]:hidden">{subtitulo}</div>}
          </div>
          <div className="text-right shrink-0">
            <div className="flex items-center justify-end gap-1 font-mono text-[15px] font-bold text-slate-800 leading-none">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {formatDuracion(transcurrido)}
            </div>
            <div className="text-[9px] uppercase tracking-wider text-slate-400 mt-0.5">{terminada ? 'ciclo total' : 'en proceso'}</div>
          </div>
        </div>

        <div className={`${teatro ? 'mt-1.5' : 'mt-2.5 [@media(max-height:840px)]:mt-1.5'} flex items-center gap-2 flex-wrap`}>
          <button
            onClick={() => navigate(`/operacion/${op.id}`)}
            className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-blue-600 hover:underline"
            title="Abrir la operación en el pipeline"
          >
            {op.id} <ExternalLink className="w-3 h-3" />
          </button>
          <span className="text-slate-300">·</span>
          <span className="text-[11px] text-slate-700 font-medium truncate max-w-[220px]">{op.cliente.nombre}</span>
          <span className="text-slate-300">·</span>
          <span className="text-[11px] text-slate-600 truncate max-w-[200px]">{op.nodoOrigen.ciudad} → {op.nodoDestino.ciudad}</span>
          <span className="inline-flex items-center gap-1 px-1.5 py-[1px] rounded-full text-[10px] border" style={{ color: canal.color, borderColor: `${canal.color}40`, backgroundColor: `${canal.color}0d` }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: canal.color }} /> {canal.label}
          </span>
          {caso.escenario !== 'feliz' && (
            <span className="inline-flex items-center gap-1 px-1.5 py-[1px] rounded-full bg-amber-50 text-amber-700 text-[10px] border border-amber-200">
              escenario: {ESCENARIO_LABEL[caso.escenario]}
            </span>
          )}
          <span className="ml-auto text-[10px] text-slate-400">Recibido {horaCorta(caso.recibidoEn)}</span>
          <div className="flex items-center bg-slate-100 rounded-md p-0.5 border border-slate-200" title="Cómo ver el trabajo del agente">
            <button
              onClick={() => cambiarModoVista('escritorio')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${escritorio ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Monitor className="w-3 h-3" /> Escritorio
            </button>
            <button
              onClick={() => cambiarModoVista('tarjetas')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${!escritorio ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <LayoutGrid className="w-3 h-3" /> Tarjetas
            </button>
          </div>
        </div>

        <div className={`${teatro ? 'mt-1.5' : 'mt-2.5 [@media(max-height:840px)]:mt-1.5'} overflow-x-auto pb-0.5 [scrollbar-width:none]`}>
          <Stepper caso={caso} seleccion={revisando} onSeleccionar={(i) => setRevision(i === null ? null : { casoId: caso.id, idx: i })} />
        </div>

        {/* Acción en curso */}
        {!terminada && pasoActual && caso.estado !== 'en_cola' && (
          <div className="mt-2.5 [@media(max-height:840px)]:mt-1.5 rounded-md border px-2.5 py-1.5 [@media(max-height:840px)]:py-1 flex items-center gap-2" style={{ borderColor: `${def.color}40`, backgroundColor: `${def.color}0a` }}>
            {caso.estado === 'esperando' ? <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse shrink-0" /> : <Spinner color={def.color} />}
            <span className="text-[12px] font-medium text-slate-800 truncate flex-1">{pasoActual.texto}{caso.estado === 'esperando' ? ` · ${pasoActual.humano?.rol}` : '…'}</span>
            {pasoActual.sistema && <ChipSistema id={pasoActual.sistema} />}
            <div className="w-28 shrink-0"><BarraProgreso valor={Math.max(0, Math.min(1, 1 - caso.restante / pasoActual.duracion))} color={caso.estado === 'esperando' ? '#d97706' : def.color} alto={4} /></div>
            <span className="font-mono text-[10px] text-slate-500 w-10 text-right shrink-0">{formatDuracion(caso.restante)}</span>
          </div>
        )}
        {!terminada && pasoActual && caso.estado !== 'en_cola' && (
          <PensamientoAgente texto={pasoActual.pensamiento} progreso={progresoRaw} velocidad={snap.velocidad} color={def.color} humano={caso.estado === 'esperando'} />
        )}
        {caso.escenaForzada && ahora - caso.recibidoEn < 4000 && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-2 flex items-center gap-2 rounded-md bg-violet-600 text-white px-2.5 py-1 text-[11px] font-medium">
            <Clapperboard className="w-3.5 h-3.5" /> Escena: {caso.escenaForzada}
          </motion.div>
        )}
      </div>

      {/* Cuerpo */}
      <div className={`flex-1 min-h-0 bg-slate-50/60 p-3 [@media(max-height:840px)]:p-2 ${escritorio ? 'overflow-hidden flex flex-col' : 'overflow-y-auto'}`}>
        {revisando !== null && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border px-3 py-2 text-[11px]" style={{ borderColor: `${defVista.color}55`, backgroundColor: `${defVista.color}0d` }}>
            <History className="w-3.5 h-3.5" style={{ color: defVista.color }} />
            <span className="text-slate-700">Revisando lo que hizo <b style={{ color: defVista.color }}>{defVista.nombre}</b> con esta operación (etapa completada).</span>
            <button onClick={() => setRevision(null)} className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium">
              <Undo2 className="w-3 h-3" /> Volver a la etapa actual
            </button>
          </div>
        )}
        {caso.estado === 'en_cola' && revisando === null && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-600">
            <Spinner color={def.color} />
            <span>
              <b>{def.nombre}</b> tiene {estAgente.cola.length} en cola{ocupadoCon ? <> y está procesando <b className="font-mono">{ocupadoCon.operacion.id}</b>: <i>{estAgente.ultimaAccion}</i></> : ''}.
            </span>
          </div>
        )}
        <div className={escritorio
          ? 'flex-1 min-h-0 flex gap-3'
          : 'grid grid-cols-1 2xl:grid-cols-[1fr_260px] gap-3 items-start'}>
          <motion.div key={surfaceKey} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className={escritorio ? 'flex-1 min-w-0 min-h-0 flex flex-col' : 'min-w-0'}>
            {escritorio ? (
              <EscritorioRPA
                caso={caso}
                etapaIdx={etapaVistaIdx}
                paso={pasoEscritorio}
                progreso={progresoEscritorio}
                velocidad={snap.velocidad}
                relojSim={relojSimSeg}
                ahora={ahoraSeg}
                corriendo={snap.corriendo}
                revisando={revisando !== null}
                teatro={teatro}
              />
            ) : (
              <Tarjetas caso={caso} etapaIdx={etapaVistaIdx} />
            )}
          </motion.div>
          {!(escritorio && teatro) && <div className={`bg-white rounded-lg border border-slate-200 overflow-hidden ${escritorio ? 'w-[260px] shrink-0 min-h-0 flex-col overflow-y-auto hidden min-[1900px]:flex' : ''}`}>
            <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">Pasos del agente</span>
              <span className="text-[10px] font-mono text-slate-500">{etapaVista.pasos.filter(p => caso.pasosHechos[p.id]).length}/{etapaVista.pasos.length}</span>
            </div>
            <div className="p-1.5">
              <ListaPasos caso={caso} etapaIdx={etapaVistaIdx} />
            </div>
          </div>}
        </div>
      </div>
    </div>
  );
}
