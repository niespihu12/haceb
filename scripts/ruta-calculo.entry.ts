// Imprime el cálculo de la Ruta de implementación con el estado inicial: node scripts/ruta-calculo.mjs (ver README).
import { IMPLEMENTACION_HACEB } from '../src/data/implementacionData'
import { derivarRuta, formatSemanas, levantamientoInicial } from '../src/lib/rutaImplementacion'

const lev = levantamientoInicial(IMPLEMENTACION_HACEB, '2026-11-02')
const r = derivarRuta(IMPLEMENTACION_HACEB, lev)
console.log('días totales', r.diasTotal, '·', formatSemanas(r.diasTotal), '· requiere Discovery:', r.requiereDiscovery)
for (const f of r.fases) console.log(`  fase ${f.capa.numero} ${f.capa.nombre.padEnd(26)} trabajo ${String(f.diasTrabajo).padStart(4)} · faltantes ${String(f.diasEspera).padStart(4)} · total ${String(f.dias).padStart(4)} · estado ${f.estado}`)
console.log('camino feliz', r.diasCaminoFeliz, '· por faltantes', r.diasEspera, '· fin', r.fin)
