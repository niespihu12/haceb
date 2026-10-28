// E4b: guiones de revision.cargue (o3, k1, k2), revision.entrega (g2, y1, y2) y revision.cierre (z2, z3, z4).
// Todo sale de caso.datos (cargue, cruceEntrega, cierreAdmin): el guion y la ventana cuentan lo mismo.
import type { AccionUI, DatosCaso, ItemRevision, Vista } from '@/types/agentes';
import { PLANTILLA_EXCEPCION } from '@/data/mockData';
import { horaMin } from '@/data/agentesUtil';
import type { CtxGuion, Guion, Guiones } from './tipos';

/* ─── Anclas y configuración compartida con RevB.tsx ─── */
export const anclaRevB = (id: string) => `revision.item.${id}`;
export const BTN_APROBAR = 'revision.btn.aprobar';
export const BTN_DEVOLVER = 'revision.btn.devolver';
/** Botón del diálogo de y1 (diferencia de entrega): «No cerrar la operación: generar novedad». */
export const BTN_NO_CERRAR = 'dlg.btn.no-cerrar-la-operacion-generar-novedad';
/** Botón del diálogo de z3 (sobrecosto): «Retener el cierre hasta la autorización». */
export const BTN_RETENER = 'dlg.btn.retener-el-cierre-hasta-la-autorizacion';

export interface PasoLista { revisa: string[]; previos: string[] }
/** Ítems que revisa cada paso y los que ya estaban revisados por los pasos anteriores. */
export const PASOS_CARGUE: Record<string, PasoLista> = {
  o3: { revisa: ['espera'], previos: [] },
  k1: { revisa: ['espera', 'condiciones'], previos: [] },
  k2: { revisa: ['unidades', 'remision', 'sellos', 'salida'], previos: ['espera', 'condiciones'] },
};
export const PASOS_CIERRE: Record<string, PasoLista> = {
  z2: { revisa: ['documentos', 'soportes'], previos: [] },
  z3: { revisa: ['economicas', 'adicionales'], previos: ['documentos', 'soportes'] },
  z4: { revisa: ['novedades'], previos: ['documentos', 'soportes', 'economicas', 'adicionales'] },
};

/* ─── Utilidades ─── */
const item = (lista: ItemRevision[], id: string): ItemRevision | undefined => lista.find(i => i.id === id);
const fallan = (lista: ItemRevision[], ids: string[]) => lista.filter(i => ids.includes(i.id) && !i.ok);
const nombreNovedad = (lista: ItemRevision[]) => {
  const t = lista.find(i => !i.ok && i.excepcion)?.excepcion;
  return t ? PLANTILLA_EXCEPCION[t].nombre : 'novedad';
};
const ordenar = (ui: AccionUI[]): AccionUI[] => ui.map((a, i) => ({ a, i })).sort((x, y) => x.a.t - y.a.t || x.i - y.i).map(x => x.a);

/** Lectura ítem por ítem: el cursor se acerca (mover) y el ítem se marca (resaltar). */
function lectura(ids: string[], etiquetas: (id: string) => string, t0: number, t1: number): AccionUI[] {
  const slot = (t1 - t0) / ids.length;
  const ui: AccionUI[] = [];
  ids.forEach((id, i) => {
    const s = t0 + i * slot;
    ui.push({ t: s, tipo: 'mover', ancla: anclaRevB(id) });
    ui.push({ t: s + slot * 0.55, hasta: s + slot * 0.98, tipo: 'resaltar', ancla: anclaRevB(id), texto: etiquetas(id) });
  });
  return ui;
}

/* ═══════════════ revision.cargue ═══════════════ */
type FnPensamiento = (lista: ItemRevision[], malos: ItemRevision[]) => string;

function pasoLista(
  vista: Vista,
  lista: (d: DatosCaso) => ItemRevision[],
  cfg: PasoLista,
  inicio: string,
  pensar: FnPensamiento,
  opts: { vigilar?: boolean; dialogo?: (d: DatosCaso, malos: ItemRevision[]) => AccionUI; btnDialogo?: string; t1?: number } = {},
): Guion {
  return ({ d }: CtxGuion) => {
    const items = lista(d);
    const malos = opts.vigilar ? [] : fallan(items, cfg.revisa);
    const bien = malos.length === 0;
    const etiq = (id: string) => {
      const it = item(items, id);
      return opts.vigilar ? 'Dentro del parámetro de 90 min' : it ? (it.ok ? it.etiqueta : `No cumple · ${it.etiqueta}`) : id;
    };
    const t1 = opts.t1 ?? 0.74;
    const ui: AccionUI[] = [
      { t: 0, tipo: 'estado', texto: inicio },
      ...lectura(cfg.revisa, etiq, 0.05, t1),
    ];
    if (bien) {
      ui.push(
        { t: t1 + 0.04, tipo: 'mover', ancla: BTN_APROBAR },
        { t: t1 + 0.1, tipo: 'clic', ancla: BTN_APROBAR },
        { t: t1 + 0.14, hasta: 1, tipo: 'estado', texto: opts.vigilar ? 'Sin espera que supere el parámetro (R16)' : 'Revisión conforme', nivel: 'ok' },
      );
    } else {
      ui.push(
        { t: t1 + 0.02, tipo: 'mover', ancla: BTN_DEVOLVER },
        { t: t1 + 0.07, tipo: 'clic', ancla: BTN_DEVOLVER },
        { t: t1 + 0.1, hasta: 1, tipo: 'estado', texto: `No cumple: ${malos.map(m => m.etiqueta).join(' · ')}`, nivel: 'error' },
        { t: t1 + 0.1, hasta: 1, tipo: 'toast', texto: `Novedad «${nombreNovedad(items)}» · ${malos[0]?.regla ?? ''}`.trim(), nivel: 'aviso' },
      );
      if (opts.dialogo) {
        const dlg = opts.dialogo(d, malos);
        ui.push(dlg);
        if (opts.btnDialogo) {
          ui.push(
            { t: Math.max(dlg.t + 0.17, 0.86), tipo: 'mover', ancla: opts.btnDialogo },
            { t: Math.max(dlg.t + 0.23, 0.92), hasta: 0.95, tipo: 'clic', ancla: opts.btnDialogo },
          );
        }
      }
    }
    return { vista, ui: ordenar(ui), pensamiento: pensar(items, malos) };
  };
}

const cargueDe = (d: DatosCaso) => d.cargue;
const cierreDe = (d: DatosCaso) => d.cierreAdmin;
const val = (lista: ItemRevision[], id: string) => item(lista, id)?.valor ?? '';

const o3: Guion = pasoLista(
  'revision.cargue', cargueDe, PASOS_CARGUE.o3,
  'Vigilando el tiempo de espera en el punto de cargue…',
  () => 'Miro cuánto lleva el vehículo esperando en el punto de cargue frente al parámetro de 90 minutos de R16; por ahora no lo supera, así que dejo la vigilancia abierta mientras avanza el cargue.',
  { vigilar: true, t1: 0.7 },
);

const k1: Guion = pasoLista(
  'revision.cargue', cargueDe, PASOS_CARGUE.k1,
  'Siguiendo el avance del cargue…',
  (lista, malos) => malos.length
    ? `Veo «${val(lista, 'espera')}»: pasó el parámetro de R16, así que no sigo esperando en silencio y registro la novedad de espera en el cargue para el coordinador.`
    : `El cargue avanza: la espera fue de ${val(lista, 'espera')} y la carga está en orden (${val(lista, 'condiciones').toLowerCase()}), dentro del parámetro de R16.`,
  { t1: 0.7 },
);

const k2: Guion = pasoLista(
  'revision.cargue', cargueDe, PASOS_CARGUE.k2,
  'Confirmando unidades, remisión, sellos y hora real de salida…',
  (lista, malos) => malos.length
    ? `Comparo lo despachado con lo solicitado y no cuadra: ${val(lista, 'unidades').toLowerCase()} y la remisión queda ${val(lista, 'remision').toLowerCase()}. Según R17 registro la diferencia antes de dejar salir la carga.`
    : `Cuento las unidades contra la remisión firmada (${val(lista, 'unidades').toLowerCase()}), verifico los sellos y dejo la hora real de salida en ${val(lista, 'salida')}; todo cuadra con R17.`,
  { t1: 0.76 },
);

/* ═══════════════ revision.entrega ═══════════════ */
const T_G2 = { mover: 0.06, marca: 0.5, clic: 0.8 } as const;

const g2: Guion = ({ d }: CtxGuion) => {
  const op = d.trayectoria[d.trayectoria.length - 1] ?? d.trayectoria[0];
  const lugar = op.nodoDestino.lugar;
  const receptor = op.receptor?.nombre ?? op.cliente.contacto;
  const hora = op.horaEntrega ? horaMin(op.horaEntrega) : null;
  const ui: AccionUI[] = [
    { t: 0, tipo: 'estado', texto: `Registrando la llegada a ${lugar}…` },
    { t: T_G2.mover, tipo: 'mover', ancla: anclaRevB('llegada') },
    { t: T_G2.marca, hasta: 0.78, tipo: 'resaltar', ancla: anclaRevB('llegada'), texto: 'Llegada confirmada con recepción' },
    { t: 0.72, tipo: 'mover', ancla: BTN_APROBAR },
    { t: T_G2.clic, tipo: 'clic', ancla: BTN_APROBAR },
    { t: 0.86, hasta: 1, tipo: 'estado', texto: `Llegada a ${lugar}${hora ? ` · ${hora}` : ''} confirmada por ${receptor}`, nivel: 'ok' },
  ];
  return {
    vista: 'revision.entrega',
    ui: ordenar(ui),
    pensamiento: `Registro la llegada del vehículo a ${lugar} y la confirmo con ${receptor} en recepción antes de dar por iniciada la entrega, como pide R16.`,
  };
};

const y1: Guion = ({ d }: CtxGuion) => {
  const x = d.cruceEntrega;
  const ui: AccionUI[] = [
    { t: 0, tipo: 'estado', texto: `Cruzando lo informado con lo confirmado · ${x.titulo}` },
    { t: 0.05, tipo: 'mover', ancla: anclaRevB('transportador') },
    { t: 0.3, hasta: 0.36, tipo: 'resaltar', ancla: anclaRevB('transportador'), texto: x.transportador.fuente },
    { t: 0.32, tipo: 'mover', ancla: anclaRevB('cliente') },
    { t: 0.56, hasta: 0.62, tipo: 'resaltar', ancla: anclaRevB('cliente'), texto: x.cliente.fuente },
    { t: 0.58, tipo: 'mover', ancla: anclaRevB('veredicto') },
    { t: 0.66, hasta: 0.72, tipo: 'resaltar', ancla: anclaRevB('veredicto'), texto: x.coincide ? 'Coinciden' : 'No coinciden' },
  ];
  if (x.coincide) {
    ui.push(
      { t: 0.72, tipo: 'mover', ancla: BTN_APROBAR },
      { t: 0.78, tipo: 'clic', ancla: BTN_APROBAR },
      { t: 0.84, hasta: 1, tipo: 'estado', texto: `${x.detalle}`, nivel: 'ok' },
    );
  } else {
    ui.push(
      { t: 0.7, tipo: 'mover', ancla: BTN_DEVOLVER },
      { t: 0.74, tipo: 'clic', ancla: BTN_DEVOLVER },
      {
        t: 0.76, hasta: 0.955, tipo: 'dialogo',
        dialogo: {
          tipo: 'confirmar',
          titulo: 'La entrega no coincide',
          cuerpo: `${x.detalle}. La operación no se cierra automáticamente: se genera una novedad para que el coordinador pida evidencias.`,
          botones: ['No cerrar la operación: generar novedad'],
          regla: 'R23',
        },
      },
      { t: 0.86, tipo: 'mover', ancla: BTN_NO_CERRAR },
      { t: 0.92, hasta: 0.95, tipo: 'clic', ancla: BTN_NO_CERRAR },
      { t: 0.96, hasta: 1, tipo: 'estado', texto: 'Novedad generada · la operación no se cierra (R23)', nivel: 'error' },
    );
  }
  return {
    vista: 'revision.entrega',
    ui: ordenar(ui),
    pensamiento: x.coincide
      ? 'Pongo lado a lado lo que informó el transportador y lo que confirmó el destinatario: dicen lo mismo, así que según R23 puedo dar la entrega por confirmada.'
      : `Lo que informó el transportador y lo que confirma el destinatario no coinciden: «${x.cliente.afirma}». Según R23 no cierro la operación; genero la novedad para que el coordinador pida evidencias.`,
  };
};

const y2: Guion = ({ d }: CtxGuion) => {
  const ui: AccionUI[] = [
    { t: 0, tipo: 'estado', texto: 'Solicitando los soportes de entrega…' },
    { t: 0.06, tipo: 'mover', ancla: BTN_APROBAR },
    { t: 0.14, tipo: 'clic', ancla: BTN_APROBAR },
    { t: 0.2, tipo: 'mover', ancla: anclaRevB('soporte') },
    { t: 0.62, hasta: 0.7, tipo: 'resaltar', ancla: anclaRevB('soporte'), texto: 'Soporte de entrega cargado' },
    { t: 0.74, hasta: 1, tipo: 'estado', texto: 'EntregaConfirmada · soporte cargado', nivel: 'ok' },
    { t: 0.74, hasta: 0.98, tipo: 'toast', texto: `Soporte de entrega en el expediente · ${d.expediente.numero}`, nivel: 'ok' },
  ];
  return {
    vista: 'revision.entrega',
    ui: ordenar(ui),
    pensamiento: 'Pido el soporte firmado de la entrega y lo dejo en el expediente: sin ese documento no puedo pasar al cierre administrativo.',
  };
};

/* ═══════════════ revision.cierre ═══════════════ */
const z2: Guion = pasoLista(
  'revision.cierre', cierreDe, PASOS_CIERRE.z2,
  'Revisando la documentación final del servicio…',
  lista => `Reviso la documentación final: ${val(lista, 'documentos').toLowerCase()}, y el soporte de entrega ya está en el expediente. Con eso cumplo la primera condición del cierre de R25.`,
  { t1: 0.7 },
);

const z3: Guion = pasoLista(
  'revision.cierre', cierreDe, PASOS_CIERRE.z3,
  'Revisando condiciones económicas y costos adicionales…',
  (lista, malos) => malos.length
    ? `Comparo lo pactado con lo cobrado: ${val(lista, 'economicas')}, pero hay costos adicionales que nadie autorizó (${val(lista, 'adicionales').toLowerCase()}). Según R25 no cierro; retengo el cierre hasta que se autorice.`
    : `${val(lista, 'economicas')} y ${val(lista, 'adicionales').toLowerCase()}: lo cobrado está dentro de lo negociado y de lo autorizado, como exige R25.`,
  {
    t1: 0.5,
    btnDialogo: BTN_RETENER,
    dialogo: (d, malos) => ({
      t: 0.62, hasta: 0.955, tipo: 'dialogo',
      dialogo: {
        tipo: 'confirmar',
        titulo: 'Costos adicionales sin autorización',
        cuerpo: `${malos[0]?.valor ?? val(d.cierreAdmin, 'adicionales')}. El cierre administrativo queda retenido hasta que el responsable autorice el costo.`,
        botones: ['Retener el cierre hasta la autorización'],
        regla: 'R25',
      },
    }),
  },
);

const z4: Guion = pasoLista(
  'revision.cierre', cierreDe, PASOS_CIERRE.z4,
  'Revisando las novedades que afectan la liquidación…',
  lista => {
    const v = val(lista, 'novedades');
    return /^Sin /i.test(v)
      ? 'Repaso el historial del servicio y no hay novedades que cambien la liquidación; según R25 el cierre puede seguir sin ajustes.'
      : `Repaso el historial del servicio: ${v}. Cada una quedó resuelta y registrada, así que la liquidación puede seguir según R25.`;
  },
  { t1: 0.6 },
);

/** Guiones de revision.cargue / .entrega / .cierre. Las variantes por novedad comparten el guion: todo sale de los datos. */
export const revisionB: Guiones = {
  o3,
  k1,
  'Espera_en_cargue:k1': k1,
  k2,
  'Diferencia_despacho:k2': k2,
  g2,
  y1,
  'Diferencia_entrega:y1': y1,
  y2,
  z2,
  z3,
  'Sobrecosto_liquidacion:z3': z3,
  z4,
};
