import { memo } from 'react';
import { CircleCheck, CircleX, Radar, Truck } from 'lucide-react';
import type { Caso, FilaSeguimiento, PasoPlan } from '@/types/agentes';
import { estadoAncla, progresoEfectivo } from '@/components/agentes/guion';
import { ChipRegla, Cursor, Spinner } from '@/components/agentes/ui';
import { T_TABLERO, filaPropia } from '@/data/guiones/tablero';
import type { PropsVentana } from '../tipos';
import { CROMO } from '../cromo';
import VentanaSistema from '../VentanaSistema';

const FONDO = CROMO.tablero.fondo; // #0b1220
const PANEL = '#111a2e';
const BORDE = '#1e293b';
const VERDE = '#34d399';
const AMBAR = '#fbbf24';
const AZUL = '#38bdf8';

const idBase = (id?: string) => (id ?? '').replace(/_\d+$/, '');

/** Último resultado del paso `base` ya hecho (si lo hay). */
function hechoDe(caso: Caso, base: string): { ok: boolean } | undefined {
  let r: { ok: boolean } | undefined;
  for (const et of caso.plan) for (const x of et.pasos) if (idBase(x.id) === base && caso.pasosHechos[x.id]) r = { ok: caso.pasosHechos[x.id].ok };
  return r;
}

/* ─── Verificación de condiciones seguras (R18): función pura del paso ─── */
interface Verif {
  /** Cuántas condiciones ya se marcaron (0–3). */
  revelados: number;
  veredicto: boolean;
  /** true = condiciones seguras; null = sin verificar todavía. */
  seguro: boolean | null;
}

function verificacion(caso: Caso, paso: PasoPlan | undefined, p: number): Verif {
  if (paso && idBase(paso.id) === 't0') {
    const r = (v: number) => (p >= v ? 1 : 0);
    return {
      revelados: r(T_TABLERO.t0Item1) + r(T_TABLERO.t0Item2) + r(T_TABLERO.t0Item3),
      veredicto: p >= T_TABLERO.t0Veredicto,
      seguro: paso.ok !== false,
    };
  }
  const h = hechoDe(caso, 't0');
  if (h) return { revelados: 3, veredicto: true, seguro: h.ok };
  return { revelados: 0, veredicto: false, seguro: null };
}

function Condicion({ clave, titulo, detalle, estado, resaltado }: {
  clave: string; titulo: string; detalle: string; estado: 'pendiente' | 'ok' | 'no'; resaltado: boolean;
}) {
  return (
    <div
      data-ancla={`tablero.item.${clave}`}
      className="flex items-start gap-1.5 rounded px-1 py-[2px] border"
      style={{ borderColor: resaltado ? AMBAR : 'transparent', backgroundColor: resaltado ? 'rgba(251,191,36,0.12)' : undefined }}
    >
      <span className="mt-[1px] shrink-0 w-3 h-3 flex items-center justify-center">
        {estado === 'ok' && <CircleCheck className="w-3 h-3" style={{ color: VERDE }} />}
        {estado === 'no' && <CircleX className="w-3 h-3" style={{ color: AMBAR }} />}
        {estado === 'pendiente' && <span className="w-2 h-2 rounded-full border border-slate-600" />}
      </span>
      <span className="min-w-0 leading-[12px]">
        <span className="block text-[10px] font-semibold text-slate-200 truncate">{titulo}</span>
        <span className="block text-[9.5px] text-slate-400 truncate">{estado === 'pendiente' ? 'por verificar' : detalle}</span>
      </span>
    </div>
  );
}

/* ─── Mapa esquemático origen → destino ─── */
function Mapa({ origen, destino, avance, enMarcha }: { origen: string; destino: string; avance: number; enMarcha: boolean }) {
  const x0 = 14, x1 = 186, yBase = 40;
  // Curva cuadrática con control en (100, 14); posición del vehículo por interpolación de Bézier.
  const t = Math.max(0, Math.min(1, avance));
  const cx = 100, cy = 8;
  const bx = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * cx + t * t * x1;
  const by = (1 - t) * (1 - t) * yBase + 2 * (1 - t) * t * cy + t * t * yBase;
  const larga = `M${x0} ${yBase} Q${cx} ${cy} ${x1} ${yBase}`;
  return (
    <svg viewBox="0 0 200 62" className="w-full h-full" preserveAspectRatio="xMidYMid meet" aria-hidden>
      <path d={larga} fill="none" stroke="#334155" strokeWidth="1.6" strokeDasharray="3 3" />
      <path d={larga} fill="none" stroke={AZUL} strokeWidth="1.8" pathLength={100} strokeDasharray={`${Math.round(t * 100)} 200`} />
      <circle cx={x0} cy={yBase} r="3.2" fill="#0b1220" stroke={VERDE} strokeWidth="1.6" />
      <circle cx={x1} cy={yBase} r="3.2" fill="#0b1220" stroke="#94a3b8" strokeWidth="1.6" />
      <circle cx={bx} cy={by} r="4" fill={enMarcha ? AMBAR : AZUL} />
      <circle cx={bx} cy={by} r="7" fill="none" stroke={enMarcha ? AMBAR : AZUL} strokeOpacity="0.4" />
      <text x={x0} y={55} textAnchor="start" fontSize="7.5" fill="#cbd5e1">{origen}</text>
      <text x={x1} y={55} textAnchor="end" fontSize="7.5" fill="#cbd5e1">{destino}</text>
      <text x={100} y={bx > 60 && bx < 140 ? 4 : 20} textAnchor="middle" fontSize="7" fill="#64748b">{Math.round(t * 100)} de 100 del recorrido</text>
    </svg>
  );
}

function EtaChip({ confirmada }: { confirmada: boolean }) {
  return (
    <span
      className="inline-flex items-center h-[13px] px-1 rounded text-[8.5px] font-semibold"
      style={confirmada
        ? { color: '#6ee7b7', backgroundColor: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)' }
        : { color: '#fcd34d', backgroundColor: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.4)' }}
    >
      {confirmada ? 'confirmada' : 'estimada'}
    </span>
  );
}

function FilaTabla({ f, clave, estado, resaltada }: { f: FilaSeguimiento; clave: string; estado: string; resaltada: boolean }) {
  const enMarcha = f.propia && estado.startsWith('En marcha');
  return (
    <div
      data-ancla={`tablero.fila.${clave}`}
      className="grid grid-cols-[52px_minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,1fr)_96px] items-center gap-1.5 h-[17px] px-1.5 border-b text-[9.5px]"
      style={{
        borderColor: BORDE,
        backgroundColor: resaltada ? 'rgba(251,191,36,0.16)' : f.propia ? 'rgba(56,189,248,0.10)' : undefined,
        boxShadow: f.propia ? `inset 2px 0 0 ${AZUL}` : undefined,
      }}
    >
      <span className={`font-mono truncate ${f.propia ? 'text-sky-300 font-bold' : 'text-slate-400'}`}>{f.operacion}</span>
      <span className={`truncate ${f.propia ? 'text-slate-100' : 'text-slate-400'}`}>{f.cliente}</span>
      <span className={`truncate ${f.propia ? 'text-slate-200' : 'text-slate-400'}`}>{f.ruta}</span>
      <span className="truncate" style={{ color: enMarcha ? AMBAR : f.estado.includes('retraso') && !f.propia ? '#fda4af' : f.propia ? '#e2e8f0' : '#94a3b8' }}>{estado}</span>
      <span className="flex items-center gap-1 min-w-0">
        <span className={`font-mono tabular-nums ${f.propia ? 'text-slate-100' : 'text-slate-400'}`}>{f.eta}</span>
        <EtaChip confirmada={f.confirmada} />
      </span>
    </div>
  );
}

function VentanaTablero({ caso, vista, paso, progreso, velocidad, actor, medir, relojSim }: PropsVentana) {
  const p = progresoEfectivo(progreso, velocidad);
  const d = caso.datos;
  const fp = filaPropia(d);
  const tr = d.trayectoria[d.trayectoria.length - 1];
  const op = caso.operacion;
  const conductor = tr.transportador?.conductor ?? 'el conductor';
  const placa = tr.transportador?.placa ?? fp.vehiculo.split(' · ')[0];

  const base = idBase(paso?.id);
  const pasoT0 = base === 't0' ? paso : undefined;
  const pasoT2 = base === 't2' ? paso : undefined;
  const v = verificacion(caso, paso, p);

  // Registro del seguimiento (t2): vigente si el paso está en curso o ya se hizo.
  const t2Hecho = !!hechoDe(caso, 't2');
  const enT2 = !!pasoT2;
  const registrado = t2Hecho || (enT2 && p >= T_TABLERO.t2Registrado);
  const eta = estadoAncla(pasoT2, p, 'tablero.campo.eta');
  const btn = estadoAncla(pasoT2, p, 'tablero.btn.registrar');
  const tecleado = eta.tecleo === undefined ? '' : fp.eta.slice(0, Math.floor(eta.tecleo * fp.eta.length));
  const etaVisible = registrado ? fp.eta : tecleado;
  const escribiendo = !registrado && eta.tecleo !== undefined && eta.tecleo < 1;

  // Estado de la fila propia: «en marcha» si el conductor iba conduciendo y aún no se registró el reintento.
  const enMarcha = v.seguro === false && !registrado;
  const estadoPropia = enMarcha ? 'En marcha · llamada diferida' : fp.estado;
  const resaltadaPropia = estadoAncla(pasoT0 ?? pasoT2, p, 'tablero.fila.propia').resaltado;

  // Avance del recorrido: constante antes del registro; avanza un poco al registrar la ETA.
  const avance = registrado ? 0.62 : enT2 ? 0.55 + 0.07 * Math.min(1, Math.max(0, (p - 0.2) / 0.6)) : 0.55;

  const itemes: { clave: 'vehiculo' | 'conductor' | 'decision'; titulo: string; si: string; no: string; t: number }[] = [
    { clave: 'vehiculo', titulo: `Vehículo ${placa}`, si: 'Detenido o en parada segura', no: 'En movimiento por la vía', t: T_TABLERO.t0Item1 },
    { clave: 'conductor', titulo: conductor, si: 'Disponible y atento', no: 'Va conduciendo', t: T_TABLERO.t0Item2 },
    { clave: 'decision', titulo: 'Decisión de contacto', si: 'Puede atender la llamada', no: 'No llamar ahora · diferir', t: T_TABLERO.t0Item3 },
  ];

  let n = 0;
  return (
    <VentanaSistema
      ventana="tablero"
      vista={vista}
      actor={actor}
      humano={paso?.humano}
      paso={paso}
      progreso={p}
      sesion={d.sesion}
      relojSim={relojSim}
      medir={medir}
    >
      <div className="absolute inset-0 flex flex-col overflow-hidden text-slate-200" style={{ backgroundColor: FONDO }}>
        {/* Cabecera de la torre de control */}
        <div className="shrink-0 h-[22px] flex items-center gap-2 px-2 border-b text-[10px] whitespace-nowrap overflow-hidden" style={{ borderColor: BORDE, backgroundColor: PANEL }}>
          <Radar className="w-3.5 h-3.5 shrink-0" style={{ color: AZUL }} />
          <span className="font-semibold text-slate-100">Seguimiento en ruta</span>
          <span className="text-slate-500">· {d.tablero.length} operaciones en tránsito</span>
          <span className="ml-auto inline-flex items-center gap-1 text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: VERDE }} /> en vivo
          </span>
        </div>

        {/* Operaciones en tránsito */}
        <div className="shrink-0 border-b" style={{ borderColor: BORDE }}>
          <div className="grid grid-cols-[52px_minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,1fr)_96px] gap-1.5 h-[14px] items-center px-1.5 text-[8.5px] uppercase tracking-wider text-slate-500 font-semibold" style={{ backgroundColor: '#0e1626' }}>
            <span>Operación</span><span>Cliente</span><span>Ruta</span><span>Estado</span><span>Llegada</span>
          </div>
          {d.tablero.map((f, i) => (
            <FilaTabla
              key={`${f.operacion}-${i}`}
              f={f}
              clave={f.propia ? 'propia' : String(n++)}
              estado={f.propia ? estadoPropia : f.estado}
              resaltada={f.propia && resaltadaPropia}
            />
          ))}
        </div>

        {/* Panel inferior: verificación · mapa · registro */}
        <div className="flex-1 min-h-0 grid grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)_minmax(0,0.95fr)] gap-1.5 p-1.5">
          {/* Condiciones seguras R18 */}
          <div className="rounded border px-1.5 py-1 min-h-0 overflow-hidden" style={{ borderColor: BORDE, backgroundColor: PANEL }}>
            <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
              Condiciones seguras <ChipRegla codigo="R18" />
            </div>
            <div className="space-y-[1px]">
              {itemes.map((it, i) => {
                const rev = i < v.revelados;
                const res = estadoAncla(pasoT0, p, `tablero.item.${it.clave}`).resaltado;
                // La decisión depende de las dos anteriores.
                const estado = !rev ? 'pendiente' : v.seguro === false ? 'no' : 'ok';
                return (
                  <Condicion key={it.clave} clave={it.clave} titulo={it.titulo} detalle={v.seguro === false ? it.no : it.si} estado={estado} resaltado={res} />
                );
              })}
            </div>
            <div className="mt-0.5 text-[9.5px] font-semibold truncate flex items-center gap-1" style={{ color: v.veredicto ? (v.seguro ? VERDE : AMBAR) : '#64748b' }}>
              {pasoT0 && !v.veredicto && <Spinner className="w-2.5 h-2.5" color="#64748b" />}
              {v.veredicto ? (v.seguro ? 'Puede atender · se llama' : 'Conduciendo · se difiere') : 'Verificación pendiente'}
            </div>
          </div>

          {/* Mapa */}
          <div className="rounded border px-1.5 py-1 min-h-0 flex flex-col overflow-hidden" style={{ borderColor: BORDE, backgroundColor: PANEL }}>
            <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
              <Truck className="w-3 h-3" /> {op.id} · recorrido
            </div>
            <div className="flex-1 min-h-0">
              <Mapa origen={op.nodoOrigen.ciudad} destino={op.nodoDestino.ciudad} avance={avance} enMarcha={enMarcha} />
            </div>
          </div>

          {/* Registro de la llegada estimada (R19) */}
          <div className="rounded border px-1.5 py-1 min-h-0 flex flex-col gap-1 overflow-hidden" style={{ borderColor: BORDE, backgroundColor: PANEL }}>
            <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
              Llegada <ChipRegla codigo="R19" />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">Hora de llegada</span>
              <div
                data-ancla="tablero.campo.eta"
                className={`h-5 flex items-center px-1.5 text-[11px] rounded font-mono min-w-0 ${eta.foco ? 'border-2 border-sky-400' : 'border border-slate-600'} ${eta.resaltado ? 'bg-amber-100 text-slate-900' : 'bg-slate-900 text-slate-100'}`}
              >
                <span className="truncate">{etaVisible}</span>
                {escribiendo && <Cursor />}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                data-ancla="tablero.btn.registrar"
                className={`h-[20px] px-2 inline-flex items-center rounded text-[10px] font-bold select-none whitespace-nowrap ${btn.clic ? 'translate-y-[1px]' : ''}`}
                style={{ backgroundColor: registrado ? '#047857' : '#0369a1', color: '#fff', filter: btn.clic ? 'brightness(0.8)' : undefined, opacity: !registrado && !enT2 ? 0.6 : 1 }}
              >
                {registrado ? 'Registrado' : 'Registrar'}
              </span>
              <EtaChip confirmada={registrado ? false : fp.confirmada} />
            </div>
            <div className="text-[9px] leading-[11px] text-slate-400 min-w-0">
              {registrado ? `Llegada ${fp.eta} guardada como estimada: solo lo confirmado se promete.` : 'Solo la información confirmada se promete al cliente.'}
            </div>
          </div>
        </div>
      </div>
    </VentanaSistema>
  );
}

export default memo(VentanaTablero);
