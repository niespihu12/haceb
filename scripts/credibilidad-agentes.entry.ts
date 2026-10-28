// Punto de entrada de la revisión de credibilidad de la pestaña Agentes.
// Se empaqueta con esbuild (alias «@» → src) y se importa desde Node:
//   npx esbuild scripts/credibilidad-agentes.entry.ts --bundle --platform=node --format=esm \
//     --alias:@=./src --define:import.meta.env.VITE_SUPABASE_URL=undefined \
//     --define:import.meta.env.VITE_SUPABASE_ANON_KEY=undefined --outfile=<tmp>/cred.mjs
//   const m = await import('<tmp>/cred.mjs'); m.imprimirTextos(m.generarCaso(9001, Date.now(), { seleccionAutomatica: true, ahoraSim: Date.now() }))
// Expone el generador de casos y funciones que sacan, en texto plano, todo lo
// que un caso le dice a quien lo mira (pasos, resultados, pensamientos, avisos,
// llamadas) y los datos con los que se pintan las pantallas, para que una
// persona los lea y juzgue si suenan a una operación logística real.
import type { Caso, DialogoLlamada, ItemRevision } from '@/types/agentes';

export { generarCaso, ESCENAS, AGENTES } from '@/data/agentesData';

const linea = (...partes: (string | undefined | null | false)[]) => partes.filter(Boolean).join(' ');

function itemsComoTexto(titulo: string, items: ItemRevision[]): string[] {
  return [titulo, ...items.map(i => `  ${i.ok ? '✓' : '✗'} ${i.etiqueta}: ${i.valor}${i.regla ? ` [${i.regla}]` : ''}${i.excepcion ? ` → ${i.excepcion}` : ''}`)];
}

function dialogoComoTexto(clave: string, d: DialogoLlamada): string[] {
  return [
    `Llamada «${clave}» · ${d.sentido} · ${d.objetivo} · ${d.nombre} (${d.interlocutor}) ${d.telefono} · ${d.resultado}`,
    ...d.turnos.map(t => `  ${t.quien === 'agente' ? 'Agente' : d.nombre.split(' ')[0]}${t.confirmada === false ? ' [estimado]' : ''}: ${t.texto}`),
    `  Resumen: ${d.resumen}`,
  ];
}

/** Todos los textos visibles de un caso, en orden de ejecución, una cadena por línea. */
export function textosDeCaso(caso: Caso): string[] {
  const o = caso.operacion;
  const salida: string[] = [
    `=== ${o.id} · ${o.cliente.nombre} · ${o.nodoOrigen.ciudad} → ${o.nodoDestino.ciudad} · canal ${caso.canal} · escenario ${caso.escenario}`,
    `Trayectoria: ${caso.datos.trayectoria.map(t => t.etapa).join(' → ')}`,
    `Solicitud: ${caso.datos.solicitud.asunto} · ${caso.datos.solicitud.resumen}`,
  ];
  for (const et of caso.plan) {
    salida.push('', `[${et.agente}]`);
    for (const p of et.pasos) {
      salida.push(linea(`  ${p.id}`, p.ok === false ? '✗' : '·', p.texto, p.regla && `[${p.regla}]`, p.humano && `(espera: ${p.humano.nombre}, ${p.humano.rol})`, p.estado && `{${p.estado}}`));
      if (p.resultado) salida.push(`      resultado: ${p.resultado}`);
      if (p.pensamiento) salida.push(`      piensa: ${p.pensamiento}`);
      for (const a of p.ui ?? []) {
        if (a.tipo === 'toast' || a.tipo === 'estado') salida.push(`      ${a.tipo}${a.nivel ? ` (${a.nivel})` : ''}: ${a.texto ?? ''}`);
        else if ((a.tipo === 'teclear' || a.tipo === 'pegar') && a.texto) salida.push(`      ${a.tipo}${a.actor === 'humano' ? ' (persona)' : ''}: ${a.texto}`);
        else if (a.tipo === 'dialogo' && a.dialogo) salida.push(`      diálogo: ${a.dialogo.titulo}${a.dialogo.cuerpo ? ` — ${a.dialogo.cuerpo}` : ''}${a.dialogo.botones ? ` [${a.dialogo.botones.join(' | ')}]` : ''}`);
      }
    }
  }
  salida.push('');
  for (const [clave, d] of Object.entries(caso.datos.dialogos)) salida.push(...dialogoComoTexto(clave, d));
  return salida;
}

/** Los datos con los que se pintan las pantallas: listas de chequeo, cruces, negociación, agenda, tablero y decisión. */
export function datosDeCaso(caso: Caso): string[] {
  const d = caso.datos;
  const o = caso.operacion;
  const salida: string[] = [
    `Operación ${o.id} · ${o.mercancia.tipo} · ${o.mercancia.pesoKg} kg · ${o.mercancia.volumenM3} m³ · ${o.vehiculoRequerido} · tope ${o.tarifaMaxima} · pactada ${o.tarifaPactada ?? '—'}`,
    `Expediente ${d.expediente.numero} · sesión ${d.sesion.usuario}@${d.sesion.servidor} (${d.sesion.vm})`,
    ...itemsComoTexto('Datos mínimos', d.datosMinimos),
    ...itemsComoTexto('Documentos', d.documentos),
    ...itemsComoTexto('Cargue y despacho', d.cargue),
    ...itemsComoTexto('Cierre administrativo', d.cierreAdmin),
    `Cruce de llegada: ${d.cruceLlegada.coincide ? 'coincide' : 'NO coincide'} · transportador «${d.cruceLlegada.transportador.afirma}» · cliente «${d.cruceLlegada.cliente.afirma}» · ${d.cruceLlegada.detalle}`,
    `Cruce de entrega: ${d.cruceEntrega.coincide ? 'coincide' : 'NO coincide'} · transportador «${d.cruceEntrega.transportador.afirma}» · cliente «${d.cruceEntrega.cliente.afirma}» · ${d.cruceEntrega.detalle}`,
    'Negociación:',
    ...d.negociacion.map(r => `  ${r.transportador} (${r.vehiculo}) ofrece ${r.tarifaOfrecida} → pide ${r.contrapropuesta} → final ${r.tarifaFinal ?? '—'} · ${r.estado} · compat. ${r.compatibilidad} · cumpl. ${r.cumplimiento}`),
    'Agenda:',
    ...d.agenda.map(t => `  ${new Date(t.hora).toISOString().slice(11, 16)} ${t.objetivo} · ${t.interlocutor} · ${t.actividad} (${t.estado})`),
    'Tablero:',
    ...d.tablero.map(f => `  ${f.operacion}${f.propia ? ' *' : ''} ${f.cliente} · ${f.ruta} · ${f.vehiculo} · ${f.estado} · ETA ${f.eta} (${f.confirmada ? 'confirmada' : 'estimada'})`),
  ];
  if (d.excepcion) {
    salida.push(`Novedad: ${d.excepcion.titulo} [${d.excepcion.tipo}] categoría ${d.excepcion.categoria} · política ${d.excepcion.politica}`, `  Causa: ${d.excepcion.causa}`, `  Impacto: ${d.excepcion.impacto}`);
    for (const a of d.excepcion.alternativas) salida.push(`  ${a.id}${a.id === d.excepcion.recomendada ? ' (recomendada)' : ''}: ${a.titulo} — ${a.descripcion} · ${a.impactoCosto} COP · ${a.impactoHoras} h · SLA ${a.impactoSLA}`);
  }
  if (d.decision) salida.push(`Decisión: ${d.decision.humano.nombre} (${d.decision.humano.rol}) → ${d.decision.decision}${d.decision.alternativa ? ` alt. ${d.decision.alternativa}` : ''}`);
  return salida;
}

/** Imprime en la consola todos los textos del caso. */
export function imprimirTextos(caso: Caso): void {
  console.log(textosDeCaso(caso).join('\n'));
}

/** Imprime en la consola los datos de las pantallas del caso. */
export function imprimirDatos(caso: Caso): void {
  console.log(datosDeCaso(caso).join('\n'));
}
