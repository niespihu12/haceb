import { useSyncExternalStore } from 'react';
import { agentesEngine } from '@/lib/agentesEngine';

export function useAgentes() {
  return useSyncExternalStore(agentesEngine.subscribe, agentesEngine.getSnapshot, agentesEngine.getSnapshot);
}
