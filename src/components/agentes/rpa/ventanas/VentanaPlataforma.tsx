// FASE 2: réplica completa (ficha de la operación y comparativo de ofertas).
import { memo } from 'react';
import type { Caso } from '@/types/agentes';
import { formatCOP, formatFechaDia } from '@/lib/utils';
import type { PropsVentana } from '../tipos';
import MarcoStub, { type VistasDe } from './MarcoStub';

type Resumen = { titulo: string; datos: [string, string][] };

const VISTAS: Record<VistasDe<'plataforma'>, (c: Caso) => Resumen> = {
  'plataforma.operacion': (c) => {
    const o = c.operacion;
    return {
      titulo: 'Ficha de la operación',
      datos: [
        ['Operación', o.id],
        ['Cliente', o.cliente.nombre],
        ['Ruta', `${o.nodoOrigen.ciudad} → ${o.nodoDestino.ciudad} · ${o.distanciaKm} km`],
        ['Mercancía', `${o.mercancia.tipo} · ${o.mercancia.pesoKg.toLocaleString('es-CO')} kg`],
        ['Vehículo', o.vehiculoRequerido],
        ['Cargue', formatFechaDia(o.fechaCargue)],
      ],
    };
  },
  'plataforma.seleccion': (c) => {
    const o = c.operacion;
    const ofertas = c.datos.negociacion.slice(0, 3).map(r => `${r.transportador}: ${formatCOP(r.tarifaFinal ?? r.tarifaOfrecida)}`);
    return {
      titulo: 'Comparativo de ofertas',
      datos: [
        ['Ofertas', String(c.datos.negociacion.length)],
        ['Detalle', ofertas.join(' · ') || 'sin ofertas'],
        ['Tope autorizado', formatCOP(o.tarifaMaxima)],
        ['Seleccionado', o.transportador ? `${o.transportador.nombre} · ${o.transportador.placa}` : 'pendiente'],
      ],
    };
  },
};

function VentanaPlataforma(props: PropsVentana) {
  const r = (VISTAS[props.vista as VistasDe<'plataforma'>] ?? VISTAS['plataforma.operacion'])(props.caso);
  return <MarcoStub ventana="plataforma" ventanaProps={props} titulo={r.titulo} datos={r.datos} />;
}

export default memo(VentanaPlataforma);
