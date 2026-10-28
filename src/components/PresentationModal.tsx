import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  ArrowRight,
  Bot,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FolderOpen,
  GitBranch,
  Headphones,
  Inbox,
  Lightbulb,
  MessageSquareQuote,
  Network,
  PhoneCall,
  Rocket,
  Route,
  Scale,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Truck,
  UserCheck,
  X,
} from 'lucide-react'
import {
  BLOQUES,
  CANALES_DEF,
  CATEGORIA_DEF,
  DATOS_MINIMOS,
  DOC_FRAMEWORK,
  DOC_KICKER,
  DOC_PIE,
  DOC_TITULO,
  EXPEDIENTE_CONTENIDO,
  FLUJO_ETAPAS,
  GUARDRAILS,
  HISTORIAL_PREGUNTAS,
  KPIS_INSUMO,
  OBJETIVO_TEXTO,
  PROPOSITO_TEXTO,
  REGLAS,
  SISTEMAS,
} from '@/data/procesoData'
import { SupuestoTag, SimuladoTag } from '@/components/shared'

interface Props {
  open: boolean
  onClose: () => void
}

interface SlideItem {
  icon: React.ElementType
  render: () => React.ReactNode
}

const COLOR_CATEGORIA = {
  automatico: '#94a3b8',
  asistido: '#f59e0b',
  humano: '#ef4444',
} as const

const NUM_POLITICAS = new Set(REGLAS.map((r) => r.politica)).size

// ---------------------------------------------------------------------------
// Piezas
// ---------------------------------------------------------------------------

function BulletItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-base leading-relaxed">
      <span className="w-1.5 h-1.5 rounded-full bg-aion-accent mt-2.5 shrink-0" />
      <span className="text-white/90">{children}</span>
    </li>
  )
}

function SlideShell({ icon: Icon, titulo, children, ancho = 'max-w-4xl', tag }: { icon: React.ElementType; titulo: string; children: React.ReactNode; ancho?: string; tag?: React.ReactNode }) {
  return (
    <div className={`h-full flex flex-col justify-center px-16 ${ancho} mx-auto`}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="space-y-5">
        <div className="flex items-center gap-3 mb-1 flex-wrap">
          <Icon className="w-6 h-6 text-aion-accent" />
          <h2 className="text-2xl font-semibold text-white">{titulo}</h2>
          {tag}
        </div>
        {children}
      </motion.div>
    </div>
  )
}

function Nota({ icon: Icon, children, acento = false }: { icon: React.ElementType; children: React.ReactNode; acento?: boolean }) {
  return (
    <div className={`flex items-start gap-3 rounded-xl px-5 py-4 border ${acento ? 'bg-aion-accent/10 border-aion-accent/25' : 'bg-white/5 border-white/10'}`}>
      <Icon className="w-5 h-5 text-aion-accent shrink-0 mt-0.5" />
      <p className="text-white/80 text-sm leading-relaxed">{children}</p>
    </div>
  )
}

function Ficha({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + delay, duration: 0.35 }} className={`bg-white/5 border border-white/10 rounded-xl ${className}`}>
      {children}
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Láminas
// ---------------------------------------------------------------------------

const RETOS = [
  { icon: PhoneCall, titulo: 'Llamadas manuales', texto: 'Cada confirmación, preventiva y seguimiento depende de que alguien llame; el propósito es reducir esas llamadas manuales.', p: 'P49' },
  { icon: MessageSquareQuote, titulo: 'Información contradictoria', texto: 'Cliente y transportador pueden tener datos distintos. La doble confirmación busca que ambos tengan la misma información y evitar desplazamientos y esperas.', p: 'P14 · R11' },
  { icon: Activity, titulo: 'Novedades que llegan tarde', texto: 'Llamar solo para saber dónde está el vehículo no basta: se necesita anticipar dificultades y activar a tiempo la intervención humana.', p: 'P48' },
]

const ETAPAS_POR_BLOQUE = BLOQUES.filter((b) => b.id !== 'Novedad').map((b) => ({ ...b, etapas: FLUJO_ETAPAS.filter((e) => e.bloque === b.id) }))

const AGENTES_SISTEMA = SISTEMAS.filter((s) => s.tipo === 'agente')
const OTROS_SISTEMAS = SISTEMAS.filter((s) => s.tipo !== 'agente')

const CASO_PASOS = [
  { n: 1, texto: 'El cliente llama; el agente de cliente atiende, identifica a la persona y recopila origen, destino, mercancía, peso y volumen.', quien: 'Agente de cliente' },
  { n: 2, texto: 'La plataforma valida, registra OP-0001 con identificador único y confirma cargue y horarios con el contacto autorizado.', quien: 'Plataforma' },
  { n: 3, texto: 'Se buscan transportadores compatibles en la base de proveedores y el agente de negociación los llama.', quien: 'Agente de negociación' },
  { n: 4, texto: 'Un transportador pide una tarifa sobre el tope autorizado. El agente no compromete valores adicionales y presenta el resultado.', quien: 'R06 · R07' },
  { n: 5, texto: 'La operación pasa a Escalada: el coordinador recibe el paquete de decisión y elige entre las alternativas.', quien: 'Coordinador' },
  { n: 6, texto: 'La decisión vuelve al proceso como evento estructurado y la coordinación continúa: confirmación doble, preventivas, cargue y tránsito.', quien: 'Agente de seguimiento' },
]

const ALTERNATIVAS_CASO = [
  { letra: 'A', titulo: 'Mantener el tope y llamar al siguiente candidato', costo: 'sin sobrecosto', rec: true },
  { letra: 'B', titulo: 'Autorizar la tarifa solicitada', costo: '+ $ 400.000', rec: false },
  { letra: 'C', titulo: 'Autorizar un punto medio', costo: '+ $ 200.000', rec: false },
]

const PAQUETE_SECCIONES = ['Qué ocurrió y por qué (causa)', 'Impacto sobre la operación', 'Evidencia', 'Alternativas con costo, tiempo, SLA y reglas', 'Recomendación del agente', 'Decisión del coordinador']
const DECISIONES = ['Autorizar', 'Elegir alternativa', 'Rechazar', 'Cancelar']

const FASES_RUTA = [
  { fase: 'Ingesta', icon: Inbox, texto: 'Recibir la solicitud por los cuatro canales (llamada, formulario, integración, registro del coordinador).' },
  { fase: 'Extracción', icon: ClipboardList, texto: 'Obtener los datos mínimos de la solicitud, sea cual sea el canal.' },
  { fase: 'Validación', icon: ShieldCheck, texto: 'Comprobar que la información sea suficiente; si no, el agente vuelve a llamar al cliente.' },
  { fase: 'Clasificación y destino', icon: Scale, texto: 'Decidir si se informa, si el agente propone o si decide el responsable, y a quién se dirige.' },
  { fase: 'Registro, cierre y aviso', icon: FolderOpen, texto: 'Registrar en el expediente, avisar a las partes y cerrar solo tras las validaciones.' },
]

const slides: SlideItem[] = [
  // 01 · Portada
  {
    icon: Truck,
    render: () => (
      <div className="flex flex-col items-center justify-center h-full text-center px-12">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.7 }} className="space-y-8">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-aion-accent flex items-center justify-center">
            <Truck className="w-10 h-10 text-aion-ink" />
          </div>
          <div>
            <p className="text-aion-accent text-xs uppercase tracking-[0.3em] mb-4 font-semibold">{DOC_FRAMEWORK}</p>
            <h1 className="text-5xl font-display font-bold text-white leading-tight mb-4">{DOC_KICKER}</h1>
            <p className="text-lg text-white/60 max-w-3xl mx-auto leading-relaxed">{DOC_TITULO}.</p>
          </div>
          <div className="w-16 h-0.5 bg-aion-accent mx-auto" />
          <p className="text-xs text-white/40 uppercase tracking-[0.25em]">Simulador de demostración · operación simulada</p>
        </motion.div>
      </div>
    ),
  },

  // 02 · Lo que escuchamos
  {
    icon: MessageSquareQuote,
    render: () => (
      <SlideShell icon={MessageSquareQuote} titulo="Lo que escuchamos" ancho="max-w-4xl">
        <div className="border-l-4 border-aion-accent pl-6 py-2">
          <p className="text-white/90 text-lg leading-relaxed">{OBJETIVO_TEXTO}</p>
          <p className="text-aion-accent/70 text-[11px] font-mono mt-2">Insumo del proceso · P1</p>
        </div>
        <div className="grid grid-cols-5 gap-2.5 pt-2">
          {['Automatizar llamadas', 'Confirmar información', 'Gestionar compromisos', 'Detectar novedades', 'Mantener sincronizados a todos'].map((t, i) => (
            <Ficha key={t} delay={i * 0.06} className="px-3 py-3 text-center">
              <span className="block text-aion-accent font-mono text-xs font-bold mb-1">{i + 1}</span>
              <span className="text-white/85 text-[13px] leading-snug">{t}</span>
            </Ficha>
          ))}
        </div>
      </SlideShell>
    ),
  },

  // 03 · Retos
  {
    icon: PhoneCall,
    render: () => (
      <SlideShell icon={PhoneCall} titulo="Los retos de la coordinación manual" ancho="max-w-5xl">
        <div className="grid grid-cols-3 gap-4">
          {RETOS.map((r, i) => (
            <Ficha key={r.titulo} delay={i * 0.1} className="p-5">
              <r.icon className="w-7 h-7 text-aion-accent mb-3" />
              <span className="block text-white font-bold text-base mb-2">{r.titulo}</span>
              <p className="text-white/65 text-[13px] leading-relaxed">{r.texto}</p>
              <span className="inline-block mt-3 text-[10px] font-mono text-aion-accent/70">{r.p}</span>
            </Ficha>
          ))}
        </div>
        <Nota icon={Lightbulb}>Lectura derivada del propósito del proceso (P48–P49): se trata de reducir llamadas manuales, dificultades de comunicación, tiempos de respuesta y riesgos de incumplimiento.</Nota>
      </SlideShell>
    ),
  },

  // 04 · Interpretación
  {
    icon: Lightbulb,
    render: () => (
      <SlideShell icon={Lightbulb} titulo="Nuestra interpretación" tag={<SupuestoTag />}>
        <ul className="space-y-4">
          <BulletItem>La unidad de trabajo es la <b className="text-aion-accent">operación de transporte</b>: nace con la solicitud del cliente y vive hasta la confirmación final del servicio.</BulletItem>
          <BulletItem>La coordinación es <b className="text-aion-accent">permanente</b>: tres agentes de IA hablan con el cliente, con el transportador y entre sí, sobre la misma información operativa.</BulletItem>
          <BulletItem>El coordinador no desaparece: recibe las novedades <b className="text-aion-accent">listas para decidir</b> y solo interviene donde se necesita su criterio.</BulletItem>
        </ul>
        <Nota icon={Target} acento>Ni todo automático, ni todo humano: informar se automatiza, la novedad la propone el agente y la decisión económica o contractual es de la persona responsable.</Nota>
      </SlideShell>
    ),
  },

  // 05 · Posición
  {
    icon: Bot,
    render: () => (
      <SlideShell icon={Bot} titulo="Nuestra posición: agentes que coordinan, no solo llaman" ancho="max-w-5xl">
        <div className="grid grid-cols-2 gap-5">
          <Ficha className="p-5 opacity-80">
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/45 font-semibold">No es</span>
            <p className="text-white/70 text-base mt-2 leading-relaxed">Un robot que llama al transportador para saber dónde se encuentra.</p>
          </Ficha>
          <Ficha delay={0.1} className="p-5 !border-aion-accent/40 !bg-aion-accent/10">
            <span className="text-[10px] uppercase tracking-[0.2em] text-aion-accent font-semibold">Es</span>
            <p className="text-white/90 text-base mt-2 leading-relaxed">Un mecanismo de coordinación operativa entre cliente, transportador y equipo logístico.</p>
          </Ficha>
        </div>
        <div className="grid grid-cols-5 gap-2.5">
          {['Recopilar información', 'Verificar compromisos', 'Anticipar dificultades', 'Mantener informadas a las partes', 'Activar la intervención humana a tiempo'].map((t, i) => (
            <Ficha key={t} delay={0.2 + i * 0.06} className="px-3 py-3.5 text-center">
              <span className="text-white/85 text-[13px] leading-snug">{t}</span>
            </Ficha>
          ))}
        </div>
        <p className="text-aion-accent/70 text-[11px] font-mono">Insumo del proceso · P48</p>
      </SlideShell>
    ),
  },

  // 06 · Flujo
  {
    icon: GitBranch,
    render: () => (
      <SlideShell icon={GitBranch} titulo="El flujo end-to-end: 17 etapas en 5 bloques" ancho="max-w-6xl">
        <div className="grid grid-cols-5 gap-3">
          {ETAPAS_POR_BLOQUE.map((b, i) => (
            <motion.div key={b.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.08 }} className="rounded-xl border p-3" style={{ borderColor: `${b.color}80`, backgroundColor: `${b.color}1f` }}>
              <span className="block text-white font-bold text-[13px] leading-tight">{b.nombre}</span>
              <span className="block text-white/50 text-[10.5px] mt-0.5 mb-2.5 leading-snug">{b.descripcion}</span>
              <div className="space-y-1.5">
                {b.etapas.map((e) => (
                  <div key={e.id} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ backgroundColor: b.color }}>{e.numero}</span>
                    <span className="text-white/85 text-[11.5px] leading-tight">{e.nombre}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
        <Nota icon={Target}>Dos esperas fuera del recorrido normal: <b className="text-aion-accent">esperando datos</b> (el agente programa una gestión posterior) y <b className="text-aion-accent">escalada</b> (en manos del coordinador). El cierre administrativo solo ocurre tras las validaciones. <span className="ml-1 text-white/40">Los bloques de color son una agrupación visual.</span></Nota>
      </SlideShell>
    ),
  },

  // 07 · Canales y datos mínimos
  {
    icon: Inbox,
    render: () => (
      <SlideShell icon={Inbox} titulo="Cuatro canales de entrada, un mismo conjunto de datos mínimos" ancho="max-w-5xl">
        <div className="grid grid-cols-4 gap-3">
          {CANALES_DEF.map((c, i) => (
            <Ficha key={c.id} delay={i * 0.07} className="p-4">
              <span className="block w-2.5 h-2.5 rounded-full mb-2" style={{ backgroundColor: c.color }} />
              <span className="block text-white font-bold text-[13px] leading-tight">{c.nombre}</span>
              <p className="text-white/55 text-[11.5px] mt-1.5 leading-snug">{c.descripcion}</p>
            </Ficha>
          ))}
        </div>
        <div>
          <p className="text-white/50 text-[11px] uppercase tracking-[0.2em] mb-2">Datos mínimos de la solicitud · P3</p>
          <div className="flex flex-wrap gap-2">
            {DATOS_MINIMOS.map((d, i) => (
              <motion.span key={d} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.04 }} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/85 text-[12.5px]">{d}</motion.span>
            ))}
          </div>
        </div>
        <Nota icon={Headphones} acento>Si el cliente no tiene toda la información, el agente registra lo confirmado y programa una gestión posterior para completar lo que falta (R02).</Nota>
      </SlideShell>
    ),
  },

  // 08 · Sistemas y agentes
  {
    icon: Network,
    render: () => (
      <SlideShell icon={Network} titulo="Sistemas y agentes: tres agentes, una agenda y un expediente" ancho="max-w-5xl">
        <div className="grid grid-cols-3 gap-3">
          {AGENTES_SISTEMA.map((s, i) => (
            <Ficha key={s.id} delay={i * 0.08} className="p-4 !border-aion-accent/35 !bg-aion-accent/10">
              <Bot className="w-5 h-5 text-aion-accent mb-2" />
              <span className="block text-white font-bold text-[13px] leading-tight">{s.nombre.replace('Agente de IA · ', '')}</span>
              <p className="text-white/60 text-[11.5px] mt-1.5 leading-snug">{s.descripcion}</p>
            </Ficha>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {OTROS_SISTEMAS.map((s, i) => (
            <Ficha key={s.id} delay={0.25 + i * 0.04} className={`px-3.5 py-2.5 ${s.id === 'agenda' || s.id === 'expediente' ? '!border-aion-accent/40' : ''}`}>
              <span className="block text-white/90 text-[12.5px] font-semibold leading-tight">{s.nombre}</span>
              <p className="text-white/45 text-[10.5px] mt-1 leading-snug">{s.descripcion}</p>
            </Ficha>
          ))}
        </div>
        <p className="text-white/50 text-xs">El insumo no nombra productos: los componentes son funcionales.</p>
      </SlideShell>
    ),
  },

  // 09 · Informar vs decidir
  {
    icon: Scale,
    render: () => (
      <SlideShell icon={Scale} titulo="Informar frente a decidir: tres categorías" ancho="max-w-5xl">
        <div className="grid grid-cols-3 gap-4">
          {(['automatico', 'asistido', 'humano'] as const).map((k, i) => {
            const c = CATEGORIA_DEF[k]
            return (
              <motion.div key={k} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }} className="rounded-xl border p-5" style={{ borderColor: `${COLOR_CATEGORIA[k]}80`, backgroundColor: `${COLOR_CATEGORIA[k]}22` }}>
                <span className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-extrabold text-lg mb-3" style={{ backgroundColor: COLOR_CATEGORIA[k] }}>{['A', 'B', 'C'][i]}</span>
                <span className="block text-white font-bold text-sm leading-tight">{c.nombre}</span>
                <p className="text-white/70 text-[12.5px] mt-2 leading-snug">{c.descripcion}</p>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <span className="text-aion-accent text-[11px] font-semibold">{c.ejemplos}</span>
                  {c.supuesto && <SupuestoTag />}
                </div>
              </motion.div>
            )
          })}
        </div>
        <Nota icon={ShieldCheck}>Informar el estado, confirmar una hora de llegada o pedir una actualización se gestiona solo; modificar una tarifa, aprobar sobrecostos, cambiar condiciones contractuales o cancelar requiere al responsable (R28).</Nota>
      </SlideShell>
    ),
  },

  // 10 · Caso ejemplo
  {
    icon: Route,
    render: () => (
      <SlideShell icon={Route} titulo="Una operación completa: neveras de Medellín a Barranquilla" ancho="max-w-6xl" tag={<SimuladoTag />}>
        <div className="grid grid-cols-[1.45fr_1fr] gap-6">
          <div className="space-y-2">
            {CASO_PASOS.map((p, i) => (
              <motion.div key={p.n} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.07 }} className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5">
                <span className="w-6 h-6 rounded-full bg-aion-accent text-aion-ink text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">{p.n}</span>
                <div className="min-w-0">
                  <span className="text-white/85 text-[12.5px] leading-snug block">{p.texto}</span>
                  <span className="text-aion-accent/70 text-[10px] font-mono uppercase tracking-wider">{p.quien}</span>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="space-y-3">
            <Ficha delay={0.2} className="p-4">
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/45 font-semibold">Tarifa, ilustrativa</span>
              <div className="mt-2 space-y-1.5 font-mono text-[12.5px]">
                <div className="flex justify-between"><span className="text-white/65">Tope autorizado</span><span className="text-white">$ 3.200.000</span></div>
                <div className="flex justify-between"><span className="text-white/65">Tarifa solicitada</span><span className="text-catD">$ 3.600.000</span></div>
                <div className="flex justify-between border-t border-white/10 pt-1.5"><span className="text-white/65">Diferencia</span><span className="text-aion-accent">$ 400.000</span></div>
              </div>
            </Ficha>
            <div className="space-y-1.5">
              {ALTERNATIVAS_CASO.map((a, i) => (
                <motion.div key={a.letra} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.07 }} className={`flex items-center gap-3 rounded-lg px-3 py-2 border ${a.rec ? 'bg-aion-accent/15 border-aion-accent/40' : 'bg-white/5 border-white/10'}`}>
                  <span className="w-6 h-6 rounded-md bg-white/10 text-white font-bold text-[12px] flex items-center justify-center shrink-0">{a.letra}</span>
                  <span className="text-white/85 text-[12px] leading-snug flex-1">{a.titulo}</span>
                  <span className="text-[10.5px] font-mono text-white/55 shrink-0">{a.costo}</span>
                </motion.div>
              ))}
              <p className="text-white/45 text-[11px] pt-1">Recomienda A (resalta); decide el coordinador.</p>
            </div>
          </div>
        </div>
      </SlideShell>
    ),
  },

  // 11 · Mesa del coordinador
  {
    icon: UserCheck,
    render: () => (
      <SlideShell icon={UserCheck} titulo="La Mesa del coordinador: no recibe un problema, recibe un paquete de decisión" ancho="max-w-5xl" tag={<SupuestoTag />}>
        <div className="grid grid-cols-2 gap-6 items-start">
          <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 space-y-2">
            <div className="flex items-center gap-2 pb-2 border-b border-white/10">
              <span className="font-mono text-aion-accent text-xs font-bold">OP-0001</span>
              <span className="text-white/60 text-xs">Tarifa solicitada sobre el límite</span>
            </div>
            {PAQUETE_SECCIONES.map((s, i) => (
              <motion.div key={s} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 + i * 0.08 }} className="flex items-center gap-3 font-mono text-[12.5px]">
                <span className="text-aion-accent/50 w-4">{i + 1}</span>
                <span className={i === PAQUETE_SECCIONES.length - 1 ? 'text-aion-accent font-bold' : 'text-white/85'}>{s}</span>
              </motion.div>
            ))}
            <div className="flex flex-wrap gap-1.5 pt-2">
              {DECISIONES.map((d) => (
                <span key={d} className="px-2.5 py-1 rounded-md border border-aion-accent/40 text-aion-accent text-[11px] font-semibold">{d}</span>
              ))}
            </div>
          </div>
          <ul className="space-y-4">
            <BulletItem>Llegan a la mesa las novedades que requieren criterio: el agente ya recopiló la evidencia y evaluó las alternativas.</BulletItem>
            <BulletItem>La decisión vuelve al proceso como evento estructurado y los agentes continúan la coordinación.</BulletItem>
            <BulletItem>La mesa es también la visión centralizada: pendientes de asignación, en negociación, en tránsito y novedades por atender.</BulletItem>
          </ul>
        </div>
      </SlideShell>
    ),
  },

  // 12 · Gobierno
  {
    icon: ShieldCheck,
    render: () => (
      <SlideShell icon={ShieldCheck} titulo="Gobierno: reglas, políticas, guardrails y expediente" ancho="max-w-5xl">
        <div className="grid grid-cols-4 gap-3">
          <Ficha className="p-4 text-center">
            <span className="block text-3xl font-bold font-mono text-aion-accent">{REGLAS.length}</span>
            <span className="text-white/80 text-[12.5px]">reglas de negocio</span>
          </Ficha>
          <Ficha delay={0.07} className="p-4 text-center">
            <span className="block text-3xl font-bold font-mono text-aion-accent">{NUM_POLITICAS}</span>
            <span className="text-white/80 text-[12.5px]">políticas que las agrupan</span>
            <span className="block mt-1"><SupuestoTag /></span>
          </Ficha>
          <Ficha delay={0.14} className="p-4 text-center">
            <span className="block text-3xl font-bold font-mono text-aion-accent">{GUARDRAILS.length}</span>
            <span className="text-white/80 text-[12.5px]">guardrails con parámetros</span>
            <span className="block mt-1"><SupuestoTag /></span>
          </Ficha>
          <Ficha delay={0.21} className="p-4 text-center">
            <span className="block text-3xl font-bold font-mono text-aion-accent">{EXPEDIENTE_CONTENIDO.length}</span>
            <span className="text-white/80 text-[12.5px]">elementos en el expediente</span>
          </Ficha>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Ficha delay={0.25} className="p-4">
            <p className="text-white/50 text-[11px] uppercase tracking-[0.2em] mb-2">Guardrails (cifras de ejemplo)</p>
            <div className="flex flex-wrap gap-1.5">
              {GUARDRAILS.map((g) => (
                <span key={g.id} className="px-2.5 py-1 rounded-md bg-white/10 text-white/85 text-[11.5px]">{g.nombre}</span>
              ))}
            </div>
          </Ficha>
          <Ficha delay={0.3} className="p-4">
            <p className="text-white/50 text-[11px] uppercase tracking-[0.2em] mb-2">El historial responde</p>
            <ul className="space-y-1">
              {HISTORIAL_PREGUNTAS.map((h) => (
                <li key={h} className="flex items-center gap-2 text-white/80 text-[12.5px]"><span className="w-1 h-1 rounded-full bg-aion-accent shrink-0" />{h}</li>
              ))}
            </ul>
          </Ficha>
        </div>
      </SlideShell>
    ),
  },

  // 13 · Indicadores
  {
    icon: TrendingUp,
    render: () => (
      <SlideShell icon={TrendingUp} titulo="Nueve indicadores para saber si la coordinación funciona" ancho="max-w-6xl">
        <div className="grid grid-cols-3 gap-3">
          {KPIS_INSUMO.map((k, i) => (
            <Ficha key={k.id} delay={i * 0.05} className="p-3.5">
              <div className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-full bg-aion-accent/20 text-aion-accent text-[11px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <div className="min-w-0">
                  <span className="block text-white font-semibold text-[13px] leading-tight">{k.nombre}</span>
                  <p className="text-white/55 text-[11.5px] mt-1 leading-snug">{k.definicion}</p>
                </div>
              </div>
            </Ficha>
          ))}
        </div>
        <Nota icon={Activity}>Aquí solo se presentan qué se mide y para qué sirve. Los valores se calculan en el tablero y en la torre de control a partir de la operación simulada.</Nota>
      </SlideShell>
    ),
  },

  // 14 · Ruta
  {
    icon: Rocket,
    render: () => (
      <SlideShell icon={Rocket} titulo="Ruta de implementación en cinco fases" ancho="max-w-6xl" tag={<SupuestoTag />}>
        <div className="grid grid-cols-5 gap-3">
          {FASES_RUTA.map((f, i) => (
            <Ficha key={f.fase} delay={i * 0.08} className="p-4 relative">
              <span className="absolute top-3 right-3 font-mono text-[11px] text-aion-accent/60">{i + 1}</span>
              <f.icon className="w-6 h-6 text-aion-accent mb-2.5" />
              <span className="block text-white font-bold text-[13px] leading-tight mb-1.5">{f.fase}</span>
              <p className="text-white/60 text-[11.5px] leading-snug">{f.texto}</p>
            </Ficha>
          ))}
        </div>
        <Nota icon={CalendarClock} acento>El tiempo de cada fase no se fija aquí: se calcula en la pestaña Ruta con los prerrequisitos que cada organización confirme.</Nota>
      </SlideShell>
    ),
  },

  // 15 · Cierre
  {
    icon: Sparkles,
    render: () => (
      <div className="flex flex-col items-center justify-center h-full text-center px-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.6 }} className="space-y-6 max-w-3xl">
          <Sparkles className="w-12 h-12 text-aion-accent mx-auto" />
          <h2 className="text-3xl font-display font-bold text-white leading-tight">Coordinación permanente, desde la solicitud hasta la confirmación final</h2>
          <div className="space-y-3 text-left">
            {PROPOSITO_TEXTO.map((t, i) => (
              <p key={i} className={`text-sm leading-relaxed ${i === 0 ? 'text-white/85' : 'text-white/60'}`}>{t}</p>
            ))}
          </div>
          <p className="text-aion-accent/70 text-[11px] font-mono">Insumo del proceso · P48–P49</p>
          <div className="flex items-center justify-center gap-2 flex-wrap pt-1">
            {ETAPAS_POR_BLOQUE.map((b, i) => (
              <span key={b.id} className="flex items-center gap-2">
                {i > 0 && <ArrowRight className="w-4 h-4 text-white/25" />}
                <span className="px-3 py-1.5 rounded-lg text-sm font-semibold" style={{ backgroundColor: `${b.color}33`, color: '#fff' }}>{b.nombre}</span>
              </span>
            ))}
          </div>
          <p className="text-xs text-white/35 uppercase tracking-[0.2em] pt-3">{DOC_PIE}</p>
        </motion.div>
      </div>
    ),
  },
]

const totalSlides = slides.length

/**
 * El mazo se monta y desmonta con `open`, de modo que la lámina activa vuelve
 * a la primera sin necesidad de un efecto de reinicio.
 */
export default function PresentationModal({ open, onClose }: Props) {
  if (!open) return null
  return <Deck onClose={onClose} />
}

function Deck({ onClose }: { onClose: () => void }) {
  const [current, setCurrent] = useState(0)

  const goNext = useCallback(() => setCurrent((p) => Math.min(p + 1, totalSlides - 1)), [])
  const goPrev = useCallback(() => setCurrent((p) => Math.max(p - 1, 0)), [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext()
      else if (e.key === 'ArrowLeft') goPrev()
      else if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goNext, goPrev, onClose])

  const slide = slides[current]
  const isFirst = current === 0
  const isLast = current === totalSlides - 1

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} role="dialog" aria-modal="true" aria-label="Presentación ejecutiva" className="fixed inset-0 z-50 bg-aion-ink flex flex-col select-none">
      {/* Barra superior */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-aion-accent flex items-center justify-center">
            <Truck className="w-5 h-5 text-aion-ink" />
          </div>
          <div>
            <span className="text-white text-sm font-semibold">Haceb</span>
            <span className="text-white/40 text-xs ml-2">Coordinación logística con agentes de IA</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-white/40 text-xs font-mono">
            {String(current + 1).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
          </span>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors" aria-label="Cerrar presentación">
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 relative overflow-hidden">
        <motion.div key={current} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="absolute inset-0 flex flex-col">
          <div className="px-16 pt-6 pb-2 flex items-center gap-4">
            <slide.icon className="w-5 h-5 text-aion-accent" />
            <span className="text-aion-accent/50 text-xs font-mono uppercase tracking-[0.15em]">
              {String(current + 1).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto pb-6">{slide.render()}</div>
        </motion.div>
      </div>

      {/* Navegación */}
      <div className="flex items-center justify-between px-8 py-4 border-t border-white/10">
        <div className="flex items-center gap-6">
          <button onClick={goPrev} disabled={isFirst} className="p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-20 disabled:cursor-not-allowed" aria-label="Anterior">
            <ChevronLeft className="w-5 h-5 text-white/60" />
          </button>
          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)} className={`rounded-full transition-all duration-300 ${i === current ? 'w-6 h-2 bg-aion-accent' : 'w-2 h-2 bg-white/20 hover:bg-white/40'}`} aria-label={`Ir a la lámina ${i + 1}`} />
            ))}
          </div>
          <button onClick={goNext} disabled={isLast} className="p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-20 disabled:cursor-not-allowed" aria-label="Siguiente">
            <ChevronRight className="w-5 h-5 text-white/60" />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <Activity className="w-3.5 h-3.5 text-white/25" />
          <span className="text-white/30 text-[10px] uppercase tracking-[0.15em]">← → para navegar · Esc para cerrar</span>
        </div>
      </div>
    </motion.div>
  )
}
