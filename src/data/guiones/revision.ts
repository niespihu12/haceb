import type { Guiones } from './tipos';
import { revisionA } from './revisionA';
import { revisionB } from './revisionB';

export const revision: Guiones = { ...revisionA, ...revisionB };
