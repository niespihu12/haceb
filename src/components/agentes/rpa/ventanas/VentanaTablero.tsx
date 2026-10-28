// FASE 2: réplica completa (tablero oscuro de seguimiento en ruta con ETA estimada / confirmada).
import { memo } from 'react';
import type { Caso } from '@/types/agentes';
import type { PropsVentana } from '../tipos';
import MarcoStub, { type VistasDe } from './MarcoStub';

type Resumen = { titulo: string; datos: [string, string][] };

const VISTAS: Record<VistasDe<'tablero'>, (c: Caso) => Resumen> = {
  'tablero.seguimiento': (c) => {
    const f = c.datos.tablero;
    return {
      titulo: 'Seguimiento en ruta',
      datos: [
        ['En tránsito', String(f.length)],
        ...f.slice(0, 4).map((x): [string, string] => [x.operacion, `${x.ruta} · ${x.estado} · ETA ${x.eta} (${x.confirmada ? 'confirmada' : 'estimada'})`]),
      ],
    };
  },
};

function VentanaTablero(props: PropsVentana) {
  const r = (VISTAS[props.vista as VistasDe<'tablero'>] ?? VISTAS['tablero.seguimiento'])(props.caso);
  return <MarcoStub ventana="tablero" ventanaProps={props} titulo={r.titulo} datos={r.datos} oscuro />;
}

export default memo(VentanaTablero);
