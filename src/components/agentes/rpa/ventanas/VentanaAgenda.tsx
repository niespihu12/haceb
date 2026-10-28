import { memo } from 'react';
import { CalendarClock, CircleCheck, Plus, RefreshCw, Repeat2 } from 'lucide-react';
import type { Caso, TareaAgenda } from '@/types/agentes';
import { CLIENTES } from '@/data/mockData';
import { AGENTES_MAP } from '@/data/agentesCatalogo';
import { horaMin } from '@/data/agentesUtil';
import {
  ANCLA_AGENDA, T_C4_FORM2, T_C4_GUARDA1, T_C4_GUARDA2, T_G1_GUARDA, T_P4_GUARDA, T_X2_CREA, T_X4_SYNC,
  minutosReintento, tareaSinContacto, tituloAlternativa,
} from '@/data/guiones/agenda';
import { estadoAncla, progresoEfectivo } from '@/components/agentes/guion';
import { infoPaso } from '@/components/agentes/helpers';
import { CampoTecleado } from '@/components/agentes/ui';
import type { PropsVentana } from '../tipos';
import VentanaSistema from '../VentanaSistema';

const AMBAR = '#b45309';
const MIN = 60_000;
const base = (id?: string) => (id ?? '').replace(/_\d+$/, '');
const hecho = (caso: Caso, id: string) => {
  const e = infoPaso(caso, id).estado;
  return e === 'hecho' || e === 'fallo';
};

type Estado = TareaAgenda['estado'];
const ETIQUETA: Record<Estado, { texto: string; clase: string }> = {
  pendiente: { texto: 'Pendiente', clase: 'bg-amber-50 text-amber-700 border-amber-200' },
  hecha: { texto: 'Hecha', clase: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  reprogramada: { texto: 'Reprogramada', clase: 'bg-violet-50 text-violet-700 border-violet-200' },
};

interface Fila {
  clave: string;
  hora: number;
  operacion: string;
  objetivo: string;
  interlocutor: string;
  actividad: string;
  estado: Estado;
  propia: boolean;
  /** Fila creada o tocada por el paso actual: va arriba y se anima. */
  foco: boolean;
  actualizada: boolean;
  sinContacto: boolean;
  seleccionada: boolean;
}

const OBJ_RELLENO = ['Llamada preventiva', 'Seguimiento en ruta', 'Confirmar recepción', 'Cierre y satisfacción'];
const INT_RELLENO = ['transportador', 'cliente', 'destinatario'];

/** Tareas de otras operaciones, deterministas por `caso.seq` (la agenda es compartida). */
function rellenos(caso: Caso): Fila[] {
  const f0 = caso.operacion.fechaCargue;
  return [0, 1, 2].map((i): Fila => {
    const cli = CLIENTES[(caso.seq + i * 4 + 2) % CLIENTES.length];
    return {
      clave: `r${i}`,
      hora: f0 + (i - 1) * 25 * MIN,
      operacion: `OP-${String(Math.max(1, caso.seq - 3 - i * 2)).padStart(4, '0')}`,
      objetivo: OBJ_RELLENO[(caso.seq + i) % OBJ_RELLENO.length],
      interlocutor: `${cli.contacto} (${INT_RELLENO[(caso.seq + i) % INT_RELLENO.length]})`,
      actividad: i === 0 ? 'Disponibilidad y ubicación del vehículo' : i === 1 ? 'Estado del servicio en ruta' : 'Instalaciones listas para recibir',
      estado: i === 0 ? 'hecha' : 'pendiente',
      propia: false, foco: false, actualizada: false, sinContacto: false, seleccionada: false,
    };
  });
}

function Estiqueta({ estado }: { estado: Estado }) {
  const e = ETIQUETA[estado];
  return <span className={`h-[14px] px-1 inline-flex items-center justify-center rounded border text-[8.5px] ${e.clase}`}>{e.texto}</span>;
}

function FilaTarea({ f }: { f: Fila }) {
  return (
    <div
      data-ancla={`agenda.fila.${f.clave}`}
      className={`h-[22px] shrink-0 flex items-center gap-1.5 px-1.5 border-b border-slate-100 border-l-2 text-[10px] ${f.foco ? 'animate-toast-in' : ''} ${f.propia ? '' : 'opacity-60'}`}
      style={{ borderLeftColor: f.seleccionada ? AMBAR : f.foco ? '#f59e0b' : 'transparent', backgroundColor: f.seleccionada ? '#fef3c7' : f.foco ? '#fffbeb' : undefined }}
    >
      <span className="w-[30px] shrink-0 font-mono tabular-nums text-slate-600">{horaMin(f.hora)}</span>
      <span className={`w-[48px] shrink-0 font-mono truncate ${f.propia ? 'font-bold text-slate-800' : 'text-slate-400'}`}>{f.operacion}</span>
      <span className="w-[108px] shrink-0 truncate font-medium text-slate-700">{f.objetivo}</span>
      <span className="w-[112px] shrink-0 truncate text-slate-600">{f.interlocutor}</span>
      <span className="flex-1 min-w-0 truncate text-slate-500">{f.actividad}</span>
      {f.actualizada && (
        <span className="shrink-0 inline-flex items-center gap-0.5 text-[8.5px] text-sky-700" title="Actualizada con información confirmada">
          <RefreshCw className="w-2.5 h-2.5" />Act.
        </span>
      )}
      {f.sinContacto && <span className="shrink-0 text-[8.5px] text-rose-600">Sin contacto</span>}
      <span className="w-[62px] shrink-0 flex justify-end"><Estiqueta estado={f.estado} /></span>
    </div>
  );
}

function VentanaAgenda({ caso, vista, paso, progreso, velocidad, actor, medir, relojSim }: PropsVentana) {
  const p = progresoEfectivo(progreso, velocidad);
  const d = caso.datos;
  const op = caso.operacion;
  const idBase = base(paso?.id);
  const enP4 = idBase === 'p4';
  const enC4 = idBase === 'c4';
  const enG1 = idBase === 'g1';
  const enX2 = idBase === 'x2';
  const enX4 = idBase === 'x4';
  const agente = caso.plan.find(et => paso && et.pasos.some(x => x.id === paso.id))?.agente ?? 'seguimiento';
  const color = AGENTES_MAP[agente]?.color ?? AMBAR;
  const o0 = d.trayectoria[0];
  const contacto = o0.cliente.contacto;
  const dest = op.receptor?.nombre ?? contacto;
  const conductor = op.transportador?.conductor ?? o0.transportador?.conductor ?? 'Conductor';
  const e = (a: string) => estadoAncla(paso, p, a);

  /* ── Qué ya ocurrió (del paso actual y de los pasos hechos) ── */
  const p4Ok = enP4 ? p >= T_P4_GUARDA + 0.02 : hecho(caso, 'p4');
  const c4a = enC4 ? p >= T_C4_GUARDA1 + 0.02 : hecho(caso, 'c4');
  const c4b = enC4 ? p >= T_C4_GUARDA2 + 0.02 : hecho(caso, 'c4');
  const g1Ok = enG1 ? p >= T_G1_GUARDA + 0.02 : hecho(caso, 'g1');
  const esAuto = d.excepcion?.categoria === 'automatico';
  const x2Marca = esAuto && (enX4 || hecho(caso, 'x2') || hecho(caso, 'x4') || (enX2 && p >= T_X2_CREA));
  const mostrarOriginal = esAuto && (enX2 || enX4 || x2Marca || hecho(caso, 'x1'));
  const syncX4 = enX4 ? p >= T_X4_SYNC + 0.02 : hecho(caso, 'x4');
  const llamo = (obj: string, inter: string) => op.llamadas.some(l => l.objetivo === obj && l.interlocutor === inter);

  const orig = tareaSinContacto(d);
  const min = minutosReintento(d);
  const altTitulo = tituloAlternativa(d);

  const filas: Fila[] = [];
  const nueva = (f: Omit<Fila, 'propia' | 'actualizada' | 'sinContacto' | 'seleccionada' | 'foco'> & Partial<Fila>): Fila => ({
    propia: true, foco: false, actualizada: false, sinContacto: false, seleccionada: false, ...f,
  });

  /* Tareas ya registradas de la operación (llamadas hechas), sin las que crean estos pasos */
  const propias = d.agenda
    .filter(t => t.estado !== 'reprogramada' && t.objetivo !== 'Llamada preventiva' && t.objetivo !== 'Preparar recepción' && !t.id.endsWith('-p1'))
    .filter(t => op.llamadas.some(l => l.ts === t.hora && l.objetivo === t.objetivo))
    .slice(-3);
  for (const t of propias) {
    filas.push(nueva({ clave: t.id.toLowerCase(), hora: t.hora, operacion: op.id, objetivo: t.objetivo, interlocutor: t.interlocutor, actividad: t.actividad, estado: 'hecha' }));
  }

  const actC4 = hecho(caso, 'c4') || (enC4 && p >= T_C4_GUARDA2 + 0.04);
  const actG1 = hecho(caso, 'g1') || (enG1 && p >= 0.62);
  const actX4 = syncX4;

  if (p4Ok) {
    filas.push(nueva({
      clave: 'compromiso', hora: o0.fechaCargue, operacion: op.id, objetivo: 'Confirmar condiciones de cargue', interlocutor: `${contacto} (cliente)`,
      actividad: 'Compromiso: mercancía disponible', estado: hecho(caso, 'k1') ? 'hecha' : 'pendiente', foco: enP4, actualizada: actC4,
    }));
  }
  if (c4a) {
    const hecha = llamo('Llamada preventiva', 'transportador');
    filas.push(nueva({
      clave: 'prev-tr', hora: o0.fechaCargue - 90 * MIN, operacion: op.id, objetivo: 'Llamada preventiva', interlocutor: `${conductor} (transportador)`,
      actividad: 'Disponibilidad, ubicación y hora estimada de llegada', estado: hecha ? 'hecha' : 'pendiente', foco: enC4, actualizada: actC4,
    }));
  }
  if (c4b) {
    const hecha = llamo('Llamada preventiva', 'cliente');
    filas.push(nueva({
      clave: 'prev-cl', hora: o0.fechaCargue - 60 * MIN, operacion: op.id, objetivo: 'Llamada preventiva', interlocutor: `${contacto} (cliente)`,
      actividad: 'Mercancía lista y punto de cargue disponible', estado: hecha ? 'hecha' : 'pendiente', foco: enC4, actualizada: actC4,
    }));
  }
  if (mostrarOriginal) {
    filas.push(nueva({
      clave: 'original', hora: orig?.hora ?? o0.fechaCargue + 2 * 3_600_000, operacion: op.id, objetivo: orig?.objetivo ?? 'Seguimiento en ruta',
      interlocutor: orig?.interlocutor ?? `${conductor} (transportador)`, actividad: orig?.actividad ?? 'Intento de contacto',
      estado: x2Marca ? 'reprogramada' : 'pendiente', sinContacto: !x2Marca, foco: enX2 && !x2Marca,
      seleccionada: enX2 && !x2Marca && p >= 0.3,
    }));
  }
  if (x2Marca) {
    filas.push(nueva({
      clave: 'nueva', hora: (orig?.hora ?? o0.fechaCargue + 2 * 3_600_000) + min * MIN, operacion: op.id, objetivo: orig?.objetivo ?? (d.excepcion?.tipo === 'Datos_incompletos' ? 'Completar datos' : 'Seguimiento en ruta'),
      interlocutor: orig?.interlocutor ?? `${contacto} (cliente)`, actividad: altTitulo, estado: 'pendiente', foco: enX2 || enX4, actualizada: actX4,
    }));
  }
  if (g1Ok) {
    const hecha = llamo('Preparar recepción', 'destinatario');
    filas.push(nueva({
      clave: 'recepcion', hora: o0.fechaCargue + 7 * 3_600_000, operacion: op.id, objetivo: 'Preparar recepción', interlocutor: `${dest} (destinatario)`,
      actividad: 'Aviso de llegada: destino listo para recibir', estado: hecha ? 'hecha' : 'pendiente', foco: enG1, actualizada: actG1,
    }));
  }
  const seg = d.agenda.find(t => t.id.endsWith('-p1'));
  if (seg && hecho(caso, 'c4')) {
    filas.push(nueva({
      clave: 'seg', hora: seg.hora, operacion: op.id, objetivo: seg.objetivo, interlocutor: seg.interlocutor, actividad: seg.actividad,
      estado: 'pendiente', actualizada: actG1 || actX4,
    }));
  }

  const propiasOrden = [...filas].sort((a, b) => Number(b.foco) - Number(a.foco) || a.hora - b.hora);
  const todas = [...propiasOrden, ...rellenos(caso)];
  const cuenta = (s: Estado) => todas.filter(f => f.estado === s).length;
  const nActualizadas = filas.filter(f => f.actualizada).length;

  /* ── Formulario «Nueva tarea» (lo teclea el agente en p4, c4 y g1) ── */
  const f2 = enC4 && p >= T_C4_FORM2;
  const formEn = enP4 ? p < T_P4_GUARDA : enC4 ? (p < T_C4_GUARDA1 || (p >= T_C4_FORM2 && p < T_C4_GUARDA2)) : enG1 ? p < T_G1_GUARDA : false;
  const vals = enP4
    ? { obj: 'Confirmar condiciones de cargue', inter: `${contacto} (cliente)`, act: 'Compromiso: mercancía disponible', hora: horaMin(o0.fechaCargue) }
    : enC4 && f2
      ? { obj: 'Llamada preventiva', inter: `${contacto} (cliente)`, act: 'Mercancía lista y punto de cargue disponible', hora: horaMin(o0.fechaCargue - 60 * MIN) }
      : enC4
        ? { obj: 'Llamada preventiva', inter: `${conductor} (transportador)`, act: 'Disponibilidad, ubicación y hora estimada de llegada', hora: horaMin(o0.fechaCargue - 90 * MIN) }
        : { obj: 'Preparar recepción', inter: `${dest} (destinatario)`, act: 'Aviso de llegada: destino listo para recibir', hora: horaMin(o0.fechaCargue + 7 * 3_600_000) };
  const campo = (ancla: string, valor: string, mono = false) => {
    const a = e(ancla);
    const visible = formEn && (f2 ? p >= T_C4_FORM2 + (ancla === ANCLA_AGENDA.objetivo ? 0 : ancla === ANCLA_AGENDA.interlocutor ? 0.04 : ancla === ANCLA_AGENDA.actividad ? 0.08 : 0.12) : a.pegado || a.tecleo !== undefined);
    return (
      <CampoTecleado
        key={ancla}
        ancla={`${ancla}.valor`}
        valor={valor}
        visible={visible}
        pegado={visible && (f2 || a.pegado)}
        tecleo={f2 ? undefined : a.tecleo}
        foco={a.foco}
        mono={mono}
        className="min-w-0"
      />
    );
  };
  const eAgendar = e(ANCLA_AGENDA.btnAgendar);
  const eReprog = e(ANCLA_AGENDA.btnReprogramar);
  const agendarActivo = formEn && (enP4 ? p >= 0.72 : enC4 ? (f2 ? p >= 0.72 : p >= 0.46) : p >= 0.34);
  const reprogActivo = enX2 && p >= 0.3 && !x2Marca;

  /* ── Panel de sincronización: «información confirmada → tareas actualizadas» ── */
  let sync: { texto: string; ok: boolean } | undefined;
  const ultimo = ['x4', 'g1', 'x2', 'c4', 'p4']
    .filter(id => hecho(caso, id))
    .sort((a, b) => (caso.pasosHechos[b]?.t ?? 0) - (caso.pasosHechos[a]?.t ?? 0))[0];
  const cual = enP4 || enC4 || enG1 || enX2 || enX4 ? idBase : ultimo;
  if (cual === 'p4' && p4Ok) sync = { texto: `Compromiso ligado a ${op.id}, a ${contacto} y a la actividad «mercancía disponible» (R26)`, ok: true };
  else if (cual === 'c4' && c4b) sync = { texto: `Cargue confirmado: ${nActualizadas || 3} tareas relacionadas actualizadas, sin volver a consultar al cliente`, ok: true };
  else if (cual === 'g1' && g1Ok) sync = { texto: `Destino confirmado: ${actG1 ? Math.max(2, nActualizadas) : 1} tareas relacionadas actualizadas, sin consulta duplicada`, ok: actG1 };
  else if ((cual === 'x2' || cual === 'x4') && x2Marca) sync = { texto: syncX4 ? `Novedad resuelta: ${altTitulo} · ${Math.max(2, nActualizadas)} tareas relacionadas actualizadas` : `Tarea reprogramada: ${altTitulo}`, ok: syncX4 };
  const eSync = e(ANCLA_AGENDA.sincronizacion);

  return (
    <VentanaSistema ventana="agenda" vista={vista} actor={actor} humano={paso?.humano} paso={paso} progreso={p} sesion={d.sesion} relojSim={relojSim} medir={medir} color={color}>
      <div className="absolute inset-0 flex flex-col bg-amber-50/40 text-slate-800">
        <div className="h-[24px] shrink-0 flex items-center gap-2 px-2 border-b border-amber-200 bg-white text-[10px] whitespace-nowrap overflow-hidden">
          <CalendarClock className="w-3.5 h-3.5 shrink-0" style={{ color: AMBAR }} />
          <span className="font-semibold">Agenda de llamadas</span>
          <span className="text-slate-400">· hoy · {op.id}</span>
          <span className="ml-auto flex items-center gap-1">
            {(['pendiente', 'hecha', 'reprogramada'] as Estado[]).map(s => (
              <span key={s} className={`inline-flex items-center gap-1 h-[15px] px-1.5 rounded border text-[9px] ${ETIQUETA[s].clase}`}>
                {ETIQUETA[s].texto}<span className="font-mono tabular-nums">{cuenta(s)}</span>
              </span>
            ))}
          </span>
        </div>

        <div className="shrink-0 px-2 py-1 border-b border-amber-200 bg-amber-50 flex items-end gap-1.5">
          <div className="flex items-center gap-1 self-center text-[9px] font-semibold text-amber-800 w-[52px] shrink-0 leading-tight">
            <Plus className="w-3 h-3 shrink-0" />Nueva tarea
          </div>
          <div className="grid gap-1 flex-1 min-w-0" style={{ gridTemplateColumns: '1.1fr 1.1fr 1.6fr 0.45fr' }}>
            <div data-ancla="agenda.campo.objetivo" className="min-w-0">{campo(ANCLA_AGENDA.objetivo, vals.obj)}</div>
            <div data-ancla="agenda.campo.interlocutor" className="min-w-0">{campo(ANCLA_AGENDA.interlocutor, vals.inter)}</div>
            <div data-ancla="agenda.campo.actividad" className="min-w-0">{campo(ANCLA_AGENDA.actividad, vals.act)}</div>
            <div data-ancla="agenda.campo.hora" className="min-w-0">{campo(ANCLA_AGENDA.hora, vals.hora, true)}</div>
          </div>
          <button
            type="button"
            tabIndex={-1}
            data-ancla="agenda.btn.agendar"
            className={`h-5 px-2 rounded border text-[9.5px] font-medium inline-flex items-center gap-1 shrink-0 ${agendarActivo ? 'text-white border-transparent' : 'bg-slate-100 text-slate-400 border-slate-200'}`}
            style={agendarActivo ? { backgroundColor: eAgendar.clic ? '#78350f' : AMBAR } : undefined}
          >
            <CircleCheck className="w-3 h-3" />Agendar
          </button>
          <button
            type="button"
            tabIndex={-1}
            data-ancla="agenda.btn.reprogramar"
            className={`h-5 px-2 rounded border text-[9.5px] font-medium inline-flex items-center gap-1 shrink-0 ${reprogActivo ? 'text-white border-transparent' : 'bg-slate-100 text-slate-400 border-slate-200'}`}
            style={reprogActivo ? { backgroundColor: eReprog.clic ? '#4c1d95' : '#7c3aed' } : undefined}
          >
            <Repeat2 className="w-3 h-3" />Reprogramar
          </button>
        </div>

        <div className="h-[15px] shrink-0 flex items-center gap-1.5 px-1.5 border-b border-slate-200 bg-slate-100 text-[8.5px] uppercase tracking-wide text-slate-500">
          <span className="w-[30px]">Hora</span>
          <span className="w-[48px]">Operación</span>
          <span className="w-[108px]">Objetivo</span>
          <span className="w-[112px]">Interlocutor</span>
          <span className="flex-1">Actividad</span>
          <span className="w-[62px] text-right">Estado</span>
        </div>
        <div className="flex-1 min-h-0 overflow-auto bg-white flex flex-col">
          {todas.map(f => <FilaTarea key={f.clave} f={f} />)}
        </div>

        <div
          data-ancla="agenda.panel.sincronizacion"
          className={`h-[22px] shrink-0 flex items-center gap-1.5 px-2 border-t text-[9.5px] whitespace-nowrap overflow-hidden ${eSync.resaltado ? 'bg-sky-100 border-sky-300' : 'bg-slate-50 border-slate-200'}`}
        >
          <RefreshCw className={`w-3 h-3 shrink-0 ${sync?.ok ? 'text-sky-600' : 'text-slate-400'}`} />
          {sync ? <span className={`truncate ${sync.ok ? 'text-sky-800' : 'text-slate-500'}`}>{sync.texto}</span> : <span className="text-slate-400 truncate">Sin cambios pendientes de sincronizar</span>}
        </div>
      </div>
    </VentanaSistema>
  );
}

export default memo(VentanaAgenda);
