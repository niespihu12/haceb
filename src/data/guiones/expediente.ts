import type { AccionUI } from '@/types/agentes';
import type { CtxGuion, Guion, Guiones } from './tipos';

/** Instantes de los pasos del expediente (compartidos por guion y ventana). */
export const T_EXPEDIENTE = {
  /** e1 · los 10 contenidos se van reuniendo. */
  e1Desde: 0.04, e1Hasta: 0.86,
  /** e2 · el historial se ordena evento a evento. */
  e2Desde: 0.04, e2Hasta: 0.88,
  /** e3 · cada traza se verifica con su cadena completa. */
  e3Desde: 0.04, e3Hasta: 0.86,
  /** e4 · clic en cerrar y sello. */
  e4Clic: 0.3, e4Sellado: 0.4,
} as const;

const redondear = (v: number) => Math.round(v * 1000) / 1000;
const ultimo = (c: CtxGuion) => c.d.trayectoria[c.d.trayectoria.length - 1];

const e1: Guion = (c: CtxGuion) => {
  const fin = ultimo(c);
  const nLl = fin.llamadas.length;
  const nSo = fin.soportes.length;
  const idx = [0, 1, 3, 4, 7, 9];
  const ui: AccionUI[] = [
    { t: 0, tipo: 'ventana', vista: 'expediente.expediente' },
    { t: 0.02, hasta: T_EXPEDIENTE.e1Hasta, tipo: 'estado', texto: 'Reuniendo el contenido del expediente…' },
    ...idx.map<AccionUI>((i, k) => ({ t: redondear(0.05 + k * 0.14), tipo: 'mover', ancla: `expediente.item.${i}` })),
    { t: 0.4, hasta: 0.56, tipo: 'resaltar', ancla: 'expediente.item.3', texto: 'R30' },
    { t: 0.88, hasta: 1, tipo: 'toast', texto: `${nLl} llamadas · ${nSo} soportes en el expediente`, nivel: 'ok' },
    { t: 0.88, hasta: 1, tipo: 'estado', texto: `${nLl} llamadas · ${nSo} soportes · grabaciones solo si están autorizadas`, nivel: 'ok' },
  ];
  ui.sort((a, b) => a.t - b.t);
  return {
    vista: 'expediente.expediente',
    ui,
    pensamiento: `Reúno en el expediente la solicitud, las ${nLl} llamadas con todas sus transcripciones y solo las grabaciones autorizadas (R30), más los soportes de entrega.`,
  };
};

const e2: Guion = (c: CtxGuion) => {
  const fin = ultimo(c);
  const n = Math.max(1, fin.eventos.length);
  const ui: AccionUI[] = [
    { t: 0, tipo: 'ventana', vista: 'expediente.expediente' },
    { t: 0.02, hasta: T_EXPEDIENTE.e2Hasta + 0.04, tipo: 'estado', texto: 'Ordenando el historial por fecha y hora…' },
    { t: 0.06, tipo: 'mover', ancla: 'expediente.evento.0' },
    { t: 0.48, tipo: 'mover', ancla: `expediente.evento.${Math.ceil(n / 2) - 1}` },
    { t: 0.9, tipo: 'mover', ancla: `expediente.evento.${n - 1}` },
    { t: 0.92, hasta: 1, tipo: 'toast', texto: `${n} eventos ordenados cronológicamente`, nivel: 'ok' },
    { t: 0.92, hasta: 1, tipo: 'estado', texto: `${n} eventos · qué ocurrió, quién informó y qué se acordó`, nivel: 'ok' },
  ];
  return {
    vista: 'expediente.expediente',
    ui,
    pensamiento: `Ordeno el historial de la operación por fecha y hora: ${n} eventos que dicen qué ocurrió, quién dio cada información y qué quedó pendiente.`,
  };
};

const e3: Guion = (c: CtxGuion) => {
  const fin = ultimo(c);
  const n = Math.max(1, fin.trazas.length);
  const puntos = [0, Math.floor(n / 3), Math.floor((2 * n) / 3), n - 1];
  const ui: AccionUI[] = [
    { t: 0, tipo: 'ventana', vista: 'expediente.expediente' },
    { t: 0.02, hasta: T_EXPEDIENTE.e3Hasta + 0.04, tipo: 'estado', texto: 'Verificando la cadena de cada decisión…' },
    ...puntos.map<AccionUI>((i, k) => ({ t: redondear(0.05 + k * 0.25), tipo: 'mover', ancla: `expediente.traza.${i}` })),
    { t: 0.9, hasta: 1, tipo: 'toast', texto: `${n} decisiones trazadas · cadena completa`, nivel: 'ok' },
    { t: 0.9, hasta: 1, tipo: 'estado', texto: `${n} decisiones · ocurrió → información → regla → decidió → ejecutó → resultado`, nivel: 'ok' },
  ];
  return {
    vista: 'expediente.expediente',
    ui,
    pensamiento: `Verifico las ${n} trazas del expediente: cada decisión debe mostrar qué ocurrió, qué información usó, qué regla aplicó, qué decidió, qué ejecutó y su resultado (R26).`,
  };
};

const e4: Guion = (c: CtxGuion) => {
  const num = c.d.expediente.numero;
  const ui: AccionUI[] = [
    { t: 0, tipo: 'ventana', vista: 'expediente.expediente' },
    { t: 0.02, hasta: T_EXPEDIENTE.e4Sellado, tipo: 'estado', texto: 'Cerrando y sellando el expediente…' },
    { t: 0.1, tipo: 'mover', ancla: 'expediente.btn.cerrar' },
    { t: T_EXPEDIENTE.e4Clic, tipo: 'clic', ancla: 'expediente.btn.cerrar' },
    { t: 0.55, tipo: 'mover', ancla: 'expediente.campo.hash' },
    { t: T_EXPEDIENTE.e4Sellado, hasta: 1, tipo: 'toast', texto: `Expediente ${num} cerrado y sellado`, nivel: 'ok' },
    { t: T_EXPEDIENTE.e4Sellado, hasta: 1, tipo: 'estado', texto: `${num} · sello SHA-256 ${c.d.expediente.hash.slice(0, 16)}…`, nivel: 'ok' },
  ];
  ui.sort((a, b) => a.t - b.t);
  return {
    vista: 'expediente.expediente',
    ui,
    pensamiento: `Cierro y sello el expediente ${num}: queda completo y consultable para auditoría, con sus grabaciones autorizadas y todas las transcripciones (R30).`,
  };
};

export const expediente: Guiones = { e1, e2, e3, e4 };
