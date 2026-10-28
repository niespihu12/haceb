import { useEffect } from 'react';
import { useSimulation } from '@/hooks/useSimulation';
import { agentesEngine } from '@/lib/agentesEngine';

/**
 * Conecta el motor de agentes con la simulación global: mismo play/pausa/
 * detener, misma velocidad y mismo interruptor de selección automática (R09);
 * cada operación que procesan los agentes existe también en el pipeline
 * general (origen 'agentes').
 */
export default function AgentesBridge() {
  const { isRunning, tick, speed, seleccionAutomatica, ahora, registrarOperacionExterna, publicarOperacionExterna } = useSimulation();

  useEffect(() => {
    agentesEngine.setCallbacks({ onNuevaOperacion: registrarOperacionExterna, onOperacion: publicarOperacionExterna });
  }, [registrarOperacionExterna, publicarOperacionExterna]);

  useEffect(() => {
    agentesEngine.setVelocidad(speed);
  }, [speed]);

  useEffect(() => {
    agentesEngine.setContexto({ seleccionAutomatica, ahoraSim: ahora });
  }, [seleccionAutomatica, ahora]);

  useEffect(() => {
    if (isRunning) agentesEngine.start();
    else if (tick === 0) agentesEngine.reset();
    else agentesEngine.pause();
  }, [isRunning, tick]);

  return null;
}
