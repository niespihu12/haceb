import type { AccionUI, DatosCaso, TareaAgenda, Vista } from '@/types/agentes';
import { horaMin } from '@/data/agentesUtil';
import type { CtxGuion, Guion, Guiones } from './tipos';

/* ─── Anclas de la ventana «agenda» (agenda centralizada de llamadas) ─── */
export const ANCLA_AGENDA = {
  objetivo: 'agenda.campo.objetivo',
  interlocutor: 'agenda.campo.interlocutor',
  actividad: 'agenda.campo.actividad',
  hora: 'agenda.campo.hora',
  btnAgendar: 'agenda.btn.agendar',
  btnReprogramar: 'agenda.btn.reprogramar',
  sincronizacion: 'agenda.panel.sincronizacion',
} as const;

/** Ancla de una fila de la agenda (`agenda.fila.<clave>`). */
export const anclaFila = (clave: string): string => `agenda.fila.${clave}`;

/* ─── Instantes compartidos con VentanaAgenda ─── */
/** p4: se pulsa «Agendar» y aparece el compromiso. */
export const T_P4_GUARDA = 0.82;
/** c4: primera tarea (transportador) guardada; segunda (cliente) en edición; segunda guardada. */
export const T_C4_GUARDA1 = 0.52;
export const T_C4_FORM2 = 0.56;
export const T_C4_GUARDA2 = 0.8;
/** g1: se pulsa «Agendar» y aparece la tarea de recepción. */
export const T_G1_GUARDA = 0.46;
/** x2: se marca la tarea original como reprogramada y se crea la nueva. */
export const T_X2_CREA = 0.6;
/** x4: se confirma la información y se actualizan las tareas relacionadas. */
export const T_X4_SYNC = 0.5;

/* ─── Datos de la reprogramación (también los usa la ventana) ─── */
/** Tarea que quedó sin contacto (la que la gestión automática reprograma). */
export const tareaSinContacto = (d: DatosCaso): TareaAgenda | undefined => d.agenda.find(t => t.estado === 'reprogramada');

/** Minutos de espera de la reprogramación, tomados del título de la alternativa recomendada (30 por defecto). */
export function minutosReintento(d: DatosCaso): number {
  const alt = d.excepcion?.alternativas.find(a => a.id === d.excepcion?.recomendada);
  const m = /(\d+)\s*min/i.exec(alt?.titulo ?? '');
  return m ? Number(m[1]) : 30;
}

export const tituloAlternativa = (d: DatosCaso): string => d.excepcion?.alternativas.find(a => a.id === d.excepcion?.recomendada)?.titulo ?? 'Reprogramar el contacto';

/** Duración de un tecleo para que dure al menos ~320 ms reales. */
const spanTecleo = (duracion: number): number => Math.min(0.62, Math.ceil((320 / Math.max(1, duracion)) * 100) / 100 + 0.02);

const ordenar = (ui: AccionUI[]): AccionUI[] => ui.map((a, i) => ({ a, i })).sort((x, y) => x.a.t - y.a.t || x.i - y.i).map(x => x.a);
const VISTA: Vista = 'agenda.central';
const REGLA_AUTO: Record<string, string> = { Datos_incompletos: 'R01', Sin_respuesta: 'R29', Conductor_ocupado: 'R18' };

/* ─── p4: compromiso del cliente «mercancía disponible» ─── */
const p4: Guion = ({ d, duracion }: CtxGuion) => {
  const hora = horaMin(d.trayectoria[0].fechaCargue);
  const contacto = d.trayectoria[0].cliente.contacto;
  const fin = Math.min(0.78, 0.1 + spanTecleo(duracion));
  const ui: AccionUI[] = [
    { t: 0, tipo: 'estado', texto: 'Abriendo la agenda centralizada de llamadas…' },
    { t: 0.02, tipo: 'pegar', ancla: ANCLA_AGENDA.objetivo, texto: 'Confirmar condiciones de cargue' },
    { t: 0.05, tipo: 'pegar', ancla: ANCLA_AGENDA.interlocutor, texto: `${contacto} (cliente)` },
    { t: 0.08, tipo: 'pegar', ancla: ANCLA_AGENDA.actividad, texto: 'Compromiso: mercancía disponible' },
    { t: 0.1, hasta: fin, tipo: 'teclear', ancla: ANCLA_AGENDA.hora, texto: hora },
    { t: fin + 0.01, tipo: 'mover', ancla: ANCLA_AGENDA.btnAgendar },
    { t: T_P4_GUARDA, tipo: 'clic', ancla: ANCLA_AGENDA.btnAgendar },
    { t: T_P4_GUARDA + 0.02, hasta: 0.98, tipo: 'resaltar', ancla: anclaFila('compromiso'), texto: `Compromiso del cliente · vence ${hora}` },
    { t: T_P4_GUARDA + 0.03, tipo: 'estado', texto: `Compromiso «mercancía disponible» agendado · vence ${hora}`, nivel: 'ok' },
  ];
  return {
    vista: VISTA,
    ui: ordenar(ui),
    pensamiento: `Agendo el compromiso del cliente «mercancía disponible» para las ${hora}: según R26, la tarea queda con su objetivo, ligada a la operación, al interlocutor ${contacto} y a la actividad, para no volver a preguntar lo mismo.`,
  };
};

/* ─── c4: llamadas preventivas a ambas partes ─── */
const c4: Guion = ({ d, duracion }: CtxGuion) => {
  const o = d.trayectoria[0];
  const horaTr = horaMin(o.fechaCargue - 90 * 60_000);
  const horaCl = horaMin(o.fechaCargue - 60 * 60_000);
  const contacto = o.cliente.contacto;
  const fin = Math.min(0.49, 0.08 + spanTecleo(duracion));
  const ui: AccionUI[] = [
    { t: 0, tipo: 'estado', texto: 'Programando las llamadas preventivas…' },
    { t: 0.02, tipo: 'pegar', ancla: ANCLA_AGENDA.objetivo, texto: 'Llamada preventiva' },
    { t: 0.04, tipo: 'pegar', ancla: ANCLA_AGENDA.interlocutor, texto: 'Conductor (transportador)' },
    { t: 0.06, tipo: 'pegar', ancla: ANCLA_AGENDA.actividad, texto: 'Disponibilidad, ubicación y hora estimada de llegada' },
    // El tecleo solo se muestra si dura al menos ~300 ms reales; con pasos cortos se pega la hora.
    duracion * (fin - 0.08) >= 320
      ? { t: 0.08, hasta: fin, tipo: 'teclear', ancla: ANCLA_AGENDA.hora, texto: horaTr }
      : { t: 0.08, tipo: 'pegar', ancla: ANCLA_AGENDA.hora, texto: horaTr },
    { t: fin + 0.005, tipo: 'mover', ancla: ANCLA_AGENDA.btnAgendar },
    { t: T_C4_GUARDA1, tipo: 'clic', ancla: ANCLA_AGENDA.btnAgendar },
    { t: T_C4_FORM2, tipo: 'pegar', ancla: ANCLA_AGENDA.objetivo, texto: 'Llamada preventiva' },
    { t: 0.6, tipo: 'pegar', ancla: ANCLA_AGENDA.interlocutor, texto: `${contacto} (cliente)` },
    { t: 0.64, tipo: 'pegar', ancla: ANCLA_AGENDA.actividad, texto: 'Mercancía lista y punto de cargue disponible' },
    { t: 0.68, tipo: 'pegar', ancla: ANCLA_AGENDA.hora, texto: horaCl },
    { t: 0.74, tipo: 'mover', ancla: ANCLA_AGENDA.btnAgendar },
    { t: T_C4_GUARDA2, tipo: 'clic', ancla: ANCLA_AGENDA.btnAgendar },
    { t: T_C4_GUARDA2 + 0.02, hasta: 0.96, tipo: 'resaltar', ancla: ANCLA_AGENDA.sincronizacion, texto: 'Tareas relacionadas actualizadas' },
    { t: T_C4_GUARDA2 + 0.03, tipo: 'estado', texto: 'Llamadas preventivas agendadas a ambas partes', nivel: 'ok' },
  ];
  return {
    vista: VISTA,
    ui: ordenar(ui),
    pensamiento: `Programo dos llamadas preventivas, una al transportador y otra al cliente, cada una con su objetivo y ligada a la operación (R26); con el cargue ya confirmado actualizo las tareas relacionadas en vez de consultarlo otra vez.`,
  };
};

/* ─── g1: aviso de llegada → recepción lista ─── */
const g1: Guion = ({ d }: CtxGuion) => {
  const o = d.trayectoria[0];
  const dest = o.receptor?.nombre ?? o.cliente.contacto;
  const ui: AccionUI[] = [
    { t: 0, tipo: 'estado', texto: 'Registrando el aviso de llegada en la agenda…' },
    { t: 0.06, tipo: 'pegar', ancla: ANCLA_AGENDA.objetivo, texto: 'Preparar recepción' },
    { t: 0.12, tipo: 'pegar', ancla: ANCLA_AGENDA.interlocutor, texto: `${dest} (destinatario)` },
    { t: 0.18, tipo: 'pegar', ancla: ANCLA_AGENDA.actividad, texto: 'Aviso de llegada: destino listo para recibir' },
    { t: 0.24, tipo: 'pegar', ancla: ANCLA_AGENDA.hora, texto: horaMin(o.fechaCargue + 7 * 3_600_000) },
    { t: 0.36, tipo: 'mover', ancla: ANCLA_AGENDA.btnAgendar },
    { t: T_G1_GUARDA, tipo: 'clic', ancla: ANCLA_AGENDA.btnAgendar },
    { t: T_G1_GUARDA + 0.02, hasta: 0.8, tipo: 'resaltar', ancla: anclaFila('recepcion'), texto: 'Recepción en destino' },
    { t: 0.62, hasta: 0.94, tipo: 'resaltar', ancla: ANCLA_AGENDA.sincronizacion, texto: 'Tareas relacionadas actualizadas' },
    { t: 0.88, tipo: 'estado', texto: 'Destino listo para recibir', nivel: 'ok' },
  ];
  return {
    vista: VISTA,
    ui: ordenar(ui),
    pensamiento: `Registro el aviso de llegada con ${dest} como interlocutor del destino, ligado a la operación y a la actividad de recepción (R26); al quedar confirmado el destino actualizo la tarea de seguimiento y evito consultarlo de nuevo.`,
  };
};

/* ─── x2: gestión automática de la agenda (solo novedades automáticas) ─── */
const x2Para = (tipo: string): Guion => ({ d }: CtxGuion) => {
  const regla = REGLA_AUTO[tipo] ?? 'R29';
  const alt = tituloAlternativa(d);
  const min = minutosReintento(d);
  const orig = tareaSinContacto(d);
  const hora = orig ? horaMin(orig.hora + min * 60_000) : '';
  const quien = tipo === 'Conductor_ocupado' ? 'el conductor iba manejando' : tipo === 'Datos_incompletos' ? 'el cliente no tenía los datos a la mano' : 'el contacto no contestó';
  const ui: AccionUI[] = [
    { t: 0, tipo: 'estado', texto: 'Aplicando la gestión automática de la agenda…' },
    { t: 0.06, tipo: 'mover', ancla: anclaFila('original') },
    { t: 0.12, hasta: 0.4, tipo: 'resaltar', ancla: anclaFila('original'), texto: 'Intento sin contacto' },
    { t: 0.3, tipo: 'clic', ancla: anclaFila('original') },
    { t: 0.46, tipo: 'mover', ancla: ANCLA_AGENDA.btnReprogramar },
    { t: 0.56, tipo: 'clic', ancla: ANCLA_AGENDA.btnReprogramar },
    { t: T_X2_CREA, hasta: 0.92, tipo: 'toast', texto: `${alt}${hora ? ` · ${hora}` : ''}`, nivel: 'info' },
    { t: T_X2_CREA + 0.02, hasta: 0.96, tipo: 'resaltar', ancla: anclaFila('nueva'), texto: alt },
    { t: 0.88, tipo: 'estado', texto: `${alt} · tarea reprogramada (${regla})`, nivel: 'ok' },
  ];
  return {
    vista: VISTA,
    ui: ordenar(ui),
    pensamiento: `Como ${quien}, aplico ${regla} sin escalar a nadie: dejo la tarea original como reprogramada y creo la nueva con el mismo objetivo, interlocutor y actividad para «${alt}».`,
  };
};

/* ─── x4: resolución automática de la novedad ─── */
const x4Para = (tipo: string): Guion => ({ d }: CtxGuion) => {
  const regla = REGLA_AUTO[tipo] ?? 'R29';
  const alt = tituloAlternativa(d);
  const ui: AccionUI[] = [
    { t: 0, tipo: 'estado', texto: `Resolviendo la novedad: ${alt}` },
    { t: 0.08, tipo: 'mover', ancla: anclaFila('nueva') },
    { t: 0.14, hasta: 0.46, tipo: 'resaltar', ancla: anclaFila('nueva'), texto: 'Tarea reprogramada' },
    { t: 0.44, tipo: 'mover', ancla: ANCLA_AGENDA.sincronizacion },
    { t: T_X4_SYNC + 0.02, hasta: 0.86, tipo: 'resaltar', ancla: ANCLA_AGENDA.sincronizacion, texto: 'Tareas relacionadas actualizadas' },
    { t: 0.8, tipo: 'estado', texto: `${alt} · novedad resuelta sin intervención humana`, nivel: 'ok' },
  ];
  return {
    vista: VISTA,
    ui: ordenar(ui),
    pensamiento: `Confirmo la tarea reprogramada («${alt}») y actualizo las tareas relacionadas de la operación para no repetir consultas; la novedad se cierra sola según ${regla}, sin pasar por el coordinador.`,
  };
};

const TIPOS_AUTO = ['Datos_incompletos', 'Sin_respuesta', 'Conductor_ocupado'] as const;

/** Guiones de la ventana «agenda». Claves: id de paso o `variante:id`. */
export const agenda: Guiones = {
  p4,
  c4,
  g1,
  x4: (c: CtxGuion) => x4Para(c.d.excepcion?.categoria === 'automatico' ? c.d.excepcion.tipo : 'Sin_respuesta')(c),
  ...Object.fromEntries(TIPOS_AUTO.flatMap(t => [[`${t}:x2`, x2Para(t)], [`${t}:x4`, x4Para(t)]])),
};
