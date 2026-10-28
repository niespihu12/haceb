// Imprime el plan de pasos de una escena: node scripts/plan-ver.mjs <id-escena | Tipo_de_novedad> [seq]
import { build } from 'esbuild';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const raiz = resolve(fileURLToPath(new URL('..', import.meta.url)));
const dir = mkdtempSync(join(tmpdir(), 'plan-ver-'));
const entrada = join(dir, 'entrada.ts');
writeFileSync(entrada, `export { generarCaso, ESCENAS } from ${JSON.stringify(join(raiz, 'src', 'data', 'agentesData.ts').replace(/\\/g, '/'))}`);
const salida = join(dir, 'plan.mjs');
await build({
  entryPoints: [entrada], bundle: true, format: 'esm', platform: 'node', outfile: salida,
  alias: { '@': join(raiz, 'src') }, logLevel: 'silent', jsx: 'automatic',
  define: { 'import.meta.env.VITE_SUPABASE_URL': 'undefined', 'import.meta.env.VITE_SUPABASE_ANON_KEY': 'undefined' },
});
const { generarCaso, ESCENAS } = await import(pathToFileURL(salida).href);
const arg = process.argv[2] ?? 'feliz_llamada';
const seq = Number(process.argv[3] ?? 8000);
const escena = ESCENAS.find((e) => e.id === arg || e.escenario === arg);
if (!escena) { console.error('Escena no encontrada. Opciones:', ESCENAS.map((e) => e.id).join(' ')); process.exit(1); }
const ahora = new Date(2026, 9, 27, 7, 30).getTime();
const c = generarCaso(seq, ahora, { seleccionAutomatica: escena.escenario !== 'feliz_manual', ahoraSim: ahora }, { escenario: escena.escenario, canal: escena.canal });
console.log(`Escena ${escena.id} · caso ${c.operacion.id} · canal ${c.canal} · ${c.operacion.nodoOrigen.ciudad} → ${c.operacion.nodoDestino.ciudad}\n`);
for (const e of c.plan) {
  console.log(`## ${e.agente}`);
  for (const p of e.pasos) {
    console.log(`  ${p.id.padEnd(5)} ${(p.vista ?? '—').padEnd(24)} ${String(p.duracion).padStart(5)}ms ${p.tipo === 'espera_humana' ? '[HUMANO] ' : ''}${p.ok === false ? '[✗] ' : ''}${p.texto}${p.resultado ? `  → ${p.resultado}` : ''}`);
  }
}
