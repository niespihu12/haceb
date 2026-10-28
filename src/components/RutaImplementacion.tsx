import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowDown,
  BookOpen,
  Cable,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  ChevronRight,
  Circle,
  ClipboardCheck,
  Clock,
  Cloud,
  CloudOff,
  Compass,
  Database,
  Download,
  FileText,
  Flag,
  History,
  Hourglass,
  Info,
  KeyRound,
  LayoutGrid,
  Loader2,
  Lock,
  LockOpen,
  LogIn,
  MousePointerClick,
  Network,
  OctagonAlert,
  PlayCircle,
  Plug,
  RotateCcw,
  Save,
  Scale,
  Search,
  Server,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Target,
  Upload,
  User,
  Wrench,
  XCircle,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import SubprocesoSimulacion from '@/components/SubprocesoSimulacion'
import {
  LEVANTAMIENTO_COMPARTIDO,
  guardarRemoto,
  leerRemoto,
  suscribirRemoto,
  type FilaLevantamiento,
} from '@/lib/levantamientoRemoto'
import {
  FACTOR_CONCURRENCIA,
  MIN_JUSTIFICACION,
  ORDEN_ESTADOS,
  derivarRuta,
  diasImpacto,
  formatDias,
  formatFecha,
  formatFechaCorta,
  formatSemanas,
  fusionarLevantamiento,
  impactoDe,
  levantamientoInicial,
  ubicarPrerrequisito,
  type FaseDerivada,
  type RutaDerivada,
} from '@/lib/rutaImplementacion'
import type {
  AjusteTiempo,
  CapaId,
  EstadoCapa,
  EstadoLevantamiento,
  EstadoPrerrequisito,
  Prerrequisito,
  ProcesoImplementacion,
  ResponsablePrerrequisito,
  TipoActividad,
  TipoPrerrequisito,
} from '@/types/implementacion'

// ---------------------------------------------------------------------------
// Presentacion de los estados (solo UI)
// ---------------------------------------------------------------------------

const ESTADO_PRERREQ: Record<
  EstadoPrerrequisito,
  { label: string; clase: string; punto: string; icon: LucideIcon; ayuda: string }
> = {
  disponible: {
    label: 'Disponible',
    clase: 'bg-success-light text-success border-success/30',
    punto: 'bg-success',
    icon: CheckCircle2,
    ayuda: 'Listo para usarse. No suma tiempo a la fase.',
  },
  pendiente: {
    label: 'Pendiente',
    clase: 'bg-promesa-light text-promesa-dark border-promesa/30',
    punto: 'bg-promesa',
    icon: Hourglass,
    ayuda: 'Definido, pero aún no se entrega. Suma días a su fase y, si es stopper, la bloquea.',
  },
  requiere_validacion: {
    label: 'Requiere validación',
    clase: 'bg-captura-light text-captura border-captura/30',
    punto: 'bg-captura',
    icon: Search,
    ayuda: 'Existe, pero hay que confirmarlo. Suma días de validación y la estimación queda por refinar.',
  },
  no_disponible: {
    label: 'No disponible',
    clase: 'bg-error-light text-error border-error/30',
    punto: 'bg-error',
    icon: XCircle,
    ayuda: 'No existe o no está definido. Suma días como mínimo y la fase requiere Discovery.',
  },
}

/** Color solido de cada estado de prerrequisito (cajas del diagrama). */
const ESTADO_PRERREQ_COLOR: Record<EstadoPrerrequisito, string> = {
  disponible: '#059669',
  pendiente: '#d97706',
  requiere_validacion: '#2563eb',
  no_disponible: '#dc2626',
}

const TIPO_PRERREQ: Record<TipoPrerrequisito, { label: string; icon: LucideIcon }> = {
  informacion: { label: 'Información', icon: FileText },
  credencial: { label: 'Credencial', icon: KeyRound },
  acceso: { label: 'Acceso', icon: LogIn },
  api: { label: 'API', icon: Plug },
  integracion: { label: 'Integración', icon: Cable },
  conectividad: { label: 'Conectividad / puertos', icon: Network },
  infraestructura: { label: 'Infraestructura', icon: Server },
  fuente: { label: 'Fuente de datos', icon: Database },
  documentacion: { label: 'Documentación', icon: BookOpen },
  regla: { label: 'Regla / definición', icon: Scale },
}

const TIPO_ACTIVIDAD: Record<TipoActividad, string> = {
  levantamiento: 'Levantamiento',
  infraestructura: 'Infraestructura',
  conectividad: 'Conectividad',
  configuracion: 'Configuración',
  integracion: 'Integración',
  datos: 'Datos',
  pruebas: 'Pruebas',
  certificacion: 'Certificación',
}

const RESPONSABLE: Record<ResponsablePrerrequisito, { label: string; clase: string }> = {
  cliente: { label: 'Cliente', clase: 'bg-aion-ink text-white' },
  aion: { label: 'AION', clase: 'bg-liberacion-light text-liberacion' },
  ambos: { label: 'Conjunto', clase: 'bg-slate-100 text-aion-ink' },
}

const ESTADO_CAPA: Record<
  EstadoCapa,
  { label: string; color: string; chip: string; icon: LucideIcon; descripcion: string }
> = {
  completada: {
    label: 'Certificada',
    color: '#059669',
    chip: 'bg-success-light text-success',
    icon: CheckCircle2,
    descripcion: 'Todos los criterios del habilitador están cumplidos: la siguiente fase puede iniciar.',
  },
  en_espera: {
    label: 'En espera',
    color: '#64748b',
    chip: 'bg-slate-100 text-slate-600',
    icon: Hourglass,
    descripcion: 'No puede iniciar hasta que la fase anterior quede certificada.',
  },
  bloqueada: {
    label: 'Bloqueada',
    color: '#dc2626',
    chip: 'bg-error-light text-error',
    icon: OctagonAlert,
    descripcion: 'Tiene stoppers sin resolver: no puede iniciar ni certificarse.',
  },
  discovery: {
    label: 'Requiere Discovery',
    color: '#be123c',
    chip: 'bg-catD-light text-catD',
    icon: Compass,
    descripcion: 'Puede iniciar, pero hay prerrequisitos sin definir: la estimación no es definitiva.',
  },
  en_curso: {
    label: 'En curso',
    color: '#7c3aed',
    chip: 'bg-liberacion-light text-liberacion',
    icon: PlayCircle,
    descripcion: 'Iniciada: ya hay criterios del habilitador certificados.',
  },
  lista: {
    label: 'Lista para iniciar',
    color: '#2563eb',
    chip: 'bg-captura-light text-captura',
    icon: Sparkles,
    descripcion: 'La fase anterior está certificada y no hay stoppers abiertos.',
  },
}

const CAPA_ICONO: Record<CapaId, LucideIcon> = {
  ingesta: Cable,
  extraccion: Database,
  validacion: ShieldCheck,
  clasificacion: Scale,
  registro: Flag,
}

function etiquetaDe(p: Prerrequisito): string {
  if (p.etiqueta) return p.etiqueta
  const corte = p.texto.split(/[:(]/)[0].trim()
  return corte.length > 42 ? corte.slice(0, 40).trimEnd() + '…' : corte
}

function diasCortos(d: number): string {
  const v = Math.round(d * 10) / 10
  return `${String(v).replace('.', ',')} d`
}

function conSigno(d: number): string {
  return `${d > 0 ? '+' : d < 0 ? '−' : '±'}${diasCortos(Math.abs(d))}`
}

type ModoVista = 'diagrama' | 'cronograma'
type Seleccion = { tipo: 'fase'; capa: CapaId } | { tipo: 'elemento'; capa: CapaId; id: string }

// ---------------------------------------------------------------------------
// Persistencia del levantamiento
//
// Lo que se define en pantalla (estado de cada prerrequisito, criterios del
// habilitador, actividades en alcance, ajustes de tiempo con su justificacion
// y la fecha de inicio) se guarda automaticamente en el navegador por
// proceso, se puede exportar/importar como JSON y, si esta configurado, se
// comparte en vivo en Supabase. La carga siempre se fusiona con los datos
// del proceso y acepta levantamientos de la version anterior (v1).
// ---------------------------------------------------------------------------

const VERSION_LEVANTAMIENTO = 2
const VERSIONES_ACEPTADAS = [1, 2]

interface Levantamiento {
  version: number
  procesoId: string
  guardadoEn: number
  vista: EstadoLevantamiento
}

function claveStorage(procesoId: string): string {
  return `aion:levantamiento:${procesoId}`
}

function cargarLevantamiento(proceso: ProcesoImplementacion): { lev: EstadoLevantamiento; guardadoEn: number | null } {
  const base = levantamientoInicial(proceso)
  try {
    const raw = localStorage.getItem(claveStorage(proceso.id))
    if (!raw) return { lev: base, guardadoEn: null }
    const data = JSON.parse(raw) as Partial<Levantamiento>
    if (!VERSIONES_ACEPTADAS.includes(data.version ?? 0) || !data.vista) return { lev: base, guardadoEn: null }
    return { lev: fusionarLevantamiento(base, data.vista), guardadoEn: typeof data.guardadoEn === 'number' ? data.guardadoEn : null }
  } catch {
    return { lev: base, guardadoEn: null }
  }
}

function guardarLevantamiento(procesoId: string, lev: EstadoLevantamiento): number | null {
  try {
    const guardadoEn = Date.now()
    const data: Levantamiento = { version: VERSION_LEVANTAMIENTO, procesoId, guardadoEn, vista: lev }
    localStorage.setItem(claveStorage(procesoId), JSON.stringify(data))
    return guardadoEn
  } catch {
    return null
  }
}

function borrarLevantamiento(procesoId: string): void {
  try {
    localStorage.removeItem(claveStorage(procesoId))
  } catch {
    /* sin almacenamiento disponible */
  }
}

function descargarJSON(nombre: string, contenido: unknown): void {
  const blob = new Blob([JSON.stringify(contenido, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nombre
  a.click()
  URL.revokeObjectURL(url)
}

type EstadoSincronizacion = 'local' | 'conectando' | 'sincronizado' | 'guardando' | 'error'

interface UltimaEdicion {
  en: number
  por: string | null
}

const CLAVE_AUTOR = 'aion:autor'
const RETARDO_GUARDADO_MS = 600
const INTERVALO_SONDEO_MS = 15_000

function leerAutor(): string {
  try {
    return localStorage.getItem(CLAVE_AUTOR) ?? ''
  } catch {
    return ''
  }
}

function guardarAutor(nombre: string): void {
  try {
    localStorage.setItem(CLAVE_AUTOR, nombre)
  } catch {
    /* sin almacenamiento disponible */
  }
}

function formatoFechaHora(ts: number | string): string {
  return new Date(ts).toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

// ---------------------------------------------------------------------------
// Piezas de UI
// ---------------------------------------------------------------------------

function Seccion({ titulo, icon: Icon, color, children, className, extra }: { titulo: string; icon: LucideIcon; color: string; children: React.ReactNode; className?: string; extra?: React.ReactNode }) {
  return (
    <div className={cn('p-5 border-b border-aion-line last:border-b-0', className)}>
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <p className="text-[10.5px] font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color }}>
          <Icon className="w-3.5 h-3.5" />
          {titulo}
        </p>
        {extra}
      </div>
      {children}
    </div>
  )
}

function ChipStopper({ alcance, compacto = false, resuelto = false }: { alcance: 'proyecto' | 'fase'; compacto?: boolean; resuelto?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 font-bold rounded shrink-0',
        compacto ? 'text-[9px] px-1 py-px' : 'text-[9.5px] px-1.5 py-px',
        resuelto ? 'bg-slate-100 text-aion-muted' : alcance === 'proyecto' ? 'bg-error text-white' : 'bg-error-light text-error',
      )}
      title={
        resuelto
          ? 'Stopper resuelto: ya está disponible y no bloquea'
          : alcance === 'proyecto'
            ? 'Stopper de proyecto: mientras no esté disponible, el proyecto no puede iniciar'
            : 'Stopper de fase: mientras no esté disponible, la fase no puede iniciar ni certificarse'
      }
    >
      <OctagonAlert className="w-2.5 h-2.5" />
      {alcance === 'proyecto' ? 'stopper proyecto' : 'stopper'}
    </span>
  )
}

function ChipEstadoFase({ estado }: { estado: EstadoCapa }) {
  const e = ESTADO_CAPA[estado]
  return (
    <span className={cn('badge-compact gap-1', e.chip)}>
      <e.icon className="w-3 h-3" />
      {e.label}
    </span>
  )
}

// --- Caja de un prerrequisito en el diagrama ---------------------------------
function CajaPrerrequisito({ p, estado, seleccionada, onClick }: { p: Prerrequisito; estado: EstadoPrerrequisito; seleccionada: boolean; onClick: () => void }) {
  const ep = ESTADO_PRERREQ[estado]
  const color = ESTADO_PRERREQ_COLOR[estado]
  const TipoIcon = TIPO_PRERREQ[p.tipo].icon
  const suma = diasImpacto(p, estado)
  const stopperAbierto = !!p.bloqueante && estado !== 'disponible'
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-lg border bg-white px-2.5 py-2 text-left transition-all hover:-translate-y-0.5 hover:shadow-card-hover min-w-0',
        seleccionada ? 'border-transparent' : stopperAbierto ? 'border-error/40' : 'border-aion-line',
      )}
      style={{ borderTopWidth: 3, borderTopColor: color, boxShadow: seleccionada ? `0 0 0 3px ${color}44` : undefined }}
      title={p.texto}
    >
      <div className="flex items-start gap-1.5">
        <TipoIcon className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color }} />
        <span className="text-[11.5px] font-bold text-aion-ink leading-snug line-clamp-2">{etiquetaDe(p)}</span>
      </div>
      <div className="flex items-center gap-1 mt-1.5 flex-wrap">
        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', ep.punto)} />
        <span className="text-[9.5px] text-aion-muted truncate">{ep.label}</span>
        {suma > 0 && <span className="text-[9.5px] font-mono font-bold text-promesa-dark">+{suma} d</span>}
        <span className="ml-auto flex items-center gap-1">
          {p.bloqueante && <ChipStopper alcance={p.bloqueante} compacto resuelto={!stopperAbierto} />}
          {p.subproceso && <PlayCircle className="w-3 h-3 text-captura shrink-0" />}
        </span>
      </div>
    </button>
  )
}

// --- Panel de un prerrequisito ------------------------------------------------
function PanelElemento({
  fase,
  p,
  estado,
  onEstado,
  onVerFase,
}: {
  fase: FaseDerivada
  p: Prerrequisito
  estado: EstadoPrerrequisito
  onEstado: (e: EstadoPrerrequisito) => void
  onVerFase: () => void
}) {
  const ep = ESTADO_PRERREQ[estado]
  const color = ESTADO_PRERREQ_COLOR[estado]
  const tipo = TIPO_PRERREQ[p.tipo]
  const TipoIcon = tipo.icon
  const resp = RESPONSABLE[p.responsable]
  const imp = impactoDe(p)
  const suma = diasImpacto(p, estado)
  const ec = ESTADO_CAPA[fase.estado]
  const filasImpacto: { e: EstadoPrerrequisito; texto: string }[] = [
    { e: 'disponible', texto: 'no suma tiempo' },
    { e: 'pendiente', texto: `+${imp.pendiente} días hábiles` },
    { e: 'requiere_validacion', texto: `+${imp.validacion} días hábiles` },
    { e: 'no_disponible', texto: `+${imp.pendiente} días como mínimo + Discovery` },
  ]
  return (
    <div>
      <div className="p-5 border-b border-aion-line" style={{ borderLeftWidth: 4, borderLeftColor: color }}>
        <div className="flex items-start gap-3">
          <span className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}1A` }}>
            <TipoIcon className="w-5 h-5" style={{ color }} />
          </span>
          <div className="min-w-0">
            <p className="text-[10.5px] uppercase tracking-wider text-aion-muted">{tipo.label} · fase {fase.capa.numero} · {fase.capa.nombre}</p>
            <h3 className="text-base font-bold text-aion-ink leading-tight">{etiquetaDe(p)}</h3>
          </div>
        </div>
        <p className="text-[13px] text-aion-ink leading-relaxed mt-3">{p.texto}</p>
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          <span className={cn('text-[9.5px] font-bold px-1.5 py-px rounded', resp.clase)}>{resp.label}</span>
          {p.bloqueante && <ChipStopper alcance={p.bloqueante} resuelto={estado === 'disponible'} />}
          <span className={cn('badge-compact gap-1 border', ep.clase)}>
            <ep.icon className="w-3 h-3" />
            {ep.label}
          </span>
        </div>
        {p.bloqueante && (
          <div className={cn('mt-3 rounded-lg border p-2.5 flex items-start gap-2', estado === 'disponible' ? 'bg-success-light/50 border-success/25' : 'bg-error-light/70 border-error/30')}>
            <OctagonAlert className={cn('w-4 h-4 shrink-0 mt-0.5', estado === 'disponible' ? 'text-success' : 'text-error')} />
            <p className="text-[11.5px] text-aion-ink leading-snug">
              {p.bloqueante === 'proyecto'
                ? <><b>Stopper de proyecto.</b> Mientras no esté disponible, ninguna fase puede iniciar.</>
                : <><b>Stopper de fase.</b> Mientras no esté disponible, la fase {fase.capa.numero} no puede iniciar ni certificarse.</>}
              {estado === 'disponible' ? ' Hoy está resuelto.' : ' Hoy está abierto.'}
            </p>
          </div>
        )}
      </div>

      <Seccion titulo="Estado · defínelo" icon={MousePointerClick} color="#5b6472">
        <div className="grid grid-cols-2 gap-1.5">
          {ORDEN_ESTADOS.map((e) => {
            const d = ESTADO_PRERREQ[e]
            const activo = estado === e
            const I = d.icon
            return (
              <button
                key={e}
                onClick={() => onEstado(e)}
                className={cn('flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-[11.5px] font-semibold transition-all text-left', activo ? 'text-white border-transparent' : 'bg-white border-aion-line text-aion-muted hover:text-aion-ink')}
                style={activo ? { backgroundColor: ESTADO_PRERREQ_COLOR[e] } : undefined}
              >
                <I className="w-3.5 h-3.5 shrink-0" />
                {d.label}
              </button>
            )
          })}
        </div>
        <p className="text-[11px] text-aion-muted mt-2 leading-snug">{ep.ayuda}</p>
      </Seccion>

      <Seccion titulo="Impacto en el tiempo" icon={Clock} color="#b45309">
        <div className="rounded-lg border border-aion-line overflow-hidden">
          {filasImpacto.map((f) => (
            <div key={f.e} className={cn('flex items-center justify-between gap-2 px-3 py-1.5 text-[11.5px] border-b border-aion-line last:border-b-0', f.e === estado ? 'bg-promesa-light/60 font-semibold text-aion-ink' : 'text-aion-muted')}>
              <span className="flex items-center gap-1.5">
                <span className={cn('w-2 h-2 rounded-full', ESTADO_PRERREQ[f.e].punto)} />
                {ESTADO_PRERREQ[f.e].label}
              </span>
              <span className="font-mono">{f.texto}</span>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-aion-muted mt-2 leading-snug">
          {suma > 0
            ? <>Hoy suma <b className="text-promesa-dark">+{suma} días hábiles</b> a la fase {fase.capa.numero}. Si se entrega antes de que la fase inicie, el impacto desaparece al marcarlo disponible.</>
            : 'Hoy no suma tiempo: está disponible.'}
        </p>
      </Seccion>

      <Seccion titulo="Subproceso · cómo se conecta" icon={PlayCircle} color="#2563eb">
        {p.subproceso ? (
          <SubprocesoSimulacion key={p.id} subproceso={p.subproceso} color={ec.color === '#64748b' ? '#2563eb' : ec.color} compacto />
        ) : (
          <p className="text-[12px] text-aion-muted leading-relaxed">Este elemento no requiere una conexión: es información, una definición o un acuerdo que el cliente entrega para poder iniciar la fase.</p>
        )}
      </Seccion>

      <div className="p-5">
        <div className="flex items-center gap-2 flex-wrap">
          <ChipEstadoFase estado={fase.estado} />
          <span className="text-[11px] font-mono text-aion-muted">{formatDias(fase.diasTotal)}</span>
        </div>
        <button onClick={onVerFase} className="mt-2 flex items-center gap-1 text-[11.5px] text-captura hover:text-captura-dark font-medium">
          Ver la fase {fase.capa.numero} · {fase.capa.nombre} <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}

// --- Panel de una fase --------------------------------------------------------
function PanelFase({
  fase,
  siguiente,
  lev,
  autor,
  onAutor,
  onCriterio,
  onActividad,
  onAjuste,
  onAnularAjuste,
  onElemento,
}: {
  fase: FaseDerivada
  siguiente: FaseDerivada | null
  lev: EstadoLevantamiento
  autor: string
  onAutor: (nombre: string) => void
  onCriterio: (id: string) => void
  onActividad: (id: string) => void
  onAjuste: (dias: number, justificacion: string) => void
  onAnularAjuste: (id: string) => void
  onElemento: (id: string) => void
}) {
  const [formAbierto, setFormAbierto] = useState(false)
  const [diasAjuste, setDiasAjuste] = useState('')
  const [justificacion, setJustificacion] = useState('')
  const v = lev.capas[fase.capa.id]
  const ec = ESTADO_CAPA[fase.estado]
  const Icono = CAPA_ICONO[fase.capa.id]
  const dias = Number(diasAjuste)
  const diasValidos = diasAjuste.trim() !== '' && Number.isFinite(dias) && dias !== 0 && Math.abs(dias) <= 120
  const justificacionValida = justificacion.trim().length >= MIN_JUSTIFICACION
  const autorValido = autor.trim().length >= 2
  const puedeRegistrar = diasValidos && justificacionValida && autorValido
  const totalCriterios = fase.capa.habilitador.criterios.length

  const registrar = () => {
    if (!puedeRegistrar) return
    onAjuste(Math.round(dias * 2) / 2, justificacion.trim())
    setDiasAjuste('')
    setJustificacion('')
    setFormAbierto(false)
  }

  return (
    <div>
      {/* Cabecera */}
      <div className="p-5 border-b border-aion-line" style={{ borderLeftWidth: 4, borderLeftColor: ec.color }}>
        <div className="flex items-start gap-3">
          <span className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0" style={{ backgroundColor: ec.color }}>
            <Icono className="w-5 h-5" />
          </span>
          <div className="min-w-0">
            <p className="text-[10.5px] uppercase tracking-wider text-aion-muted">Fase {fase.capa.numero} de 5 · {fase.capa.resumen}</p>
            <h3 className="text-base font-bold text-aion-ink leading-tight">{fase.capa.nombre}</h3>
            <div className="mt-1.5"><ChipEstadoFase estado={fase.estado} /></div>
          </div>
        </div>
        <p className="text-[11px] text-aion-muted mt-2">{ec.descripcion}</p>
        <p className="text-[11.5px] text-aion-ink mt-2 flex items-center gap-1.5">
          <CalendarDays className="w-3.5 h-3.5 text-aion-muted" />
          {formatFecha(fase.inicio)} → {formatFecha(fase.fin)}
        </p>
        {!fase.puedeIniciar && fase.estado !== 'completada' && (
          <div className="mt-3 rounded-lg bg-slate-50 border border-aion-line p-3">
            <p className="text-[10.5px] font-bold uppercase tracking-wider text-aion-muted mb-1 flex items-center gap-1"><Lock className="w-3 h-3" />No puede iniciar</p>
            <ul className="space-y-0.5">
              {fase.motivosEspera.map((m) => (
                <li key={m} className="text-[11.5px] text-aion-ink leading-snug flex items-start gap-1.5"><span className="w-1 h-1 rounded-full bg-aion-muted mt-[7px] shrink-0" />{m}</li>
              ))}
            </ul>
            {fase.stoppersFaseAbiertos.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {fase.stoppersFaseAbiertos.map((p) => (
                  <button key={p.id} onClick={() => onElemento(p.id)} className="text-[10.5px] font-semibold px-2 py-0.5 rounded bg-error-light text-error hover:bg-error hover:text-white transition-colors">
                    {etiquetaDe(p)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {fase.requiereDiscovery && (
          <div className="mt-3 rounded-lg bg-catD-light border border-catD/30 p-3 flex items-start gap-2">
            <Compass className="w-4 h-4 text-catD shrink-0 mt-0.5" />
            <p className="text-[11.5px] text-aion-ink leading-snug"><b className="text-catD">Requiere Discovery.</b> {fase.conteo.no_disponible} prerrequisito(s) sin definir: el tiempo mostrado es un mínimo, no un compromiso.</p>
          </div>
        )}
      </div>

      {/* Objetivo y resultado */}
      <div className="p-5 border-b border-aion-line space-y-3">
        <div>
          <p className="text-[10.5px] font-bold uppercase tracking-wider text-captura mb-1 flex items-center gap-1.5"><Target className="w-3.5 h-3.5" />Objetivo</p>
          <p className="text-[12.5px] text-aion-ink leading-relaxed">{fase.capa.objetivo}</p>
        </div>
        <div>
          <p className="text-[10.5px] font-bold uppercase tracking-wider text-success mb-1 flex items-center gap-1.5"><Flag className="w-3.5 h-3.5" />Resultado</p>
          <p className="text-[12.5px] text-aion-ink leading-relaxed">{fase.capa.resultado}</p>
        </div>
      </div>

      {/* Actividades tecnicas */}
      <Seccion titulo="Actividades técnicas" icon={Wrench} color="#0891b2" extra={<span className="text-[10.5px] font-mono text-aion-muted">{diasCortos(fase.diasBase)} en alcance</span>}>
        <div className="space-y-1">
          {fase.capa.actividades.map((a) => {
            const incluida = !a.opcional || v.actividades[a.id] !== false
            return (
              <div key={a.id} className={cn('flex items-start gap-2 rounded-md px-2 py-1.5 border', incluida ? 'bg-white border-aion-line' : 'bg-slate-50 border-dashed border-slate-200')}>
                {a.opcional ? (
                  <button
                    onClick={() => onActividad(a.id)}
                    className={cn('w-4 h-4 mt-0.5 rounded border flex items-center justify-center shrink-0 transition-colors', incluida ? 'bg-comunicacion border-comunicacion text-white' : 'bg-white border-slate-300')}
                    title={incluida ? 'Sacar del alcance del piloto' : 'Incluir en el alcance del piloto'}
                  >
                    {incluida && <CheckCircle2 className="w-3 h-3" />}
                  </button>
                ) : (
                  <Lock className="w-3.5 h-3.5 mt-0.5 text-slate-300 shrink-0" aria-label="Actividad obligatoria" />
                )}
                <div className="min-w-0 flex-1">
                  <p className={cn('text-[11.5px] leading-snug', incluida ? 'text-aion-ink' : 'text-aion-muted line-through')}>{a.texto}</p>
                  <p className="text-[9.5px] text-aion-muted mt-0.5">{TIPO_ACTIVIDAD[a.tipo]}{a.opcional ? ' · opcional' : ''}</p>
                </div>
                <span className={cn('text-[11px] font-mono font-bold shrink-0', incluida ? 'text-aion-ink' : 'text-slate-300')}>{diasCortos(a.dias)}</span>
              </div>
            )
          })}
        </div>
        <p className="text-[10.5px] text-aion-muted mt-2">Las opcionales se pueden sacar del alcance del piloto (p. ej. un canal que no entra); el tiempo se recalcula solo.</p>
      </Seccion>

      {/* Tiempo automatico */}
      <Seccion titulo="Tiempo estimado · automático" icon={Clock} color="#b45309" extra={<span className="text-[11px] font-mono font-bold text-aion-ink">{formatSemanas(fase.diasTotal)}</span>}>
        <div className="rounded-lg border border-aion-line overflow-hidden text-[11.5px]">
          <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-slate-50">
            <span className="text-aion-ink">Camino feliz · actividades en alcance</span>
            <span className="font-mono font-semibold">{diasCortos(fase.diasBase)}</span>
          </div>
          {fase.impactos.map((i) => (
            <button key={i.prerrequisito.id} onClick={() => onElemento(i.prerrequisito.id)} className="w-full flex items-center justify-between gap-2 px-3 py-1.5 border-t border-aion-line text-left hover:bg-promesa-light/40">
              <span className="flex items-center gap-1.5 min-w-0">
                <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', ESTADO_PRERREQ[i.estado].punto)} />
                <span className="truncate text-aion-ink">{etiquetaDe(i.prerrequisito)}</span>
                <span className="text-aion-muted shrink-0">· {ESTADO_PRERREQ[i.estado].label.toLowerCase()}</span>
              </span>
              <span className="font-mono text-promesa-dark/80 shrink-0">+{diasCortos(i.dias)}</span>
            </button>
          ))}
          {fase.impactos.length > 0 && (
            <div className="flex items-center justify-between gap-2 px-3 py-1.5 border-t border-aion-line bg-promesa-light/30">
              <span className="text-aion-ink">
                Espera por faltantes
                {fase.impactos.length > 1 && <span className="text-aion-muted"> · en paralelo: el mayor + {Math.round(FACTOR_CONCURRENCIA * 100)} % del resto</span>}
              </span>
              <span className="font-mono font-semibold text-promesa-dark shrink-0">+{diasCortos(fase.diasImpacto)}</span>
            </div>
          )}
          {fase.ajustesVigentes.length > 0 && (
            <div className="flex items-center justify-between gap-2 px-3 py-1.5 border-t border-aion-line">
              <span className="text-aion-ink">Ajustes manuales justificados</span>
              <span className="font-mono font-semibold text-liberacion">{conSigno(fase.diasAjuste)}</span>
            </div>
          )}
          <div className="flex items-center justify-between gap-2 px-3 py-2 border-t-2 border-aion-ink/10 bg-promesa-light/40">
            <span className="font-bold text-aion-ink">Total de la fase</span>
            <span className="font-mono font-bold text-aion-ink">{formatDias(fase.diasTotal)}</span>
          </div>
        </div>
        {fase.impactos.length === 0 && <p className="text-[11px] text-success mt-2">Todos los prerrequisitos están disponibles: la fase corre en camino feliz.</p>}
        {fase.porRefinar && <p className="text-[11px] text-promesa-dark font-medium mt-2">Hay elementos por validar o sin definir: la estimación debe ser refinada.</p>}
      </Seccion>

      {/* Ajuste manual con justificacion */}
      <Seccion
        titulo="Ajuste manual"
        icon={SlidersHorizontal}
        color="#7c3aed"
        extra={!formAbierto && (
          <button onClick={() => setFormAbierto(true)} className="text-[11px] font-semibold text-liberacion hover:underline">Ajustar tiempo</button>
        )}
      >
        {formAbierto ? (
          <div className="rounded-lg border border-liberacion/30 bg-liberacion-light/40 p-3 space-y-2">
            <label className="flex items-center gap-2 text-[11.5px] text-aion-ink">
              Días hábiles
              <input
                type="number"
                step={0.5}
                value={diasAjuste}
                onChange={(e) => setDiasAjuste(e.target.value)}
                placeholder="p. ej. 3 o -2"
                className="w-24 px-2 py-1 text-xs font-mono border border-aion-line rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-liberacion/30"
              />
              <span className="text-[10.5px] text-aion-muted">positivo suma, negativo resta</span>
            </label>
            <label className="flex items-center gap-2 text-[11.5px] text-aion-ink">
              Registrado por
              <input
                value={autor}
                onChange={(e) => onAutor(e.target.value)}
                placeholder="tu nombre (obligatorio)"
                maxLength={40}
                className="flex-1 min-w-0 px-2 py-1 text-xs border border-aion-line rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-liberacion/30"
              />
            </label>
            <textarea
              value={justificacion}
              onChange={(e) => setJustificacion(e.target.value)}
              rows={3}
              placeholder="Justificación obligatoria: por qué cambia el tiempo (p. ej. el cliente confirmó que el firewall se abre en la ventana de cambios del jueves)."
              className="w-full px-2 py-1.5 text-[11.5px] border border-aion-line rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-liberacion/30 resize-y"
            />
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className={cn('text-[10.5px]', justificacionValida ? 'text-success' : 'text-aion-muted')}>
                {justificacionValida ? 'Justificación suficiente' : `Justificación: mínimo ${MIN_JUSTIFICACION} caracteres (${justificacion.trim().length})`}
                {!autorValido && ' · falta quién lo registra'}
              </span>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setFormAbierto(false)} className="px-2.5 py-1 rounded-md text-[11px] text-aion-muted hover:text-aion-ink">Cancelar</button>
                <button
                  onClick={registrar}
                  disabled={!puedeRegistrar}
                  className="px-3 py-1 rounded-md text-[11px] font-bold bg-liberacion text-white hover:bg-liberacion-dark disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Registrar ajuste
                </button>
              </div>
            </div>
            <p className="text-[10.5px] text-aion-muted">El ajuste queda en el historial con los días, la justificación, quién lo registró y la fecha. No se borra: se anula.</p>
          </div>
        ) : (
          <p className="text-[11.5px] text-aion-muted leading-snug">El tiempo se calcula solo. Si hay una razón para cambiarlo, regístrala aquí: el ajuste queda con su justificación, autor y fecha.</p>
        )}
        {v.ajustes.length > 0 && (
          <div className="mt-3 space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-aion-muted flex items-center gap-1"><History className="w-3 h-3" />Historial de ajustes</p>
            {[...v.ajustes].reverse().map((a: AjusteTiempo) => (
              <div key={a.id} className={cn('rounded-md border px-2.5 py-1.5', a.anulado ? 'bg-slate-50 border-slate-200' : 'bg-white border-liberacion/25')}>
                <div className="flex items-center justify-between gap-2">
                  <span className={cn('text-[11.5px] font-mono font-bold', a.anulado ? 'text-slate-400 line-through' : 'text-liberacion')}>{conSigno(a.dias)}</span>
                  {!a.anulado && (
                    <button
                      onClick={() => onAnularAjuste(a.id)}
                      disabled={!autorValido}
                      title={autorValido ? `Anular a nombre de ${autor.trim()}` : 'Escribe tu nombre para anular el ajuste'}
                      className="text-[10px] text-aion-muted hover:text-error disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-aion-muted"
                    >
                      Anular
                    </button>
                  )}
                </div>
                <p className={cn('text-[11px] leading-snug mt-0.5', a.anulado ? 'text-slate-400 line-through' : 'text-aion-ink')}>{a.justificacion}</p>
                <p className="text-[9.5px] text-aion-muted mt-0.5">
                  {a.autor} · {formatoFechaHora(a.fecha)}
                  {a.anulado && <> · anulado por {a.anulado.por} · {formatoFechaHora(a.anulado.fecha)}</>}
                </p>
              </div>
            ))}
          </div>
        )}
      </Seccion>

      {/* Habilitador: criterios de certificacion */}
      <Seccion
        titulo="Habilitador · certificación"
        icon={ClipboardCheck}
        color={fase.certificada ? '#059669' : '#b45309'}
        className={fase.certificada ? 'bg-success-light/40' : undefined}
        extra={<span className="text-[10.5px] font-mono text-aion-muted">{fase.criteriosCumplidos}/{totalCriterios}</span>}
      >
        <p className="text-[12.5px] font-semibold text-aion-ink leading-relaxed">“{fase.capa.habilitador.condicion}”</p>
        <div className="space-y-1 mt-2">
          {fase.capa.habilitador.criterios.map((c) => {
            const ok = !!v.criterios[c.id]
            return (
              <button
                key={c.id}
                onClick={() => onCriterio(c.id)}
                disabled={!fase.puedeIniciar}
                title={fase.puedeIniciar ? undefined : 'La fase no puede iniciar todavía: no se pueden certificar sus criterios'}
                className={cn(
                  'w-full flex items-start gap-2 rounded-md px-2.5 py-1.5 text-left text-[11.5px] border transition-colors disabled:cursor-not-allowed',
                  ok ? 'bg-success-light/50 border-success/20 text-aion-ink' : 'bg-white border-aion-line text-aion-ink',
                  !fase.puedeIniciar && 'opacity-60',
                )}
              >
                {ok ? <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 mt-px" /> : <Circle className="w-3.5 h-3.5 text-slate-300 shrink-0 mt-px" />}
                <span>{c.texto}</span>
              </button>
            )
          })}
        </div>
        <p className="text-[11px] text-aion-muted mt-2 leading-snug">
          {fase.certificada
            ? siguiente ? `Certificada: la fase ${siguiente.capa.numero} · ${siguiente.capa.nombre} puede iniciar.` : 'Certificada: la implementación queda completa.'
            : !fase.puedeIniciar
              ? 'Se habilita cuando la fase pueda iniciar (fase anterior certificada y sin stoppers).'
              : siguiente ? `Cuando se cumplan todos los criterios, la fase ${siguiente.capa.numero} podrá iniciar.` : 'Cuando se cumplan todos los criterios, la solución queda en operación.'}
        </p>
      </Seccion>
    </div>
  )
}

// --- Cronograma secuencial ----------------------------------------------------
const DIA_MS = 24 * 60 * 60 * 1000

function Cronograma({ ruta, seleccionada, onFase }: { ruta: RutaDerivada; seleccionada: CapaId | null; onFase: (id: CapaId) => void }) {
  const t0 = ruta.inicio.getTime()
  const t1 = ruta.fin.getTime() + DIA_MS
  const span = Math.max(DIA_MS, t1 - t0)
  const pct = (t: number) => ((t - t0) / span) * 100
  const meses: { etiqueta: string; left: number }[] = []
  const m = new Date(ruta.inicio.getFullYear(), ruta.inicio.getMonth() + 1, 1)
  while (m.getTime() < t1) {
    meses.push({ etiqueta: m.toLocaleDateString('es-CO', { month: 'short', year: 'numeric' }), left: pct(m.getTime()) })
    m.setMonth(m.getMonth() + 1)
  }

  return (
    <div className="glass-panel rounded-xl p-5">
      <div className="flex items-center justify-between gap-2 flex-wrap mb-4">
        <h3 className="section-title">
          <CalendarRange className="w-4 h-4 text-captura" />
          Cronograma secuencial
          <span className="text-[11px] font-normal text-aion-muted">cada fase inicia el día hábil siguiente a la certificación de la anterior</span>
        </h3>
        <div className="flex items-center gap-3 text-[10.5px] text-aion-muted">
          <span className="flex items-center gap-1"><span className="w-3 h-2 rounded-sm bg-captura" />Actividades (camino feliz)</span>
          <span className="flex items-center gap-1"><span className="w-3 h-2 rounded-sm" style={{ backgroundImage: 'repeating-linear-gradient(45deg,#d97706 0 3px,#fbbf24 3px 6px)' }} />Por faltantes</span>
          <span className="flex items-center gap-1"><span className="w-3 h-2 rounded-sm bg-liberacion" />Ajuste manual</span>
        </div>
      </div>

      <div className="grid grid-cols-[190px_1fr] gap-3">
        <div />
        <div className="relative h-5 border-b border-aion-line">
          <span className="absolute left-0 -translate-x-0 text-[10px] font-mono text-aion-muted">{formatFechaCorta(ruta.inicio)}</span>
          {/* Los meses muy cerca de la fecha de inicio o del borde no se rotulan para no encimarse */}
          {meses.filter((mm) => mm.left > 9 && mm.left < 95).map((mm) => (
            <span key={mm.etiqueta} className="absolute text-[10px] text-aion-muted -translate-x-1/2 whitespace-nowrap" style={{ left: `${mm.left}%` }}>{mm.etiqueta}</span>
          ))}
        </div>

        {ruta.fases.map((f) => {
          const e = ESTADO_CAPA[f.estado]
          const left = pct(f.inicio.getTime())
          const width = Math.max(1.5, pct(f.fin.getTime() + DIA_MS) - left)
          const positivos = f.diasBase + f.diasImpacto + Math.max(0, f.diasAjuste)
          const wBase = (Math.max(0, f.diasBase + Math.min(0, f.diasAjuste)) / positivos) * 100
          const wImp = (f.diasImpacto / positivos) * 100
          const wAj = (Math.max(0, f.diasAjuste) / positivos) * 100
          const sel = seleccionada === f.capa.id
          return (
            <div key={f.capa.id} className="contents">
              <button onClick={() => onFase(f.capa.id)} className={cn('text-left rounded-lg px-2.5 py-1.5 border transition-colors', sel ? 'bg-white border-transparent' : 'border-transparent hover:bg-white')} style={sel ? { boxShadow: `0 0 0 2px ${e.color}55` } : undefined}>
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full text-white text-[10px] font-extrabold flex items-center justify-center shrink-0" style={{ backgroundColor: e.color }}>{f.capa.numero}</span>
                  <span className="text-[12px] font-bold text-aion-ink truncate">{f.capa.nombre}</span>
                </div>
                <p className="text-[10px] text-aion-muted mt-0.5 font-mono">{formatFechaCorta(f.inicio)} → {formatFechaCorta(f.fin)} · {diasCortos(f.diasTotal)}</p>
              </button>
              <div className="relative h-11 border-b border-dashed border-slate-100">
                {meses.map((mm) => (
                  <span key={mm.etiqueta} className="absolute top-0 bottom-0 w-px bg-slate-100" style={{ left: `${mm.left}%` }} />
                ))}
                <button
                  onClick={() => onFase(f.capa.id)}
                  className="absolute top-2 h-7 rounded-md overflow-hidden flex shadow-sm hover:shadow-card-hover transition-shadow"
                  style={{ left: `${left}%`, width: `${width}%`, outline: sel ? `2px solid ${e.color}` : undefined, outlineOffset: 2 }}
                  title={`${f.capa.nombre}: ${formatDias(f.diasTotal)} · ${formatFecha(f.inicio)} → ${formatFecha(f.fin)}`}
                >
                  <span className="h-full" style={{ width: `${wBase}%`, backgroundColor: e.color === '#64748b' ? '#94a3b8' : e.color }} />
                  {wImp > 0 && <span className="h-full" style={{ width: `${wImp}%`, backgroundImage: 'repeating-linear-gradient(45deg,#d97706 0 5px,#fbbf24 5px 10px)' }} />}
                  {wAj > 0 && <span className="h-full bg-liberacion" style={{ width: `${wAj}%` }} />}
                  <span className="absolute inset-0 flex items-center px-2 text-[10.5px] font-bold text-white whitespace-nowrap" style={{ textShadow: '0 1px 2px rgb(0 0 0 / 0.35)' }}>
                    {e.label}
                    {f.stoppersFaseAbiertos.length > 0 && <OctagonAlert className="w-3 h-3 ml-1" />}
                  </span>
                </button>
              </div>
            </div>
          )
        })}

        <div className="text-[10px] font-bold tracking-[0.12em] uppercase text-aion-muted text-right self-center pr-1">Operación</div>
        <div className="relative h-8">
          <span className="absolute top-1 -translate-x-full flex items-center gap-1 px-2 py-1 rounded-md bg-aion-ink text-white text-[10.5px] font-bold whitespace-nowrap" style={{ left: '100%' }}>
            <Flag className="w-3 h-3" />
            Solución en operación · {formatFechaCorta(ruta.fin)}
          </span>
        </div>
      </div>
    </div>
  )
}

// --- Faltantes ordenados por impacto ------------------------------------------
function TablaFaltantes({ ruta, lev, onElemento }: { ruta: RutaDerivada; lev: EstadoLevantamiento; onElemento: (capa: CapaId, id: string) => void }) {
  const filas = ruta.fases
    .flatMap((f) => f.impactos.map((i) => ({ fase: f, ...i })))
    .sort((a, b) => Number(!!b.prerrequisito.bloqueante) - Number(!!a.prerrequisito.bloqueante) || b.dias - a.dias)
  return (
    <div className="glass-panel rounded-xl p-5">
      <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
        <h3 className="section-title">
          <AlertTriangle className="w-4 h-4 text-promesa" />
          Qué entregar primero
          <span className="text-[11px] font-normal text-aion-muted">cada faltante y los días que suma a su fase · primero los stoppers · dentro de una fase se gestionan en paralelo</span>
        </h3>
        <span className="text-[11px] font-mono font-bold text-promesa-dark">+{diasCortos(ruta.diasImpacto)} de espera en el plan</span>
      </div>
      {filas.length === 0 ? (
        <p className="text-[12px] text-success">No hay faltantes: el plan corre en camino feliz.</p>
      ) : (
        <div className="rounded-lg border border-aion-line overflow-hidden">
          {filas.map((r) => {
            const estado = lev.capas[r.fase.capa.id].prerrequisitos[r.prerrequisito.id]
            const TipoIcon = TIPO_PRERREQ[r.prerrequisito.tipo].icon
            return (
              <button
                key={r.prerrequisito.id}
                onClick={() => onElemento(r.fase.capa.id, r.prerrequisito.id)}
                className="w-full grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 px-3 py-2 border-b border-aion-line last:border-b-0 text-left hover:bg-slate-50"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <TipoIcon className="w-3.5 h-3.5 shrink-0" style={{ color: ESTADO_PRERREQ_COLOR[estado] }} />
                  <span className="min-w-0">
                    <span className="block text-[12px] font-semibold text-aion-ink truncate">{etiquetaDe(r.prerrequisito)}</span>
                    <span className="block text-[10.5px] text-aion-muted">Fase {r.fase.capa.numero} · {r.fase.capa.nombre} · {RESPONSABLE[r.prerrequisito.responsable].label}</span>
                  </span>
                </span>
                <span>{r.prerrequisito.bloqueante && <ChipStopper alcance={r.prerrequisito.bloqueante} compacto />}</span>
                <span className={cn('badge-compact gap-1 border', ESTADO_PRERREQ[estado].clase)}>{ESTADO_PRERREQ[estado].label}</span>
                <span className="text-[12px] font-mono font-bold text-promesa-dark w-14 text-right">+{diasCortos(r.dias)}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export default function RutaImplementacion({ proceso }: { proceso: ProcesoImplementacion }) {
  const [inicial] = useState(() => cargarLevantamiento(proceso))
  const [lev, setLev] = useState<EstadoLevantamiento>(inicial.lev)
  const [guardadoEn, setGuardadoEn] = useState<number | null>(inicial.guardadoEn)
  const [avisoImportacion, setAvisoImportacion] = useState<string | null>(null)
  const archivoRef = useRef<HTMLInputElement>(null)
  const [sincronizacion, setSincronizacion] = useState<EstadoSincronizacion>(LEVANTAMIENTO_COMPARTIDO ? 'conectando' : 'local')
  const [ultimaEdicion, setUltimaEdicion] = useState<UltimaEdicion | null>(null)
  const [autor, setAutor] = useState<string>(() => leerAutor())
  const autorRef = useRef(autor)
  const levRef = useRef(lev)
  // JSON del ultimo levantamiento que sabemos que esta en la nube (null hasta cargarlo).
  const levRemotoRef = useRef<string | null>(null)
  // Marca de tiempo de la ultima fila remota aplicada, para ignorar ecos y filas viejas.
  const ultimaEnRemotaRef = useRef(0)
  const [modo, setModo] = useState<ModoVista>('diagrama')
  const [seleccion, setSeleccion] = useState<Seleccion>({ tipo: 'fase', capa: proceso.capas[0].id })

  const ruta = useMemo(() => derivarRuta(proceso, lev), [proceso, lev])

  // --- Acciones ---------------------------------------------------------------
  const actualizarFase = (capaId: CapaId, fn: (f: EstadoLevantamiento['capas'][CapaId]) => EstadoLevantamiento['capas'][CapaId]) =>
    setLev((prev) => ({ ...prev, capas: { ...prev.capas, [capaId]: fn(prev.capas[capaId]) } }))

  const fijarPrerrequisito = (capaId: CapaId, id: string, estado: EstadoPrerrequisito) =>
    actualizarFase(capaId, (f) => ({ ...f, prerrequisitos: { ...f.prerrequisitos, [id]: estado } }))

  const alternarCriterio = (capaId: CapaId, id: string) =>
    actualizarFase(capaId, (f) => ({ ...f, criterios: { ...f.criterios, [id]: !f.criterios[id] } }))

  const alternarActividad = (capaId: CapaId, id: string) =>
    actualizarFase(capaId, (f) => ({ ...f, actividades: { ...f.actividades, [id]: f.actividades[id] === false } }))

  const nombreFirma = () => autor.trim() || 'Sin nombre'

  const agregarAjuste = (capaId: CapaId, dias: number, justificacion: string) => {
    const ajuste: AjusteTiempo = {
      id: `aj-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      dias,
      justificacion,
      autor: nombreFirma(),
      fecha: new Date().toISOString(),
    }
    actualizarFase(capaId, (f) => ({ ...f, ajustes: [...f.ajustes, ajuste] }))
  }

  const anularAjuste = (capaId: CapaId, id: string) => {
    const anulado = { por: nombreFirma(), fecha: new Date().toISOString() }
    actualizarFase(capaId, (f) => ({ ...f, ajustes: f.ajustes.map((a) => (a.id === id && !a.anulado ? { ...a, anulado } : a)) }))
  }

  const fijarInicio = (iso: string) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) setLev((prev) => ({ ...prev, inicio: iso }))
  }

  const verElemento = (capa: CapaId, id: string) => {
    setSeleccion({ tipo: 'elemento', capa, id })
    setModo('diagrama')
  }

  useEffect(() => {
    levRef.current = lev
  }, [lev])

  useEffect(() => {
    autorRef.current = autor
    guardarAutor(autor)
  }, [autor])

  // Guardado automatico en el navegador cada vez que cambia el levantamiento
  // y, si esta configurado, subida a la nube con un pequeno retardo.
  useEffect(() => {
    const ts = guardarLevantamiento(proceso.id, lev)
    const tLocal = ts === null ? null : setTimeout(() => setGuardadoEn(ts), 0)
    let tRemoto: ReturnType<typeof setTimeout> | null = null
    const json = JSON.stringify(lev)
    if (LEVANTAMIENTO_COMPARTIDO && levRemotoRef.current !== null && levRemotoRef.current !== json) {
      tRemoto = setTimeout(() => {
        setSincronizacion('guardando')
        guardarRemoto(proceso.id, VERSION_LEVANTAMIENTO, lev, autorRef.current.trim() || null)
          .then((fila) => {
            levRemotoRef.current = json
            ultimaEnRemotaRef.current = Date.parse(fila.actualizado_en)
            setUltimaEdicion({ en: ultimaEnRemotaRef.current, por: fila.actualizado_por })
            setSincronizacion('sincronizado')
          })
          .catch(() => setSincronizacion('error'))
      }, RETARDO_GUARDADO_MS)
    }
    return () => {
      if (tLocal !== null) clearTimeout(tLocal)
      if (tRemoto !== null) clearTimeout(tRemoto)
    }
  }, [lev, proceso.id])

  // Carga inicial desde la nube, suscripcion en vivo y sondeo de respaldo.
  useEffect(() => {
    if (!LEVANTAMIENTO_COMPARTIDO) return
    let activo = true
    const base = levantamientoInicial(proceso)

    const aplicarFila = (fila: FilaLevantamiento<unknown>) => {
      if (!VERSIONES_ACEPTADAS.includes(fila.version)) return
      const en = Date.parse(fila.actualizado_en)
      const primeraCarga = levRemotoRef.current === null
      if (!primeraCarga && en <= ultimaEnRemotaRef.current) return
      // Si hay cambios locales sin subir, no se pisan: la subida pendiente gana.
      if (!primeraCarga && JSON.stringify(levRef.current) !== levRemotoRef.current) return
      const fusionado = fusionarLevantamiento({ ...base, inicio: levRef.current.inicio }, fila.vista)
      const json = JSON.stringify(fusionado)
      // Un levantamiento de la version anterior se vuelve a subir ya migrado.
      levRemotoRef.current = fila.version === VERSION_LEVANTAMIENTO ? json : ''
      ultimaEnRemotaRef.current = en
      setUltimaEdicion((prev) => (prev && prev.en === en && prev.por === fila.actualizado_por ? prev : { en, por: fila.actualizado_por }))
      if (json !== JSON.stringify(levRef.current)) setLev(fusionado)
    }

    leerRemoto<unknown>(proceso.id)
      .then(async (fila) => {
        if (!activo) return
        if (fila) {
          aplicarFila(fila)
        } else {
          // Primera vez: lo que hay en este navegador se convierte en el levantamiento compartido.
          const creada = await guardarRemoto(proceso.id, VERSION_LEVANTAMIENTO, levRef.current, autorRef.current.trim() || null)
          if (activo) aplicarFila(creada)
        }
        if (activo) setSincronizacion('sincronizado')
      })
      .catch(() => {
        if (activo) setSincronizacion('error')
      })

    const cancelar = suscribirRemoto<unknown>(proceso.id, (fila) => {
      if (!activo) return
      aplicarFila(fila)
      setSincronizacion((s) => (s === 'guardando' ? s : 'sincronizado'))
    })

    const sondeo = window.setInterval(() => {
      leerRemoto<unknown>(proceso.id)
        .then((fila) => {
          if (!activo || !fila) return
          aplicarFila(fila)
          setSincronizacion((s) => (s === 'error' ? 'sincronizado' : s))
        })
        .catch(() => {
          if (activo) setSincronizacion('error')
        })
    }, INTERVALO_SONDEO_MS)

    return () => {
      activo = false
      cancelar()
      window.clearInterval(sondeo)
    }
  }, [proceso])

  const restablecer = () => {
    if (
      LEVANTAMIENTO_COMPARTIDO &&
      !window.confirm('El levantamiento es compartido: restablecerlo lo devuelve a los valores iniciales para todas las personas. ¿Continuar?')
    )
      return
    borrarLevantamiento(proceso.id)
    setLev(levantamientoInicial(proceso))
    setSeleccion({ tipo: 'fase', capa: proceso.capas[0].id })
    setAvisoImportacion(null)
  }

  const exportar = () => {
    const fecha = new Date().toISOString().slice(0, 10)
    const data: Levantamiento = { version: VERSION_LEVANTAMIENTO, procesoId: proceso.id, guardadoEn: Date.now(), vista: lev }
    descargarJSON(`levantamiento-${proceso.id}-${fecha}.json`, data)
  }

  const importar = (archivo: File | undefined) => {
    if (!archivo) return
    archivo
      .text()
      .then((texto) => {
        const data = JSON.parse(texto) as Partial<Levantamiento>
        if (!VERSIONES_ACEPTADAS.includes(data.version ?? 0) || !data.vista) throw new Error('formato')
        if (data.procesoId && data.procesoId !== proceso.id) throw new Error('proceso')
        setLev(fusionarLevantamiento(levantamientoInicial(proceso), data.vista))
        setAvisoImportacion(`Levantamiento importado de ${archivo.name}`)
      })
      .catch((e: Error) => {
        setAvisoImportacion(e.message === 'proceso' ? 'El archivo pertenece a otro proceso.' : 'El archivo no es un levantamiento válido.')
      })
      .finally(() => {
        if (archivoRef.current) archivoRef.current.value = ''
      })
  }

  // --- Seleccion del panel lateral ------------------------------------------
  const fasePanel = ruta.fases.find((f) => f.capa.id === seleccion.capa) ?? ruta.fases[0]
  const elementoPanel = seleccion.tipo === 'elemento' ? fasePanel.capa.prerrequisitos.find((p) => p.id === seleccion.id) ?? null : null
  const siguientePanel = ruta.fases[fasePanel.indice + 1] ?? null
  const todasCertificadas = ruta.fases.every((f) => f.certificada)

  const panelLateral = (
    <motion.div
      key={seleccion.tipo === 'elemento' ? seleccion.id : `fase-${seleccion.capa}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="glass-panel rounded-xl overflow-hidden xl:sticky xl:top-[76px] xl:max-h-[calc(100vh-96px)] xl:overflow-y-auto"
    >
      {elementoPanel ? (
        <PanelElemento
          fase={fasePanel}
          p={elementoPanel}
          estado={lev.capas[fasePanel.capa.id].prerrequisitos[elementoPanel.id]}
          onEstado={(e) => fijarPrerrequisito(fasePanel.capa.id, elementoPanel.id, e)}
          onVerFase={() => setSeleccion({ tipo: 'fase', capa: fasePanel.capa.id })}
        />
      ) : (
        <PanelFase
          key={fasePanel.capa.id}
          fase={fasePanel}
          siguiente={siguientePanel}
          lev={lev}
          autor={autor}
          onAutor={setAutor}
          onCriterio={(id) => alternarCriterio(fasePanel.capa.id, id)}
          onActividad={(id) => alternarActividad(fasePanel.capa.id, id)}
          onAjuste={(d, j) => agregarAjuste(fasePanel.capa.id, d, j)}
          onAnularAjuste={(id) => anularAjuste(fasePanel.capa.id, id)}
          onElemento={(id) => setSeleccion({ tipo: 'elemento', capa: fasePanel.capa.id, id })}
        />
      )}
    </motion.div>
  )

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------------ */}
      {/* Encabezado                                                          */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="text-[12px] font-bold tracking-[0.14em] uppercase text-aion-muted">Ruta de implementación · fases secuenciales</div>
          <h1 className="text-[26px] leading-tight font-bold text-aion-ink mt-1">Cómo se implementa {proceso.nombre.split(' · ')[0]}</h1>
          <p className="text-[13.5px] text-aion-muted max-w-[780px] leading-relaxed mt-1">{proceso.descripcion}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-white rounded-lg border border-aion-line p-0.5">
            <button
              onClick={() => setModo('diagrama')}
              className={cn('flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all text-xs font-medium', modo === 'diagrama' ? 'bg-captura text-white shadow-sm' : 'text-slate-500 hover:text-captura')}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Diagrama
            </button>
            <button
              onClick={() => setModo('cronograma')}
              className={cn('flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all text-xs font-medium', modo === 'cronograma' ? 'bg-captura text-white shadow-sm' : 'text-slate-500 hover:text-captura')}
            >
              <CalendarRange className="w-3.5 h-3.5" />
              Cronograma
            </button>
          </div>
          <div className="flex items-center bg-white rounded-lg border border-aion-line p-0.5">
            <button onClick={exportar} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-500 hover:text-captura transition-colors" title="Descargar el levantamiento como JSON">
              <Download className="w-3.5 h-3.5" />
              Exportar
            </button>
            <button onClick={() => archivoRef.current?.click()} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-500 hover:text-captura transition-colors" title="Cargar un levantamiento exportado">
              <Upload className="w-3.5 h-3.5" />
              Importar
            </button>
            <input ref={archivoRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => importar(e.target.files?.[0])} />
          </div>
          <button onClick={restablecer} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-aion-line text-xs font-medium text-aion-muted hover:text-aion-ink hover:bg-slate-50 transition-colors">
            <RotateCcw className="w-3.5 h-3.5" />
            Restablecer levantamiento
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap -mt-3">
        {sincronizacion === 'local' ? (
          <span className="text-[11px] text-aion-muted flex items-center gap-1.5">
            <Save className="w-3.5 h-3.5 text-success" />
            {guardadoEn ? `Levantamiento guardado automáticamente en este navegador · ${formatoFechaHora(guardadoEn)}` : 'El levantamiento se guarda automáticamente en este navegador.'}
            {' '}Usa <b className="text-aion-ink">Exportar</b> para compartirlo o llevarlo a otro equipo.
          </span>
        ) : (
          <span className="text-[11px] text-aion-muted flex items-center gap-1.5">
            {sincronizacion === 'error' ? <CloudOff className="w-3.5 h-3.5 text-warning" /> : sincronizacion === 'sincronizado' ? <Cloud className="w-3.5 h-3.5 text-success" /> : <Loader2 className="w-3.5 h-3.5 text-captura animate-spin" />}
            {sincronizacion === 'conectando' && 'Conectando con el levantamiento compartido…'}
            {sincronizacion === 'guardando' && 'Guardando en el levantamiento compartido…'}
            {sincronizacion === 'error' && 'Sin conexión con el levantamiento compartido · los cambios quedan guardados en este navegador.'}
            {sincronizacion === 'sincronizado' && (
              <>
                <b className="text-aion-ink">Levantamiento compartido</b> · todos ven lo mismo en vivo
                {ultimaEdicion && <>{' '}· última edición {ultimaEdicion.por ? <>de <b className="text-aion-ink">{ultimaEdicion.por}</b> </> : ''}· {formatoFechaHora(ultimaEdicion.en)}</>}
              </>
            )}
          </span>
        )}
        <label className="text-[11px] text-aion-muted flex items-center gap-1.5">
          <User className="w-3.5 h-3.5" />
          Tu nombre
          <input
            value={autor}
            onChange={(e) => setAutor(e.target.value)}
            placeholder="p. ej. Nicolás"
            maxLength={40}
            className="w-28 px-2 py-0.5 rounded-md border border-aion-line bg-white text-[11px] text-aion-ink focus:outline-none focus:ring-2 focus:ring-captura/30"
          />
        </label>
        {avisoImportacion && <span className="text-[11px] font-medium text-captura">{avisoImportacion}</span>}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Plan: estimacion, calendario y stoppers del proyecto                 */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="glass-panel rounded-xl p-4">
          <p className="text-[10.5px] text-aion-muted uppercase tracking-wide flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-promesa" />Estimación del proyecto · automática</p>
          <p className="text-[26px] font-bold text-aion-ink leading-tight mt-1">{formatSemanas(ruta.diasTotal)}</p>
          <p className="text-[11px] text-aion-muted font-mono">{formatDias(ruta.diasTotal)}</p>
          <div className="mt-2.5 space-y-1 text-[11.5px]">
            <div className="flex items-center justify-between"><span className="text-aion-ink">Camino feliz · actividades técnicas</span><span className="font-mono font-semibold">{diasCortos(ruta.diasBase)}</span></div>
            <div className="flex items-center justify-between"><span className="text-aion-ink">Por prerrequisitos faltantes</span><span className="font-mono font-semibold text-promesa-dark">+{diasCortos(ruta.diasImpacto)}</span></div>
            <div className="flex items-center justify-between"><span className="text-aion-ink">Ajustes manuales justificados</span><span className="font-mono font-semibold text-liberacion">{conSigno(ruta.diasAjuste)}</span></div>
          </div>
          {(ruta.requiereDiscovery || ruta.porRefinar) && (
            <p className={cn('text-[11px] font-medium mt-2', ruta.requiereDiscovery ? 'text-catD' : 'text-promesa-dark')}>
              {ruta.requiereDiscovery ? 'Hay prerrequisitos sin definir: requiere Discovery y el tiempo es un mínimo.' : 'Hay elementos por validar: la estimación debe ser refinada.'}
            </p>
          )}
        </div>

        <div className="glass-panel rounded-xl p-4">
          <p className="text-[10.5px] text-aion-muted uppercase tracking-wide flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5 text-captura" />Calendario</p>
          <label className="flex items-center justify-between gap-2 mt-2 text-[12px] text-aion-ink">
            Inicio del proyecto
            <input
              type="date"
              value={lev.inicio}
              onChange={(e) => fijarInicio(e.target.value)}
              className="px-2 py-1 text-[12px] border border-aion-line rounded-md bg-white text-aion-ink focus:outline-none focus:ring-2 focus:ring-captura/30"
            />
          </label>
          <div className="flex items-center justify-between gap-2 mt-2 text-[12px]">
            <span className="text-aion-ink">Solución en operación</span>
            <span className="font-semibold text-aion-ink">{formatFecha(ruta.fin)}</span>
          </div>
          <div className="flex items-center justify-between gap-2 mt-2 text-[12px]">
            <span className="text-aion-ink">Fase en juego</span>
            {ruta.faseActual ? (
              <button onClick={() => setSeleccion({ tipo: 'fase', capa: ruta.faseActual!.capa.id })} className="font-semibold text-captura hover:underline">
                {ruta.faseActual.capa.numero} · {ruta.faseActual.capa.nombre}
              </button>
            ) : (
              <span className="font-semibold text-success">Todas certificadas</span>
            )}
          </div>
          <p className="text-[10.5px] text-aion-muted mt-2 leading-snug">Días hábiles de lunes a viernes; no incluye festivos. {!ruta.proyectoPuedeIniciar && <b className="text-error">Fechas tentativas: el proyecto aún no puede iniciar.</b>}</p>
        </div>

        <div className={cn('rounded-xl p-4 border', ruta.proyectoPuedeIniciar ? 'glass-panel' : 'bg-error-light/60 border-error/30')}>
          <p className={cn('text-[10.5px] uppercase tracking-wide flex items-center gap-1.5', ruta.proyectoPuedeIniciar ? 'text-aion-muted' : 'text-error')}>
            <OctagonAlert className="w-3.5 h-3.5" />
            Stoppers del proyecto
          </p>
          <p className={cn('text-[15px] font-bold mt-1', ruta.proyectoPuedeIniciar ? 'text-success' : 'text-error')}>
            {ruta.proyectoPuedeIniciar ? 'El proyecto puede iniciar' : 'El proyecto no puede iniciar'}
          </p>
          <div className="mt-2 space-y-1">
            {ruta.stoppersProyecto.map((p) => {
              const ubic = ubicarPrerrequisito(proceso, p.id)
              if (!ubic) return null
              const estado = lev.capas[ubic.capa.id].prerrequisitos[p.id]
              return (
                <button key={p.id} onClick={() => verElemento(ubic.capa.id, p.id)} className="w-full flex items-center gap-2 text-left rounded-md px-2 py-1 hover:bg-white/80">
                  {estado === 'disponible' ? <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" /> : <OctagonAlert className="w-3.5 h-3.5 text-error shrink-0" />}
                  <span className="text-[11.5px] text-aion-ink truncate flex-1">{etiquetaDe(p)}</span>
                  <span className="text-[10px] text-aion-muted shrink-0">{ESTADO_PRERREQ[estado].label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-promesa/25 bg-promesa-light/40 px-4 py-3">
        <p className="text-[12px] text-aion-ink flex items-center gap-1.5 font-medium flex-wrap">
          <Info className="w-3.5 h-3.5 shrink-0 text-promesa-dark" />
          {proceso.aclaracionTiempos}
          <span className="text-aion-muted font-normal">El tiempo se calcula con las actividades técnicas de cada fase más los días que suma cada prerrequisito faltante; solo se ajusta a mano con una justificación registrada.</span>
        </p>
        <ul className="mt-1.5 grid grid-cols-1 lg:grid-cols-3 gap-x-5 gap-y-1">
          {proceso.notasTiempo.map((n, i) => (
            <li key={i} className="flex items-start gap-1.5 text-[11.5px] text-aion-muted leading-snug">
              <span className="w-1 h-1 rounded-full bg-promesa mt-[7px] shrink-0" />
              {n}
            </li>
          ))}
        </ul>
        {ruta.requiereDiscovery && <p className="text-[11.5px] text-catD mt-1.5"><b>Discovery:</b> {proceso.descripcionDiscovery}</p>}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Modo diagrama                                                        */}
      {/* ------------------------------------------------------------------ */}
      {modo === 'diagrama' && (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-5 items-start">
          <div className="glass-panel rounded-xl p-5">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h3 className="section-title">
                <LayoutGrid className="w-4 h-4 text-captura" />
                Fases de implementación
                <span className="text-[11px] font-normal text-aion-muted">Clic en una fase o en un prerrequisito para ver y definir su detalle</span>
              </h3>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {ORDEN_ESTADOS.map((e) => (
                  <span key={e} className="flex items-center gap-1.5 text-[10.5px] text-aion-muted">
                    <span className={cn('w-2 h-2 rounded-full', ESTADO_PRERREQ[e].punto)} />
                    {ESTADO_PRERREQ[e].label}
                  </span>
                ))}
                <span className="flex items-center gap-1 text-[10.5px] text-error"><OctagonAlert className="w-3 h-3" />stopper</span>
              </div>
            </div>

            <div className="space-y-1">
              {ruta.fases.map((f, i) => {
                const e = ESTADO_CAPA[f.estado]
                const Icono = CAPA_ICONO[f.capa.id]
                const faseSel = seleccion.tipo === 'fase' && seleccion.capa === f.capa.id
                const previa = i > 0 ? ruta.fases[i - 1] : null
                return (
                  <div key={f.capa.id}>
                    {previa && (
                      <div className="grid grid-cols-[190px_1fr] gap-3 py-1">
                        <div />
                        <div className="flex items-center gap-2 px-2 min-w-0">
                          <ArrowDown className={cn('w-4 h-4 shrink-0', previa.certificada ? 'text-success' : 'text-slate-300')} />
                          <span className={cn('text-[10.5px] flex items-center gap-1 min-w-0', previa.certificada ? 'text-success font-semibold' : 'text-aion-muted')}>
                            {previa.certificada ? <LockOpen className="w-3 h-3 shrink-0" /> : <Lock className="w-3 h-3 shrink-0" />}
                            <span className="truncate">
                              {previa.certificada
                                ? `Fase ${previa.capa.numero} certificada: la fase ${f.capa.numero} puede iniciar`
                                : `Inicia cuando se certifique la fase ${previa.capa.numero}: “${previa.capa.habilitador.condicion}”`}
                            </span>
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-[190px_1fr] gap-3 items-stretch">
                      <button
                        onClick={() => setSeleccion({ tipo: 'fase', capa: f.capa.id })}
                        className={cn('rounded-lg border bg-white px-3 py-2.5 text-left transition-all', faseSel ? 'border-transparent' : 'border-aion-line hover:border-slate-300')}
                        style={{ borderLeftWidth: 4, borderLeftColor: e.color, boxShadow: faseSel ? `0 0 0 3px ${e.color}33` : undefined }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[11px] font-extrabold shrink-0" style={{ backgroundColor: e.color }}>{f.capa.numero}</span>
                          <Icono className="w-3.5 h-3.5 shrink-0" style={{ color: e.color }} />
                          <span className="text-[12px] font-bold text-aion-ink leading-tight">{f.capa.nombre}</span>
                        </div>
                        <div className="mt-2 flex items-center gap-1 flex-wrap">
                          <ChipEstadoFase estado={f.estado} />
                          {f.stoppersFaseAbiertos.length > 0 && <ChipStopper alcance="fase" compacto />}
                        </div>
                        <p className="text-[10.5px] font-mono text-aion-ink mt-1.5 font-semibold">{diasCortos(f.diasTotal)} · {formatSemanas(f.diasTotal)}</p>
                        {f.diasImpacto > 0 && <p className="text-[10px] font-mono text-promesa-dark">incluye +{diasCortos(f.diasImpacto)} por faltantes</p>}
                        <p className="text-[10px] text-aion-muted mt-0.5">{formatFechaCorta(f.inicio)} → {formatFechaCorta(f.fin)}</p>
                        <p className="text-[10px] text-aion-muted mt-0.5 flex items-center gap-1"><ClipboardCheck className="w-3 h-3" />{f.criteriosCumplidos}/{f.capa.habilitador.criterios.length} criterios</p>
                      </button>
                      <div className="rounded-lg border border-aion-line bg-slate-50/60 p-2 grid gap-2 content-start" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
                        {f.capa.prerrequisitos.map((p) => (
                          <CajaPrerrequisito
                            key={p.id}
                            p={p}
                            estado={lev.capas[f.capa.id].prerrequisitos[p.id]}
                            seleccionada={seleccion.tipo === 'elemento' && seleccion.id === p.id}
                            onClick={() => setSeleccion({ tipo: 'elemento', capa: f.capa.id, id: p.id })}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Fila final: la solucion en operacion */}
              <div className="grid grid-cols-[190px_1fr] gap-3 py-1">
                <div />
                <div className="flex items-center gap-2 px-2">
                  <ArrowDown className={cn('w-4 h-4', todasCertificadas ? 'text-success' : 'text-slate-300')} />
                  <span className={cn('text-[10.5px]', todasCertificadas ? 'text-success font-semibold' : 'text-aion-muted')}>
                    {todasCertificadas ? 'Las cinco fases están certificadas' : `Entra en operación al certificar la fase ${ruta.fases.length}`}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-[190px_1fr] gap-3">
                <div className="text-[10px] font-bold tracking-[0.12em] uppercase text-aion-muted text-right self-center pr-1">Resultado</div>
                <div className={cn('rounded-lg px-4 py-3 text-center border-2', todasCertificadas ? 'bg-success text-white border-success' : 'bg-aion-ink text-white border-aion-ink')}>
                  <span className="block text-[12px] font-extrabold tracking-wide">SOLUCIÓN EN OPERACIÓN</span>
                  <span className="block text-[10.5px] opacity-80 mt-0.5">
                    {todasCertificadas ? `En operación · ${formatFecha(ruta.fin)}` : `Fecha estimada ${formatFecha(ruta.fin)} · ${formatSemanas(ruta.diasTotal)}${ruta.requiereDiscovery ? ' + Discovery' : ''}`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {panelLateral}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Modo cronograma                                                      */}
      {/* ------------------------------------------------------------------ */}
      {modo === 'cronograma' && (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-5 items-start">
          <div className="space-y-5 min-w-0">
            <Cronograma ruta={ruta} seleccionada={seleccion.capa} onFase={(id) => setSeleccion({ tipo: 'fase', capa: id })} />
            <TablaFaltantes ruta={ruta} lev={lev} onElemento={verElemento} />
          </div>
          {panelLateral}
        </div>
      )}

      {/* Leyenda de estados de fase */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[10.5px] text-aion-muted">
        {(Object.keys(ESTADO_CAPA) as EstadoCapa[]).map((k) => {
          const d = ESTADO_CAPA[k]
          return (
            <span key={k} className="flex items-center gap-1.5" title={d.descripcion}>
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
              {d.label}
            </span>
          )
        })}
      </div>
    </div>
  )
}
