import { memo, type ReactNode } from 'react';
import { ArrowLeftRight, CircleCheck, ClipboardEdit, FileText, FolderOpen, Inbox, Phone, RefreshCw, type LucideIcon } from 'lucide-react';
import type { Canal } from '@/types';
import type { Caso, PasoPlan } from '@/types/agentes';
import { CANAL_INFO, CLIENTES } from '@/data/mockData';
import { AGENTES_MAP } from '@/data/agentesCatalogo';
import { ANCLA_CANAL, ETIQUETA_CRUDO, T_ABRE, T_CLIC_FILA, T_LLEGADA, anclaFilaCaso } from '@/data/guiones/canal';
import { estadoAncla, progresoEfectivo } from '@/components/agentes/guion';
import { horaMinuto, infoPaso } from '@/components/agentes/helpers';
import type { PropsVentana } from '../tipos';
import VentanaSistema from '../VentanaSistema';

const AZUL = '#334155';
const MINUTO = 60_000;
const CANALES: Canal[] = ['llamada_ia', 'formulario', 'integracion', 'coordinador'];
const ICONO_CANAL: Record<Canal, LucideIcon> = { llamada_ia: Phone, formulario: ClipboardEdit, integracion: ArrowLeftRight, coordinador: FileText };
const CIUDADES = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Bucaramanga', 'Pereira', 'Cartagena', 'Cúcuta'];
const ASUNTO_RELLENO: Record<Canal, string> = {
  llamada_ia: 'Llamada entrante',
  formulario: 'Formulario de transporte',
  integracion: 'Solicitud desde el sistema',
  coordinador: 'Registro del coordinador',
};

const base = (id?: string) => (id ?? '').replace(/_\d+$/, '');
const hecho = (caso: Caso, id: string) => {
  const e = infoPaso(caso, id).estado;
  return e === 'hecho' || e === 'fallo';
};

type EstadoSol = 'nueva' | 'leida' | 'registrada';
const ETIQUETA: Record<EstadoSol, { texto: string; clase: string }> = {
  nueva: { texto: 'Nueva', clase: 'bg-blue-50 text-blue-700 border-blue-200' },
  leida: { texto: 'Leída', clase: 'bg-amber-50 text-amber-700 border-amber-200' },
  registrada: { texto: 'Registrada', clase: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

interface Fila {
  clave: string;
  canal: Canal;
  ref: string;
  remitente: string;
  asunto: string;
  hora: string;
  estado: EstadoSol;
  propia: boolean;
  seleccionada: boolean;
  presionada: boolean;
}

function numeroDe(ref: string): number {
  const m = /(\d+)$/.exec(ref);
  return m ? Number(m[1]) : 0;
}

/** Filas de relleno plausibles, deterministas por `caso.seq`. */
function rellenos(caso: Caso): Fila[] {
  const n0 = numeroDe(caso.datos.solicitud.referenciaCliente);
  const out: Fila[] = [];
  for (let i = 1; i <= 7; i++) {
    const cli = CLIENTES[(caso.seq + i * 5) % CLIENTES.length];
    const canal = CANALES[(caso.seq * 3 + i * 7) % CANALES.length];
    const o = CIUDADES[(caso.seq + i * 3) % CIUDADES.length];
    const dst = CIUDADES[(caso.seq + i * 3 + 1 + (i % 3)) % CIUDADES.length];
    const ref = `SOL-2026-${String(Math.max(1, n0 - i * 2 - (i % 2))).padStart(5, '0')}`;
    out.push({
      clave: `r${i}`,
      canal,
      ref,
      remitente: canal === 'integracion' ? `Sistema de ${cli.nombre}` : cli.contacto,
      asunto: `${ASUNTO_RELLENO[canal]} · ${o === dst ? 'Bogotá' : o} → ${o === dst ? 'Medellín' : dst}`,
      hora: horaMinuto(caso.recibidoEn - (i * 19 + 6) * MINUTO),
      estado: i === 1 && caso.seq % 2 === 0 ? 'leida' : 'registrada',
      propia: false,
      seleccionada: false,
      presionada: false,
    });
  }
  return out;
}

function ChipCanal({ canal, corto = true }: { canal: Canal; corto?: boolean }) {
  const info = CANAL_INFO[canal];
  const Icono = ICONO_CANAL[canal];
  return (
    <span className="inline-flex items-center gap-1 min-w-0 text-[9.5px] font-medium" style={{ color: info.color }}>
      <Icono className="w-3 h-3 shrink-0" />
      <span className="truncate">{corto ? info.corto : info.label}</span>
    </span>
  );
}

function FilaSolicitud({ f }: { f: Fila }) {
  const est = ETIQUETA[f.estado];
  const nueva = f.estado === 'nueva';
  return (
    <div
      data-ancla={`canal.fila.${f.clave}`}
      className={`h-[30px] flex items-center gap-1.5 px-1.5 border-b border-slate-100 border-l-2 ${f.propia ? 'animate-toast-in' : ''}`}
      style={{
        borderLeftColor: f.seleccionada ? AZUL : 'transparent',
        backgroundColor: f.presionada ? '#cbd5e1' : f.seleccionada ? '#e2e8f0' : nueva ? '#eff6ff' : undefined,
      }}
    >
      <span className="w-1.5 shrink-0 flex justify-center">{nueva && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}</span>
      <span className="w-[54px] shrink-0"><ChipCanal canal={f.canal} /></span>
      <span className="flex-1 min-w-0 leading-tight">
        <span className="flex items-baseline gap-1.5 min-w-0">
          <span className={`text-[10px] font-mono shrink-0 ${nueva ? 'font-bold text-slate-900' : 'text-slate-600'}`}>{f.ref}</span>
          <span className={`text-[10px] truncate ${nueva ? 'font-semibold text-slate-800' : f.propia ? 'text-slate-700' : 'text-slate-500'}`}>{f.remitente}</span>
        </span>
        <span className={`block text-[9.5px] truncate ${f.propia ? 'text-slate-600' : 'text-slate-400'}`}>{f.asunto}</span>
      </span>
      <span className="w-[32px] shrink-0 text-[9px] font-mono tabular-nums text-slate-400 text-right">{f.hora}</span>
      <span className={`w-[58px] shrink-0 h-[15px] inline-flex items-center justify-center rounded border text-[9px] ${est.clase}`}>{est.texto}</span>
    </div>
  );
}

function Dato({ etiqueta, resaltado, mono = false, children }: { etiqueta: string; resaltado: boolean; mono?: boolean; children: ReactNode }) {
  return (
    <div className={`min-w-0 rounded px-1 py-0.5 -mx-1 ${resaltado ? 'bg-amber-50 ring-1 ring-amber-300' : ''}`}>
      <div className="text-[8.5px] uppercase tracking-wider text-slate-400 font-semibold">{etiqueta}</div>
      <div className={`text-[10.5px] text-slate-800 truncate ${mono ? 'font-mono' : ''}`}>{children}</div>
    </div>
  );
}

function Ficha({ caso, paso, p, abierta }: { caso: Caso; paso?: PasoPlan; p: number; abierta: boolean }) {
  const s = caso.datos.solicitud;
  const info = CANAL_INFO[s.canal];
  if (!abierta) {
    return (
      <div className="flex-1 min-w-0 flex flex-col items-center justify-center gap-1 text-slate-400 bg-slate-50">
        <FolderOpen className="w-6 h-6" />
        <span className="text-[10px]">Selecciona una solicitud y pulsa «Abrir»</span>
      </div>
    );
  }
  const e = (a: string) => estadoAncla(paso, p, a);
  const estGeneral = paso && base(paso.id) === 'a2';
  return (
    <div className="flex-1 min-w-0 flex flex-col bg-white animate-toast-in">
      <div className="h-[22px] shrink-0 flex items-center gap-1.5 px-2 border-b border-slate-200 text-[10px]" style={{ backgroundColor: `${info.color}12` }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: info.color }} />
        <span className="font-semibold truncate" style={{ color: info.color }}>{info.label}</span>
        <span className="ml-auto font-mono text-slate-400 shrink-0">{horaMinuto(caso.recibidoEn)}</span>
      </div>
      <div className="flex-1 min-h-0 overflow-auto px-2 py-1 space-y-1">
        <div data-ancla="canal.campo.asunto">
          <Dato etiqueta="Asunto" resaltado={e(ANCLA_CANAL.asunto).resaltado}>
            <span className="font-semibold">{s.asunto}</span>
          </Dato>
        </div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1">
          <div data-ancla="canal.campo.remitente" className="min-w-0"><Dato etiqueta="Remitente" resaltado={e(ANCLA_CANAL.remitente).resaltado}>{s.remitente}</Dato></div>
          <div data-ancla="canal.campo.contacto" className="min-w-0"><Dato etiqueta="Contacto" resaltado={e(ANCLA_CANAL.contacto).resaltado} mono>{s.remitenteContacto}</Dato></div>
          <div data-ancla="canal.campo.referencia" className="min-w-0"><Dato etiqueta="Referencia" resaltado={e(ANCLA_CANAL.referencia).resaltado} mono>{s.referenciaCliente}</Dato></div>
          <Dato etiqueta="Cliente" resaltado={false}>{caso.operacion.cliente.nombre}</Dato>
        </div>
        <div data-ancla="canal.campo.resumen" className={`rounded px-1 py-0.5 -mx-1 ${e(ANCLA_CANAL.resumen).resaltado ? 'bg-amber-50 ring-1 ring-amber-300' : ''}`}>
          <div className="text-[8.5px] uppercase tracking-wider text-slate-400 font-semibold">Resumen</div>
          <div className="text-[10px] text-slate-700 leading-snug">{s.resumen}</div>
        </div>
        <div data-ancla="canal.campo.crudo" className={`rounded border border-slate-200 bg-slate-50 px-1.5 py-1 ${e(ANCLA_CANAL.crudo).resaltado ? 'ring-1 ring-amber-300 bg-amber-50' : ''}`}>
          <div className="text-[8.5px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">{ETIQUETA_CRUDO[s.canal]}</div>
          {s.crudo.map((l, i) => (
            <div key={i} className="font-mono text-[9.5px] leading-[13px] text-slate-700 whitespace-pre truncate">{l}</div>
          ))}
        </div>
        {estGeneral && p >= 0.9 && (
          <span className="inline-flex items-center gap-1 px-1.5 h-[16px] rounded border border-emerald-200 bg-emerald-50 text-[9.5px] text-emerald-700 animate-toast-in">
            <CircleCheck className="w-3 h-3" /> Solicitud leída completa
          </span>
        )}
      </div>
    </div>
  );
}

function VentanaCanal({ caso, vista, paso, progreso, velocidad, actor, medir, relojSim }: PropsVentana) {
  const p = progresoEfectivo(progreso, velocidad);
  const d = caso.datos;
  const idBase = base(paso?.id);
  const enA1 = idBase === 'a1';
  const agente = caso.plan.find(et => paso && et.pasos.some(x => x.id === paso.id))?.agente ?? 'receptor';
  const color = AGENTES_MAP[agente].color;

  const a1Hecho = hecho(caso, 'a1');
  const llegada = !enA1 || p >= T_LLEGADA;
  const seleccionada = enA1 ? p >= T_CLIC_FILA : true;
  const abierta = enA1 ? p >= T_ABRE : a1Hecho || caso.estado === 'terminada';
  const estado: EstadoSol = hecho(caso, 'a4') || caso.estado === 'terminada' ? 'registrada' : abierta ? 'leida' : 'nueva';
  const eFila = estadoAncla(paso, p, anclaFilaCaso(d));
  const eAbrir = estadoAncla(paso, p, ANCLA_CANAL.btnAbrir);
  const s = d.solicitud;

  const propia: Fila = {
    clave: s.referenciaCliente.toLowerCase(), canal: s.canal, ref: s.referenciaCliente, remitente: s.remitente, asunto: s.asunto, hora: horaMinuto(caso.recibidoEn),
    estado, propia: true, seleccionada: seleccionada && (enA1 || estado !== 'nueva'), presionada: eFila.clic,
  };
  const filas = [...(llegada ? [propia] : []), ...rellenos(caso)];
  const nuevas = filas.filter(f => f.estado === 'nueva').length;
  const sincronizando = enA1 && p < T_LLEGADA;
  const abrirActivo = llegada && seleccionada && !abierta;
  const conteo = (c: Canal) => filas.filter(f => f.canal === c).length;

  return (
    <VentanaSistema
      ventana="canal"
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
      <div className="absolute inset-0 flex flex-col text-slate-800 bg-slate-50">
        <div className="h-[26px] shrink-0 flex items-center gap-2 px-2 border-b border-slate-200 bg-white text-[10px] whitespace-nowrap overflow-hidden">
          <Inbox className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="font-semibold text-slate-800">Solicitudes</span>
          <span className="text-slate-400">· {filas.length} · {nuevas} nueva{nuevas === 1 ? '' : 's'}</span>
          <span className="flex items-center gap-1 ml-1">
            {CANALES.map(c => (
              <span
                key={c}
                className={`inline-flex items-center gap-1 px-1.5 h-[16px] rounded border text-[9px] ${c === s.canal ? 'bg-white border-slate-300 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
                style={c === s.canal ? { color: CANAL_INFO[c].color } : undefined}
              >
                {CANAL_INFO[c].corto}
                <span className="font-mono tabular-nums opacity-70">{conteo(c)}</span>
              </span>
            ))}
          </span>
          <button
            type="button"
            tabIndex={-1}
            data-ancla="canal.btn.abrir"
            className={`ml-auto h-[18px] px-2 rounded border text-[9.5px] font-medium inline-flex items-center gap-1 ${abrirActivo ? 'text-white border-transparent' : 'bg-slate-100 text-slate-400 border-slate-200'} ${eAbrir.clic ? 'brightness-90' : ''}`}
            style={abrirActivo ? { backgroundColor: eAbrir.clic ? '#1e293b' : AZUL } : undefined}
          >
            <FolderOpen className="w-3 h-3" /> Abrir
          </button>
          <span className="inline-flex items-center gap-1 text-slate-500 shrink-0">
            <RefreshCw className={`w-3 h-3 ${sincronizando ? 'animate-spin' : ''}`} />
            {sincronizando ? 'Sincronizando…' : 'Al día'}
          </span>
        </div>
        <div className="flex-1 min-h-0 flex">
          <div className="w-[52%] shrink-0 flex flex-col bg-white border-r border-slate-200">
            <div className="h-[15px] shrink-0 flex items-center gap-1.5 px-1.5 border-b border-slate-200 bg-slate-100 text-[8.5px] uppercase tracking-wide text-slate-500">
              <span className="w-1.5" />
              <span className="w-[54px]">Canal</span>
              <span className="flex-1">Solicitud</span>
              <span className="w-[32px] text-right">Hora</span>
              <span className="w-[58px] text-center">Estado</span>
            </div>
            <div className="flex-1 min-h-0 overflow-auto">
              {filas.map(f => <FilaSolicitud key={f.clave} f={f} />)}
            </div>
          </div>
          <Ficha caso={caso} paso={paso} p={p} abierta={abierta} />
        </div>
      </div>
    </VentanaSistema>
  );
}

export default memo(VentanaCanal);
