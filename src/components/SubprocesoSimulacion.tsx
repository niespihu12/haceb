import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Bot,
  Cable,
  CheckCircle2,
  Cpu,
  FileText,
  Flag,
  Play,
  RotateCcw,
  Server,
  Terminal,
  User,
  UserCheck,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ActorPaso, MecanismoSubproceso, Subproceso } from '@/types/implementacion'

// ---------------------------------------------------------------------------
// Presentacion
// ---------------------------------------------------------------------------

const MECANISMO: Record<MecanismoSubproceso, { clase: string; icon: LucideIcon; ayuda: string }> = {
  RPA: { clase: 'bg-catB text-white', icon: Cpu, ayuda: 'Robot de software que opera la aplicación o el buzón como lo haría una persona' },
  API: { clase: 'bg-captura text-white', icon: Cable, ayuda: 'Integración sistema a sistema' },
  EDI: { clase: 'bg-validacion text-white', icon: FileText, ayuda: 'Intercambio electrónico de documentos' },
  Conector: { clase: 'bg-comunicacion text-white', icon: Cable, ayuda: 'Conector estándar del canal (telefonía, formulario, integración)' },
  'Agente IA': { clase: 'bg-liberacion text-white', icon: Bot, ayuda: 'El agente de IA conversa, interpreta y propone dentro de los límites autorizados' },
  Manual: { clase: 'bg-slate-500 text-white', icon: User, ayuda: 'Actividad realizada por una persona' },
}

const ACTOR: Record<ActorPaso, { label: string; color: string; icon: LucideIcon }> = {
  RPA: { label: 'RPA', color: '#4f46e5', icon: Cpu },
  Sistema: { label: 'Sistema', color: '#2563eb', icon: Server },
  Agente: { label: 'Agente IA', color: '#7c3aed', icon: Bot },
  Persona: { label: 'Persona', color: '#d97706', icon: UserCheck },
  Cliente: { label: 'Cliente', color: '#141b2d', icon: User },
}

const MS_POR_SEGUNDO_SIMULADO = 650

interface Props {
  subproceso: Subproceso
  /** Color de acento (el de la capa). */
  color: string
  /** Una sola columna (para paneles angostos). */
  compacto?: boolean
}

export default function SubprocesoSimulacion({ subproceso, color, compacto = false }: Props) {
  // -1 = sin iniciar · 0..n-1 = paso en ejecucion · n = completado
  const [paso, setPaso] = useState(-1)
  const [corriendo, setCorriendo] = useState(false)
  const total = subproceso.pasos.length
  const completado = paso >= total

  useEffect(() => {
    if (!corriendo) return
    const actual = subproceso.pasos[paso]
    if (!actual) {
      const fin = setTimeout(() => setCorriendo(false), 0)
      return () => clearTimeout(fin)
    }
    const t = setTimeout(() => {
      const siguiente = paso + 1
      setPaso(siguiente)
      if (siguiente >= total) setCorriendo(false)
    }, actual.segundos * MS_POR_SEGUNDO_SIMULADO)
    return () => clearTimeout(t)
  }, [corriendo, paso, subproceso, total])

  const ejecutar = () => {
    setPaso(0)
    setCorriendo(true)
  }

  const reiniciar = () => {
    setCorriendo(false)
    setPaso(-1)
  }

  const mec = MECANISMO[subproceso.mecanismo]
  const MecIcon = mec.icon
  const tiempoAcumulado = subproceso.pasos.slice(0, Math.min(paso, total)).reduce((s, p) => s + p.segundos, 0)
  const bitacora = subproceso.pasos.slice(0, Math.min(paso, total))

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.22 }}
      className="overflow-hidden"
    >
      <div className={cn('rounded-xl border border-aion-line bg-slate-50/70 space-y-4', compacto ? 'p-3' : 'mt-2 p-4')}>
        {/* Encabezado */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-start gap-3 min-w-0">
            <span className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', mec.clase)} title={mec.ayuda}>
              <MecIcon className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-[13.5px] font-bold text-aion-ink">{subproceso.titulo}</p>
                <span className={cn('text-[10px] font-bold px-1.5 py-px rounded', mec.clase)}>{subproceso.mecanismo}</span>
              </div>
              <p className="text-[12px] text-aion-muted mt-0.5 leading-relaxed">{subproceso.descripcion}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {!corriendo && !completado && (
              <button onClick={ejecutar} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-colors" style={{ backgroundColor: color }}>
                <Play className="w-3.5 h-3.5" />
                Ejecutar simulación
              </button>
            )}
            {corriendo && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-aion-line text-aion-muted">
                <span className="w-2 h-2 rounded-full animate-pulse-soft" style={{ backgroundColor: color }} />
                Ejecutando paso {Math.min(paso + 1, total)} de {total}
              </span>
            )}
            {(completado || paso >= 0) && (
              <button onClick={reiniciar} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-aion-line text-aion-muted hover:text-aion-ink transition-colors">
                <RotateCcw className="w-3.5 h-3.5" />
                Reiniciar
              </button>
            )}
          </div>
        </div>

        {/* Linea de tiempo del subproceso + bitacora */}
        <div className={cn('grid grid-cols-1 gap-4', !compacto && 'lg:grid-cols-[1fr_300px]')}>
          <ol className="relative pl-7">
            <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-slate-200 rounded-full" />
            {subproceso.pasos.map((p, i) => {
              const a = ACTOR[p.actor]
              const ActorIcon = a.icon
              const hecho = i < paso
              const activo = i === paso && corriendo
              const pendiente = !hecho && !activo
              return (
                <li key={p.id} className="relative pb-3 last:pb-0">
                  <span
                    className={cn(
                      'absolute -left-7 top-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold border-2 bg-white',
                      hecho ? 'bg-success border-success text-white' : pendiente ? 'border-slate-200 text-slate-400' : 'text-white',
                    )}
                    style={activo ? { backgroundColor: color, borderColor: color } : undefined}
                  >
                    {hecho ? <CheckCircle2 className="w-3.5 h-3.5" /> : activo ? <span className="w-2 h-2 rounded-full bg-white animate-pulse-soft" /> : i + 1}
                  </span>
                  <div
                    className={cn('rounded-lg border px-3 py-2 transition-all', hecho ? 'bg-white border-success/30' : activo ? 'bg-white' : 'bg-white/60 border-aion-line')}
                    style={activo ? { borderColor: color, boxShadow: `0 0 0 3px ${color}22` } : undefined}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn('text-[12.5px] font-semibold leading-snug', pendiente ? 'text-slate-400' : 'text-aion-ink')}>{p.titulo}</span>
                      <span className="flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-wide" style={{ color: pendiente ? '#94a3b8' : a.color }}>
                        <ActorIcon className="w-3 h-3" />
                        {a.label}
                      </span>
                      <span className="ml-auto text-[10px] font-mono text-aion-muted">{p.segundos.toFixed(1)} s</span>
                    </div>
                    {(hecho || activo) && <p className="text-[11.5px] text-aion-muted leading-snug mt-1">{p.detalle}</p>}
                    {hecho && (
                      <p className="text-[10.5px] font-mono text-success mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {p.evidencia}
                      </p>
                    )}
                  </div>
                </li>
              )
            })}
            <li className="relative pt-1">
              <span className={cn('absolute -left-7 top-1 w-6 h-6 rounded-full flex items-center justify-center border-2', completado ? 'bg-success border-success text-white' : 'bg-white border-dashed border-slate-300 text-slate-400')}>
                <Flag className="w-3.5 h-3.5" />
              </span>
              <div className={cn('rounded-lg border px-3 py-2', completado ? 'bg-success-light border-success/40' : 'bg-white/60 border-dashed border-aion-line')}>
                <p className={cn('text-[10.5px] font-bold uppercase tracking-wider', completado ? 'text-success' : 'text-slate-400')}>Resultado</p>
                <p className={cn('text-[12.5px] leading-snug mt-0.5', completado ? 'text-aion-ink font-medium' : 'text-slate-400')}>
                  {completado ? subproceso.resultado : 'Ejecuta la simulación para ver el resultado del subproceso.'}
                </p>
              </div>
            </li>
          </ol>

          <div className={cn('rounded-lg bg-aion-ink p-3 self-start', !compacto && 'lg:sticky lg:top-[76px]')}>
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/50 flex items-center gap-1.5 mb-1.5">
              <Terminal className="w-3 h-3" />
              Bitácora · t+{tiempoAcumulado.toFixed(1)} s
            </p>
            {bitacora.length === 0 ? (
              <p className="text-[11px] font-mono text-white/40">— sin eventos —</p>
            ) : (
              <div className="space-y-1 max-h-[260px] overflow-y-auto">
                {bitacora.map((p, i) => {
                  const t = subproceso.pasos.slice(0, i + 1).reduce((s, x) => s + x.segundos, 0)
                  return (
                    <p key={p.id} className="text-[11px] font-mono text-white/85 leading-snug">
                      <span className="text-aion-accent">t+{t.toFixed(1)}s</span> <span className="text-white/50">[{ACTOR[p.actor].label}]</span> {p.evidencia}
                    </p>
                  )
                })}
                {completado && <p className="text-[11px] font-mono text-success leading-snug">✓ subproceso completado</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
