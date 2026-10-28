import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bot,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock,
  Database,
  FileText,
  FolderOpen,
  GitBranch,
  Handshake,
  ListChecks,
  MapPin,
  Package,
  PhoneCall,
  Radar,
  ShieldCheck,
  Truck,
  Undo2,
  UserCheck,
  Wallet,
  XCircle,
  Zap,
} from 'lucide-react'
import { useSimulation } from '@/hooks/useSimulation'
import { cn, formatCOP, formatCOPLargo, formatDuracion, formatFechaDia, formatFechaHora, formatNumber } from '@/lib/utils'
import { CanalBadge, CategoriaBadge, EtapaBadge, SimuladoTag } from '@/components/shared'
import {
  BLOQUE_COLOR,
  CANAL_INFO,
  ETAPAS_FLUJO,
  ETAPA_LABEL,
  ETAPA_LABEL_CORTO,
  ETAPA_NUMERO,
  EXCEPCION_LABEL,
  PLANTILLA_EXCEPCION,
  esEtapaFlujo,
  esTerminal,
} from '@/data/mockData'
import { BLOQUES, DATOS_MINIMOS, EXPEDIENTE_CONTENIDO, FLUJO_ETAPAS } from '@/data/procesoData'
import type { Alternativa, Compromiso, EtapaFlujo, Excepcion, Llamada, Oferta, Operacion, Soporte, TrazaDecision } from '@/types'

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }
const itemVariants = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } }

// --- Etiquetas y estilos locales -------------------------------------------------------

const RESULTADO_LLAMADA: Record<Llamada['resultado'], { label: string; clase: string }> = {
  exitosa: { label: 'exitosa', clase: 'bg-success-light text-success' },
  sin_respuesta: { label: 'sin respuesta', clase: 'bg-slate-100 text-slate-600' },
  reprogramada: { label: 'reprogramada', clase: 'bg-promesa-light text-promesa-dark' },
  con_novedad: { label: 'con novedad', clase: 'bg-excepcion-light text-excepcion-dark' },
}

const ESTADO_OFERTA: Record<Oferta['estado'], { label: string; clase: string }> = {
  aceptada_preliminar: { label: 'Aceptación preliminar', clase: 'bg-success-light text-success' },
  sobre_tope: { label: 'Sobre el tope', clase: 'bg-excepcion-light text-excepcion-dark' },
  sin_interes: { label: 'Sin interés', clase: 'bg-slate-100 text-slate-600' },
  contraoferta_ok: { label: 'Contraoferta aceptada', clase: 'bg-comunicacion-light text-comunicacion-dark' },
}

const ESTADO_COMPROMISO: Record<Compromiso['estado'], { label: string; clase: string }> = {
  pendiente: { label: 'pendiente', clase: 'bg-promesa-light text-promesa-dark' },
  cumplido: { label: 'cumplido', clase: 'bg-success-light text-success' },
  incumplido: { label: 'incumplido', clase: 'bg-excepcion-light text-excepcion-dark' },
}

const PARTE_LABEL: Record<Compromiso['parte'], string> = {
  cliente: 'Cliente',
  transportador: 'Transportador',
  coordinador: 'Coordinador',
  agente: 'Agente de IA',
}

const SLA_CLASE: Record<Alternativa['impactoSLA'], string> = {
  ninguno: 'bg-success-light text-success',
  bajo: 'bg-slate-100 text-slate-600',
  medio: 'bg-promesa-light text-promesa-dark',
  alto: 'bg-excepcion-light text-excepcion-dark',
}

const EJECUTOR_CLASE = (e: TrazaDecision['ejecutor']): string =>
  e === 'Coordinador' ? 'bg-catC text-white' : e === 'Sistema' ? 'bg-catA text-white' : 'bg-catB text-white'

const signoCOP = (v: number): string => (v === 0 ? 'sin costo' : `${v > 0 ? '+' : '−'}${formatCOP(Math.abs(v))}`)
const signoHoras = (h: number): string => (h === 0 ? 'sin demora' : `${h > 0 ? '+' : '−'}${h} h`)

// --- Piezas pequeñas ---------------------------------------------------------------------

function Campo({ label, value, mono = false, pendiente = false }: { label: string; value: string; mono?: boolean; pendiente?: boolean }) {
  return (
    <div className={cn('rounded-lg border px-3 py-2', pendiente ? 'border-promesa/40 bg-promesa-light/50' : 'border-aion-line bg-white/70')}>
      <p className="text-[10px] text-aion-muted uppercase tracking-wide mb-0.5 flex items-center gap-1.5">
        {label}
        {pendiente && <span className="badge-compact !py-0 !px-1.5 bg-promesa text-white text-[9px]">pendiente</span>}
      </p>
      <p className={cn('text-[13px] font-medium text-aion-ink break-words', mono && 'font-mono text-[12px]')}>{value}</p>
    </div>
  )
}

function Vacio({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-aion-muted py-4 text-center">{children}</p>
}

function Panel({ icon: Icon, titulo, color = 'text-captura', extra, children }: { icon: React.ElementType; titulo: string; color?: string; extra?: React.ReactNode; children: React.ReactNode }) {
  return (
    <motion.div variants={itemVariants} className="glass-panel rounded-xl p-5">
      <h3 className="section-title mb-4 flex-wrap">
        <Icon className={cn('w-4 h-4', color)} />
        {titulo}
        {extra}
      </h3>
      {children}
    </motion.div>
  )
}

function ExcepcionPanel({ exc, actual }: { exc: Excepcion; actual: boolean }) {
  const plantilla = PLANTILLA_EXCEPCION[exc.tipo]
  return (
    <div className={cn('rounded-xl border p-4 space-y-3', actual ? 'border-excepcion/30 bg-excepcion-light/30' : 'border-aion-line bg-white')}>
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="min-w-0">
          <p className="text-[13.5px] font-semibold text-aion-ink leading-snug">{exc.titulo}</p>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <CategoriaBadge categoria={exc.categoria} />
            <span className="badge-compact bg-slate-100 text-aion-muted">{EXCEPCION_LABEL[exc.tipo]}</span>
            <span className="badge-compact bg-slate-100 text-aion-muted">origen: {ETAPA_LABEL_CORTO[exc.etapaOrigen]}</span>
            <span className="badge-compact bg-slate-100 text-aion-muted font-mono">{plantilla.regla} · {exc.politica}</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          {exc.resueltaEn ? (
            <span className={cn('badge-compact font-bold', exc.resueltaPor === 'coordinador' ? 'bg-catC-light text-catC-dark' : 'bg-catB-light text-catB')}>
              {exc.resueltaPor === 'coordinador' ? 'resuelta por el coordinador' : 'resuelta por el agente'}
              {exc.alternativaElegida ? ` · opción ${exc.alternativaElegida}` : ''}
            </span>
          ) : (
            <span className="badge-compact bg-excepcion-light text-excepcion font-bold">abierta</span>
          )}
          <p className="text-[10px] text-aion-muted font-mono mt-1">
            {formatFechaHora(exc.detectadaEn)}
            {exc.resueltaEn ? ` → ${formatFechaHora(exc.resueltaEn)}` : ''}
          </p>
          {exc.decididoPor && <p className="text-[10px] text-aion-muted mt-0.5">{exc.decididoPor}{exc.decisionHumana ? ` · ${exc.decisionHumana.toLowerCase()}` : ''}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[12.5px]">
        <div className="rounded-lg bg-white/80 border border-aion-line p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-aion-muted mb-1">Causa</p>
          <p className="text-aion-ink leading-relaxed">{exc.causa}</p>
        </div>
        <div className="rounded-lg bg-white/80 border border-aion-line p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-aion-muted mb-1">Impacto</p>
          <p className="text-aion-ink leading-relaxed">{exc.impacto}</p>
        </div>
      </div>

      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-aion-muted mb-1.5">Alternativas · impacto en costo, horas, SLA y reglas</p>
        <div className="space-y-1.5">
          {exc.alternativas.map((a) => {
            const elegida = exc.alternativaElegida === a.id
            const rec = exc.recomendada === a.id
            return (
              <div key={a.id} className={cn('flex items-start gap-2.5 rounded-lg border px-3 py-2', elegida ? 'border-success/40 bg-success-light/40' : rec ? 'border-catB/30 bg-catB-light/30' : 'border-aion-line bg-white/80')}>
                <span className={cn('w-6 h-6 rounded-md font-extrabold text-[12px] flex items-center justify-center shrink-0', elegida ? 'bg-success text-white' : rec ? 'bg-catB text-white' : 'bg-slate-100 text-aion-ink')}>{a.id}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-medium text-aion-ink leading-snug">{a.titulo}</p>
                  {a.descripcion && <p className="text-[11px] text-aion-muted mt-0.5">{a.descripcion}</p>}
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span className="badge-compact bg-slate-100 text-slate-700 font-mono">{signoCOP(a.impactoCosto)}</span>
                    <span className="badge-compact bg-slate-100 text-slate-700 font-mono">{signoHoras(a.impactoHoras)}</span>
                    <span className={cn('badge-compact', SLA_CLASE[a.impactoSLA])}>SLA {a.impactoSLA}</span>
                    {a.reglas.map((r) => (
                      <span key={r} className="badge-compact bg-white border border-aion-line text-aion-muted font-mono">{r}</span>
                    ))}
                  </div>
                </div>
                {elegida && <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />}
                {rec && !elegida && <Bot className="w-4 h-4 text-catB shrink-0 mt-0.5" />}
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-lg bg-catB-light/40 border border-catB/20 p-3 text-[12px]">
        <Bot className="w-4 h-4 text-catB shrink-0 mt-0.5" />
        <p className="text-aion-ink">
          <b>Recomendación del agente ({plantilla.agente}): opción {exc.recomendada}.</b>{' '}
          {exc.alternativas.find((a) => a.id === exc.recomendada)?.titulo}
          {exc.anticipacionMin > 0 && <span className="text-aion-muted"> · detectada con {formatDuracion(exc.anticipacionMin)} de anticipación</span>}
        </p>
      </div>

      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-aion-muted mb-1">Evidencia</p>
        <ul className="space-y-0.5">
          {exc.evidencia.map((ev, i) => (
            <li key={i} className="text-[11px] font-mono text-slate-700 flex items-start gap-1.5">
              <Database className="w-3 h-3 text-aion-muted shrink-0 mt-0.5" />
              {ev}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// --- Derivados ---------------------------------------------------------------------------

/** Etapa del flujo que sirve de referencia (la actual, o la de la que salió a esperar/escalar). */
function etapaReferencia(o: Operacion): EtapaFlujo | null {
  if (esEtapaFlujo(o.etapa)) return o.etapa
  return o.etapaRetorno
}

/** Número de etapas ya completadas. */
function completadas(o: Operacion): number {
  if (o.etapa === 'Cerrada') return ETAPAS_FLUJO.length
  const ref = etapaReferencia(o)
  if (ref) return ETAPAS_FLUJO.indexOf(ref)
  return Math.max(0, Math.round((o.progreso / 100) * ETAPAS_FLUJO.length))
}

function tieneSoporte(s: Soporte[], tipo: Soporte['tipo']): boolean {
  return s.some((x) => x.tipo === tipo)
}

function datoPendiente(pendientes: string[], clave: string): boolean {
  const c = clave.toLowerCase()
  return pendientes.some((p) => p.toLowerCase().includes(c))
}

// --- Página ----------------------------------------------------------------------------------

export default function OperacionDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { allOperaciones, avanzarOperacion, ahora } = useSimulation()

  const o = useMemo(() => allOperaciones.find((x) => x.id === id), [allOperaciones, id])

  if (!o) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-[1440px] mx-auto px-6 py-12">
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <div className="w-16 h-16 rounded-2xl bg-error-light flex items-center justify-center mb-4">
            <XCircle className="w-8 h-8 text-error" />
          </div>
          <h2 className="text-xl font-bold text-aion-ink mb-2">Operación no encontrada</h2>
          <p className="text-sm text-aion-muted mb-6 max-w-md">
            La operación <span className="font-mono text-captura">{id}</span> no existe en la simulación actual o ya salió de la ventana de retención.
          </p>
          <Link to="/" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-captura text-white hover:bg-captura-dark transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            Ir al Dashboard
          </Link>
        </div>
      </motion.div>
    )
  }

  return <Detalle o={o} ahora={ahora} onAvanzar={() => avanzarOperacion(o.id)} onVolver={() => navigate(-1)} />
}

function Detalle({ o, ahora, onAvanzar, onVolver }: { o: Operacion; ahora: number; onAvanzar: () => void; onVolver: () => void }) {
  const terminal = esTerminal(o.etapa)
  const color = BLOQUE_COLOR[o.bloque].color
  const bloqueNombre = BLOQUES.find((b) => b.id === o.bloque)?.nombre ?? o.bloque
  const edadMin = (ahora - o.fechaCreacion) / 60000
  const delAgente = o.origen === 'agentes'
  const nHechas = completadas(o)
  const ref = etapaReferencia(o)

  const agentes = useMemo(() => Array.from(new Set(o.llamadas.map((l) => l.agente))), [o.llamadas])
  const llamadas = useMemo(() => [...o.llamadas].sort((a, b) => a.ts - b.ts), [o.llamadas])
  const eventos = useMemo(() => [...o.eventos].sort((a, b) => a.timestamp - b.timestamp), [o.eventos])
  const trazas = useMemo(() => [...o.trazas].sort((a, b) => b.ts - a.ts), [o.trazas])
  const previas = o.excepcionesPrevias
  const previasAgente = previas.filter((e) => e.resueltaPor !== 'coordinador').length
  const previasCoordinador = previas.length - previasAgente

  const huboEspera = o.etapa === 'EsperaDatos' || o.eventos.some((e) => e.evento === 'DatosSolicitados')
  const huboEscalada = o.etapa === 'Escalada' || o.eventos.some((e) => e.evento === 'DecisionCoordinador' || e.evento === 'TarifaEscalada')

  const tarifaPct = o.tarifaPactada !== null && o.tarifaMaxima > 0 ? Math.min(100, (o.tarifaPactada / o.tarifaMaxima) * 100) : 0

  // Datos mínimos de la solicitud (insumo P3) → valor en la operación simulada
  const valoresMinimos: { label: string; value: string; clave: string | null }[] = [
    { label: DATOS_MINIMOS[0], value: `${o.nodoOrigen.ciudad} · ${o.nodoOrigen.lugar}`, clave: null },
    { label: DATOS_MINIMOS[1], value: `${o.nodoDestino.ciudad} · ${o.nodoDestino.lugar}`, clave: null },
    { label: DATOS_MINIMOS[2], value: `${o.mercancia.tipo} · ${o.mercancia.descripcion} · ${formatNumber(o.mercancia.unidades)} und`, clave: null },
    { label: DATOS_MINIMOS[3], value: `${formatNumber(o.mercancia.pesoKg)} kg`, clave: 'peso' },
    { label: DATOS_MINIMOS[4], value: `${o.mercancia.volumenM3.toLocaleString('es-CO')} m³`, clave: 'volumen' },
    { label: DATOS_MINIMOS[5], value: o.vehiculoRequerido, clave: 'vehículo' },
    { label: DATOS_MINIMOS[6], value: formatFechaHora(o.fechaCargue), clave: 'hora' },
    { label: DATOS_MINIMOS[7], value: o.condicionesEntrega, clave: null },
    { label: DATOS_MINIMOS[8], value: o.requisitoEspecial ?? 'Ninguno', clave: 'requisitos' },
  ]

  // Expediente (insumo P39): qué existe ya en esta operación
  const existe: boolean[] = [
    tieneSoporte(o.soportes, 'solicitud'),
    o.llamadas.length > 0,
    tieneSoporte(o.soportes, 'transcripcion'),
    o.soportes.some((s) => s.tipo === 'grabacion' && s.autorizada),
    o.ofertas.length > 0,
    o.eventos.some((e) => e.evento === 'ConfirmacionDoble' || e.evento === 'AsignacionConfirmada'),
    o.excepcion !== null || previas.length > 0,
    o.compromisos.length > 0,
    previas.some((e) => e.resueltaPor === 'coordinador') || o.costosAdicionales > 0,
    tieneSoporte(o.soportes, 'soporte_entrega'),
  ]

  return (
    <div className="max-w-[1440px] mx-auto px-6 pb-12">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-5">
        {/* -------------------------------------------------------------- */}
        {/* Cabecera                                                        */}
        {/* -------------------------------------------------------------- */}
        <motion.div variants={itemVariants}>
          <button onClick={onVolver} className="flex items-center gap-1.5 text-sm text-aion-muted hover:text-captura transition-colors mb-3">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>

          <div className="glass-panel rounded-xl p-5 border-l-4" style={{ borderLeftColor: color }}>
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: color }}>
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl font-bold text-aion-ink font-mono">{o.id}</h1>
                    <CanalBadge canal={o.canal} />
                    <SimuladoTag />
                    {delAgente && <span className="badge-compact bg-captura-light text-captura">equipo de agentes</span>}
                    {o.casoSeguimiento && <span className="badge-compact bg-catD-light text-catD-dark">caso de seguimiento</span>}
                  </div>
                  <p className="text-sm text-aion-ink mt-0.5 font-medium">{o.cliente.nombre}</p>
                  <p className="text-[12px] text-aion-muted">
                    {o.cliente.id} · {o.cliente.tipo} · solicita {o.solicitante} · vía {CANAL_INFO[o.canal].label}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <EtapaBadge etapa={o.etapa} className="px-3 py-1.5 text-sm" />
                {o.excepcion && <CategoriaBadge categoria={o.excepcion.categoria} className="px-3 py-1.5 text-sm" />}
                {o.intervencionHumana && <span className="badge-compact px-3 py-1.5 text-sm bg-catC-light text-catC-dark">con intervención humana</span>}

                {o.etapa === 'Escalada' && (
                  <Link to="/coordinador" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-catC text-white hover:bg-catC-dark transition-colors text-xs font-medium">
                    <UserCheck className="w-3.5 h-3.5" />
                    Decidir en la Mesa del coordinador
                  </Link>
                )}
                {!terminal && o.etapa !== 'Escalada' && (
                  <button
                    onClick={onAvanzar}
                    disabled={delAgente}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-captura text-white hover:bg-captura-dark transition-colors text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                    title={delAgente ? 'La mueve el equipo de agentes' : 'Avanzar una etapa del flujo'}
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                    Avanzar etapa
                  </button>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-aion-line grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-[10.5px] text-aion-muted uppercase tracking-wide mb-1">Ruta</p>
                <p className="font-semibold text-aion-ink flex items-center gap-1.5 flex-wrap">
                  <MapPin className="w-4 h-4 text-aion-muted" />
                  {o.nodoOrigen.ciudad} <ArrowRight className="w-3.5 h-3.5 text-aion-muted" /> {o.nodoDestino.ciudad}
                </p>
                <p className="text-[11px] text-aion-muted font-mono mt-0.5">{o.distanciaKm} km · {o.vehiculoRequerido}</p>
              </div>
              <div>
                <p className="text-[10.5px] text-aion-muted uppercase tracking-wide mb-1">Etapa y progreso</p>
                <p className="font-semibold text-aion-ink">
                  {ETAPA_LABEL[o.etapa]} <span className="text-[11px] font-normal text-aion-muted">· {bloqueNombre}</span>
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${o.progreso}%`, backgroundColor: color }} />
                  </div>
                  <span className="text-[11px] font-mono text-aion-muted">{o.progreso}%</span>
                </div>
              </div>
              <div>
                <p className="text-[10.5px] text-aion-muted uppercase tracking-wide mb-1">Transportador</p>
                {o.transportador ? (
                  <>
                    <p className="font-semibold text-aion-ink truncate">{o.transportador.nombre}</p>
                    <p className="text-[11px] text-aion-muted font-mono mt-0.5">
                      {o.transportador.conductor} · {o.transportador.placa} · {o.transportador.cumplimiento}% cumpl.
                    </p>
                  </>
                ) : (
                  <p className="text-aion-muted">Sin asignar</p>
                )}
              </div>
              <div>
                <p className="text-[10.5px] text-aion-muted uppercase tracking-wide mb-1 flex items-center gap-1.5">
                  <Wallet className="w-3 h-3" /> Tarifa pactada vs. tope
                </p>
                <p className="font-semibold text-aion-ink font-mono text-[13px]">
                  {o.tarifaPactada !== null ? formatCOPLargo(o.tarifaPactada) : 'por negociar'}
                  <span className="text-aion-muted font-normal"> / {formatCOPLargo(o.tarifaMaxima)}</span>
                </p>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1.5">
                  <div className={cn('h-full rounded-full', tarifaPct >= 100 ? 'bg-excepcion' : 'bg-success')} style={{ width: `${tarifaPct}%` }} />
                </div>
                <p className="text-[11px] text-aion-muted mt-1">
                  Costos adicionales autorizados: <b className="text-aion-ink font-mono">{o.costosAdicionales > 0 ? formatCOPLargo(o.costosAdicionales) : 'ninguno'}</b>
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-aion-line flex items-center gap-x-5 gap-y-1.5 flex-wrap text-[12px] text-aion-muted">
              <span className="flex items-center gap-1.5"><CalendarClock className="w-3.5 h-3.5" />Cargue {formatFechaDia(o.fechaCargue)}</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {terminal && o.fechaCierre ? `Cerrada en ${formatDuracion((o.fechaCierre - o.fechaCreacion) / 60000)}` : `${formatDuracion(edadMin)} desde la solicitud`}
              </span>
              <span className="flex items-center gap-1.5"><PhoneCall className="w-3.5 h-3.5" />{o.llamadas.length} llamada(s) · {o.intentosContacto} intento(s) fallido(s)</span>
              {agentes.length > 0 && <span className="flex items-center gap-1.5"><Bot className="w-3.5 h-3.5" />{agentes.join(' · ')}</span>}
              {o.retrasoHoras > 0 && <span className="flex items-center gap-1.5 text-promesa-dark font-medium"><AlertTriangle className="w-3.5 h-3.5" />Retraso acumulado {o.retrasoHoras} h</span>}
              {o.satisfaccion !== null && <span>Satisfacción {o.satisfaccion}/5</span>}
              {o.etapa === 'Cancelada' && o.causaCancelacion && <span className="text-excepcion-dark font-medium">Causa: {o.causaCancelacion}</span>}
            </div>
          </div>
        </motion.div>

        {/* -------------------------------------------------------------- */}
        {/* Recorrido por el flujo                                           */}
        {/* -------------------------------------------------------------- */}
        <Panel icon={ListChecks} titulo="Recorrido por el flujo" extra={<span className="badge-compact bg-slate-100 text-aion-muted ml-1">{nHechas} de {ETAPAS_FLUJO.length} etapas completadas</span>}>
          <div className="overflow-x-auto pb-2">
            <ol className="flex items-start min-w-[1280px]">
              {FLUJO_ETAPAS.map((def, i) => {
                const hecha = i < nHechas
                const actual = !terminal && ref === def.id
                const pausada = actual && (o.etapa === 'EsperaDatos' || o.etapa === 'Escalada')
                const c = BLOQUE_COLOR[def.bloque].color
                return (
                  <li key={def.id} className="flex-1 min-w-0 flex flex-col items-center relative">
                    {i > 0 && <span className={cn('absolute top-[13px] right-1/2 w-full h-0.5', hecha || actual ? 'bg-success/60' : 'bg-slate-200')} />}
                    <span
                      className={cn(
                        'relative z-10 w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10.5px] font-bold bg-white',
                        hecha && 'border-success bg-success-light text-success',
                        !hecha && !actual && 'border-slate-200 text-slate-400',
                      )}
                      style={actual ? { borderColor: pausada ? '#e11d48' : c, color: pausada ? '#e11d48' : c } : undefined}
                    >
                      {hecha ? <CheckCircle2 className="w-3.5 h-3.5" /> : def.numero}
                      {actual && <span className="absolute inset-0 rounded-full animate-pulse-soft border-2" style={{ borderColor: pausada ? '#e11d48' : c }} />}
                    </span>
                    <p className={cn('mt-1.5 text-[10.5px] leading-tight text-center px-1', actual ? 'font-bold text-aion-ink' : hecha ? 'text-success font-medium' : 'text-slate-400')}>{def.corto}</p>
                    <span className="mt-1 h-1 w-8 rounded-full" style={{ backgroundColor: c, opacity: hecha || actual ? 1 : 0.25 }} />
                    {pausada && (
                      <span className="mt-1 badge-compact !py-0 text-[9px] bg-excepcion-light text-excepcion-dark">{o.etapa === 'Escalada' ? 'escalada' : 'espera datos'}</span>
                    )}
                  </li>
                )
              })}
            </ol>
          </div>

          <div className="mt-3 pt-3 border-t border-aion-line grid grid-cols-1 md:grid-cols-4 gap-2">
            {(
              [
                { etapa: 'EsperaDatos', titulo: 'Espera de datos', activa: o.etapa === 'EsperaDatos', paso: huboEspera, texto: 'Validación: faltan datos del cliente' },
                { etapa: 'Escalada', titulo: 'Escalada', activa: o.etapa === 'Escalada', paso: huboEscalada, texto: 'En manos del coordinador' },
                { etapa: 'Cancelada', titulo: 'Cancelada', activa: o.etapa === 'Cancelada', paso: o.etapa === 'Cancelada', texto: 'Cancelación autorizada por el responsable' },
                { etapa: 'Cerrada', titulo: 'Cerrada', activa: o.etapa === 'Cerrada', paso: o.etapa === 'Cerrada', texto: 'Cierre administrativo completado' },
              ] as const
            ).map((b) => (
              <div
                key={b.etapa}
                className={cn(
                  'rounded-lg border px-3 py-2 flex items-center gap-2.5',
                  b.activa ? 'border-excepcion/50 bg-excepcion-light/60' : b.paso ? 'border-success/30 bg-success-light/30' : 'border-dashed border-slate-200 bg-slate-50/50',
                )}
              >
                <GitBranch className={cn('w-4 h-4 shrink-0', b.activa ? 'text-excepcion' : b.paso ? 'text-success' : 'text-slate-300')} />
                <div className="min-w-0">
                  <p className={cn('text-[12px] font-semibold', b.activa || b.paso ? 'text-aion-ink' : 'text-slate-400')}>
                    {b.titulo}
                    {b.activa && <span className="ml-1.5 text-[10px] font-normal text-excepcion-dark">· estado actual</span>}
                    {!b.activa && b.paso && <span className="ml-1.5 text-[10px] font-normal text-success">· pasó por aquí</span>}
                  </p>
                  <p className="text-[10.5px] text-aion-muted truncate">{b.texto}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* ------------------------------------------------------------ */}
          {/* Columna izquierda                                              */}
          {/* ------------------------------------------------------------ */}
          <motion.div variants={containerVariants} className="lg:col-span-3 space-y-5">
            <Panel icon={FileText} titulo="Datos mínimos de la solicitud" extra={o.datosPendientes.length > 0 ? <span className="badge-compact bg-promesa-light text-promesa-dark ml-1">{o.datosPendientes.length} pendiente(s)</span> : undefined}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {valoresMinimos.map((d) => (
                  <Campo key={d.label} label={d.label} value={d.value} pendiente={d.clave !== null && datoPendiente(o.datosPendientes, d.clave)} />
                ))}
              </div>
              {o.datosPendientes.length > 0 ? (
                <div className="mt-3 rounded-lg border border-promesa/30 bg-promesa-light/40 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-promesa-dark mb-1.5">Datos pendientes · gestión posterior (R02)</p>
                  <div className="flex flex-wrap gap-1.5">
                    {o.datosPendientes.map((d) => (
                      <span key={d} className="badge-compact bg-white border border-promesa/30 text-promesa-dark">{d}</span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-[11px] text-success flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" />Sin datos pendientes</p>
              )}
              {o.receptor && (
                <p className="mt-2 text-[11.5px] text-aion-muted">
                  Recibe en destino: <b className="text-aion-ink">{o.receptor.nombre}</b> · <span className="font-mono">{o.receptor.telefono}</span>
                </p>
              )}
            </Panel>

            <Panel
              icon={GitBranch}
              titulo="Excepción o novedad activa"
              color="text-excepcion"
              extra={
                o.etapa === 'Escalada' ? (
                  <Link to="/coordinador" className="ml-auto flex items-center gap-1 text-[11px] text-catC-dark font-medium">
                    Decidir en la Mesa <ArrowRight className="w-3 h-3" />
                  </Link>
                ) : undefined
              }
            >
              {o.excepcion ? <ExcepcionPanel exc={o.excepcion} actual /> : <Vacio>Sin novedades activas: la operación sigue su curso.</Vacio>}
            </Panel>

            {previas.length > 0 && (
              <Panel
                icon={Undo2}
                titulo="Excepciones previas resueltas"
                color="text-aion-muted"
                extra={
                  <>
                    <span className="badge-compact bg-catB-light text-catB ml-1">{previasAgente} por agente</span>
                    <span className="badge-compact bg-catC-light text-catC-dark">{previasCoordinador} por coordinador</span>
                  </>
                }
              >
                <div className="space-y-3">
                  {previas.map((e) => (
                    <ExcepcionPanel key={e.id} exc={e} actual={false} />
                  ))}
                </div>
              </Panel>
            )}

            <Panel icon={Handshake} titulo="Ofertas de transportadores" color="text-validacion" extra={<span className="badge-compact bg-slate-100 text-aion-muted ml-1">{o.ofertas.length}</span>}>
              {o.ofertas.length === 0 ? (
                <Vacio>Aún no se negocia: la operación está en {ETAPA_LABEL[o.etapa]}.</Vacio>
              ) : (
                <div className="overflow-x-auto -mx-1">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-[10px] uppercase tracking-wider text-aion-muted border-b border-aion-line">
                        <th className="text-left px-2 py-2 font-semibold">Transportador</th>
                        <th className="text-right px-2 py-2 font-semibold">Compat.</th>
                        <th className="text-right px-2 py-2 font-semibold">Cumpl.</th>
                        <th className="text-right px-2 py-2 font-semibold">Ofrecida</th>
                        <th className="text-right px-2 py-2 font-semibold">Final</th>
                        <th className="text-left px-2 py-2 font-semibold">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {o.ofertas.map((of) => {
                        const elegida = o.transportador?.id === of.transportadorId
                        const sobre = of.tarifaOfrecida > o.tarifaMaxima
                        return (
                          <tr key={of.transportadorId} className={cn('border-b border-aion-line last:border-0', elegida && 'bg-success-light/30')}>
                            <td className="px-2 py-2">
                              <span className="font-medium text-aion-ink flex items-center gap-1.5">
                                {of.nombre}
                                {elegida && <span className="badge-compact !py-0 bg-success text-white text-[9px]">seleccionado</span>}
                              </span>
                              <span className="text-[10.5px] text-aion-muted font-mono">{of.transportadorId} · {of.vehiculo}</span>
                            </td>
                            <td className="px-2 py-2 text-right font-mono">{of.compatibilidad}%</td>
                            <td className="px-2 py-2 text-right font-mono">{of.cumplimiento}%</td>
                            <td className={cn('px-2 py-2 text-right font-mono', sobre ? 'text-excepcion-dark font-semibold' : 'text-aion-ink')}>{formatCOPLargo(of.tarifaOfrecida)}</td>
                            <td className="px-2 py-2 text-right font-mono">{of.tarifaFinal !== null ? formatCOPLargo(of.tarifaFinal) : <span className="text-slate-300">—</span>}</td>
                            <td className="px-2 py-2"><span className={cn('badge-compact', ESTADO_OFERTA[of.estado].clase)}>{ESTADO_OFERTA[of.estado].label}</span></td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  <p className="text-[10.5px] text-aion-muted px-2 pt-2">Tope autorizado: <b className="font-mono text-aion-ink">{formatCOPLargo(o.tarifaMaxima)}</b> (POL-NEG-01).</p>
                </div>
              )}
            </Panel>

            <Panel icon={PhoneCall} titulo="Comunicaciones" color="text-liberacion" extra={<span className="badge-compact bg-slate-100 text-aion-muted ml-1">{llamadas.length}</span>}>
              {llamadas.length === 0 ? (
                <Vacio>Todavía no hay llamadas registradas.</Vacio>
              ) : (
                <div className="relative pl-5 max-h-[520px] overflow-y-auto pr-1">
                  <div className="absolute left-[7px] top-1 bottom-1 w-0.5 bg-slate-200 rounded-full" />
                  {llamadas.map((l) => (
                    <div key={l.id} className="relative pb-4 last:pb-0">
                      <div className="absolute -left-[18px] top-1 w-3 h-3 rounded-full border-2 bg-white border-liberacion" />
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[12.5px] font-semibold text-aion-ink">{l.objetivo}</span>
                        <span className={cn('badge-compact', RESULTADO_LLAMADA[l.resultado].clase)}>{RESULTADO_LLAMADA[l.resultado].label}</span>
                        <span className={cn('badge-compact', l.confirmada ? 'bg-success-light text-success' : 'bg-promesa-light text-promesa-dark')} title="Solo la información confirmada se promete (R19)">
                          {l.confirmada ? 'confirmada' : 'estimada'}
                        </span>
                      </div>
                      <p className="text-[11px] text-aion-muted mt-0.5 flex items-center gap-1.5 flex-wrap">
                        {l.sentido === 'saliente' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                        <span>{l.sentido}</span> · <b className="text-slate-700">{l.nombre}</b> ({l.interlocutor})
                        <span className="flex items-center gap-1"><Bot className="w-3 h-3 text-catB" />{l.agente}</span>
                      </p>
                      <p className="text-[11.5px] text-slate-700 mt-0.5 leading-snug">{l.resumen}</p>
                      <p className="text-[10px] text-aion-muted font-mono mt-0.5">
                        {formatFechaHora(l.ts)} · {ETAPA_LABEL_CORTO[l.etapa]} · {l.respuestaMin !== null ? `contestó en ${formatDuracion(l.respuestaMin)}` : 'sin contestar'} · {l.duracionSeg} s
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </motion.div>

          {/* ------------------------------------------------------------ */}
          {/* Columna derecha                                                */}
          {/* ------------------------------------------------------------ */}
          <motion.div variants={containerVariants} className="lg:col-span-2 space-y-5">
            <Panel icon={ListChecks} titulo="Compromisos" color="text-promesa-dark" extra={<span className="badge-compact bg-slate-100 text-aion-muted ml-1">{o.compromisos.length}</span>}>
              {o.compromisos.length === 0 ? (
                <Vacio>Sin compromisos adquiridos todavía.</Vacio>
              ) : (
                <div className="space-y-2">
                  {o.compromisos.map((c) => {
                    const vencido = c.estado === 'pendiente' && c.venceEn < ahora
                    return (
                      <div key={c.id} className="rounded-lg border border-aion-line bg-white/70 px-3 py-2">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-[12px] text-aion-ink leading-snug">{c.texto}</p>
                          <span className={cn('badge-compact shrink-0', vencido ? 'bg-excepcion-light text-excepcion-dark' : ESTADO_COMPROMISO[c.estado].clase)}>
                            {vencido ? 'vencido' : ESTADO_COMPROMISO[c.estado].label}
                          </span>
                        </div>
                        <p className="text-[10.5px] text-aion-muted font-mono mt-1">{PARTE_LABEL[c.parte]} · vence {formatFechaHora(c.venceEn)}</p>
                      </div>
                    )
                  })}
                </div>
              )}
            </Panel>

            <Panel icon={ShieldCheck} titulo="Trazabilidad de las decisiones" color="text-catC-dark" extra={<span className="badge-compact bg-slate-100 text-aion-muted ml-1">{trazas.length}</span>}>
              <p className="text-[10.5px] text-aion-muted -mt-2 mb-3">qué ocurrió → información → regla → decidió → ejecutó → resultado</p>
              {trazas.length === 0 ? (
                <Vacio>Sin acciones registradas todavía.</Vacio>
              ) : (
                <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
                  {trazas.map((t) => (
                    <div key={t.id} className="rounded-lg border border-aion-line bg-white/70 p-3 text-[11.5px]">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={cn('badge-compact font-bold', EJECUTOR_CLASE(t.ejecutor))}>{t.ejecutor}</span>
                        <span className="font-mono text-[10px] text-aion-muted">{ETAPA_NUMERO[t.etapa]}·{ETAPA_LABEL_CORTO[t.etapa]} · {formatFechaHora(t.ts)}</span>
                      </div>
                      <ol className="relative pl-4 space-y-1.5">
                        <span className="absolute left-[5px] top-1 bottom-1 w-px bg-slate-200" />
                        {(
                          [
                            ['Qué ocurrió', t.ocurrio],
                            ['Información', t.informacion.join(' · ') || '—'],
                            ['Regla', t.regla],
                            ['Decidió', t.decidio],
                            ['Ejecutó', t.ejecuto],
                            ['Resultado', t.resultado],
                          ] as const
                        ).map(([k, v], i) => (
                          <li key={k} className="relative">
                            <span className={cn('absolute -left-4 top-1.5 w-[7px] h-[7px] rounded-full', i === 5 ? 'bg-success' : 'bg-slate-300')} />
                            <b className="text-aion-muted">{k}:</b> <span className={cn('text-aion-ink', i === 5 && 'font-medium')}>{v}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              )}
            </Panel>

            <Panel icon={Radar} titulo="Eventos" color="text-aion-ink" extra={<span className="badge-compact bg-slate-100 text-aion-muted ml-1">{eventos.length}</span>}>
              {eventos.length === 0 ? (
                <Vacio>Sin eventos todavía.</Vacio>
              ) : (
                <div className="relative pl-5 max-h-[420px] overflow-y-auto pr-1">
                  <div className="absolute left-[7px] top-1 bottom-1 w-0.5 bg-slate-200 rounded-full" />
                  {eventos.map((e, i) => (
                    <div key={`${e.evento}-${e.timestamp}-${i}`} className="relative pb-3.5 last:pb-0">
                      <div className="absolute -left-[18px] top-1 w-3 h-3 rounded-full border-2 bg-white" style={{ borderColor: color }} />
                      <p className="text-xs font-semibold font-mono text-aion-ink">{e.evento}</p>
                      <p className="text-[10.5px] text-aion-muted leading-snug">{e.detalle}</p>
                      <p className="text-[10px] text-aion-muted mt-0.5 font-mono">{formatFechaHora(e.timestamp)}</p>
                    </div>
                  ))}
                </div>
              )}
            </Panel>

            <Panel icon={FolderOpen} titulo="Expediente" color="text-comunicacion-dark" extra={<span className="badge-compact bg-slate-100 text-aion-muted ml-1">{existe.filter(Boolean).length} de {EXPEDIENTE_CONTENIDO.length}</span>}>
              <ul className="space-y-1.5">
                {EXPEDIENTE_CONTENIDO.map((item, i) => (
                  <li key={item} className="flex items-center gap-2 text-[12px]">
                    {existe[i] ? <CheckCircle2 className="w-4 h-4 text-success shrink-0" /> : <span className="w-4 h-4 rounded-full border-2 border-dashed border-slate-300 shrink-0" />}
                    <span className={existe[i] ? 'text-aion-ink' : 'text-slate-400'}>{item}</span>
                  </li>
                ))}
              </ul>
              {o.soportes.length > 0 && (
                <div className="mt-3 pt-3 border-t border-aion-line space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-aion-muted mb-1">Archivos en el expediente</p>
                  {o.soportes.map((s, i) => (
                    <p key={`${s.nombre}-${i}`} className="text-[11px] text-slate-700 flex items-start gap-1.5">
                      <FileText className="w-3 h-3 text-aion-muted shrink-0 mt-0.5" />
                      <span className="flex-1 min-w-0">{s.nombre}</span>
                      <span className="font-mono text-[10px] text-aion-muted shrink-0">{s.tipo.replace('_', ' ')}</span>
                    </p>
                  ))}
                </div>
              )}
              {!o.soportes.some((s) => s.tipo === 'grabacion') && o.soportes.some((s) => s.tipo === 'transcripcion') && (
                <p className="mt-2 text-[10.5px] text-aion-muted flex items-center gap-1.5"><Package className="w-3 h-3" />Sin grabación autorizada: queda solo la transcripción (POL-GRA-01).</p>
              )}
            </Panel>
          </motion.div>
        </div>

        {terminal && (
          <motion.div variants={itemVariants} className="glass-panel rounded-xl p-4 flex items-center gap-3 text-sm">
            {o.etapa === 'Cerrada' ? <CheckCircle2 className="w-5 h-5 text-success" /> : <XCircle className="w-5 h-5 text-slate-500" />}
            <p className="text-aion-ink">
              {o.etapa === 'Cerrada' ? 'La operación terminó con cierre administrativo.' : `La operación fue cancelada${o.causaCancelacion ? `: ${o.causaCancelacion}` : '.'}`}
            </p>
            <Zap className="w-4 h-4 text-aion-muted ml-auto" />
            <Link to="/" className="text-xs text-captura font-medium hover:underline">Volver al Dashboard</Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
