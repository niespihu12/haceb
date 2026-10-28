import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BookOpen,
  Bot,
  Boxes,
  Building2,
  ChevronRight,
  CircleX,
  ClipboardList,
  FileText,
  FolderTree,
  GitBranch,
  GitGraph,
  Hourglass,
  Layers,
  Lightbulb,
  ListChecks,
  MapPin,
  Package,
  PhoneCall,
  Radar,
  Route,
  Scale,
  Search,
  ShieldCheck,
  Truck,
  Undo2,
  UserCheck,
  UserRound,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { crearRng } from '@/lib/rng'
import { CategoriaBadge, EtapaBadge, SimuladoTag, SupuestoTag } from '@/components/shared'
import {
  AGENTES_IA,
  BLOQUE_COLOR,
  CATEGORIA_LABEL,
  CANAL_INFO,
  ETAPAS_FLUJO,
  ETAPA_BLOQUE,
  ETAPA_LABEL,
  ETAPA_LABEL_CORTO,
  ETAPA_NUMERO,
  PLANTILLA_EXCEPCION,
  TIPOS_EXCEPCION,
  TRANSPORTADORES,
  construirOfertas,
  generarOperacion,
} from '@/data/mockData'
import {
  BLOQUES,
  CANALES_DEF,
  CATEGORIA_DEF,
  DATOS_MINIMOS,
  ESTADOS_FIN,
  ETAPA_POR_ID,
  EXCEPCIONES_LISTA,
  EXPEDIENTE_CONTENIDO,
  FLUJO_ETAPAS,
  FUERA_DE_ALCANCE,
  GUARDRAILS,
  KPIS_INSUMO,
  P,
  REGLAS,
  ROLES,
  SISTEMAS,
  SUPUESTOS_DE_DISENO,
} from '@/data/procesoData'
import type {
  Alternativa,
  BloqueFlujo,
  CategoriaDecision,
  EfectoAlternativa,
  EstadoOferta,
  EtapaFlujo,
  EtapaOperacion,
  NombreEvento,
  ObjetivoLlamada,
  ResultadoLlamada,
  TipoExcepcion,
  TipoVehiculo,
} from '@/types'

const TABS = [
  { key: 'entidades', label: 'Entidades', icon: Boxes },
  { key: 'relaciones', label: 'Relaciones', icon: GitBranch },
  { key: 'taxonomias', label: 'Taxonomías', icon: FolderTree },
  { key: 'maquina', label: 'Máquina de estados', icon: GitGraph },
  { key: 'reglas', label: 'Reglas de negocio', icon: Scale },
  { key: 'glosario', label: 'Glosario', icon: BookOpen },
  { key: 'supuestos', label: 'Supuestos', icon: Lightbulb },
] as const

type TabKey = (typeof TABS)[number]['key']

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.03 } } }
const itemVariants = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }

// ---------------------------------------------------------------------------
// Origen de cada elemento: insumo · supuesto de diseño · operación simulada
// ---------------------------------------------------------------------------

type Origen = 'insumo' | 'supuesto' | 'simulado'

const ORIGEN_INFO: Record<Origen, { label: string; dot: string; clase: string }> = {
  insumo: { label: 'del insumo', dot: 'bg-success', clase: 'bg-success-light text-success border-success/25' },
  supuesto: { label: 'supuesto de diseño', dot: 'bg-promesa', clase: 'bg-promesa-light text-promesa-dark border-promesa/30' },
  simulado: { label: 'operación simulada', dot: 'bg-slate-400', clase: 'bg-slate-100 text-slate-600 border-slate-200' },
}

function OrigenTag({ origen }: { origen: Origen }) {
  if (origen === 'supuesto') return <SupuestoTag />
  if (origen === 'simulado') return <SimuladoTag />
  return <span className={cn('badge-compact border font-semibold', ORIGEN_INFO.insumo.clase)} title="Sale del documento proceso.txt">del insumo</span>
}

function LeyendaOrigen() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-aion-muted">
      {(Object.keys(ORIGEN_INFO) as Origen[]).map((o) => (
        <span key={o} className="inline-flex items-center gap-1.5">
          <span className={cn('w-2 h-2 rounded-full', ORIGEN_INFO[o].dot)} />
          {ORIGEN_INFO[o].label}
        </span>
      ))}
    </div>
  )
}

function Panel({ titulo, icono: Icono, derecha, children }: { titulo: string; icono?: LucideIcon; derecha?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-card border border-aion-line overflow-hidden">
      <div className="px-5 py-3 bg-slate-50 border-b border-aion-line flex items-center justify-between gap-3 flex-wrap">
        <h3 className="font-semibold text-aion-ink text-sm flex items-center gap-2">
          {Icono && <Icono className="w-4 h-4 text-aion-muted" />}
          {titulo}
        </h3>
        {derecha}
      </div>
      {children}
    </div>
  )
}

const PBadge = ({ p }: { p: number | number[] }) => (
  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-aion-muted">{Array.isArray(p) ? `P${p.join('–P')}` : `P${p}`}</span>
)

// ---------------------------------------------------------------------------
// Entidades
// ---------------------------------------------------------------------------

interface Campo {
  n: string
  t: string
  o: Origen
}
const f = (n: string, t: string, o: Origen): Campo => ({ n, t, o })

interface Entidad {
  name: string
  icon: LucideIcon
  desc: string
  color: string
  origen: Origen[]
  nota?: string
  campos: Campo[]
}

const ENTIDADES: Entidad[] = [
  {
    name: 'Operación',
    icon: Package,
    desc: 'Unidad de trabajo: una solicitud de transporte que recorre el flujo de punta a punta',
    color: '#2563eb',
    origen: ['insumo', 'supuesto'],
    nota: 'El documento dice «operación» y «servicio»; el nombre «Operación de transporte» y el código OP-0001 son del simulador.',
    campos: [
      f('id', 'string · OP-0001', 'insumo'),
      f('canal', 'Canal (4)', 'insumo'),
      f('cliente · solicitante', 'Cliente · string', 'insumo'),
      f('nodoOrigen · nodoDestino', 'Nodo', 'insumo'),
      f('mercancia', 'Mercancia', 'insumo'),
      f('vehiculoRequerido', 'TipoVehiculo', 'insumo'),
      f('fechaCargue', 'timestamp', 'insumo'),
      f('condicionesEntrega · requisitoEspecial', 'string · string | null', 'insumo'),
      f('datosPendientes', 'string[]', 'insumo'),
      f('tarifaMaxima · tarifaPactada · costosAdicionales', 'COP', 'insumo'),
      f('etapa', 'EtapaOperacion (17 + 4)', 'insumo'),
      f('etapaRetorno · bloque', 'EtapaFlujo | null · BloqueFlujo', 'supuesto'),
      f('ofertas · transportador · receptor', 'Oferta[] · Transportador | null · contacto', 'insumo'),
      f('llamadas · compromisos · soportes', 'Llamada[] · Compromiso[] · Soporte[]', 'insumo'),
      f('excepcion · excepcionesPrevias', 'Excepcion | null · Excepcion[]', 'insumo'),
      f('trazas · eventos', 'TrazaDecision[] · EventoOperacion[]', 'supuesto'),
      f('intervencionHumana · casoSeguimiento', 'boolean', 'insumo'),
      f('causaCancelacion', 'string | null', 'supuesto'),
      f('origen · seq · progreso · retrasoHoras', 'técnicos del simulador', 'simulado'),
    ],
  },
  {
    name: 'Cliente',
    icon: Building2,
    desc: 'Quien solicita el transporte y recibe la información de avance',
    color: '#65a30d',
    origen: ['insumo', 'simulado'],
    campos: [f('nombre', 'string · empresa que solicita', 'insumo'), f('contacto', 'string · persona que solicita', 'insumo'), f('telefono', 'string', 'insumo'), f('id', 'CL-001', 'simulado'), f('tipo', 'distribuidor · cadena · constructora…', 'simulado')],
  },
  {
    name: 'Contacto',
    icon: UserRound,
    desc: 'Contacto autorizado del cliente y destinatario de recepción',
    color: '#7c3aed',
    origen: ['insumo'],
    nota: 'Solo el contacto autorizado puede consultar el estado (R20); el destinatario confirma recepción (P30–P33).',
    campos: [f('solicitante', 'string · persona que hace la solicitud', 'insumo'), f('cliente.contacto', 'string · contacto autorizado', 'insumo'), f('receptor.nombre', 'string · quien recibe el vehículo', 'insumo'), f('receptor.telefono', 'string', 'insumo')],
  },
  {
    name: 'Nodo',
    icon: MapPin,
    desc: 'Punto de origen o de destino de la mercancía',
    color: '#0d9488',
    origen: ['insumo', 'simulado'],
    campos: [f('ciudad · lugar', 'bodega · CEDI · planta', 'insumo'), f('id', 'N-MDE', 'simulado'), f('lat · lng', 'number', 'simulado')],
  },
  {
    name: 'Transportador',
    icon: Truck,
    desc: 'Proveedor de transporte; la base guarda ubicación, vehículo, capacidad e historial',
    color: '#0891b2',
    origen: ['insumo', 'simulado'],
    campos: [f('base', 'ubicación', 'insumo'), f('flota', 'TipoVehiculo[]', 'insumo'), f('cumplimiento', '0–100 · historial', 'insumo'), f('conductor · telefono · placa', 'string', 'insumo'), f('id', 'TR-01', 'simulado')],
  },
  {
    name: 'Mercancía',
    icon: Boxes,
    desc: 'Lo que se moviliza: tipo, peso y volumen',
    color: '#d97706',
    origen: ['insumo', 'simulado'],
    campos: [f('tipo · descripcion', 'string', 'insumo'), f('pesoKg', 'number', 'insumo'), f('volumenM3', 'number', 'insumo'), f('unidades', 'number', 'simulado')],
  },
  {
    name: 'Oferta',
    icon: ListChecks,
    desc: 'Resultado de la negociación con un candidato; se consolidan para seleccionar',
    color: '#4f46e5',
    origen: ['insumo', 'supuesto'],
    campos: [f('transportadorId · nombre · vehiculo', 'string', 'insumo'), f('compatibilidad · cumplimiento', '0–100', 'insumo'), f('tarifaOfrecida · tarifaSolicitada · tarifaFinal', 'COP', 'insumo'), f('estado', 'EstadoOferta (4)', 'supuesto')],
  },
  {
    name: 'Llamada',
    icon: PhoneCall,
    desc: 'Cada contacto de la IA tiene un objetivo y se vincula a operación, interlocutor y actividad',
    color: '#7c3aed',
    origen: ['insumo', 'simulado'],
    campos: [
      f('objetivo', 'ObjetivoLlamada (16)', 'insumo'),
      f('sentido · interlocutor · nombre', 'saliente | entrante · cliente | transportador | destinatario', 'insumo'),
      f('agente · etapa', 'AgenteIA · EtapaFlujo', 'insumo'),
      f('resultado', 'ResultadoLlamada (4)', 'insumo'),
      f('respuestaMin', 'number | null · KPI', 'insumo'),
      f('confirmada', 'boolean · confirmada vs. estimada', 'insumo'),
      f('resumen · duracionSeg · ts', 'texto y tiempos ficticios', 'simulado'),
    ],
  },
  {
    name: 'Compromiso',
    icon: ClipboardList,
    desc: 'Lo que cada parte se obliga a hacer y cuándo',
    color: '#be123c',
    origen: ['insumo'],
    campos: [f('texto', 'string', 'insumo'), f('parte', 'cliente | transportador | coordinador | agente', 'insumo'), f('venceEn', 'timestamp', 'insumo'), f('estado', 'pendiente | cumplido | incumplido', 'insumo')],
  },
  {
    name: 'Excepción',
    icon: GitBranch,
    desc: 'Novedad o situación que el agente detecta; la categoría define quién la resuelve',
    color: '#e11d48',
    origen: ['insumo', 'supuesto'],
    nota: 'Los 17 tipos salen de situaciones que el documento describe; la tipificación y la categoría «asistido» son del simulador.',
    campos: [
      f('tipo', 'TipoExcepcion (17)', 'insumo'),
      f('categoria', 'automatico | asistido | humano', 'supuesto'),
      f('titulo · causa · impacto', 'string', 'simulado'),
      f('evidencia', 'string[]', 'simulado'),
      f('alternativas · recomendada', 'Alternativa[] · A | B | C | D', 'supuesto'),
      f('etapaOrigen · detectadaEn', 'EtapaFlujo · timestamp', 'insumo'),
      f('anticipacionMin', 'number · KPI', 'insumo'),
      f('politica', 'POL-XX-nn', 'supuesto'),
      f('resueltaPor · decisionHumana · decididoPor', 'agente | coordinador · AUTORIZAR | ALTERNATIVA | RECHAZAR | CANCELAR', 'supuesto'),
    ],
  },
  {
    name: 'Alternativa',
    icon: Route,
    desc: 'Opción que el agente propone con su impacto en costo, tiempo y SLA',
    color: '#4f46e5',
    origen: ['supuesto', 'simulado'],
    campos: [f('id', 'A | B | C | D', 'supuesto'), f('titulo · descripcion', 'string', 'simulado'), f('impactoCosto', 'COP (puede ser negativo)', 'simulado'), f('impactoHoras', 'horas', 'simulado'), f('impactoSLA', 'ninguno | bajo | medio | alto', 'supuesto'), f('reglas', 'Rnn · POL-XX-nn', 'supuesto'), f('efecto', 'continuar | volver(etapa) | cancelar', 'supuesto')],
  },
  {
    name: 'Traza',
    icon: FileText,
    desc: 'Rastro de cada decisión o acción automática',
    color: '#a16207',
    origen: ['supuesto'],
    nota: 'Equivale al historial cronológico del documento (P40); la cadena de seis eslabones es propia.',
    campos: [f('ejecutor', 'AgenteIA | Sistema | Coordinador', 'supuesto'), f('ocurrio', 'qué ocurrió', 'supuesto'), f('informacion', 'qué información utilizó', 'supuesto'), f('regla', 'qué regla aplicó', 'supuesto'), f('decidio · ejecuto · resultado', 'string', 'supuesto')],
  },
  {
    name: 'Evento',
    icon: Radar,
    desc: 'Hito registrado en la operación y en la bitácora',
    color: '#141b2d',
    origen: ['supuesto'],
    nota: 'El documento no nombra eventos; los 26 nombres son propios.',
    campos: [f('evento', 'NombreEvento (26)', 'supuesto'), f('timestamp', 'number', 'simulado'), f('detalle', 'string', 'simulado')],
  },
  {
    name: 'Soporte',
    icon: FileText,
    desc: 'Pieza del expediente de la operación',
    color: '#64748b',
    origen: ['insumo', 'simulado'],
    nota: 'Las grabaciones solo existen si están autorizadas (R30); sin autorización queda la transcripción.',
    campos: [f('tipo', 'solicitud | transcripcion | grabacion | documento | soporte_entrega | liquidacion', 'insumo'), f('autorizada', 'boolean (solo grabaciones)', 'insumo'), f('nombre · ts', 'string · timestamp', 'simulado')],
  },
  {
    name: 'Agente de IA',
    icon: Bot,
    desc: 'Tres agentes coordinados que comparten la misma información operativa',
    color: '#7c3aed',
    origen: ['insumo', 'supuesto'],
    nota: 'El reparto de etapas por agente es una lectura del documento, no una asignación expresa.',
    campos: [f('nombre', 'Agente de cliente | de negociación | de seguimiento', 'insumo'), f('etapas que conduce', 'EtapaFlujo[]', 'supuesto'), f('llamadas', 'Llamada[]', 'insumo'), f('excepciones que levanta', 'TipoExcepcion[]', 'supuesto')],
  },
]

const RELACIONES_ENTIDADES = [
  { a: 'Canal (4)', rel: 'origina →', b: 'Operación' },
  { a: 'Operación', rel: 'pertenece a →', b: 'Cliente (1)' },
  { a: 'Operación', rel: 'va de →', b: 'Nodo origen a Nodo destino' },
  { a: 'Operación', rel: 'moviliza →', b: 'Mercancía' },
  { a: 'Operación', rel: 'consolida →', b: 'Ofertas (3–4)' },
  { a: 'Oferta aceptada', rel: 'asigna →', b: 'Transportador (1)' },
  { a: 'Operación', rel: 'registra →', b: 'Llamadas (n)' },
  { a: 'Llamada', rel: 'la realiza →', b: 'Agente de IA' },
  { a: 'Llamada', rel: 'genera →', b: 'Compromiso' },
  { a: 'Operación', rel: 'levanta →', b: 'Excepción (0..1 abierta)' },
  { a: 'Excepción', rel: 'propone →', b: 'Alternativas A–D' },
  { a: 'Excepción asistida o humana', rel: 'escala a →', b: 'Mesa del coordinador' },
  { a: 'Decisión', rel: 'deja →', b: 'Traza + Evento' },
  { a: 'Expediente', rel: 'conserva →', b: 'Soportes y llamadas' },
]

function TabEntidades() {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-aion-muted max-w-3xl">
          La <b className="text-aion-ink">Operación</b> es la unidad de trabajo; el resto son sus partes. Cada campo indica si sale del insumo, es un supuesto de diseño o existe solo en la operación simulada (los valores concretos —clientes, tarifas, teléfonos— son siempre ficticios).
        </p>
        <LeyendaOrigen />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {ENTIDADES.map((e) => (
          <motion.div key={e.name} variants={itemVariants} className={cn('bg-white rounded-xl shadow-card border border-aion-line p-5', e.name === 'Operación' && 'xl:col-span-2')}>
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2.5 rounded-lg shrink-0" style={{ backgroundColor: `${e.color}15` }}>
                <e.icon className="w-5 h-5" style={{ color: e.color }} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold text-aion-ink">{e.name}</h4>
                  {e.origen.map((o) => (
                    <OrigenTag key={o} origen={o} />
                  ))}
                </div>
                <p className="text-[11.5px] text-aion-muted mt-0.5">{e.desc}</p>
              </div>
            </div>
            <ul className={cn('gap-x-4 gap-y-1.5', e.name === 'Operación' ? 'grid grid-cols-1 lg:grid-cols-2' : 'space-y-1.5')}>
              {e.campos.map((c) => (
                <li key={c.n} className="flex items-start gap-1.5 text-xs">
                  <span className={cn('w-1.5 h-1.5 rounded-full shrink-0 mt-1.5', ORIGEN_INFO[c.o].dot)} title={ORIGEN_INFO[c.o].label} />
                  <code className="text-[11px] bg-slate-50 px-1.5 py-0.5 rounded font-mono text-slate-700 shrink-0">{c.n}</code>
                  <span className="text-[11px] text-aion-muted leading-snug pt-0.5">{c.t}</span>
                </li>
              ))}
            </ul>
            {e.nota && <p className="text-[11px] text-aion-muted mt-3 pt-3 border-t border-slate-100">{e.nota}</p>}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Relaciones
// ---------------------------------------------------------------------------

const DECIDE: Record<CategoriaDecision, string> = {
  automatico: 'Agente de IA',
  asistido: 'Coordinador',
  humano: 'Responsable',
}

interface FilaExcepcion {
  tipo: TipoExcepcion
  nombre: string
  categoria: CategoriaDecision
  etapas: EtapaFlujo[]
  agente: string
  decide: string
  regla: string
  politica: string
  p: number
  nota?: string
}

const FILAS_EXCEPCION: FilaExcepcion[] = TIPOS_EXCEPCION.map((tipo) => {
  const pl = PLANTILLA_EXCEPCION[tipo]
  const def = EXCEPCIONES_LISTA.find((e) => e.tipo === tipo)
  return {
    tipo,
    nombre: pl.nombre,
    categoria: pl.categoriaBase,
    etapas: pl.etapas,
    agente: pl.agente,
    decide: DECIDE[pl.categoriaBase],
    regla: pl.regla,
    politica: pl.politica,
    p: def?.p ?? 0,
    nota: tipo === 'Sin_respuesta' ? 'Pasa a asistido al 3.er intento (R29)' : tipo === 'Seleccion_manual' ? 'Solo con la selección automática apagada (R09)' : undefined,
  }
}).sort((a, b) => ETAPAS_FLUJO.indexOf(a.etapas[0]) - ETAPAS_FLUJO.indexOf(b.etapas[0]))

type Marca = 'conduce' | 'decide' | 'participa'

const PARTICIPA_EN: Record<'cliente' | 'contacto' | 'destinatario' | 'transportador', EtapaFlujo[]> = {
  cliente: ['Solicitud', 'Validacion', 'Confirmacion', 'Preventiva', 'Presentacion', 'Cargue', 'Transito', 'ValidacionEntrega', 'LlamadaCierre'],
  contacto: ['Planeacion', 'Confirmacion', 'Preventiva', 'Presentacion', 'Transito'],
  destinatario: ['AvisoDestino', 'Descargue', 'ValidacionEntrega'],
  transportador: ['Negociacion', 'Asignacion', 'Confirmacion', 'Preventiva', 'Presentacion', 'Cargue', 'Transito', 'Descargue', 'ValidacionEntrega', 'CierreAdmin'],
}

const etapasDeCategoria = (cat: CategoriaDecision): Set<EtapaFlujo> =>
  new Set(
    TIPOS_EXCEPCION.filter((t) => PLANTILLA_EXCEPCION[t].categoriaBase === cat || (cat === 'asistido' && t === 'Sin_respuesta')).flatMap((t) => PLANTILLA_EXCEPCION[t].etapas),
  )

const ETAPAS_COORDINADOR = etapasDeCategoria('asistido')
const ETAPAS_RESPONSABLE = etapasDeCategoria('humano')

interface FilaRol {
  nombre: string
  nota: string
  fuente: 'lectura' | 'derivado'
  marca: (e: EtapaFlujo) => Marca | null
}

const nombreRol = (id: string) => ROLES.find((r) => r.id === id)?.nombre ?? id

const FILAS_ROL: FilaRol[] = [
  { nombre: nombreRol('cliente'), nota: 'Interlocutor de las llamadas al cliente', fuente: 'lectura', marca: (e) => (PARTICIPA_EN.cliente.includes(e) ? 'participa' : null) },
  { nombre: nombreRol('contacto'), nota: 'Valida cargue, acceso y horarios', fuente: 'lectura', marca: (e) => (PARTICIPA_EN.contacto.includes(e) ? 'participa' : null) },
  { nombre: nombreRol('destinatario'), nota: 'Recepción en destino', fuente: 'lectura', marca: (e) => (PARTICIPA_EN.destinatario.includes(e) ? 'participa' : null) },
  { nombre: nombreRol('transportador'), nota: 'Interlocutor de las llamadas al transportador', fuente: 'lectura', marca: (e) => (PARTICIPA_EN.transportador.includes(e) ? 'participa' : null) },
  { nombre: nombreRol('coordinador'), nota: 'Decide las novedades asistidas', fuente: 'derivado', marca: (e) => (ETAPAS_COORDINADOR.has(e) ? 'decide' : null) },
  { nombre: nombreRol('responsable'), nota: 'Autoriza tarifa, sobrecosto, cancelación', fuente: 'derivado', marca: (e) => (ETAPAS_RESPONSABLE.has(e) ? 'decide' : null) },
  ...AGENTES_IA.map(
    (a): FilaRol => ({ nombre: a, nota: 'Conduce la etapa', fuente: 'derivado', marca: (e) => (ETAPA_POR_ID[e].agente === a ? 'conduce' : null) }),
  ),
  { nombre: 'Plataforma (sistema)', nota: 'Etapas que ejecuta el sistema', fuente: 'derivado', marca: (e) => (ETAPA_POR_ID[e].agente === 'Sistema' ? 'conduce' : null) },
]

function TabRelaciones() {
  const [filtro, setFiltro] = useState<CategoriaDecision | 'todas'>('todas')
  const filas = filtro === 'todas' ? FILAS_EXCEPCION : FILAS_EXCEPCION.filter((x) => x.categoria === filtro)

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <p className="text-sm text-aion-muted max-w-4xl">
        La relación central del modelo es <b className="text-aion-ink">Novedad → Categoría de decisión → Agente que la levanta → Quién decide</b>. El insumo distingue informar de decidir (P43); la categoría intermedia «asistido» y el reparto por agente son lecturas del simulador.
      </p>

      <Panel
        titulo="Matriz novedad × categoría × agente × decisor"
        icono={Scale}
        derecha={
          <div className="flex items-center gap-1.5 flex-wrap">
            {(['todas', 'automatico', 'asistido', 'humano'] as const).map((c) => (
              <button
                key={c}
                onClick={() => setFiltro(c)}
                className={cn('px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors', filtro === c ? 'bg-aion-ink text-white border-aion-ink' : 'bg-white text-aion-muted border-aion-line hover:text-aion-ink')}
              >
                {c === 'todas' ? 'Todas (17)' : CATEGORIA_LABEL[c]}
              </button>
            ))}
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-aion-line text-aion-muted">
                <th className="text-left px-4 py-2.5 font-medium">Excepción o novedad</th>
                <th className="text-left px-3 py-2.5 font-medium">Etapas donde ocurre</th>
                <th className="text-center px-3 py-2.5 font-medium">Categoría</th>
                <th className="text-left px-3 py-2.5 font-medium">Agente que la levanta</th>
                <th className="text-left px-3 py-2.5 font-medium">Quién decide</th>
                <th className="text-left px-3 py-2.5 font-medium">Regla</th>
                <th className="text-left px-3 py-2.5 font-medium">Política</th>
              </tr>
            </thead>
            <tbody>
              {filas.map((r) => (
                <tr key={r.tipo} className="border-b border-slate-50 hover:bg-slate-50/60 align-top">
                  <td className="px-4 py-2.5 text-aion-ink">
                    <span className="font-medium">{r.nombre}</span>
                    {r.nota && <span className="block text-[10.5px] text-aion-muted mt-0.5">{r.nota}</span>}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {r.etapas.map((e) => (
                        <EtapaBadge key={e} etapa={e} />
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <CategoriaBadge categoria={r.categoria} />
                  </td>
                  <td className="px-3 py-2.5 text-aion-muted whitespace-nowrap">{r.agente}</td>
                  <td className="px-3 py-2.5 text-aion-ink font-medium whitespace-nowrap">{r.decide}</td>
                  <td className="px-3 py-2.5 font-mono text-[11px] text-aion-ink whitespace-nowrap">
                    {r.regla} <PBadge p={r.p} />
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[10.5px] text-aion-muted whitespace-nowrap">{r.politica}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="px-5 py-2.5 text-[11px] text-aion-muted border-t border-aion-line">
          La columna «Quién decide» sale de la categoría: <b>automático</b> lo gestiona el agente (informar, confirmar, solicitar actualización); <b>asistido</b> el agente registra y propone, y el coordinador decide en la Mesa; <b>humano</b> requiere al responsable (P43).
        </p>
      </Panel>

      <div className="bg-white rounded-xl shadow-card border border-aion-line p-5">
        <h4 className="font-semibold text-aion-ink mb-4 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-catC-dark" />
          De la novedad al decisor
        </h4>
        <div className="flex items-stretch gap-3 flex-wrap justify-center">
          {(['automatico', 'asistido', 'humano'] as CategoriaDecision[]).map((c, i) => (
            <span key={c} className="flex items-center gap-3">
              {i > 0 && <ArrowRight className="w-4 h-4 text-slate-300" />}
              <span className={cn('px-4 py-2.5 rounded-xl text-sm font-semibold border-2 text-center min-w-[200px]', c === 'automatico' ? 'border-catA/30 bg-catA-light text-catA-dark' : c === 'asistido' ? 'border-catC/30 bg-catC-light text-catC-dark' : 'border-catD/30 bg-catD-light text-catD-dark')}>
                {CATEGORIA_LABEL[c]} → {DECIDE[c]}
                <span className="block text-[10.5px] font-normal opacity-80 mt-0.5">{CATEGORIA_DEF[c].ejemplos}</span>
              </span>
            </span>
          ))}
        </div>
        <p className="text-xs text-aion-muted text-center mt-4">
          Cada paso hacia la derecha suma control humano. El interruptor «Selección automática» (R09) mueve la selección de proveedor entre la plataforma y el coordinador.
        </p>
      </div>

      <Panel titulo="Matriz roles × etapas del flujo" icono={Users} derecha={<span className="text-[11px] text-aion-muted">● conduce / participa · ◆ decide</span>}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-aion-line">
                <th className="text-left px-4 py-2 font-medium text-aion-muted min-w-[210px]">Rol o actor</th>
                {ETAPAS_FLUJO.map((e) => (
                  <th key={e} className="px-1 py-2 text-center" title={ETAPA_LABEL[e]}>
                    <span className="inline-flex w-6 h-6 rounded-full items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: BLOQUE_COLOR[ETAPA_BLOQUE[e]].color }}>
                      {ETAPA_NUMERO[e]}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FILAS_ROL.map((r) => (
                <tr key={r.nombre} className="border-b border-slate-50 hover:bg-slate-50/60">
                  <td className="px-4 py-2">
                    <span className="font-medium text-aion-ink">{r.nombre}</span>
                    <span className="block text-[10.5px] text-aion-muted">
                      {r.nota} · {r.fuente === 'lectura' ? 'lectura de diseño' : 'derivado de las plantillas'}
                    </span>
                  </td>
                  {ETAPAS_FLUJO.map((e) => {
                    const m = r.marca(e)
                    return (
                      <td key={e} className="px-1 py-2 text-center text-[13px]">
                        {m === 'decide' ? <span className="text-catC-dark">◆</span> : m ? <span style={{ color: BLOQUE_COLOR[ETAPA_BLOQUE[e]].color }}>●</span> : <span className="text-slate-200">·</span>}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-aion-line flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-aion-muted">
          {FLUJO_ETAPAS.map((e) => (
            <span key={e.id}>
              <b className="text-aion-ink">{e.numero}</b> {e.corto}
            </span>
          ))}
        </div>
      </Panel>

      <div className="bg-captura-light/60 rounded-xl p-5 border border-captura/15">
        <h4 className="font-semibold text-aion-ink mb-3">Relaciones entre entidades</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
          {RELACIONES_ENTIDADES.map((r, i) => (
            <motion.div key={i} variants={itemVariants} className="bg-white rounded-lg p-3 text-center border border-aion-line">
              <span className="font-mono text-[11px] text-captura font-semibold block">{r.a}</span>
              <span className="block text-[10.5px] text-aion-muted my-0.5">{r.rel}</span>
              <span className="font-mono text-[11px] text-aion-ink font-semibold block">{r.b}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Taxonomías
// ---------------------------------------------------------------------------

const OBJETIVOS: Record<ObjetivoLlamada, { etapa: EtapaFlujo | null; interlocutor: string; agente: string }> = {
  'Recibir solicitud': { etapa: 'Solicitud', interlocutor: 'cliente', agente: 'Agente de cliente' },
  'Completar datos': { etapa: 'Validacion', interlocutor: 'cliente', agente: 'Agente de cliente' },
  'Confirmar condiciones de cargue': { etapa: 'Planeacion', interlocutor: 'cliente', agente: 'Agente de cliente' },
  'Negociar tarifa': { etapa: 'Negociacion', interlocutor: 'transportador', agente: 'Agente de negociación' },
  'Informar asignación': { etapa: 'Confirmacion', interlocutor: 'cliente', agente: 'Agente de cliente' },
  'Confirmar con transportador': { etapa: 'Confirmacion', interlocutor: 'transportador', agente: 'Agente de seguimiento' },
  'Llamada preventiva': { etapa: 'Preventiva', interlocutor: 'ambas partes', agente: 'Agente de seguimiento' },
  'Validar presentación': { etapa: 'Presentacion', interlocutor: 'ambas partes', agente: 'Agente de seguimiento' },
  'Confirmar despacho': { etapa: 'Cargue', interlocutor: 'cliente', agente: 'Agente de seguimiento' },
  'Seguimiento en ruta': { etapa: 'Transito', interlocutor: 'transportador', agente: 'Agente de seguimiento' },
  'Informar novedad': { etapa: null, interlocutor: 'cliente o transportador', agente: 'según la novedad' },
  'Consulta de estado': { etapa: 'Transito', interlocutor: 'cliente (entrante)', agente: 'Agente de cliente' },
  'Preparar recepción': { etapa: 'AvisoDestino', interlocutor: 'destinatario', agente: 'Agente de cliente' },
  'Confirmar recepción': { etapa: 'Descargue', interlocutor: 'destinatario', agente: 'Agente de seguimiento' },
  'Validar entrega': { etapa: 'ValidacionEntrega', interlocutor: 'cliente', agente: 'Agente de cliente' },
  'Cierre y satisfacción': { etapa: 'LlamadaCierre', interlocutor: 'cliente', agente: 'Agente de cliente' },
}

const RESULTADOS: Record<ResultadoLlamada, { desc: string; clase: string }> = {
  exitosa: { desc: 'El interlocutor respondió y se logró el objetivo; cuenta para «llamadas exitosas».', clase: 'bg-success-light text-success' },
  sin_respuesta: { desc: 'No contestó: se registra el intento y se reprograma (R29).', clase: 'bg-catC-light text-catC-dark' },
  reprogramada: { desc: 'Contacto diferido, p. ej. el conductor va manejando (R18).', clase: 'bg-catA-light text-catA-dark' },
  con_novedad: { desc: 'Se logró contacto pero reveló una novedad que debe gestionarse.', clase: 'bg-catD-light text-catD-dark' },
}

const ESTADOS_OFERTA: Record<EstadoOferta, { desc: string; clase: string }> = {
  aceptada_preliminar: { desc: 'El transportador aceptó el viaje; falta cerrar la tarifa.', clase: 'bg-captura-light text-captura-dark' },
  contraoferta_ok: { desc: 'Tarifa acordada dentro del tope autorizado.', clase: 'bg-success-light text-success' },
  sobre_tope: { desc: 'Pide más que el máximo autorizado: el agente no compromete y escala (R07).', clase: 'bg-catD-light text-catD-dark' },
  sin_interes: { desc: 'El candidato no toma el servicio.', clase: 'bg-catA-light text-catA-dark' },
}

const VEHICULOS: TipoVehiculo[] = ['Camioneta NHR', 'Turbo', 'Sencillo', 'Doble troque', 'Tractomula']

const EVENTOS: Record<NombreEvento, { donde: string; bloque: BloqueFlujo }> = {
  SolicitudRecibida: { donde: 'Entra una solicitud por cualquier canal', bloque: 'Solicitud' },
  SolicitudValidada: { donde: 'Validación completa', bloque: 'Solicitud' },
  DatosSolicitados: { donde: 'Datos incompletos: gestión posterior al cliente', bloque: 'Novedad' },
  OperacionRegistrada: { donde: 'Planeación: identificador único asignado', bloque: 'Solicitud' },
  TransportadoresPreseleccionados: { donde: 'Búsqueda: candidatos compatibles', bloque: 'Consecucion' },
  NegociacionIniciada: { donde: 'Llamadas de negociación', bloque: 'Consecucion' },
  AceptacionPreliminar: { donde: 'Aceptaciones dentro del tope', bloque: 'Consecucion' },
  TarifaEscalada: { donde: 'Tarifa sobre el tope llega al coordinador', bloque: 'Novedad' },
  TransportadorSeleccionado: { donde: 'Selección automática o del coordinador', bloque: 'Consecucion' },
  DocumentosValidados: { donde: 'Documentos del vehículo y del conductor', bloque: 'Consecucion' },
  AsignacionConfirmada: { donde: 'Asignación formalizada', bloque: 'Consecucion' },
  ConfirmacionDoble: { donde: 'Cliente y transportador con la misma información', bloque: 'Cargue' },
  LlamadaPreventiva: { donde: 'Preventivas a ambas partes', bloque: 'Cargue' },
  NovedadRegistrada: { donde: 'Cualquier otra excepción detectada', bloque: 'Novedad' },
  LlegadaOrigenConfirmada: { donde: 'Validación cruzada en origen', bloque: 'Cargue' },
  CargueFinalizado: { donde: 'Fin del cargue', bloque: 'Cargue' },
  DespachoConfirmado: { donde: 'Hora real de salida confirmada', bloque: 'Cargue' },
  SeguimientoRegistrado: { donde: 'Monitoreo en tránsito y aviso de destino', bloque: 'Transito' },
  LlegadaDestinoConfirmada: { donde: 'Llegada y descargue', bloque: 'Transito' },
  EntregaConfirmada: { donde: 'Transportador y cliente coinciden', bloque: 'Transito' },
  LlamadaCierre: { donde: 'Satisfacción y observaciones', bloque: 'Cierre' },
  CasoSeguimientoCreado: { donde: 'Inconformidad convertida en caso (R24)', bloque: 'Novedad' },
  DecisionCoordinador: { donde: 'La decisión humana vuelve al proceso', bloque: 'Novedad' },
  OperacionCerrada: { donde: 'Cierre administrativo', bloque: 'Cierre' },
  OperacionCancelada: { donde: 'Cancelación con causa registrada', bloque: 'Novedad' },
  Sistema: { donde: 'Mensajes de la bitácora del sistema', bloque: 'Novedad' },
}

function Chips({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-1.5">{children}</div>
}

function TabTaxonomias() {
  const secciones: { titulo: string; origen: Origen[]; render: () => React.ReactNode }[] = [
    {
      titulo: 'Canales de entrada (4)',
      origen: ['insumo'],
      render: () => (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {CANALES_DEF.map((c) => (
              <div key={c.id} className="rounded-lg p-3 border border-aion-line">
                <p className="text-xs font-semibold flex items-center gap-2" style={{ color: CANAL_INFO[c.id].color }}>
                  {c.nombre} <PBadge p={c.p} />
                </p>
                <p className="text-[11px] text-aion-muted mt-1">{c.descripcion}</p>
              </div>
            ))}
          </div>
          <div>
            <p className="text-[11px] font-semibold text-aion-ink mb-1.5">Datos mínimos de la solicitud (9) <PBadge p={3} /></p>
            <Chips>
              {DATOS_MINIMOS.map((d) => (
                <span key={d} className="px-2.5 py-1 text-xs rounded-full bg-captura-light text-captura-dark font-medium">
                  {d}
                </span>
              ))}
            </Chips>
          </div>
        </div>
      ),
    },
    {
      titulo: 'Etapas y bloques',
      origen: ['insumo', 'supuesto'],
      render: () => (
        <div className="space-y-3">
          {BLOQUES.map((b) => {
            const etapas = FLUJO_ETAPAS.filter((e) => e.bloque === b.id)
            return (
              <div key={b.id} className="flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-3">
                <span className="text-xs font-semibold sm:min-w-[210px] pt-1" style={{ color: b.color }}>
                  {b.nombre}
                </span>
                <Chips>
                  {etapas.map((e) => (
                    <span key={e.id} className="px-2.5 py-1 text-xs rounded-full font-medium" style={{ backgroundColor: b.colorBg, color: b.color }} title={`${e.nombre} · ${e.agente}`}>
                      [{e.numero}] {e.nombre}
                    </span>
                  ))}
                  {b.id === 'Novedad' &&
                    (['EsperaDatos', 'Escalada', 'Cancelada'] as EtapaOperacion[]).map((e) => (
                      <span key={e} className="px-2.5 py-1 text-xs rounded-full font-medium" style={{ backgroundColor: b.colorBg, color: b.color }}>
                        {ETAPA_LABEL[e]}
                      </span>
                    ))}
                  {b.id === 'Cierre' && (
                    <span className="px-2.5 py-1 text-xs rounded-full font-medium" style={{ backgroundColor: b.colorBg, color: b.color }}>
                      Cerrada
                    </span>
                  )}
                </Chips>
              </div>
            )
          })}
          <p className="text-[11px] text-aion-muted">Las 17 etapas salen del documento; la agrupación en bloques de color y los estados EsperaDatos, Escalada y Cancelada son del simulador.</p>
        </div>
      ),
    },
    {
      titulo: 'Categorías de decisión (3)',
      origen: ['insumo', 'supuesto'],
      render: () => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(['automatico', 'asistido', 'humano'] as CategoriaDecision[]).map((c) => {
            const d = CATEGORIA_DEF[c]
            return (
              <div key={c} className="border border-aion-line rounded-lg p-3.5 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <CategoriaBadge categoria={c} />
                  <PBadge p={d.p} />
                  {d.supuesto && <SupuestoTag />}
                </div>
                <p className="text-xs font-semibold text-aion-ink">{d.nombre}</p>
                <p className="text-[11px] text-aion-muted">{d.descripcion}</p>
                <p className="text-[11px] text-aion-muted">
                  <b className="text-aion-ink">Decide:</b> {DECIDE[c]}
                </p>
              </div>
            )
          })}
        </div>
      ),
    },
    {
      titulo: 'Tipos de excepción o novedad (17)',
      origen: ['insumo', 'supuesto'],
      render: () => (
        <div className="space-y-3">
          {(['automatico', 'asistido', 'humano'] as CategoriaDecision[]).map((c) => (
            <div key={c} className="flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-3">
              <span className="sm:min-w-[210px] pt-0.5">
                <CategoriaBadge categoria={c} />
              </span>
              <Chips>
                {FILAS_EXCEPCION.filter((x) => x.categoria === c).map((x) => (
                  <span key={x.tipo} className="px-2.5 py-1 text-xs rounded-full font-medium bg-slate-100 text-aion-ink" title={x.tipo}>
                    {x.nombre} <span className="font-mono text-[10px] text-aion-muted">{x.regla}</span>
                  </span>
                ))}
              </Chips>
            </div>
          ))}
        </div>
      ),
    },
    {
      titulo: 'Nombres de evento (26)',
      origen: ['supuesto'],
      render: () => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-1.5">
          {(Object.keys(EVENTOS) as NombreEvento[]).map((n) => {
            const b = BLOQUES.find((x) => x.id === EVENTOS[n].bloque)
            return (
              <div key={n} className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: b?.color }} />
                <span className="font-mono font-semibold text-aion-ink w-[210px] shrink-0">{n}</span>
                <span className="text-aion-muted">{EVENTOS[n].donde}</span>
              </div>
            )
          })}
        </div>
      ),
    },
    {
      titulo: 'Objetivos de llamada (16)',
      origen: ['insumo', 'supuesto'],
      render: () => (
        <div className="overflow-x-auto -mx-5 -my-5">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-aion-line text-aion-muted">
                <th className="text-left px-5 py-2 font-medium">Objetivo</th>
                <th className="text-left px-3 py-2 font-medium">Etapa</th>
                <th className="text-left px-3 py-2 font-medium">Interlocutor</th>
                <th className="text-left px-3 py-2 font-medium">Agente</th>
              </tr>
            </thead>
            <tbody>
              {(Object.keys(OBJETIVOS) as ObjetivoLlamada[]).map((o) => (
                <tr key={o} className="border-b border-slate-50">
                  <td className="px-5 py-1.5 font-medium text-aion-ink">{o}</td>
                  <td className="px-3 py-1.5">{OBJETIVOS[o].etapa ? <EtapaBadge etapa={OBJETIVOS[o].etapa} /> : <span className="text-aion-muted">cualquiera</span>}</td>
                  <td className="px-3 py-1.5 text-aion-muted">{OBJETIVOS[o].interlocutor}</td>
                  <td className="px-3 py-1.5 text-aion-muted">{OBJETIVOS[o].agente}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ),
    },
    {
      titulo: 'Resultados de llamada (4) y estados de oferta (4)',
      origen: ['supuesto'],
      render: () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            {(Object.keys(RESULTADOS) as ResultadoLlamada[]).map((r) => (
              <div key={r} className="flex items-start gap-2.5">
                <span className={cn('badge-compact font-mono shrink-0', RESULTADOS[r].clase)}>{r}</span>
                <span className="text-[11px] text-aion-muted">{RESULTADOS[r].desc}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {(Object.keys(ESTADOS_OFERTA) as EstadoOferta[]).map((r) => (
              <div key={r} className="flex items-start gap-2.5">
                <span className={cn('badge-compact font-mono shrink-0', ESTADOS_OFERTA[r].clase)}>{r}</span>
                <span className="text-[11px] text-aion-muted">{ESTADOS_OFERTA[r].desc}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      titulo: 'Tipos de vehículo (5)',
      origen: ['insumo', 'simulado'],
      render: () => (
        <div className="space-y-2">
          <Chips>
            {VEHICULOS.map((v) => (
              <span key={v} className="px-2.5 py-1 text-xs rounded-full font-medium bg-comunicacion-light text-comunicacion-dark">
                {v} · {TRANSPORTADORES.filter((t) => t.flota.includes(v)).length} transportadores
              </span>
            ))}
          </Chips>
          <p className="text-[11px] text-aion-muted">El documento pide «características del vehículo» (P3); la lista de tipos y su relación con el peso son parámetros de ejemplo.</p>
        </div>
      ),
    },
    {
      titulo: 'Estados de fin y de espera',
      origen: ['insumo', 'supuesto'],
      render: () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ESTADOS_FIN.map((s) => (
            <div key={s.id} className="border border-aion-line rounded-lg p-3">
              <div className="flex items-center gap-2 flex-wrap">
                <EtapaBadge etapa={s.id} />
                <PBadge p={s.p} />
                {s.supuesto && <SupuestoTag />}
              </div>
              <p className="text-[11px] text-aion-muted mt-2">{s.descripcion}</p>
            </div>
          ))}
          <div className="border border-aion-line rounded-lg p-3">
            <div className="flex items-center gap-2"><EtapaBadge etapa="EsperaDatos" /><SupuestoTag /></div>
            <p className="text-[11px] text-aion-muted mt-2">La operación espera que el cliente complete datos; el agente programa una gestión posterior (R02).</p>
          </div>
          <div className="border border-aion-line rounded-lg p-3">
            <div className="flex items-center gap-2"><EtapaBadge etapa="Escalada" /><SupuestoTag /></div>
            <p className="text-[11px] text-aion-muted mt-2">La operación espera una decisión del coordinador o del responsable en la Mesa del coordinador.</p>
          </div>
        </div>
      ),
    },
  ]

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-5">
      {secciones.map((s) => (
        <motion.div key={s.titulo} variants={itemVariants}>
          <Panel
            titulo={s.titulo}
            derecha={
              <span className="flex items-center gap-1.5">
                {s.origen.map((o) => (
                  <OrigenTag key={o} origen={o} />
                ))}
              </span>
            }
          >
            <div className="p-5">{s.render()}</div>
          </Panel>
        </motion.div>
      ))}
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Máquina de estados
// ---------------------------------------------------------------------------

function CajaEstado({ etapa }: { etapa: EtapaFlujo }) {
  const b = BLOQUE_COLOR[ETAPA_BLOQUE[etapa]]
  const agente = ETAPA_POR_ID[etapa].agente.replace('Agente de ', 'IA · ')
  return (
    <div className="flex flex-col items-center px-3 py-2.5 rounded-xl border-2 min-w-[108px]" style={{ borderColor: `${b.color}55`, backgroundColor: b.bg }}>
      <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white mb-1" style={{ backgroundColor: b.color }}>
        {ETAPA_NUMERO[etapa]}
      </span>
      <span className="text-[11px] font-semibold text-aion-ink text-center leading-tight">{ETAPA_LABEL_CORTO[etapa]}</span>
      <span className="text-[10px] mt-0.5" style={{ color: b.color }}>
        {agente}
      </span>
    </div>
  )
}

function Conector({ color = '#cbd5e1' }: { color?: string }) {
  return (
    <div className="flex items-center">
      <div className="w-5 h-0.5" style={{ backgroundColor: color }} />
      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
    </div>
  )
}

function Fila({ etapas }: { etapas: EtapaFlujo[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2 min-w-max">
      {etapas.map((e, i) => (
        <div key={e} className="flex items-center gap-2">
          {i > 0 && <Conector />}
          <CajaEstado etapa={e} />
        </div>
      ))}
    </div>
  )
}

type Paso = { k: 'e'; e: EtapaOperacion } | { k: 't'; t: string; clase?: string }
const e_ = (e: EtapaOperacion): Paso => ({ k: 'e', e })
const t_ = (t: string, clase?: string): Paso => ({ k: 't', t, clase })

interface Bifurcacion {
  titulo: string
  regla: string
  pasos: Paso[]
  nota: string
}

const BIFURCACIONES: Bifurcacion[] = [
  {
    titulo: 'Datos incompletos',
    regla: 'R01 · R02',
    pasos: [e_('Validacion'), t_('datos incompletos', 'bg-catA-light text-catA-dark'), e_('EsperaDatos'), t_('llamada completa los datos', 'bg-catA-light text-catA-dark'), e_('Validacion'), e_('Planeacion')],
    nota: 'El agente registra lo confirmado y programa una gestión posterior. La etapa de retorno es Validación; al completar, se da por cumplida y sigue Planeación.',
  },
  {
    titulo: 'Tarifa sobre el tope',
    regla: 'R07 · R08',
    pasos: [e_('Negociacion'), t_('tarifa > tope', 'bg-catD-light text-catD-dark'), e_('Escalada'), t_('autoriza (B, C)', 'bg-success-light text-success'), e_('Seleccion')],
    nota: 'El agente no compromete valores adicionales. Si el responsable mantiene el tope (A) o rechaza, se descarta al candidato y la operación vuelve a Búsqueda.',
  },
  {
    titulo: 'Sin transportador',
    regla: 'R08 · R28',
    pasos: [e_('Busqueda'), t_('sin vehículo o mercado alto', 'bg-catD-light text-catD-dark'), e_('Escalada'), t_('cancelar o rechazar', 'bg-catD-light text-catD-dark'), e_('Cancelada')],
    nota: 'Otras salidas: consultar flexibilidad de fecha o cambiar el vehículo (vuelve a Búsqueda) o autorizar la tarifa de mercado (vuelve a Negociación).',
  },
  {
    titulo: 'Mercancía no lista',
    regla: 'R13 · R14',
    pasos: [e_('Preventiva'), t_('mercancía no estará lista', 'bg-catC-light text-catC-dark'), e_('Escalada'), t_('autoriza reprogramar', 'bg-success-light text-success'), e_('Confirmacion')],
    nota: 'Solo se comunica al transportador una reprogramación autorizada. Si se rechaza la propuesta, la operación continúa y la novedad queda registrada.',
  },
  {
    titulo: 'Contacto no exitoso',
    regla: 'R29',
    pasos: [e_('Transito'), t_('intento 1 y 2: reintenta el agente', 'bg-catA-light text-catA-dark'), e_('Transito'), t_('3.er intento', 'bg-catC-light text-catC-dark'), e_('Escalada')],
    nota: 'Mientras el contacto no afecte el servicio lo gestiona el agente; al tercer intento se alerta al coordinador.',
  },
  {
    titulo: 'Entrega no coincide',
    regla: 'R23',
    pasos: [e_('ValidacionEntrega'), t_('informada ≠ confirmada', 'bg-catC-light text-catC-dark'), e_('Escalada'), t_('revisa hechos y evidencias', 'bg-success-light text-success'), e_('LlamadaCierre')],
    nota: 'El sistema no cierra automáticamente: genera la novedad para que el coordinador revise.',
  },
  {
    titulo: 'Inconformidad y sobrecosto',
    regla: 'R24 · R25',
    pasos: [e_('LlamadaCierre'), t_('inconformidad → caso de seguimiento', 'bg-catC-light text-catC-dark'), e_('Escalada'), e_('CierreAdmin'), t_('costos sin autorizar', 'bg-catD-light text-catD-dark'), e_('Escalada'), e_('Cerrada')],
    nota: 'La inconformidad nunca queda como comentario; el cierre administrativo solo ocurre tras validar costos adicionales.',
  },
]

function PasoChip({ p }: { p: Paso }) {
  if (p.k === 'e') return <EtapaBadge etapa={p.e} />
  return <span className={cn('badge-compact font-medium', p.clase ?? 'bg-slate-100 text-slate-600')}>{p.t}</span>
}

interface Salida {
  etiqueta: string
  ids: string
  clase: string
}
interface TransicionDerivada {
  tipo: TipoExcepcion
  nombre: string
  categoria: CategoriaDecision
  etapas: EtapaFlujo[]
  salidas: Salida[]
  rechazo: Salida
}

function describirEfecto(e: EfectoAlternativa): { etiqueta: string; clase: string; key: string } {
  if (e.tipo === 'continuar') return { etiqueta: 'Continúa a la siguiente etapa', clase: 'bg-success-light text-success', key: 'c' }
  if (e.tipo === 'cancelar') return { etiqueta: 'Cancelada', clase: 'bg-catD-light text-catD-dark', key: 'x' }
  return { etiqueta: `Vuelve a ${ETAPA_LABEL_CORTO[e.etapa]}`, clase: 'bg-captura-light text-captura-dark', key: `v-${e.etapa}` }
}

/** Construye una operación de ejemplo determinista y lee de cada plantilla los efectos de sus alternativas. */
function derivarTransiciones(): TransicionDerivada[] {
  const rng = crearRng(2026)
  const op = generarOperacion(1_760_000_000_000, rng, 0)
  op.ofertas = construirOfertas(op, rng)
  op.transportador = TRANSPORTADORES.find((t) => t.flota.includes(op.vehiculoRequerido)) ?? TRANSPORTADORES[0]
  return TIPOS_EXCEPCION.map((tipo) => {
    const pl = PLANTILLA_EXCEPCION[tipo]
    let alternativas: Alternativa[] = []
    try {
      alternativas = pl.construir(op, rng).alternativas
    } catch {
      alternativas = []
    }
    const grupos = new Map<string, Salida>()
    for (const a of alternativas) {
      const d = describirEfecto(a.efecto)
      const g = grupos.get(d.key)
      if (g) g.ids += `, ${a.id}`
      else grupos.set(d.key, { etiqueta: d.etiqueta, ids: a.id, clase: d.clase })
    }
    const r = describirEfecto(pl.rechazo)
    return {
      tipo,
      nombre: pl.nombre,
      categoria: pl.categoriaBase,
      etapas: pl.etapas,
      salidas: [...grupos.values()],
      rechazo: { etiqueta: r.etiqueta, ids: 'rechazo', clase: r.clase },
    }
  }).sort((a, b) => ETAPAS_FLUJO.indexOf(a.etapas[0]) - ETAPAS_FLUJO.indexOf(b.etapas[0]))
}

function TabMaquinaEstados() {
  const transiciones = useMemo(() => derivarTransiciones(), [])
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-5">
      <p className="text-sm text-aion-muted max-w-4xl">
        El ciclo de vida de una operación es una máquina de estados: <b className="text-aion-ink">17 etapas</b> en línea, dos estados de espera (<b>EsperaDatos</b>, <b>Escalada</b>) y dos de fin (<b>Cerrada</b>, <b>Cancelada</b>). Las 17 etapas salen del documento; las esperas y la cancelación son del simulador.
      </p>

      <div className="bg-white rounded-xl shadow-card border border-aion-line p-6 overflow-x-auto space-y-4">
        <Fila etapas={ETAPAS_FLUJO.slice(0, 7)} />
        <div className="flex items-center gap-2 text-[11px] text-aion-muted"><ArrowRight className="w-3.5 h-3.5" /> continúa abajo</div>
        <Fila etapas={ETAPAS_FLUJO.slice(7, 13)} />
        <div className="flex items-center gap-2 text-[11px] text-aion-muted"><ArrowRight className="w-3.5 h-3.5" /> continúa abajo</div>
        <div className="flex flex-wrap items-center gap-2 min-w-max">
          <Fila etapas={ETAPAS_FLUJO.slice(13)} />
          <Conector color="#059669" />
          <div className="flex flex-col items-center px-3.5 py-2.5 rounded-xl border-2 border-success/40 bg-success-light min-w-[108px]">
            <span className="w-6 h-6 rounded-full bg-success flex items-center justify-center text-white mb-1"><ShieldCheck className="w-3.5 h-3.5" /></span>
            <span className="text-[11px] font-semibold text-aion-ink">Cerrada</span>
            <span className="text-[10px] text-success mt-0.5">fin</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 pt-2 border-t border-slate-100">
          {BLOQUES.slice(0, 5).map((b) => (
            <span key={b.id} className="inline-flex items-center gap-1.5 text-[11px] text-aion-muted">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: b.color }} />
              {b.nombre}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
          <Hourglass className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-slate-700">EsperaDatos</p>
            <p className="text-xs text-aion-muted mt-1">Entra solo desde Validación cuando faltan datos. Un nuevo contacto la resuelve (o reintenta si no contestan) y la operación sigue a Planeación.</p>
          </div>
        </div>
        <div className="bg-catC-light border border-catC/25 rounded-xl p-4 flex items-start gap-3">
          <UserCheck className="w-5 h-5 text-catC-dark shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-catC-dark">Escalada</p>
            <p className="text-xs text-aion-muted mt-1">Entra desde cualquier etapa con una novedad asistida o humana. Espera la decisión en la Mesa del coordinador; la decisión vuelve como evento y la etapa continúa, retrocede o se cancela.</p>
          </div>
        </div>
        <div className="bg-catD-light border border-catD/25 rounded-xl p-4 flex items-start gap-3">
          <CircleX className="w-5 h-5 text-catD-dark shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-catD-dark">Cancelada</p>
            <p className="text-xs text-aion-muted mt-1">Se alcanza solo por decisión del responsable (R28); registra la causa. Estado final supuesto: el documento solo nombra «cancelar un servicio».</p>
          </div>
        </div>
      </div>

      <Panel titulo="Bifurcaciones principales" icono={GitBranch}>
        <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {BIFURCACIONES.map((b) => (
            <div key={b.titulo} className="border border-aion-line rounded-lg p-4 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-aion-ink">{b.titulo}</p>
                <span className="font-mono text-[10.5px] text-aion-muted">{b.regla}</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {b.pasos.map((p, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5">
                    {i > 0 && <ChevronRight className="w-3 h-3 text-slate-300" />}
                    <PasoChip p={p} />
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-aion-muted">{b.nota}</p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel titulo="Tabla de transiciones derivada de las plantillas de excepción" icono={Route} derecha={<span className="text-[11px] text-aion-muted">efectos leídos de una operación de ejemplo</span>}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-aion-line text-aion-muted">
                <th className="text-left px-4 py-2.5 font-medium">Novedad</th>
                <th className="text-left px-3 py-2.5 font-medium">Desde</th>
                <th className="text-left px-3 py-2.5 font-medium">Vía</th>
                <th className="text-left px-3 py-2.5 font-medium">Destinos según la alternativa elegida</th>
                <th className="text-left px-3 py-2.5 font-medium">Si se rechaza la propuesta</th>
              </tr>
            </thead>
            <tbody>
              {transiciones.map((t) => (
                <tr key={t.tipo} className="border-b border-slate-50 align-top hover:bg-slate-50/60">
                  <td className="px-4 py-2.5 text-aion-ink font-medium">{t.nombre}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {t.etapas.map((e) => (
                        <EtapaBadge key={e} etapa={e} />
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    {t.categoria === 'automatico' ? (
                      <span className="text-aion-muted">Agente resuelve{t.tipo === 'Datos_incompletos' ? ' → EsperaDatos' : ''}</span>
                    ) : (
                      <span className="text-aion-ink">→ Escalada <CategoriaBadge categoria={t.categoria} /></span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {t.salidas.map((s) => (
                        <span key={s.etiqueta} className={cn('badge-compact font-medium', s.clase)}>
                          {s.ids} · {s.etiqueta}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={cn('badge-compact font-medium', t.rechazo.clase)}>{t.rechazo.etiqueta}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="px-5 py-2.5 text-[11px] text-aion-muted border-t border-aion-line">
          Letras A–D = alternativas que el agente propone (supuesto). «Continúa» completa la etapa de origen y avanza a la siguiente; «Vuelve» reabre una etapa anterior (por ejemplo, Búsqueda descarta las ofertas); «Cancelada» exige causa. Decisiones posibles de la persona: autorizar, elegir otra alternativa, rechazar o cancelar.
        </p>
      </Panel>

      <div className="bg-aion-ink rounded-xl p-4 flex items-center gap-3">
        <Radar className="w-5 h-5 text-aion-accent shrink-0" />
        <p className="text-xs text-white/85">
          <b className="text-aion-accent">Cada transición deja evento y traza.</b> Los nombres de evento son un supuesto de diseño; el documento exige un historial cronológico que permita reconstruir lo ocurrido (P40).
        </p>
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Reglas de negocio
// ---------------------------------------------------------------------------

const POLITICAS_AGRUPADAS = (() => {
  const m = new Map<string, { politica: string; reglas: string[]; temas: Set<string> }>()
  for (const r of REGLAS) {
    const g = m.get(r.politica) ?? { politica: r.politica, reglas: [], temas: new Set<string>() }
    g.reglas.push(r.id)
    g.temas.add(r.tema)
    m.set(r.politica, g)
  }
  return [...m.values()].sort((a, b) => a.politica.localeCompare(b.politica))
})()

const CADENA_TRAZA = ['Qué ocurrió', 'Información utilizada', 'Regla aplicada', 'Qué decidió', 'Qué ejecutó', 'Resultado']

function TabReglas() {
  const [q, setQ] = useState('')
  const termino = q.trim().toLowerCase()
  const reglas = termino
    ? REGLAS.filter((r) => `${r.id} ${r.politica} ${r.tema} ${r.texto}`.toLowerCase().includes(termino))
    : REGLAS

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-aion-muted max-w-3xl">
          Las {REGLAS.length} reglas son frases del documento con su párrafo de origen; los códigos <span className="font-mono">Rnn</span> y <span className="font-mono">POL-XX-nn</span> son propios del simulador.
        </p>
        <label className="relative">
          <Search className="w-3.5 h-3.5 text-aion-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar regla, política o tema"
            className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-aion-line bg-white w-64 focus:outline-none focus:border-captura"
          />
        </label>
      </div>

      <div className="space-y-3">
        {reglas.map((r) => (
          <motion.div key={r.id} variants={itemVariants} className="bg-white rounded-xl shadow-card border border-aion-line p-4">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-captura-light shrink-0 h-fit font-mono text-xs font-bold text-captura min-w-[44px] text-center">{r.id}</div>
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-aion-ink">{r.tema}</span>
                  <span className="font-mono text-[10.5px] px-1.5 py-0.5 rounded bg-slate-100 text-aion-ink">{r.politica}</span>
                  <PBadge p={r.p} />
                  {r.etapas.length === 0 ? (
                    <span className="badge-compact bg-slate-100 text-slate-600 border border-slate-200">transversal</span>
                  ) : (
                    r.etapas.map((e) => <EtapaBadge key={e} etapa={e} />)
                  )}
                </div>
                <p className="text-xs text-aion-muted">{r.texto}</p>
                <details className="group">
                  <summary className="text-[11px] text-captura cursor-pointer select-none">Párrafo de origen (P{r.p})</summary>
                  <p className="mt-2 text-[11.5px] text-aion-muted leading-relaxed bg-slate-50 border border-slate-100 rounded-lg p-3">{P(r.p)}</p>
                </details>
              </div>
            </div>
          </motion.div>
        ))}
        {reglas.length === 0 && <p className="text-sm text-aion-muted text-center py-6">Ninguna regla coincide con la búsqueda.</p>}
      </div>

      <Panel
        titulo="Guardrails parametrizados"
        icono={ShieldCheck}
        derecha={<SupuestoTag />}
      >
        <p className="px-5 py-2.5 text-[11px] text-aion-muted border-b border-slate-50">El documento habla de «parámetros establecidos» sin dar cifras; los valores de abajo son ejemplos del simulador.</p>
        <div className="divide-y divide-slate-50">
          {GUARDRAILS.map((g) => (
            <div key={g.id} className="px-5 py-3 flex flex-col lg:flex-row lg:items-start gap-1 lg:gap-4">
              <span className="text-sm font-bold text-aion-ink lg:min-w-[270px] shrink-0">{g.nombre}</span>
              <span className="text-sm text-aion-ink font-mono lg:min-w-[220px] shrink-0">{g.valor}</span>
              <span className="text-xs text-aion-muted flex-1">{g.descripcion}</span>
              <span className="font-mono text-[10.5px] text-aion-muted shrink-0">{g.regla} · {g.politica}</span>
            </div>
          ))}
        </div>
      </Panel>

      <Panel titulo="Políticas POL-XX-nn y las reglas que agrupan" icono={Layers} derecha={<SupuestoTag />}>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
          {POLITICAS_AGRUPADAS.map((g) => (
            <div key={g.politica} className="flex items-start gap-2 border border-aion-line rounded-lg p-3">
              <ClipboardList className="w-3.5 h-3.5 text-aion-muted shrink-0 mt-0.5" />
              <div>
                <p className="font-mono text-xs font-bold text-aion-ink">{g.politica}</p>
                <p className="text-[11px] text-aion-muted">{[...g.temas].join(' · ')}</p>
                <p className="font-mono text-[10.5px] text-captura mt-0.5">{g.reglas.join(' · ')}</p>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <div className="bg-white rounded-xl shadow-card border border-aion-line p-5">
        <p className="text-sm font-semibold text-aion-ink mb-3 flex items-center gap-2 flex-wrap">
          Toda decisión o acción automática deja una traza de seis eslabones <SupuestoTag />
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {CADENA_TRAZA.map((t, i) => (
            <span key={t} className="flex items-center gap-2">
              {i > 0 && <ArrowRight className="w-4 h-4 text-slate-400" />}
              <span className={cn('px-3 py-1.5 rounded-lg text-[12.5px] font-bold', i === CADENA_TRAZA.length - 1 ? 'bg-aion-ink text-white' : 'bg-slate-100 text-aion-ink')}>{t}</span>
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Glosario
// ---------------------------------------------------------------------------

interface Termino {
  termino: string
  definicion: string
  p?: number
  supuesto?: boolean
}

const GLOSARIO: Termino[] = [
  { termino: 'Operación', definicion: 'Unidad de trabajo del simulador: un servicio de transporte desde la solicitud hasta el cierre administrativo. El documento también la llama «servicio».', p: 2, supuesto: true },
  { termino: 'Solicitud', definicion: 'Pedido de transporte del cliente: movilizar una mercancía desde un origen hasta un destino. Llega por llamada atendida por IA, formulario, integración o registro del coordinador.', p: 2 },
  { termino: 'Datos mínimos', definicion: 'Origen, destino, tipo de mercancía, peso, volumen, características del vehículo, fecha y hora de cargue, condiciones de entrega y requisito especial.', p: 3 },
  { termino: 'Contacto autorizado', definicion: 'Persona del cliente con quien se validan cargue, acceso, horarios e instrucciones, y la única habilitada para consultar el estado del servicio.', p: 27 },
  { termino: 'Destinatario', definicion: 'Contacto de recepción en el destino: confirma que las instalaciones están preparadas, los horarios de descargue y la recepción de la mercancía.', p: 31 },
  { termino: 'Agente de IA', definicion: 'Uno de los tres agentes coordinados: cliente (comunicación), negociación (transportadores) y seguimiento (preventivas, tránsito y novedades).', p: 42 },
  { termino: 'Novedad', definicion: 'Situación que afecta o puede afectar el servicio: mercancía no lista, retraso, esperas, diferencias, cierres viales, inconformidad. El agente la registra y la clasifica en una categoría de decisión.', p: 16 },
  { termino: 'Excepción', definicion: 'Nombre de datos de una novedad en el simulador (17 tipos), con causa, impacto, evidencia y alternativas.', supuesto: true },
  { termino: 'Compromiso', definicion: 'Lo que una parte se obliga a hacer y cuándo, por ejemplo presentarse al cargue a la hora acordada. El expediente los conserva y el KPI mide su cumplimiento.', p: 46 },
  { termino: 'Expediente', definicion: 'Conjunto de todo lo generado en la operación: solicitud, llamadas, transcripciones, grabaciones autorizadas, negociaciones, confirmaciones, novedades, compromisos, modificaciones y soportes de entrega.', p: 39 },
  { termino: 'Historial cronológico', definicion: 'Registro que permite reconstruir qué ocurrió, quién dio cada información, qué se decidió, qué instrucciones se comunicaron y qué quedó pendiente.', p: 40 },
  { termino: 'Agenda centralizada', definicion: 'Agenda única de llamadas y seguimientos: cada contacto tiene un objetivo y se vincula a una operación, un interlocutor y una actividad; al confirmarse un dato se actualizan las tareas relacionadas para no repetir consultas.', p: 41 },
  { termino: 'Doble confirmación', definicion: 'El agente informa al cliente la asignación y confirma con el transportador, para que ambos tengan la misma información y se eviten desplazamientos y esperas innecesarias.', p: 13 },
  { termino: 'Llamada preventiva', definicion: 'Contacto antes del cargue con ambas partes: disponibilidad, ubicación, tiempo de llegada, mercancía preparada y punto de cargue disponible.', p: 15 },
  { termino: 'Validación cruzada', definicion: 'Contrastar lo que informa una parte con lo que observa la otra, por ejemplo la llegada del vehículo o la entrega, para detectar diferencias antes de continuar.', p: 19 },
  { termino: 'Información confirmada vs. estimada', definicion: 'El agente distingue lo validado de lo estimado y no promete horarios ni soluciones que todavía no estén confirmados.', p: 26 },
  { termino: 'Selección automática', definicion: 'Cuando las políticas lo permiten, la plataforma elige transportador si se cumplen requisitos operativos, documentales y comerciales. En el simulador es un interruptor en la barra.', p: 11 },
  { termino: 'Mesa del coordinador', definicion: 'Bandeja donde llegan las operaciones escaladas: el agente presenta la situación, las alternativas y su recomendación, y la persona decide.', supuesto: true },
  { termino: 'Escalada', definicion: 'Estado en que la operación espera una decisión humana (coordinador o responsable) y no avanza hasta recibirla.', supuesto: true },
  { termino: 'Responsable de autorización', definicion: 'Quien autoriza cambios comerciales, contractuales o económicos: tarifa, sobrecostos, cancelación o compromisos no autorizados.', p: 43 },
  { termino: 'Informar vs. decidir', definicion: 'Informar estado, confirmar una hora o solicitar una actualización puede hacerlo la IA; modificar tarifa, aprobar sobrecostos, cambiar condiciones contractuales o cancelar requiere al responsable.', p: 43 },
  { termino: 'Categoría asistido', definicion: 'Punto intermedio propio del simulador: el agente registra la novedad y propone, y el coordinador decide.', supuesto: true },
  { termino: 'Tarifa tope', definicion: 'Valor máximo autorizado para la negociación; el agente nunca lo supera. La cifra del simulador es un ejemplo.', p: 8 },
  { termino: 'Contacto no exitoso', definicion: 'El cliente o el transportador no responde: se registra el intento y se reprograma según la importancia; si puede afectar el servicio se alerta a una persona.', p: 44 },
  { termino: 'Caso de seguimiento', definicion: 'Forma en que se registra una inconformidad del cliente, en lugar de dejarla como comentario.', p: 37 },
  { termino: 'Cierre administrativo', definicion: 'Cierre tras verificar documentación final, condiciones económicas, costos adicionales autorizados y novedades que afecten la liquidación.', p: 38 },
  { termino: 'Visión centralizada', definicion: 'Vista que muestra pendientes de asignación, en negociación, confirmados, información pendiente, en tránsito y novedades; en el simulador la ofrece la Control Tower.', p: 45 },
]

function TabGlosario() {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <div className="bg-white rounded-xl shadow-card border border-aion-line overflow-hidden">
        {GLOSARIO.map((item, i) => (
          <motion.div key={item.termino} variants={itemVariants} className={cn('px-5 py-3.5 flex flex-col sm:flex-row items-start gap-2 sm:gap-4', i < GLOSARIO.length - 1 && 'border-b border-slate-50')}>
            <span className="text-sm font-bold text-captura sm:min-w-[240px] shrink-0">{item.termino}</span>
            <span className="text-sm text-aion-muted flex-1">{item.definicion}</span>
            <span className="flex items-center gap-1.5 shrink-0">
              {item.p && <PBadge p={item.p} />}
              {item.supuesto && <SupuestoTag />}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Supuestos
// ---------------------------------------------------------------------------

const MATRIZ_ORIGEN: { concepto: string; insumo: string; supuesto: string; simulado: string }[] = [
  { concepto: 'Unidad de trabajo', insumo: '«Operación» y «servicio» de transporte (P2)', supuesto: 'Nombre «Operación de transporte» y código OP-0001', simulado: 'Secuencia de identificadores y semilla de operaciones' },
  { concepto: 'Canales', insumo: 'Cuatro vías de entrada de la solicitud (P2)', supuesto: '—', simulado: 'Proporción de operaciones por canal' },
  { concepto: 'Flujo', insumo: '17 etapas, de la solicitud al cierre administrativo (P2–P38)', supuesto: 'Cinco bloques de color y el bloque Novedad; estados EsperaDatos, Escalada y Cancelada', simulado: 'Ritmo de avance y probabilidad de novedad por etapa' },
  { concepto: 'Decisión', insumo: 'Informar vs. decidir (P43)', supuesto: 'Categoría «asistido» y asignación de cada novedad a una categoría', simulado: 'Quién decide y qué decide en cada caso' },
  { concepto: 'Reglas', insumo: '30 frases del documento (R01–R30)', supuesto: 'Códigos Rnn y políticas POL-XX-nn', simulado: '—' },
  { concepto: 'Guardrails', insumo: '«Parámetros económicos establecidos» y «parámetros establecidos» de espera (P8, P20)', supuesto: 'Cifras: tope +8 %, 2 rondas, 3 intentos, 90 min, 24 h', simulado: 'Tarifas y topes concretos por operación' },
  { concepto: 'Novedades', insumo: '17 situaciones descritas a lo largo del documento', supuesto: 'Tipificación, alternativas A–D, impacto en costo, tiempo y SLA, recomendación', simulado: 'Causas, evidencias y montos de cada caso' },
  { concepto: 'Eventos y trazas', insumo: 'Historial cronológico (P40)', supuesto: '26 nombres de evento y la traza de seis eslabones', simulado: 'Marcas de tiempo y textos' },
  { concepto: 'Agentes', insumo: 'Tres agentes coordinados (P42)', supuesto: 'Qué agente conduce cada etapa y levanta cada novedad', simulado: 'Duración y resultado de cada llamada' },
  { concepto: 'Indicadores', insumo: `${KPIS_INSUMO.length} indicadores nombrados (P47)`, supuesto: 'Fórmula operativa de cada uno', simulado: 'Valores calculados sobre la operación simulada' },
  { concepto: 'Selección automática', insumo: 'Posibilidad de seleccionar automáticamente (P11)', supuesto: 'Interruptor en la barra y reglas de selección', simulado: 'Ofertas de los candidatos' },
  { concepto: 'Maestros', insumo: '—', supuesto: '—', simulado: 'Clientes, nodos, transportadores, mercancías, tarifas, teléfonos y placas ficticios' },
]

function TabSupuestos() {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <Panel titulo="Supuestos de diseño declarados" icono={Lightbulb} derecha={<SupuestoTag />}>
        <ol className="p-5 space-y-2.5">
          {SUPUESTOS_DE_DISENO.map((s, i) => (
            <motion.li key={i} variants={itemVariants} className="flex items-start gap-3 text-sm text-aion-ink">
              <span className="w-6 h-6 rounded-full bg-promesa-light text-promesa-dark text-[11px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
              <span className="pt-0.5">{s}</span>
            </motion.li>
          ))}
        </ol>
      </Panel>

      <Panel titulo="Qué sale del insumo, qué es supuesto y qué es operación simulada" icono={Layers} derecha={<LeyendaOrigen />}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-aion-line">
                <th className="text-left px-4 py-2.5 font-medium text-aion-muted">Concepto</th>
                <th className="text-left px-3 py-2.5 font-semibold text-success">Del insumo</th>
                <th className="text-left px-3 py-2.5 font-semibold text-promesa-dark">Supuesto de diseño</th>
                <th className="text-left px-3 py-2.5 font-semibold text-slate-600">Operación simulada</th>
              </tr>
            </thead>
            <tbody>
              {MATRIZ_ORIGEN.map((r) => (
                <tr key={r.concepto} className="border-b border-slate-50 align-top hover:bg-slate-50/60">
                  <td className="px-4 py-2.5 font-semibold text-aion-ink whitespace-nowrap">{r.concepto}</td>
                  <td className="px-3 py-2.5 text-aion-muted">{r.insumo}</td>
                  <td className="px-3 py-2.5 text-aion-muted">{r.supuesto}</td>
                  <td className="px-3 py-2.5 text-aion-muted">{r.simulado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
        <Undo2 className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-slate-700">Fuera de alcance</p>
          <p className="text-xs text-aion-muted mt-1">{FUERA_DE_ALCANCE}</p>
        </div>
      </div>

      <Panel titulo="Contenido del expediente y sistemas funcionales (del insumo)" icono={FileText} derecha={<OrigenTag origen="insumo" />}>
        <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Chips>
            {EXPEDIENTE_CONTENIDO.map((c) => (
              <span key={c} className="px-2.5 py-1 text-xs rounded-full bg-slate-100 text-aion-ink font-medium">
                {c}
              </span>
            ))}
          </Chips>
          <ul className="space-y-1.5">
            {SISTEMAS.map((s) => (
              <li key={s.id} className="flex items-start gap-2 text-xs">
                <Bot className="w-3.5 h-3.5 text-aion-muted shrink-0 mt-0.5" />
                <span className="text-aion-ink font-medium">{s.nombre}</span>
                <PBadge p={s.p} />
              </li>
            ))}
          </ul>
        </div>
      </Panel>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Página
// ---------------------------------------------------------------------------

export default function Ontologia() {
  const [activeTab, setActiveTab] = useState<TabKey>('entidades')

  const contenido: Record<TabKey, React.ReactNode> = {
    entidades: <TabEntidades />,
    relaciones: <TabRelaciones />,
    taxonomias: <TabTaxonomias />,
    maquina: <TabMaquinaEstados />,
    reglas: <TabReglas />,
    glosario: <TabGlosario />,
    supuestos: <TabSupuestos />,
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-[1440px] mx-auto px-6 pb-12 pt-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-aion-ink">Ontología del dominio</h1>
        <p className="text-sm text-aion-muted mt-1 max-w-4xl">
          Modelo formal de la coordinación logística con agentes de IA: entidades, relaciones (novedad × categoría × agente × decisor), taxonomías, máquina de estados, reglas, glosario y supuestos. Cada elemento indica si sale del insumo, es un supuesto de diseño o pertenece a la operación simulada.
        </p>
        <div className="flex items-center gap-2 flex-wrap mt-3 text-[11px] text-aion-muted">
          <span className="badge-compact bg-slate-100">{ENTIDADES.length} entidades</span>
          <span className="badge-compact bg-slate-100">{FLUJO_ETAPAS.length} etapas</span>
          <span className="badge-compact bg-slate-100">{TIPOS_EXCEPCION.length} tipos de excepción</span>
          <span className="badge-compact bg-slate-100">{REGLAS.length} reglas</span>
          <span className="badge-compact bg-slate-100">{Object.keys(EVENTOS).length} eventos</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 bg-slate-100 rounded-xl p-1.5">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn('flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all', activeTab === tab.key ? 'bg-white text-aion-ink shadow-sm' : 'text-aion-muted hover:text-aion-ink')}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        {contenido[activeTab]}
      </motion.div>
    </motion.div>
  )
}
