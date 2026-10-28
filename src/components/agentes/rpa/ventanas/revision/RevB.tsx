// FASE 2 (E4b): réplica completa de revision.cargue, .entrega y .cierre (listas de chequeo ítem por ítem y cruces transportador vs. cliente).
import { memo } from 'react';
import type { Caso, Cruce, ItemRevision } from '@/types/agentes';
import type { PropsVentana } from '../../tipos';
import MarcoStub, { type VistasDe } from '../MarcoStub';

type Resumen = { titulo: string; datos: [string, string][] };

function lista(titulo: string, items: ItemRevision[]): Resumen {
  const fallan = items.filter(i => !i.ok);
  return {
    titulo,
    datos: [
      ['Ítems', `${items.length - fallan.length} de ${items.length} en orden`],
      ...items.slice(0, 3).map((i): [string, string] => [i.etiqueta, `${i.valor}${i.ok ? '' : ' (no cumple)'}`]),
      ['No cumplen', fallan.length ? fallan.map(i => i.etiqueta).join(' · ') : 'ninguno'],
    ],
  };
}

function cruce(titulo: string, x: Cruce): Resumen {
  return {
    titulo,
    datos: [
      ['Transportador', `${x.transportador.fuente}: ${x.transportador.afirma}`],
      ['Cliente', `${x.cliente.fuente}: ${x.cliente.afirma}`],
      ['Coincide', x.coincide ? 'sí' : 'no'],
      ['Detalle', x.detalle],
    ],
  };
}

const VISTAS: Partial<Record<VistasDe<'revision'>, (c: Caso) => Resumen>> = {
  'revision.cargue': (c) => lista('Control de cargue y despacho', c.datos.cargue),
  'revision.entrega': (c) => cruce('Cruce de entrega', c.datos.cruceEntrega),
  'revision.cierre': (c) => lista('Cierre administrativo', c.datos.cierreAdmin),
};

function RevB(props: PropsVentana) {
  const r = (VISTAS[props.vista as VistasDe<'revision'>] ?? VISTAS['revision.cargue']!)(props.caso);
  return <MarcoStub ventana="revision" ventanaProps={props} titulo={r.titulo} datos={r.datos} />;
}

export default memo(RevB);
