import { memo, useMemo } from 'react';
import { Check, CircleAlert, FileSignature, ListChecks, MapPin, Truck } from 'lucide-react';
import type { Caso, DatosCaso, PasoPlan } from '@/types/agentes';
import { AGENTES_MAP } from '@/data/agentesCatalogo';
import {
  ANCLA_PROV, T_FILTRAR, T_PRESEL, T_PRESEL_CLIC, T_PUNTAJE, T_PUNTUAR, T_VEH, T_ZONA, T_COMPARA,
  anclaFilaBase, modeloBase, modeloNeg, pesos, type FilaBase, type ModeloBase,
} from '@/data/guiones/proveedores';
import { estadoAncla, progresoEfectivo } from '@/components/agentes/guion';
import { infoPaso } from '@/components/agentes/helpers';
import { ChipRegla } from '@/components/agentes/ui';
import type { PropsVentana } from '../tipos';
import VentanaSistema from '../VentanaSistema';

const TEAL = '#0f766e';
const base = (id?: string) => (id ?? '').replace(/_\d+$/, '');
const hecho = (caso: Caso, id: string) => {
  const e = infoPaso(caso, id).estado;
  return e === 'hecho' || e === 'fallo';
};

/* ═══════════════ Vista 1 · Base de proveedores ═══════════════ */

function removida(f: FilaBase, a: number): boolean {
  if (f.descarte === '') return false;
  if (a >= 2) return true;
  if (a < 1) return false;
  const [i0, i1] = f.descarte === 'zona' ? T_ZONA : T_VEH;
  const t = i0 + ((i1 - i0) * f.ordGrupo) / Math.max(1, f.nGrupo);
  return a - 1 >= t;
}

function puntuada(f: FilaBase, a: number, m: ModeloBase): boolean {
  if (f.descarte !== '') return false;
  if (a >= 3) return true;
  if (a < 2) return false;
  const [i0, i1] = T_PUNTAJE;
  return a - 2 >= i0 + ((i1 - i0) * f.ordPunt) / Math.max(1, m.quedan);
}

function Chip({ texto, clase }: { texto: string; clase: string }) {
  return <span className={`w-[88px] shrink-0 h-[14px] inline-flex items-center justify-center rounded border text-[8.5px] truncate px-0.5 ${clase}`}>{texto}</span>;
}

function FilaProveedor({ f, m, a, sinCand, paso, p }: { f: FilaBase; m: ModeloBase; a: number; sinCand: boolean; paso?: PasoPlan; p: number }) {
  const fuera = removida(f, a);
  const punt = puntuada(f, a, m);
  const presel = a >= 3 + T_PRESEL;
  const marcada = presel && f.candidata && !sinCand;
  const e = estadoAncla(paso, p, anclaFilaBase(f.id));
  let chip = <Chip texto="En lista" clase="bg-slate-50 border-slate-200 text-slate-500" />;
  if (a < 1) chip = <Chip texto="—" clase="bg-white border-transparent text-slate-300" />;
  else if (fuera) chip = <Chip texto={f.descarte === 'zona' ? `Fuera de zona · ${f.dist} km` : `Sin ${m.vehiculo}`} clase="bg-slate-100 border-slate-200 text-slate-400" />;
  else if (presel) {
    chip = sinCand
      ? <Chip texto="Sin disponibilidad" clase="bg-red-50 border-red-200 text-red-700" />
      : f.candidata
        ? <Chip texto="Preseleccionado" clase="bg-teal-600 border-teal-700 text-white font-semibold" />
        : <Chip texto="No preseleccionado" clase="bg-slate-50 border-slate-200 text-slate-400" />;
  } else if (punt) chip = <Chip texto="Puntuado" clase="bg-sky-50 border-sky-200 text-sky-700" />;
  const extra = f.flota.length - 1;
  return (
    <div
      data-ancla={`proveedores.fila.${f.id.toLowerCase()}`}
      className={`h-[19px] shrink-0 flex items-center gap-1.5 px-1.5 border-b border-slate-100 border-l-2 text-[9.5px] ${fuera ? 'opacity-45' : ''}`}
      style={{
        borderLeftColor: marcada ? TEAL : 'transparent',
        backgroundColor: e.resaltado ? '#fef3c7' : marcada ? '#ccfbf1' : undefined,
      }}
    >
      <span className="w-[32px] shrink-0 font-mono text-slate-500">{f.id}</span>
      <span className={`flex-1 min-w-0 truncate ${fuera ? 'line-through text-slate-500' : marcada ? 'font-semibold text-slate-900' : 'text-slate-800'}`}>{f.nombre}</span>
      <span className="w-[58px] shrink-0 truncate text-slate-600">{f.base}</span>
      <span className={`w-[72px] shrink-0 truncate ${f.tieneVeh ? 'text-teal-700 font-medium' : 'text-slate-400'}`}>
        {f.tieneVeh ? `✓ ${m.vehiculo}` : f.flota[0]}
        {extra > 0 && <span className="text-slate-400 font-normal"> +{extra}</span>}
      </span>
      <span className="w-[46px] shrink-0 font-mono text-slate-600">{f.placa}</span>
      <span className="w-[22px] shrink-0 text-right font-mono tabular-nums text-slate-700">{f.cumplimiento}</span>
      <span className={`w-[104px] shrink-0 truncate ${f.candidata && !fuera ? 'text-slate-700' : 'text-slate-400'}`}>
        {f.rutas.map((r, i) => (
          <span key={`${r}-${i}`} className={i === 0 && f.candidata ? 'font-semibold text-teal-700' : ''}>{i > 0 ? ' · ' : ''}{r}</span>
        ))}
      </span>
      <span className="w-[44px] shrink-0 flex items-center gap-1">
        {punt ? (
          <>
            <span className="w-[16px] h-[4px] rounded bg-slate-200 overflow-hidden"><span className="block h-full" style={{ width: `${f.puntaje}%`, backgroundColor: f.candidata ? TEAL : '#94a3b8' }} /></span>
            <span className="font-mono tabular-nums text-slate-700">{f.puntaje}</span>
          </>
        ) : <span className="text-slate-300">—</span>}
      </span>
      {chip}
    </div>
  );
}

function Boton({ texto, estado, clic }: { texto: string; estado: 'pend' | 'activo' | 'hecho'; clic: boolean }) {
  const clase = estado === 'activo' ? 'text-white border-transparent' : estado === 'hecho' ? 'bg-white text-teal-700 border-teal-300' : 'bg-slate-100 text-slate-400 border-slate-200';
  return (
    <button
      type="button"
      tabIndex={-1}
      className={`h-[18px] px-1.5 rounded border text-[9px] font-medium inline-flex items-center gap-0.5 shrink-0 ${clase} ${clic ? 'brightness-90' : ''}`}
      style={estado === 'activo' ? { backgroundColor: clic ? '#134e4a' : TEAL } : undefined}
    >
      {estado === 'hecho' && <Check className="w-2.5 h-2.5" />}
      {texto}
    </button>
  );
}

function Filtro({ icono, etiqueta, valor, aplicado, e }: { icono: 'mapa' | 'camion'; etiqueta: string; valor: string; aplicado: boolean; e: { foco: boolean; resaltado: boolean } }) {
  const Icono = icono === 'mapa' ? MapPin : Truck;
  return (
    <span className="inline-flex items-center gap-1 min-w-0 text-[9px] text-slate-500">
      <Icono className="w-3 h-3 shrink-0 text-slate-400" />
      <span className="shrink-0">{etiqueta}</span>
      <span
        className={`h-[17px] px-1.5 inline-flex items-center gap-1 rounded border bg-white text-[9.5px] text-slate-800 truncate ${e.foco ? 'border-2 border-teal-600' : 'border-slate-300'} ${e.resaltado ? '!bg-amber-100' : ''}`}
      >
        <span className="truncate">{valor}</span>
        {aplicado && <Check className="w-2.5 h-2.5 shrink-0 text-teal-600" />}
      </span>
    </span>
  );
}

function Criterio({ texto, a, resaltado }: { texto: string; a: number; resaltado: boolean }) {
  const hecho3 = a >= 3;
  return (
    <span
      className={`h-[14px] px-1.5 inline-flex items-center gap-0.5 rounded border text-[8.5px] shrink-0 ${resaltado ? 'bg-amber-100 border-amber-300 text-amber-800' : hecho3 ? 'bg-teal-50 border-teal-200 text-teal-700' : 'bg-white border-slate-200 text-slate-500'}`}
    >
      {hecho3 && <Check className="w-2 h-2" />}
      {texto}
    </span>
  );
}

function VistaBase({ caso, paso, p }: { caso: Caso; paso?: PasoPlan; p: number }) {
  const d = caso.datos;
  const m = useMemo(() => modeloBase(d), [d]);
  const idb = base(paso?.id);
  const segunda = (!!paso && /_2$/.test(paso.id)) || infoPaso(caso, 'b1_2').estado !== 'pendiente';
  const sinCand = d.excepcion?.tipo === 'Sin_transportador' && !segunda;
  const suf = segunda ? '_2' : '';
  const k = ['b1', 'b2', 'b3', 'b4'].indexOf(idb);
  let a = 0;
  if (k >= 0 && paso) a = k + p;
  else {
    for (let i = 1; i <= 4; i++) if (hecho(caso, `b${i}${suf}`)) a = i;
    if (caso.estado === 'terminada') a = 4;
  }
  const cargando = idb === 'b1' && p < 0.35;
  const e = (an: string) => estadoAncla(paso, p, an);
  const eUb = e(ANCLA_PROV.ubicacion);
  const eVe = e(ANCLA_PROV.vehiculo);
  const eFi = e(ANCLA_PROV.btnFiltrar);
  const ePu = e(ANCLA_PROV.btnPuntuar);
  const ePr = e(ANCLA_PROV.btnPreseleccionar);
  const eCo = e(ANCLA_PROV.colCompat);
  const eAv = e(ANCLA_PROV.aviso);

  const kept = m.filas.filter(f => f.descarte === '');
  let filas = m.filas;
  if (a >= 2) {
    const orden = a >= 3 + T_PRESEL && !sinCand
      ? [...kept].sort((x, y) => Number(y.candidata) - Number(x.candidata) || y.puntaje - x.puntaje || x.id.localeCompare(y.id))
      : kept;
    filas = [...orden, ...m.filas.filter(f => f.descarte !== '')];
  }
  const visibles = m.filas.filter(f => !removida(f, a)).length;
  const presel = a >= 3 + T_PRESEL;
  const nCand = m.candidatas.length;

  const aplicadoUb = a >= 1 + T_FILTRAR;
  const filtrar: 'pend' | 'activo' | 'hecho' = a >= 1 + T_FILTRAR ? 'hecho' : a >= 1 ? 'activo' : 'pend';
  const puntuar: 'pend' | 'activo' | 'hecho' = a >= 3 ? 'hecho' : a >= 2 + T_PUNTUAR ? 'activo' : a >= 2 ? 'activo' : 'pend';
  const presBtn: 'pend' | 'activo' | 'hecho' = a >= 3 + T_PRESEL_CLIC ? 'hecho' : a >= 3 ? 'activo' : 'pend';

  let aviso = <span className="text-slate-500">{m.total} transportadores en la base · ruta {m.ruta}</span>;
  if (a >= 4 || presel) {
    aviso = sinCand
      ? <span className="text-red-700 font-semibold inline-flex items-center gap-1"><CircleAlert className="w-3 h-3" /> 0 candidatos · sin vehículo disponible para {m.ruta} · novedad Sin_transportador</span>
      : <span className="text-teal-800 font-semibold inline-flex items-center gap-1"><Check className="w-3 h-3" /> {nCand} candidatos preseleccionados · TransportadoresPreseleccionados</span>;
  } else if (a >= 2) aviso = <span className="text-slate-600">{m.quedan} transportadores con {m.vehiculo} · puntuando por R05</span>;
  else if (a >= 1 + T_FILTRAR) aviso = <span className="text-slate-600">{m.quedan} transportadores con {m.vehiculo} en la zona de {m.origen}</span>;

  return (
    <div className="absolute inset-0 flex flex-col text-slate-800 bg-white">
      <div className="h-[26px] shrink-0 flex items-center gap-2 px-2 border-b border-slate-200 bg-slate-50 whitespace-nowrap overflow-hidden">
        <span data-ancla="proveedores.campo.ubicacion" className="inline-flex min-w-0"><Filtro icono="mapa" etiqueta="Ubicación" valor={m.ruta} aplicado={aplicadoUb} e={eUb} /></span>
        <span data-ancla="proveedores.campo.vehiculo" className="inline-flex min-w-0"><Filtro icono="camion" etiqueta="Vehículo" valor={m.vehiculo} aplicado={aplicadoUb} e={eVe} /></span>
        <span data-ancla="proveedores.btn.filtrar" className="inline-flex shrink-0"><Boton texto="Filtrar" estado={filtrar} clic={eFi.clic} /></span>
        <span data-ancla="proveedores.btn.puntuar" className="inline-flex shrink-0"><Boton texto="Puntuar" estado={puntuar} clic={ePu.clic} /></span>
        <span data-ancla="proveedores.btn.preseleccionar" className="inline-flex shrink-0"><Boton texto="Preseleccionar" estado={presBtn} clic={ePr.clic} /></span>
        <span className="ml-auto text-[9px] text-slate-500 shrink-0 tabular-nums">{cargando ? 'Cargando…' : `${visibles} de ${m.total}`}</span>
      </div>
      <div className="h-[18px] shrink-0 flex items-center gap-1 px-2 border-b border-slate-100 bg-white whitespace-nowrap overflow-hidden">
        <ListChecks className="w-3 h-3 text-slate-400 shrink-0" />
        <span className="text-[8.5px] uppercase tracking-wide text-slate-400 shrink-0">Puntaje</span>
        <span data-ancla="proveedores.criterio.capacidad" className="inline-flex shrink-0"><Criterio texto="Capacidad" a={a} resaltado={e(ANCLA_PROV.critCapacidad).resaltado} /></span>
        <span data-ancla="proveedores.criterio.rutas" className="inline-flex shrink-0"><Criterio texto="Rutas habituales" a={a} resaltado={e(ANCLA_PROV.critRutas).resaltado} /></span>
        <span data-ancla="proveedores.criterio.cumplimiento" className="inline-flex shrink-0"><Criterio texto="Historial de cumplimiento" a={a} resaltado={e(ANCLA_PROV.critCumplimiento).resaltado} /></span>
        <span data-ancla="proveedores.criterio.condiciones" className="inline-flex shrink-0"><Criterio texto="Condiciones comerciales" a={a} resaltado={e(ANCLA_PROV.critCondiciones).resaltado} /></span>
      </div>
      <div className="h-[15px] shrink-0 flex items-center gap-1.5 px-1.5 border-b border-slate-200 bg-slate-100 text-[8.5px] uppercase tracking-wide text-slate-500 border-l-2 border-l-transparent">
        <span className="w-[32px] shrink-0">Id</span>
        <span className="flex-1 min-w-0">Transportador</span>
        <span className="w-[58px] shrink-0">Base</span>
        <span className="w-[72px] shrink-0">Flota</span>
        <span className="w-[46px] shrink-0">Placa</span>
        <span className="w-[22px] shrink-0 text-right">Cum.</span>
        <span className="w-[104px] shrink-0">Rutas habituales</span>
        <span data-ancla="proveedores.col.compat" className={`w-[44px] shrink-0 ${eCo.resaltado ? 'bg-amber-200 text-amber-900 rounded' : ''}`}>Compat.</span>
        <span className="w-[88px] shrink-0 text-center">Estado</span>
      </div>
      <div className={`flex-1 min-h-0 overflow-auto flex flex-col ${cargando ? 'opacity-30' : ''}`}>
        {filas.map(f => <FilaProveedor key={f.id} f={f} m={m} a={a} sinCand={sinCand} paso={paso} p={p} />)}
      </div>
      <div
        data-ancla="proveedores.aviso.resultado"
        className={`h-[18px] shrink-0 flex items-center px-2 border-t text-[9.5px] truncate ${eAv.resaltado ? 'bg-amber-100 border-amber-300' : sinCand && presel ? 'bg-red-50 border-red-200' : presel ? 'bg-teal-50 border-teal-200' : 'bg-slate-50 border-slate-200'}`}
      >
        {aviso}
      </div>
    </div>
  );
}

/* ═══════════════ Vista 2 · Hoja de negociación ═══════════════ */

function Valor({ texto, visible, tecleo, pegado, resaltado, foco }: { texto: string; visible: boolean; tecleo?: number; pegado?: boolean; resaltado?: boolean; foco?: boolean }) {
  const mostrado = !visible ? '' : pegado || tecleo === undefined ? texto : texto.slice(0, Math.floor(tecleo * texto.length));
  const escribiendo = tecleo !== undefined && tecleo < 1 && !pegado;
  return (
    <span
      className={`block h-[17px] leading-[17px] px-1 rounded font-mono tabular-nums text-[10px] truncate ${resaltado ? 'bg-amber-100 ring-1 ring-amber-300' : ''} ${foco ? 'ring-1 ring-teal-600 bg-teal-50' : ''}`}
    >
      {mostrado || (visible ? '' : <span className="text-slate-300">—</span>)}
      {escribiendo && <span className="inline-block w-px h-[10px] bg-slate-700 align-middle ml-px" />}
    </span>
  );
}

function VistaNegociacion({ caso, paso, p }: { caso: Caso; paso?: PasoPlan; p: number }) {
  const d: DatosCaso = caso.datos;
  const m = useMemo(() => modeloNeg(d), [d]);
  const idb = base(paso?.id);
  const en = (id: string) => idb === id && !!paso;
  const e = (an: string) => estadoAncla(paso, p, an);
  const hN2 = hecho(caso, 'n2');
  const hN3 = hecho(caso, 'n3');
  const hN4 = hecho(caso, 'n4');
  const hN5 = hecho(caso, 'n5');

  const eOfr = e(ANCLA_PROV.celdaOfrecida);
  const eCon = e(ANCLA_PROV.celdaContra);
  const eFre = e(ANCLA_PROV.celdaFrente);
  const eFin = e(ANCLA_PROV.celdaFinal);
  const eTope = e(ANCLA_PROV.tope);
  const eAcep = e(ANCLA_PROV.btnAceptar);
  const eAv = e(ANCLA_PROV.aviso);

  const n2Activo = en('n2');
  const comparado = en('n3') ? p >= T_COMPARA : hN3 || en('n4');
  const registrada = en('n4') ? eFin.pegado : hN4;
  const aceptadaId = m.aceptada?.ronda.transportadorId;
  const sobre = !!m.escalada && m.rondas[0]?.transportadorId === m.escalada.transportadorId;

  const filas = m.rondas.map((r, k) => {
    const primera = k === 0;
    const esAcept = r.transportadorId === aceptadaId;
    const contactada = primera ? n2Activo || hN2 || comparado : (hN5 && !m.adjudicada) || (esAcept && registrada);
    const escalada = primera && sobre && comparado && !registrada;
    const aprobada = esAcept && registrada;
    const verOfr = primera ? (n2Activo ? eOfr.tecleo !== undefined || eOfr.pegado : hN2 || comparado) : contactada;
    const verCon = primera ? (n2Activo ? eCon.tecleo !== undefined || eCon.pegado : hN2 || comparado) : contactada;
    let estado = { t: 'Por llamar', c: 'bg-slate-50 border-slate-200 text-slate-500' };
    if (aprobada) estado = { t: 'Aceptada preliminar', c: 'bg-emerald-100 border-emerald-300 text-emerald-800 font-semibold' };
    else if (primera && !comparado) estado = verOfr ? { t: 'En negociación', c: 'bg-sky-50 border-sky-200 text-sky-700' } : estado;
    else if (primera ? comparado : contactada) {
      estado = r.estado === 'sobre_tope' ? { t: 'Sobre el tope', c: 'bg-red-100 border-red-300 text-red-700 font-semibold' }
        : r.estado === 'sin_interes' ? { t: 'Sin interés', c: 'bg-slate-100 border-slate-300 text-slate-500' }
          : { t: 'Dentro del tope', c: 'bg-emerald-50 border-emerald-200 text-emerald-700' };
    } else if (m.adjudicada) estado = { t: 'En reserva', c: 'bg-slate-50 border-slate-200 text-slate-400' };
    const mostrarFrente = primera ? comparado : contactada;
    const frente = r.contrapropuesta - m.tope;
    return { r, primera, esAcept, escalada, aprobada, verOfr, verCon, estado, mostrarFrente, frente };
  });

  const tarifaAcept = m.aceptada?.tarifa ?? 0;
  const autorizada = d.excepcion?.tipo === 'Tarifa_sobre_tope';
  let aviso = <span className="text-slate-500">Se negocia solo dentro del tope autorizado · {m.rondas.length} candidatos</span>;
  if (registrada && m.aceptada) {
    aviso = <span className="text-emerald-800 font-semibold inline-flex items-center gap-1 min-w-0"><FileSignature className="w-3 h-3 shrink-0" /><span className="truncate">Aceptación preliminar · {m.aceptada.ronda.transportador} · {pesos(tarifaAcept)}{autorizada ? ' · autorizada por el coordinador (R08)' : ''}</span></span>;
  } else if (sobre && comparado) {
    aviso = <span className="text-red-700 font-semibold inline-flex items-center gap-1 min-w-0"><CircleAlert className="w-3 h-3 shrink-0" /><span className="truncate">Supera el tope en {pesos(m.excedente)} · R07: no comprometo valores, se escala al coordinador</span></span>;
  } else if (comparado) aviso = <span className="text-emerald-700 inline-flex items-center gap-1"><Check className="w-3 h-3" /> Contrapropuesta dentro del tope autorizado</span>;

  const btnAcep: 'pend' | 'activo' | 'hecho' = registrada ? 'hecho' : en('n4') || (comparado && !sobre) ? 'activo' : 'pend';

  return (
    <div className="absolute inset-0 flex flex-col bg-slate-200/70 p-1.5 text-slate-800">
      <div className="flex-1 min-h-0 flex flex-col bg-white border border-slate-300 shadow-sm">
        <div className="shrink-0 flex items-center gap-2 px-2 h-[26px] border-b border-slate-200 whitespace-nowrap overflow-hidden">
          <FileSignature className="w-3.5 h-3.5 text-teal-700 shrink-0" />
          <span className="text-[10.5px] font-bold tracking-wide text-slate-800">HOJA DE NEGOCIACIÓN</span>
          <span className="text-[9.5px] text-slate-500 truncate">{m.opId} · {m.ruta} · {m.vehiculo}</span>
          <span
            data-ancla="proveedores.campo.tope"
            className={`ml-auto inline-flex items-center gap-1 h-[18px] px-1.5 rounded border text-[9.5px] shrink-0 ${eTope.resaltado ? 'bg-amber-100 border-amber-300' : 'bg-teal-50 border-teal-200'}`}
          >
            <span className="text-slate-500">Tope autorizado</span>
            <span className="font-mono font-bold text-teal-800">{pesos(m.tope)}</span>
            <ChipRegla codigo="R06" />
          </span>
        </div>
        <div className="shrink-0 flex items-center gap-1.5 px-2 h-[15px] border-b border-slate-200 bg-slate-50 text-[8.5px] uppercase tracking-wide text-slate-500">
          <span className="w-[12px] shrink-0">#</span>
          <span className="flex-1 min-w-0">Transportador</span>
          <span className="w-[78px] shrink-0">Tarifa ofrecida</span>
          <span className="w-[78px] shrink-0">Contrapropuesta</span>
          <span className="w-[92px] shrink-0">Frente al tope</span>
          <span className="w-[88px] shrink-0 text-center">Estado</span>
          <span className="w-[78px] shrink-0">Tarifa final</span>
        </div>
        <div className="flex-1 min-h-0 overflow-auto">
          {filas.map(({ r, primera, esAcept, escalada, aprobada, verOfr, verCon, estado, mostrarFrente, frente }, k) => {
            const celdaFrente = (res: boolean) => `w-[92px] shrink-0 h-[17px] leading-[17px] px-1 rounded text-[9.5px] truncate ${res && eFre.resaltado ? 'bg-amber-100 ring-1 ring-amber-300' : ''} ${!mostrarFrente ? 'text-slate-300' : frente > 0 ? 'text-red-700 font-semibold' : 'text-emerald-700'}`;
            const textoFrente = !mostrarFrente ? '—' : frente > 0 ? (aprobada ? 'Autorizado por coordinador' : `+${pesos(frente)} sobre`) : `Margen ${pesos(-frente)}`;
            return (
            <div
              key={r.transportadorId}
              data-ancla={`proveedores.ronda.${r.transportadorId.toLowerCase()}`}
              className={`h-[30px] shrink-0 flex items-center gap-1.5 px-2 border-b border-slate-100 border-l-2 ${escalada ? 'bg-red-50' : aprobada ? 'bg-emerald-50' : ''}`}
              style={{ borderLeftColor: escalada ? '#dc2626' : aprobada ? '#059669' : 'transparent' }}
            >
              <span className="w-[12px] shrink-0 text-[9px] text-slate-400 font-mono">{k + 1}</span>
              <span className="flex-1 min-w-0 leading-tight">
                <span className={`block text-[10px] truncate ${escalada ? 'font-semibold text-red-800' : 'font-medium text-slate-800'}`}>{r.transportador}</span>
                <span className="block text-[8.5px] text-slate-400 truncate">{r.transportadorId} · {r.vehiculo} · compat. {r.compatibilidad} · cumpl. {r.cumplimiento}</span>
              </span>
              <span className="w-[78px] shrink-0">
                {primera
                  ? <span data-ancla="proveedores.celda.ofrecida" className="block"><Valor texto={pesos(r.tarifaOfrecida)} visible={verOfr} tecleo={n2Activo ? eOfr.tecleo : undefined} pegado={eOfr.pegado} foco={eOfr.foco} resaltado={eOfr.resaltado} /></span>
                  : <Valor texto={pesos(r.tarifaOfrecida)} visible={verOfr} />}
              </span>
              <span className="w-[78px] shrink-0">
                {primera
                  ? <span data-ancla="proveedores.celda.contrapropuesta" className="block"><Valor texto={pesos(r.contrapropuesta)} visible={verCon} tecleo={n2Activo ? eCon.tecleo : undefined} pegado={eCon.pegado} foco={eCon.foco} resaltado={eCon.resaltado} /></span>
                  : <Valor texto={pesos(r.contrapropuesta)} visible={verCon} />}
              </span>
              {primera ? (
                <span data-ancla="proveedores.celda.frente" className={celdaFrente(true)}>{textoFrente}</span>
              ) : (
                <span className={celdaFrente(false)}>{textoFrente}</span>
              )}
              <span className={`w-[88px] shrink-0 h-[15px] inline-flex items-center justify-center rounded border text-[8.5px] truncate px-0.5 ${estado.c}`}>{estado.t}</span>
              <span className="w-[78px] shrink-0">
                {esAcept
                  ? <span data-ancla="proveedores.celda.final" className="block"><Valor texto={pesos(tarifaAcept)} visible={registrada} pegado={eFin.pegado} resaltado={eFin.resaltado} /></span>
                  : <Valor texto="" visible={false} />}
              </span>
            </div>
            );
          })}
        </div>
        <div className="shrink-0 flex items-center gap-2 px-2 h-[22px] border-t border-slate-200 bg-slate-50 whitespace-nowrap overflow-hidden">
          <span
            data-ancla="proveedores.aviso.resultado"
            className={`flex-1 min-w-0 h-[16px] flex items-center px-1.5 rounded text-[9.5px] truncate ${eAv.resaltado ? 'bg-amber-100 ring-1 ring-amber-300' : registrada ? 'bg-emerald-50' : sobre && comparado ? 'bg-red-50' : ''}`}
          >
            {aviso}
          </span>
          <span data-ancla="proveedores.btn.aceptar" className="inline-flex shrink-0"><Boton texto="Registrar aceptación preliminar" estado={btnAcep} clic={eAcep.clic} /></span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ Ventana ═══════════════ */

function VentanaProveedores({ caso, vista, paso, progreso, velocidad, actor, medir, relojSim }: PropsVentana) {
  const p = progresoEfectivo(progreso, velocidad);
  const d = caso.datos;
  const agente = caso.plan.find(et => paso && et.pasos.some(x => x.id === paso.id))?.agente ?? 'buscador';
  const color = AGENTES_MAP[agente].color;
  return (
    <VentanaSistema
      ventana="proveedores"
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
      {vista === 'proveedores.negociacion'
        ? <VistaNegociacion caso={caso} paso={paso} p={p} />
        : <VistaBase caso={caso} paso={paso} p={p} />}
    </VentanaSistema>
  );
}

export default memo(VentanaProveedores);

