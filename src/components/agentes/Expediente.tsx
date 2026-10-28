import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FilePen, Maximize2, Minimize2, Hash, CircleCheck, CircleX } from 'lucide-react';
import type { Operacion } from '@/types';
import type { Caso, Snapshot } from '@/types/agentes';
import { AGENTES_MAP, SISTEMAS } from '@/data/agentesData';
import { CANAL_INFO } from '@/data/mockData';
import { EXPEDIENTE_CONTENIDO } from '@/data/procesoData';
import { fechaCorta, plural } from '@/data/agentesUtil';
import { formatCOP, formatFechaDia } from '@/lib/utils';
import { Cursor } from './ui';
import { COLOR_RESULTADO, TEXTO_RESULTADO, formatDuracion, horaCorta } from './helpers';

interface Props {
  snap: Snapshot;
  maximizada: boolean;
  onToggle: () => void;
}

/**
 * Firma de lo que puede cambiar en una sección: el motor muta `caso` en sitio
 * (misma referencia por tick), así que la memoización compara esta clave y no el objeto.
 */
function firmaSeccion(caso: Caso): string {
  return `${caso.id}|${caso.estado}|${caso.etapaIdx}|${caso.pasoIdx}|${Object.keys(caso.pasosHechos).length}`;
}

interface PropsSeccion {
  caso: Caso;
  etapaIdx: number;
  /** Cambia solo cuando avanza el caso: evita re-renderizar la sección en cada tick. */
  firma: string;
}

const Seccion = memo(function Seccion({ caso, etapaIdx, firma }: PropsSeccion) {
  const etapa = caso.plan[etapaIdx];
  const def = AGENTES_MAP[etapa.agente];
  // Pasos hechos con su hora ya formateada: se recalcula solo cuando avanza el caso.
  const hechos = useMemo(
    () => etapa.pasos
      .filter(p => caso.pasosHechos[p.id] && !/^Entregando a/.test(p.texto))
      .map(p => ({ p, h: caso.pasosHechos[p.id], hora: horaCorta(caso.pasosHechos[p.id].t) })),
    // `caso` y `etapa` conservan la referencia entre ticks (el motor muta en sitio): `firma` es la que invalida.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [caso, etapa, firma],
  );
  const esActual = etapaIdx === caso.etapaIdx && caso.estado !== 'terminada';
  const terminada = etapaIdx < caso.etapaIdx || caso.estado === 'terminada';
  const t = caso.tiemposEtapa[etapa.agente];
  if (hechos.length === 0 && !esActual) return null;
  return (
    <motion.section initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3">
      <div className="flex items-baseline gap-2 border-b border-slate-200 pb-1">
        <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">{etapaIdx + 1}. {def.nombre}</span>
        <span className="text-[10px] text-slate-400">{SISTEMAS[def.sistema].nombre}</span>
        <span className="ml-auto text-[10px] font-mono text-slate-400">
          {t?.inicio ? horaCorta(t.inicio) : ''}{t?.fin ? ` → ${horaCorta(t.fin)} · ${formatDuracion(t.fin - t.inicio)}` : esActual ? ' · en curso' : ''}
        </span>
      </div>
      <ol className="mt-1.5 space-y-1">
        {hechos.map(({ p, h, hora }) => (
          <motion.li key={p.id} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} className="flex gap-1.5 text-[11px] leading-snug">
            <span className="shrink-0 mt-[2px]">{h.ok ? <CircleCheck className="w-3 h-3 text-emerald-600" /> : <CircleX className="w-3 h-3 text-red-500" />}</span>
            <span className="text-slate-700">
              <span className="font-medium text-slate-800">{p.texto.replace(/…$/, '')}</span>
              {h.resultado && <span className="text-slate-500"> — {h.resultado}</span>}
              {p.regla && <span className="ml-1 font-mono text-[9px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-1">{p.regla}</span>}
              <span className="ml-1 font-mono text-[9px] text-slate-400">{hora}</span>
            </span>
          </motion.li>
        ))}
        {esActual && !terminada && (
          <li className="text-[11px] text-slate-400 italic">
            {caso.estado === 'en_cola' ? 'en cola…' : etapa.pasos[caso.pasoIdx]?.texto}<Cursor />
          </li>
        )}
      </ol>
    </motion.section>
  );
});

const EVENTOS_CONFIRMACION = new Set<string>([
  'AsignacionConfirmada', 'ConfirmacionDoble', 'LlamadaPreventiva', 'LlegadaOrigenConfirmada',
  'DespachoConfirmado', 'LlegadaDestinoConfirmada', 'EntregaConfirmada',
]);

interface ContenidoExp { etiqueta: string; detalle: string; cuantos: number }

/**
 * Los 10 contenidos del expediente (insumo, P39) calculados a partir de la
 * operación vigente y los datos del caso: función pura del snapshot.
 */
function contenidoExpediente(caso: Caso): ContenidoExp[] {
  const op: Operacion = caso.operacion;
  const s = caso.datos.solicitud;
  const tipos = (t: string) => op.soportes.filter(x => x.tipo === t).length;
  const novedades = [...op.excepcionesPrevias, ...(op.excepcion ? [op.excepcion] : [])];
  const aprobadas = novedades.filter(e => e.decisionHumana === 'AUTORIZAR' || e.decisionHumana === 'ALTERNATIVA');
  const confirmaciones = op.eventos.filter(e => EVENTOS_CONFIRMACION.has(e.evento)).length;
  const cliente = op.llamadas.filter(l => l.interlocutor === 'cliente').length;
  const transp = op.llamadas.filter(l => l.interlocutor === 'transportador').length;
  const dest = op.llamadas.filter(l => l.interlocutor === 'destinatario').length;
  const compCumplidos = op.compromisos.filter(c => c.estado === 'cumplido').length;
  const entrega = tipos('soporte_entrega');
  const liquid = tipos('liquidacion');
  const primerPaso = caso.plan[0]?.pasos[0]?.id;
  const solicitud = tipos('solicitud') || (primerPaso && caso.pasosHechos[primerPaso] ? 1 : 0);
  const ultima = novedades[novedades.length - 1];
  return [
    { cuantos: solicitud, etiqueta: EXPEDIENTE_CONTENIDO[0], detalle: solicitud ? `${s.referenciaCliente} · ${CANAL_INFO[caso.canal].label}` : 'pendiente' },
    { cuantos: op.llamadas.length, etiqueta: EXPEDIENTE_CONTENIDO[1], detalle: op.llamadas.length ? `${plural(op.llamadas.length, 'llamada')} (cliente ${cliente} · transportador ${transp}${dest ? ` · destinatario ${dest}` : ''})` : 'pendiente' },
    { cuantos: tipos('transcripcion'), etiqueta: EXPEDIENTE_CONTENIDO[2], detalle: tipos('transcripcion') ? plural(tipos('transcripcion'), 'transcripción', 'transcripciones') : 'pendiente' },
    { cuantos: tipos('grabacion'), etiqueta: EXPEDIENTE_CONTENIDO[3], detalle: tipos('grabacion') ? plural(tipos('grabacion'), 'grabación autorizada', 'grabaciones autorizadas') : 'solo si el interlocutor la autoriza' },
    { cuantos: op.ofertas.length, etiqueta: EXPEDIENTE_CONTENIDO[4], detalle: op.ofertas.length ? `${plural(op.ofertas.length, 'oferta')}${op.tarifaPactada ? ` · pactada ${formatCOP(op.tarifaPactada)}` : ''}` : 'pendiente' },
    { cuantos: confirmaciones, etiqueta: EXPEDIENTE_CONTENIDO[5], detalle: confirmaciones ? plural(confirmaciones, 'confirmación registrada', 'confirmaciones registradas') : 'pendiente' },
    { cuantos: novedades.length, etiqueta: EXPEDIENTE_CONTENIDO[6], detalle: ultima ? `${plural(novedades.length, 'novedad', 'novedades')} · última: ${ultima.titulo}` : 'sin novedades' },
    { cuantos: op.compromisos.length, etiqueta: EXPEDIENTE_CONTENIDO[7], detalle: op.compromisos.length ? `${op.compromisos.length} · ${plural(compCumplidos, 'cumplido')}` : 'pendiente' },
    { cuantos: aprobadas.length, etiqueta: EXPEDIENTE_CONTENIDO[8], detalle: aprobadas.length ? aprobadas.map(e => `${e.titulo}${e.alternativaElegida ? ` (alt. ${e.alternativaElegida})` : ''}`).join(' · ') : 'sin modificaciones' },
    { cuantos: entrega + liquid, etiqueta: EXPEDIENTE_CONTENIDO[9], detalle: entrega ? `Soporte de entrega${liquid ? ' · Liquidación' : ''}` : 'pendiente' },
  ];
}

const ContenidoLista = memo(function ContenidoLista({ caso, firma }: { caso: Caso; firma: string }) {
  // `caso` conserva la referencia entre ticks (el motor muta en sitio): `firma` es la que invalida.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const items = useMemo(() => contenidoExpediente(caso), [caso, firma]);
  return (
    <section className="mt-3">
      <div className="flex items-baseline gap-2 border-b border-slate-200 pb-1">
        <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">Contenido del expediente</span>
        <span className="ml-auto text-[10px] font-mono text-slate-400">{items.filter(i => i.cuantos > 0).length}/{items.length}</span>
      </div>
      <ol className="mt-1.5 space-y-0.5">
        {items.map((it, i) => (
          <li key={it.etiqueta} className="flex gap-1.5 text-[11px] leading-snug">
            <span className="shrink-0 w-4 text-right font-mono text-[9.5px] text-slate-400 mt-[2px]">{i + 1}.</span>
            <span className="shrink-0 mt-[2px]">{it.cuantos > 0 ? <CircleCheck className="w-3 h-3 text-emerald-600" /> : <span className="block w-3 h-3 rounded-full border border-dashed border-slate-300" />}</span>
            <span className={it.cuantos > 0 ? 'text-slate-700' : 'text-slate-400'}>
              <span className={it.cuantos > 0 ? 'font-medium text-slate-800' : ''}>{it.etiqueta}</span>
              <span className="text-slate-500"> — {it.detalle}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
});

export default function Expediente({ snap, maximizada, onToggle }: Props) {
  const caso = snap.casos.find(c => c.id === snap.focoId);
  const firma = caso ? firmaSeccion(caso) : '';
  const op = caso?.operacion;
  const fin = caso ? caso.datos.trayectoria[caso.datos.trayectoria.length - 1] : undefined;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-card flex flex-col min-h-0 h-full overflow-hidden">
      <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50/60">
        <FilePen className="w-3.5 h-3.5 text-slate-500" />
        <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">Expediente de la operación</span>
        {caso && caso.estado !== 'terminada' && <span className="text-[10px] text-slate-400 italic">escribiéndose…</span>}
        <button onClick={onToggle} className="ml-auto text-slate-400 hover:text-slate-700 transition-colors" title={maximizada ? 'Restaurar' : 'Ampliar'}>
          {maximizada ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-3 bg-slate-100/60">
        {!caso || !op ? (
          <div className="text-[11px] text-slate-400 italic">Sin operación en foco.</div>
        ) : (
          <div className="bg-white border border-slate-200 shadow-sm rounded-sm px-4 py-4 min-h-full">
            {/* Encabezado tipo documento */}
            <div className="flex items-start justify-between gap-3 border-b-2 border-slate-800 pb-2">
              <div>
                <div className="text-[9px] uppercase tracking-[0.2em] text-slate-500">Coordinación logística · Expediente e historial</div>
                <div className="text-[14px] font-bold text-slate-900 leading-tight mt-0.5">Expediente {caso.datos.expediente.numero}</div>
                <div className="text-[10px] text-slate-500">Generado automáticamente por {AGENTES_MAP.torre.nombre}</div>
              </div>
              {caso.estado === 'terminada' && caso.resultado && (
                <div className="text-[10px] font-black uppercase tracking-widest px-2 py-1 border-2 rounded rotate-[-4deg]" style={{ color: COLOR_RESULTADO[caso.resultado], borderColor: COLOR_RESULTADO[caso.resultado] }}>
                  {TEXTO_RESULTADO[caso.resultado]}
                </div>
              )}
            </div>

            <dl className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
              <div className="flex gap-1"><dt className="text-slate-400 w-[72px] shrink-0">Operación</dt><dd className="font-mono text-slate-800">{op.id} · {caso.datos.solicitud.referenciaCliente}</dd></div>
              <div className="flex gap-1"><dt className="text-slate-400 w-[72px] shrink-0">Canal</dt><dd className="text-slate-800">{CANAL_INFO[caso.canal].label}</dd></div>
              <div className="flex gap-1 col-span-2"><dt className="text-slate-400 w-[72px] shrink-0">Cliente</dt><dd className="text-slate-800">{op.cliente.nombre} · {op.cliente.id}</dd></div>
              <div className="flex gap-1 col-span-2"><dt className="text-slate-400 w-[72px] shrink-0">Ruta</dt><dd className="text-slate-800">{op.nodoOrigen.ciudad} → {op.nodoDestino.ciudad} · {op.distanciaKm} km</dd></div>
              <div className="flex gap-1 col-span-2"><dt className="text-slate-400 w-[72px] shrink-0">Mercancía</dt><dd className="text-slate-800">{op.mercancia.tipo} · {op.mercancia.unidades} und · {op.mercancia.pesoKg.toLocaleString('es-CO')} kg</dd></div>
              <div className="flex gap-1"><dt className="text-slate-400 w-[72px] shrink-0">Cargue</dt><dd className="text-slate-800">{formatFechaDia(op.fechaCargue)}</dd></div>
              <div className="flex gap-1"><dt className="text-slate-400 w-[72px] shrink-0">Recibida</dt><dd className="font-mono text-slate-800">{fechaCorta(caso.recibidoEn)} {horaCorta(caso.recibidoEn)}</dd></div>
              <div className="flex gap-1 col-span-2"><dt className="text-slate-400 w-[72px] shrink-0">Transporte</dt><dd className="text-slate-800">{op.transportador ? `${op.transportador.nombre} · ${op.transportador.placa}` : op.vehiculoRequerido}{op.tarifaPactada ? <span className="font-mono"> · {formatCOP(op.tarifaPactada)}</span> : null}</dd></div>
            </dl>

            <ContenidoLista caso={caso} firma={firma} />

            {caso.plan.map((_, i) => <Seccion key={i} caso={caso} etapaIdx={i} firma={firma} />)}

            {caso.estado === 'terminada' && caso.resultado && fin && (
              <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 border-t-2 border-slate-800 pt-2">
                <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">{caso.resultado === 'cancelada' ? 'Acta de cancelación' : 'Acta de cierre y liquidación'}</div>
                <p className="mt-1 text-[11px] text-slate-700 leading-relaxed">
                  La operación <b className="font-mono">{op.id}</b> de <b>{op.cliente.nombre}</b> concluyó su proceso con resultado <b style={{ color: COLOR_RESULTADO[caso.resultado] }}>{TEXTO_RESULTADO[caso.resultado].toUpperCase()}</b> en {formatDuracion((caso.terminadoEn ?? 0) - caso.recibidoEn)}, con {plural(Object.keys(caso.pasosHechos).length, 'acción documentada', 'acciones documentadas')}, {plural(fin.eventos.length, 'evento')}, {plural(fin.trazas.length, 'traza de decisión', 'trazas de decisión')}{caso.excepciones > 0 ? ` y ${caso.excepciones} ${caso.excepciones === 1 ? 'novedad gestionada' : 'novedades gestionadas'} según las reglas del proceso` : ' y sin novedades'}.
                  {caso.resultado === 'cerrada' ? (fin.intervencionHumana ? ' Requirió decisión del coordinador en la Mesa.' : ' Sin intervención humana de principio a fin.') : ` Causa: ${fin.causaCancelacion ?? 'registrada'}.`}
                </p>
                <div className="mt-2 flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                  <Hash className="w-3 h-3" /> SHA-256 {caso.datos.expediente.hash.slice(0, 32)}…
                </div>
                <div className="mt-1 text-[10px] text-slate-500">Sellado por {AGENTES_MAP.torre.nombre} · {horaCorta(caso.terminadoEn ?? 0)}</div>
              </motion.section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
