import type { Guiones } from './tipos';
import { canal } from './canal';
import { voz } from './voz';
import { plataforma } from './plataforma';
import { proveedores } from './proveedores';
import { agenda } from './agenda';
import { revision } from './revision';
import { tablero } from './tablero';
import { mesa } from './mesa';
import { expediente } from './expediente';

export const GUIONES: Guiones = {
  ...canal,
  ...voz,
  ...plataforma,
  ...proveedores,
  ...agenda,
  ...revision,
  ...tablero,
  ...mesa,
  ...expediente,
};
