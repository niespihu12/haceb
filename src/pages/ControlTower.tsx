import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BarChart3,
  Bot,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Grid3x3,
  Handshake,
  Layers,
  MessageSquare,
  PhoneCall,
  Radar,
  Route,
  TrendingUp,
  Truck,
  UserCheck,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useSimulation } from '@/hooks/useSimulation'
import { cn, formatDuracion, formatNumber } from '@/lib/utils'
import { CanalBadge, CategoriaBadge, EtapaBadge, SupuestoTag } from '@/components/shared'
import {
  CANALES,
  CANAL_INFO,
  ETAPAS_FLUJO,
  ETAPA_LABEL_CORTO,
  ETAPA_BLOQUE,
  BLOQUE_COLOR,
  EXCEPCION_LABEL,
  PLANTILLA_EXCEPCION,
  TODAS_LAS_ETAPAS,
  esEtapaFlujo,
  esTerminal,
} from '@/data/mockData'
import { KPIS_INSUMO, KPIS_P, PREGUNTAS_NEGOCIO } from '@/data/procesoData'
import type { CategoriaDecision, EtapaFlujo, EtapaOperacion, MetricaKPI, Operacion, TipoExcepcion } from '@/types'

const TOOLTIP_STYLE = { borderRadius: 8, border: '1px solid #e4e7ec', fontSize: 12 }
const CAT_HEX: Record<CategoriaDecision, string> = { automatico: '#64748b', asistido: '#d97706', humano: '#be123c' }

const IDX_SELECCION = ETAPAS_FLUJO.indexOf('Seleccion')
const IDX_ASIGNACION = ETAPAS_FLUJO.indexOf('Asignacion')

/** Valor en vivo de cada indicador del insumo, con su formato. */
function valorKpi(id: string, k: MetricaKPI): { texto: string; detalle?: string } {
  switch (id) {
    case 'respuestaCliente':
      return { texto: `${k.respuestaClienteMin.toFixed(1)} min` }
    case 'respuestaTransportador':
      return { texto: `${k.respuestaTransportadorMin.toFixed(1)} min` }
    case 'confirmacionesAutomaticas':
      return { texto: `${k.pctConfirmacionesAutomaticas.toFixed(0)} %` }
    case 'llamadasExitosas':
      return { texto: `${k.pctLlamadasExitosas.toFixed(0)} %` }
    case 'negociacionesCompletadas':
      return { texto: `${k.pctNegociacionesCompletadas.toFixed(0)} %`, detalle: `${k.negociacionesCompletadas} negociaciones con tarifa acordada` }
    case 'contactosPorOperacion':
      return { texto: `${k.contactosPorOperacion.toFixed(1)}`, detalle: 'llamadas por operación' }
    case 'anticipacionNovedades':
      return { texto: formatDuracion(k.anticipacionNovedadesMin) }
    case 'cumplimientoCompromisos':
      return { texto: `${k.pctCumplimientoCompromisos.toFixed(0)} %` }
    case 'satisfaccion':
      return { texto: k.satisfaccion > 0 ? `${k.satisfaccion.toFixed(1)} / 5` : '—' }
    default:
      return { texto: '—' }
  }
}

const KPI_ICONO: Record<string, LucideIcon> = {
  respuestaCliente: Users,
  respuestaTransportador: Truck,
  confirmacionesAutomaticas: Bot,
  llamadasExitosas: PhoneCall,
  negociacionesCompletadas: Handshake,
  contactosPorOperacion: MessageSquare,
  anticipacionNovedades: AlertTriangle,
  cumplimientoCompromisos: CalendarCheck,
  satisfaccion: CheckCircle2,
}

/** Índice de la etapa más avanzada que alcanzó la operación (para el embudo). */
function etapaMasAvanzada(o: Operacion): number {
  if (o.etapa === 'Cerrada') return ETAPAS_FLUJO.length - 1
  if (esEtapaFlujo(o.etapa)) return ETAPAS_FLUJO.indexOf(o.etapa)
  const deTrazas = o.trazas.reduce((m, t) => Math.max(m, ETAPAS_FLUJO.indexOf(t.etapa)), -1)
  const deRetorno = o.etapaRetorno ? ETAPAS_FLUJO.indexOf(o.etapaRetorno) : -1
  return Math.max(0, deTrazas, deRetorno)
}

const todasExcepciones = (o: Operacion) => [...o.excepcionesPrevias, ...(o.excepcion ? [o.excepcion] : [])]

function riesgoDe(o: Operacion): string | null {
  if (o.retrasoHoras >= 2) return `Retraso de ${o.retrasoHoras.toFixed(1)} h sobre el compromiso`
  if (o.excepcion && o.excepcion.alternativas.some((a) => a.impactoSLA === 'alto')) return 'Novedad con impacto alto en el SLA'
  return null
}

function HeatCell({ count, max }: { count: number; max: number }) {
  const intensidad = max > 0 ? count / max : 0
  const bg =
    intensidad === 0
      ? 'bg-slate-50 text-slate-300'
      : intensidad < 0.34
        ? 'bg-captura-light text-captura'
        : intensidad < 0.67
          ? 'bg-captura/40 text-aion-ink'
          : 'bg-captura text-white'
  return <div className={cn('flex items-center justify-center py-1 rounded text-xs font-mono', bg)}>{count}</div>
}

interface ItemLista {
  key: string
  id?: string
  izq: string
  der?: string
}

function PreguntaCard({
  indice,
  texto,
  icono: Icono,
  total,
  etiquetaTotal,
  color,
  items,
  vacio,
  pie,
}: {
  indice: number
  texto: string
  icono: LucideIcon
  total: number | string
  etiquetaTotal: string
  color: string
  items: ItemLista[]
  vacio: string
  pie?: React.ReactNode
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: indice * 0.04 }} className="glass-panel rounded-xl p-4 flex flex-col min-h-[210px]">
      <div className="flex items-start gap-2 mb-2">
        <span className="w-5 h-5 rounded-full bg-aion-ink text-white text-[10px] font-bold flex items-center justify-center shrink-0">{indice + 1}</span>
        <p className="text-[12px] font-semibold text-aion-ink leading-snug flex-1">{texto}</p>
        <Icono className="w-4 h-4 shrink-0" style={{ color }} />
      </div>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-3xl font-bold" style={{ color }}>{total}</span>
        <span className="text-[11px] text-aion-muted">{etiquetaTotal}</span>
      </div>
      <div className="space-y-1 flex-1">
        {items.map((it) => (
          <div key={it.key} className="flex items-center gap-2 text-[11.5px]">
            {it.id ? (
              <Link to={`/operacion/${it.id}`} className="font-mono text-captura hover:underline shrink-0">{it.id}</Link>
            ) : null}
            <span className="text-aion-ink flex-1 truncate">{it.izq}</span>
            {it.der && <span className="font-mono text-[10.5px] text-aion-muted shrink-0">{it.der}</span>}
          </div>
        ))}
        {items.length === 0 && <p className="text-[11px] text-aion-muted">{vacio}</p>}
      </div>
      {pie && <div className="pt-2 mt-auto text-[10.5px] text-aion-muted">{pie}</div>}
    </motion.div>
  )
}

export default function ControlTower() {
  const navigate = useNavigate()
  const { allOperaciones, kpis, canalMetrics, ahora } = useSimulation()

  const activas = useMemo(() => allOperaciones.filter((o) => !esTerminal(o.etapa)), [allOperaciones])

  // --- Las preguntas de negocio (P45–P46) -----------------------------------
  const q = useMemo(() => {
    const idx = (o: Operacion) => (esEtapaFlujo(o.etapa) ? ETAPAS_FLUJO.indexOf(o.etapa) : -1)
    const pendientesAsignacion = activas.filter((o) => esEtapaFlujo(o.etapa) && idx(o) <= IDX_SELECCION)
    const enNegociacion = activas.filter((o) => o.etapa === 'Negociacion')
    const confirmados = activas.filter((o) => o.transportador !== null && (!esEtapaFlujo(o.etapa) || idx(o) >= IDX_ASIGNACION))
    const transportadoresConfirmados = new Set(confirmados.map((o) => o.transportador?.id))
    const infoPendiente = activas.filter((o) => o.etapa === 'EsperaDatos' || o.datosPendientes.length > 0)
    const clientesInfoPendiente = new Set(infoPendiente.map((o) => o.cliente.id))
    const enTransito = activas.filter((o) => ['Transito', 'AvisoDestino', 'Descargue'].includes(o.etapa))
    const novedades = activas.filter((o) => o.etapa === 'Escalada' || o.excepcion !== null)

    // Última comunicación por participante
    const ultimas = new Map<string, { nombre: string; rol: string; ts: number; objetivo: string; opId: string }>()
    for (const o of allOperaciones) {
      for (const l of o.llamadas) {
        const clave = `${l.interlocutor}:${l.nombre}`
        const prev = ultimas.get(clave)
        if (!prev || l.ts > prev.ts) ultimas.set(clave, { nombre: l.nombre, rol: l.interlocutor, ts: l.ts, objetivo: l.objetivo, opId: o.id })
      }
    }
    const ultimasLista = Array.from(ultimas.values()).sort((a, b) => b.ts - a.ts)

    // Compromisos
    const compromisos = allOperaciones.flatMap((o) => o.compromisos.map((c) => ({ c, o })))
    const pendientes = compromisos.filter((x) => x.c.estado === 'pendiente')
    const incumplidos = compromisos.filter((x) => x.c.estado === 'incumplido')
    const cumplidos = compromisos.filter((x) => x.c.estado === 'cumplido')

    // Qué ejecuta el sistema vs. el coordinador
    const escaladas = activas.filter((o) => o.etapa === 'Escalada')
    const excepciones = allOperaciones.flatMap(todasExcepciones)
    const porAgente = excepciones.filter((e) => e.resueltaPor === 'agente' || (!e.resueltaPor && e.categoria === 'automatico')).length
    const porCoordinador = excepciones.filter((e) => e.resueltaPor === 'coordinador').length

    return {
      pendientesAsignacion,
      enNegociacion,
      confirmados,
      transportadoresConfirmados,
      infoPendiente,
      clientesInfoPendiente,
      enTransito,
      novedades,
      ultimasLista,
      pendientes,
      incumplidos,
      cumplidos,
      escaladas,
      porAgente,
      porCoordinador,
      enManosSistema: activas.length - escaladas.length,
    }
  }, [allOperaciones, activas])

  // --- Gráficos -------------------------------------------------------------
  const embudo = useMemo(() => {
    return ETAPAS_FLUJO.map((e: EtapaFlujo, i) => ({
      etapa: ETAPA_LABEL_CORTO[e],
      Alcanzaron: allOperaciones.filter((o) => etapaMasAvanzada(o) >= i).length,
      'Están aquí': allOperaciones.filter((o) => o.etapa === e).length,
      color: BLOQUE_COLOR[ETAPA_BLOQUE[e]].color,
    }))
  }, [allOperaciones])

  const porTipo = useMemo(() => {
    const cuenta = new Map<TipoExcepcion, number>()
    for (const e of allOperaciones.flatMap(todasExcepciones)) cuenta.set(e.tipo, (cuenta.get(e.tipo) ?? 0) + 1)
    return Array.from(cuenta.entries())
      .map(([tipo, n]) => ({ name: EXCEPCION_LABEL[tipo], cantidad: n, color: CAT_HEX[PLANTILLA_EXCEPCION[tipo].categoriaBase] }))
      .sort((a, b) => b.cantidad - a.cantidad)
  }, [allOperaciones])

  const porCanal = useMemo(
    () =>
      canalMetrics.map((m) => ({
        canal: CANAL_INFO[m.canal].corto,
        Activas: m.activas,
        Cerradas: m.cerradas,
        'En el coordinador': m.escaladas,
      })),
    [canalMetrics],
  )

  const contactos = useMemo(
    () =>
      [...allOperaciones]
        .sort((a, b) => a.seq - b.seq)
        .slice(-40)
        .map((o) => ({ op: o.id.replace('OP-', ''), Llamadas: o.llamadas.length })),
    [allOperaciones],
  )

  const heatmap = useMemo(() => {
    const etapas: EtapaOperacion[] = TODAS_LAS_ETAPAS
    const conteo: Record<string, Record<string, number>> = {}
    for (const e of etapas) {
      conteo[e] = {}
      for (const c of CANALES) conteo[e][c] = 0
    }
    for (const o of allOperaciones) conteo[o.etapa][o.canal] += 1
    const max = Math.max(1, ...etapas.flatMap((e) => CANALES.map((c) => conteo[e][c])))
    return { etapas, conteo, max }
  }, [allOperaciones])

  const enRiesgo = useMemo(
    () =>
      activas
        .map((o) => ({ o, motivo: riesgoDe(o) }))
        .filter((x): x is { o: Operacion; motivo: string } => x.motivo !== null)
        .sort((a, b) => b.o.retrasoHoras - a.o.retrasoHoras),
    [activas],
  )

  const relativo = (ts: number) => `hace ${formatDuracion(Math.max(0, (ahora - ts) / 60000))}`

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-[1440px] mx-auto px-6 pb-12 space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-aion-ink flex items-center gap-2">
          <Radar className="w-6 h-6 text-aion-ink" />
          Control Tower
        </h1>
        <p className="text-sm text-aion-muted mt-0.5 max-w-4xl">
          Visión centralizada de las operaciones y las comunicaciones: responde las preguntas de negocio del insumo (P45–P46) y mide con los nueve indicadores que el documento pide para evaluar la efectividad de la IA (P{KPIS_P}). Todo se calcula en vivo sobre la operación simulada.
        </p>
      </div>

      {/* Conteos operativos */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
        {[
          { l: 'Operaciones', v: kpis.total },
          { l: 'Activas', v: kpis.activas },
          { l: 'Cerradas', v: kpis.cerradas },
          { l: 'Canceladas', v: kpis.canceladas },
          { l: 'En el coordinador', v: kpis.escaladas },
          { l: 'Esperando datos', v: kpis.esperaDatos },
          { l: 'En tránsito', v: kpis.enTransito },
          { l: 'En riesgo de SLA', v: enRiesgo.length },
        ].map((c, i) => (
          <motion.div key={c.l} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="kpi-card !p-3">
            <p className="text-[10.5px] text-aion-muted leading-tight">{c.l}</p>
            <p className={cn('text-xl font-bold font-mono mt-0.5', c.l === 'En riesgo de SLA' && c.v > 0 ? 'text-error' : 'text-aion-ink')}>{formatNumber(c.v)}</p>
          </motion.div>
        ))}
      </div>

      {/* Los nueve indicadores del insumo */}
      <section>
        <h2 className="section-title mb-3">
          <TrendingUp className="w-4 h-4 text-captura" />
          Los nueve indicadores del insumo
          <span className="text-[11px] font-normal text-aion-muted">P{KPIS_P} · calculados en vivo</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {KPIS_INSUMO.map((k, i) => {
            const v = valorKpi(k.id, kpis)
            const Icono = KPI_ICONO[k.id] ?? Activity
            const MejorIcono = k.mejor === 'alto' ? ArrowUp : ArrowDown
            return (
              <motion.div key={k.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="glass-panel rounded-xl p-4 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-captura-light flex items-center justify-center shrink-0">
                      <Icono className="w-4 h-4 text-captura" />
                    </span>
                    <p className="text-[12.5px] font-semibold text-aion-ink leading-tight">{k.nombre}</p>
                  </div>
                  <span className={cn('badge-compact gap-0.5 shrink-0', k.mejor === 'alto' ? 'bg-success-light text-success' : 'bg-info-light text-info')} title={`Es mejor cuando el valor es ${k.mejor}`}>
                    <MejorIcono className="w-3 h-3" />
                    mejor {k.mejor}
                  </span>
                </div>
                <p className="text-3xl font-bold font-mono text-aion-ink mt-3">{v.texto}</p>
                {v.detalle && <p className="text-[10.5px] text-aion-muted">{v.detalle}</p>}
                <p className="text-[11.5px] text-aion-muted leading-snug mt-2">{k.definicion}</p>
                <p className="text-[10px] font-mono text-slate-400 mt-auto pt-2">unidad: {k.unidad}</p>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Preguntas de negocio */}
      <section>
        <h2 className="section-title mb-3">
          <Layers className="w-4 h-4 text-captura" />
          Preguntas de negocio de la visión centralizada
          <span className="text-[11px] font-normal text-aion-muted">P45–P46 · respondidas en vivo</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          <PreguntaCard
            indice={0}
            texto={PREGUNTAS_NEGOCIO[0].texto}
            icono={Clock}
            color="#2563eb"
            total={q.pendientesAsignacion.length}
            etiquetaTotal="entre Solicitud y Selección"
            items={q.pendientesAsignacion.slice(0, 4).map((o) => ({ key: o.id, id: o.id, izq: o.cliente.nombre, der: ETAPA_LABEL_CORTO[o.etapa] }))}
            vacio="Nada pendiente de asignar"
          />
          <PreguntaCard
            indice={1}
            texto={PREGUNTAS_NEGOCIO[1].texto}
            icono={Handshake}
            color="#0d9488"
            total={q.enNegociacion.length}
            etiquetaTotal="en negociación"
            items={q.enNegociacion.slice(0, 4).map((o) => ({ key: o.id, id: o.id, izq: o.cliente.nombre, der: `${o.ofertas.length} candidatos` }))}
            vacio="Ninguna negociación en curso"
          />
          <PreguntaCard
            indice={2}
            texto={PREGUNTAS_NEGOCIO[2].texto}
            icono={Truck}
            color="#d97706"
            total={q.transportadoresConfirmados.size}
            etiquetaTotal={`transportadores · ${q.confirmados.length} operaciones`}
            items={q.confirmados.slice(0, 4).map((o) => ({ key: o.id, id: o.id, izq: o.transportador?.nombre ?? '', der: o.transportador?.placa }))}
            vacio="Ningún transportador confirmado"
          />
          <PreguntaCard
            indice={3}
            texto={PREGUNTAS_NEGOCIO[3].texto}
            icono={Users}
            color="#e11d48"
            total={q.clientesInfoPendiente.size}
            etiquetaTotal={`clientes · ${q.infoPendiente.length} operaciones`}
            items={q.infoPendiente.slice(0, 4).map((o) => ({ key: o.id, id: o.id, izq: o.cliente.nombre, der: o.datosPendientes.length > 0 ? `${o.datosPendientes.length} datos` : 'espera datos' }))}
            vacio="Ningún cliente con información pendiente"
            pie="Espera de datos o datos que el cliente no tenía al llamar (R02)"
          />
          <PreguntaCard
            indice={4}
            texto={PREGUNTAS_NEGOCIO[4].texto}
            icono={Route}
            color="#7c3aed"
            total={q.enTransito.length}
            etiquetaTotal="en tránsito, destino o descargue"
            items={q.enTransito.slice(0, 4).map((o) => ({ key: o.id, id: o.id, izq: `${o.nodoOrigen.ciudad} → ${o.nodoDestino.ciudad}`, der: ETAPA_LABEL_CORTO[o.etapa] }))}
            vacio="Ninguna operación en tránsito"
          />
          <PreguntaCard
            indice={5}
            texto={PREGUNTAS_NEGOCIO[5].texto}
            icono={AlertTriangle}
            color="#be123c"
            total={q.novedades.length}
            etiquetaTotal={`novedades · ${q.escaladas.length} en el coordinador`}
            items={q.novedades.slice(0, 4).map((o) => ({ key: o.id, id: o.id, izq: o.excepcion?.titulo ?? 'Escalada al coordinador', der: o.etapa === 'Escalada' ? 'coordinador' : 'agente' }))}
            vacio="Sin novedades que atender"
            pie={
              <Link to="/coordinador" className="text-captura underline underline-offset-2">
                Abrir la Mesa del coordinador
              </Link>
            }
          />
          <PreguntaCard
            indice={6}
            texto={PREGUNTAS_NEGOCIO[6].texto}
            icono={MessageSquare}
            color="#0891b2"
            total={q.ultimasLista.length}
            etiquetaTotal="participantes con contacto registrado"
            items={q.ultimasLista.slice(0, 5).map((u) => ({ key: `${u.rol}-${u.nombre}`, id: u.opId, izq: `${u.nombre} · ${u.rol}`, der: relativo(u.ts) }))}
            vacio="Sin comunicaciones todavía"
            pie="Se muestran los cinco contactos más recientes"
          />
          <PreguntaCard
            indice={7}
            texto={PREGUNTAS_NEGOCIO[7].texto}
            icono={CalendarCheck}
            color="#d97706"
            total={q.pendientes.length}
            etiquetaTotal={`pendientes · ${q.incumplidos.length} incumplidos · ${q.cumplidos.length} cumplidos`}
            items={[...q.incumplidos, ...q.pendientes].slice(0, 4).map(({ c, o }) => ({ key: c.id, id: o.id, izq: c.texto, der: c.estado === 'incumplido' ? 'incumplido' : 'pendiente' }))}
            vacio="Sin compromisos pendientes"
          />
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 8 * 0.04 }} className="glass-panel rounded-xl p-4 flex flex-col min-h-[210px]">
            <div className="flex items-start gap-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-aion-ink text-white text-[10px] font-bold flex items-center justify-center shrink-0">9</span>
              <p className="text-[12px] font-semibold text-aion-ink leading-snug flex-1">{PREGUNTAS_NEGOCIO[8].texto}</p>
              <UserCheck className="w-4 h-4 shrink-0 text-liberacion" />
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="rounded-lg bg-validacion-light px-3 py-2">
                <p className="text-[10px] text-validacion-dark">Lo ejecuta el sistema</p>
                <p className="text-2xl font-bold text-validacion">{q.enManosSistema}</p>
                <p className="text-[10px] text-validacion-dark">operaciones activas con los agentes</p>
              </div>
              <div className="rounded-lg bg-catC-light px-3 py-2">
                <p className="text-[10px] text-catC-dark">Requiere al coordinador</p>
                <p className="text-2xl font-bold text-catC-dark">{q.escaladas.length}</p>
                <p className="text-[10px] text-catC-dark">en la Mesa del coordinador</p>
              </div>
            </div>
            <div className="space-y-1 text-[11.5px]">
              <div className="flex justify-between"><span className="text-aion-muted">Novedades resueltas por el agente</span><span className="font-mono font-semibold">{q.porAgente}</span></div>
              <div className="flex justify-between"><span className="text-aion-muted">Novedades decididas por el coordinador</span><span className="font-mono font-semibold">{q.porCoordinador}</span></div>
            </div>
            <p className="pt-2 mt-auto text-[10.5px] text-aion-muted">Informar y confirmar se automatiza; tarifas, sobrecostos y cancelaciones requieren al responsable (R28).</p>
          </motion.div>
        </div>
      </section>

      {/* Gráficos */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel rounded-xl p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-5 h-5 text-captura" />
            <h3 className="font-semibold text-aion-ink">Flujo del proceso · embudo por etapa</h3>
          </div>
          <p className="text-[11px] text-aion-muted mb-3">Cuántas operaciones alcanzaron cada etapa y cuántas están ahora en ella. Color por bloque del flujo.</p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={embudo} margin={{ top: 5, right: 10, left: 0, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef0f4" />
                <XAxis dataKey="etapa" tick={{ fontSize: 10, fill: '#5b6472' }} interval={0} angle={-35} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11, fill: '#5b6472' }} allowDecimals={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Alcanzaron" radius={[4, 4, 0, 0]} barSize={16}>
                  {embudo.map((d) => (
                    <Cell key={d.etapa} fill={d.color} fillOpacity={0.35} />
                  ))}
                </Bar>
                <Bar dataKey="Están aquí" radius={[4, 4, 0, 0]} barSize={16}>
                  {embudo.map((d) => (
                    <Cell key={d.etapa} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }} className="glass-panel rounded-xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-5 h-5 text-excepcion" />
            <h3 className="font-semibold text-aion-ink">Novedades por tipo</h3>
          </div>
          <p className="text-[11px] text-aion-muted mb-3 flex items-center gap-2 flex-wrap">
            Color por categoría de decisión:
            {(['automatico', 'asistido', 'humano'] as CategoriaDecision[]).map((c) => (
              <CategoriaBadge key={c} categoria={c} />
            ))}
          </p>
          <div className="h-80">
            {porTipo.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-aion-muted">Sin novedades registradas</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={porTipo} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef0f4" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#5b6472' }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 9.5, fill: '#5b6472' }} width={210} interval={0} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="cantidad" name="Novedades" radius={[0, 4, 4, 0]} barSize={12}>
                    {porTipo.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }} className="glass-panel rounded-xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5 text-success" />
            <h3 className="font-semibold text-aion-ink">Operaciones por canal de entrada</h3>
          </div>
          <p className="text-[11px] text-aion-muted mb-3">Estado actual de las operaciones que entraron por cada canal.</p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={porCanal} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef0f4" />
                <XAxis dataKey="canal" tick={{ fontSize: 11, fill: '#5b6472' }} />
                <YAxis tick={{ fontSize: 11, fill: '#5b6472' }} allowDecimals={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Activas" radius={[6, 6, 0, 0]} barSize={18} fill="#2563eb" />
                <Bar dataKey="Cerradas" radius={[6, 6, 0, 0]} barSize={18} fill="#059669" />
                <Bar dataKey="En el coordinador" radius={[6, 6, 0, 0]} barSize={18} fill="#d97706" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.44 }} className="glass-panel rounded-xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <PhoneCall className="w-5 h-5 text-liberacion" />
            <h3 className="font-semibold text-aion-ink">Contactos por operación</h3>
          </div>
          <p className="text-[11px] text-aion-muted mb-3">Llamadas de las últimas 40 operaciones; la línea punteada es el promedio ({kpis.contactosPorOperacion.toFixed(1)}).</p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={contactos} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef0f4" />
                <XAxis dataKey="op" tick={{ fontSize: 10, fill: '#5b6472' }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: '#5b6472' }} allowDecimals={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} labelFormatter={(l) => `OP-${String(l)}`} />
                <ReferenceLine y={kpis.contactosPorOperacion} stroke="#7c3aed" strokeDasharray="4 4" />
                <Line type="monotone" dataKey="Llamadas" stroke="#7c3aed" strokeWidth={2} dot={{ r: 2 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </section>

      {/* Riesgo de SLA + heatmap */}
      <section className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-6">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-panel rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-aion-line flex items-center gap-2 flex-wrap">
            <Clock className="w-5 h-5 text-error" />
            <h3 className="font-semibold text-aion-ink">Operaciones en riesgo de SLA</h3>
            <span className="badge-compact bg-error-light text-error ml-1">{enRiesgo.length}</span>
            <span className="text-[10.5px] text-aion-muted ml-auto">retraso ≥ 2 h o novedad con impacto alto · <SupuestoTag /></span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-[10.5px] text-aion-muted uppercase tracking-wider">
                  <th className="px-4 py-2.5 font-medium">Operación</th>
                  <th className="px-4 py-2.5 font-medium">Canal</th>
                  <th className="px-4 py-2.5 font-medium">Cliente</th>
                  <th className="px-4 py-2.5 font-medium">Etapa</th>
                  <th className="px-4 py-2.5 font-medium">Motivo</th>
                  <th className="px-4 py-2.5 font-medium text-center">Cat.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {enRiesgo.slice(0, 12).map(({ o, motivo }) => (
                  <tr key={o.id} className="hover:bg-slate-50/60 transition-colors cursor-pointer" onClick={() => navigate(`/operacion/${o.id}`)}>
                    <td className="px-4 py-2.5 font-mono text-[11px]">
                      <Link to={`/operacion/${o.id}`} onClick={(e) => e.stopPropagation()} className="text-captura hover:underline">
                        {o.id}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5"><CanalBadge canal={o.canal} /></td>
                    <td className="px-4 py-2.5 text-xs text-slate-700 max-w-[170px] truncate">{o.cliente.nombre}</td>
                    <td className="px-4 py-2.5"><EtapaBadge etapa={o.etapa} /></td>
                    <td className="px-4 py-2.5 text-[11px] text-error font-medium">{motivo}</td>
                    <td className="px-4 py-2.5 text-center">{o.excepcion ? <CategoriaBadge categoria={o.excepcion.categoria} /> : <span className="text-slate-300">—</span>}</td>
                  </tr>
                ))}
                {enRiesgo.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-aion-muted text-xs">Ninguna operación activa está en riesgo de SLA</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {enRiesgo.length > 12 && <p className="px-4 py-2 text-[11px] text-aion-muted border-t border-aion-line">Mostrando 12 de {enRiesgo.length} operaciones en riesgo.</p>}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.58 }} className="glass-panel rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-aion-line flex items-center gap-2">
            <Grid3x3 className="w-5 h-5 text-captura" />
            <h3 className="font-semibold text-aion-ink">Etapa × canal</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-[120px_repeat(4,1fr)] gap-1 items-center">
              <span />
              {CANALES.map((c) => (
                <span key={c} className="text-center text-[10px] font-semibold font-mono" style={{ color: CANAL_INFO[c].color }}>
                  {CANAL_INFO[c].corto}
                </span>
              ))}
              {heatmap.etapas.map((e) => (
                <HeatRow key={e} etapa={e} conteo={heatmap.conteo[e]} max={heatmap.max} />
              ))}
            </div>
          </div>
        </motion.div>
      </section>
    </motion.div>
  )
}

function HeatRow({ etapa, conteo, max }: { etapa: EtapaOperacion; conteo: Record<string, number>; max: number }) {
  return (
    <>
      <span className="text-[11px] text-aion-muted whitespace-nowrap truncate">{ETAPA_LABEL_CORTO[etapa]}</span>
      {CANALES.map((c) => (
        <HeatCell key={c} count={conteo[c] ?? 0} max={max} />
      ))}
    </>
  )
}
