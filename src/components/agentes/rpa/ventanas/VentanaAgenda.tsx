// FASE 2: réplica completa (agenda centralizada de llamadas: tareas con objetivo, interlocutor y estado).
import { memo } from 'react';
import type { Caso } from '@/types/agentes';
import { horaMin } from '@/data/agentesUtil';
import type { PropsVentana } from '../tipos';
import MarcoStub, { type VistasDe } from './MarcoStub';

type Resumen = { titulo: string; datos: [string, string][] };

const VISTAS: Record<VistasDe<'agenda'>, (c: Caso) => Resumen> = {
  'agenda.central': (c) => {
    const t = c.datos.agenda;
    return {
      titulo: 'Agenda centralizada de llamadas',
      datos: [
        ['Tareas', String(t.length)],
        ...t.slice(0, 4).map((x, i): [string, string] => [`Tarea ${i + 1}`, `${horaMin(x.hora)} · ${x.objetivo} · ${x.interlocutor} (${x.estado})`]),
      ],
    };
  },
};

function VentanaAgenda(props: PropsVentana) {
  const r = (VISTAS[props.vista as VistasDe<'agenda'>] ?? VISTAS['agenda.central'])(props.caso);
  return <MarcoStub ventana="agenda" ventanaProps={props} titulo={r.titulo} datos={r.datos} />;
}

export default memo(VentanaAgenda);
