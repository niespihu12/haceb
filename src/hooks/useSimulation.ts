import { useContext } from 'react';
import { SimulationContext } from '@/context/simulation-context';

export function useSimulation() {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error('useSimulation debe usarse dentro de SimulationProvider');
  return ctx;
}
