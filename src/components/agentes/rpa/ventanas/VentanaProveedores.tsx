// FASE 2: réplica completa (base de proveedores con filtros y puntaje; hoja de negociación con rondas).
import { memo } from 'react';
import type { Caso } from '@/types/agentes';
import { formatCOP } from '@/lib/utils';
import type { PropsVentana } from '../tipos';
import MarcoStub, { type VistasDe } from './MarcoStub';

type Resumen = { titulo: string; datos: [string, string][] };

const VISTAS: Record<VistasDe<'proveedores'>, (c: Caso) => Resumen> = {
  'proveedores.base': (c) => {
    const n = c.datos.negociacion;
    return {
      titulo: 'Base de proveedores',
      datos: [
        ['Vehículo requerido', c.operacion.vehiculoRequerido],
        ['Candidatos', String(n.length)],
        ...n.slice(0, 3).map((r, i): [string, string] => [`Candidato ${i + 1}`, `${r.transportador} · compat. ${r.compatibilidad} · cumpl. ${r.cumplimiento}`]),
      ],
    };
  },
  'proveedores.negociacion': (c) => {
    const r = c.datos.negociacion[0];
    return {
      titulo: 'Hoja de negociación',
      datos: [
        ['Tope autorizado', formatCOP(c.operacion.tarifaMaxima)],
        ['Transportador', r ? r.transportador : 'sin candidato'],
        ['Tarifa ofrecida', r ? formatCOP(r.tarifaOfrecida) : '—'],
        ['Contrapropuesta', r ? formatCOP(r.contrapropuesta) : '—'],
        ['Tarifa final', r?.tarifaFinal ? formatCOP(r.tarifaFinal) : 'pendiente'],
      ],
    };
  },
};

function VentanaProveedores(props: PropsVentana) {
  const r = (VISTAS[props.vista as VistasDe<'proveedores'>] ?? VISTAS['proveedores.base'])(props.caso);
  return <MarcoStub ventana="proveedores" ventanaProps={props} titulo={r.titulo} datos={r.datos} />;
}

export default memo(VentanaProveedores);
