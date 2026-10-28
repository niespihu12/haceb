import { memo, useLayoutEffect, useRef } from 'react';
import { CircleCheck, FileSearch, UserCheck } from 'lucide-react';
import type { Alternativa, NivelSLA } from '@/types';
import type { Caso, Humano, PasoPlan } from '@/types/agentes';
import { estadoAncla, progresoEfectivo } from '@/components/agentes/guion';
import { AvatarHumano, ChipRegla, Sello } from '@/components/agentes/ui';
import { CATEGORIA_CLASE, CATEGORIA_LABEL, EXCEPCION_LABEL, PLANTILLA_EXCEPCION } from '@/data/mockData';
import {
  ETIQUETA_BOTON, T_MESA, TITULO_SEC, decisionMesa, etiquetaBoton, textoSelloMesa,
  type BotonMesa, type SecMesa,
} from '@/data/guiones/mesa';
import type { PropsVentana } from '../tipos';
import { CROMO } from '../cromo';
import VentanaSistema from '../VentanaSistema';

const ACENTO = CROMO.mesa.barra; // #9f1239
const COLOR_HUMANO = '#d97706';
const COLOR_BOTON: Record<BotonMesa, string> = { autorizar: '#059669', alternativa: '#2563eb', rechazar: '#dc2626', cancelar: '#475569' };
const BOTONES: BotonMesa[] = ['autorizar', 'alternativa', 'rechazar', 'cancelar'];
const SECCIONES: SecMesa[] = ['causa', 'impacto', 'evidencia', 'alternativas', 'recomendacion'];

const idBase = (id: string) => id.replace(/_\d+$/, '');

/** Progreso efectivo de la espera humana x3: p si está en curso, 1 si ya se decidió, 0 si no llegó. */
function progresoX3(caso: Caso, paso: PasoPlan | undefined, p: number): number {
  if (paso && idBase(paso.id) === 'x3') return p;
  for (const et of caso.plan) for (const x of et.pasos) if (idBase(x.id) === 'x3' && caso.pasosHechos[x.id]) return 1;
  return 0;
}

/* ─── Formatos ─── */
const miles = (n: number) => new Intl.NumberFormat('es-CO').format(Math.abs(Math.round(n)));
const costo = (v: number) => (v === 0 ? 'sin costo adicional' : `${v > 0 ? '+' : '−'}$ ${miles(v)}`);
const horas = (h: number) => (h === 0 ? 'sin cambio de tiempo' : `${h > 0 ? '+' : '−'}${Math.abs(h)} h`);
const SLA: Record<NivelSLA, string> = { ninguno: 'sin riesgo de SLA', bajo: 'riesgo de SLA bajo', medio: 'riesgo de SLA medio', alto: 'riesgo de SLA alto' };

/* ─── Derivación del estado (función pura de caso + paso + progreso) ─── */
interface Derivado {
  decidido: boolean;
  firmando: boolean;
  /** Alternativa marcada en pantalla. */
  seleccionada: Alternativa['id'] | null;
  boton: BotonMesa;
  letra: Alternativa['id'] | null;
  humano: Humano;
  pDec: number;
  objetivo?: string;
}

function derivar(caso: Caso, paso: PasoPlan | undefined, p: number): Derivado {
  const d = caso.datos;
  const exc = d.excepcion;
  const humano: Humano = paso?.humano ?? d.decision?.humano ?? { nombre: 'Coordinación', rol: 'Coordinador', area: 'Operaciones', color: COLOR_HUMANO };
  const pDec = progresoX3(caso, paso, p);
  const { decision, letra, boton } = decisionMesa(d);
  const decidido = !!d.decision && pDec >= T_MESA.dialogoHasta;
  const firmando = !!d.decision && pDec >= T_MESA.clicBoton && !decidido;
  const rec = exc?.recomendada ?? null;
  let seleccionada: Alternativa['id'] | null;
  if (decision === 'ALTERNATIVA') seleccionada = pDec >= T_MESA.clicAlternativa ? letra : rec;
  else if (decision === 'AUTORIZAR') seleccionada = letra ?? rec;
  else seleccionada = decidido ? letra : rec;

  const pasoX3 = paso && idBase(paso.id) === 'x3' ? paso : undefined;
  let objetivo: string | undefined;
  for (const s of SECCIONES) if (estadoAncla(pasoX3, pDec, `mesa.sec.${s}`).resaltado) objetivo = `mesa.sec.${s}`;
  if (exc) {
    for (let i = 0; i < exc.evidencia.length; i++) if (estadoAncla(pasoX3, pDec, `mesa.evid.${i}`).resaltado) objetivo = `mesa.evid.${i}`;
  }
  if (!objetivo && pDec >= T_MESA.leerHasta) objetivo = 'mesa.sec.alternativas';
  return { decidido, firmando, seleccionada, boton, letra, humano, pDec, objetivo };
}

/* ─── Piezas ─── */
function Titulo({ sec }: { sec: SecMesa }) {
  return <div className="text-[9.5px] font-bold uppercase tracking-wider text-rose-900/80 mb-0.5">{TITULO_SEC[sec]}</div>;
}

function Seccion({ sec, paso, p, children }: { sec: SecMesa; paso?: PasoPlan; p: number; children: React.ReactNode }) {
  const res = estadoAncla(paso, p, `mesa.sec.${sec}`).resaltado;
  return (
    <div data-ancla={`mesa.sec.${sec}`} className={`rounded-md px-2 py-1 border ${res ? 'bg-amber-50 border-amber-300' : 'bg-white border-rose-100'}`}>
      <Titulo sec={sec} />
      {children}
    </div>
  );
}

function Alternativas({ caso, paso, p, d }: { caso: Caso; paso?: PasoPlan; p: number; d: Derivado }) {
  const exc = caso.datos.excepcion;
  if (!exc) return null;
  return (
    <div className="space-y-[3px]">
      {exc.alternativas.map(a => {
        const marcada = d.seleccionada === a.id;
        const recomendada = exc.recomendada === a.id;
        const ea = estadoAncla(paso, p, `mesa.alt.${a.id.toLowerCase()}`);
        const descartada = d.decidido && !marcada;
        return (
          <div
            key={a.id}
            data-ancla={`mesa.alt.${a.id.toLowerCase()}`}
            className={`grid grid-cols-[14px_minmax(0,1fr)_auto] items-start gap-1.5 rounded px-1 py-[2px] border text-[10px] ${marcada ? 'bg-rose-50 border-rose-300' : 'border-slate-100 bg-white'} ${ea.clic ? 'brightness-95' : ''} ${descartada ? 'opacity-60' : ''}`}
          >
            <span className={`mt-[2px] w-[11px] h-[11px] rounded-full border-2 flex items-center justify-center ${marcada ? 'border-rose-700' : 'border-slate-300'}`}>
              {marcada && <span className="w-[5px] h-[5px] rounded-full bg-rose-700" />}
            </span>
            <span className="min-w-0 leading-[13px]">
              <span className="block text-slate-800 truncate">
                <span className="font-bold">{a.id}.</span> {a.titulo}
              </span>
              <span className="block text-[9.5px] text-slate-600 truncate" title={a.descripcion}>
                {costo(a.impactoCosto)} · {horas(a.impactoHoras)} · {SLA[a.impactoSLA]}{a.efecto.tipo === 'cancelar' ? ' · cancela el servicio' : ''}
              </span>
              <span className="flex items-center gap-1 flex-wrap pt-[1px]">
                {a.reglas.length ? a.reglas.map(r => <ChipRegla key={r} codigo={r} />) : <span className="text-[9px] text-slate-400">sin reglas afectadas</span>}
              </span>
            </span>
            <span className="flex items-center gap-1 shrink-0 pt-[1px]">
              {recomendada && <span className="inline-flex items-center h-4 px-1.5 rounded-full text-[9px] font-semibold text-white" style={{ backgroundColor: ACENTO }}>Recomendada</span>}
              {marcada && !recomendada && <span className="inline-flex items-center h-4 px-1.5 rounded-full text-[9px] font-semibold bg-rose-100 text-rose-800">Elegida</span>}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function BotonDecision({ boton, d, paso, p }: { boton: BotonMesa; d: Derivado; paso?: PasoPlan; p: number }) {
  const presionado = estadoAncla(paso, p, `mesa.btn.${boton}`).clic;
  const marcado = (d.decidido || d.firmando) && d.boton === boton;
  const apagado = (d.decidido || d.firmando) && !marcado;
  const color = COLOR_BOTON[boton];
  const etiqueta = boton === 'alternativa' ? etiquetaBoton(boton, marcado ? d.letra : null) : ETIQUETA_BOTON[boton];
  return (
    <span
      data-ancla={`mesa.btn.${boton}`}
      className={`h-[26px] px-2.5 inline-flex items-center justify-center gap-1 rounded-md text-[10.5px] font-bold text-white select-none border-2 whitespace-nowrap ${presionado ? 'shadow-[inset_0_2px_5px_rgba(0,0,0,0.4)] translate-y-[1px]' : 'shadow-sm'} ${apagado ? 'opacity-35' : ''}`}
      style={{ backgroundColor: color, borderColor: marcado ? '#0f172a' : color, filter: presionado ? 'brightness(0.85)' : undefined }}
    >
      {marcado && <CircleCheck className="w-3.5 h-3.5" />}
      {etiqueta}
    </span>
  );
}

/** Mesa del coordinador: la pantalla de la persona. Paquete de decisión completo y botones de la decisión real. */
function VentanaMesa({ caso, vista, paso, progreso, velocidad, actor, medir, relojSim }: PropsVentana) {
  const p = progresoEfectivo(progreso, velocidad);
  const d = derivar(caso, paso, p);
  const pasoX3 = paso && idBase(paso.id) === 'x3' ? paso : undefined;
  const datos = caso.datos;
  const exc = datos.excepcion;
  const op = datos.trayectoria[0];
  const plantilla = exc ? PLANTILLA_EXCEPCION[exc.tipo] : undefined;
  const refPanel = useRef<HTMLDivElement>(null);
  const objetivo = d.objetivo;

  // Desplazamiento imperativo del panel hacia lo que se lee (solo cambia en instantes discretos del guion).
  useLayoutEffect(() => {
    const el = refPanel.current;
    if (!el) return;
    if (!objetivo) { el.scrollTop = 0; return; }
    const sec = el.querySelector<HTMLElement>(`[data-ancla="${objetivo}"]`);
    if (!sec) return;
    const top = sec.getBoundingClientRect().top - el.getBoundingClientRect().top + el.scrollTop;
    el.scrollTop = Math.max(0, top - 6);
  }, [objetivo, caso.id]);

  const alt = exc && d.letra ? exc.alternativas.find(a => a.id === d.letra) : undefined;
  const rec = exc?.alternativas.find(a => a.id === exc.recomendada);
  const ruta = op ? `${op.nodoOrigen.ciudad} → ${op.nodoDestino.ciudad}` : '';
  const negativa = d.boton === 'rechazar' || d.boton === 'cancelar';

  return (
    <VentanaSistema
      ventana="mesa"
      vista={vista.startsWith('mesa.') ? vista : 'mesa.paquete'}
      actor={actor}
      humano={paso?.humano ?? (actor === 'humano' ? d.humano : undefined)}
      paso={paso}
      progreso={p}
      sesion={datos.sesion}
      relojSim={relojSim}
      medir={medir}
      color={d.humano.color ?? COLOR_HUMANO}
      certificador="Identidad corporativa · Mesa del coordinador"
      certificadoSerie={`MC-${datos.expediente.hash.slice(0, 8).toUpperCase()}`}
    >
      <div className="absolute inset-0 flex flex-col overflow-hidden" style={{ backgroundColor: CROMO.mesa.fondo }}>
        {!exc ? (
          <div className="flex-1 flex items-center justify-center gap-1.5 text-[10.5px] text-slate-400 italic">
            <FileSearch className="w-3.5 h-3.5" /> Sin paquetes de decisión pendientes · el proceso corre dentro de política
          </div>
        ) : (
          <>
            {/* Encabezado del paquete */}
            <div className="shrink-0 px-2 py-1 bg-white border-b border-rose-200 space-y-[1px]">
              <div className="flex items-center justify-between gap-2 whitespace-nowrap">
                <span className="text-[11px] font-semibold text-slate-800 truncate flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 shrink-0" style={{ color: ACENTO }} />
                  <span>Paquete de decisión · <span className="font-mono">{op?.id}</span> · {op?.cliente.nombre}</span>
                </span>
                <span className={`inline-flex items-center h-4 px-1.5 rounded-full text-[9px] font-semibold shrink-0 ${CATEGORIA_CLASE[exc.categoria]}`}>{CATEGORIA_LABEL[exc.categoria]}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-600 whitespace-nowrap overflow-hidden">
                <span className="font-semibold text-slate-800 truncate">{exc.titulo}</span>
                <span className="text-slate-400">·</span>
                <span className="truncate">{EXCEPCION_LABEL[exc.tipo]} · {ruta}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[9.5px] text-slate-500 whitespace-nowrap overflow-hidden">
                <span className="truncate">Levantó: {plantilla?.agente ?? 'Agente de IA'}</span>
                {plantilla && <ChipRegla codigo={plantilla.regla} />}
                <span className="font-mono truncate">{exc.politica}</span>
                <span className="ml-auto inline-flex items-center gap-1 shrink-0 text-slate-600">
                  <AvatarHumano nombre={d.humano.nombre} size={16} color={d.humano.color ?? COLOR_HUMANO} />
                  <span className="truncate max-w-[170px]">Decide {d.humano.nombre} · {d.humano.rol}</span>
                </span>
              </div>
            </div>

            {/* Paquete (se desplaza) */}
            <div ref={refPanel} data-ancla="mesa.panel.paquete" className="relative flex-1 min-h-0 overflow-y-auto p-2 space-y-1.5">
              <Seccion sec="causa" paso={pasoX3} p={d.pDec}>
                <p className="text-[10.5px] leading-[14px] text-slate-700">{exc.causa}</p>
              </Seccion>
              <Seccion sec="impacto" paso={pasoX3} p={d.pDec}>
                <p className="text-[10.5px] leading-[14px] text-slate-700">{exc.impacto}</p>
              </Seccion>
              <Seccion sec="evidencia" paso={pasoX3} p={d.pDec}>
                <div className="space-y-[1px]">
                  {exc.evidencia.map((e, i) => {
                    const res = estadoAncla(pasoX3, d.pDec, `mesa.evid.${i}`).resaltado;
                    return (
                      <div key={i} data-ancla={`mesa.evid.${i}`} className={`text-[10px] leading-[13px] rounded px-1 ${res ? 'bg-amber-200/70 text-slate-900' : 'text-slate-700'}`}>
                        <span className="inline-block w-1 h-1 rounded-full bg-slate-400 mr-1 align-middle" />{e}
                      </div>
                    );
                  })}
                </div>
              </Seccion>
              <Seccion sec="alternativas" paso={pasoX3} p={d.pDec}>
                <Alternativas caso={caso} paso={pasoX3} p={d.pDec} d={d} />
              </Seccion>
              <Seccion sec="recomendacion" paso={pasoX3} p={d.pDec}>
                <div className="rounded border-2 px-1.5 py-1" style={{ borderColor: ACENTO, backgroundColor: '#fff1f2' }}>
                  <div className="text-[10.5px] font-semibold text-slate-800 leading-[14px]">
                    El agente recomienda la opción {exc.recomendada}{rec ? `: ${rec.titulo}` : ''}
                  </div>
                  {rec && <div className="text-[10px] text-slate-600 leading-[13px]">{rec.descripcion}</div>}
                  <div className="flex items-center gap-1 flex-wrap pt-0.5 text-[9.5px] text-slate-500">
                    {plantilla && <ChipRegla codigo={plantilla.regla} />}
                    {rec?.reglas.filter(r => r !== plantilla?.regla).map(r => <ChipRegla key={r} codigo={r} />)}
                    <span className="font-mono">{exc.politica}</span>
                  </div>
                </div>
              </Seccion>
            </div>

            {/* Pie: decisión */}
            <div className="shrink-0 px-2 py-1 bg-white border-t border-rose-200 space-y-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                {BOTONES.map(b => <BotonDecision key={b} boton={b} d={d} paso={pasoX3} p={d.pDec} />)}
              </div>
              {d.decidido ? (
                <div key="sello" data-ancla="mesa.sello" className="animate-slide-in-up flex items-center gap-2">
                  <div className="min-w-0 flex-1 text-[9.5px] text-slate-600 leading-snug">
                    <div className={`text-[10.5px] font-medium truncate ${negativa ? 'text-red-700' : 'text-emerald-700'}`}>
                      {etiquetaBoton(d.boton, d.letra)} · {d.humano.nombre} · {d.humano.rol}
                    </div>
                    <div className="truncate">{alt ? `Alternativa ${alt.id}: ${alt.titulo}` : 'Decisión registrada con causa en el expediente'} · vuelve al proceso</div>
                  </div>
                  <Sello texto={textoSelloMesa(d.boton, d.letra)} color={negativa ? '#dc2626' : '#059669'} className="shrink-0 !text-[10px] !px-2 !py-0.5 !tracking-[0.08em]" />
                </div>
              ) : (
                <div data-ancla="mesa.sello" className="text-[9.5px] text-slate-500 truncate">
                  {d.firmando ? `Confirmando con PIN · ${etiquetaBoton(d.boton, d.letra)}…` : `Decisión pendiente · firma con PIN requerida · ${d.humano.nombre}`}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </VentanaSistema>
  );
}

export default memo(VentanaMesa);
