import { build } from 'esbuild';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const raiz = resolve(fileURLToPath(new URL('..', import.meta.url)));
const R = raiz.split(String.fromCharCode(92)).join('/');
const dir = mkdtempSync(join(tmpdir(), 'e3r-'));
const ent = join(dir, 'e.tsx');
writeFileSync(ent, `import { renderToStaticMarkup } from 'react-dom/server'; import { createElement } from 'react';
import V from '${R}/src/components/agentes/rpa/ventanas/VentanaProveedores.tsx';
export { generarCaso, ESCENAS } from '${R}/src/data/agentesData.ts';
export const render = (props) => renderToStaticMarkup(createElement(V, props));`);
const out = join(dir, 'o.mjs');
await build({ entryPoints: [ent], bundle: true, format: 'esm', platform: 'node', outfile: out, alias: { '@': join(raiz, 'src') }, logLevel: 'error', jsx: 'automatic', nodePaths: [join(raiz, 'node_modules')], define: { 'import.meta.env.VITE_SUPABASE_URL': 'undefined', 'import.meta.env.VITE_SUPABASE_ANON_KEY': 'undefined' } });
const { generarCaso, ESCENAS, render } = await import(pathToFileURL(out).href);
const ahora = Date.now();
let n = 0, faltan = new Set();
for (const esc of ['feliz', 'Tarifa_sobre_tope', 'Sin_transportador']) {
  const e = ESCENAS.find(x => x.escenario === esc);
  const c = generarCaso(8001, ahora, { seleccionAutomatica: true, ahoraSim: ahora }, { canal: e.canal, escenario: e.escenario });
  for (const et of c.plan) for (const p of et.pasos) {
    if (!/^(b|n)[1-4]/.test(p.id) || p.sistema !== 'proveedores') continue;
    for (const pr of [0, 0.3, 0.6, 1]) {
      const html = render({ caso: c, vista: p.vista, paso: p, progreso: pr, velocidad: 1, actor: 'agente', medir: () => undefined, relojSim: ahora });
      n++;
      for (const a of p.ui ?? []) for (const an of [a.ancla, a.destino]) if (an && !html.includes(`data-ancla="${an}"`)) faltan.add(`${esc} ${p.id} ${an}`);
    }
  }
}
const sin = render({ caso: generarCaso(8001, ahora, { seleccionAutomatica: true, ahoraSim: ahora }), vista: 'proveedores.negociacion', progreso: 0, velocidad: 1, actor: 'agente', medir: () => undefined, relojSim: ahora });
console.log('renders', n, 'sin paso ok', sin.length, 'anclas faltantes en HTML:', [...faltan]);
