import { createContext } from 'react';
import type {
  CanalMetrics,
  DecisionHumana,
  FiltrosOperacion,
  LogEntry,
  MetricaKPI,
  Operacion,
  SimulacionVelocidad,
  TipoExcepcion,
} from '@/types';

export interface SimulationContextType {
  operaciones: Operacion[];
  allOperaciones: Operacion[];
  logs: LogEntry[];
  tick: number;
  /** Reloj de la operación (avanza MINUTOS_POR_TICK por tick; salta noches y domingos). */
  ahora: number;
  speed: SimulacionVelocidad;
  isRunning: boolean;
  /** Interruptor «Selección automática» (R09): si está activo la plataforma elige al transportador. */
  seleccionAutomatica: boolean;
  setSeleccionAutomatica: (v: boolean) => void;
  kpis: MetricaKPI;
  canalMetrics: CanalMetrics[];
  filters: FiltrosOperacion;
  setFilters: (f: FiltrosOperacion) => void;
  play: () => void;
  pause: () => void;
  stop: () => void;
  setSpeed: (s: SimulacionVelocidad) => void;
  /** Avanza la operación una etapa (o resuelve la novedad si está en manos del agente). */
  avanzarOperacion: (id: string) => void;
  /** Decisión del coordinador en la Mesa: vuelve al proceso como evento estructurado. */
  decidirOperacion: (id: string, decision: DecisionHumana, alternativa?: 'A' | 'B' | 'C' | 'D') => void;
  /** Cancela el servicio con causa registrada (requiere al responsable, R28). */
  cancelarOperacion: (id: string) => void;
  /** Fuerza una novedad sobre la operación (demo y Director de escena). */
  forzarExcepcion: (id: string, tipo: TipoExcepcion) => void;
  /** Pestaña Agentes: registra en el pipeline una operación que mueve el equipo de agentes (origen 'agentes'). */
  registrarOperacionExterna: (o: Operacion) => void;
  /** Pestaña Agentes: publica el nuevo estado (snapshot) de una operación de los agentes. */
  publicarOperacionExterna: (o: Operacion, mensaje: string, ts: number) => void;
}

export const SimulationContext = createContext<SimulationContextType | null>(null);
