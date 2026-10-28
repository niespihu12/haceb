// FASE 2: réplica completa (consola de voz: llamada en curso, transcripción turno a turno, confirmado / estimado).
import { memo } from 'react';
import type { Caso } from '@/types/agentes';
import type { PropsVentana } from '../tipos';
import MarcoStub, { type VistasDe } from './MarcoStub';

type Resumen = { titulo: string; datos: [string, string][] };

const VISTAS: Record<VistasDe<'voz'>, (c: Caso) => Resumen> = {
  'voz.consola': (c) => {
    const d = Object.values(c.datos.dialogos)[0];
    if (!d) return { titulo: 'Consola de voz', datos: [['Llamada', 'Sin llamada en curso']] };
    return {
      titulo: 'Consola de voz · llamada del agente',
      datos: [
        ['Interlocutor', `${d.nombre} (${d.interlocutor}) · ${d.telefono}`],
        ['Objetivo', d.objetivo],
        ['Sentido', d.sentido],
        ['Turnos', String(d.turnos.length)],
        ['Resultado', d.resultado.replace(/_/g, ' ')],
        ['Resumen', d.resumen],
      ],
    };
  },
};

function VentanaVoz(props: PropsVentana) {
  const r = (VISTAS[props.vista as VistasDe<'voz'>] ?? VISTAS['voz.consola'])(props.caso);
  return <MarcoStub ventana="voz" ventanaProps={props} titulo={r.titulo} datos={r.datos} />;
}

export default memo(VentanaVoz);
