import type { Canal } from '@/types';
import type { DatosCaso, Escenario, Humano, PasoPlan, SistemaId } from '@/types/agentes';

/** Contexto que recibe cada guion al construirse el plan de un caso. */
export interface CtxGuion {
  d: DatosCaso;
  canal: Canal;
  escenario: Escenario;
  seq: number;
  id: string;
  duracion: number;
  ok: boolean;
  humano?: Humano;
  sistema?: SistemaId;
}

/** Un guion devuelve la pantalla abierta, las acciones del cursor y el pensamiento del agente para un paso. */
export type Guion = (c: CtxGuion) => Pick<PasoPlan, 'vista' | 'ui' | 'pensamiento'>;

/**
 * Clave del guion: `id` del paso (a1, v3…) o `${variante}:${id}` cuando el
 * mismo id significa otra cosa segun el canal o el escenario
 * (p. ej. `no_estructurado:n2`, `rechazo:l1`).
 */
export type Guiones = Record<string, Guion>;
