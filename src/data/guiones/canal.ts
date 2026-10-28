import type { Canal } from '@/types';
import type { AccionUI, DatosCaso, Vista } from '@/types/agentes';
import { CANAL_INFO } from '@/data/mockData';
import type { CtxGuion, Guion, Guiones } from './tipos';

/* ─── Anclas de la ventana «canal» (bandeja de solicitudes) ─── */
export const ANCLA_CANAL = {
  btnAbrir: 'canal.btn.abrir',
  remitente: 'canal.campo.remitente',
  contacto: 'canal.campo.contacto',
  referencia: 'canal.campo.referencia',
  asunto: 'canal.campo.asunto',
  resumen: 'canal.campo.resumen',
  crudo: 'canal.campo.crudo',
} as const;

/** Ancla de la fila de la solicitud del caso (`canal.fila.<referencia en minúsculas>`). */
export const anclaFilaCaso = (d: DatosCaso): string => `canal.fila.${d.solicitud.referenciaCliente.toLowerCase()}`;

/* ─── Instantes compartidos con VentanaCanal ─── */
/** a1: la solicitud entra a la bandeja. */
export const T_LLEGADA = 0.12;
/** a1: el agente selecciona la fila. */
export const T_CLIC_FILA = 0.45;
/** a1: pulsa «Abrir». */
export const T_CLIC_ABRIR = 0.58;
/** a1: se abre la ficha de la solicitud. */
export const T_ABRE = 0.62;

/** Título del bloque «crudo» según el canal de entrada. */
export const ETIQUETA_CRUDO: Record<Canal, string> = {
  llamada_ia: 'Datos capturados en la llamada',
  formulario: 'Campos del formulario',
  integracion: 'Mensaje recibido · JSON',
  coordinador: 'Nota del coordinador',
};

const ordenar = (ui: AccionUI[]): AccionUI[] => ui.map((a, i) => ({ a, i })).sort((x, y) => x.a.t - y.a.t || x.i - y.i).map(x => x.a);
const minuscula = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

const a1: Guion = ({ d, canal }: CtxGuion) => {
  const info = CANAL_INFO[canal];
  const s = d.solicitud;
  const fila = anclaFilaCaso(d);
  const ui: AccionUI[] = [
    { t: 0, tipo: 'estado', texto: 'Revisando la bandeja de solicitudes…' },
    { t: T_LLEGADA, hasta: T_CLIC_FILA, tipo: 'toast', texto: `Nueva solicitud por ${minuscula(info.label)} · ${s.referenciaCliente}`, nivel: 'info' },
    { t: T_LLEGADA, tipo: 'estado', texto: `1 solicitud nueva · ${info.label} · ${s.referenciaCliente}`, nivel: 'ok' },
    { t: 0.28, tipo: 'mover', ancla: fila },
    { t: T_CLIC_FILA, tipo: 'clic', ancla: fila },
    { t: 0.52, tipo: 'mover', ancla: ANCLA_CANAL.btnAbrir },
    { t: T_CLIC_ABRIR, tipo: 'clic', ancla: ANCLA_CANAL.btnAbrir },
    { t: T_ABRE, tipo: 'estado', texto: `${s.asunto} · ${s.remitente}` },
  ];
  return {
    vista: 'canal.bandeja' as Vista,
    ui: ordenar(ui),
    pensamiento: `Entró «${s.asunto}» de ${s.remitente} por ${canal === 'llamada_ia' ? 'llamada' : minuscula(info.label)}. La abro desde la bandeja para leerla completa antes de registrar nada: según R26, toda solicitud queda ligada a un interlocutor, una operación y una actividad, y la conservo en el expediente (R30).`,
  };
};

/**
 * a2 de la bandeja (formulario, integración y coordinador). En llamada, a2 es de la consola de voz:
 * aquí no devuelve nada. `voz.ts` puede delegar en `a2Bandeja` para los canales que no son llamada.
 */
export const a2Bandeja: Guion = ({ d, canal }: CtxGuion) => {
  if (canal === 'llamada_ia') return {};
  const info = CANAL_INFO[canal];
  const s = d.solicitud;
  const que = canal === 'formulario' ? 'el formulario' : canal === 'integracion' ? 'la solicitud del sistema del cliente' : 'el registro del coordinador';
  const verbo = canal === 'formulario' ? 'Leyendo el formulario' : canal === 'integracion' ? 'Leyendo la solicitud del sistema del cliente' : 'Leyendo el registro del coordinador';
  const ui: AccionUI[] = [
    { t: 0, tipo: 'estado', texto: `${verbo} · ${s.referenciaCliente}` },
    { t: 0.04, tipo: 'mover', ancla: ANCLA_CANAL.remitente },
    { t: 0.08, hasta: 0.24, tipo: 'resaltar', ancla: ANCLA_CANAL.remitente, texto: 'Remitente identificado' },
    { t: 0.26, hasta: 0.4, tipo: 'resaltar', ancla: ANCLA_CANAL.referencia, texto: 'Referencia del cliente' },
    { t: 0.4, hasta: 0.54, tipo: 'resaltar', ancla: ANCLA_CANAL.asunto, texto: 'Asunto' },
    { t: 0.54, tipo: 'mover', ancla: ANCLA_CANAL.resumen },
    { t: 0.56, hasta: 0.76, tipo: 'resaltar', ancla: ANCLA_CANAL.resumen, texto: 'Ruta, mercancía y fecha de cargue' },
    { t: 0.78, tipo: 'mover', ancla: ANCLA_CANAL.crudo },
    { t: 0.8, hasta: 0.96, tipo: 'resaltar', ancla: ANCLA_CANAL.crudo, texto: `${info.corto} · ${s.crudo.length} líneas` },
    { t: 0.9, tipo: 'estado', texto: `${s.referenciaCliente} leída · ${s.resumen}`, nivel: 'ok' },
  ];
  return {
    vista: 'canal.bandeja' as Vista,
    ui: ordenar(ui),
    pensamiento: `Leo ${que} de ${s.remitente} (${s.referenciaCliente}) línea por línea y separo lo que el cliente dejó dicho de lo que falta: ruta, mercancía y fecha de cargue quedan listas para guardarse y, según R01, el Validador revisará después los nueve datos mínimos.`,
  };
};

/** Guiones de la ventana «canal». Claves: id de paso o `variante:id`. */
export const canal: Guiones = {
  a1,
  a2: a2Bandeja,
};
