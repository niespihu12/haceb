import { useSimulation } from '@/hooks/useSimulation'
import { Play, Pause, Square, Truck, LayoutDashboard, FileText, GitBranch, UserCheck, Network, Radar, BookOpen, Presentation, Bot } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router'
import { cn, formatFechaHora } from '@/lib/utils'
import type { SimulacionVelocidad } from '@/types'

interface NavbarProps {
  onPresentationMode: () => void
}

const TABS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/proceso', label: 'Proceso', icon: FileText },
  { path: '/pipeline', label: 'Pipeline', icon: GitBranch },
  { path: '/agentes', label: 'Agentes', icon: Bot },
  { path: '/coordinador', label: 'Mesa del coordinador', icon: UserCheck },
  { path: '/sistemas', label: 'Sistemas', icon: Network },
  { path: '/control-tower', label: 'Control Tower', icon: Radar },
  { path: '/ontologia', label: 'Ontología', icon: BookOpen },
]

export default function Navbar({ onPresentationMode }: NavbarProps) {
  const { isRunning, play, pause, stop, speed, setSpeed, tick, ahora, seleccionAutomatica, setSeleccionAutomatica, kpis } = useSimulation()
  const navigate = useNavigate()
  const location = useLocation()
  const speeds: SimulacionVelocidad[] = [1, 2, 5, 10]
  const currentPath = location.pathname

  return (
    <header className="sticky top-0 z-50 bg-[#F7F8FA]/95 backdrop-blur-sm border-b border-aion-line">
      <div className="max-w-[1440px] min-[1600px]:max-w-[1680px] mx-auto px-6">
        <div className="flex items-center justify-between h-14 gap-3">
          {/* Marca */}
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5 shrink-0 text-left">
            <div className="w-8 h-8 rounded-lg bg-aion-ink flex items-center justify-center">
              <Truck className="w-[18px] h-[18px] text-aion-accent" strokeWidth={2.2} />
            </div>
            <div>
              <h1 className="text-base font-bold text-aion-ink leading-tight">
                Haceb <span className="text-captura">Coordinación</span>
              </h1>
              <p className="text-[10px] text-aion-muted leading-tight">Logística con agentes de IA</p>
            </div>
          </button>

          {/* Navegación */}
          <nav className="flex items-center gap-0.5 min-w-0 overflow-x-auto [scrollbar-width:none]">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = tab.path === '/' ? currentPath === '/' : currentPath.startsWith(tab.path)
              const badge = tab.path === '/coordinador' && kpis.escaladas > 0 ? kpis.escaladas : null
              return (
                <button
                  key={tab.path}
                  onClick={() => navigate(tab.path)}
                  className={cn('nav-tab relative !px-2 min-[1600px]:!px-1.5 min-[1600px]:!gap-1 min-[1600px]:!text-[12.5px]', isActive && 'nav-tab-active')}
                  title={tab.label}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="hidden min-[1600px]:inline">{tab.label}</span>
                  {badge !== null && (
                    <span className={cn('ml-0.5 text-[9.5px] font-bold px-1.5 py-px rounded-full leading-tight', isActive ? 'bg-white/25 text-white' : 'bg-catC text-white')}>{badge}</span>
                  )}
                </button>
              )
            })}
          </nav>

          {/* Controles de simulación */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Selección automática (R09) */}
            <button
              onClick={() => setSeleccionAutomatica(!seleccionAutomatica)}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11.5px] font-semibold transition-colors',
                seleccionAutomatica ? 'bg-validacion-light text-validacion-dark border-validacion/30' : 'bg-slate-100 text-slate-600 border-slate-200',
              )}
              title="Selección automática del transportador cuando las políticas lo permiten (R09)"
            >
              <span className={cn('w-2 h-2 rounded-full', seleccionAutomatica ? 'bg-validacion' : 'bg-slate-400')} />
              <span className="hidden lg:inline">Selección</span> {seleccionAutomatica ? 'automática' : 'manual'}
            </button>

            <div className="flex items-center bg-white rounded-lg border border-aion-line p-0.5">
              {speeds.map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={cn('px-2 py-1 text-xs font-medium rounded-md transition-all', speed === s ? 'bg-captura text-white shadow-sm' : 'text-slate-500 hover:text-captura')}
                >
                  {s}x
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1">
              {!isRunning ? (
                <button onClick={play} className="p-2 rounded-lg bg-captura text-white hover:bg-captura-dark transition-colors" title="Iniciar la operación">
                  <Play className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={pause} className="p-2 rounded-lg bg-promesa-light text-promesa-dark hover:bg-promesa/20 transition-colors" title="Pausar">
                  <Pause className="w-4 h-4" />
                </button>
              )}
              <button onClick={stop} className="p-2 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors" title="Reiniciar">
                <Square className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="hidden 2xl:block text-right leading-tight">
              <div className="text-[11px] text-aion-ink font-mono">{formatFechaHora(ahora)}</div>
              <div className="text-[10px] text-aion-muted font-mono">T{tick}</div>
            </div>

            <button onClick={onPresentationMode} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-aion-ink text-white hover:bg-aion-ink-dark transition-colors text-xs font-medium">
              <Presentation className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Visión</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
