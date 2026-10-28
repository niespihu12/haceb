// Ventana «Revisiones del proceso» (E4b): revision.cargue, revision.entrega y revision.cierre.
// Listas de chequeo (cargue y cierre) y cruce de entrega: cada ítem se revisa uno por uno y a progreso = 1
// la pantalla muestra el resultado final. Todo es función pura del progreso del paso y del caso.
import { memo, type ReactNode } from 'react';
import { ArrowLeftRight, FileCheck, MapPin, PackageCheck, Truck, UserRound } from 'lucide-react';
import type { Caso, ItemRevision, PasoPlan } from '@/types/agentes';
import { PLANTILLA_EXCEPCION } from '@/data/mockData';
import { horaMin } from '@/data/agentesUtil';
import {
  anclaRevB, BTN_APROBAR, BTN_DEVOLVER, BTN_NO_CERRAR, BTN_RETENER, PASOS_CARGUE, PASOS_CIERRE, type PasoLista,
} from '@/data/guiones/revisionB';
import { estadoAncla, progresoEfectivo, type EstadoAncla } from '@/components/agentes/guion';
import { BarraProgreso, ChipRegla, Sello, Spinner, TextoEnVivo } from '@/components/agentes/ui';
import type { PropsVentana } from '../../tipos';
import { CROMO } from '../../cromo';
import VentanaSistema from '../../VentanaSistema';

const ACENTO = CROMO.revision.barra;
const FONDO = CROMO.revision.fondo;
const ESTADO_VACIO: EstadoAncla = { foco: false, tecleo: undefined, pegado: false, resaltado: false, clic: false, mascara: false };

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const idBase = (paso: PasoPlan | undefined) => paso?.id.replace(/_\d+$/, '');

/** Primer instante (0–1) en que el guion hace `tipo` sobre `ancla`. */
function tAccion(paso: PasoPlan | undefined, ancla: string, tipo: string): number | undefined {
  return (paso?.ui ?? []).find(a => a.ancla === ancla && a.tipo === tipo)?.t;
}

/** Avance (0–1) de la lectura de un ancla: del acercamiento del cursor a la marca. */
function avance(paso: PasoPlan | undefined, p: number, ancla: string): number {
  if (!paso) return 1;
  const t0 = tAccion(paso, ancla, 'mover');
  const t1 = tAccion(paso, ancla, 'resaltar');
  if (t0 === undefined || t1 === undefined) return 1;
  return t1 > t0 ? clamp01((p - t0) / (t1 - t0)) : (p >= t1 ? 1 : 0);
}

/* ─── Piezas ─── */
function Boton({ 'data-ancla': ancla, texto, presionado, activo, color }: {
  'data-ancla': string; texto: string; presionado: boolean; activo: boolean; color: string;
}) {
  return (
    <span
      data-ancla={ancla}
      className={`h-[20px] px-2 inline-flex items-center gap-1 rounded-sm border text-[10.5px] font-medium select-none whitespace-nowrap ${activo ? 'text-white' : 'bg-slate-100 text-slate-400 border-slate-300'} ${presionado ? 'shadow-[inset_0_2px_3px_rgba(0,0,0,0.4)] translate-y-[1px]' : 'shadow-sm'}`}
      style={activo ? { backgroundColor: color, borderColor: color, filter: presionado ? 'brightness(0.85)' : undefined } : undefined}
    >
      {texto}
    </span>
  );
}

function Cabecera({ icono, titulo, hechos, total, aprobar, devolver }: {
  icono: ReactNode; titulo: string; hechos: number; total: number; aprobar: ReactNode; devolver: ReactNode;
}) {
  return (
    <div className="shrink-0 h-[26px] flex items-center gap-2 px-2 border-b border-slate-300 bg-white whitespace-nowrap overflow-hidden">
      <span className="shrink-0" style={{ color: ACENTO }}>{icono}</span>
      <span className="text-[11px] font-semibold text-slate-800 truncate">{titulo}</span>
      <span className="ml-auto flex items-center gap-2 shrink-0">
        <span className="w-14"><BarraProgreso valor={total ? hechos / total : 0} color={ACENTO} /></span>
        <span className="font-mono text-[10px] text-slate-500 w-8 text-right">{hechos}/{total}</span>
        {aprobar}
        {devolver}
      </span>
    </div>
  );
}

function Casilla({ estado }: { estado: 'pendiente' | 'leyendo' | 'ok' | 'fallo' }) {
  if (estado === 'leyendo') return <span className="w-[13px] h-[13px] shrink-0 inline-flex items-center justify-center"><Spinner className="w-3 h-3" color={ACENTO} /></span>;
  const clase = estado === 'ok'
    ? 'bg-emerald-600 border-emerald-700 text-white'
    : estado === 'fallo' ? 'bg-red-600 border-red-700 text-white' : 'bg-white border-slate-400';
  return <span className={`w-[13px] h-[13px] shrink-0 inline-flex items-center justify-center rounded-[2px] border text-[10px] font-bold leading-none ${clase}`}>{estado === 'ok' ? '✓' : estado === 'fallo' ? '✗' : ''}</span>;
}

/* ─── Listas de chequeo: control de cargue y cierre administrativo ─── */
interface CfgLista {
  titulo: string;
  icono: ReactNode;
  items: ItemRevision[];
  pasos: Record<string, PasoLista>;
  rotuloValor: string;
  aprobar: string;
  devolver: string;
  selloFallo: string;
  /** Ancla del botón del diálogo que cierra el paso cuando hay incumplimiento (si lo hay). */
  btnDialogo?: string;
  textoOk: string;
  regla: string;
}

function PanelChequeo({ cfg, activo, p }: { cfg: CfgLista; activo: PasoPlan | undefined; p: number }) {
  const est = (ancla: string): EstadoAncla => (activo ? estadoAncla(activo, p, ancla) : ESTADO_VACIO);
  const base = idBase(activo);
  const paso = base ? cfg.pasos[base] : undefined;
  const vigilando = base === 'o3';
  const n = cfg.items.length;

  // Lo que muestra cada fila en este instante: 'final' (dato real), 'leyendo' o 'pendiente'.
  const fase = (it: ItemRevision): 'final' | 'leyendo' | 'pendiente' => {
    if (!activo || !paso) return 'final';
    if (paso.previos.includes(it.id)) return 'final';
    if (!paso.revisa.includes(it.id)) return 'pendiente';
    const a = anclaRevB(it.id);
    const tm = tAccion(activo, a, 'mover');
    const tr = tAccion(activo, a, 'resaltar');
    if (tr === undefined || p >= tr) return 'final';
    return tm !== undefined && p >= tm ? 'leyendo' : 'pendiente';
  };
  // En la vigilancia (o3) la espera todavía no supera el parámetro: se muestra en orden aunque luego falle.
  const visto = (it: ItemRevision): ItemRevision =>
    vigilando && it.id === 'espera' ? { ...it, ok: true, valor: 'Vigilando · aún dentro del parámetro de 90 min' } : it;

  const filas = cfg.items.map(it => ({ it: visto(it), fase: fase(it) }));
  const hechos = filas.filter(f => f.fase === 'final').length;
  const revisados = paso ? filas.filter(f => paso.revisa.includes(f.it.id)) : filas;
  const completa = revisados.every(f => f.fase === 'final');
  const malos = revisados.filter(f => !f.it.ok).map(f => f.it);
  const bien = malos.length === 0;

  const tAprobar = tAccion(activo, BTN_APROBAR, 'clic');
  const tDevolver = tAccion(activo, BTN_DEVOLVER, 'clic');
  const tDialogo = cfg.btnDialogo ? tAccion(activo, cfg.btnDialogo, 'clic') : undefined;
  const tSello = tDialogo ?? tAprobar ?? tDevolver;
  const sellada = !activo || (tSello !== undefined && p >= tSello);

  const excep = malos.find(m => m.excepcion)?.excepcion;
  const nombreNovedad = excep ? PLANTILLA_EXCEPCION[excep].nombre : undefined;
  const fallosTodos = cfg.items.filter(i => !i.ok);
  const resumenFinal = paso && activo?.resultado
    ? activo.resultado
    : fallosTodos.length === 0 ? `${n} de ${n} ítems en orden` : `${n - fallosTodos.length} de ${n} ítems en orden`;

  return (
    <>
      <Cabecera
        icono={cfg.icono}
        titulo={cfg.titulo}
        hechos={hechos}
        total={n}
        aprobar={<Boton data-ancla={BTN_APROBAR} texto={cfg.aprobar} presionado={est(BTN_APROBAR).clic} activo={completa && bien} color="#047857" />}
        devolver={<Boton data-ancla={BTN_DEVOLVER} texto={cfg.devolver} presionado={est(BTN_DEVOLVER).clic} activo={completa && !bien} color="#b91c1c" />}
      />
      <div className="flex-1 min-h-0 overflow-hidden px-2 py-1 flex flex-col">
        <div className="shrink-0 grid grid-cols-[13px_16px_minmax(110px,32%)_1fr_auto] gap-x-1.5 text-[9px] uppercase tracking-wider text-slate-400 font-semibold leading-none pb-0.5">
          <span /><span>#</span><span>Ítem</span><span>{cfg.rotuloValor}</span><span>Regla</span>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto">
          {filas.map(({ it, fase: f }, i) => {
            const m = f === 'final';
            const l = f === 'leyendo';
            const e = est(anclaRevB(it.id));
            const estado = m ? (it.ok ? 'ok' : 'fallo') : l ? 'leyendo' : 'pendiente';
            const fondo = e.resaltado ? 'bg-amber-100' : m && !it.ok ? 'bg-red-50' : l ? 'bg-sky-50' : '';
            return (
              <div
                key={it.id}
                data-ancla={anclaRevB(it.id)}
                className={`h-[17px] grid grid-cols-[13px_16px_minmax(110px,32%)_1fr_auto] items-center gap-x-1.5 text-[10.5px] rounded-sm px-0.5 ${fondo} ${l ? 'ring-1 ring-sky-300' : ''}`}
              >
                <Casilla estado={estado} />
                <span className="font-mono text-[9px] text-slate-400">{i + 1}.</span>
                <span className={`truncate ${m && !it.ok ? 'font-semibold text-red-800' : 'text-slate-800'}`}>{it.etiqueta}</span>
                <span className={`truncate ${m ? (it.ok ? 'text-slate-600' : 'text-red-700 font-medium') : 'text-slate-300 italic'}`}>
                  {m ? it.valor : l ? 'leyendo…' : '—'}
                </span>
                <span className="w-7 text-right">{m && it.regla ? <span className={`font-mono text-[9px] ${it.ok ? 'text-slate-400' : 'text-red-700 font-semibold'}`}>{it.regla}</span> : null}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className={`shrink-0 min-h-[34px] flex items-center gap-2 px-2 py-1 border-t ${completa ? (bien ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200') : 'bg-white border-slate-200'}`}>
        {completa ? (
          <div className="min-w-0 flex-1 leading-tight">
            <div className={`text-[11px] font-semibold truncate ${bien ? 'text-emerald-800' : 'text-red-800'}`}>{resumenFinal}</div>
            {bien ? (
              <div className="text-[10px] text-slate-500 truncate">{cfg.textoOk} ({cfg.regla})</div>
            ) : (
              <div className="text-[10px] text-red-700 truncate flex items-center gap-1">
                <span className="truncate">No cumple: {malos.map(f => f.etiqueta).join(' · ')}</span>
                {nombreNovedad && <span className="text-slate-500 truncate">· Novedad «{nombreNovedad}»</span>}
                {malos[0]?.regla && <ChipRegla codigo={malos[0].regla} />}
              </div>
            )}
          </div>
        ) : (
          <span className="flex-1 min-w-0 text-[10.5px] italic text-slate-400 truncate">
            {filas.some(f => f.fase === 'leyendo') ? 'Revisando…' : 'Revisión por iniciar'} {hechos} de {n}
          </span>
        )}
        {sellada && completa && (
          <Sello texto={bien ? 'Conforme' : cfg.selloFallo} color={bien ? '#047857' : '#b91c1c'} className="!text-[10px] !px-2 !py-0 !border-2 shrink-0" />
        )}
      </div>
    </>
  );
}

/* ─── Cruce de entrega: llegada · transportador vs. destinatario · soportes ─── */
function PanelEntrega({ caso, activo, p }: { caso: Caso; activo: PasoPlan | undefined; p: number }) {
  const est = (ancla: string): EstadoAncla => (activo ? estadoAncla(activo, p, ancla) : ESTADO_VACIO);
  const x = caso.datos.cruceEntrega;
  const tray = caso.datos.trayectoria;
  const op = tray[tray.length - 1] ?? tray[0];
  const base = idBase(activo);
  const orden: Record<string, number> = { g2: 0, y1: 1, y2: 2 };
  const actual = base !== undefined ? orden[base] : undefined;

  // Avance de cada sección (0–1): las de pasos anteriores ya están hechas, las de pasos posteriores no empezaron.
  const seccion = (idx: number, ancla: string) => {
    if (actual === undefined) return 1;
    if (idx < actual) return 1;
    if (idx > actual) return 0;
    return avance(activo, p, ancla);
  };
  const aLl = anclaRevB('llegada');
  const aTr = anclaRevB('transportador');
  const aCl = anclaRevB('cliente');
  const aVe = anclaRevB('veredicto');
  const aSo = anclaRevB('soporte');
  const pLl = seccion(0, aLl);
  const pTr = seccion(1, aTr);
  const pCl = seccion(1, aCl);
  const pVe = seccion(1, aVe);
  const pSo = seccion(2, aSo);
  const hechos = [pLl, pTr, pCl, pVe, pSo].filter(v => v >= 1).length;
  const comparando = pVe > 0 && pVe < 1;
  const veredicto = pVe >= 1;

  const tClicDlg = tAccion(activo, BTN_NO_CERRAR, 'clic');
  const tClic = tAccion(activo, BTN_APROBAR, 'clic') ?? tAccion(activo, BTN_DEVOLVER, 'clic');
  const sellada = !activo || (tClic !== undefined && p >= tClic);
  const registrada = !x.coincide && (!activo || actual === 2 || (tClicDlg !== undefined ? p >= tClicDlg : p >= 1));

  const lugar = op.nodoDestino.lugar;
  const receptor = op.receptor?.nombre ?? op.cliente.contacto;
  const hora = op.horaEntrega ? horaMin(op.horaEntrega) : null;
  const textoLlegada = `Llegada a ${lugar}${hora ? ` a las ${hora}` : ''} · confirmada en recepción con ${receptor}`;
  const soporte = caso.datos.cierreAdmin.find(i => i.id === 'soportes')?.valor ?? 'Soporte firmado cargado en el expediente';

  const etiquetas = base === 'g2'
    ? { ap: 'Confirmar llegada', dv: 'Registrar diferencia', apOn: pLl >= 1, dvOn: false }
    : base === 'y2'
      ? { ap: 'Solicitar soporte', dv: 'Registrar diferencia', apOn: true, dvOn: false }
      : { ap: 'Confirmar entrega', dv: 'No cerrar · novedad', apOn: veredicto && x.coincide, dvOn: veredicto && !x.coincide };

  const lados = [
    { ancla: aTr, rotulo: 'Lo que informa el transportador', fuente: x.transportador.fuente, afirma: x.transportador.afirma, progreso: pTr, icono: <Truck className="w-3.5 h-3.5" />, rojo: false },
    { ancla: aCl, rotulo: 'Lo que confirma el destinatario', fuente: x.cliente.fuente, afirma: x.cliente.afirma, progreso: pCl, icono: <UserRound className="w-3.5 h-3.5" />, rojo: veredicto && !x.coincide },
  ];

  return (
    <>
      <Cabecera
        icono={<ArrowLeftRight className="w-3.5 h-3.5" />}
        titulo={`Cruce de entrega · ${x.titulo}`}
        hechos={hechos}
        total={5}
        aprobar={<Boton data-ancla={BTN_APROBAR} texto={etiquetas.ap} presionado={est(BTN_APROBAR).clic} activo={etiquetas.apOn} color="#047857" />}
        devolver={<Boton data-ancla={BTN_DEVOLVER} texto={etiquetas.dv} presionado={est(BTN_DEVOLVER).clic} activo={etiquetas.dvOn} color="#b91c1c" />}
      />
      <div className="flex-1 min-h-0 overflow-hidden p-2 flex flex-col gap-1.5">
        <div
          data-ancla={aLl}
          className={`shrink-0 h-[24px] rounded-md border bg-white px-2 flex items-center gap-1.5 text-[10.5px] ${est(aLl).resaltado ? 'ring-2 ring-amber-300' : ''} ${pLl > 0 && pLl < 1 ? 'border-sky-300' : 'border-slate-300'}`}
        >
          <span style={{ color: ACENTO }}><MapPin className="w-3.5 h-3.5" /></span>
          <span className="truncate flex-1 min-w-0 text-slate-700">
            {pLl <= 0 ? <span className="text-slate-300 italic">Llegada al destino pendiente de registrar…</span> : <TextoEnVivo texto={textoLlegada} progreso={pLl} />}
          </span>
          {pLl >= 1 && <ChipRegla codigo="R16" />}
          <Casilla estado={pLl >= 1 ? 'ok' : pLl > 0 ? 'leyendo' : 'pendiente'} />
        </div>
        <div className="flex-1 min-h-0 grid grid-cols-2 gap-2">
          {lados.map(l => {
            const e = est(l.ancla);
            const leido = l.progreso >= 1;
            const leyendo = l.progreso > 0 && !leido;
            return (
              <div
                key={l.ancla}
                data-ancla={l.ancla}
                className={`min-w-0 min-h-0 rounded-md border bg-white p-1.5 flex flex-col gap-0.5 overflow-hidden ${e.resaltado ? 'ring-2 ring-amber-300' : ''} ${l.rojo ? 'border-red-300' : leyendo ? 'border-sky-300' : 'border-slate-300'}`}
              >
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                  <span className={l.rojo ? 'text-red-600' : ''} style={l.rojo ? undefined : { color: ACENTO }}>{l.icono}</span>
                  <span className="truncate">{l.rotulo}</span>
                  <span className="ml-auto shrink-0 inline-flex">
                    <Casilla estado={leido ? (l.rojo ? 'fallo' : 'ok') : leyendo ? 'leyendo' : 'pendiente'} />
                  </span>
                </div>
                <div className="text-[9.5px] text-slate-400 truncate">{l.fuente}</div>
                <div className={`flex-1 min-h-0 overflow-hidden text-[11px] leading-snug ${l.rojo ? 'text-red-800' : 'text-slate-800'}`}>
                  {l.progreso <= 0 ? <span className="text-slate-300 italic">pendiente de leer…</span> : <TextoEnVivo texto={`«${l.afirma}»`} progreso={l.progreso} />}
                </div>
              </div>
            );
          })}
        </div>
        <div
          data-ancla={aVe}
          className={`shrink-0 min-h-[34px] rounded-md border px-2 py-1 flex items-center gap-2 ${est(aVe).resaltado ? 'ring-2 ring-amber-300' : ''} ${veredicto ? (x.coincide ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200') : 'bg-white border-slate-300'}`}
        >
          <Casilla estado={veredicto ? (x.coincide ? 'ok' : 'fallo') : comparando ? 'leyendo' : 'pendiente'} />
          {veredicto ? (
            <div className="min-w-0 flex-1 leading-tight">
              <div className={`text-[11px] font-semibold truncate ${x.coincide ? 'text-emerald-800' : 'text-red-800'}`}>
                {x.coincide ? 'Coincide' : 'Difiere'} · {x.detalle}
              </div>
              <div className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                <ChipRegla codigo="R23" />
                <span className="truncate">{registrada ? 'Novedad generada · la operación no se cierra hasta tener evidencia' : x.coincide ? 'Lo informado y lo confirmado dicen lo mismo' : 'Pendiente de generar la novedad'}</span>
              </div>
            </div>
          ) : (
            <span className="flex-1 min-w-0 text-[10.5px] italic text-slate-400 truncate">{comparando ? 'Comparando lo informado con lo confirmado…' : 'Veredicto: coincide o difiere'}</span>
          )}
          {sellada && veredicto && actual === 1 && (
            <Sello texto={x.coincide ? 'Coincide' : 'Difiere'} color={x.coincide ? '#047857' : '#b91c1c'} className="!text-[10px] !px-2 !py-0 !border-2 shrink-0" />
          )}
        </div>
        <div
          data-ancla={aSo}
          className={`shrink-0 h-[24px] rounded-md border bg-white px-2 flex items-center gap-1.5 text-[10.5px] ${est(aSo).resaltado ? 'ring-2 ring-amber-300' : ''} ${pSo > 0 && pSo < 1 ? 'border-sky-300' : 'border-slate-300'}`}
        >
          <span style={{ color: ACENTO }}><FileCheck className="w-3.5 h-3.5" /></span>
          <span className="font-semibold text-slate-600 shrink-0">Soportes de entrega</span>
          <span className={`truncate flex-1 min-w-0 ${pSo >= 1 ? 'text-slate-700' : 'text-slate-400 italic'}`}>
            {pSo >= 1 ? `${soporte} · EntregaConfirmada` : pSo > 0 ? 'Solicitado al transportador · esperando la carga…' : 'Pendiente de solicitar'}
          </span>
          <Casilla estado={pSo >= 1 ? 'ok' : pSo > 0 ? 'leyendo' : 'pendiente'} />
        </div>
      </div>
    </>
  );
}

/* ─── Ventana ─── */
function RevB(props: PropsVentana) {
  const { caso, vista, paso, progreso, velocidad, actor, medir, relojSim } = props;
  const p = progresoEfectivo(progreso, velocidad);
  const humano = paso?.humano ?? (actor === 'humano' ? caso.datos.decision?.humano : undefined);
  const c = CROMO.revision;
  const base = idBase(paso);

  const idsDe = (m: Record<string, PasoLista>) => (base !== undefined && base in m ? paso : undefined);
  const idsEntrega = base === 'g2' || base === 'y1' || base === 'y2' ? paso : undefined;

  let cuerpo: ReactNode;
  if (vista === 'revision.entrega') {
    cuerpo = <PanelEntrega caso={caso} activo={idsEntrega} p={p} />;
  } else if (vista === 'revision.cierre') {
    cuerpo = (
      <PanelChequeo
        activo={idsDe(PASOS_CIERRE)}
        p={p}
        cfg={{
          titulo: 'Cierre administrativo del servicio',
          icono: <FileCheck className="w-3.5 h-3.5" />,
          items: caso.datos.cierreAdmin,
          pasos: PASOS_CIERRE,
          rotuloValor: 'Lo que consta en el expediente',
          aprobar: 'Conforme',
          devolver: 'Retener cierre',
          selloFallo: 'Cierre retenido',
          btnDialogo: BTN_RETENER,
          textoOk: 'Condiciones del cierre cumplidas',
          regla: 'R25',
        }}
      />
    );
  } else {
    cuerpo = (
      <PanelChequeo
        activo={idsDe(PASOS_CARGUE)}
        p={p}
        cfg={{
          titulo: `Control de cargue y despacho · ${caso.datos.trayectoria[0].id}`,
          icono: <PackageCheck className="w-3.5 h-3.5" />,
          items: caso.datos.cargue,
          pasos: PASOS_CARGUE,
          rotuloValor: 'Lo que se observa en el punto de cargue',
          aprobar: 'Conforme',
          devolver: 'Registrar novedad',
          selloFallo: 'Novedad registrada',
          textoOk: 'Cargue y despacho sin novedad',
          regla: 'R16 · R17',
        }}
      />
    );
  }

  return (
    <VentanaSistema
      ventana="revision"
      vista={vista}
      actor={actor}
      humano={humano}
      paso={paso}
      progreso={p}
      sesion={caso.datos.sesion}
      relojSim={relojSim}
      medir={medir}
      color={humano?.color}
    >
      <div className="absolute inset-0 flex flex-col overflow-hidden" style={{ backgroundColor: c.fondo ?? FONDO }}>
        {cuerpo}
      </div>
    </VentanaSistema>
  );
}

export default memo(RevB);
