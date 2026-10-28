import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bot,
  CalendarClock,
  Eye,
  FileText,
  Flag,
  GitBranch,
  Inbox,
  Info,
  ListChecks,
  Network,
  PhoneIncoming,
  Quote,
  Radar,
  Route,
  Scale,
  Sparkles,
  Target,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CategoriaBadge, SupuestoTag, TextoInline, TituloSeccion } from '@/components/shared'
import RutaImplementacion from '@/components/RutaImplementacion'
import { IMPLEMENTACION_HACEB } from '@/data/implementacionData'
import {
  ALCANCE_FIN,
  ALCANCE_FIN_P,
  ALCANCE_INICIO,
  ALCANCE_INICIO_P,
  BLOQUES,
  CANALES_DEF,
  CATEGORIA_DEF,
  CONTACTOS_ENTRANTES,
  DATOS_MINIMOS,
  DATOS_MINIMOS_P,
  DOC_FRAMEWORK,
  DOC_KICKER,
  DOC_PIE,
  DOC_TITULO,
  DOC_VERSION,
  ESTADOS_FIN,
  EXCEPCIONES_LISTA,
  EXPEDIENTE_CONTENIDO,
  EXPEDIENTE_P,
  FLUJO_ASCII,
  FLUJO_ETAPAS,
  FUERA_DE_ALCANCE,
  GUARDRAILS,
  HISTORIAL_PREGUNTAS,
  KPIS_INSUMO,
  KPIS_P,
  OBJETIVO_TEXTO,
  P,
  PREGUNTAS_NEGOCIO,
  PROPOSITO_TEXTO,
  REGLAS,
  ROLES,
  SECCIONES_DOC,
  SISTEMAS,
  SUPUESTOS_DE_DISENO,
  TRANSVERSALES,
} from '@/data/procesoData'
import { ETAPA_LABEL, ETAPA_LABEL_CORTO, PLANTILLA_EXCEPCION } from '@/data/mockData'
import type { BloqueFlujo, CategoriaDecision } from '@/types'

// ---------------------------------------------------------------------------
// Presentación (el texto proviene del insumo: procesoData.ts / procesoTexto.ts)
// ---------------------------------------------------------------------------

const SUPUESTOS_ID = 'supuestos'

const SECCION_ICONO: Record<string, LucideIcon> = {
  objetivo: Target,
  canales: Inbox,
  flujo: GitBranch,
  entrantes: PhoneIncoming,
  roles: Users,
  transversal: CalendarClock,
  decision: Scale,
  reglas: ListChecks,
  excepciones: AlertTriangle,
  sistemas: Network,
  vision: Eye,
  kpis: BarChart3,
  proposito: Sparkles,
  [SUPUESTOS_ID]: Info,
}

const BLOQUE_POR_ID = Object.fromEntries(BLOQUES.map((b) => [b.id, b])) as Record<BloqueFlujo, (typeof BLOQUES)[number]>

const CATEGORIA_COLOR: Record<CategoriaDecision, string> = {
  automatico: '#64748b',
  asistido: '#d97706',
  humano: '#dc2626',
}

const AGENTES = ['Agente de cliente', 'Agente de negociación', 'Agente de seguimiento'] as const

const TIPO_ROL_LABEL: Record<'externo' | 'interno' | 'agente', string> = {
  externo: 'Participante externo',
  interno: 'Equipo interno',
  agente: 'Inteligencia artificial',
}

const TIPO_ROL_COLOR: Record<'externo' | 'interno' | 'agente', string> = {
  externo: '#2563eb',
  interno: '#d97706',
  agente: '#7c3aed',
}

const TIPO_SISTEMA_LABEL: Record<'plataforma' | 'agente' | 'datos' | 'integracion', string> = {
  plataforma: 'Plataforma',
  agente: 'Agente de IA',
  datos: 'Datos',
  integracion: 'Integración',
}

const TIPO_SISTEMA_COLOR: Record<'plataforma' | 'agente' | 'datos' | 'integracion', string> = {
  plataforma: '#141b2d',
  agente: '#7c3aed',
  datos: '#0d9488',
  integracion: '#2563eb',
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.03 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
}

function Tarjeta({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('bg-white border border-aion-line rounded-xl shadow-card', className)}>{children}</div>
}

/** Cita discreta del párrafo del insumo (P12, P3–P5…). */
function ChipP({ p, className }: { p: number | number[]; className?: string }) {
  const ps = Array.isArray(p) ? p : [p]
  const txt = ps.length === 2 && ps[1] - ps[0] > 1 ? `P${ps[0]}–P${ps[1]}` : ps.map((n) => `P${n}`).join(' · ')
  return (
    <span
      className={cn('inline-block font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 shrink-0', className)}
      title="Párrafo del insumo (docs/proceso.txt)"
    >
      {txt}
    </span>
  )
}

/** Texto original del insumo, tal cual. */
function CitaInsumo({ p, children }: { p: number | number[]; children: React.ReactNode }) {
  return (
    <blockquote className="border-l-4 border-slate-300 pl-4 py-0.5">
      <p className="text-[13.5px] text-aion-ink leading-relaxed">{children}</p>
      <div className="mt-1.5 flex items-center gap-1.5 text-[10.5px] text-aion-muted">
        <Quote className="w-3 h-3" /> Texto original del insumo <ChipP p={p} />
      </div>
    </blockquote>
  )
}

function Subtitulo({ children, extra }: { children: React.ReactNode; extra?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <h3 className="text-[12px] font-bold uppercase tracking-wider text-aion-muted">{children}</h3>
      {extra}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Blueprint
// ---------------------------------------------------------------------------

function BlueprintProceso() {
  const [activa, setActiva] = useState<string>('objetivo')
  const [temaRegla, setTemaRegla] = useState<string>('Todas')

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visibles = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visibles.length > 0) setActiva((visibles[0].target as HTMLElement).dataset.seccion ?? 'objetivo')
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 },
    )
    document.querySelectorAll<HTMLElement>('section[data-seccion]').forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  const irA = (id: string) => {
    document.getElementById(`sec-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const indice = useMemo(
    () => [...SECCIONES_DOC, { id: SUPUESTOS_ID, numero: SECCIONES_DOC.length + 1, titulo: 'Supuestos de diseño' }],
    [],
  )

  const bloquesFlujo = useMemo(
    () =>
      (['Solicitud', 'Consecucion', 'Cargue', 'Transito', 'Cierre'] as BloqueFlujo[]).map((b) => ({
        bloque: BLOQUE_POR_ID[b],
        etapas: FLUJO_ETAPAS.filter((e) => e.bloque === b),
      })),
    [],
  )

  const temas = useMemo(() => ['Todas', ...Array.from(new Set(REGLAS.map((r) => r.tema)))], [])
  const reglasVisibles = useMemo(
    () => (temaRegla === 'Todas' ? REGLAS : REGLAS.filter((r) => r.tema === temaRegla)),
    [temaRegla],
  )

  const porCategoria = useMemo(
    () =>
      (['automatico', 'asistido', 'humano'] as CategoriaDecision[]).map((c) => ({
        categoria: c,
        items: EXCEPCIONES_LISTA.filter((e) => e.categoria === c),
      })),
    [],
  )

  const transversales = TRANSVERSALES.filter((t) => ['agenda', 'coordinacion', 'expediente', 'historial'].includes(t.id))

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="grid grid-cols-1 lg:grid-cols-[236px_1fr] gap-8">
        {/* ---------------------------------------------------------------- */}
        {/* Índice lateral                                                    */}
        {/* ---------------------------------------------------------------- */}
        <aside className="hidden lg:block">
          <div className="sticky top-[76px] max-h-[calc(100vh-96px)] overflow-y-auto pr-1">
            <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-aion-muted mb-2 px-2">{DOC_FRAMEWORK}</p>
            <nav className="space-y-0.5">
              {indice.map((s) => {
                const Icono = SECCION_ICONO[s.id] ?? FileText
                const sel = activa === s.id
                return (
                  <button
                    key={s.id}
                    onClick={() => irA(s.id)}
                    className={cn(
                      'w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg text-[12px] transition-colors',
                      sel ? 'bg-aion-ink text-white' : 'text-aion-muted hover:bg-white hover:text-aion-ink',
                    )}
                  >
                    <span className={cn('font-mono text-[10px] w-5 shrink-0', sel ? 'text-aion-accent' : 'text-slate-400')}>
                      {String(s.numero).padStart(2, '0')}
                    </span>
                    <Icono className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{s.titulo}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </aside>

        {/* ---------------------------------------------------------------- */}
        {/* Documento                                                         */}
        {/* ---------------------------------------------------------------- */}
        <article className="space-y-12 min-w-0">
          <header className="pt-2">
            <div className="text-[12px] font-bold tracking-[0.14em] uppercase text-aion-muted">{DOC_FRAMEWORK}</div>
            <h1 className="text-[30px] leading-[1.15] font-bold text-aion-ink mt-1.5">{DOC_KICKER}</h1>
            <p className="text-[17px] text-aion-muted mt-1 max-w-[860px]">{DOC_TITULO}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="badge-compact bg-slate-100 text-aion-ink font-mono">{DOC_VERSION}</span>
              <span className="badge-compact bg-captura-light text-captura font-mono">Texto del insumo con cita P(n)</span>
              <SupuestoTag />
              <span className="text-[11.5px] text-aion-muted self-center">= lo que no sale del insumo</span>
            </div>
          </header>

          {/* 1 · Objetivo y alcance */}
          <section id="sec-objetivo" data-seccion="objetivo" className="space-y-4 scroll-mt-24">
            <TituloSeccion>1. Objetivo y alcance</TituloSeccion>
            <Tarjeta className="p-5 space-y-3">
              <CitaInsumo p={1}>{OBJETIVO_TEXTO}</CitaInsumo>
            </Tarjeta>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Tarjeta className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Flag className="w-4 h-4 text-captura" />
                  <h3 className="text-[13px] font-bold text-captura uppercase tracking-wide">Inicio</h3>
                  <ChipP p={ALCANCE_INICIO_P} className="ml-auto" />
                </div>
                <p className="text-[13.5px] text-aion-ink leading-relaxed">{ALCANCE_INICIO}</p>
              </Tarjeta>
              <Tarjeta className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Flag className="w-4 h-4 text-liberacion" />
                  <h3 className="text-[13px] font-bold text-liberacion uppercase tracking-wide">Fin</h3>
                  <ChipP p={ALCANCE_FIN_P} className="ml-auto" />
                </div>
                <p className="text-[13.5px] text-aion-ink leading-relaxed">{ALCANCE_FIN}</p>
              </Tarjeta>
              <Tarjeta className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Flag className="w-4 h-4 text-aion-muted" />
                  <h3 className="text-[13px] font-bold text-aion-muted uppercase tracking-wide">Fuera de alcance</h3>
                  <SupuestoTag className="ml-auto" />
                </div>
                <p className="text-[13px] text-aion-muted leading-relaxed">{FUERA_DE_ALCANCE}</p>
              </Tarjeta>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ESTADOS_FIN.map((e) => {
                const color = e.id === 'Cerrada' ? BLOQUE_POR_ID.Cierre.color : BLOQUE_POR_ID.Novedad.color
                return (
                  <div
                    key={e.id}
                    className="bg-white border border-aion-line rounded-xl px-4 py-3"
                    style={{ borderLeftWidth: 4, borderLeftColor: color }}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-[13px] font-bold text-aion-ink">{e.nombre}</h3>
                      {e.supuesto && <SupuestoTag />}
                      <ChipP p={e.p} className="ml-auto" />
                    </div>
                    <p className="text-[12.5px] text-aion-muted mt-1 leading-relaxed">{e.descripcion}</p>
                  </div>
                )
              })}
            </div>
          </section>

          {/* 2 · Canales y datos mínimos */}
          <section id="sec-canales" data-seccion="canales" className="space-y-4 scroll-mt-24">
            <TituloSeccion>2. Canales de entrada y datos mínimos</TituloSeccion>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {CANALES_DEF.map((c) => (
                <Tarjeta key={c.id} className="p-4" >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                    <span className="badge-compact font-mono font-bold" style={{ backgroundColor: `${c.color}14`, color: c.color }}>
                      {c.corto}
                    </span>
                    <ChipP p={c.p} className="ml-auto" />
                  </div>
                  <h3 className="text-[13.5px] font-bold text-aion-ink leading-tight">{c.nombre}</h3>
                  <p className="text-[12.5px] text-aion-muted mt-1.5 leading-relaxed">{c.descripcion}</p>
                </Tarjeta>
              ))}
            </div>
            <Tarjeta className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-[13px] font-bold text-aion-ink uppercase tracking-wide">Datos mínimos de la solicitud</h3>
                <ChipP p={DATOS_MINIMOS_P} />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {DATOS_MINIMOS.map((d, i) => (
                  <span
                    key={d}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-captura-light text-captura text-[12.5px] font-medium border border-captura/15"
                  >
                    <span className="font-mono text-[10px] opacity-70">{i + 1}</span>
                    {d}
                  </span>
                ))}
              </div>
              <p className="text-[12.5px] text-aion-muted mt-3 leading-relaxed">
                Si el cliente no dispone de toda la información, el agente registra lo confirmado y programa una gestión posterior (regla R02).
              </p>
            </Tarjeta>
          </section>

          {/* 3 · Flujo end-to-end */}
          <section id="sec-flujo" data-seccion="flujo" className="space-y-4 scroll-mt-24">
            <TituloSeccion>3. Flujo end-to-end</TituloSeccion>

            <div className="flex flex-wrap items-center gap-2">
              {BLOQUES.map((b) => (
                <span
                  key={b.id}
                  className="inline-flex items-center gap-[7px] text-[12px] font-semibold px-3 py-[5px] rounded-full border bg-white border-aion-line text-aion-ink"
                >
                  <span className="w-[9px] h-[9px] rounded-full" style={{ backgroundColor: b.color }} />
                  {b.nombre}
                </span>
              ))}
              <span className="inline-flex items-center gap-1.5 text-[11.5px] text-aion-muted">
                Agrupación en bloques de color: <SupuestoTag />
              </span>
            </div>

            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-5">
              {bloquesFlujo.map(({ bloque, etapas }) => (
                <div key={bloque.id}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: bloque.color }} />
                    <h3 className="text-[13px] font-bold uppercase tracking-wide" style={{ color: bloque.color }}>
                      {bloque.nombre}
                    </h3>
                    <span className="text-[12px] text-aion-muted">· {bloque.descripcion}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {etapas.map((e) => (
                      <motion.div
                        key={e.id}
                        variants={itemVariants}
                        className="bg-white border border-aion-line rounded-xl shadow-card px-4 py-3"
                        style={{ borderLeftWidth: 4, borderLeftColor: bloque.color }}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-7 h-7 rounded-full flex items-center justify-center font-extrabold text-[12px] text-white shrink-0"
                            style={{ backgroundColor: bloque.color }}
                          >
                            {e.numero}
                          </span>
                          <h4 className="text-[13px] font-semibold text-aion-ink leading-tight">{e.nombre}</h4>
                          <ChipP p={e.p} className="ml-auto" />
                        </div>
                        <p className="text-[12.5px] text-aion-muted mt-2 leading-relaxed">{e.resumen}</p>
                        <div className="mt-2.5 flex items-center gap-1.5 text-[11px]" style={{ color: bloque.color }}>
                          <Bot className="w-3.5 h-3.5" />
                          <span className="font-semibold">{e.agente}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Bloque de esperas y salidas */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: BLOQUE_POR_ID.Novedad.color }} />
                  <h3 className="text-[13px] font-bold uppercase tracking-wide" style={{ color: BLOQUE_POR_ID.Novedad.color }}>
                    {BLOQUE_POR_ID.Novedad.nombre}
                  </h3>
                  <span className="text-[12px] text-aion-muted">· {BLOQUE_POR_ID.Novedad.descripcion}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { id: 'EsperaDatos' as const, texto: 'La operación queda esperando datos del cliente; el agente programa una gestión posterior.', p: 3, supuesto: false },
                    { id: 'Escalada' as const, texto: 'La operación queda en manos del coordinador logístico, que decide o aprueba.', p: 8, supuesto: false },
                    { id: 'Cancelada' as const, texto: 'Salida por cancelación del servicio, que requiere al responsable correspondiente.', p: 43, supuesto: true },
                  ].map((s) => (
                    <motion.div
                      key={s.id}
                      variants={itemVariants}
                      className="bg-white border rounded-xl px-4 py-3"
                      style={{ borderColor: `${BLOQUE_POR_ID.Novedad.color}55`, backgroundColor: BLOQUE_POR_ID.Novedad.colorBg }}
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-[13px] font-semibold text-aion-ink">{ETAPA_LABEL[s.id]}</h4>
                        {s.supuesto && <SupuestoTag />}
                        <ChipP p={s.p} className="ml-auto" />
                      </div>
                      <p className="text-[12.5px] text-aion-muted mt-1.5 leading-relaxed">{s.texto}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            <div className="space-y-2">
              <Subtitulo extra={<span className="text-[11.5px] text-aion-muted">Diagrama del flujo completo</span>}>
                Vista de texto
              </Subtitulo>
              <pre className="doc-block text-[11px]">{FLUJO_ASCII}</pre>
            </div>
          </section>

          {/* 4 · Contactos entrantes */}
          <section id="sec-entrantes" data-seccion="entrantes" className="space-y-4 scroll-mt-24">
            <TituloSeccion>4. Contactos entrantes</TituloSeccion>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {CONTACTOS_ENTRANTES.map((c) => (
                <Tarjeta key={c.id} className="p-5 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <PhoneIncoming className="w-4 h-4 text-liberacion" />
                    <h3 className="text-[13.5px] font-bold text-aion-ink leading-tight">{c.nombre}</h3>
                  </div>
                  <p className="text-[13px] text-aion-ink leading-relaxed flex-1">{c.texto}</p>
                  <div className="mt-3">
                    <ChipP p={c.p} />
                  </div>
                </Tarjeta>
              ))}
            </div>
          </section>

          {/* 5 · Roles y agentes */}
          <section id="sec-roles" data-seccion="roles" className="space-y-4 scroll-mt-24">
            <TituloSeccion>5. Roles y agentes</TituloSeccion>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {ROLES.map((r) => {
                const color = TIPO_ROL_COLOR[r.tipo]
                return (
                  <Tarjeta key={r.id} className="p-4" >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className="badge-compact font-semibold"
                        style={{ backgroundColor: `${color}14`, color }}
                      >
                        {TIPO_ROL_LABEL[r.tipo]}
                      </span>
                      <ChipP p={r.p.filter((n) => n <= 49)} className="ml-auto" />
                    </div>
                    <h3 className="text-[14px] font-bold text-aion-ink">{r.nombre}</h3>
                    <p className="text-[12.5px] text-aion-muted mt-1 leading-relaxed">{r.descripcion}</p>
                  </Tarjeta>
                )
              })}
            </div>

            <Tarjeta className="p-5">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <h3 className="text-[13px] font-bold text-aion-ink uppercase tracking-wide">Los tres agentes y las etapas que conducen</h3>
                <ChipP p={42} />
                <SupuestoTag />
                <span className="text-[11.5px] text-aion-muted">el reparto por etapa es del simulador</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {AGENTES.map((a) => (
                  <div key={a} className="rounded-xl border border-aion-line bg-slate-50 p-3.5">
                    <div className="flex items-center gap-2 mb-2">
                      <Bot className="w-4 h-4 text-liberacion" />
                      <h4 className="text-[13px] font-bold text-aion-ink">{a}</h4>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {FLUJO_ETAPAS.filter((e) => e.agente === a).map((e) => (
                        <span
                          key={e.id}
                          className="text-[10.5px] font-mono px-1.5 py-0.5 rounded text-white"
                          style={{ backgroundColor: BLOQUE_POR_ID[e.bloque].color }}
                        >
                          {e.numero} · {e.corto}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Tarjeta>
          </section>

          {/* 6 · Agenda, coordinación, expediente */}
          <section id="sec-transversal" data-seccion="transversal" className="space-y-4 scroll-mt-24">
            <TituloSeccion>6. Agenda, coordinación y expediente</TituloSeccion>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {transversales.map((t) => (
                <Tarjeta key={t.id} className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-[13.5px] font-bold text-aion-ink leading-tight">{t.nombre}</h3>
                    <ChipP p={t.p} className="ml-auto" />
                  </div>
                  <p className="text-[13px] text-aion-ink leading-relaxed">{t.texto}</p>
                  {t.id === 'expediente' && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {EXPEDIENTE_CONTENIDO.map((c) => (
                        <span key={c} className="text-[11.5px] px-2.5 py-1 rounded-lg bg-validacion-light text-validacion border border-validacion/20">
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                  {t.id === 'historial' && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {HISTORIAL_PREGUNTAS.map((h) => (
                        <span key={h} className="text-[11.5px] px-2.5 py-1 rounded-lg bg-slate-100 text-aion-ink border border-aion-line">
                          {h}
                        </span>
                      ))}
                    </div>
                  )}
                </Tarjeta>
              ))}
            </div>
            <p className="text-[12px] text-aion-muted">
              Contenido del expediente: <ChipP p={EXPEDIENTE_P} /> · el simulador lo muestra en el detalle de cada operación.
            </p>
          </section>

          {/* 7 · Informar vs. decidir */}
          <section id="sec-decision" data-seccion="decision" className="space-y-4 scroll-mt-24">
            <TituloSeccion>7. Informar vs. decidir</TituloSeccion>
            <Tarjeta className="p-5">
              <CitaInsumo p={43}>{P(43)}</CitaInsumo>
            </Tarjeta>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {porCategoria.map(({ categoria, items }) => {
                const def = CATEGORIA_DEF[categoria]
                const color = CATEGORIA_COLOR[categoria]
                return (
                  <Tarjeta key={categoria} className="p-5 flex flex-col">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <CategoriaBadge categoria={categoria} />
                      {def.supuesto && <SupuestoTag />}
                      <ChipP p={def.p} className="ml-auto" />
                    </div>
                    <h3 className="text-[14px] font-bold leading-tight" style={{ color }}>
                      {def.nombre}
                    </h3>
                    <p className="text-[13px] text-aion-ink leading-relaxed mt-1.5">{def.descripcion}</p>
                    <p className="text-[12px] text-aion-muted mt-1.5">
                      <b className="text-aion-ink">Ejemplos:</b> {def.ejemplos}
                    </p>
                    <div className="mt-3 pt-3 border-t border-aion-line">
                      <p className="text-[10.5px] uppercase tracking-wider font-bold text-aion-muted mb-1.5">
                        Casos del catálogo en esta categoría
                      </p>
                      <ul className="space-y-1">
                        {items.map((e) => (
                          <li key={e.tipo} className="flex items-start gap-2 text-[12px] text-aion-ink">
                            <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ backgroundColor: color }} />
                            {e.nombre}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Tarjeta>
                )
              })}
            </div>
            <CitaInsumo p={44}>{P(44)}</CitaInsumo>
          </section>

          {/* 8 · Reglas de negocio */}
          <section id="sec-reglas" data-seccion="reglas" className="space-y-4 scroll-mt-24">
            <TituloSeccion>8. Reglas de negocio</TituloSeccion>
            <div className="flex items-start gap-2.5 text-[12.5px] text-aion-muted">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                El texto de cada regla es del insumo; el código de la política (POL-XX-nn) es propio del simulador <SupuestoTag />.
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {temas.map((t) => (
                <button
                  key={t}
                  onClick={() => setTemaRegla(t)}
                  className={cn(
                    'px-2.5 py-1 rounded-full text-[11.5px] font-medium border transition-colors',
                    temaRegla === t ? 'bg-aion-ink text-white border-aion-ink' : 'bg-white text-aion-muted border-aion-line hover:text-aion-ink',
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            <Tarjeta className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-aion-line text-[10.5px] uppercase tracking-wider text-aion-muted">
                      <th className="text-left px-4 py-2.5 font-semibold w-[56px]">Id</th>
                      <th className="text-left px-4 py-2.5 font-semibold w-[104px]">Política</th>
                      <th className="text-left px-4 py-2.5 font-semibold">Regla</th>
                      <th className="text-left px-4 py-2.5 font-semibold w-[190px]">Etapas</th>
                      <th className="text-left px-4 py-2.5 font-semibold w-[52px]">Fuente</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reglasVisibles.map((r, i) => (
                      <tr key={r.id} className={cn(i > 0 && 'border-t border-aion-line', 'hover:bg-slate-50/60 align-top')}>
                        <td className="px-4 py-2.5 font-mono font-bold text-[12.5px] text-aion-ink">{r.id}</td>
                        <td className="px-4 py-2.5 font-mono text-[11px] text-aion-muted">{r.politica}</td>
                        <td className="px-4 py-2.5 text-[12.5px] text-aion-ink leading-relaxed">
                          <span className="text-[10.5px] uppercase tracking-wide font-bold text-aion-muted mr-1.5">{r.tema}</span>
                          {r.texto}
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex flex-wrap gap-1">
                            {r.etapas.length === 0 ? (
                              <span className="text-[10.5px] font-mono px-1.5 py-0.5 rounded bg-comunicacion-light text-comunicacion">transversal</span>
                            ) : (
                              r.etapas.map((e) => (
                                <span key={e} className="text-[10.5px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-aion-muted">
                                  {ETAPA_LABEL_CORTO[e]}
                                </span>
                              ))
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          <ChipP p={r.p} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Tarjeta>

            <div className="space-y-2 pt-2">
              <Subtitulo extra={<SupuestoTag />}>Parámetros de las políticas (guardrails)</Subtitulo>
              <p className="text-[12.5px] text-aion-muted">
                El insumo habla de «parámetros establecidos» sin cifras; los valores son de ejemplo para el simulador.
              </p>
              <Tarjeta className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-aion-line text-[10.5px] uppercase tracking-wider text-aion-muted">
                        <th className="text-left px-4 py-2.5 font-semibold">Parámetro</th>
                        <th className="text-left px-4 py-2.5 font-semibold w-[230px]">Valor de ejemplo</th>
                        <th className="text-left px-4 py-2.5 font-semibold w-[96px]">Regla</th>
                        <th className="text-left px-4 py-2.5 font-semibold w-[104px]">Política</th>
                      </tr>
                    </thead>
                    <tbody>
                      {GUARDRAILS.map((g, i) => (
                        <tr key={g.id} className={cn(i > 0 && 'border-t border-aion-line', 'align-top')}>
                          <td className="px-4 py-2.5">
                            <span className="block text-[13px] font-semibold text-aion-ink">{g.nombre}</span>
                            <span className="block text-[12px] text-aion-muted mt-0.5">{g.descripcion}</span>
                          </td>
                          <td className="px-4 py-2.5 text-[12.5px] text-aion-ink font-medium">{g.valor}</td>
                          <td className="px-4 py-2.5 font-mono text-[12px] font-bold text-aion-ink">{g.regla}</td>
                          <td className="px-4 py-2.5 font-mono text-[11px] text-aion-muted">{g.politica}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Tarjeta>
            </div>
          </section>

          {/* 9 · Excepciones y novedades */}
          <section id="sec-excepciones" data-seccion="excepciones" className="space-y-4 scroll-mt-24">
            <TituloSeccion>9. Excepciones y novedades</TituloSeccion>
            <div className="flex items-start gap-2.5 text-[12.5px] text-aion-muted">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Los casos y su texto son del insumo. La categoría «asistido» y la política asociada son del simulador <SupuestoTag />.
              </span>
            </div>
            <Tarjeta className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-aion-line text-[10.5px] uppercase tracking-wider text-aion-muted">
                      <th className="text-left px-4 py-2.5 font-semibold w-[36px]">#</th>
                      <th className="text-left px-4 py-2.5 font-semibold">Caso</th>
                      <th className="text-left px-4 py-2.5 font-semibold w-[130px]">Categoría</th>
                      <th className="text-left px-4 py-2.5 font-semibold w-[150px]">Regla · política</th>
                      <th className="text-left px-4 py-2.5 font-semibold w-[200px]">Etapas donde ocurre</th>
                      <th className="text-left px-4 py-2.5 font-semibold w-[52px]">Fuente</th>
                    </tr>
                  </thead>
                  <tbody>
                    {EXCEPCIONES_LISTA.map((e, i) => {
                      const t = PLANTILLA_EXCEPCION[e.tipo]
                      return (
                        <tr key={e.tipo} className={cn(i > 0 && 'border-t border-aion-line', 'hover:bg-slate-50/60 align-top')}>
                          <td className="px-4 py-2.5 font-mono text-[11px] text-slate-400">{String(i + 1).padStart(2, '0')}</td>
                          <td className="px-4 py-2.5">
                            <span className="block text-[13px] font-semibold text-aion-ink">{e.nombre}</span>
                            <details className="mt-1">
                              <summary className="text-[11.5px] text-captura cursor-pointer select-none">Texto del insumo</summary>
                              <p className="text-[12px] text-aion-muted leading-relaxed mt-1.5 max-w-[560px]">{e.texto}</p>
                            </details>
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex flex-col items-start gap-1">
                              <CategoriaBadge categoria={e.categoria} />
                              {e.categoria === 'asistido' && <SupuestoTag />}
                            </div>
                          </td>
                          <td className="px-4 py-2.5">
                            <span className="block font-mono text-[12px] font-bold text-aion-ink">{e.regla}</span>
                            <span className="block font-mono text-[10.5px] text-aion-muted">{t.politica}</span>
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex flex-wrap gap-1">
                              {t.etapas.map((et) => (
                                <span key={et} className="text-[10.5px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-aion-muted">
                                  {ETAPA_LABEL_CORTO[et]}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-2.5">
                            <ChipP p={e.p} />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Tarjeta>
          </section>

          {/* 10 · Sistemas */}
          <section id="sec-sistemas" data-seccion="sistemas" className="space-y-4 scroll-mt-24">
            <TituloSeccion>10. Sistemas</TituloSeccion>
            <div className="flex items-start gap-2.5 text-[12.5px] text-aion-muted">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>El insumo describe funciones, no productos: los nombres son funcionales y no designan una marca.</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {SISTEMAS.map((s) => {
                const color = TIPO_SISTEMA_COLOR[s.tipo]
                return (
                  <Tarjeta key={s.id} className="p-4" >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="badge-compact font-semibold" style={{ backgroundColor: `${color}14`, color }}>
                        {TIPO_SISTEMA_LABEL[s.tipo]}
                      </span>
                      <ChipP p={s.p} className="ml-auto" />
                    </div>
                    <h3 className="text-[13.5px] font-bold text-aion-ink leading-tight">{s.nombre}</h3>
                    <p className="text-[12.5px] text-aion-muted mt-1.5 leading-relaxed">{s.descripcion}</p>
                  </Tarjeta>
                )
              })}
            </div>
          </section>

          {/* 11 · Visión centralizada */}
          <section id="sec-vision" data-seccion="vision" className="space-y-4 scroll-mt-24">
            <TituloSeccion>11. Visión centralizada</TituloSeccion>
            <Tarjeta className="p-5 space-y-3">
              <CitaInsumo p={45}>{P(45)}</CitaInsumo>
              <CitaInsumo p={46}>{P(46)}</CitaInsumo>
            </Tarjeta>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
              {PREGUNTAS_NEGOCIO.map((q, i) => (
                <div key={q.id} className="flex items-center gap-2.5 rounded-lg border border-aion-line bg-white px-3 py-2 text-[12.5px] text-aion-ink">
                  <span className="w-5 h-5 rounded-full bg-aion-ink text-white text-[10.5px] font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <span className="flex-1">{q.texto}</span>
                  <ChipP p={q.p} />
                </div>
              ))}
            </div>
            <p className="text-[12.5px] text-aion-muted">
              Estas preguntas se responden en la <Link to="/coordinador" className="text-captura font-medium underline underline-offset-2">Mesa del coordinador</Link>{' '}
              y en el <Link to="/pipeline" className="text-captura font-medium underline underline-offset-2">Pipeline</Link>.
            </p>
          </section>

          {/* 12 · Indicadores */}
          <section id="sec-kpis" data-seccion="kpis" className="space-y-4 scroll-mt-24">
            <TituloSeccion>12. Indicadores</TituloSeccion>
            <Tarjeta className="p-5">
              <CitaInsumo p={KPIS_P}>{P(KPIS_P)}</CitaInsumo>
            </Tarjeta>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {KPIS_INSUMO.map((k, i) => (
                <Tarjeta key={k.id} className="p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono text-[10px] text-slate-400">{String(i + 1).padStart(2, '0')}</span>
                    <span className="badge-compact bg-slate-100 text-aion-muted font-mono ml-auto">
                      {k.unidad} · mejor {k.mejor === 'alto' ? 'alto' : 'bajo'}
                    </span>
                  </div>
                  <h3 className="text-[13.5px] font-bold text-aion-ink leading-tight">{k.nombre}</h3>
                  <p className="text-[12.5px] text-aion-muted mt-1.5 leading-relaxed">{k.definicion}</p>
                </Tarjeta>
              ))}
            </div>
            <div className="flex items-center gap-2 text-[12px] text-aion-muted">
              <SupuestoTag /> El insumo nombra los indicadores; la definición operativa y la unidad son del simulador.
            </div>
            <Tarjeta className="p-5 flex flex-wrap items-center gap-4">
              <Radar className="w-5 h-5 text-captura shrink-0" />
              <p className="text-[13px] text-aion-ink flex-1 min-w-[260px] leading-relaxed">
                Esta vista describe el proceso y cómo se implementa; no mide la operación. Los valores en vivo se consultan en el Dashboard y en la Control Tower.
              </p>
              <div className="flex gap-2">
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-aion-ink text-white text-[12.5px] font-medium hover:opacity-90 transition-opacity"
                >
                  <BarChart3 className="w-4 h-4" /> Ir al Dashboard
                </Link>
                <Link
                  to="/control-tower"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-aion-line bg-white text-aion-ink text-[12.5px] font-medium hover:bg-slate-50 transition-colors"
                >
                  <Radar className="w-4 h-4" /> Ir a la Control Tower
                </Link>
              </div>
            </Tarjeta>
          </section>

          {/* 13 · Propósito */}
          <section id="sec-proposito" data-seccion="proposito" className="space-y-4 scroll-mt-24">
            <TituloSeccion>13. Propósito</TituloSeccion>
            <Tarjeta className="p-5 space-y-3">
              <CitaInsumo p={48}>{PROPOSITO_TEXTO[0]}</CitaInsumo>
              <CitaInsumo p={49}>{PROPOSITO_TEXTO[1]}</CitaInsumo>
            </Tarjeta>
          </section>

          {/* Supuestos de diseño */}
          <section id={`sec-${SUPUESTOS_ID}`} data-seccion={SUPUESTOS_ID} className="space-y-4 scroll-mt-24">
            <TituloSeccion>{SECCIONES_DOC.length + 1}. Supuestos de diseño</TituloSeccion>
            <p className="text-[13px] text-aion-muted">Lo que el simulador decide por su cuenta porque el insumo no lo define.</p>
            <Tarjeta className="p-5">
              <ul className="space-y-2">
                {SUPUESTOS_DE_DISENO.map((s, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[13px] text-aion-ink leading-relaxed">
                    <span className="w-5 h-5 rounded-full bg-promesa-light text-promesa-dark border border-promesa/30 text-[10.5px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <TextoInline texto={s} />
                  </li>
                ))}
              </ul>
            </Tarjeta>
          </section>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Sparkles className="w-4 h-4 text-aion-muted" />
            <p className="text-[12px] text-aion-muted text-center">{DOC_PIE}</p>
          </div>
          <div className="flex items-center justify-center">
            <Link to="/pipeline" className="inline-flex items-center gap-2 text-[13px] font-medium text-captura hover:text-captura-dark transition-colors">
              <GitBranch className="w-4 h-4" />
              Ver el flujo corriendo en el Pipeline
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </article>
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Pestaña Proceso: dos vistas.
//  - Ruta de implementación (por defecto)
//  - Blueprint del proceso: el documento fuente transcrito 1:1
// ---------------------------------------------------------------------------

type VistaProceso = 'implementacion' | 'blueprint'

const VISTAS: { key: VistaProceso; label: string; icon: LucideIcon; ayuda: string }[] = [
  { key: 'implementacion', label: 'Ruta de implementación', icon: Route, ayuda: 'Fases secuenciales, stoppers, actividades técnicas y tiempo calculado' },
  { key: 'blueprint', label: 'Blueprint del proceso', icon: FileText, ayuda: 'El documento fuente, sección por sección' },
]

export default function Proceso() {
  const [vista, setVista] = useState<VistaProceso>('implementacion')
  const actual = VISTAS.find((v) => v.key === vista)!

  return (
    <div className="max-w-[1320px] mx-auto px-6 pb-14">
      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
          {VISTAS.map((v) => (
            <button
              key={v.key}
              onClick={() => setVista(v.key)}
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg transition-all',
                vista === v.key ? 'bg-white text-aion-ink shadow-sm' : 'text-aion-muted hover:text-aion-ink',
              )}
            >
              <v.icon className="w-4 h-4" />
              {v.label}
            </button>
          ))}
        </div>
        <span className="text-[11.5px] text-aion-muted">{actual.ayuda}</span>
      </div>

      {vista === 'implementacion' ? (
        <RutaImplementacion key={IMPLEMENTACION_HACEB.id} proceso={IMPLEMENTACION_HACEB} />
      ) : (
        <BlueprintProceso />
      )}
    </div>
  )
}
