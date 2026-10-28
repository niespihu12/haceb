// Prueba de humo del motor: siembra, corre 400 ticks y revisa coherencia básica.
import { crearRng } from '../src/lib/rng'
import { nuevaOperacion, relojEn, seedOperaciones, simularDecisionHumana, transicionar } from '../src/data/motor'
import { TIPOS_EXCEPCION, esTerminal } from '../src/data/mockData'
import type { Operacion, TipoExcepcion } from '../src/types'

const rng = crearRng(7)
const ops: Operacion[] = seedOperaciones(26, relojEn(0), true, 38)
const porEtapa = (xs: Operacion[]) => xs.reduce<Record<string, number>>((a, o) => ((a[o.etapa] = (a[o.etapa] ?? 0) + 1), a), {})
console.log('semilla', ops.length, porEtapa(ops))

const vistas = new Set<TipoExcepcion>()
let wipMax = 0
let wipMin = 999
let errores = 0
for (let t = 1; t <= 400; t++) {
  const ts = relojEn(t)
  if (rng() < 0.5) ops.push(nuevaOperacion(ts, rng).operacion)
  const activas = ops.filter((o) => !esTerminal(o.etapa) && o.etapa !== 'Escalada')
  const barajadas = [...activas].sort(() => rng() - 0.5).slice(0, Math.max(3, Math.round(activas.length * 0.34)))
  for (const o of barajadas) {
    try {
      const r = transicionar(o, { ahora: ts, rng, seleccionAutomatica: t % 100 < 70 })
      if (r) ops[ops.findIndex((x) => x.id === o.id)] = r.operacion
    } catch (e) {
      errores++
      console.log('ERROR', o.id, o.etapa, (e as Error).message)
    }
  }
  for (const o of ops.filter((x) => x.etapa === 'Escalada' && x.excepcion)) {
    if (rng() > 0.22) continue
    const r = transicionar(o, { ahora: ts, rng, seleccionAutomatica: true, decisionHumana: simularDecisionHumana(o.excepcion!, rng) })
    if (r) ops[ops.findIndex((x) => x.id === o.id)] = r.operacion
  }
  for (const o of ops) {
    if (o.excepcion) vistas.add(o.excepcion.tipo)
    o.excepcionesPrevias.forEach((e) => vistas.add(e.tipo))
  }
  const wip = ops.filter((o) => !esTerminal(o.etapa)).length
  if (t > 60) {
    wipMax = Math.max(wipMax, wip)
    wipMin = Math.min(wipMin, wip)
  }
}
console.log('final', ops.length, porEtapa(ops))
console.log('WIP (t>60) min/max', wipMin, wipMax, '· errores', errores)
console.log('excepciones vistas', vistas.size, '/', TIPOS_EXCEPCION.length, TIPOS_EXCEPCION.filter((t) => !vistas.has(t)))
const cerr = ops.find((o) => o.etapa === 'Cerrada')
console.log('cerrada ejemplo', cerr?.id, 'llamadas', cerr?.llamadas.length, 'trazas', cerr?.trazas.length, 'eventos', cerr?.eventos.length, 'tarifa', cerr?.tarifaPactada, 'extra', cerr?.costosAdicionales)
// Forzar cada excepción desde la etapa que corresponde
let fallas = 0
for (const t of TIPOS_EXCEPCION) {
  const base = nuevaOperacion(relojEn(0), rng).operacion
  let o = base
  let guard = 0
  const etapaObjetivo = { Datos_incompletos: 'Validacion', Sin_respuesta: 'Preventiva', Tarifa_sobre_tope: 'Negociacion', Sin_transportador: 'Busqueda', Seleccion_manual: 'Seleccion', Mercancia_no_lista: 'Preventiva', Retraso_transportador: 'Preventiva', Diferencia_llegada: 'Presentacion', Espera_en_cargue: 'Cargue', Diferencia_despacho: 'Cargue', Novedad_en_ruta: 'Transito', Conductor_ocupado: 'Transito', Destinatario_no_recibe: 'AvisoDestino', Demora_en_descargue: 'Descargue', Diferencia_entrega: 'ValidacionEntrega', Inconformidad_cliente: 'LlamadaCierre', Sobrecosto_liquidacion: 'CierreAdmin' }[t]
  while (o.etapa !== etapaObjetivo && guard++ < 80) {
    const r = transicionar(o, { ahora: relojEn(guard), rng: crearRng(guard), seleccionAutomatica: true, forzar: { resolver: true } })
    if (!r) break
    o = r.operacion
  }
  const f = transicionar(o, { ahora: relojEn(90), rng, seleccionAutomatica: true, forzar: { excepcion: t } })
  const ok = f && f.operacion.excepcion?.tipo === t
  if (!ok) {
    fallas++
    console.log('NO SE PUDO FORZAR', t, 'en', o.etapa, '→', f?.operacion.excepcion?.tipo)
    continue
  }
  // Resolver con la recomendada y comprobar que sigue
  let x = f!.operacion
  if (x.etapa === 'Escalada') {
    const r = transicionar(x, { ahora: relojEn(95), rng, seleccionAutomatica: true, decisionHumana: { decision: 'AUTORIZAR', por: 'Prueba' } })
    x = r!.operacion
  } else {
    x = transicionar(x, { ahora: relojEn(95), rng, seleccionAutomatica: true })!.operacion
  }
  console.log('OK', t.padEnd(24), '→', x.etapa, x.excepcion ? '(aún con excepción)' : '')
}
console.log('fallas al forzar', fallas)
