import { memo, type ReactNode } from 'react';
import { Check, CircleAlert, ClipboardList, Layers, ListChecks, Scale, ShieldAlert, Star } from 'lucide-react';
import type { Excepcion, NombreEvento } from '@/types';
import type { Caso, PasoPlan } from '@/types/agentes';
import { AGENTES_MAP } from '@/data/agentesCatalogo';
import { BLOQUE_COLOR, ETAPAS_FLUJO, ETAPA_BLOQUE, ETAPA_LABEL, ETAPA_LABEL_CORTO, PLANTILLA_EXCEPCION, esEtapaFlujo } from '@/data/mockData';
import { horaMin, pesos } from '@/data/agentesUtil';
import {
  ANCLA_PLAT, BOTON_PASO, T_REQ, T_SELEC, T_NOV, anclaBtn, eventoEnTexto, fmtCosto, ofertasDe, tAlt, tOferta, ultimaPactada, ultimoTransportador,
} from '@/data/guiones/plataforma';
import { estadoAncla, progresoEfectivo } from '@/components/agentes/guion';
import { infoPaso, pasoHechoPorPrefijo } from '@/components/agentes/helpers';
import { formatFechaDia } from '@/lib/utils';
import type { PropsVentana } from '../tipos';
import VentanaSistema from '../VentanaSistema';

const AZUL = '#1d4ed8';
const base = (id?: string) => (id ?? '').replace(/_\d+$/, '');
const hecho = (caso: Caso, id: string) => {
  const e = infoPaso(caso, id).estado;
  return e === 'hecho' || e === 'fallo';
};
const clamp2 = { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as const;

/** Eventos que el paso deja en la plataforma aunque su `resultado` no los nombre. */
const EV_EXTRA: Record<string, NombreEvento> = {
  a1: 'SolicitudRecibida', x1: 'NovedadRegistrada', x3: 'DecisionCoordinador', x5: 'OperacionCancelada', z5: 'OperacionCerrada',
};
/** Estado que muestra la ficha hasta que el agente pulsa el botón del paso. */
const ESTADO_PREVIO: Record<string, 'Validacion' | 'Escalada' | 'CierreAdmin'> = { p1: 'Validacion', x5: 'Escalada', z5: 'CierreAdmin' };

function eventosEnTexto(texto?: string): NombreEvento[] {
  const out: NombreEvento[] = [];
  let resto = texto;
  for (let i = 0; i < 4; i++) {
    const e = eventoEnTexto(resto);
    if (!e) break;
    out.push(e);
    resto = (resto ?? '').replace(e, '');
  }
  return out;
}

/* ─── Piezas ─── */
type EstadoBoton = 'pend' | 'activo' | 'hecho' | 'sec';

function Boton({ texto, estado, clic }: { texto: string; estado: EstadoBoton; clic: boolean }) {
  const clase = estado === 'activo' ? 'text-white border-transparent'
    : estado === 'hecho' ? 'bg-white text-blue-700 border-blue-300'
      : estado === 'sec' ? 'bg-white text-slate-600 border-slate-300'
        : 'bg-slate-100 text-slate-400 border-slate-200';
  return (
    <button
      type="button"
      tabIndex={-1}
      className={`h-[18px] px-1.5 rounded border text-[9px] font-medium inline-flex items-center gap-0.5 shrink-0 whitespace-nowrap ${clase} ${clic ? 'brightness-90' : ''}`}
      style={estado === 'activo' ? { backgroundColor: clic ? '#1e3a8a' : AZUL } : undefined}
    >
      {estado === 'hecho' && <Check className="w-2.5 h-2.5" />}
      {texto}
    </button>
  );
}

/** Envuelve el botón con su ancla literal (el verificador lee `data-ancla="..."` en el JSX). */
function conAncla(slug: string, hijo: ReactNode): ReactNode {
  const c = 'inline-flex shrink-0';
  switch (slug) {
    case 'guardar': return <span key={slug} data-ancla="plataforma.btn.guardar" className={c}>{hijo}</span>;
    case 'validar': return <span key={slug} data-ancla="plataforma.btn.validar" className={c}>{hijo}</span>;
    case 'registrar': return <span key={slug} data-ancla="plataforma.btn.registrar" className={c}>{hijo}</span>;
    case 'restricciones': return <span key={slug} data-ancla="plataforma.btn.restricciones" className={c}>{hijo}</span>;
    case 'compartir': return <span key={slug} data-ancla="plataforma.btn.compartir" className={c}>{hijo}</span>;
    case 'formalizar': return <span key={slug} data-ancla="plataforma.btn.formalizar" className={c}>{hijo}</span>;
    case 'doble-confirmacion': return <span key={slug} data-ancla="plataforma.btn.doble-confirmacion" className={c}>{hijo}</span>;
    case 'preventivas': return <span key={slug} data-ancla="plataforma.btn.preventivas" className={c}>{hijo}</span>;
    case 'confirmar-llegada': return <span key={slug} data-ancla="plataforma.btn.confirmar-llegada" className={c}>{hijo}</span>;
    case 'confirmar-despacho': return <span key={slug} data-ancla="plataforma.btn.confirmar-despacho" className={c}>{hijo}</span>;
    case 'confirmar-recepcion': return <span key={slug} data-ancla="plataforma.btn.confirmar-recepcion" className={c}>{hijo}</span>;
    case 'calificacion': return <span key={slug} data-ancla="plataforma.btn.calificacion" className={c}>{hijo}</span>;
    case 'cerrar': return <span key={slug} data-ancla="plataforma.btn.cerrar" className={c}>{hijo}</span>;
    case 'novedad': return <span key={slug} data-ancla="plataforma.btn.novedad" className={c}>{hijo}</span>;
    case 'paquete': return <span key={slug} data-ancla="plataforma.btn.paquete" className={c}>{hijo}</span>;
    case 'cancelar': return <span key={slug} data-ancla="plataforma.btn.cancelar" className={c}>{hijo}</span>;
    case 'reanudar': return <span key={slug} data-ancla="plataforma.btn.reanudar" className={c}>{hijo}</span>;
    default: return null;
  }
}

function Dato({ etiqueta, resaltado, foco, children, vacio = false }: { etiqueta: string; resaltado?: boolean; foco?: boolean; children: ReactNode; vacio?: boolean }) {
  return (
    <div className="min-w-0 leading-tight">
      <div className="text-[8px] uppercase tracking-wide text-slate-400 font-semibold truncate">{etiqueta}</div>
      <div
        className={`h-[16px] flex items-center px-1 rounded border text-[9.5px] min-w-0 ${vacio ? 'text-slate-400 bg-slate-50 border-dashed border-slate-200' : 'text-slate-800 bg-white border-slate-200'} ${resaltado ? '!bg-amber-100 !border-amber-300' : ''} ${foco ? '!border-blue-600' : ''}`}
      >
        <span className="truncate min-w-0">{children}</span>
      </div>
    </div>
  );
}

function ChipEstado({ etapa, resaltado }: { etapa: keyof typeof ETAPA_LABEL; resaltado?: boolean }) {
  const col = BLOQUE_COLOR[ETAPA_BLOQUE[etapa]];
  return (
    <span
      className={`h-[16px] px-1.5 inline-flex items-center rounded border text-[9.5px] font-semibold truncate max-w-full ${resaltado ? 'ring-2 ring-amber-300' : ''}`}
      style={{ color: col.color, backgroundColor: col.bg, borderColor: `${col.color}55` }}
    >
      {ETAPA_LABEL[etapa]}
    </span>
  );
}

const CAT: Record<Excepcion['categoria'], string> = { automatico: 'Automática', asistido: 'Asistida', humano: 'Humana' };

/* ═══════════════ Vista 1 · Ficha de la operación ═══════════════ */

function VistaOperacion({ caso, paso, p }: { caso: Caso; paso?: PasoPlan; p: number }) {
  const d = caso.datos;
  const op = caso.operacion;
  const o0 = d.trayectoria[0];
  const idb = base(paso?.id);
  const e = (an: string) => estadoAncla(paso, p, an);
  const tClic = (an: string) => paso?.ui?.find(a => a.tipo === 'clic' && a.ancla === an)?.t;
  /** El botón del paso ya fue pulsado (paso actual: según el guion; los demás: ya hechos). */
  const pulsado = (id: string): boolean => {
    if (paso && idb === id) {
      const t = tClic(anclaBtn(id));
      return t === undefined ? p >= 1 : p >= t + 0.05;
    }
    return hecho(caso, id);
  };
  const listoPaso = !paso ? true : idb === 'x1' ? p >= T_NOV : pulsado(idb);

  /* ── Estado global ── */
  const previo = paso ? ESTADO_PREVIO[idb] : undefined;
  let etapa = paso?.estado ?? op.etapa;
  if (previo && !pulsado(idb)) etapa = previo;
  const idxFlujo = esEtapaFlujo(etapa) ? ETAPAS_FLUJO.indexOf(etapa) : etapa === 'Cerrada' ? ETAPAS_FLUJO.length : Math.max(0, op.etapaRetorno ? ETAPAS_FLUJO.indexOf(op.etapaRetorno) : 0);
  const colorEtapa = etapa === 'Cancelada' ? '#dc2626' : etapa === 'Escalada' || etapa === 'EsperaDatos' ? '#d97706' : AZUL;

  /* ── Identificador ── */
  const asignado = hecho(caso, 'p1') || idb === 'p1' || ETAPAS_FLUJO.indexOf(op.etapa as never) >= 2 || etapa === 'Cerrada' || etapa === 'Cancelada';
  const eOp = e(ANCLA_PLAT.operacion);
  let idTxt = '';
  let escribeId = false;
  if (idb === 'p1') {
    idTxt = eOp.tecleo === undefined ? '' : op.id.slice(0, Math.floor(eOp.tecleo * op.id.length));
    escribeId = eOp.tecleo !== undefined && eOp.tecleo < 1;
  } else if (asignado) idTxt = op.id;

  /* ── Campos derivados ── */
  const tr = op.transportador;
  const formalizada = pulsado('s5');
  const aceptada = d.negociacion.find(r => r.estado === 'aceptada_preliminar') ?? d.negociacion.find(r => r.tarifaFinal !== null);
  const verNeg = hecho(caso, 'n4') || idb === 'n6' || op.tarifaPactada !== null;
  const textoNeg = aceptada
    ? `Aceptación preliminar · ${aceptada.transportador} · ${pesos(aceptada.tarifaFinal ?? aceptada.contrapropuesta)}`
    : op.tarifaPactada !== null ? `Aceptación preliminar · ${pesos(op.tarifaPactada)}` : '';
  const c3 = pulsado('c3');
  const confPrevia = hecho(caso, 'c1') || hecho(caso, 'c2') || idb === 'c3';
  const sat = d.trayectoria[d.trayectoria.length - 1].satisfaccion;
  const eSat = e(ANCLA_PLAT.satisfaccion);
  const verSat = idb === 'z1' ? eSat.tecleo !== undefined : hecho(caso, 'z1');
  const satTxt = sat === null ? '' : idb === 'z1' && eSat.tecleo !== undefined ? String(sat).slice(0, Math.floor(eSat.tecleo * String(sat).length)) : String(sat);
  const pactada = op.tarifaPactada;
  const total = (pactada ?? 0) + op.costosAdicionales;

  /* ── Compromisos y eventos ── */
  const compromisos = op.compromisos.slice(-3);
  const propios = paso ? [...eventosEnTexto(paso.resultado), ...(EV_EXTRA[idb] ? [EV_EXTRA[idb]] : [])] : [];
  const bloqueados = new Set<string>(listoPaso ? [] : propios);
  const visto = new Set<string>();
  const log: { evento: string; ts?: number; nuevo: boolean }[] = [];
  for (const ev of op.eventos) {
    if (bloqueados.has(ev.evento) || visto.has(ev.evento)) continue;
    visto.add(ev.evento);
    log.push({ evento: ev.evento, ts: ev.timestamp, nuevo: listoPaso && propios.includes(ev.evento) });
  }
  for (const et of caso.plan) {
    for (const s of et.pasos) {
      const act = !!paso && s.id === paso.id;
      if (!(act ? listoPaso : hecho(caso, s.id))) continue;
      const b = base(s.id);
      for (const ev of [...eventosEnTexto(s.resultado), ...(EV_EXTRA[b] ? [EV_EXTRA[b]] : [])]) {
        if (visto.has(ev)) continue;
        visto.add(ev);
        log.push({ evento: ev, nuevo: act });
      }
    }
  }
  const recientes = log.slice(-4).reverse();

  /* ── Novedad y paquete de decisión ── */
  const ctxTexto = `${paso?.texto ?? ''} ${paso?.pensamiento ?? ''} ${paso?.resultado ?? ''} ${(paso?.ui ?? []).find(a => a.tipo === 'dialogo')?.dialogo?.cuerpo ?? ''}`;
  const candidatas: Excepcion[] = [d.excepcion, ...d.trayectoria.flatMap(o => [o.excepcion, ...o.excepcionesPrevias])].filter((x): x is Excepcion => !!x);
  const enNovedad = ['x1', 'x2', 'x5', 'x6', 'r2'].includes(idb);
  let exc: Excepcion | null = op.excepcion;
  if (enNovedad) {
    exc = candidatas.find(x => ctxTexto.includes(x.titulo))
      ?? candidatas.find(x => x.alternativas.some(a => ctxTexto.includes(a.titulo)))
      ?? op.excepcion ?? d.excepcion;
  }
  const verNovedad = !!exc && (idb === 'x1' ? p >= T_NOV : true);
  const pl = exc ? PLANTILLA_EXCEPCION[exc.tipo] : undefined;
  const alts = exc && exc.categoria !== 'automatico' ? exc.alternativas : [];
  const paqueteListo = idb === 'x2' ? true : hecho(caso, 'x2');
  const verPaquete = verNovedad && alts.length > 0 && paqueteListo;
  const recVisible = idb === 'x2' ? p >= 0.78 : true;
  const decidida = !!pasoHechoPorPrefijo(caso, 'x3');
  const elegida = decidida ? d.decision?.alternativa ?? d.decision?.aplicada?.id ?? null : null;
  const resuelta = (idb === 'x6' || idb === 'r2') ? pulsado(idb) : false;
  const cancelada = etapa === 'Cancelada';
  const eNov = e(ANCLA_PLAT.novedad);

  /* ── Barra de herramientas ── */
  const actual = paso ? BOTON_PASO[idb]?.slug : undefined;
  const slugs = [...(actual && actual !== 'novedad' && actual !== 'cancelar' ? [actual] : []), 'novedad', 'cancelar'];
  const etiquetaDe = (slug: string) => Object.values(BOTON_PASO).find(b => b.slug === slug)?.etiqueta ?? slug;
  const estadoBtn = (slug: string): EstadoBoton => {
    if (slug !== actual) return 'sec';
    return pulsado(idb) ? 'hecho' : 'activo';
  };

  return (
    <div className="absolute inset-0 flex flex-col text-slate-800 bg-slate-50">
      <div className="h-[28px] shrink-0 flex items-center gap-2 px-2 border-b border-slate-200 bg-white whitespace-nowrap overflow-hidden">
        <ClipboardList className="w-3.5 h-3.5 text-blue-700 shrink-0" />
        <span className="text-[10px] font-semibold text-slate-700 shrink-0">Operación</span>
        <span data-ancla="plataforma.campo.operacion" className="inline-flex shrink-0">
          <span className={`h-[18px] w-[78px] px-1 inline-flex items-center rounded border font-mono text-[10px] ${eOp.resaltado ? 'bg-amber-100 border-amber-300' : eOp.foco ? 'border-blue-600 bg-blue-50' : 'bg-white border-slate-300'}`}>
            {idTxt || (!asignado && !escribeId ? <span className="text-slate-400 italic font-sans text-[9px]">Por asignar</span> : '')}
            {escribeId && <span className="inline-block w-px h-[10px] bg-slate-700 ml-px" />}
          </span>
        </span>
        <span data-ancla="plataforma.campo.estado" className="inline-flex min-w-0 shrink">
          <ChipEstado etapa={etapa} resaltado={e(ANCLA_PLAT.estado).resaltado} />
        </span>
        <span className="ml-auto flex items-center gap-1 shrink-0">
          {slugs.map(s => conAncla(s, <Boton texto={etiquetaDe(s)} estado={estadoBtn(s)} clic={e(`plataforma.btn.${s}`).clic} />))}
        </span>
      </div>

      <div data-ancla="plataforma.lista.etapas" className={`h-[20px] shrink-0 flex items-stretch gap-px px-1.5 py-[3px] bg-white border-b border-slate-200 ${e(ANCLA_PLAT.etapas).resaltado ? '!bg-amber-100' : ''}`}>
        {ETAPAS_FLUJO.map((et, i) => {
          const actualE = i === idxFlujo && etapa !== 'Cerrada';
          const hechaE = i < idxFlujo;
          return (
            <span
              key={et}
              title={ETAPA_LABEL[et]}
              className={`h-full inline-flex items-center justify-center rounded-[2px] text-[8px] overflow-hidden whitespace-nowrap ${actualE ? 'flex-[4] px-1 font-semibold text-white' : 'flex-1'} ${!actualE && hechaE ? 'bg-blue-100 text-blue-700' : !actualE ? 'bg-slate-100 text-slate-400' : ''}`}
              style={actualE ? { backgroundColor: colorEtapa } : undefined}
            >
              {actualE ? `${i + 1} · ${ETAPA_LABEL_CORTO[et]}` : i + 1}
            </span>
          );
        })}
      </div>

      <div className="flex-1 min-h-0 flex overflow-hidden">
        <div className="flex-1 min-w-0 p-1.5 grid grid-cols-3 gap-x-1.5 gap-y-1 content-start overflow-hidden">
          <div data-ancla="plataforma.campo.cliente" className="min-w-0"><Dato etiqueta="Cliente" resaltado={e(ANCLA_PLAT.cliente).resaltado}>{o0.cliente.nombre}</Dato></div>
          <div data-ancla="plataforma.campo.solicitud" className="min-w-0"><Dato etiqueta="Solicitud" resaltado={e(ANCLA_PLAT.solicitud).resaltado}><span className="font-mono">{d.solicitud.referenciaCliente}</span></Dato></div>
          <div data-ancla="plataforma.campo.ruta" className="min-w-0"><Dato etiqueta="Ruta" resaltado={e(ANCLA_PLAT.ruta).resaltado}>{o0.nodoOrigen.ciudad} → {o0.nodoDestino.ciudad} · {o0.distanciaKm} km</Dato></div>
          <div data-ancla="plataforma.campo.mercancia" className="min-w-0"><Dato etiqueta="Mercancía" resaltado={e(ANCLA_PLAT.mercancia).resaltado}>{o0.mercancia.tipo} · {o0.mercancia.pesoKg.toLocaleString('es-CO')} kg</Dato></div>
          <div data-ancla="plataforma.campo.vehiculo" className="min-w-0"><Dato etiqueta="Vehículo requerido" resaltado={e(ANCLA_PLAT.vehiculo).resaltado}>{o0.vehiculoRequerido}</Dato></div>
          <div data-ancla="plataforma.campo.cargue" className="min-w-0"><Dato etiqueta="Fecha de cargue" resaltado={e(ANCLA_PLAT.cargue).resaltado}>{formatFechaDia(o0.fechaCargue)} · {horaMin(o0.fechaCargue)}</Dato></div>
          <div data-ancla="plataforma.campo.requisitos" className="min-w-0">
            <Dato etiqueta="Restricciones" resaltado={e(ANCLA_PLAT.requisitos).resaltado}>
              {op.datosPendientes.length > 0 ? `Pendiente: ${op.datosPendientes.join(', ')}` : o0.requisitoEspecial ?? 'Sin requisitos especiales'}
            </Dato>
          </div>
          <div data-ancla="plataforma.campo.transportador" className="min-w-0">
            <Dato etiqueta="Transportador" resaltado={e(ANCLA_PLAT.transportador).resaltado} vacio={!tr}>
              {tr ? <>{tr.nombre} · <span className="font-mono">{tr.placa}</span>{formalizada ? <span className="text-emerald-700"> · Formalizada</span> : ''}</> : 'Sin asignar'}
            </Dato>
          </div>
          <div data-ancla="plataforma.campo.receptor" className="min-w-0">
            <Dato etiqueta="Receptor en destino" resaltado={e(ANCLA_PLAT.receptor).resaltado} vacio={!op.receptor}>{op.receptor ? `${op.receptor.nombre} · ${op.receptor.telefono}` : '—'}</Dato>
          </div>
          <div data-ancla="plataforma.campo.negociacion" className="min-w-0">
            <Dato etiqueta="Negociación" resaltado={e(ANCLA_PLAT.negociacion).resaltado} vacio={!verNeg || !textoNeg}>{verNeg && textoNeg ? textoNeg : '—'}</Dato>
          </div>
          <div data-ancla="plataforma.campo.confirmacion" className="min-w-0">
            <Dato etiqueta="Doble confirmación" resaltado={e(ANCLA_PLAT.confirmacion).resaltado} vacio={!c3 && !confPrevia}>
              {c3 ? <span className="text-emerald-700">Cliente y transportador · misma información</span> : confPrevia ? 'Por registrar' : '—'}
            </Dato>
          </div>
          <div data-ancla="plataforma.campo.satisfaccion" className="min-w-0">
            <Dato etiqueta="Satisfacción" resaltado={e(ANCLA_PLAT.satisfaccion).resaltado} foco={eSat.foco} vacio={!verSat}>
              {verSat ? <><span className="font-mono">{satTxt}</span>{eSat.tecleo !== undefined && eSat.tecleo < 1 ? '' : ' / 5'}</> : '—'}
            </Dato>
          </div>
          <div data-ancla="plataforma.campo.tarifa" className="min-w-0">
            <Dato etiqueta="Tarifa pactada vs tope" resaltado={e(ANCLA_PLAT.tarifa).resaltado}>
              <span className="font-mono">{pactada !== null ? pesos(pactada) : '—'}</span> pactada · tope <span className="font-mono">{pesos(op.tarifaMaxima)}</span>
            </Dato>
          </div>
          <div className="min-w-0 col-span-2 text-[8.5px] text-slate-500 self-end pb-[2px] truncate">
            Adicionales autorizados <span className="font-mono text-slate-700">{fmtCosto(op.costosAdicionales)}</span>
            {pactada !== null && <> · total <span className="font-mono text-slate-700">{pesos(total)}</span></>}
          </div>
        </div>

        <div className="w-[38%] shrink-0 border-l border-slate-200 bg-white flex flex-col min-h-0 overflow-hidden">
          <div data-ancla="plataforma.lista.compromisos" className={`px-1.5 py-1 border-b border-slate-100 ${e(ANCLA_PLAT.compromisos).resaltado ? 'bg-amber-100' : ''}`}>
            <div className="flex items-center gap-1 text-[8px] uppercase tracking-wide text-slate-400 font-semibold"><ListChecks className="w-2.5 h-2.5" />Compromisos</div>
            {compromisos.length === 0 && <div className="h-[14px] text-[9px] text-slate-400 leading-[14px]">Sin compromisos registrados</div>}
            {compromisos.map(c => (
              <div key={c.id} className="h-[14px] flex items-center gap-1 text-[9px] min-w-0">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.estado === 'cumplido' ? 'bg-emerald-500' : c.estado === 'incumplido' ? 'bg-red-500' : 'bg-amber-400'}`} />
                <span className="font-mono text-slate-500 shrink-0">{horaMin(c.venceEn)}</span>
                <span className="truncate text-slate-700">{c.texto}</span>
              </div>
            ))}
          </div>
          <div data-ancla="plataforma.lista.eventos" className={`px-1.5 py-1 flex-1 min-h-0 overflow-hidden ${e(ANCLA_PLAT.eventos).resaltado ? 'bg-amber-100' : ''}`}>
            <div className="flex items-center gap-1 text-[8px] uppercase tracking-wide text-slate-400 font-semibold"><Layers className="w-2.5 h-2.5" />Eventos recientes</div>
            {recientes.length === 0 && <div className="h-[14px] text-[9px] text-slate-400 leading-[14px]">Sin eventos</div>}
            {recientes.map(ev => (
              <div key={ev.evento} className={`h-[14px] flex items-center gap-1 text-[9px] min-w-0 ${ev.nuevo ? 'animate-toast-in' : ''}`}>
                <span className="font-mono text-slate-400 shrink-0 w-[28px]">{ev.ts ? horaMin(ev.ts) : '·'}</span>
                <span className={`truncate font-mono ${ev.nuevo ? 'text-blue-800 font-semibold' : 'text-slate-700'}`}>{ev.evento}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {verNovedad && exc && (
        <div className="h-[70px] shrink-0 flex gap-1.5 p-1.5 border-t border-slate-300 bg-white animate-toast-in">
          <div
            data-ancla="plataforma.bloque.novedad"
            className={`${verPaquete ? 'w-[40%]' : 'flex-1'} min-w-0 rounded border px-1.5 py-1 ${eNov.resaltado ? 'bg-amber-100 border-amber-300' : cancelada ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}
          >
            <div className="flex items-center gap-1 min-w-0">
              <ShieldAlert className={`w-3 h-3 shrink-0 ${cancelada ? 'text-red-600' : 'text-amber-600'}`} />
              <span className="text-[9.5px] font-semibold text-slate-800 truncate">{exc.titulo}</span>
              <span className="shrink-0 h-[13px] px-1 rounded border border-amber-300 bg-white text-[8px] text-amber-800 inline-flex items-center">{CAT[exc.categoria]}</span>
              {resuelta && <span className="shrink-0 h-[13px] px-1 rounded bg-emerald-100 text-[8px] text-emerald-800 inline-flex items-center">Resuelta</span>}
            </div>
            <div className="text-[8.5px] leading-[11px] text-slate-600 mt-0.5" style={clamp2}>
              {cancelada && op.causaCancelacion ? `Servicio cancelado: ${op.causaCancelacion}` : exc.causa}
            </div>
            <div className="text-[8px] text-slate-400 font-mono truncate mt-px">{pl ? `${pl.regla} · ${pl.politica}` : exc.politica}</div>
          </div>
          {verPaquete && (
            <div className="flex-1 min-w-0 flex gap-1">
              {alts.map((a, i) => {
                const visible = idb === 'x2' ? p >= tAlt(i, alts.length) : true;
                if (!visible) return <div key={a.id} className="flex-1 min-w-0 rounded border border-dashed border-slate-200 bg-slate-50" />;
                const ea = e(`plataforma.alt.${a.id.toLowerCase()}`);
                const rec = recVisible && a.id === exc.recomendada;
                const eleg = elegida === a.id;
                return (
                  <div
                    key={a.id}
                    data-ancla={`plataforma.alt.${a.id.toLowerCase()}`}
                    className={`flex-1 min-w-0 rounded border px-1 py-0.5 animate-toast-in ${ea.resaltado ? 'bg-amber-100 border-amber-400' : eleg ? 'bg-emerald-50 border-emerald-400' : rec ? 'bg-blue-50 border-blue-400' : 'bg-white border-slate-200'}`}
                  >
                    <div className="flex items-center gap-1 min-w-0">
                      <span className="w-3.5 h-3.5 shrink-0 rounded-full bg-slate-700 text-white text-[8.5px] font-bold inline-flex items-center justify-center">{a.id}</span>
                      {rec && <span className="inline-flex items-center gap-px text-[7.5px] text-blue-700 font-semibold"><Star className="w-2 h-2" />Recomendada</span>}
                      {eleg && <span className="inline-flex items-center gap-px text-[7.5px] text-emerald-700 font-semibold"><Check className="w-2 h-2" />Elegida</span>}
                    </div>
                    <div className="text-[8.5px] leading-[10px] text-slate-800 font-medium" style={clamp2}>{a.titulo}</div>
                    <div className="text-[8px] font-mono text-slate-500 truncate">{fmtCosto(a.impactoCosto)} · {a.impactoHoras > 0 ? '+' : ''}{a.impactoHoras} h · SLA {a.impactoSLA}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════ Vista 2 · Comparativo de ofertas ═══════════════ */

function Barra({ valor, color }: { valor: number; color: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="w-[26px] h-[4px] rounded bg-slate-200 overflow-hidden"><span className="block h-full" style={{ width: `${Math.min(100, valor)}%`, backgroundColor: color }} /></span>
      <span className="font-mono tabular-nums text-slate-700 text-[9px]">{valor}</span>
    </span>
  );
}

const ETIQUETA_OFERTA = {
  aceptada_preliminar: { t: 'Aceptada', c: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  contraoferta_ok: { t: 'Dentro del tope', c: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  sobre_tope: { t: 'Sobre el tope', c: 'bg-red-100 border-red-300 text-red-700 font-semibold' },
  sin_interes: { t: 'Sin interés', c: 'bg-slate-100 border-slate-300 text-slate-500' },
} as const;

function VistaSeleccion({ caso, paso, p }: { caso: Caso; paso?: PasoPlan; p: number }) {
  const d = caso.datos;
  const op = caso.operacion;
  const idb = base(paso?.id);
  const e = (an: string) => estadoAncla(paso, p, an);
  const tClic = (an: string) => paso?.ui?.find(a => a.tipo === 'clic' && a.ancla === an)?.t;
  const clicHecho = (an: string) => { const t = tClic(an); return t !== undefined && p >= t + 0.05; };
  const ofertas = ofertasDe(d);
  const n = ofertas.length;
  const manual = d.excepcion?.tipo === 'Seleccion_manual';

  const s1Hecho = idb === 's1' ? clicHecho(ANCLA_PLAT.btnConsolidar) : hecho(caso, 's1') || idb === 's2' || idb === 's3';
  const decidido = idb === 's2' ? p >= (manual ? 0.8 : 0.76) : hecho(caso, 's2') || idb === 's3';
  const idSel = ultimoTransportador(d)?.id ?? null;
  const selMarcada = idb === 's3' ? p >= T_SELEC : hecho(caso, 's3');
  const btnSelPulsado = idb === 's3' ? clicHecho(ANCLA_PLAT.btnSeleccionar) : hecho(caso, 's3');
  const filasVisibles = ofertas.filter((_, i) => (idb === 's1' ? p >= tOferta(i, n) : s1Hecho || hecho(caso, 's1')));
  const tarifaSel = ultimaPactada(d);
  const selOferta = ofertas.find(o => o.id === idSel);

  const modoTxt = decidido ? (manual ? 'Manual · coordinador (R09)' : 'Automática · cumple R09') : 'Automática · por verificar';
  const reqEstado = (i: number): 'ok' | 'revisar' | 'pend' => {
    if (idb === 's2') return manual ? (decidido ? 'revisar' : 'pend') : p >= T_REQ[i] ? 'ok' : 'pend';
    return decidido ? (manual ? 'revisar' : 'ok') : 'pend';
  };
  const req = (i: number, texto: string, resaltado: boolean) => {
    const st = reqEstado(i);
    return (
      <span className={`h-[16px] px-1.5 inline-flex items-center gap-1 rounded border text-[9px] ${resaltado ? 'bg-amber-100 border-amber-300 text-amber-900' : st === 'ok' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : st === 'revisar' ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-white border-slate-200 text-slate-500'}`}>
        {st === 'ok' ? <Check className="w-2.5 h-2.5" /> : st === 'revisar' ? <CircleAlert className="w-2.5 h-2.5" /> : <span className="w-2.5" />}
        {texto}
      </span>
    );
  };

  const eTope = e(ANCLA_PLAT.tope);
  const eModo = e(ANCLA_PLAT.modo);
  const btnCons: EstadoBoton = s1Hecho ? 'hecho' : idb === 's1' ? 'activo' : 'pend';
  const btnVer: EstadoBoton = decidido ? 'hecho' : idb === 's2' ? 'activo' : 'pend';
  const btnSel: EstadoBoton = btnSelPulsado ? 'hecho' : idb === 's3' ? 'activo' : 'pend';

  return (
    <div className="absolute inset-0 flex flex-col text-slate-800 bg-slate-50">
      <div className="h-[28px] shrink-0 flex items-center gap-2 px-2 border-b border-slate-200 bg-white whitespace-nowrap overflow-hidden">
        <Scale className="w-3.5 h-3.5 text-blue-700 shrink-0" />
        <span className="text-[10px] font-semibold text-slate-700 shrink-0">Selección</span>
        <span className="font-mono text-[9.5px] text-slate-500 shrink-0">{op.id}</span>
        <span
          data-ancla="plataforma.campo.tope"
          className={`inline-flex items-center gap-1 h-[18px] px-1.5 rounded border text-[9.5px] shrink-0 ${eTope.resaltado ? 'bg-amber-100 border-amber-300' : 'bg-blue-50 border-blue-200'}`}
        >
          <span className="text-slate-500">Tope</span>
          <span className="font-mono font-bold text-blue-900">{pesos(op.tarifaMaxima)}</span>
        </span>
        <span
          data-ancla="plataforma.campo.modo"
          className={`inline-flex items-center gap-1 h-[18px] px-1.5 rounded border text-[9.5px] min-w-0 ${eModo.resaltado ? 'bg-amber-100 border-amber-300' : manual && decidido ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-white border-slate-200'}`}
        >
          <span className="text-slate-500 shrink-0">Modo</span>
          <span className="truncate font-medium">{modoTxt}</span>
        </span>
        <span className="ml-auto flex items-center gap-1 shrink-0">
          <span data-ancla="plataforma.btn.consolidar" className="inline-flex shrink-0"><Boton texto="Consolidar ofertas" estado={btnCons} clic={e(ANCLA_PLAT.btnConsolidar).clic} /></span>
          <span data-ancla="plataforma.btn.verificar" className="inline-flex shrink-0"><Boton texto="Verificar requisitos" estado={btnVer} clic={e(ANCLA_PLAT.btnVerificar).clic} /></span>
          <span data-ancla="plataforma.btn.seleccionar" className="inline-flex shrink-0"><Boton texto="Seleccionar" estado={btnSel} clic={e(ANCLA_PLAT.btnSeleccionar).clic} /></span>
        </span>
      </div>

      <div className="h-[24px] shrink-0 flex items-center gap-1.5 px-2 border-b border-slate-200 bg-white whitespace-nowrap overflow-hidden">
        <span className="text-[8.5px] uppercase tracking-wide text-slate-400 shrink-0">Requisitos R09</span>
        <span data-ancla="plataforma.item.operativo" className="inline-flex shrink-0">{req(0, "Operativo", e(ANCLA_PLAT.reqOperativo).resaltado)}</span>
        <span data-ancla="plataforma.item.documental" className="inline-flex shrink-0">{req(1, "Documental", e(ANCLA_PLAT.reqDocumental).resaltado)}</span>
        <span data-ancla="plataforma.item.comercial" className="inline-flex shrink-0">{req(2, "Comercial", e(ANCLA_PLAT.reqComercial).resaltado)}</span>
        <span className="ml-auto text-[9px] text-slate-500 tabular-nums shrink-0">{filasVisibles.length} de {n} ofertas</span>
      </div>

      <div className="h-[15px] shrink-0 flex items-center gap-1.5 px-2 border-b border-slate-200 bg-slate-100 text-[8.5px] uppercase tracking-wide text-slate-500 border-l-2 border-l-transparent">
        <span className="flex-1 min-w-0">Transportador</span>
        <span className="w-[96px] shrink-0">Tarifa</span>
        <span className="w-[56px] shrink-0">Cumplim.</span>
        <span className="w-[56px] shrink-0">Compat.</span>
        <span className="w-[92px] shrink-0 text-center">Estado</span>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col bg-white">
        {filasVisibles.length === 0 && <div className="px-2 py-2 text-[9.5px] text-slate-400">Sin ofertas consolidadas todavía.</div>}
        {filasVisibles.map(o => {
          const eo = e(`plataforma.fila.${o.id.toLowerCase()}`);
          const sel = selMarcada && o.id === idSel;
          const previa = idb === 's3' && !selMarcada && o.id === idSel && (eo.foco || eo.clic || p >= 0.18);
          const dif = o.tarifa - op.tarifaMaxima;
          const et = sel ? { t: 'Seleccionada', c: 'bg-blue-600 border-blue-700 text-white font-semibold' } : selMarcada ? { t: 'No seleccionada', c: 'bg-slate-50 border-slate-200 text-slate-400' } : ETIQUETA_OFERTA[o.estado];
          return (
            <div
              key={o.id}
              data-ancla={`plataforma.fila.${o.id.toLowerCase()}`}
              className={`h-[30px] shrink-0 flex items-center gap-1.5 px-2 border-b border-slate-100 border-l-2 animate-toast-in ${selMarcada && !sel ? 'opacity-60' : ''}`}
              style={{ borderLeftColor: sel ? AZUL : previa ? '#93c5fd' : 'transparent', backgroundColor: eo.resaltado ? '#fef3c7' : sel ? '#dbeafe' : previa ? '#eff6ff' : undefined }}
            >
              <span className="flex-1 min-w-0 leading-tight">
                <span className={`block text-[10px] truncate ${sel ? 'font-bold text-slate-900' : 'font-medium text-slate-800'}`}>{o.nombre}</span>
                <span className="block text-[8.5px] text-slate-400 truncate">{o.id} · {o.vehiculo}</span>
              </span>
              <span className="w-[96px] shrink-0 leading-tight">
                <span className="block font-mono tabular-nums text-[10px] text-slate-800">{pesos(o.tarifa)}</span>
                <span className={`block text-[8.5px] ${dif > 0 ? 'text-red-700 font-semibold' : 'text-emerald-700'}`}>{dif > 0 ? `+${pesos(dif)} sobre tope` : `margen ${pesos(-dif)}`}</span>
              </span>
              <span className="w-[56px] shrink-0"><Barra valor={o.cumplimiento} color="#2563eb" /></span>
              <span className="w-[56px] shrink-0"><Barra valor={o.compatibilidad} color="#0d9488" /></span>
              <span className={`w-[92px] shrink-0 h-[15px] inline-flex items-center justify-center rounded border text-[8.5px] truncate px-0.5 ${et.c}`}>{et.t}</span>
            </div>
          );
        })}
      </div>
      <div className={`h-[20px] shrink-0 flex items-center px-2 border-t text-[9.5px] truncate ${selMarcada ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'}`}>
        {selMarcada && selOferta ? (
          <span className="text-blue-900 font-semibold inline-flex items-center gap-1 min-w-0"><Check className="w-3 h-3 shrink-0" /><span className="truncate">Seleccionado: {selOferta.nombre} · {pesos(tarifaSel ?? selOferta.tarifa)} · TransportadorSeleccionado</span></span>
        ) : s1Hecho ? (
          <span className="text-slate-600 truncate">{n} ofertas consolidadas · tope {pesos(op.tarifaMaxima)}{decidido ? (manual ? ' · decide el coordinador' : ' · selección automática') : ''}</span>
        ) : (
          <span className="text-slate-400">Sin ofertas consolidadas</span>
        )}
      </div>
    </div>
  );
}

/* ═══════════════ Ventana ═══════════════ */

function VentanaPlataforma({ caso, vista, paso, progreso, velocidad, actor, medir, relojSim }: PropsVentana) {
  const p = progresoEfectivo(progreso, velocidad);
  const d = caso.datos;
  const agente = caso.plan.find(et => paso && et.pasos.some(x => x.id === paso.id))?.agente ?? 'receptor';
  const color = AGENTES_MAP[agente].color;
  return (
    <VentanaSistema
      ventana="plataforma"
      vista={vista}
      actor={actor}
      humano={paso?.humano}
      paso={paso}
      progreso={p}
      sesion={d.sesion}
      relojSim={relojSim}
      medir={medir}
      color={color}
    >
      {vista === 'plataforma.seleccion'
        ? <VistaSeleccion caso={caso} paso={paso} p={p} />
        : <VistaOperacion caso={caso} paso={paso} p={p} />}
    </VentanaSistema>
  );
}

export default memo(VentanaPlataforma);
