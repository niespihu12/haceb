// Prueba de humo del generador de casos: todas las ESCENAS + 60 casos aleatorios.
import { ESCENAS, generarCaso } from '../src/data/agentesData'

const ahora = new Date(2026, 9, 27, 7, 30).getTime()
const ctx = { seleccionAutomatica: true, ahoraSim: ahora }
let mal = 0

const resumen = (c: ReturnType<typeof generarCaso>) =>
  c.plan.map((e) => `${e.agente}[${e.pasos.map((p) => p.id).join(' ')}]`).join(' › ')

for (const e of ESCENAS) {
  const c = generarCaso(8000 + ESCENAS.indexOf(e), ahora, e.id === 'feliz_manual' ? { ...ctx, seleccionAutomatica: false } : ctx, { escenario: e.escenario, canal: e.canal })
  const tr = c.datos.trayectoria
  const fin = tr[tr.length - 1]
  const ids = c.plan.flatMap((x) => x.pasos.map((p) => p.id))
  const dup = ids.length - new Set(ids).size
  const snaps = c.plan.flatMap((x) => x.pasos).filter((p) => p.snapshot !== undefined).map((p) => p.snapshot as number)
  const creciente = snaps.every((s, i) => i === 0 || s >= snaps[i - 1])
  const finOk = fin.etapa === e.fin
  const nExc = new Set([...tr.flatMap((o) => (o.excepcion ? [o.excepcion.tipo] : [])), ...fin.excepcionesPrevias.map((x) => x.tipo)])
  const ultimoSnap = snaps[snaps.length - 1]
  const publicaFin = ultimoSnap === tr.length - 1
  const humanos = c.plan.flatMap((x) => x.pasos).filter((p) => p.tipo === 'espera_humana').length
  const ok = dup === 0 && creciente && finOk && publicaFin
  if (!ok) mal++
  console.log(`${ok ? 'OK ' : 'MAL'} ${e.id.padEnd(24)} fin=${fin.etapa} snaps=${tr.length} pasos=${ids.length} dup=${dup} creciente=${creciente} publicaFin=${publicaFin} novedades=[${[...nExc].join(',')}] humanos=${humanos}`)
  if (!ok) console.log('    ', resumen(c))
}
console.log('\nEjemplo tarifa_sobre_tope:\n', resumen(generarCaso(8100, ahora, ctx, { escenario: 'Tarifa_sobre_tope' })))
console.log('\nEjemplo sin_transportador:\n', resumen(generarCaso(8101, ahora, ctx, { escenario: 'Sin_transportador' })))

const conteo: Record<string, number> = {}
let incoherentes = 0
for (let s = 7001; s < 7061; s++) {
  const c = generarCaso(s, ahora, ctx)
  conteo[c.escenario] = (conteo[c.escenario] ?? 0) + 1
  const ids = c.plan.flatMap((x) => x.pasos.map((p) => p.id))
  if (ids.length !== new Set(ids).size) incoherentes++
}
console.log('\n60 casos:', conteo, 'con ids duplicados:', incoherentes, '· escenas mal:', mal)
