import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import { Activity, ChevronRight, Filter, Inbox, LayoutGrid, List, MapPin, Pause, Play, Search, Truck, UserCheck, X } from 'lucide-react'
import { useSimulation } from '@/hooks/useSimulation'
import { cn, formatDuracion } from '@/lib/utils'
import { CanalBadge } from '@/components/shared'
import {
  CANALES,
  CANAL_INFO,
  CATEGORIAS,
  CATEGORIA_CLASE,
  CATEGORIA_LABEL,
  ETAPAS_FLUJO,
  ETAPA_BLOQUE,
  ETAPA_LABEL,
  ETAPA_LABEL_CORTO,
  ETAPA_NUMERO,
  EXCEPCION_LABEL,
  TIPOS_EXCEPCION,
  TODAS_LAS_ETAPAS,
  esTerminal,
} from '@/data/mockData'
import { BLOQUES, CANALES_DEF, ESTADOS_FIN } from '@/data/procesoData'
import type { BloqueFlujo, Canal, EtapaFlujo, EtapaOperacion, Operacion } from '@/types'

const BLOQUES_TABLERO = BLOQUES.filter((b) => b.id !== 'Novedad')
const BLOQUE_NOMBRE: Record<BloqueFlujo, string> = Object.fromEntries(BLOQUES.map((b) => [b.id, b.nombre])) as Record<BloqueFlujo, string>
const BLOQUE_DEF = Object.fromEntries(BLOQUES.map((b) => [b.id, b])) as Record<BloqueFlujo, (typeof BLOQUES)[number]>

const SALIDAS: { etapa: EtapaOperacion; titulo: string; nota: string; color: string; bg: string }[] = [
  { etapa: 'EsperaDatos', titulo: 'Espera de datos', nota: 'El agente completa lo pendiente con el cliente', color: '#d97706', bg: '#fdf1e0' },
  { etapa: 'Escalada', titulo: 'En manos del coordinador', nota: 'Esperan una decisión en la Mesa', color: '#e11d48', bg: '#fdeaf0' },
  { etapa: 'Cerrada', titulo: 'Cerrada', nota: 'Cierre administrativo completo', color: '#0891b2', bg: '#e0f4f9' },
  { etapa: 'Cancelada', titulo: 'Cancelada', nota: 'Con causa registrada (R28)', color: '#64748b', bg: '#f1f5f9' },
]

const MAX_TERMINALES = 8

const toggle = <T,>(lista: T[], valor: T): T[] => (lista.includes(valor) ? lista.filter((x) => x !== valor) : [...lista, valor])

function OperacionCard({
  op,
  ahora,
  onOpen,
  onMesa,
}: {
  op: Operacion
  ahora: number
  onOpen: (id: string) => void
  onMesa: (id: string) => void
}) {
  const terminal = esTerminal(op.etapa)
  const escalada = op.etapa === 'Escalada'
  const exc = op.excepcion
  const edad = (ahora - op.fechaCreacion) / 60000
  const color = BLOQUE_DEF[ETAPA_BLOQUE[op.etapa]].color

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      onClick={() => onOpen(op.id)}
      className={cn(
        'bg-white rounded-lg border border-aion-line p-3 cursor-pointer transition-shadow hover:shadow-md',
        escalada && 'border-catC/50 ring-1 ring-catC/20',
        op.etapa === 'Cancelada' && 'opacity-80',
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <span className="font-mono text-[11px] font-semibold text-captura">{op.id}</span>
        <CanalBadge canal={op.canal} className="shrink-0" />
      </div>

      <p className="text-xs font-medium text-aion-ink leading-snug line-clamp-1">{op.cliente.nombre}</p>
      <div className="flex items-center gap-1.5 mt-1 text-[10.5px] text-aion-muted">
        <MapPin className="w-3 h-3 shrink-0" />
        <span className="truncate">
          {op.nodoOrigen.ciudad} → {op.nodoDestino.ciudad}
        </span>
      </div>
      <p className="text-[10.5px] text-aion-muted truncate mt-0.5">{op.mercancia.descripcion}</p>
      <div className="flex items-center gap-1.5 mt-0.5 text-[10.5px] text-aion-muted">
        <Truck className="w-3 h-3 shrink-0" />
        <span className={cn('truncate', !op.transportador && 'italic')}>{op.transportador ? op.transportador.nombre : 'Sin transportador asignado'}</span>
      </div>

      {exc && !terminal && (
        <div className="flex items-center gap-1.5 mt-2 rounded-md bg-excepcion-light/60 px-2 py-1">
          <span className={cn('badge-compact font-bold shrink-0', CATEGORIA_CLASE[exc.categoria])}>{CATEGORIA_LABEL[exc.categoria]}</span>
          <span className="text-[10.5px] text-excepcion-dark truncate">{EXCEPCION_LABEL[exc.tipo]}</span>
        </div>
      )}

      <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${op.progreso}%`, backgroundColor: color }} />
      </div>

      <div className="flex items-center justify-between text-[10px] text-aion-muted mt-1.5">
        <span className="truncate">
          {ETAPA_NUMERO[op.etapa] > 0 ? `[${ETAPA_NUMERO[op.etapa]}] ` : ''}
          {ETAPA_LABEL_CORTO[op.etapa]}
        </span>
        <span className={cn('font-mono shrink-0', !terminal && edad > 600 && 'text-error font-semibold')}>{formatDuracion(edad)}</span>
      </div>

      {escalada && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onMesa(op.id)
          }}
          className="mt-2 w-full flex items-center justify-center gap-1 px-2 py-1 rounded text-[10.5px] font-medium bg-catC text-white hover:bg-catC-dark transition-colors"
        >
          <UserCheck className="w-3 h-3" />
          Ir a la Mesa del coordinador
        </button>
      )}
    </motion.div>
  )
}

function ColumnaVacia({ texto }: { texto: string }) {
  return <p className="text-[11px] text-aion-muted text-center py-5">{texto}</p>
}

export default function Pipeline() {
  const navigate = useNavigate()
  const { operaciones, filters, setFilters, isRunning, play, pause, ahora } = useSimulation()

  const [vista, setVista] = useState<'bloques' | 'canales'>('bloques')
  const [expandido, setExpandido] = useState<Canal | null>('llamada_ia')

  const abrir = (id: string) => navigate(`/operacion/${id}`)
  const irAMesa = (id: string) => navigate(`/coordinador?operacion=${id}`)

  const porEtapa = useMemo(() => {
    const mapa = {} as Record<EtapaOperacion, Operacion[]>
    for (const e of TODAS_LAS_ETAPAS) mapa[e] = []
    for (const o of operaciones) mapa[o.etapa].push(o)
    for (const e of TODAS_LAS_ETAPAS) {
      mapa[e].sort(esTerminal(e) ? (a, b) => b.fechaActualizacion - a.fechaActualizacion : (a, b) => a.fechaCreacion - b.fechaCreacion)
    }
    return mapa
  }, [operaciones])

  const porCanal = useMemo(() => {
    const mapa = {} as Record<Canal, Operacion[]>
    for (const c of CANALES) mapa[c] = []
    for (const o of operaciones) mapa[o.canal].push(o)
    for (const c of CANALES) mapa[c].sort((a, b) => a.fechaCreacion - b.fechaCreacion)
    return mapa
  }, [operaciones])

  const enFlujo = operaciones.filter((o) => !esTerminal(o.etapa)).length
  const hayFiltros =
    filters.canales.length + filters.bloques.length + filters.categorias.length + filters.tipos.length + filters.etapas.length > 0 || filters.busqueda !== ''

  const limpiar = () => setFilters({ canales: [], etapas: [], bloques: [], categorias: [], tipos: [], busqueda: '' })

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }
  const itemVariants = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.26 } } }

  return (
    <div className="max-w-[1440px] mx-auto px-6 pb-10">
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-aion-ink">Pipeline de operaciones</h2>
          <p className="text-sm text-aion-muted mt-0.5">
            Cada operación de transporte recorre las mismas 17 etapas, agrupadas por bloque · {enFlujo} en flujo · {operaciones.length} visibles
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!isRunning ? (
            <button onClick={play} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-captura text-white hover:bg-captura-dark transition-colors text-xs font-medium">
              <Play className="w-3.5 h-3.5" />
              Iniciar
            </button>
          ) : (
            <button onClick={pause} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-promesa-light text-promesa-dark hover:bg-promesa/20 transition-colors text-xs font-medium">
              <Pause className="w-3.5 h-3.5" />
              Pausar
            </button>
          )}
          <div className="flex items-center bg-white rounded-lg border border-aion-line p-0.5">
            <button
              onClick={() => setVista('bloques')}
              className={cn('flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all text-xs', vista === 'bloques' ? 'bg-captura text-white shadow-sm' : 'text-slate-500 hover:text-captura')}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Por bloque
            </button>
            <button
              onClick={() => setVista('canales')}
              className={cn('flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all text-xs', vista === 'canales' ? 'bg-captura text-white shadow-sm' : 'text-slate-500 hover:text-captura')}
            >
              <List className="w-3.5 h-3.5" />
              Por canal
            </button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="glass-panel rounded-xl p-4 mb-5 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-aion-muted" />
          <span className="text-xs font-medium text-aion-muted uppercase tracking-wide">Filtros</span>
          {hayFiltros && (
            <button onClick={limpiar} className="inline-flex items-center gap-1 text-[11px] text-captura hover:text-captura-dark">
              <X className="w-3 h-3" /> Limpiar
            </button>
          )}
          <div className="flex-1" />
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-aion-muted" />
            <input
              type="text"
              placeholder="Buscar por operación, cliente, ciudad, mercancía, transportador o novedad..."
              value={filters.busqueda}
              onChange={(e) => setFilters({ ...filters, busqueda: e.target.value })}
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-aion-line bg-white w-96 max-w-full focus:outline-none focus:ring-1 focus:ring-captura/30"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-medium text-aion-muted uppercase w-20 shrink-0">Canal</span>
          {CANALES.map((c) => {
            const info = CANAL_INFO[c]
            const activa = filters.canales.length === 0 || filters.canales.includes(c)
            return (
              <button
                key={c}
                onClick={() => setFilters({ ...filters, canales: toggle(filters.canales, c) })}
                className={cn('px-2.5 py-1 rounded-md text-[11px] font-medium transition-all border', activa ? 'border-transparent' : 'bg-slate-100 text-slate-400 border-slate-200')}
                style={activa ? { backgroundColor: `${info.color}18`, color: info.color } : undefined}
              >
                {info.label}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-medium text-aion-muted uppercase w-20 shrink-0">Bloque</span>
          {BLOQUES.map((b) => {
            const activa = filters.bloques.length === 0 || filters.bloques.includes(b.id)
            return (
              <button
                key={b.id}
                onClick={() => setFilters({ ...filters, bloques: toggle(filters.bloques, b.id) })}
                className={cn('px-2.5 py-1 rounded-md text-[11px] font-medium transition-all', !activa && 'bg-slate-100 text-slate-400')}
                style={activa ? { backgroundColor: b.colorBg, color: b.color } : undefined}
              >
                {b.nombre}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-medium text-aion-muted uppercase w-20 shrink-0">Decisión</span>
          {CATEGORIAS.map((c) => {
            const activa = filters.categorias.length === 0 || filters.categorias.includes(c)
            return (
              <button
                key={c}
                onClick={() => setFilters({ ...filters, categorias: toggle(filters.categorias, c) })}
                className={cn('px-2.5 py-1 rounded-md text-[11px] font-bold transition-all', activa ? CATEGORIA_CLASE[c] : 'bg-slate-100 text-slate-400')}
              >
                {CATEGORIA_LABEL[c]}
              </button>
            )
          })}
        </div>

        <div className="flex items-start gap-2 flex-wrap">
          <span className="text-[11px] font-medium text-aion-muted uppercase w-20 shrink-0 pt-1">Novedad</span>
          <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
            {TIPOS_EXCEPCION.map((t) => {
              const activa = filters.tipos.length === 0 || filters.tipos.includes(t)
              return (
                <button
                  key={t}
                  onClick={() => setFilters({ ...filters, tipos: toggle(filters.tipos, t) })}
                  className={cn('px-2 py-0.5 rounded-md text-[10.5px] font-medium transition-all', activa ? 'bg-excepcion-light text-excepcion-dark' : 'bg-slate-100 text-slate-400')}
                >
                  {EXCEPCION_LABEL[t]}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Vista por bloque */}
      {vista === 'bloques' && (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
          {BLOQUES_TABLERO.map((b) => {
            const etapas = ETAPAS_FLUJO.filter((e) => ETAPA_BLOQUE[e] === b.id) as EtapaFlujo[]
            const total = etapas.reduce((s, e) => s + porEtapa[e].length, 0)
            return (
              <motion.section key={b.id} variants={itemVariants} className="rounded-xl border border-aion-line overflow-hidden bg-white/70">
                <div className="px-4 py-2.5 flex items-center justify-between gap-3" style={{ backgroundColor: b.colorBg }}>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: b.color }} />
                    <span className="text-[13px] font-bold shrink-0" style={{ color: b.color }}>
                      {b.nombre}
                    </span>
                    <span className="text-[11px] text-aion-muted truncate hidden sm:inline">{b.descripcion}</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold shrink-0" style={{ color: b.color }}>
                    {total}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <div className="grid gap-3 p-3" style={{ gridTemplateColumns: `repeat(${etapas.length}, minmax(210px, 1fr))` }}>
                    {etapas.map((e) => {
                      const items = porEtapa[e]
                      return (
                        <div key={e} className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-2 text-[10.5px] font-semibold uppercase tracking-wide text-aion-muted">
                            <span className="font-mono">[{ETAPA_NUMERO[e]}]</span>
                            <span className="truncate" title={ETAPA_LABEL[e]}>
                              {ETAPA_LABEL_CORTO[e]}
                            </span>
                            <span className="ml-auto font-mono" style={{ color: b.color }}>
                              {items.length}
                            </span>
                          </div>
                          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-0.5 min-h-[56px] rounded-lg bg-slate-50/60 p-1.5">
                            {items.length === 0 ? (
                              <ColumnaVacia texto="Sin operaciones" />
                            ) : (
                              items.map((o) => <OperacionCard key={o.id} op={o} ahora={ahora} onOpen={abrir} onMesa={irAMesa} />)
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </motion.section>
            )
          })}

          {/* Salidas */}
          <motion.section variants={itemVariants} className="rounded-xl border border-aion-line overflow-hidden bg-white/70">
            <div className="px-4 py-2.5 flex items-center justify-between gap-3" style={{ backgroundColor: BLOQUE_DEF.Novedad.colorBg }}>
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: BLOQUE_DEF.Novedad.color }} />
                <span className="text-[13px] font-bold shrink-0" style={{ color: BLOQUE_DEF.Novedad.color }}>
                  {BLOQUE_NOMBRE.Novedad}
                </span>
                <span className="text-[11px] text-aion-muted truncate hidden sm:inline">{BLOQUE_DEF.Novedad.descripcion}</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <div className="grid gap-3 p-3" style={{ gridTemplateColumns: 'repeat(4, minmax(210px, 1fr))' }}>
                {SALIDAS.map((s) => {
                  const items = porEtapa[s.etapa]
                  const terminal = esTerminal(s.etapa)
                  const visibles = terminal ? items.slice(0, MAX_TERMINALES) : items
                  const fin = ESTADOS_FIN.find((f) => f.id === s.etapa)
                  return (
                    <div key={s.etapa} className="min-w-0">
                      <div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wide" style={{ color: s.color }}>
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                        <span className="truncate">{s.titulo}</span>
                        <span className="ml-auto font-mono">{items.length}</span>
                      </div>
                      <p className="text-[10px] text-aion-muted mb-2 mt-0.5 truncate" title={fin?.descripcion ?? s.nota}>
                        {s.nota}
                      </p>
                      <div className="space-y-2 max-h-[420px] overflow-y-auto pr-0.5 min-h-[56px] rounded-lg p-1.5" style={{ backgroundColor: s.bg }}>
                        {items.length === 0 ? (
                          <ColumnaVacia texto="Sin operaciones" />
                        ) : (
                          <>
                            {visibles.map((o) => (
                              <OperacionCard key={o.id} op={o} ahora={ahora} onOpen={abrir} onMesa={irAMesa} />
                            ))}
                            {items.length > visibles.length && (
                              <p className="text-[10.5px] text-aion-muted text-center py-1">+{items.length - visibles.length} más (usa la búsqueda)</p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.section>
        </motion.div>
      )}

      {/* Vista por canal */}
      {vista === 'canales' && (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
          {CANALES.map((c) => {
            const info = CANAL_INFO[c]
            const def = CANALES_DEF.find((d) => d.id === c)
            const items = porCanal[c]
            const abierto = expandido === c
            const activas = items.filter((o) => !esTerminal(o.etapa)).length
            return (
              <motion.div key={c} variants={itemVariants}>
                <div className="glass-panel rounded-xl overflow-hidden border-l-4" style={{ borderLeftColor: info.color }}>
                  <button onClick={() => setExpandido(abierto ? null : c)} className="w-full flex items-center gap-3 px-5 py-3 transition-colors hover:bg-slate-50">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: info.color }}>
                      <Inbox className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <span className="text-sm font-bold" style={{ color: info.color }}>
                        {info.label}
                      </span>
                      <p className="text-[11px] text-aion-muted truncate">{def?.descripcion}</p>
                    </div>
                    <span className="text-xs text-aion-muted font-mono shrink-0">
                      {activas} en flujo · {items.length} total
                    </span>
                    <ChevronRight className={cn('w-4 h-4 text-aion-muted transition-transform shrink-0', abierto && 'rotate-90')} />
                  </button>

                  {abierto && (
                    <div className="px-5 py-4 border-t border-aion-line">
                      {items.length === 0 ? (
                        <p className="text-sm text-aion-muted text-center py-6">Sin operaciones con los filtros seleccionados</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                          {TODAS_LAS_ETAPAS.map((etapa) => {
                            const deEtapa = items.filter((o) => o.etapa === etapa)
                            if (deEtapa.length === 0) return null
                            const visibles = esTerminal(etapa) ? deEtapa.slice(0, MAX_TERMINALES) : deEtapa
                            return (
                              <div key={etapa} className="space-y-2 min-w-0">
                                <div className="flex items-center gap-1.5 text-[10.5px] font-medium text-aion-muted uppercase tracking-wide">
                                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: BLOQUE_DEF[ETAPA_BLOQUE[etapa]].color }} />
                                  <span className="truncate">{ETAPA_LABEL_CORTO[etapa]}</span>
                                  <span className="font-mono ml-auto">{deEtapa.length}</span>
                                </div>
                                {visibles.map((o) => (
                                  <OperacionCard key={o.id} op={o} ahora={ahora} onOpen={abrir} onMesa={irAMesa} />
                                ))}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {operaciones.length === 0 && (
        <div className="text-center py-16 text-aion-muted">
          <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No hay operaciones con los filtros seleccionados</p>
          <button onClick={limpiar} className="mt-3 inline-flex items-center gap-1 text-xs text-captura">
            <X className="w-3 h-3" /> Limpiar filtros
          </button>
        </div>
      )}
    </div>
  )
}
