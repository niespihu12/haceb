import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  ChevronDown,
  Clock,
  Database,
  ExternalLink,
  Inbox,
  Lightbulb,
  Scale,
  ShieldCheck,
  Timer,
  ToggleLeft,
  ToggleRight,
  UserCheck,
  XCircle,
  Zap,
} from 'lucide-react'
import { useSimulation } from '@/hooks/useSimulation'
import { cn, formatCOPLargo, formatDuracion, formatHora } from '@/lib/utils'
import { CanalBadge, CategoriaBadge, EtapaBadge } from '@/components/shared'
import {
  CATEGORIAS,
  CATEGORIA_LABEL,
  CANAL_INFO,
  ETAPA_LABEL,
  EXCEPCION_LABEL,
  PLANTILLA_EXCEPCION,
  TIPOS_EXCEPCION,
  esTerminal,
} from '@/data/mockData'
import { CATEGORIA_DEF, REGLAS } from '@/data/procesoData'
import type { Alternativa, DecisionHumana, NivelSLA, Operacion, TipoExcepcion } from '@/types'

const SLA_RANGO: Record<NivelSLA, number> = { ninguno: 0, bajo: 1, medio: 2, alto: 3 }
const SLA_CLASE: Record<NivelSLA, string> = {
  ninguno: 'bg-slate-100 text-slate-600',
  bajo: 'bg-success-light text-success',
  medio: 'bg-promesa-light text-promesa-dark',
  alto: 'bg-catD-light text-catD-dark',
}
const SLA_LABEL: Record<NivelSLA, string> = { ninguno: 'sin riesgo', bajo: 'riesgo bajo', medio: 'riesgo medio', alto: 'riesgo alto' }

const DECISION_CLASE: Record<DecisionHumana, string> = {
  AUTORIZAR: 'bg-success-light text-success',
  ALTERNATIVA: 'bg-catC-light text-catC-dark',
  RECHAZAR: 'bg-slate-100 text-slate-600',
  CANCELAR: 'bg-catD-light text-catD-dark',
}
const DECISION_LABEL: Record<DecisionHumana, string> = {
  AUTORIZAR: 'Autorizó la propuesta',
  ALTERNATIVA: 'Eligió alternativa',
  RECHAZAR: 'Rechazó la propuesta',
  CANCELAR: 'Canceló el servicio',
}

function Seccion({ titulo, children, className }: { titulo: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('px-5 py-4 border-t border-aion-line first:border-t-0', className)}>
      <p className="text-[10.5px] font-extrabold tracking-[0.14em] uppercase text-aion-muted mb-2">{titulo}</p>
      {children}
    </div>
  )
}

function costoTexto(v: number): string {
  if (v === 0) return 'Sin costo adicional'
  return `${v > 0 ? '+' : '−'} ${formatCOPLargo(Math.abs(v))}`
}

function horasTexto(h: number): string {
  if (h === 0) return 'Sin demora'
  return `${h > 0 ? '+' : '−'} ${formatDuracion(Math.abs(h) * 60)}`
}

const riesgoSLA = (op: Operacion): number => {
  const e = op.excepcion
  if (!e) return 0
  const rec = e.alternativas.find((a) => a.id === e.recomendada)
  return SLA_RANGO[rec?.impactoSLA ?? 'ninguno']
}

export default function Coordinador() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const { allOperaciones, ahora, decidirOperacion, cancelarOperacion, forzarExcepcion, seleccionAutomatica, setSeleccionAutomatica } = useSimulation()

  // Gestiones en manos del coordinador: más antiguas primero dentro de cada nivel de riesgo de SLA.
  const bandeja = useMemo(
    () =>
      allOperaciones
        .filter((o) => o.etapa === 'Escalada' && o.excepcion)
        .sort((a, b) => {
          const ra = riesgoSLA(a)
          const rb = riesgoSLA(b)
          if (ra !== rb) return rb - ra
          return a.excepcion!.detectadaEn - b.excepcion!.detectadaEn
        }),
    [allOperaciones],
  )

  const historial = useMemo(() => {
    const vistos = new Set<string>()
    const filas: { op: Operacion; exc: Operacion['excepcionesPrevias'][number] }[] = []
    for (const op of allOperaciones) {
      for (const exc of op.excepcionesPrevias) {
        if (exc.resueltaPor !== 'coordinador') continue
        const clave = `${op.id}-${exc.id}`
        if (vistos.has(clave)) continue
        vistos.add(clave)
        filas.push({ op, exc })
      }
    }
    return filas.sort((a, b) => (b.exc.resueltaEn ?? 0) - (a.exc.resueltaEn ?? 0)).slice(0, 12)
  }, [allOperaciones])

  const idParam = params.get('operacion')
  const [seleccionLocal, setSeleccionLocal] = useState<string | null>(null)
  const seleccion = seleccionLocal ?? idParam
  const actual: Operacion | undefined = bandeja.find((o) => o.id === seleccion) ?? bandeja[0]

  // La confirmación de cancelación pertenece a una operación concreta: al cambiar se descarta sola.
  const [cancelando, setCancelando] = useState<string | null>(null)
  const confirmando = actual !== undefined && cancelando === actual.id

  const [demoAbierta, setDemoAbierta] = useState(false)
  const [demoOp, setDemoOp] = useState('')
  const [demoTipo, setDemoTipo] = useState<TipoExcepcion>('Tarifa_sobre_tope')

  const elegir = (id: string) => {
    setSeleccionLocal(id)
    setCancelando(null)
    if (params.get('operacion')) setParams({})
  }

  const exc = actual?.excepcion ?? null
  const plantilla = exc ? PLANTILLA_EXCEPCION[exc.tipo] : null
  const regla = plantilla ? REGLAS.find((r) => r.id === plantilla.regla) : undefined
  const recomendada = exc?.alternativas.find((a) => a.id === exc.recomendada)
  const delAgente = actual?.origen === 'agentes'

  const tiempoMedio = useMemo(() => {
    if (bandeja.length === 0) return 0
    return bandeja.reduce((s, o) => s + (ahora - o.excepcion!.detectadaEn) / 60000, 0) / bandeja.length
  }, [bandeja, ahora])

  const operacionesActivas = useMemo(() => allOperaciones.filter((o) => !esTerminal(o.etapa) && o.origen !== 'agentes'), [allOperaciones])
  const demoOpValida = operacionesActivas.some((o) => o.id === demoOp) ? demoOp : (operacionesActivas[0]?.id ?? '')

  const hayPendienteSeleccion = bandeja.some((o) => o.excepcion?.tipo === 'Seleccion_manual')

  const textoAlternativa = (a: Alternativa) => (a.efecto.tipo === 'cancelar' ? 'Cancelar el servicio' : `Elegir alternativa ${a.id}`)

  return (
    <div className="max-w-[1440px] mx-auto px-6 pb-12 space-y-5">
      {/* Encabezado */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-aion-ink flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-catC-dark" />
            Mesa del coordinador
          </h2>
          <p className="text-sm text-aion-muted mt-0.5">
            Aquí llegan las gestiones que el agente no decide solo. La persona no recibe un aviso suelto: recibe un <b className="text-aion-ink">paquete de decisión</b> con causa, impacto, evidencia y alternativas.
          </p>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-aion-muted">
          <span className="flex items-center gap-1.5 bg-white border border-aion-line rounded-lg px-3 py-1.5">
            <Inbox className="w-3.5 h-3.5 text-catC-dark" />
            <b className="text-aion-ink">{bandeja.length}</b> pendientes
          </span>
          <span className="flex items-center gap-1.5 bg-white border border-aion-line rounded-lg px-3 py-1.5">
            <Timer className="w-3.5 h-3.5 text-promesa-dark" />
            Espera media <b className="text-aion-ink">{formatDuracion(tiempoMedio)}</b>
          </span>
        </div>
      </div>

      {/* Interruptor de selección automática (R09) */}
      <div className={cn('rounded-xl border px-4 py-3 flex items-start gap-3', seleccionAutomatica ? 'bg-white border-aion-line' : 'bg-catC-light/50 border-catC/40')}>
        <Scale className={cn('w-5 h-5 shrink-0 mt-0.5', seleccionAutomatica ? 'text-validacion' : 'text-catC-dark')} />
        <div className="flex-1 min-w-0 text-[12.5px] leading-relaxed text-aion-ink">
          <p className="font-semibold">
            Selección automática: {seleccionAutomatica ? 'activada' : 'desactivada'} <span className="font-mono text-[11px] text-aion-muted">· R09 · POL-SEL-01</span>
          </p>
          <p className="text-aion-muted">
            {seleccionAutomatica
              ? 'La plataforma elige al transportador cuando se cumplen los requisitos operativos, documentales y comerciales; solo llegan aquí las selecciones que no los cumplen.'
              : 'Está desactivada: las ofertas de los transportadores llegan a esta Mesa como «Selección por el coordinador» y la persona revisa y selecciona.'}
            {!seleccionAutomatica && hayPendienteSeleccion && <b className="text-catC-dark"> Hay selecciones esperando ahora mismo.</b>}
          </p>
        </div>
        <button
          onClick={() => setSeleccionAutomatica(!seleccionAutomatica)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-aion-line bg-white hover:bg-slate-50 text-[11px] font-medium text-aion-ink shrink-0"
        >
          {seleccionAutomatica ? <ToggleRight className="w-4 h-4 text-validacion" /> : <ToggleLeft className="w-4 h-4 text-slate-400" />}
          {seleccionAutomatica ? 'Desactivar' : 'Activar'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-5 items-start">
        {/* Lista de gestiones */}
        <div className="glass-panel rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-aion-line flex items-center justify-between">
            <h3 className="section-title">
              <Inbox className="w-4 h-4 text-catC-dark" />
              Gestiones pendientes
            </h3>
            <span className="badge-compact bg-catC-light text-catC-dark">{bandeja.length}</span>
          </div>
          <div className="max-h-[640px] overflow-y-auto">
            {bandeja.length === 0 ? (
              <p className="text-sm text-aion-muted text-center py-10 px-4">Sin gestiones pendientes.</p>
            ) : (
              bandeja.map((o) => {
                const e = o.excepcion!
                const sel = actual?.id === o.id
                const espera = (ahora - e.detectadaEn) / 60000
                const rec = e.alternativas.find((a) => a.id === e.recomendada)
                return (
                  <button
                    key={o.id}
                    onClick={() => elegir(o.id)}
                    className={cn(
                      'w-full text-left px-4 py-3 border-b border-aion-line transition-colors border-l-4',
                      sel ? 'bg-catC-light/60 border-l-catC' : 'hover:bg-slate-50 border-l-transparent',
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[11px] font-semibold text-captura">{o.id}</span>
                      <CanalBadge canal={o.canal} />
                      <CategoriaBadge categoria={e.categoria} className="ml-auto" />
                    </div>
                    <p className="text-xs font-medium text-aion-ink leading-snug line-clamp-2">{e.titulo}</p>
                    <div className="flex items-center justify-between mt-1.5 text-[10.5px] text-aion-muted gap-2">
                      <span className="truncate">{o.cliente.nombre}</span>
                      <span className={cn('font-mono shrink-0', espera > 120 && 'text-error font-semibold')}>
                        <Clock className="w-3 h-3 inline mr-0.5 -mt-px" />
                        {formatDuracion(espera)}
                      </span>
                    </div>
                    {rec && (
                      <span className={cn('badge-compact mt-1.5 inline-block', SLA_CLASE[rec.impactoSLA])}>SLA · {SLA_LABEL[rec.impactoSLA]}</span>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Paquete de decisión + historial */}
        <div className="space-y-4">
          {actual && exc && plantilla ? (
            <motion.div
              key={actual.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="glass-panel rounded-xl overflow-hidden border-l-4 border-l-catC"
            >
              <Seccion titulo="Gestión" className="bg-catC-light/40">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <p className="font-mono text-[13px] font-bold text-aion-ink">
                      {actual.id}
                      <span className="ml-2 text-[11px] font-normal text-aion-muted">
                        {actual.cliente.nombre} · {CANAL_INFO[actual.canal].label}
                      </span>
                    </p>
                    <p className="text-[15px] font-semibold text-aion-ink mt-1 leading-snug">{exc.titulo}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <CategoriaBadge categoria={exc.categoria} />
                      <span className="badge-compact bg-slate-100 text-aion-muted">{EXCEPCION_LABEL[exc.tipo]}</span>
                      <span className="badge-compact bg-slate-100 text-aion-muted">
                        {actual.nodoOrigen.ciudad} → {actual.nodoDestino.ciudad}
                      </span>
                      <span className="badge-compact bg-slate-100 text-aion-muted">{actual.mercancia.descripcion}</span>
                    </div>
                  </div>
                  <button onClick={() => navigate(`/operacion/${actual.id}`)} className="flex items-center gap-1 text-[11px] text-captura hover:text-captura-dark shrink-0">
                    Ver operación completa <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2 text-[11px]">
                  <div className="rounded-lg bg-white border border-aion-line px-3 py-2">
                    <p className="text-[9.5px] uppercase tracking-wide text-aion-muted">Levantada por</p>
                    <p className="font-medium text-aion-ink flex items-center gap-1">
                      <Bot className="w-3.5 h-3.5 text-catB" />
                      {plantilla.agente}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white border border-aion-line px-3 py-2">
                    <p className="text-[9.5px] uppercase tracking-wide text-aion-muted">Etapa de origen</p>
                    <p className="font-medium text-aion-ink">
                      <EtapaBadge etapa={exc.etapaOrigen} /> <span className="text-aion-muted">{ETAPA_LABEL[exc.etapaOrigen]}</span>
                    </p>
                  </div>
                  <div className="rounded-lg bg-white border border-aion-line px-3 py-2">
                    <p className="text-[9.5px] uppercase tracking-wide text-aion-muted">Regla aplicada</p>
                    <p className="font-medium text-aion-ink flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-catC-dark shrink-0" />
                      <span className="font-mono">{plantilla.regla}</span>
                      {regla && <span className="text-aion-muted truncate">· {regla.tema}</span>}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white border border-aion-line px-3 py-2">
                    <p className="text-[9.5px] uppercase tracking-wide text-aion-muted">Política</p>
                    <p className="font-medium text-aion-ink font-mono">{exc.politica}</p>
                  </div>
                </div>
                {regla && <p className="text-[11.5px] text-aion-muted mt-2 leading-snug">{regla.texto}</p>}
              </Seccion>

              <Seccion titulo="Causa">
                <p className="text-[13.5px] text-aion-ink leading-relaxed">{exc.causa}</p>
              </Seccion>

              <Seccion titulo="Impacto">
                <p className="text-[13.5px] text-aion-ink leading-relaxed">{exc.impacto}</p>
              </Seccion>

              <Seccion titulo="Evidencia">
                <ul className="space-y-1">
                  {exc.evidencia.map((ev, i) => (
                    <li key={i} className="flex items-start gap-2 text-[12px] font-mono text-slate-700">
                      <Database className="w-3.5 h-3.5 text-aion-muted shrink-0 mt-0.5" />
                      {ev}
                    </li>
                  ))}
                </ul>
              </Seccion>

              <Seccion titulo="Recomendación del agente">
                {recomendada ? (
                  <div className="flex items-start gap-3 rounded-xl bg-catB-light/50 border border-catB/25 p-3.5">
                    <div className="w-9 h-9 rounded-lg bg-catB flex items-center justify-center shrink-0">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[14px] font-bold text-aion-ink">
                        Alternativa {recomendada.id} · {recomendada.titulo}
                      </p>
                      <p className="text-[12.5px] text-aion-ink leading-relaxed mt-0.5">{recomendada.descripcion}</p>
                      <p className="text-[11px] text-aion-muted mt-1">
                        {costoTexto(recomendada.impactoCosto)} · {horasTexto(recomendada.impactoHoras)} · {SLA_LABEL[recomendada.impactoSLA]}. Clase de decisión:{' '}
                        <b className="text-aion-ink">{CATEGORIA_DEF[exc.categoria].nombre}</b>
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-[12.5px] text-aion-muted">El agente no emitió recomendación.</p>
                )}
              </Seccion>

              <Seccion titulo="Alternativas">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {exc.alternativas.map((a) => {
                    const esRec = a.id === exc.recomendada
                    const cancela = a.efecto.tipo === 'cancelar'
                    return (
                      <div
                        key={a.id}
                        className={cn('rounded-xl border p-3.5 flex flex-col', esRec ? 'border-catB/50 bg-catB-light/30' : 'border-aion-line bg-white')}
                      >
                        <div className="flex items-start gap-2.5">
                          <span className={cn('w-7 h-7 rounded-lg font-extrabold text-[13px] flex items-center justify-center shrink-0', esRec ? 'bg-catB text-white' : 'bg-slate-100 text-aion-ink')}>
                            {a.id}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-semibold text-aion-ink leading-snug">{a.titulo}</p>
                            <p className="text-[11.5px] text-aion-muted mt-0.5 leading-snug">{a.descripcion}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5 mt-2.5 text-[10.5px]">
                          <div className="rounded-md bg-slate-50 px-2 py-1">
                            <p className="text-aion-muted uppercase tracking-wide text-[9px]">Costo</p>
                            <p className="text-aion-ink font-medium leading-tight">{costoTexto(a.impactoCosto)}</p>
                          </div>
                          <div className="rounded-md bg-slate-50 px-2 py-1">
                            <p className="text-aion-muted uppercase tracking-wide text-[9px]">Horas</p>
                            <p className="text-aion-ink font-medium leading-tight">{horasTexto(a.impactoHoras)}</p>
                          </div>
                          <div className="rounded-md bg-slate-50 px-2 py-1">
                            <p className="text-aion-muted uppercase tracking-wide text-[9px]">SLA</p>
                            <span className={cn('badge-compact', SLA_CLASE[a.impactoSLA])}>{SLA_LABEL[a.impactoSLA]}</span>
                          </div>
                        </div>
                        {a.reglas.length > 0 && <p className="text-[10px] text-aion-muted mt-2 font-mono truncate">Reglas: {a.reglas.join(' · ')}</p>}
                        <div className="flex items-center gap-2 mt-auto pt-2.5 flex-wrap">
                          {esRec && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-catB uppercase tracking-wide">
                              <Lightbulb className="w-3 h-3" /> recomendada por el agente
                            </span>
                          )}
                          <button
                            onClick={() => decidirOperacion(actual.id, 'ALTERNATIVA', a.id)}
                            disabled={delAgente}
                            className={cn(
                              'ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
                              cancela ? 'bg-catD text-white hover:bg-catD-dark' : 'bg-catC text-white hover:bg-catC-dark',
                            )}
                          >
                            {cancela ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                            {textoAlternativa(a)}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Seccion>

              <Seccion titulo="Decisión" className="bg-slate-50/70">
                {delAgente && (
                  <p className="mb-2.5 text-[11.5px] text-catC-dark bg-catC-light border border-catC/30 rounded-lg px-3 py-2">
                    Esta operación la atiende el equipo de agentes: la decisión se toma en la pestaña <b>Agentes</b> y llega aquí como evento estructurado.
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => decidirOperacion(actual.id, 'AUTORIZAR')}
                    disabled={delAgente}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-success text-white hover:bg-emerald-700 transition-colors text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Autorizar propuesta del agente
                  </button>
                  <button
                    onClick={() => decidirOperacion(actual.id, 'RECHAZAR')}
                    disabled={delAgente}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-aion-line text-aion-ink hover:bg-slate-100 transition-colors text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <XCircle className="w-4 h-4" />
                    Rechazar propuesta
                  </button>
                  <button
                    onClick={() => setCancelando(confirmando ? null : actual.id)}
                    disabled={delAgente}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-catD/40 text-catD-dark hover:bg-catD-light transition-colors text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed ml-auto"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Cancelar servicio
                  </button>
                </div>
                {confirmando && (
                  <div className="mt-3 rounded-xl border border-catD/40 bg-catD-light/50 p-3.5">
                    <p className="text-[12.5px] text-aion-ink leading-relaxed">
                      <b>Cancelar un servicio requiere al responsable de autorización</b> <span className="font-mono text-[11px] text-aion-muted">(R28 · POL-AUT-01)</span>. Quedará registrada la causa y la operación pasará a «Cancelada».
                    </p>
                    <div className="flex items-center gap-2 mt-2.5">
                      <button
                        onClick={() => {
                          cancelarOperacion(actual.id)
                          setCancelando(null)
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-catD text-white hover:bg-catD-dark text-[12px] font-bold"
                      >
                        Confirmar cancelación (responsable)
                      </button>
                      <button onClick={() => setCancelando(null)} className="px-3.5 py-1.5 rounded-lg bg-white border border-aion-line text-[12px] font-medium text-aion-ink hover:bg-slate-100">
                        Volver
                      </button>
                    </div>
                  </div>
                )}
              </Seccion>
            </motion.div>
          ) : (
            <div className="glass-panel rounded-xl p-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-success-light flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-7 h-7 text-success" />
              </div>
              <p className="text-base font-semibold text-aion-ink">La Mesa está al día</p>
              <p className="text-sm text-aion-muted mt-1">No hay gestiones esperando una decisión.</p>
              <p className="text-xs text-aion-muted mt-2 max-w-md mx-auto">
                Inicia la simulación o provoca una novedad de demostración: las que requieren juicio o autorización llegarán aquí con su paquete de decisión.
              </p>
            </div>
          )}

          {/* Provocar una novedad */}
          <div className="glass-panel rounded-xl overflow-hidden">
            <button onClick={() => setDemoAbierta(!demoAbierta)} className="w-full px-4 py-3 flex items-center justify-between gap-2 hover:bg-slate-50 transition-colors">
              <h3 className="section-title">
                <Zap className="w-4 h-4 text-excepcion" />
                Provocar una novedad (demo)
              </h3>
              <ChevronDown className={cn('w-4 h-4 text-aion-muted transition-transform', demoAbierta && 'rotate-180')} />
            </button>
            {demoAbierta && (
              <div className="px-4 pb-4 border-t border-aion-line pt-3">
                <p className="text-[11.5px] text-aion-muted mb-3">
                  Fuerza una novedad sobre una operación activa para ver cómo se clasifica y, si corresponde, cómo llega a esta Mesa. Es una ayuda de la demostración, no parte del proceso.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 items-end">
                  <label className="block">
                    <span className="text-[10.5px] font-medium uppercase tracking-wide text-aion-muted">Operación activa</span>
                    <select
                      value={demoOpValida}
                      onChange={(e) => setDemoOp(e.target.value)}
                      className="mt-1 w-full text-xs rounded-lg border border-aion-line bg-white px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-captura/30"
                    >
                      {operacionesActivas.length === 0 && <option value="">Sin operaciones activas</option>}
                      {operacionesActivas.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.id} · {o.cliente.nombre} · {ETAPA_LABEL[o.etapa]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-[10.5px] font-medium uppercase tracking-wide text-aion-muted">Tipo de novedad</span>
                    <select
                      value={demoTipo}
                      onChange={(e) => setDemoTipo(e.target.value as TipoExcepcion)}
                      className="mt-1 w-full text-xs rounded-lg border border-aion-line bg-white px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-captura/30"
                    >
                      {CATEGORIAS.map((c) => (
                        <optgroup key={c} label={CATEGORIA_LABEL[c]}>
                          {TIPOS_EXCEPCION.filter((t) => PLANTILLA_EXCEPCION[t].categoriaBase === c).map((t) => (
                            <option key={t} value={t}>
                              {EXCEPCION_LABEL[t]}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </label>
                  <button
                    onClick={() => demoOpValida && forzarExcepcion(demoOpValida, demoTipo)}
                    disabled={!demoOpValida}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-excepcion text-white hover:opacity-90 transition-opacity text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Provocar novedad
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Historial */}
          <div className="glass-panel rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-aion-line">
              <h3 className="section-title">
                <Clock className="w-4 h-4 text-aion-muted" />
                Decisiones recientes del coordinador
              </h3>
            </div>
            {historial.length === 0 ? (
              <p className="text-xs text-aion-muted text-center py-6">Aún no hay decisiones registradas.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] uppercase tracking-wider text-aion-muted">
                      <th className="text-left px-4 py-2 font-semibold">Operación</th>
                      <th className="text-left px-4 py-2 font-semibold">Novedad</th>
                      <th className="text-center px-4 py-2 font-semibold">Categoría</th>
                      <th className="text-left px-4 py-2 font-semibold">Decisión</th>
                      <th className="text-left px-4 py-2 font-semibold">Por</th>
                      <th className="text-right px-4 py-2 font-semibold">Hora</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historial.map(({ op, exc: e }) => (
                      <tr key={`${op.id}-${e.id}`} className="border-t border-aion-line hover:bg-slate-50/60 cursor-pointer" onClick={() => navigate(`/operacion/${op.id}`)}>
                        <td className="px-4 py-2 font-mono text-captura">{op.id}</td>
                        <td className="px-4 py-2 text-aion-muted max-w-[260px] truncate">{EXCEPCION_LABEL[e.tipo]}</td>
                        <td className="px-4 py-2 text-center">
                          <CategoriaBadge categoria={e.categoria} />
                        </td>
                        <td className="px-4 py-2">
                          {e.decisionHumana ? (
                            <span className={cn('badge-compact font-bold', DECISION_CLASE[e.decisionHumana])}>
                              {DECISION_LABEL[e.decisionHumana]}
                              {e.alternativaElegida ? ` ${e.alternativaElegida}` : ''}
                            </span>
                          ) : (
                            <span className="text-aion-muted">—</span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-aion-muted truncate max-w-[200px]">{e.decididoPor ?? '—'}</td>
                        <td className="px-4 py-2 text-right font-mono text-aion-muted">{e.resueltaEn ? formatHora(e.resueltaEn) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
