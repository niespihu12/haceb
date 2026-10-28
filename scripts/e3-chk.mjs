import { build } from 'esbuild';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const raiz = resolve(fileURLToPath(new URL('..', import.meta.url)));
const dir = mkdtempSync(join(tmpdir(), 'e3-'));
const ent = join(dir, 'e.ts');
const R = raiz.split(String.fromCharCode(92)).join('/');
writeFileSync(ent, `export { generarCaso, ESCENAS } from '${R}/src/data/agentesData.ts'; export { modeloBase, modeloNeg, pesos } from '${R}/src/data/guiones/proveedores.ts'`);
const out = join(dir, 'o.mjs');
await build({ entryPoints: [ent], bundle: true, format: 'esm', platform: 'node', outfile: out, alias: { '@': join(raiz, 'src') }, logLevel: 'silent', jsx: 'automatic', define: { 'import.meta.env.VITE_SUPABASE_URL': 'undefined', 'import.meta.env.VITE_SUPABASE_ANON_KEY': 'undefined' } });
const { generarCaso, modeloBase, modeloNeg, pesos } = await import(pathToFileURL(out).href);
const ahora = Date.now();
let mal = 0, tot = 0;
for (let seq = 7001; seq < 7061; seq++) {
  const c = generarCaso(seq, ahora, { seleccionAutomatica: true, ahoraSim: ahora });
  const mb = modeloBase(c.datos), mn = modeloNeg(c.datos);
  for (const e of c.plan) for (const p of e.pasos) {
    if (p.id === 'b2' || p.id === 'b2_2') { tot++; const n = +/^(\d+)/.exec(p.resultado)[1]; if (n !== mb.quedan) { mal++; console.log(seq, c.escenario, mb.vehiculo, p.id, p.resultado, 'modelo', mb.quedan); } }
    if (p.id === 'b4_2' || (p.id === 'b4' && p.ok !== false)) { tot++; const n = +/^(\d+)/.exec(p.resultado)[1]; if (n !== mb.candidatas.length) { mal++; console.log(seq, 'cand', p.resultado, mb.candidatas.length); } }
    if (p.id === 'n4') { tot++; const t = pesos(mn.aceptada?.tarifa ?? 0); if (!p.resultado.endsWith(t)) { mal++; console.log(seq, c.escenario, p.resultado, t); } }
    if (p.id === 'n2' && mn.rondas[0]) { tot++; if (!p.resultado.includes(pesos(mn.rondas[0].tarifaOfrecida))) { mal++; console.log(seq, 'n2', p.resultado); } }
  }
}
console.log('comprobaciones', tot, 'discrepancias', mal);
