import { memo } from 'react';
import type { Caso } from '@/types/agentes';
import { AGENTES_MAP } from '@/data/agentesData';
import { CANAL_INFO, ETAPA_LABEL } from '@/data/mockData';
import { formatCOP, formatFechaDia } from '@/lib/utils';
import { AvatarAgente } from './ui';
import { formatDuracion, horaCorta } from './helpers';
import ListaPasos from './ListaPasos';

/**
 * Vista «Tarjetas» de la estación: una tarjeta por etapa del plan con los
 * pasos del agente y, arriba, la ficha de la operación tal como la ven las pantallas
 * del equipo. Todo sale del snapshot (función pura).
 */
function Tarjetas({ caso, etapaIdx }: { caso: Caso; etapaIdx: number }) {
  const p = caso.operacion;
  const d = caso.datos;
  const canal = CANAL_INFO[caso.canal];
  return (
    <div className="space-y-3">
      <div className="bg-white rounded-lg border border-slate-200 p-3">
        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Ficha de la operación</div>
        <dl className="grid grid-cols-2 xl:grid-cols-4 gap-x-4 gap-y-1 text-[11px]">
          <div><dt className="text-slate-400">Operación</dt><dd className="font-mono text-slate-800">{p.id} · {d.solicitud.referenciaCliente}</dd></div>
          <div><dt className="text-slate-400">Cliente</dt><dd className="text-slate-800 truncate">{p.cliente.id} · {p.cliente.nombre}</dd></div>
          <div><dt className="text-slate-400">Canal</dt><dd className="text-slate-800">{canal.label}</dd></div>
          <div><dt className="text-slate-400">Solicitante</dt><dd className="text-slate-800 truncate">{p.solicitante}</dd></div>
          <div><dt className="text-slate-400">Origen</dt><dd className="text-slate-800 truncate">{p.nodoOrigen.lugar}, {p.nodoOrigen.ciudad}</dd></div>
          <div><dt className="text-slate-400">Destino</dt><dd className="text-slate-800 truncate">{p.nodoDestino.lugar}, {p.nodoDestino.ciudad}</dd></div>
          <div><dt className="text-slate-400">Mercancía</dt><dd className="text-slate-800 truncate">{p.mercancia.tipo} · {p.mercancia.pesoKg.toLocaleString('es-CO')} kg</dd></div>
          <div><dt className="text-slate-400">Cargue</dt><dd className="text-slate-800">{formatFechaDia(p.fechaCargue)} · {p.vehiculoRequerido}</dd></div>
          <div><dt className="text-slate-400">Transportador</dt><dd className="text-slate-800 truncate">{p.transportador ? `${p.transportador.nombre} · ${p.transportador.placa}` : 'sin asignar'}</dd></div>
          <div><dt className="text-slate-400">Tarifa</dt><dd className="font-mono text-slate-800">{p.tarifaPactada ? `${formatCOP(p.tarifaPactada)} (tope ${formatCOP(p.tarifaMaxima)})` : `tope ${formatCOP(p.tarifaMaxima)}`}</dd></div>
          <div className="col-span-2"><dt className="text-slate-400">Estado</dt><dd className="text-slate-800">{ETAPA_LABEL[p.etapa]}{p.excepcion ? ` · ${p.excepcion.tipo.replace(/_/g, ' ')} (${p.excepcion.categoria})` : ''}</dd></div>
        </dl>
        <div className="mt-2 text-[10.5px] text-slate-500">{d.solicitud.resumen}</div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        {caso.plan.map((et, i) => {
          const def = AGENTES_MAP[et.agente];
          const t = caso.tiemposEtapa[et.agente];
          const hechos = et.pasos.filter(x => caso.pasosHechos[x.id]).length;
          const activa = i === etapaIdx;
          const pendiente = i > caso.etapaIdx && caso.estado !== 'terminada';
          return (
            <div key={`${et.agente}-${i}`} className={`bg-white rounded-lg border overflow-hidden ${activa ? 'shadow-card' : ''} ${pendiente ? 'opacity-60' : ''}`} style={{ borderColor: activa ? `${def.color}66` : '#e2e8f0' }}>
              <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-2" style={{ backgroundColor: `${def.color}0a` }}>
                <AvatarAgente id={et.agente} size={24} activo={activa && caso.estado === 'procesando'} />
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-semibold text-slate-800 leading-tight truncate">{def.nombre}</div>
                  <div className="text-[9.5px] text-slate-400 truncate">{def.etapa}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono text-[10px] text-slate-600">{hechos}/{et.pasos.length}</div>
                  <div className="text-[9px] text-slate-400">{t?.fin ? formatDuracion(t.fin - t.inicio) : t?.inicio ? `desde ${horaCorta(t.inicio)}` : 'pendiente'}</div>
                </div>
              </div>
              <div className="p-1.5">
                <ListaPasos caso={caso} etapaIdx={i} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(Tarjetas);
