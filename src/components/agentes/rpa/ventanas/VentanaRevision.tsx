// Ventana «Revisiones del proceso»: enruta cada vista a su componente (E4a: datos, documentos, cruzada · E4b: cargue, entrega, cierre).
import { memo } from 'react';
import type { PropsVentana } from '../tipos';
import RevA from './revision/RevA';
import RevB from './revision/RevB';

function VentanaRevision(props: PropsVentana) {
  const b = props.vista === 'revision.cargue' || props.vista === 'revision.entrega' || props.vista === 'revision.cierre';
  return b ? <RevB {...props} /> : <RevA {...props} />;
}

export default memo(VentanaRevision);
