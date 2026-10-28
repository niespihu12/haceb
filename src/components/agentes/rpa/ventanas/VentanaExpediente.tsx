// FASE 2: réplica completa (expediente e historial: los 10 contenidos y la línea de tiempo).
import { memo } from 'react';
import type { Caso } from '@/types/agentes';
import type { PropsVentana } from '../tipos';
import MarcoStub, { type VistasDe } from './MarcoStub';

type Resumen = { titulo: string; datos: [string, string][] };

const VISTAS: Record<VistasDe<'expediente'>, (c: Caso) => Resumen> = {
  'expediente.expediente': (c) => {
    const o = c.operacion;
    return {
      titulo: 'Expediente e historial',
      datos: [
        ['Expediente', c.datos.expediente.numero],
        ['Sello', `${c.datos.expediente.hash.slice(0, 24)}…`],
        ['Eventos', String(o.eventos.length)],
        ['Soportes', String(o.soportes.length)],
        ['Trazas', String(o.trazas.length)],
        ['Estado', o.etapa],
      ],
    };
  },
};

function VentanaExpediente(props: PropsVentana) {
  const r = (VISTAS[props.vista as VistasDe<'expediente'>] ?? VISTAS['expediente.expediente'])(props.caso);
  return <MarcoStub ventana="expediente" ventanaProps={props} titulo={r.titulo} datos={r.datos} />;
}

export default memo(VentanaExpediente);
