import type { Vista, VentanaId } from '@/types/agentes';
import { progresoEfectivo } from '@/components/agentes/guion';
import type { PropsVentana } from '../tipos';
import { CROMO } from '../cromo';
import VentanaSistema from '../VentanaSistema';

/** Vistas de una ventana (por prefijo antes del punto). */
export type VistasDe<P extends string> = Extract<Vista, `${P}.${string}`>;

export interface PropsMarcoStub {
  ventana: VentanaId;
  ventanaProps: PropsVentana;
  /** Título de la vista abierta. */
  titulo: string;
  /** Pares etiqueta / valor tomados de `caso.datos` y `caso.operacion`. */
  datos: [string, string][];
  /** Ventana de tema oscuro (tablero). */
  oscuro?: boolean;
}

/**
 * Marco mínimo de las ventanas provisionales: `VentanaSistema` + título de la
 * vista + unos pocos datos del caso, para que el escritorio funcione ya.
 * FASE 2: cada ventana se reemplaza por su réplica completa y este archivo se elimina.
 */
export default function MarcoStub({ ventana, ventanaProps, titulo, datos, oscuro = false }: PropsMarcoStub) {
  const { caso, vista, paso, progreso, velocidad, actor, medir, relojSim } = ventanaProps;
  const p = progresoEfectivo(progreso, velocidad);
  const humano = paso?.humano ?? (actor === 'humano' ? caso.datos.decision?.humano : undefined);
  const c = CROMO[ventana];
  return (
    <VentanaSistema
      ventana={ventana}
      vista={vista}
      actor={actor}
      humano={humano}
      paso={paso}
      progreso={p}
      sesion={caso.datos.sesion}
      relojSim={relojSim}
      medir={medir}
      color={humano?.color}
    >
      <div className="absolute inset-0 overflow-y-auto p-3" style={{ backgroundColor: c.fondo }}>
        <div className={`text-[13px] font-semibold ${oscuro ? 'text-slate-100' : 'text-slate-800'}`}>{titulo}</div>
        <div className={`font-mono text-[10px] mb-2 ${oscuro ? 'text-slate-400' : 'text-slate-500'}`}>{vista} · {caso.operacion.id}</div>
        <dl className="grid grid-cols-[110px_1fr] gap-x-3 gap-y-1 text-[11.5px]">
          {datos.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className={oscuro ? 'text-slate-400' : 'text-slate-500'}>{k}</dt>
              <dd className={`min-w-0 break-words ${oscuro ? 'text-slate-100' : 'text-slate-800'}`}>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </VentanaSistema>
  );
}
