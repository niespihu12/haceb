// Verificación de la pestaña Agentes sin navegador:
//   node scripts/verificar-agentes.mjs            → revisa 60 casos + una por cada ESCENA
//   node scripts/verificar-agentes.mjs <escena>   → además imprime el plan de esa escena
// Comprueba coherencia del plan: ids únicos, snapshots no decrecientes, estados
// finales (Cerrada | Cancelada y coincidencia con `escena.fin`), guiones con
// anclas existentes y acciones ordenadas por `t`, un diálogo por paso, actores
// humanos en las esperas, y que los componentes de `components/agentes` no usen
// timers (`setTimeout`/`setInterval`) ni `AnimatePresence` ni `layoutId`.
// Si no revisa nada, falla: nunca imprime «0 incoherencias» en vacío.
import { build } from 'esbuild';
import { mkdtempSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const raiz = resolve(fileURLToPath(new URL('..', import.meta.url)));
const salida = join(mkdtempSync(join(tmpdir(), 'agentes-')), 'agentes.mjs');

await build({
  entryPoints: [join(raiz, 'scripts', 'entrada-verificacion.ts')],
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile: salida,
  alias: { '@': join(raiz, 'src') },
  define: { 'import.meta.env.VITE_SUPABASE_URL': 'undefined', 'import.meta.env.VITE_SUPABASE_ANON_KEY': 'undefined' },
  logLevel: 'silent',
  jsx: 'automatic',
});

function listar(dir) {
  const out = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) out.push(...listar(p));
    else if (/\.tsx?$/.test(e)) out.push(p);
  }
  return out;
}

// Quita comentarios para no marcar como infracción una mención en un comentario.
const sinComentarios = (txt) => txt.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');

// ── Fuentes de components/agentes: anclas declaradas y reglas de oro ──
const anclasDeclaradas = new Set();
const prefijosDinamicos = [];
const problemas = [];
const archivos = listar(join(raiz, 'src', 'components', 'agentes'));
for (const f of archivos) {
  const txt = readFileSync(f, 'utf8');
  for (const m of txt.matchAll(/data-ancla=\{?["'`]([^"'`}]+)["'`]/g)) {
    const a = m[1];
    if (a.includes('${')) prefijosDinamicos.push(a.split('${')[0]);
    else anclasDeclaradas.add(a);
  }
  for (const m of txt.matchAll(/data-ancla=\{`([^`]+)`\}/g)) prefijosDinamicos.push(m[1].split('${')[0]);
  const limpio = sinComentarios(txt);
  const rel = relative(raiz, f).replace(/\\/g, '/');
  for (const [re, que] of [[/\bsetTimeout\b/, 'setTimeout'], [/\bsetInterval\b/, 'setInterval'], [/\bAnimatePresence\b/, 'AnimatePresence'], [/\blayoutId\b/, 'layoutId']]) {
    if (re.test(limpio)) problemas.push(`${rel}: usa ${que} (los componentes de agentes deben ser función pura del progreso)`);
  }
}
const anclaExiste = (a) => anclasDeclaradas.has(a) || /^dlg\./.test(a) || /^taskbar/.test(a) || prefijosDinamicos.some(p => a.startsWith(p));

const mod = await import(pathToFileURL(salida).href);
const { generarCaso, ESCENAS, AGENTES } = mod;
const VENTANAS = ['canal', 'voz', 'plataforma', 'proveedores', 'agenda', 'revision', 'tablero', 'mesa', 'expediente'];
const ahora = Date.now();
const ctx = { seleccionAutomatica: true, ahoraSim: ahora };
const nota = (caso, msg) => problemas.push(`${caso.id} [${caso.escenario}/${caso.canal}] ${msg}`);
let comprobaciones = 0;
const ok = (cond, caso, msg) => { comprobaciones++; if (!cond) nota(caso, msg); };

if (!Array.isArray(ESCENAS) || ESCENAS.length === 0) problemas.push('ESCENAS vacío: no hay escenas que revisar');
if (!Array.isArray(AGENTES) || AGENTES.length !== 12) problemas.push(`se esperaban 12 agentes y hay ${AGENTES?.length ?? 0}`);

const casos = [];
for (let seq = 7001; seq < 7061; seq++) casos.push(generarCaso(seq, ahora, ctx));
(ESCENAS ?? []).forEach((e, i) => casos.push(generarCaso(8001 + i, ahora, ctx, { canal: e.canal, escenario: e.escenario })));

let pasosTotales = 0;
let conGuion = 0;
const vistas = new Set();
const esperasHumanas = { total: 0, conGuion: 0 };
for (const caso of casos) {
  const ids = new Set();
  let ultimoSnap = -1;
  const agentesPlan = caso.plan.map(e => e.agente);
  ok(!!caso.operacion && !!caso.datos?.solicitud, caso, 'el caso no trae operación o solicitud');
  ok(caso.datos.trayectoria[0]?.id === caso.operacion.id, caso, 'la operación no coincide con el primer snapshot de la trayectoria');
  ok(agentesPlan[0] === 'receptor', caso, 'el plan no empieza en el Receptor');
  ok(agentesPlan[agentesPlan.length - 1] === 'torre', caso, 'el plan no termina en la Torre');
  let hayEsperaHumana = false;
  for (const et of caso.plan) {
    ok(AGENTES.some(a => a.id === et.agente), caso, `agente desconocido ${et.agente}`);
    ok(et.pasos.length > 0, caso, `etapa ${et.agente} sin pasos`);
    for (const p of et.pasos) {
      pasosTotales++;
      ok(!ids.has(p.id), caso, `id de paso repetido ${p.id}`);
      ids.add(p.id);
      ok(p.duracion > 0, caso, `paso ${p.id} sin duración`);
      if (p.sistema) ok(VENTANAS.includes(p.sistema), caso, `sistema desconocido «${p.sistema}» en ${p.id}`);
      if (p.snapshot !== undefined) {
        ok(p.snapshot >= ultimoSnap, caso, `snapshot retrocede en ${p.id} (${p.snapshot} < ${ultimoSnap})`);
        const snap = caso.datos.trayectoria[p.snapshot];
        ok(!!snap, caso, `snapshot ${p.snapshot} inexistente en ${p.id}`);
        if (snap && p.estado) ok(snap.etapa === p.estado, caso, `estado ${p.estado} ≠ snapshot ${snap.etapa} en ${p.id}`);
        ultimoSnap = p.snapshot;
      }
      if (p.tipo === 'espera_humana') {
        hayEsperaHumana = true;
        esperasHumanas.total++;
        ok(!!p.humano?.nombre, caso, `espera humana sin persona en ${p.id}`);
      }
      if (p.vista) {
        vistas.add(p.vista);
        ok(VENTANAS.includes(p.vista.split('.')[0]), caso, `vista desconocida «${p.vista}» en ${p.id}`);
      }
      if (p.pensamiento) ok(!/\bIA\b|%/.test(p.pensamiento), caso, `pensamiento con «IA» o porcentaje en ${p.id}`);
      if (p.ui?.length) {
        conGuion++;
        let t = -1;
        let dialogos = 0;
        for (const a of p.ui) {
          ok(a.t >= t - 1e-9, caso, `acciones desordenadas en ${p.id} (t=${a.t} tras ${t})`);
          t = Math.max(t, a.t);
          if (a.tipo === 'dialogo') dialogos++;
          if (a.ancla) ok(anclaExiste(a.ancla), caso, `ancla ${a.ancla} no existe en el DOM (${p.id})`);
          if (a.destino) ok(anclaExiste(a.destino), caso, `destino ${a.destino} no existe en el DOM (${p.id})`);
          if (a.tipo === 'teclear' && a.texto) ok(p.duracion * ((a.hasta ?? 1) - a.t) >= 300, caso, `tecleo < 300 ms en ${p.id}`);
          if (a.tipo === 'ventana' && a.vista) {
            vistas.add(a.vista);
            ok(VENTANAS.includes(a.vista.split('.')[0]), caso, `vista desconocida «${a.vista}» en ${p.id}`);
          }
        }
        ok(dialogos <= 1, caso, `${dialogos} diálogos en ${p.id}`);
        if (p.tipo === 'espera_humana') {
          esperasHumanas.conGuion++;
          ok(p.ui.some(a => a.actor === 'humano'), caso, `espera humana sin acciones del humano en ${p.id}`);
        }
      }
    }
  }
  if (caso.datos.decision) ok(hayEsperaHumana, caso, 'hay decisión humana pero el plan no tiene espera humana');
  const fin = caso.datos.trayectoria[caso.datos.trayectoria.length - 1];
  ok(['Cerrada', 'Cancelada'].includes(fin.etapa), caso, `trayectoria termina en ${fin.etapa}`);
  const esperado = ESCENAS.find(e => e.escenario === caso.escenario);
  if (esperado && caso.seq >= 8001) ok(esperado.fin === fin.etapa, caso, `fin ${fin.etapa} ≠ esperado ${esperado.fin}`);
}

const resumen = {};
for (const c of casos) resumen[c.escenario] = (resumen[c.escenario] ?? 0) + 1;
console.log(`Archivos revisados: ${archivos.length} · casos: ${casos.length} · escenas: ${ESCENAS?.length ?? 0} · pasos: ${pasosTotales} · pasos con guion: ${conGuion} · comprobaciones: ${comprobaciones}`);
console.log('Escenarios:', Object.entries(resumen).map(([k, v]) => `${k} ${v}`).join(' · '));
console.log(`Vistas: ${vistas.size ? [...vistas].sort().join(', ') : '(ninguna: los guiones aún no están escritos)'}`);
console.log(`Esperas humanas: ${esperasHumanas.total} (con guion del humano: ${esperasHumanas.conGuion})`);

if (casos.length === 0 || pasosTotales === 0 || comprobaciones === 0) {
  console.log('\nNo se revisó nada: no hay casos, pasos o comprobaciones.');
  process.exit(3);
}
if (problemas.length) {
  console.log(`\n${problemas.length} incoherencia(s):`);
  for (const p of problemas.slice(0, 60)) console.log(' -', p);
  process.exit(1);
}
console.log(`\n0 incoherencias en ${comprobaciones} comprobaciones.`);

// node scripts/verificar-agentes.mjs <id de escena>  → imprime el plan de esa escena
const escenaPedida = process.argv[2];
if (escenaPedida) {
  const e = ESCENAS.find(x => x.id === escenaPedida);
  if (!e) { console.log('Escena desconocida:', escenaPedida, '· disponibles:', ESCENAS.map(x => x.id).join(', ')); process.exit(2); }
  const caso = generarCaso(8100, ahora, ctx, { canal: e.canal, escenario: e.escenario });
  console.log(`\n=== ${e.etiqueta} · ${caso.operacion.id} · ${caso.operacion.cliente.nombre} · ${caso.canal} · ${caso.operacion.nodoOrigen.ciudad} → ${caso.operacion.nodoDestino.ciudad}`);
  console.log('Trayectoria:', caso.datos.trayectoria.map(p => p.etapa).join(' → '));
  for (const et of caso.plan) {
    console.log(`\n[${et.agente}]`);
    for (const p of et.pasos) console.log(`  ${p.id.padEnd(6)} ${p.ok === false ? '✗' : '·'} ${p.texto}${p.estado ? `  {${p.estado}${p.snapshot !== undefined ? ' #' + p.snapshot : ''}}` : ''}${p.regla ? ` [${p.regla}]` : ''}${p.resultado ? `\n         → ${p.resultado}` : ''}`);
  }
}
