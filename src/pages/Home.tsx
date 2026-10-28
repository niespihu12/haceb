import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Bot,
  CheckCircle2,
  ChevronRight,
  Clock,
  Eye,
  Handshake,
  PhoneCall,
  Search,
  Timer,
  Truck,
  UserCheck,
  X,
  XCircle,
} from 'lucide-react'
import { useSimulation } from '@/hooks/useSimulation'
import { cn, formatDuracion, formatNumber, formatPercent } from '@/lib/utils'
import { CanalBadge, CategoriaBadge, EtapaBadge, SimuladoTag } from '@/components/shared'
import {
  BLOQUE_COLOR,
  ETAPAS_FLUJO,
  ETAPA_BLOQUE,
  ETAPA_LABEL,
  ETAPA_LABEL_CORTO,
  ETAPA_NUMERO,
  EXCEPCION_LABEL,
  PLANTILLA_EXCEPCION,
  esTerminal,
} from '@/data/mockData'
import { BLOQUES, CANALES_DEF, DOC_KICKER, DOC_TITULO, KPIS_INSUMO, OBJETIVO_TEXTO } from '@/data/procesoData'
import type { BloqueFlujo, EtapaOperacion, LogEntry, Operacion, TipoExcepcion } from '@/types'

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }
const itemVariants = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } }

/** Estados de espera y de fin que se muestran junto a las 17 etapas. */
const ESTADOS_APARTE: { etapa: EtapaOperacion; nombre: string }[] = [
  { etapa: 'EsperaDatos', nombre: 'Espera de datos' },
  { etapa: 'Escalada', nombre: 'Escalada' },
  { etapa: 'Cerrada', nombre: 'Cerrada' },
  { etapa: 'Cancelada', nombre: 'Cancelada' },
]

type FiltroRapido = 'todas' | 'novedad' | 'escalada' | 'espera'
const FILTROS: { id: FiltroRapido; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'novedad', label: 'Con novedad' },
  { id: 'escalada', label: 'Escaladas' },
  { id: 'espera', label: 'Esperando datos' },
]

const kpiDef = (id: string) => KPIS_INSUMO.find((k) => k.id === id)

/** Color del punto de la bitácora según el evento. */
function colorLog(log: LogEntry): string {
  if (log.tipo === 'sistema' || log.evento === 'Sistema') return 'bg-slate-400'
  switch (log.evento) {
    case 'NovedadRegistrada':
    case 'CasoSeguimientoCreado':
    case 'TarifaEscalada':
      return 'bg-excepcion'
    case 'DecisionCoordinador':
      return 'bg-catC'
    case 'OperacionCerrada':
      return 'bg-success'
    case 'OperacionCancelada':
      return 'bg-slate-500'
    case 'LlamadaPreventiva':
    case 'LlamadaCierre':
    case 'ConfirmacionDoble':
      return 'bg-comunicacion'
    default:
      return 'bg-captura'
  }
}

function prioridadEtapa(o: Operacion): number {
  if (o.etapa === 'Escalada') return 0
  if (o.excepcion) return 1
  if (o.etapa === 'EsperaDatos') return 2
  return 3
}

function Vacio({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] text-aion-muted text-center py-4">{children}</p>
}

export default function Home() {
  const navigate = useNavigate()
  const { allOperaciones, logs, kpis, canalMetrics, avanzarOperacion, cancelarOperacion, ahora } = useSimulation()

  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState<FiltroRapido>('todas')
  const [confirmando, setConfirmando] = useState<string | null>(null)

  // ---- Operaciones por etapa -------------------------------------------------
  const conteo = useMemo(() => {
    const m = new Map<EtapaOperacion, number>()
    for (const o of allOperaciones) m.set(o.etapa, (m.get(o.etapa) ?? 0) + 1)
    return m
  }, [allOperaciones])

  const maxEtapa = useMemo(() => Math.max(1, ...ETAPAS_FLUJO.map((e) => conteo.get(e) ?? 0)), [conteo])

  // ---- Carga por bloque (operaciones activas) -----------------------------------
  const porBloque = useMemo(
    () =>
      BLOQUES.map((b) => ({
        id: b.id as BloqueFlujo,
        name: b.nombre,
        color: b.color,
        value: allOperaciones.filter((o) => !esTerminal(o.etapa) && o.bloque === b.id).length,
      })).filter((d) => d.value > 0),
    [allOperaciones],
  )
  const totalActivas = porBloque.reduce((s, d) => s + d.value, 0)

  // ---- Excepciones / novedades por tipo -------------------------------------------
  const excepcionesTop = useMemo(() => {
    const mapa = new Map<TipoExcepcion, number>()
    for (const o of allOperaciones) {
      for (const e of [...o.excepcionesPrevias, ...(o.excepcion ? [o.excepcion] : [])]) {
        mapa.set(e.tipo, (mapa.get(e.tipo) ?? 0) + 1)
      }
    }
    return Array.from(mapa.entries())
      .map(([tipo, value]) => ({ tipo, value, plantilla: PLANTILLA_EXCEPCION[tipo] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)
  }, [allOperaciones])
  const maxExc = Math.max(1, ...excepcionesTop.map((e) => e.value))

  // ---- Operaciones activas (tabla) ---------------------------------------------------
  const activas = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return allOperaciones
      .filter((o) => !esTerminal(o.etapa))
      .filter((o) => {
        if (filtro === 'novedad' && !o.excepcion) return false
        if (filtro === 'escalada' && o.etapa !== 'Escalada') return false
        if (filtro === 'espera' && o.etapa !== 'EsperaDatos') return false
        if (!q) return true
        return (
          o.id.toLowerCase().includes(q) ||
          o.cliente.nombre.toLowerCase().includes(q) ||
          o.nodoOrigen.ciudad.toLowerCase().includes(q) ||
          o.nodoDestino.ciudad.toLowerCase().includes(q) ||
          (o.transportador?.nombre.toLowerCase().includes(q) ?? false) ||
          (o.excepcion ? EXCEPCION_LABEL[o.excepcion.tipo].toLowerCase().includes(q) : false)
        )
      })
      .sort((a, b) => prioridadEtapa(a) - prioridadEtapa(b) || b.seq - a.seq)
  }, [allOperaciones, busqueda, filtro])

  const totalActivasSinFiltro = useMemo(() => allOperaciones.filter((o) => !esTerminal(o.etapa)).length, [allOperaciones])
  const ultimosLogs = useMemo(() => logs.slice(-12).reverse(), [logs])

  // ---- KPIs del insumo (los otros 3 viven en la Control Tower) -------------------------
  const kpiItems = [
    { id: 'respuestaCliente', valor: formatDuracion(kpis.respuestaClienteMin), sub: 'promedio por intento de contacto', icon: Clock, color: 'text-captura', bg: 'bg-captura-light' },
    { id: 'respuestaTransportador', valor: formatDuracion(kpis.respuestaTransportadorMin), sub: 'promedio por intento de contacto', icon: Truck, color: 'text-validacion', bg: 'bg-validacion-light' },
    { id: 'confirmacionesAutomaticas', valor: formatPercent(kpis.pctConfirmacionesAutomaticas / 100, 0), sub: 'sin intervención del coordinador', icon: Bot, color: 'text-catB', bg: 'bg-catB-light' },
    { id: 'llamadasExitosas', valor: formatPercent(kpis.pctLlamadasExitosas / 100, 0), sub: `${formatNumber(Math.round(kpis.contactosPorOperacion * 10) / 10)} llamadas por operación`, icon: PhoneCall, color: 'text-liberacion', bg: 'bg-liberacion-light' },
    { id: 'negociacionesCompletadas', valor: formatNumber(kpis.negociacionesCompletadas), sub: `${formatPercent(kpis.pctNegociacionesCompletadas / 100, 0)} de las negociaciones`, icon: Handshake, color: 'text-promesa-dark', bg: 'bg-promesa-light' },
    { id: 'cumplimientoCompromisos', valor: formatPercent(kpis.pctCumplimientoCompromisos / 100, 0), sub: 'cumplidos sobre vencidos', icon: CheckCircle2, color: 'text-success', bg: 'bg-success-light' },
  ]

  return (
    <div className="max-w-[1440px] mx-auto px-6 pb-12 space-y-6">
      {/* ------------------------------------------------------------------ */}
      {/* Encabezado                                                          */}
      {/* ------------------------------------------------------------------ */}
      <motion.section variants={containerVariants} initial="hidden" animate="visible">
        <motion.div variants={itemVariants} className="glass-panel rounded-xl p-5 flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0 flex-1">
            <p className="text-[10.5px] font-bold uppercase tracking-widest text-captura mb-1">{DOC_KICKER}</p>
            <h1 className="text-lg font-bold text-aion-ink leading-snug">{DOC_TITULO}</h1>
            <p className="text-[12.5px] text-aion-muted mt-1.5 truncate" title={OBJETIVO_TEXTO}>
              Agentes de IA que llaman, confirman información, gestionan compromisos, detectan novedades y mantienen sincronizados a todos los participantes.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <SimuladoTag />
            <span className="badge-compact bg-slate-100 text-aion-muted font-mono">{formatNumber(kpis.total)} operaciones</span>
            <span className="badge-compact bg-captura-light text-captura font-mono">{formatNumber(kpis.activas)} activas</span>
          </div>
        </motion.div>
      </motion.section>

      {/* ------------------------------------------------------------------ */}
      {/* Canales de entrada                                                  */}
      {/* ------------------------------------------------------------------ */}
      <motion.section variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {CANALES_DEF.map((def) => {
          const m = canalMetrics.find((x) => x.canal === def.id)
          if (!m) return null
          return (
            <motion.button
              key={def.id}
              variants={itemVariants}
              onClick={() => navigate('/pipeline')}
              className="glass-panel rounded-xl p-4 text-left border-t-4 hover:shadow-card-hover transition-shadow min-w-0"
              style={{ borderTopColor: def.color }}
              title={def.descripcion}
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[13px] font-bold text-aion-ink truncate">{def.nombre}</span>
                <CanalBadge canal={def.id} className="shrink-0" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-[9.5px] text-aion-muted uppercase tracking-wide">Total</p>
                  <p className="text-xl font-bold text-aion-ink leading-tight">{m.total}</p>
                </div>
                <div>
                  <p className="text-[9.5px] text-aion-muted uppercase tracking-wide">Activas</p>
                  <p className="text-xl font-bold leading-tight" style={{ color: def.color }}>{m.activas}</p>
                </div>
                <div>
                  <p className="text-[9.5px] text-aion-muted uppercase tracking-wide">Escaladas</p>
                  <p className={cn('text-xl font-bold leading-tight', m.escaladas > 0 ? 'text-catC-dark' : 'text-slate-300')}>{m.escaladas}</p>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-aion-line flex items-center justify-between text-[10px] text-aion-muted font-mono">
                <span>{Math.round(m.pctAutomatico)}% automático</span>
                <span>{m.contactosPorOperacion.toFixed(1).replace(".", ",")} contactos/op.</span>
              </div>
            </motion.button>
          )
        })}
      </motion.section>

      {/* ------------------------------------------------------------------ */}
      {/* KPIs del insumo                                                     */}
      {/* ------------------------------------------------------------------ */}
      <motion.section variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpiItems.map((item) => {
          const def = kpiDef(item.id)
          return (
            <motion.div
              key={item.id}
              variants={itemVariants}
              className="glass-panel rounded-xl p-4 hover:shadow-card-hover transition-shadow"
              title={def?.definicion}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', item.bg)}>
                  <item.icon className={cn('w-4 h-4', item.color)} />
                </div>
                {def && (
                  <span className="flex items-center gap-0.5 text-[9.5px] text-aion-muted font-mono" title={`Mejor cuando es ${def.mejor}`}>
                    {def.mejor === 'alto' ? <ArrowUp className="w-3 h-3 text-success" /> : <ArrowDown className="w-3 h-3 text-success" />}
                    mejor
                  </span>
                )}
              </div>
              <p className="text-[10.5px] text-aion-muted uppercase tracking-wide mb-1 leading-tight min-h-[26px]">{def?.nombre ?? item.id}</p>
              <p className="text-xl font-bold text-aion-ink">{item.valor}</p>
              <p className="text-[10px] text-aion-muted mt-0.5 truncate">{item.sub}</p>
            </motion.div>
          )
        })}
      </motion.section>

      {/* ------------------------------------------------------------------ */}
      {/* Etapas + bloques + novedades + bitácora                              */}
      {/* ------------------------------------------------------------------ */}
      <motion.section variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div variants={itemVariants} className="lg:col-span-2 glass-panel rounded-xl p-5">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="section-title">
              <Activity className="w-4 h-4 text-captura" />
              Operaciones por etapa del flujo
            </h3>
            <div className="flex items-center gap-3 flex-wrap">
              {BLOQUES.map((b) => (
                <span key={b.id} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: b.color }} />
                  <span className="text-[10px] text-aion-muted">{b.nombre}</span>
                </span>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            {ETAPAS_FLUJO.map((e) => {
              const n = conteo.get(e) ?? 0
              const color = BLOQUE_COLOR[ETAPA_BLOQUE[e]].color
              return (
                <div key={e} className="flex items-center gap-3">
                  <span className="w-7 text-[10.5px] font-mono text-aion-muted text-right shrink-0">[{ETAPA_NUMERO[e]}]</span>
                  <span className="w-28 text-[11px] text-aion-muted text-right shrink-0 truncate" title={ETAPA_LABEL[e]}>
                    {ETAPA_LABEL_CORTO[e]}
                  </span>
                  <div className="flex-1 h-5 bg-slate-100 rounded-md overflow-hidden relative">
                    <motion.div
                      className="h-full rounded-md"
                      style={{ backgroundColor: color }}
                      initial={{ width: '0%' }}
                      animate={{ width: `${(n / maxEtapa) * 100}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-aion-ink">{n}</span>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="pt-3 mt-3 border-t border-aion-line grid grid-cols-2 sm:grid-cols-4 gap-2">
            {ESTADOS_APARTE.map(({ etapa, nombre }) => {
              const c = BLOQUE_COLOR[ETAPA_BLOQUE[etapa]]
              return (
                <div key={etapa} className="rounded-lg border px-3 py-2 text-center" style={{ borderColor: `${c.color}40`, backgroundColor: c.bg }}>
                  <p className="text-lg font-bold" style={{ color: c.color }}>{conteo.get(etapa) ?? 0}</p>
                  <p className="text-[10px] text-aion-muted">{nombre}</p>
                </div>
              )
            })}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-5">
          <div className="glass-panel rounded-xl p-4">
            <h4 className="text-xs font-semibold text-aion-ink mb-2 uppercase tracking-wide flex items-center justify-between">
              <span>Carga por bloque</span>
              <span className="text-[10px] font-normal normal-case text-aion-muted">{totalActivas} activas</span>
            </h4>
            {porBloque.length > 0 ? (
              <ResponsiveContainer width="100%" height={132}>
                <PieChart>
                  <Pie data={porBloque} cx="50%" cy="50%" innerRadius={36} outerRadius={58} dataKey="value" nameKey="name" strokeWidth={2} stroke="#fff" isAnimationActive={false}>
                    {porBloque.map((entry) => (
                      <Cell key={entry.id} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e4e7ec', fontSize: 12 }} formatter={(value) => [formatNumber(Number(value)), 'Operaciones']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[132px] flex items-center justify-center text-xs text-aion-muted">Sin operaciones activas</div>
            )}
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-1">
              {porBloque.map((f) => (
                <span key={f.id} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: f.color }} />
                  <span className="text-[10px] text-aion-muted">{f.name} · {f.value}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-xl p-4">
            <h4 className="text-xs font-semibold text-aion-ink mb-3 uppercase tracking-wide flex items-center justify-between">
              <span>Excepciones y novedades</span>
              <span className="text-[10px] font-normal normal-case text-aion-muted">{kpis.conNovedad} activas con novedad</span>
            </h4>
            {excepcionesTop.length === 0 ? (
              <Vacio>Sin novedades registradas aún</Vacio>
            ) : (
              <div className="space-y-2.5">
                {excepcionesTop.map((d) => (
                  <div key={d.tipo} title={`${d.plantilla.regla} · ${d.plantilla.politica}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] text-slate-700 flex-1 truncate">{d.plantilla.nombre}</span>
                      <CategoriaBadge categoria={d.plantilla.categoriaBase} className="!text-[9.5px] !px-1.5 !py-0" />
                      <span className="text-[11px] font-mono font-semibold text-aion-ink w-5 text-right">{d.value}</span>
                    </div>
                    <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-excepcion/70" style={{ width: `${(d.value / maxExc) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-panel rounded-xl p-4">
            <h4 className="text-xs font-semibold text-aion-ink mb-3 uppercase tracking-wide">Bitácora de eventos</h4>
            <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
              {ultimosLogs.length === 0 ? (
                <Vacio>Inicia la simulación para ver los eventos en marcha</Vacio>
              ) : (
                ultimosLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2">
                    <span className={cn('w-1.5 h-1.5 rounded-full mt-1.5 shrink-0', colorLog(log))} />
                    <div className="min-w-0">
                      <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">{log.texto}</p>
                      <p className="text-[10px] text-aion-muted font-mono">
                        {log.evento !== 'Sistema' ? `${log.evento} · ` : ''}
                        {new Date(log.ts).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                        {log.operacionId && (
                          <>
                            {' · '}
                            <Link to={`/operacion/${log.operacionId}`} className="text-captura hover:underline">
                              {log.operacionId}
                            </Link>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* ------------------------------------------------------------------ */}
      {/* Tabla de operaciones activas                                         */}
      {/* ------------------------------------------------------------------ */}
      <motion.section variants={containerVariants} initial="hidden" animate="visible">
        <motion.div variants={itemVariants} className="glass-panel rounded-xl overflow-hidden">
          <div className="p-4 border-b border-aion-line flex items-center justify-between gap-4 flex-wrap">
            <h3 className="section-title flex-wrap">
              <Truck className="w-4 h-4 text-captura" />
              Operaciones activas
              <span className="badge-compact bg-captura-light text-captura ml-1">{totalActivasSinFiltro}</span>
              {kpis.enRiesgoSLA > 0 && (
                <span className="badge-compact bg-error-light text-error flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {kpis.enRiesgoSLA} en riesgo de SLA
                </span>
              )}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1">
                {FILTROS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFiltro(f.id)}
                    className={cn(
                      'px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors',
                      filtro === f.id ? 'bg-captura text-white border-captura' : 'bg-white text-aion-muted border-aion-line hover:text-captura hover:border-captura/40',
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-aion-muted" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar operación, cliente, ciudad, transportador…"
                  className="pl-8 pr-7 py-1.5 text-xs border border-aion-line rounded-lg bg-white w-72 focus:outline-none focus:ring-2 focus:ring-captura/20 focus:border-captura transition-all"
                />
                {busqueda && (
                  <button onClick={() => setBusqueda('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-aion-muted hover:text-aion-ink" aria-label="Limpiar búsqueda">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-aion-line bg-slate-50/70 text-[10px] uppercase tracking-wider text-aion-muted">
                  <th className="text-left px-4 py-2.5 font-semibold">Operación</th>
                  <th className="text-left px-4 py-2.5 font-semibold">Canal</th>
                  <th className="text-left px-4 py-2.5 font-semibold">Cliente</th>
                  <th className="text-left px-4 py-2.5 font-semibold">Ruta</th>
                  <th className="text-left px-4 py-2.5 font-semibold">Etapa</th>
                  <th className="text-left px-4 py-2.5 font-semibold">Novedad</th>
                  <th className="text-left px-4 py-2.5 font-semibold">Transportador</th>
                  <th className="text-left px-4 py-2.5 font-semibold">Edad</th>
                  <th className="text-left px-4 py-2.5 font-semibold">Progreso</th>
                  <th className="text-center px-4 py-2.5 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {activas.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-aion-muted">
                      No hay operaciones activas con este filtro
                    </td>
                  </tr>
                ) : (
                  activas.slice(0, 40).map((o) => {
                    const edadMin = (ahora - o.fechaCreacion) / 60000
                    const color = BLOQUE_COLOR[o.bloque].color
                    const delAgente = o.origen === 'agentes'
                    return (
                      <tr key={o.id} onClick={() => navigate(`/operacion/${o.id}`)} className="border-b border-aion-line hover:bg-captura-light/50 cursor-pointer transition-colors">
                        <td className="px-4 py-2.5 font-mono text-[11px] text-captura font-medium whitespace-nowrap">{o.id}</td>
                        <td className="px-4 py-2.5"><CanalBadge canal={o.canal} /></td>
                        <td className="px-4 py-2.5 text-slate-700 max-w-[220px]">
                          <span className="block truncate font-medium">{o.cliente.nombre}</span>
                          <span className="block truncate text-[10.5px] text-aion-muted font-mono">{o.mercancia.tipo} · {o.mercancia.unidades} und</span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-700 whitespace-nowrap">
                          {o.nodoOrigen.ciudad} <span className="text-aion-muted">→</span> {o.nodoDestino.ciudad}
                          <span className="block text-[10.5px] text-aion-muted font-mono">{o.distanciaKm} km · {o.vehiculoRequerido}</span>
                        </td>
                        <td className="px-4 py-2.5"><EtapaBadge etapa={o.etapa} /></td>
                        <td className="px-4 py-2.5 max-w-[220px]">
                          {o.excepcion ? (
                            <span className="flex items-center gap-1.5 min-w-0">
                              <CategoriaBadge categoria={o.excepcion.categoria} className="shrink-0" />
                              <span className="truncate text-aion-muted">{EXCEPCION_LABEL[o.excepcion.tipo]}</span>
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-slate-700 max-w-[170px]">
                          {o.transportador ? <span className="block truncate">{o.transportador.nombre}</span> : <span className="text-slate-300">sin asignar</span>}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-[11px] text-aion-muted whitespace-nowrap">{formatDuracion(edadMin)}</td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-[width] duration-500" style={{ backgroundColor: color, width: `${o.progreso}%` }} />
                            </div>
                            <span className="text-[10px] text-aion-muted font-mono">{o.progreso}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
                          {confirmando === o.id ? (
                            <div className="flex items-center justify-center gap-1 whitespace-nowrap">
                              <span className="text-[10.5px] text-error font-medium">¿Cancelar?</span>
                              <button
                                onClick={() => {
                                  cancelarOperacion(o.id)
                                  setConfirmando(null)
                                }}
                                className="px-2 py-1 rounded-md bg-error text-white text-[10.5px] font-medium hover:opacity-90"
                              >
                                Sí
                              </button>
                              <button onClick={() => setConfirmando(null)} className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-[10.5px] font-medium hover:bg-slate-200">
                                No
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-1">
                              <button onClick={() => navigate(`/operacion/${o.id}`)} className="p-1 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors" title="Ver el detalle de la operación">
                                <Eye className="w-3 h-3" />
                              </button>
                              {o.etapa === 'Escalada' ? (
                                <button
                                  onClick={() => navigate('/coordinador')}
                                  className="flex items-center gap-1 px-2 py-1 rounded-md bg-catC text-white hover:bg-catC-dark transition-colors text-[10.5px] font-medium"
                                  title="Decidir en la Mesa del coordinador"
                                >
                                  <UserCheck className="w-3 h-3" />
                                  Mesa
                                </button>
                              ) : (
                                <button
                                  onClick={() => avanzarOperacion(o.id)}
                                  disabled={delAgente}
                                  className="p-1 rounded-md bg-captura-light text-captura hover:bg-captura hover:text-white transition-colors disabled:opacity-40 disabled:hover:bg-captura-light disabled:hover:text-captura disabled:cursor-not-allowed"
                                  title={delAgente ? 'La mueve el equipo de agentes' : 'Avanzar una etapa del flujo'}
                                >
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              )}
                              <button
                                onClick={() => setConfirmando(o.id)}
                                disabled={delAgente}
                                className="p-1 rounded-md bg-slate-100 text-slate-500 hover:bg-slate-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                title={delAgente ? 'La mueve el equipo de agentes' : 'Cancelar la operación (requiere al responsable, R28)'}
                              >
                                <XCircle className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
          {activas.length > 40 && (
            <p className="px-4 py-2 text-[10.5px] text-aion-muted border-t border-aion-line flex items-center gap-1.5">
              <Timer className="w-3 h-3" />
              Se muestran 40 de {activas.length} operaciones; el Pipeline lista el resto.
            </p>
          )}
        </motion.div>
      </motion.section>
    </div>
  )
}
