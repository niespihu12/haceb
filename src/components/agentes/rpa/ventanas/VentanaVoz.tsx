import { memo, type ReactNode } from 'react';
import { Bot, Mic, Phone, PhoneCall, PhoneIncoming, PhoneOff, PhoneOutgoing, User } from 'lucide-react';
import type { Caso, DialogoLlamada, PasoPlan } from '@/types/agentes';
import { AGENTES_MAP } from '@/data/agentesCatalogo';
import { horaMin, miles } from '@/data/agentesUtil';
import {
  ANCLA_VOZ, T_COLGAR, T_CONECTA, T_FINAL, anclaTurno, dialogoDePaso, duracionLlamada, formatoCrono, tiemposTurnos,
} from '@/data/guiones/voz';
import { estadoAncla, progresoEfectivo } from '@/components/agentes/guion';
import { infoPaso } from '@/components/agentes/helpers';
import { CampoTecleado, ChipRegla, TextoEnVivo } from '@/components/agentes/ui';
import type { PropsVentana } from '../tipos';
import VentanaSistema from '../VentanaSistema';

const VIOLETA = '#5b21b6';
const base = (id?: string) => (id ?? '').replace(/_\d+$/, '');

const RESULTADO: Record<DialogoLlamada['resultado'], { texto: string; clase: string }> = {
  exitosa: { texto: 'Exitosa', clase: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
  sin_respuesta: { texto: 'Sin respuesta', clase: 'bg-amber-50 text-amber-700 border-amber-300' },
  reprogramada: { texto: 'Reprogramada', clase: 'bg-sky-50 text-sky-700 border-sky-300' },
  con_novedad: { texto: 'Con novedad', clase: 'bg-rose-50 text-rose-700 border-rose-300' },
};
const ROL: Record<DialogoLlamada['interlocutor'], string> = { cliente: 'Cliente', transportador: 'Transportador', destinatario: 'Destinatario' };

type Fase = 'marcando' | 'llamada' | 'final';

function Etiqueta({ children }: { children: ReactNode }) {
  return <span className="text-[8.5px] uppercase tracking-wider text-slate-400 font-semibold leading-none">{children}</span>;
}

function Burbuja({ dl, i, texto, quien, estimado, crono, prog, resaltado }: {
  dl: DialogoLlamada; i: number; texto: string; quien: 'agente' | 'otro'; estimado: boolean; crono: string; prog: number; resaltado: boolean;
}) {
  const agente = quien === 'agente';
  return (
    <div data-ancla={anclaTurno(i)} className={`flex ${agente ? 'justify-start' : 'justify-end'} animate-toast-in`}>
      <div
        className={`max-w-[84%] rounded-lg px-2 py-1 border text-[10.5px] leading-snug ${agente ? 'bg-violet-50 border-violet-200 text-slate-800 rounded-tl-sm' : 'bg-white border-slate-200 text-slate-800 rounded-tr-sm'} ${resaltado ? 'ring-1 ring-amber-400' : ''}`}
      >
        <div className="flex items-center gap-1 mb-0.5 text-[8.5px] leading-none text-slate-400">
          {agente ? <Bot className="w-2.5 h-2.5 text-violet-600" /> : <User className="w-2.5 h-2.5" />}
          <span className={`font-semibold truncate ${agente ? 'text-violet-700' : 'text-slate-500'}`}>{agente ? dl.agente : dl.nombre}</span>
          <span className="font-mono tabular-nums">{crono}</span>
          {estimado && (
            <span className="ml-0.5 px-1 rounded bg-amber-50 text-amber-700 border border-amber-300 font-semibold uppercase tracking-wide">estimado</span>
          )}
        </div>
        <TextoEnVivo texto={texto} progreso={prog} />
      </div>
    </div>
  );
}

function FilaDato({ etiqueta, valor, pendiente = false }: { etiqueta: string; valor: string; pendiente?: boolean }) {
  return (
    <div className="min-w-0 leading-tight">
      <Etiqueta>{etiqueta}</Etiqueta>
      <div className={`text-[10.5px] truncate ${valor === '—' ? 'text-slate-300' : pendiente ? 'text-amber-700 font-medium' : 'text-slate-800'}`}>{valor}</div>
    </div>
  );
}

function ContextoOperacion({ caso, paso, p }: { caso: Caso; paso?: PasoPlan; p: number }) {
  const o = caso.operacion;
  const d = caso.datos;
  const b = base(paso?.id);
  const m = o.mercancia;
  const antes = b === 'a2' || b === 'a3' || b === 'v4';
  const pend = d.trayectoria[0]?.datosPendientes ?? [];
  const pendiente = pend.length > 0 && (b === 'a3' || (b === 'v4' && p < 0.8));
  // En la recepción de la solicitud la información llega durante la llamada.
  const ve = (umbral: number) => b !== 'a2' && (b !== 'a3' || p >= umbral);
  const ruta = `${o.nodoOrigen.ciudad} → ${o.nodoDestino.ciudad}`;
  const c1 = infoPaso(caso, 'c1').estado;
  const receptorConocido = b === 'c1' ? p >= 0.6 : c1 === 'hecho' || c1 === 'fallo' || caso.estado === 'terminada';
  const receptor = o.receptor && receptorConocido ? `${o.receptor.nombre} · ${o.receptor.telefono}` : 'Por definir';
  const vehiculoConocido = infoPaso(caso, 's5').estado === 'hecho';
  const vehiculo = o.transportador && vehiculoConocido ? `${o.transportador.placa} · ${o.transportador.nombre}` : null;
  return (
    <div data-ancla={ANCLA_VOZ.contexto} className="flex flex-col gap-1">
      <FilaDato etiqueta="Operación" valor={antes ? 'Sin número aún (R03)' : o.id} />
      <FilaDato etiqueta="Ruta" valor={ve(0.3) ? ruta : '—'} />
      <FilaDato
        etiqueta="Mercancía"
        valor={ve(0.5) ? (pendiente ? `${m.descripcion} · pendiente: ${pend.join(', ').toLowerCase()}` : `${m.descripcion} · ${m.unidades} und · ${miles(m.pesoKg)} kg`) : '—'}
        pendiente={pendiente}
      />
      <FilaDato etiqueta="Cargue" valor={ve(0.7) ? `${o.nodoOrigen.lugar} · ${horaMin(o.fechaCargue)}` : '—'} />
      <FilaDato etiqueta="Receptor" valor={receptor} />
      {vehiculo && <FilaDato etiqueta="Vehículo" valor={vehiculo} />}
    </div>
  );
}

function VentanaVoz({ caso, vista, paso, progreso, velocidad, actor, medir, relojSim }: PropsVentana) {
  const pReal = progresoEfectivo(progreso, velocidad);
  const d = caso.datos;
  // Paso con llamada propia → se anima. Si no (cola, entrega, paso sin guion): última llamada ya terminada, en su estado final.
  const dlPaso = paso ? dialogoDePaso(d, caso.escenario, paso.id, paso.ok !== false) : undefined;
  let pasoVoz: PasoPlan | undefined = dlPaso ? paso : undefined;
  let dl = dlPaso;
  if (!dl) {
    for (const et of caso.plan) {
      for (const x of et.pasos) {
        if (x.vista !== 'voz.consola') continue;
        const e = infoPaso(caso, x.id).estado;
        if (e !== 'hecho' && e !== 'fallo') continue;
        const cand = dialogoDePaso(d, caso.escenario, x.id, x.ok !== false);
        if (cand) { dl = cand; pasoVoz = x; }
      }
    }
    dl = dl ?? d.dialogos.recibir ?? Object.values(d.dialogos)[0];
  }
  const p = dlPaso ? pReal : 1;
  const pasoUI = dlPaso ? paso : undefined;
  const agente = caso.plan.find(et => paso && et.pasos.some(x => x.id === paso.id))?.agente ?? 'receptor';
  const color = AGENTES_MAP[agente].color;

  let cuerpo: ReactNode;
  if (!dl) {
    cuerpo = (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-slate-400 bg-violet-50/40">
        <PhoneOff className="w-6 h-6" />
        <span className="text-[10.5px]">Sin llamada en curso</span>
      </div>
    );
  } else {
    const sal = dl.sentido === 'saliente';
    const sinResp = dl.resultado === 'sin_respuesta';
    const fase: Fase = p >= T_FINAL ? 'final' : p >= T_CONECTA ? 'llamada' : 'marcando';
    const tiempos = tiemposTurnos(dl.turnos);
    const durSeg = duracionLlamada(dl);
    const fraccion = Math.max(0, Math.min(1, (p - T_CONECTA) / (T_COLGAR - T_CONECTA)));
    const crono = formatoCrono(durSeg * fraccion);
    const visibles = dl.turnos.map((t, i) => ({ t, i, ...tiempos[i] })).filter(x => p >= x.ini);
    const eInterlocutor = estadoAncla(pasoUI, p, ANCLA_VOZ.interlocutor);
    const eObjetivo = estadoAncla(pasoUI, p, ANCLA_VOZ.objetivo);
    const eTel = estadoAncla(pasoUI, p, ANCLA_VOZ.telefono);
    const eLlamar = estadoAncla(pasoUI, p, sal ? ANCLA_VOZ.btnLlamar : ANCLA_VOZ.btnContestar);
    const eColgar = estadoAncla(pasoUI, p, ANCLA_VOZ.btnColgar);
    const eRes = estadoAncla(pasoUI, p, ANCLA_VOZ.resultado);
    const res = RESULTADO[dl.resultado];
    const estadoTxt = fase === 'final' ? (sinResp ? 'Sin respuesta' : 'Finalizada') : fase === 'llamada' ? (sinResp ? 'Timbrando' : 'En llamada') : sal ? 'Marcando…' : 'Llamada entrante';
    const estadoClase = fase === 'final' ? 'bg-slate-100 text-slate-600 border-slate-300' : fase === 'llamada' ? (sinResp ? 'bg-amber-50 text-amber-700 border-amber-300' : 'bg-emerald-50 text-emerald-700 border-emerald-300') : 'bg-violet-50 text-violet-700 border-violet-300';
    const enLlamada = fase === 'llamada';
    const llamarActivo = fase === 'marcando';
    const Sentido = sal ? PhoneOutgoing : PhoneIncoming;
    cuerpo = (
      <div className="absolute inset-0 flex flex-col text-slate-800 bg-slate-50">
        {/* Cabecera de la llamada */}
        <div className="shrink-0 flex items-stretch gap-2 px-2 py-1 border-b border-violet-200 bg-violet-50/60">
          <div className="flex-1 min-w-0 grid grid-cols-[1.25fr_1fr] gap-x-2 gap-y-0.5">
            <div data-ancla={ANCLA_VOZ.interlocutor} className={`min-w-0 rounded px-1 -mx-1 ${eInterlocutor.resaltado ? 'bg-amber-100 ring-1 ring-amber-300' : ''}`}>
              <Etiqueta>Interlocutor · {ROL[dl.interlocutor]}</Etiqueta>
              <div className="text-[11px] font-semibold text-slate-900 truncate">{dl.nombre}</div>
            </div>
            <CampoTecleado
              etiqueta="Teléfono"
              valor={dl.telefono}
              ancla={ANCLA_VOZ.telefono}
              tecleo={sal ? eTel.tecleo : undefined}
              foco={eTel.foco}
              resaltado={eTel.resaltado}
            />
            <div data-ancla={ANCLA_VOZ.objetivo} className={`min-w-0 rounded px-1 -mx-1 ${eObjetivo.resaltado ? 'bg-amber-100 ring-1 ring-amber-300' : ''}`}>
              <Etiqueta>Objetivo</Etiqueta>
              <div className="text-[10.5px] text-slate-800 truncate">{dl.objetivo}</div>
            </div>
            <div className="min-w-0 flex items-center gap-1 text-[10px] text-slate-600">
              <Sentido className="w-3 h-3 shrink-0 text-violet-700" />
              <span className="truncate">{sal ? 'Saliente' : 'Entrante'} · {dl.agente}</span>
            </div>
          </div>
          <div className="shrink-0 flex flex-col items-end justify-between gap-1">
            <div className="flex items-center gap-1.5">
              <span className={`inline-flex items-center gap-1 h-[16px] px-1.5 rounded border text-[9.5px] font-medium ${estadoClase}`}>
                {enLlamada && !sinResp && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                {estadoTxt}
              </span>
              <span className="font-mono tabular-nums text-[12px] font-semibold text-slate-800 w-[38px] text-right">{crono}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                tabIndex={-1}
                data-ancla={sal ? ANCLA_VOZ.btnLlamar : ANCLA_VOZ.btnContestar}
                className={`h-[18px] px-2 rounded border text-[9.5px] font-medium inline-flex items-center gap-1 ${llamarActivo ? 'text-white border-transparent' : 'bg-slate-100 text-slate-400 border-slate-200'} ${eLlamar.clic ? 'brightness-90' : ''}`}
                style={llamarActivo ? { backgroundColor: eLlamar.clic ? '#047857' : '#059669' } : undefined}
              >
                {sal ? <Phone className="w-3 h-3" /> : <PhoneCall className="w-3 h-3" />} {sal ? 'Llamar' : 'Contestar'}
              </button>
              <button
                type="button"
                tabIndex={-1}
                data-ancla={ANCLA_VOZ.btnColgar}
                className={`h-[18px] px-2 rounded border text-[9.5px] font-medium inline-flex items-center gap-1 ${enLlamada ? 'text-white border-transparent' : 'bg-slate-100 text-slate-400 border-slate-200'} ${eColgar.clic ? 'brightness-90' : ''}`}
                style={enLlamada ? { backgroundColor: eColgar.clic ? '#991b1b' : '#dc2626' } : undefined}
              >
                <PhoneOff className="w-3 h-3" /> Colgar
              </button>
            </div>
          </div>
        </div>
        {/* Transcripción + lo que sé */}
        <div className="flex-1 min-h-0 flex">
          <div className="flex-1 min-w-0 flex flex-col bg-white border-r border-slate-200">
            <div className="h-[16px] shrink-0 flex items-center gap-1.5 px-2 border-b border-slate-200 bg-slate-100 text-[8.5px] uppercase tracking-wide text-slate-500">
              <Mic className="w-2.5 h-2.5" /> Transcripción en vivo
              <span className="ml-auto normal-case tracking-normal text-slate-400">{visibles.length} de {dl.turnos.length} turnos</span>
            </div>
            <div className="flex-1 min-h-0 overflow-auto flex flex-col-reverse gap-1 px-2 py-1">
              {fase === 'marcando' && visibles.length === 0 && (
                <div className="my-auto text-center text-[10px] text-slate-400">
                  {sal ? `Marcando a ${dl.nombre}…` : `Llamada entrante de ${dl.nombre}…`}
                </div>
              )}
              {[...visibles].reverse().map(x => {
                const frac = Math.max(0, Math.min(1, (x.ini - T_CONECTA) / (T_COLGAR - T_CONECTA)));
                const prog = Math.max(0, Math.min(1, (p - x.ini) / Math.max(0.001, x.fin - x.ini)));
                return (
                  <Burbuja
                    key={x.i}
                    dl={dl}
                    i={x.i}
                    texto={x.t.texto}
                    quien={x.t.quien}
                    estimado={x.t.confirmada === false}
                    crono={formatoCrono(durSeg * frac)}
                    prog={p >= 1 ? 1 : prog}
                    resaltado={estadoAncla(pasoUI, p, anclaTurno(x.i)).resaltado}
                  />
                );
              })}
            </div>
          </div>
          <div className="w-[38%] min-w-[150px] max-w-[250px] shrink-0 flex flex-col bg-white">
            <div className="h-[16px] shrink-0 flex items-center px-2 border-b border-slate-200 bg-slate-100 text-[8.5px] uppercase tracking-wide text-slate-500">
              Lo que sé de esta operación
            </div>
            <div className="flex-1 min-h-0 overflow-auto px-2 py-1 flex flex-col gap-1.5">
              <ContextoOperacion caso={caso} paso={pasoVoz} p={p} />
              {fase === 'final' && (
                <div data-ancla={ANCLA_VOZ.resultado} className={`mt-auto rounded border px-1.5 py-1 animate-toast-in ${res.clase} ${eRes.resaltado ? 'ring-1 ring-amber-400' : ''}`}>
                  <div className="flex items-center gap-1">
                    <Etiqueta>Resultado</Etiqueta>
                    <span className="ml-auto text-[10px] font-semibold">{res.texto}</span>
                    {pasoVoz?.regla && <ChipRegla codigo={pasoVoz.regla} />}
                  </div>
                  <div className="text-[10px] leading-snug text-slate-700 mt-0.5">{dl.resumen}</div>
                  <div className="text-[9px] text-slate-400 mt-0.5 font-mono tabular-nums">{formatoCrono(durSeg)} · {dl.turnos.length} turnos</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <VentanaSistema
      ventana="voz"
      vista={vista}
      actor={actor}
      humano={paso?.humano}
      paso={paso}
      progreso={pReal}
      sesion={d.sesion}
      relojSim={relojSim}
      medir={medir}
      color={color ?? VIOLETA}
    >
      {cuerpo}
    </VentanaSistema>
  );
}

export default memo(VentanaVoz);
