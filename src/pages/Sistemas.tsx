import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  ArrowDown,
  CalendarClock,
  Cpu,
  Database,
  FileText,
  FolderOpen,
  Handshake,
  Inbox,
  Info,
  LayoutDashboard,
  Layers,
  Network,
  PhoneCall,
  Plug,
  Route,
  Server,
  Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useSimulation } from '@/hooks/useSimulation'
import { cn, formatNumber } from '@/lib/utils'
import { SupuestoTag } from '@/components/shared'
import { CANALES, CANAL_INFO, AGENTES_IA } from '@/data/mockData'
import { CANALES_DEF, REGLAS, SISTEMAS } from '@/data/procesoData'
import { P } from '@/data/procesoTexto'
import type { AgenteIA, NombreEvento, Operacion, SistemaId } from '@/types'

// ---------------------------------------------------------------------------
// Qué sistemas toca cada evento (SUPUESTO de diseño: el insumo no nombra eventos).
// La visión centralizada (vistaCentral) lee todos los eventos, por eso se suma aparte.
// ---------------------------------------------------------------------------

const SISTEMAS_POR_EVENTO: Record<NombreEvento, SistemaId[]> = {
  SolicitudRecibida: ['plataforma', 'expediente'],
  SolicitudValidada: ['plataforma', 'expediente'],
  DatosSolicitados: ['agenteCliente', 'agenda', 'expediente'],
  OperacionRegistrada: ['plataforma', 'agenda', 'expediente'],
  TransportadoresPreseleccionados: ['plataforma', 'baseProveedores'],
  NegociacionIniciada: ['agenteNegociacion', 'baseProveedores', 'agenda'],
  AceptacionPreliminar: ['agenteNegociacion', 'expediente'],
  TarifaEscalada: ['agenteNegociacion', 'plataforma'],
  TransportadorSeleccionado: ['plataforma', 'baseProveedores', 'expediente'],
  DocumentosValidados: ['plataforma', 'expediente'],
  AsignacionConfirmada: ['plataforma', 'agenteNegociacion', 'expediente'],
  ConfirmacionDoble: ['agenteCliente', 'agenteNegociacion', 'agenda', 'expediente'],
  LlamadaPreventiva: ['agenteSeguimiento', 'agenda', 'expediente'],
  NovedadRegistrada: ['agenteSeguimiento', 'expediente'],
  LlegadaOrigenConfirmada: ['agenteSeguimiento', 'integracionExterna', 'expediente'],
  CargueFinalizado: ['agenteSeguimiento', 'expediente'],
  DespachoConfirmado: ['agenteSeguimiento', 'agenda', 'expediente'],
  SeguimientoRegistrado: ['agenteSeguimiento', 'agenda', 'expediente'],
  LlegadaDestinoConfirmada: ['agenteSeguimiento', 'expediente'],
  EntregaConfirmada: ['agenteSeguimiento', 'agenteCliente', 'expediente'],
  LlamadaCierre: ['agenteCliente', 'expediente'],
  CasoSeguimientoCreado: ['agenteCliente', 'expediente'],
  DecisionCoordinador: ['plataforma', 'expediente'],
  OperacionCerrada: ['plataforma', 'expediente'],
  OperacionCancelada: ['plataforma', 'expediente'],
  Sistema: ['plataforma'],
}

const SISTEMA_ICONO: Record<SistemaId, LucideIcon> = {
  plataforma: Cpu,
  agenteCliente: PhoneCall,
  agenteNegociacion: Handshake,
  agenteSeguimiento: Route,
  baseProveedores: Database,
  agenda: CalendarClock,
  expediente: FolderOpen,
  integracionCliente: Plug,
  integracionExterna: Network,
  vistaCentral: LayoutDashboard,
}

const SISTEMA_COLOR: Record<SistemaId, string> = {
  plataforma: '#2563eb',
  agenteCliente: '#7c3aed',
  agenteNegociacion: '#7c3aed',
  agenteSeguimiento: '#7c3aed',
  baseProveedores: '#0d9488',
  agenda: '#d97706',
  expediente: '#0d9488',
  integracionCliente: '#0891b2',
  integracionExterna: '#0891b2',
  vistaCentral: '#141b2d',
}

const SISTEMA_CORTO: Record<SistemaId, string> = {
  plataforma: 'Plataforma de coordinación',
  agenteCliente: 'Agente · cliente',
  agenteNegociacion: 'Agente · negociación',
  agenteSeguimiento: 'Agente · seguimiento',
  baseProveedores: 'Base de proveedores',
  agenda: 'Agenda centralizada',
  expediente: 'Expediente e historial',
  integracionCliente: 'Integración con el cliente',
  integracionExterna: 'Integración externa',
  vistaCentral: 'Visión centralizada',
}

const AGENTE_SISTEMA: Record<AgenteIA, SistemaId> = {
  'Agente de cliente': 'agenteCliente',
  'Agente de negociación': 'agenteNegociacion',
  'Agente de seguimiento': 'agenteSeguimiento',
}

const TIPO_LABEL: Record<string, string> = {
  plataforma: 'Plataforma',
  agente: 'Agente de IA',
  datos: 'Datos',
  integracion: 'Integración',
}

const CAPAS: { nombre: string; nodos: SistemaId[] }[] = [
  { nombre: 'Plataforma de coordinación', nodos: ['plataforma'] },
  { nombre: 'Agentes de IA', nodos: ['agenteCliente', 'agenteNegociacion', 'agenteSeguimiento'] },
  { nombre: 'Datos y agenda', nodos: ['baseProveedores', 'agenda', 'expediente'] },
  { nombre: 'Integraciones', nodos: ['integracionCliente', 'integracionExterna'] },
  { nombre: 'Visión centralizada', nodos: ['vistaCentral'] },
]

interface Dato {
  label: string
  valor: string
}

interface TraficoSistema {
  eventos: number
  eventosHora: number
  porEvento: Record<string, number>
  datos: Dato[]
}

function derivarTrafico(ops: Operacion[], ahora: number): Record<SistemaId, TraficoSistema> {
  const ids = SISTEMAS.map((s) => s.id)
  const base = (): TraficoSistema => ({ eventos: 0, eventosHora: 0, porEvento: {}, datos: [] })
  const out = Object.fromEntries(ids.map((id) => [id, base()])) as Record<SistemaId, TraficoSistema>
  const hace1h = ahora - 60 * 60 * 1000

  let llamadasTotal = 0
  let reprogramadas = 0
  let sinRespuesta = 0
  let ofertasConsultadas = 0
  let preseleccionados = 0
  let soportes = 0
  let transcripciones = 0
  let grabaciones = 0
  let compromisosPendientes = 0
  let porVencer = 0
  let seleccionesAuto = 0
  let opsIntegracion = 0
  let presentacionesExternas = 0
  const llamadasAgente: Record<AgenteIA, { total: number; exitosas: number }> = {
    'Agente de cliente': { total: 0, exitosas: 0 },
    'Agente de negociación': { total: 0, exitosas: 0 },
    'Agente de seguimiento': { total: 0, exitosas: 0 },
  }

  for (const op of ops) {
    if (op.canal === 'integracion') opsIntegracion += 1
    ofertasConsultadas += op.ofertas.length
    soportes += op.soportes.length
    transcripciones += op.soportes.filter((s) => s.tipo === 'transcripcion').length
    grabaciones += op.soportes.filter((s) => s.tipo === 'grabacion').length
    for (const c of op.compromisos) {
      if (c.estado === 'pendiente') {
        compromisosPendientes += 1
        if (c.venceEn >= ahora) porVencer += 1
      }
    }
    for (const l of op.llamadas) {
      llamadasTotal += 1
      if (l.resultado === 'reprogramada') reprogramadas += 1
      if (l.resultado === 'sin_respuesta') sinRespuesta += 1
      const a = llamadasAgente[l.agente]
      a.total += 1
      if (l.resultado === 'exitosa') a.exitosas += 1
    }
    for (const ev of op.eventos) {
      const toca = new Set<SistemaId>(SISTEMAS_POR_EVENTO[ev.evento])
      toca.add('vistaCentral')
      if (ev.evento === 'SolicitudRecibida') {
        if (op.canal === 'llamada_ia') toca.add('agenteCliente')
        if (op.canal === 'integracion') toca.add('integracionCliente')
      }
      if (ev.evento === 'TransportadoresPreseleccionados') preseleccionados += 1
      if (ev.evento === 'TransportadorSeleccionado' && ev.detalle.startsWith('Selección automática')) seleccionesAuto += 1
      if (ev.evento === 'LlegadaOrigenConfirmada') presentacionesExternas += 1
      for (const s of toca) {
        const t = out[s]
        t.eventos += 1
        t.porEvento[ev.evento] = (t.porEvento[ev.evento] ?? 0) + 1
        if (ev.timestamp >= hace1h) t.eventosHora += 1
      }
    }
  }

  const activas = ops.filter((o) => o.etapa !== 'Cerrada' && o.etapa !== 'Cancelada')
  const n = formatNumber

  out.plataforma.datos = [
    { label: 'Operaciones registradas', valor: n(ops.length) },
    { label: 'Selecciones automáticas (R09)', valor: n(seleccionesAuto) },
    { label: 'Operaciones activas', valor: n(activas.length) },
  ]
  for (const ag of AGENTES_IA) {
    const d = llamadasAgente[ag]
    out[AGENTE_SISTEMA[ag]].datos = [
      { label: 'Llamadas realizadas por el agente', valor: n(d.total) },
      { label: 'Llamadas exitosas', valor: n(d.exitosas) },
      { label: 'Llamadas sin lograr el objetivo', valor: n(d.total - d.exitosas) },
    ]
  }
  out.baseProveedores.datos = [
    { label: 'Ofertas consultadas / negociadas', valor: n(ofertasConsultadas) },
    { label: 'Preselecciones de candidatos', valor: n(preseleccionados) },
    { label: 'Operaciones con candidatos', valor: n(ops.filter((o) => o.ofertas.length > 0).length) },
  ]
  out.agenda.datos = [
    { label: 'Llamadas agendadas (objetivo + operación + interlocutor)', valor: n(llamadasTotal) },
    { label: 'Reprogramadas', valor: n(reprogramadas) },
    { label: 'Sin respuesta (nuevo contacto programado)', valor: n(sinRespuesta) },
    { label: 'Compromisos por vencer', valor: n(porVencer) },
  ]
  out.expediente.datos = [
    { label: 'Soportes en el expediente', valor: n(soportes) },
    { label: 'Transcripciones', valor: n(transcripciones) },
    { label: 'Grabaciones autorizadas', valor: n(grabaciones) },
    { label: 'Compromisos pendientes', valor: n(compromisosPendientes) },
  ]
  out.integracionCliente.datos = [
    { label: 'Solicitudes recibidas por integración', valor: n(opsIntegracion) },
    { label: 'Participación en las solicitudes', valor: ops.length ? `${Math.round((opsIntegracion / ops.length) * 100)} %` : '—' },
  ]
  out.integracionExterna.datos = [
    { label: 'Presentaciones en origen confirmadas', valor: n(presentacionesExternas) },
  ]
  out.vistaCentral.datos = [
    { label: 'Operaciones activas visibles', valor: n(activas.length) },
    { label: 'En manos del coordinador', valor: n(ops.filter((o) => o.etapa === 'Escalada').length) },
    { label: 'Con información pendiente', valor: n(ops.filter((o) => o.etapa === 'EsperaDatos').length) },
  ]
  return out
}

const TIPO_SOPORTE_VISTA = ['plataforma', 'agente', 'datos', 'integracion'] as const

export default function Sistemas() {
  const { allOperaciones, logs, tick, ahora, canalMetrics } = useSimulation()
  const [seleccionado, setSeleccionado] = useState<SistemaId>('plataforma')

  const trafico = useMemo(() => derivarTrafico(allOperaciones, ahora), [allOperaciones, ahora])
  const maxHora = Math.max(1, ...Object.values(trafico).map((t) => t.eventosHora))
  const maxTotal = Math.max(1, ...Object.values(trafico).map((t) => t.eventos))
  const totalEventos = allOperaciones.reduce((s, o) => s + o.eventos.length, 0)
  const totalLlamadas = allOperaciones.reduce((s, o) => s + o.llamadas.length, 0)
  const totalOfertas = allOperaciones.reduce((s, o) => s + o.ofertas.length, 0)
  const totalSoportes = allOperaciones.reduce((s, o) => s + o.soportes.length, 0)
  const totalHora = Object.values(trafico).reduce((s, t) => s + t.eventosHora, 0)

  const def = SISTEMAS.find((s) => s.id === seleccionado) ?? SISTEMAS[0]
  const tSel = trafico[seleccionado]
  const color = SISTEMA_COLOR[seleccionado]
  const IconoSel = SISTEMA_ICONO[seleccionado]
  const eventosDelSistema = Object.entries(tSel.porEvento).sort((a, b) => b[1] - a[1])
  const reglasDelSistema = REGLAS.filter((r) => def.p.includes(r.p))
  const actividad = useMemo(() => {
    const nombres = new Set<string>(Object.keys(tSel.porEvento))
    return logs.filter((l) => l.tipo === 'evento' && (nombres.has(l.evento) || seleccionado === 'vistaCentral')).slice(-8).reverse()
  }, [logs, tSel.porEvento, seleccionado])

  const maxCanal = Math.max(1, ...canalMetrics.map((m) => m.total))

  return (
    <div className="max-w-[1440px] mx-auto px-6 pb-12 space-y-6">
      {/* Encabezado */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-aion-ink flex items-center gap-2">
            <Network className="w-6 h-6 text-captura" />
            Sistemas y arquitectura lógica
          </h1>
          <p className="text-sm text-aion-muted mt-0.5 max-w-3xl">
            Los diez componentes que describe el insumo y cómo se conectan: canales de entrada, plataforma de coordinación, los tres agentes de IA, la información compartida y la visión centralizada. El tráfico se deriva de los eventos y las llamadas de cada operación.
          </p>
        </div>
        <span className="badge-compact bg-slate-100 text-aion-ink font-mono">ciclo T{tick}</span>
      </motion.div>

      {/* Aviso: sistemas funcionales */}
      <div className="rounded-xl border border-promesa/30 bg-promesa-light/60 px-4 py-3 flex items-start gap-3">
        <Info className="w-4 h-4 text-promesa-dark shrink-0 mt-0.5" />
        <p className="text-[12.5px] text-aion-ink leading-snug">
          <b>El insumo no nombra productos ni plataformas.</b> Los diez sistemas son funcionales: describen capacidades que el documento exige, no software específico. La asignación de eventos a sistemas y las métricas de tráfico son <SupuestoTag className="mx-0.5" /> derivadas de la operación simulada.
        </p>
      </div>

      {/* KPIs de tráfico */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        {[
          { label: 'Sistemas funcionales', valor: String(SISTEMAS.length), icon: Server, color: '#2563eb' },
          { label: 'Eventos última hora', valor: formatNumber(totalHora), icon: Activity, color: '#0d9488' },
          { label: 'Eventos emitidos', valor: formatNumber(totalEventos), icon: Zap, color: '#d97706' },
          { label: 'Llamadas de los agentes', valor: formatNumber(totalLlamadas), icon: PhoneCall, color: '#7c3aed' },
          { label: 'Ofertas · soportes', valor: `${formatNumber(totalOfertas)} · ${formatNumber(totalSoportes)}`, icon: FolderOpen, color: '#141b2d' },
        ].map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="kpi-card">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: `${k.color}18` }}>
                <k.icon className="w-3.5 h-3.5" style={{ color: k.color }} />
              </span>
              <span className="text-[11px] text-aion-muted leading-tight">{k.label}</span>
            </div>
            <p className="text-xl font-bold font-mono text-aion-ink">{k.valor}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_440px] gap-5 items-start">
        {/* ---------------------------------------------------------- */}
        {/* Arquitectura lógica interactiva                            */}
        {/* ---------------------------------------------------------- */}
        <div className="glass-panel rounded-xl p-5">
          <h2 className="section-title mb-4">
            <Layers className="w-4 h-4 text-captura" />
            Arquitectura lógica
            <span className="text-[11px] font-normal text-aion-muted">Clic en un componente para ver su descripción y su tráfico</span>
          </h2>

          <div className="space-y-1">
            {/* Capa 0: canales de entrada */}
            <div className="grid grid-cols-[110px_1fr] gap-3 items-center">
              <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-right text-aion-muted">Canales de entrada</span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {CANALES.map((c) => {
                  const info = CANAL_INFO[c]
                  const m = canalMetrics.find((x) => x.canal === c)
                  const esIntegracion = c === 'integracion'
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => esIntegracion && setSeleccionado('integracionCliente')}
                      className={cn('rounded-lg border px-2.5 py-2 text-center transition-all min-w-0', esIntegracion ? 'hover:-translate-y-0.5 cursor-pointer' : 'cursor-default')}
                      style={{ borderColor: `${info.color}66`, backgroundColor: `${info.color}12`, color: info.color }}
                    >
                      <span className="flex items-center justify-center gap-1.5">
                        <Inbox className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-[11px] font-bold truncate">{info.label}</span>
                      </span>
                      <span className="block text-[9.5px] font-mono opacity-80 mt-0.5">{m?.total ?? 0} operaciones</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {CAPAS.map((capa) => (
              <div key={capa.nombre}>
                <div className="flex justify-center py-0.5">
                  <ArrowDown className="w-4 h-4 text-slate-300" />
                </div>
                <div className="grid grid-cols-[110px_1fr] gap-3 items-center">
                  <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-right text-aion-muted">{capa.nombre}</span>
                  <div className={cn('grid gap-2', capa.nodos.length === 3 ? 'grid-cols-1 md:grid-cols-3' : capa.nodos.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1')}>
                    {capa.nodos.map((id) => {
                      const col = SISTEMA_COLOR[id]
                      const Icono = SISTEMA_ICONO[id]
                      const activo = id === seleccionado
                      const oscuro = id === 'vistaCentral'
                      const carga = trafico[id].eventosHora / maxHora
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setSeleccionado(id)}
                          className={cn('relative rounded-lg border px-3 py-2.5 text-center transition-all overflow-hidden min-w-0 hover:-translate-y-0.5')}
                          style={{
                            borderColor: activo ? col : `${col}66`,
                            backgroundColor: oscuro ? col : `${col}12`,
                            color: oscuro ? '#fff' : col,
                            boxShadow: activo ? `0 0 0 3px ${col}33` : undefined,
                          }}
                        >
                          <motion.span
                            className="absolute bottom-0 left-0 h-0.5"
                            style={{ backgroundColor: oscuro ? '#8ab4ff' : col }}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.round(carga * 100)}%` }}
                            transition={{ duration: 0.5 }}
                          />
                          <span className="flex items-center justify-center gap-1.5">
                            <Icono className="w-4 h-4 shrink-0" />
                            <span className="text-[11.5px] font-bold tracking-wide truncate">{SISTEMA_CORTO[id]}</span>
                          </span>
                          <span className="block text-[9.5px] font-mono opacity-75 mt-0.5">{trafico[id].eventosHora} eventos/h · {formatNumber(trafico[id].eventos)} total</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-aion-muted mt-4 leading-snug">
            La barra inferior de cada componente indica su carga de la última hora frente al componente más activo. La visión centralizada lee todos los eventos de todas las operaciones.
          </p>
        </div>

        {/* ---------------------------------------------------------- */}
        {/* Panel lateral del componente seleccionado                   */}
        {/* ---------------------------------------------------------- */}
        <motion.div
          key={seleccionado}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="glass-panel rounded-xl overflow-hidden xl:sticky xl:top-20"
          style={{ borderLeftWidth: 4, borderLeftColor: color }}
        >
          <div className="p-5 border-b border-aion-line">
            <div className="flex items-center gap-3 mb-2">
              <span className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}1A` }}>
                <IconoSel className="w-5 h-5" style={{ color }} />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wider text-aion-muted">{TIPO_LABEL[def.tipo]}</p>
                <h3 className="text-base font-bold text-aion-ink leading-tight">{def.nombre}</h3>
              </div>
            </div>
            <p className="text-[13px] text-aion-ink leading-relaxed">{def.descripcion}</p>
            <p className="text-[10.5px] text-aion-muted mt-2">Párrafos del insumo: {def.p.map((n) => `P${n}`).join(' · ')}</p>
          </div>

          <div className="p-5 border-b border-aion-line">
            <p className="text-[10.5px] font-bold uppercase tracking-wider text-aion-muted mb-2">Tráfico derivado</p>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="rounded-lg bg-slate-50 px-3 py-2">
                <p className="text-[10px] text-aion-muted">Eventos última hora</p>
                <p className="text-sm font-bold font-mono text-aion-ink">{tSel.eventosHora}</p>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2">
                <p className="text-[10px] text-aion-muted">Eventos acumulados</p>
                <p className="text-sm font-bold font-mono text-aion-ink">{formatNumber(tSel.eventos)}</p>
              </div>
            </div>
            <div className="space-y-1">
              {tSel.datos.map((d) => (
                <div key={d.label} className="flex items-center justify-between gap-3 text-[11.5px]">
                  <span className="text-aion-muted">{d.label}</span>
                  <span className="font-mono font-bold text-aion-ink shrink-0">{d.valor}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 border-b border-aion-line">
            <p className="text-[10.5px] font-bold uppercase tracking-wider text-aion-muted mb-2">
              Párrafos de origen
            </p>
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
              {def.p.map((n) => (
                <div key={n} className="text-[11.5px] leading-snug text-slate-600 border-l-2 pl-2.5" style={{ borderColor: `${color}66` }}>
                  <span className="font-mono text-[10px] font-bold" style={{ color }}>P{n}</span> {P(n)}
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 border-b border-aion-line">
            <p className="text-[10.5px] font-bold uppercase tracking-wider text-aion-muted mb-2">
              Eventos que lo tocan <SupuestoTag className="ml-1" />
            </p>
            {eventosDelSistema.length === 0 ? (
              <p className="text-[11px] text-aion-muted">Sin eventos todavía</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {eventosDelSistema.map(([ev, c]) => (
                  <span key={ev} className="text-[10.5px] font-mono px-2 py-0.5 rounded bg-slate-100 text-aion-ink">
                    {ev} <b>{c}</b>
                  </span>
                ))}
              </div>
            )}
          </div>

          {reglasDelSistema.length > 0 && (
            <div className="p-5 border-b border-aion-line">
              <p className="text-[10.5px] font-bold uppercase tracking-wider text-aion-muted mb-2">Reglas del insumo que lo cubren</p>
              <div className="flex flex-wrap gap-1.5">
                {reglasDelSistema.map((r) => (
                  <span key={r.id} className="text-[10.5px] font-mono px-2 py-0.5 rounded bg-captura-light text-captura-dark" title={r.texto}>
                    {r.id} · {r.politica}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="p-5">
            <p className="text-[10.5px] font-bold uppercase tracking-wider text-aion-muted mb-2">Actividad reciente</p>
            {actividad.length === 0 ? (
              <p className="text-xs text-aion-muted py-3 text-center">Inicia la simulación para ver tráfico en vivo</p>
            ) : (
              <div className="space-y-1.5 max-h-[180px] overflow-y-auto">
                {actividad.map((l) => (
                  <div key={l.id} className="text-[11px] text-slate-600 leading-snug flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: color }} />
                    <span className="line-clamp-2">{l.texto}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ---------------------------------------------------------- */}
      {/* Las 10 tarjetas de sistema                                  */}
      {/* ---------------------------------------------------------- */}
      <div>
        <h2 className="section-title mb-3">
          <Server className="w-4 h-4 text-captura" />
          Los diez sistemas del insumo
          <span className="text-[11px] font-normal text-aion-muted">nombres funcionales, no productos</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {SISTEMAS.map((s, i) => {
            const Icono = SISTEMA_ICONO[s.id]
            const col = SISTEMA_COLOR[s.id]
            const activo = s.id === seleccionado
            const t = trafico[s.id]
            return (
              <motion.button
                key={s.id}
                type="button"
                onClick={() => setSeleccionado(s.id)}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.03 * i }}
                className="glass-panel rounded-xl p-4 text-left transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5 flex flex-col"
                style={activo ? { borderColor: col, boxShadow: `0 0 0 3px ${col}2E` } : undefined}
              >
                <div className="flex items-start gap-2.5">
                  <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${col}1A` }}>
                    <Icono className="w-[18px] h-[18px]" style={{ color: col }} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-bold text-aion-ink leading-tight">{s.nombre}</p>
                    <p className="text-[10.5px] text-aion-muted mt-0.5">{TIPO_LABEL[s.tipo]} · {s.p.map((n) => `P${n}`).join(' ')}</p>
                  </div>
                </div>
                <p className="text-[11.5px] text-aion-muted mt-2 line-clamp-3 leading-snug">{s.descripcion}</p>
                <div className="mt-auto pt-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[10px] text-aion-muted leading-tight">{t.datos[0]?.label}</span>
                    <span className="text-sm font-bold font-mono text-aion-ink">{t.datos[0]?.valor}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-aion-muted mt-2 mb-1">
                    <span>Eventos que lo tocan</span>
                    <span className="font-mono">{formatNumber(t.eventos)}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <motion.div className="h-full rounded-full" style={{ backgroundColor: col }} initial={{ width: 0 }} animate={{ width: `${(t.eventos / maxTotal) * 100}%` }} transition={{ duration: 0.5 }} />
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>
        <div className="flex flex-wrap gap-3 mt-3 text-[11px] text-aion-muted">
          {TIPO_SOPORTE_VISTA.map((t) => (
            <span key={t} className="flex items-center gap-1.5">
              <FileText className="w-3 h-3" /> {TIPO_LABEL[t]}: {SISTEMAS.filter((s) => s.tipo === t).length}
            </span>
          ))}
        </div>
      </div>

      {/* ---------------------------------------------------------- */}
      {/* Canales de entrada con volumen                              */}
      {/* ---------------------------------------------------------- */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-aion-line flex items-center justify-between flex-wrap gap-2">
          <h2 className="section-title">
            <Inbox className="w-4 h-4 text-captura" />
            Canales de entrada → plataforma de coordinación
          </h2>
          <span className="text-[11px] text-aion-muted">Las solicitudes llegan por cuatro vías (P2)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase tracking-wider text-aion-muted">
                <th className="text-left px-5 py-2.5 font-semibold">Canal</th>
                <th className="text-left px-5 py-2.5 font-semibold">Cómo llega la solicitud</th>
                <th className="text-left px-5 py-2.5 font-semibold w-[200px]">Volumen</th>
                <th className="text-right px-5 py-2.5 font-semibold">Activas</th>
                <th className="text-right px-5 py-2.5 font-semibold">Cerradas</th>
                <th className="text-right px-5 py-2.5 font-semibold">En el coordinador</th>
                <th className="text-right px-5 py-2.5 font-semibold">% automático</th>
                <th className="text-right px-5 py-2.5 font-semibold">Contactos / op.</th>
              </tr>
            </thead>
            <tbody>
              {CANALES_DEF.map((cd) => {
                const info = CANAL_INFO[cd.id]
                const m = canalMetrics.find((x) => x.canal === cd.id)
                return (
                  <tr key={cd.id} className="border-t border-aion-line hover:bg-slate-50/60">
                    <td className="px-5 py-2.5">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: info.color }} />
                        <span className="font-semibold text-aion-ink">{cd.nombre}</span>
                      </span>
                    </td>
                    <td className="px-5 py-2.5 text-[11px] text-aion-muted max-w-[320px]">{cd.descripcion}</td>
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${((m?.total ?? 0) / maxCanal) * 100}%`, backgroundColor: info.color }} />
                        </div>
                        <span className="font-mono font-semibold text-aion-ink w-8 text-right">{m?.total ?? 0}</span>
                      </div>
                    </td>
                    <td className="px-5 py-2.5 text-right font-mono">{m?.activas ?? 0}</td>
                    <td className="px-5 py-2.5 text-right font-mono">{m?.cerradas ?? 0}</td>
                    <td className="px-5 py-2.5 text-right font-mono">{m?.escaladas ?? 0}</td>
                    <td className="px-5 py-2.5 text-right font-mono">{m ? `${Math.round(m.pctAutomatico)} %` : '—'}</td>
                    <td className="px-5 py-2.5 text-right font-mono">{m ? m.contactosPorOperacion.toFixed(1).replace(".", ",") : '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
