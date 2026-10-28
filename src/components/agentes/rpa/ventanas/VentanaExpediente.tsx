import { memo, useLayoutEffect, useRef } from 'react';
import { CircleCheck, Folder, FolderOpen, Lock } from 'lucide-react';
import type { Operacion } from '@/types';
import type { Caso, PasoPlan } from '@/types/agentes';
import { estadoAncla, progresoEfectivo, ultimaAccionCursor } from '@/components/agentes/guion';
import { horaMinuto } from '@/components/agentes/helpers';
import { ChipRegla, Sello } from '@/components/agentes/ui';
import { EXPEDIENTE_CONTENIDO } from '@/data/procesoData';
import { T_EXPEDIENTE } from '@/data/guiones/expediente';
import type { PropsVentana } from '../tipos';
import { CROMO } from '../cromo';
import VentanaSistema from '../VentanaSistema';

const ACENTO = CROMO.expediente.barra; // #3f3f46
const idBase = (id?: string) => (id ?? '').replace(/_\d+$/, '');
const miles = (n: number) => new Intl.NumberFormat('es-CO').format(Math.round(n));
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

type Pestana = 'contenido' | 'historial' | 'trazas';
const PESTANAS: { id: Pestana; texto: string }[] = [
  { id: 'contenido', texto: 'Contenido' },
  { id: 'historial', texto: 'Historial' },
  { id: 'trazas', texto: 'Trazas' },
];

function hechoDe(caso: Caso, base: string): boolean {
  for (const et of caso.plan) for (const x of et.pasos) if (idBase(x.id) === base && caso.pasosHechos[x.id]) return true;
  return false;
}

/** Detalle de cada uno de los 10 contenidos, derivado de la operación vigente. */
function detalles(caso: Caso, o: Operacion): string[] {
  const ll = o.llamadas;
  const porInt = (k: Operacion['llamadas'][number]['interlocutor']) => ll.filter(l => l.interlocutor === k).length;
  const grabs = o.soportes.filter(s => s.tipo === 'grabacion');
  const grabsOk = grabs.filter(s => s.autorizada).length;
  const transc = o.soportes.filter(s => s.tipo === 'transcripcion').length;
  const confirmadas = ll.filter(l => l.confirmada && l.resultado === 'exitosa').length;
  const novedades = [...o.excepcionesPrevias, ...(o.excepcion ? [o.excepcion] : [])];
  const nov = novedades.length ? `${novedades.length} · ${novedades.map(e => e.titulo).slice(0, 2).join('; ')}` : 'Sin novedades';
  const cumplidos = o.compromisos.filter(c => c.estado === 'cumplido').length;
  const dec = caso.datos.decision;
  const mod = dec?.aplicada
    ? `Alternativa ${dec.aplicada.id}: ${dec.aplicada.titulo}`
    : novedades.some(e => e.resueltaPor === 'agente') ? 'Ajustes dentro de política, sin intervención humana' : 'Sin modificaciones';
  const entrega = o.soportes.filter(s => s.tipo === 'soporte_entrega' || s.tipo === 'liquidacion').length;
  const ofertas = o.ofertas.length;
  return [
    `${caso.datos.solicitud.referenciaCliente} · ${o.cliente.nombre}`,
    `${ll.length} · cliente ${porInt('cliente')}, transportador ${porInt('transportador')}, destinatario ${porInt('destinatario')}`,
    `${transc} transcripción${transc === 1 ? '' : 'es'} completas`,
    `${grabsOk} autorizada${grabsOk === 1 ? '' : 's'} de ${ll.length} llamadas · solo con permiso`,
    ofertas ? `${ofertas} oferta${ofertas === 1 ? '' : 's'}${o.tarifaPactada ? ` · pactada $ ${miles(o.tarifaPactada)}` : ''}` : 'Sin ofertas',
    `${confirmadas} confirmaciones con el interlocutor`,
    nov,
    `${o.compromisos.length} · ${cumplidos} cumplido${cumplidos === 1 ? '' : 's'}`,
    mod,
    entrega ? `${entrega} soporte${entrega === 1 ? '' : 's'} de entrega y liquidación` : 'Pendiente de entrega',
  ];
}

/** Pestaña que abre cada paso (por defecto, el contenido). */
function pestanaDe(base: string): Pestana {
  if (base === 'e2') return 'historial';
  if (base === 'e3') return 'trazas';
  return 'contenido';
}

/** Objetivo (ancla) al que apunta el cursor de un paso, para desplazar listas largas. */
function objetivoCursor(paso: PasoPlan | undefined, p: number, prefijo: string): string | undefined {
  const u = ultimaAccionCursor(paso, p);
  return u?.accion.ancla?.startsWith(prefijo) ? u.accion.ancla : undefined;
}

function VentanaExpediente({ caso, vista, paso, progreso, velocidad, actor, medir, relojSim }: PropsVentana) {
  const p = progresoEfectivo(progreso, velocidad);
  const d = caso.datos;
  const o = caso.operacion;
  const base = idBase(paso?.id);
  const pestana = pestanaDe(base);
  const enE1 = base === 'e1';
  const enE2 = base === 'e2';
  const enE3 = base === 'e3';
  const enE4 = base === 'e4';

  const sellado = hechoDe(caso, 'e4') || (enE4 && p >= T_EXPEDIENTE.e4Sellado);
  const cerrar = estadoAncla(enE4 ? paso : undefined, p, 'expediente.btn.cerrar');
  const hash = estadoAncla(enE4 ? paso : undefined, p, 'expediente.campo.hash');

  const textos = detalles(caso, o);
  // Progreso de cada paso para revelar elementos uno a uno (a p = 1 todo queda a la vista).
  const progE1 = enE1 ? clamp01((p - T_EXPEDIENTE.e1Desde) / (T_EXPEDIENTE.e1Hasta - T_EXPEDIENTE.e1Desde)) : 1;
  const progE2 = enE2 ? clamp01((p - T_EXPEDIENTE.e2Desde) / (T_EXPEDIENTE.e2Hasta - T_EXPEDIENTE.e2Desde)) : 1;
  const progE3 = enE3 ? clamp01((p - T_EXPEDIENTE.e3Desde) / (T_EXPEDIENTE.e3Hasta - T_EXPEDIENTE.e3Desde)) : 1;

  const eventos = [...o.eventos].sort((a, b) => a.timestamp - b.timestamp);
  const nOrd = Math.ceil(eventos.length * progE2);
  const trazas = o.trazas;
  const nVer = Math.ceil(trazas.length * progE3);

  // Desplazamiento imperativo hacia lo que el cursor mira (solo cambia en instantes discretos).
  const refHist = useRef<HTMLDivElement>(null);
  const refTraz = useRef<HTMLDivElement>(null);
  const objEvento = pestana === 'historial' ? objetivoCursor(paso, p, 'expediente.evento.') : undefined;
  const objTraza = pestana === 'trazas' ? objetivoCursor(paso, p, 'expediente.traza.') : undefined;
  useLayoutEffect(() => {
    const cont = refHist.current;
    if (!cont) return;
    const el = objEvento ? cont.querySelector<HTMLElement>(`[data-ancla="${objEvento}"]`) : null;
    cont.scrollTop = el ? Math.max(0, el.getBoundingClientRect().top - cont.getBoundingClientRect().top + cont.scrollTop - 4) : 0;
  }, [objEvento, caso.id, pestana]);
  useLayoutEffect(() => {
    const cont = refTraz.current;
    if (!cont) return;
    const el = objTraza ? cont.querySelector<HTMLElement>(`[data-ancla="${objTraza}"]`) : null;
    cont.scrollTop = el ? Math.max(0, el.getBoundingClientRect().top - cont.getBoundingClientRect().top + cont.scrollTop - 4) : 0;
  }, [objTraza, caso.id, pestana]);

  const nLl = o.llamadas.length;
  const nSo = o.soportes.length;

  return (
    <VentanaSistema
      ventana="expediente"
      vista={vista}
      actor={actor}
      humano={paso?.humano}
      paso={paso}
      progreso={p}
      sesion={d.sesion}
      relojSim={relojSim}
      medir={medir}
    >
      <div className="absolute inset-0 flex flex-col overflow-hidden text-slate-800" style={{ backgroundColor: CROMO.expediente.fondo }}>
        {/* Cabecera del expediente */}
        <div className="shrink-0 px-2 py-1 border-b border-stone-300 bg-white flex items-center gap-2">
          {sellado ? <Folder className="w-4 h-4 shrink-0 text-emerald-700" /> : <FolderOpen className="w-4 h-4 shrink-0" style={{ color: ACENTO }} />}
          <div className="min-w-0 flex-1 leading-[13px]">
            <div className="text-[11px] font-semibold truncate">
              <span className="font-mono">{d.expediente.numero}</span> · {o.id} · {o.cliente.nombre}
            </div>
            <div data-ancla="expediente.campo.hash" className={`text-[9.5px] font-mono truncate rounded px-0.5 ${hash.resaltado ? 'bg-amber-100' : ''} ${sellado ? 'text-emerald-800' : 'text-slate-500'}`}>
              {sellado ? <Lock className="inline w-2.5 h-2.5 mr-0.5 -mt-[1px]" /> : null}
              SHA-256 {sellado ? d.expediente.hash : 'se calcula al sellar'}
            </div>
          </div>
          {sellado ? (
            <Sello texto="Sellado" color="#047857" className="shrink-0 !text-[10px] !px-2 !py-0.5 !tracking-[0.1em]" />
          ) : (
            <span className="text-[9.5px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-[1px] shrink-0">Abierto</span>
          )}
          <span
            data-ancla="expediente.btn.cerrar"
            className={`h-[22px] px-2 inline-flex items-center gap-1 rounded text-[10px] font-semibold select-none whitespace-nowrap border ${cerrar.clic ? 'translate-y-[1px] brightness-90' : ''} ${sellado ? 'bg-stone-200 text-stone-500 border-stone-300' : 'text-white border-transparent'}`}
            style={sellado ? undefined : { backgroundColor: ACENTO }}
          >
            {sellado ? 'Cerrado' : 'Cerrar y sellar'}
          </span>
        </div>

        {/* Pestañas */}
        <div className="shrink-0 h-[20px] flex items-end gap-0.5 px-2 pt-0.5 border-b border-stone-300 bg-stone-100 text-[10px]">
          {PESTANAS.map(t => (
            <span
              key={t.id}
              className={`px-2 h-[18px] inline-flex items-center rounded-t border border-b-0 ${t.id === pestana ? 'bg-white border-stone-300 font-semibold text-slate-800' : 'border-transparent text-slate-500'}`}
            >
              {t.texto}
              <span className="ml-1 text-[9px] text-slate-400">
                {t.id === 'contenido' ? EXPEDIENTE_CONTENIDO.length : t.id === 'historial' ? eventos.length : trazas.length}
              </span>
            </span>
          ))}
        </div>

        {/* Cuerpo */}
        <div className="flex-1 min-h-0 bg-white relative">
          {pestana === 'contenido' && (
            <div className="absolute inset-0 overflow-hidden p-1.5">
              <div className="grid grid-cols-2 gap-x-2 gap-y-[3px]">
                {EXPEDIENTE_CONTENIDO.map((nombre, i) => {
                  const listo = progE1 * EXPEDIENTE_CONTENIDO.length > i;
                  const res = estadoAncla(enE1 ? paso : undefined, p, `expediente.item.${i}`).resaltado;
                  return (
                    <div
                      key={nombre}
                      data-ancla={`expediente.item.${i}`}
                      className={`flex items-start gap-1.5 rounded border px-1.5 py-[2px] h-[30px] ${res ? 'bg-amber-50 border-amber-300' : listo ? 'bg-stone-50 border-stone-200' : 'bg-white border-dashed border-stone-200'}`}
                    >
                      <span className="mt-[1px] w-3 shrink-0 flex justify-center">
                        {listo ? <CircleCheck className="w-3 h-3 text-emerald-600" /> : <span className="w-2 h-2 mt-[2px] rounded-full border border-stone-300" />}
                      </span>
                      <span className="min-w-0 leading-[12px]">
                        <span className="block text-[10px] font-semibold text-slate-800 truncate">
                          {i + 1}. {nombre} {i === 3 && <ChipRegla codigo="R30" />}
                        </span>
                        <span className={`block text-[9.5px] truncate ${listo ? 'text-slate-600' : 'text-slate-300'}`}>{listo ? textos[i] : 'reuniendo…'}</span>
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="pt-1 text-[9.5px] text-slate-500 truncate">{nLl} llamadas · {nSo} soportes · las grabaciones solo se guardan si están autorizadas</div>
            </div>
          )}

          {pestana === 'historial' && (
            <div ref={refHist} className="absolute inset-0 overflow-hidden">
              <div className="sticky top-0 z-10 flex items-center gap-2 h-[14px] px-2 text-[8.5px] uppercase tracking-wider text-slate-500 font-semibold bg-stone-100 border-b border-stone-200">
                <span className="w-[34px]">Hora</span><span className="w-[120px]">Qué ocurrió</span><span>Quién informó · qué se acordó</span>
                <span className="ml-auto normal-case tracking-normal text-slate-400">{nOrd} de {eventos.length} ordenados</span>
              </div>
              {eventos.map((e, i) => {
                const ordenado = i < nOrd;
                return (
                  <div
                    key={`${e.timestamp}-${i}`}
                    data-ancla={`expediente.evento.${i}`}
                    className={`flex items-center gap-2 h-[17px] px-2 border-b border-stone-100 text-[9.5px] whitespace-nowrap ${ordenado ? '' : 'opacity-35'}`}
                  >
                    <span className="w-[34px] font-mono tabular-nums text-slate-500">{horaMinuto(e.timestamp)}</span>
                    <span className="w-[120px] font-semibold text-slate-800 truncate">{e.evento}</span>
                    <span className="min-w-0 flex-1 truncate text-slate-600">{e.detalle}</span>
                  </div>
                );
              })}
            </div>
          )}

          {pestana === 'trazas' && (
            <div ref={refTraz} className="absolute inset-0 overflow-hidden">
              <div className="sticky top-0 z-10 flex items-center gap-2 h-[14px] px-2 text-[8.5px] uppercase tracking-wider text-slate-500 font-semibold bg-stone-100 border-b border-stone-200">
                <span>Ocurrió → información → regla → decidió → ejecutó → resultado</span>
                <span className="ml-auto normal-case tracking-normal text-slate-400">{nVer} de {trazas.length} verificadas</span>
              </div>
              {trazas.map((t, i) => {
                const ok = i < nVer;
                const activa = estadoAncla(enE3 ? paso : undefined, p, `expediente.traza.${i}`).resaltado || objTraza === `expediente.traza.${i}`;
                return (
                  <div
                    key={t.id}
                    data-ancla={`expediente.traza.${i}`}
                    className={`px-2 py-[2px] border-b border-stone-100 text-[9.5px] leading-[12px] ${activa ? 'bg-amber-50' : ''} ${ok ? '' : 'opacity-45'}`}
                  >
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      {ok ? <CircleCheck className="w-3 h-3 shrink-0 text-emerald-600" /> : <span className="w-3 h-3 shrink-0" />}
                      <span className="font-mono text-slate-500 shrink-0">{horaMinuto(t.ts)}</span>
                      <span className="text-slate-500 shrink-0">{t.ejecutor}</span>
                      <ChipRegla codigo={t.regla.split(' ')[0]} />
                      <span className="truncate text-slate-800 font-medium">{t.decidio}</span>
                    </div>
                    {activa ? (
                      <div className="pl-[18px] grid grid-cols-2 gap-x-3 text-slate-600">
                        <span className="truncate"><b className="text-slate-700">Ocurrió:</b> {t.ocurrio}</span>
                        <span className="truncate"><b className="text-slate-700">Información:</b> {t.informacion.join(' · ')}</span>
                        <span className="truncate"><b className="text-slate-700">Regla:</b> {t.regla}</span>
                        <span className="truncate"><b className="text-slate-700">Decidió:</b> {t.decidio}</span>
                        <span className="truncate"><b className="text-slate-700">Ejecutó:</b> {t.ejecuto}</span>
                        <span className="truncate"><b className="text-slate-700">Resultado:</b> {t.resultado}</span>
                      </div>
                    ) : (
                      <div className="pl-[18px] truncate text-slate-500">{t.ocurrio} → {t.ejecuto} → {t.resultado}</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </VentanaSistema>
  );
}

export default memo(VentanaExpediente);
