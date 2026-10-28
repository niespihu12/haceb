// Ventana «Revisiones del proceso» (E4a): revision.datos, revision.documentos y revision.cruzada.
// Son listas de chequeo y cruces: cada ítem se revisa uno por uno (foco en la fila, check/cruz, barra de progreso)
// y a progreso = 1 la pantalla muestra el resultado final. Todo es función pura del progreso del paso.
import { KM_VEHICULO } from '@/data/mockData';
import { memo, type ReactNode } from 'react';
import { ArrowLeftRight, FileCheck, ListChecks, Truck, UserRound } from 'lucide-react';
import type { Caso, ItemRevision, PasoPlan, Vista } from '@/types/agentes';
import { PLANTILLA_EXCEPCION } from '@/data/mockData';
import { miles } from '@/data/agentesUtil';
import { estadoAncla, progresoEfectivo, type EstadoAncla } from '@/components/agentes/guion';
import { BarraProgreso, ChipRegla, Sello, Spinner, TextoEnVivo } from '@/components/agentes/ui';
import type { PropsVentana } from '../../tipos';
import { CROMO } from '../../cromo';
import VentanaSistema from '../../VentanaSistema';

const ACENTO = CROMO.revision.barra;
const FONDO = CROMO.revision.fondo;
const ESTADO_VACIO: EstadoAncla = { foco: false, tecleo: undefined, pegado: false, resaltado: false, clic: false, mascara: false };
const BTN_DIALOGO_DIFERENCIA = 'dlg.btn.registrar-la-diferencia-y-pedir-evidencia';

/** Pasos cuyo guion trabaja en cada vista (los demás pasos dejan ver el estado final de los datos). */
const PASOS_DE_VISTA: Record<string, string[]> = {
  'revision.datos': ['v1', 'v2'],
  'revision.documentos': ['s4'],
  'revision.cruzada': ['o2'],
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** Primer instante (0–1) en que el guion hace `tipo` sobre `ancla`. */
function tAccion(paso: PasoPlan | undefined, ancla: string, tipo: string): number | undefined {
  return (paso?.ui ?? []).find(a => a.ancla === ancla && a.tipo === tipo)?.t;
}

const anclaItem = (id: string) => `revision.item.${id}`;

/* ─── Piezas ─── */
function Boton({ 'data-ancla': ancla, texto, presionado, activo, color, icono }: {
  'data-ancla': string; texto: string; presionado: boolean; activo: boolean; color: string; icono?: ReactNode;
}) {
  return (
    <span
      data-ancla={ancla}
      className={`h-[20px] px-2 inline-flex items-center gap-1 rounded-sm border text-[10.5px] font-medium select-none whitespace-nowrap ${activo ? 'text-white' : 'bg-slate-100 text-slate-400 border-slate-300'} ${presionado ? 'shadow-[inset_0_2px_3px_rgba(0,0,0,0.4)] translate-y-[1px]' : 'shadow-sm'}`}
      style={activo ? { backgroundColor: color, borderColor: color, filter: presionado ? 'brightness(0.85)' : undefined } : undefined}
    >
      {icono}
      {texto}
    </span>
  );
}

function Cabecera({ icono, titulo, hechos, total, aprobar, devolver, extra }: {
  icono: ReactNode; titulo: string; hechos: number; total: number; aprobar: ReactNode; devolver: ReactNode; extra?: ReactNode;
}) {
  return (
    <div className="shrink-0 h-[26px] flex items-center gap-2 px-2 border-b border-slate-300 bg-white whitespace-nowrap overflow-hidden">
      <span className="shrink-0" style={{ color: ACENTO }}>{icono}</span>
      <span className="text-[11px] font-semibold text-slate-800 truncate">{titulo}</span>
      {extra}
      <span className="ml-auto flex items-center gap-2 shrink-0">
        <span className="w-16"><BarraProgreso valor={total ? hechos / total : 0} color={ACENTO} /></span>
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

/* ─── Listas de chequeo: datos mínimos y documentos ─── */
interface PropsLista {
  caso: Caso;
  vista: Vista;
  activo: PasoPlan | undefined;
  p: number;
  titulo: string;
  icono: ReactNode;
  items: ItemRevision[];
  tipo: 'datos' | 'documentos';
}

function PanelLista({ caso, activo, p, titulo, icono, items, tipo }: PropsLista) {
  const est = (ancla: string): EstadoAncla => (activo ? estadoAncla(activo, p, ancla) : ESTADO_VACIO);
  const n = items.length;
  const base = activo?.id.replace(/_\d+$/, '');

  const marcada = (it: ItemRevision) => {
    const t = tAccion(activo, anclaItem(it.id), 'resaltar');
    return !activo || t === undefined || p >= t;
  };
  const leyendo = (it: ItemRevision) => {
    const t = tAccion(activo, anclaItem(it.id), 'mover');
    return !marcada(it) && t !== undefined && p >= t;
  };
  const hechos = items.filter(marcada).length;
  const fallan = items.filter(i => !i.ok);
  const completa = hechos === n;
  const bien = fallan.length === 0;

  const tClicAprobar = tAccion(activo, 'revision.btn.aprobar', 'clic');
  const tClicDevolver = tAccion(activo, 'revision.btn.devolver', 'clic');
  const tClic = tClicAprobar ?? tClicDevolver;
  const sellada = !activo || (tClic !== undefined && p >= tClic);

  // Coherencia peso · volumen · vehículo (paso v2) — solo en la vista de datos.
  const op = caso.datos.trayectoria[0];
  const pesoOk = items.find(i => i.id === 'peso')?.ok ?? true;
  const coherenciaTexto = pesoOk
    ? `${miles(op.mercancia.pesoKg)} kg y ${op.mercancia.volumenM3.toString().replace('.', ',')} m³ dentro de la capacidad de ${op.vehiculoRequerido} (${miles(KM_VEHICULO[op.vehiculoRequerido].kg)} kg · ${KM_VEHICULO[op.vehiculoRequerido].m3} m³)`
    : 'No se puede verificar: falta el peso';
  const tCohMover = tAccion(activo, anclaItem('coherencia'), 'mover');
  const tCohFin = tAccion(activo, anclaItem('coherencia'), 'resaltar');
  const cohVisible = !activo || base === 'v2' ? (!activo || tCohFin === undefined || p >= tCohFin) : false;
  const cohLeyendo = base === 'v2' && !cohVisible && tCohMover !== undefined && p >= tCohMover;
  const cohResaltada = est(anclaItem('coherencia')).resaltado;

  const nombreNovedad = PLANTILLA_EXCEPCION.Datos_incompletos.nombre;
  const titular = tipo === 'datos'
    ? (bien ? `${n} de ${n} datos presentes` : (base === 'v1' && activo?.resultado ? activo.resultado : `${n - fallan.length} de ${n} datos presentes`))
    : (bien ? `${n} de ${n} documentos vigentes · DocumentosValidados` : `${n - fallan.length} de ${n} documentos vigentes`);

  const accionAprobar = bien;
  const accionDevolver = !bien;

  return (
    <>
      <Cabecera
        icono={icono}
        titulo={titulo}
        hechos={hechos}
        total={n}
        aprobar={<Boton data-ancla="revision.btn.aprobar" texto="Aprobar" presionado={est('revision.btn.aprobar').clic} activo={completa && accionAprobar} color="#047857" />}
        devolver={<Boton data-ancla="revision.btn.devolver" texto="Devolver" presionado={est('revision.btn.devolver').clic} activo={completa && accionDevolver} color="#b91c1c" />}
      />
      <div className="flex-1 min-h-0 overflow-hidden px-2 py-1 flex flex-col">
        <div className="shrink-0 grid grid-cols-[13px_16px_minmax(110px,32%)_1fr_auto] gap-x-1.5 text-[9px] uppercase tracking-wider text-slate-400 font-semibold leading-none pb-0.5">
          <span /><span>#</span><span>{tipo === 'datos' ? 'Dato mínimo' : 'Documento'}</span><span>{tipo === 'datos' ? 'Lo que trae la solicitud' : 'Estado'}</span><span>Regla</span>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto">
          {items.map((it, i) => {
            const m = marcada(it);
            const l = leyendo(it);
            const e = est(anclaItem(it.id));
            const estado = m ? (it.ok ? 'ok' : 'fallo') : l ? 'leyendo' : 'pendiente';
            const fondo = e.resaltado ? 'bg-amber-100' : m && !it.ok ? 'bg-red-50' : l ? 'bg-sky-50' : '';
            return (
              <div
                key={it.id}
                data-ancla={`revision.item.${it.id}`}
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
          {tipo === 'datos' && (
            <div
              data-ancla="revision.item.coherencia"
              className={`mt-0.5 h-[17px] grid grid-cols-[13px_16px_minmax(110px,32%)_1fr_auto] items-center gap-x-1.5 text-[10.5px] rounded-sm px-0.5 border-t border-dashed border-slate-300 ${cohResaltada ? 'bg-amber-100' : cohLeyendo ? 'bg-sky-50 ring-1 ring-sky-300' : ''}`}
            >
              <Casilla estado={cohVisible ? (pesoOk ? 'ok' : 'fallo') : cohLeyendo ? 'leyendo' : 'pendiente'} />
              <span className="font-mono text-[9px] text-slate-400">+</span>
              <span className="truncate text-slate-800">Coherencia peso · volumen · vehículo</span>
              <span className={`truncate ${cohVisible ? (pesoOk ? 'text-slate-600' : 'text-red-700 font-medium') : 'text-slate-300 italic'}`}>
                {cohVisible ? (activo && base === 'v2' && activo.resultado ? activo.resultado : coherenciaTexto) : cohLeyendo ? 'comparando…' : 'pendiente'}
              </span>
              <span className="w-7 text-right font-mono text-[9px] text-slate-400">{cohVisible ? 'R01' : ''}</span>
            </div>
          )}
        </div>
      </div>
      <div className={`shrink-0 min-h-[34px] flex items-center gap-2 px-2 py-1 border-t ${completa ? (bien ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200') : 'bg-white border-slate-200'}`}>
        {completa ? (
          <div className="min-w-0 flex-1 leading-tight">
            <div className={`text-[11px] font-semibold truncate ${bien ? 'text-emerald-800' : 'text-red-800'}`}>{titular}</div>
            {!bien && tipo === 'datos' && (
              <div className="text-[10px] text-red-700 truncate flex items-center gap-1">
                <span>Falta: {fallan.map(f => f.etiqueta).join(' · ')}</span>
                <span className="text-slate-500">· Novedad «{nombreNovedad}»</span>
                <ChipRegla codigo="R01" />
                <ChipRegla codigo="R02" />
              </div>
            )}
            {!bien && tipo === 'documentos' && (
              <div className="text-[10px] text-red-700 truncate">No vigente: {fallan.map(f => f.etiqueta).join(' · ')}</div>
            )}
            {bien && <div className="text-[10px] text-slate-500 truncate">{tipo === 'datos' ? 'Los 9 datos mínimos están completos (R01)' : 'Vehículo y conductor con documentación al día (R10)'}</div>}
          </div>
        ) : (
          <span className="flex-1 min-w-0 text-[10.5px] italic text-slate-400 truncate">{hechos === 0 && !leyendoAlguno(items, leyendo) ? 'Revisión por iniciar' : `Revisando ${tipo === 'datos' ? 'los datos mínimos' : 'los documentos'}… ${hechos} de ${n}`}</span>
        )}
        {sellada && completa && (
          <Sello texto={bien ? 'Validado' : 'Devuelto'} color={bien ? '#047857' : '#b91c1c'} className="!text-[10px] !px-2 !py-0 !border-2 shrink-0" />
        )}
      </div>
    </>
  );
}

function leyendoAlguno(items: ItemRevision[], leyendo: (it: ItemRevision) => boolean): boolean {
  return items.some(leyendo);
}

/* ─── Validación cruzada de llegada ─── */
function PanelCruce({ caso, activo, p }: { caso: Caso; activo: PasoPlan | undefined; p: number }) {
  const est = (ancla: string): EstadoAncla => (activo ? estadoAncla(activo, p, ancla) : ESTADO_VACIO);
  const x = caso.datos.cruceLlegada;

  const prog = (ancla: string) => {
    if (!activo) return 1;
    const t0 = tAccion(activo, ancla, 'mover');
    const t1 = tAccion(activo, ancla, 'resaltar');
    if (t0 === undefined || t1 === undefined) return 1;
    return t1 > t0 ? clamp01((p - t0) / (t1 - t0)) : (p >= t1 ? 1 : 0);
  };
  const aTr = anclaItem('transportador');
  const aCl = anclaItem('cliente');
  const aVe = anclaItem('veredicto');
  const pTr = prog(aTr);
  const pCl = prog(aCl);
  const pVe = prog(aVe);
  const hechos = (pTr >= 1 ? 1 : 0) + (pCl >= 1 ? 1 : 0) + (pVe >= 1 ? 1 : 0);
  const comparando = pVe > 0 && pVe < 1;
  const veredicto = pVe >= 1;

  const tClicAprobar = tAccion(activo, 'revision.btn.aprobar', 'clic');
  const tClicDevolver = tAccion(activo, 'revision.btn.devolver', 'clic');
  const tClicDlg = tAccion(activo, BTN_DIALOGO_DIFERENCIA, 'clic');
  const tClic = tClicAprobar ?? tClicDevolver;
  const sellada = !activo || (tClic !== undefined && p >= tClic);
  const registrada = !x.coincide && (!activo || (tClicDlg !== undefined ? p >= tClicDlg : p >= 1));

  const lados = [
    { ancla: aTr, rotulo: 'Lo que reporta el transportador', fuente: x.transportador.fuente, afirma: x.transportador.afirma, progreso: pTr, icono: <Truck className="w-3.5 h-3.5" />, rojo: false },
    { ancla: aCl, rotulo: 'Lo que observa el cliente', fuente: x.cliente.fuente, afirma: x.cliente.afirma, progreso: pCl, icono: <UserRound className="w-3.5 h-3.5" />, rojo: veredicto && !x.coincide },
  ];

  return (
    <>
      <Cabecera
        icono={<ArrowLeftRight className="w-3.5 h-3.5" />}
        titulo={`Validación cruzada de llegada · ${x.titulo}`}
        hechos={hechos}
        total={3}
        aprobar={<Boton data-ancla="revision.btn.aprobar" texto="Confirmar llegada" presionado={est('revision.btn.aprobar').clic} activo={veredicto && x.coincide} color="#047857" />}
        devolver={<Boton data-ancla="revision.btn.devolver" texto="Registrar diferencia" presionado={est('revision.btn.devolver').clic} activo={veredicto && !x.coincide} color="#b91c1c" />}
      />
      <div className="flex-1 min-h-0 overflow-hidden p-2 flex flex-col gap-1.5">
        <div className="flex-1 min-h-0 grid grid-cols-2 gap-2">
          {lados.map(l => {
            const e = est(l.ancla);
            const leido = l.progreso >= 1;
            const leyendo = l.progreso > 0 && !leido;
            return (
              <div
                key={l.ancla}
                data-ancla={l.ancla}
                className={`min-w-0 min-h-0 rounded-md border bg-white p-1.5 flex flex-col gap-1 overflow-hidden ${e.resaltado ? 'ring-2 ring-amber-300' : ''} ${l.rojo ? 'border-red-300' : leyendo ? 'border-sky-300' : 'border-slate-300'}`}
              >
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                  <span className={l.rojo ? 'text-red-600' : ''} style={l.rojo ? undefined : { color: ACENTO }}>{l.icono}</span>
                  <span className="truncate">{l.rotulo}</span>
                  <span className="ml-auto shrink-0 inline-flex">
                    <Casilla estado={leido ? (l.rojo ? 'fallo' : 'ok') : leyendo ? 'leyendo' : 'pendiente'} />
                  </span>
                </div>
                <div className="text-[9.5px] text-slate-400 truncate">{l.fuente}</div>
                <div className={`flex-1 min-h-0 overflow-hidden text-[11.5px] leading-snug ${l.rojo ? 'text-red-800' : 'text-slate-800'}`}>
                  {l.progreso <= 0 ? <span className="text-slate-300 italic">pendiente de leer…</span> : <TextoEnVivo texto={`«${l.afirma}»`} progreso={l.progreso} />}
                </div>
              </div>
            );
          })}
        </div>
        <div
          data-ancla="revision.item.veredicto"
          className={`shrink-0 min-h-[36px] rounded-md border px-2 py-1 flex items-center gap-2 ${est(aVe).resaltado ? 'ring-2 ring-amber-300' : ''} ${veredicto ? (x.coincide ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200') : 'bg-white border-slate-300'}`}
        >
          <Casilla estado={veredicto ? (x.coincide ? 'ok' : 'fallo') : comparando ? 'leyendo' : 'pendiente'} />
          {veredicto ? (
            <div className="min-w-0 flex-1 leading-tight">
              <div className={`text-[11px] font-semibold truncate ${x.coincide ? 'text-emerald-800' : 'text-red-800'}`}>
                {x.coincide ? 'Coincide' : 'Difiere'} · {x.detalle}
              </div>
              <div className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                <ChipRegla codigo="R15" />
                <span className="truncate">{registrada ? 'Diferencia registrada · evidencia solicitada al transportador' : x.coincide ? 'Lo reportado y lo observado dicen lo mismo' : 'Pendiente de registrar la diferencia'}</span>
              </div>
            </div>
          ) : (
            <span className="flex-1 min-w-0 text-[10.5px] italic text-slate-400 truncate">{comparando ? 'Comparando lo reportado con lo observado…' : 'Veredicto: coincide o difiere'}</span>
          )}
          {sellada && veredicto && (
            <Sello texto={x.coincide ? 'Coincide' : 'Difiere'} color={x.coincide ? '#047857' : '#b91c1c'} className="!text-[10px] !px-2 !py-0 !border-2 shrink-0" />
          )}
        </div>
      </div>
    </>
  );
}

/* ─── Ventana ─── */
function RevA(props: PropsVentana) {
  const { caso, vista, paso, progreso, velocidad, actor, medir, relojSim } = props;
  const p = progresoEfectivo(progreso, velocidad);
  const humano = paso?.humano ?? (actor === 'humano' ? caso.datos.decision?.humano : undefined);
  const c = CROMO.revision;
  const ids = PASOS_DE_VISTA[vista] ?? PASOS_DE_VISTA['revision.datos'];
  const base = paso?.id.replace(/_\d+$/, '');
  const activo = paso && base && ids.includes(base) ? paso : undefined;

  let cuerpo: ReactNode;
  if (vista === 'revision.documentos') {
    cuerpo = <PanelLista caso={caso} vista={vista} activo={activo} p={p} tipo="documentos" titulo="Documentos del vehículo y del conductor" icono={<FileCheck className="w-3.5 h-3.5" />} items={caso.datos.documentos} />;
  } else if (vista === 'revision.cruzada') {
    cuerpo = <PanelCruce caso={caso} activo={activo} p={p} />;
  } else {
    cuerpo = <PanelLista caso={caso} vista={vista} activo={activo} p={p} tipo="datos" titulo={`Datos mínimos de la solicitud · ${caso.datos.trayectoria[0].id}`} icono={<ListChecks className="w-3.5 h-3.5" />} items={caso.datos.datosMinimos} />;
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

export default memo(RevA);
