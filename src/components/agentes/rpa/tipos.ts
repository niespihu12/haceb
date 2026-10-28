import type { ActorUI, Caso, PasoPlan, Vista } from '@/types/agentes';
import type { Rect } from '@/components/agentes/guion';

export type { Rect };

/**
 * Props que recibe cada ventana del escritorio RPA. Todo lo que se ve es
 * función pura de `progreso` (0–1 del paso) + lo ya hecho en `caso.pasosHechos`.
 * `medir(ancla)` devuelve la posición de un `[data-ancla]` relativa al escritorio
 * (para menús contextuales); el cursor la usa por su cuenta.
 */
export interface PropsVentana {
  caso: Caso;
  vista: Vista;
  paso?: PasoPlan;
  progreso: number;
  velocidad: number;
  actor: ActorUI;
  medir: (ancla: string) => Rect | undefined;
  relojSim: number;
}
