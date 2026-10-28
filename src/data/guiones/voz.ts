import type { AccionUI, DatosCaso, DialogoLlamada, DialogoUI, Escenario, TurnoLlamada, Vista } from '@/types/agentes';
import { anclaBoton } from '@/components/agentes/guion';
import { pesos } from '@/data/agentesUtil';
import { a2Bandeja } from './canal';
import type { CtxGuion, Guion, Guiones } from './tipos';

/* ─── Anclas de la ventana «voz» (consola de voz del agente de IA) ─── */
export const ANCLA_VOZ = {
  interlocutor: 'voz.campo.interlocutor',
  objetivo: 'voz.campo.objetivo',
  telefono: 'voz.campo.telefono',
  btnLlamar: 'voz.btn.llamar',
  btnContestar: 'voz.btn.contestar',
  btnColgar: 'voz.btn.colgar',
  contexto: 'voz.panel.contexto',
  resultado: 'voz.campo.resultado',
} as const;

export const anclaTurno = (i: number): string => `voz.fila.turno-${i}`;

/* ─── Instantes compartidos con VentanaVoz ─── */
/** Se conecta la llamada (marcado o contestación). */
export const T_CONECTA = 0.28;
/** Primer turno de la conversación. */
export const T_INI = 0.32;
/** Fin de la conversación (último turno completo). */
export const T_FIN = 0.8;
/** Clic en «Colgar». */
export const T_COLGAR = 0.82;
/** La consola pasa a «finalizada» y muestra el resultado. */
export const T_FINAL = 0.85;
/** Diálogo de compromiso o novedad (cuando lo hay). */
const T_DLG = 0.87;

const base = (id: string) => id.replace(/_\d+$/, '');

/** Paso → clave del diálogo en `caso.datos.dialogos`. */
const CLAVE: Record<string, string> = {
  a2: 'recibir', a3: 'recibir', v4: 'completar', p3: 'planeacion', n1: 'negociar_0',
  c1: 'informar', c2: 'confirmar', c5: 'prev_transportador', c6: 'prev_cliente',
  o1: 'presentacion_transportador', k3: 'despacho', t1: 'seguimiento_1', t4: 'informar_novedad', t3: 'consulta',
  g0: 'aviso', g3: 'recepcion', y0: 'entrega', z0: 'cierre',
  c1r: 'informar_r', c2r: 'confirmar_r', c5r: 'prev_transportador_ok', c6r: 'prev_cliente_ok', w1: 'nueva_fecha', x7: 'cancelacion',
};
/** Etapa donde falló el contacto (Sin_respuesta) → diálogo que se reintenta en r1. */
const CLAVE_REINTENTO: Record<string, string> = {
  Confirmacion: 'confirmar', Preventiva: 'prev_transportador', Transito: 'seguimiento_1', AvisoDestino: 'aviso', LlamadaCierre: 'cierre',
};

function sintetizarAdjudicada(d: DatosCaso): DialogoLlamada | undefined {
  const r0 = d.negociacion[0];
  const neg = d.dialogos.negociar_0;
  if (!r0 || !neg) return undefined;
  const fin = d.trayectoria[d.trayectoria.length - 1];
  const tarifa = pesos(fin?.tarifaPactada ?? r0.tarifaOfrecida);
  return {
    ...neg,
    clave: 'negociar_autorizada',
    turnos: [
      { quien: 'agente', texto: 'Buenos días, habla el asistente virtual de coordinación logística de Haceb. Le llamo con la respuesta a su contrapropuesta.' },
      { quien: 'agente', texto: `El coordinador autorizó la tarifa de ${tarifa} para el servicio. ¿La acepta?` },
      { quien: 'otro', texto: 'Sí, la acepto.' },
      { quien: 'agente', texto: `Queda registrada la aceptación por ${tarifa}. Le confirmo la asignación cuando termine la selección.` },
    ],
    resultado: 'exitosa',
    resumen: `Tarifa autorizada ${tarifa}.`,
  };
}

/**
 * Diálogo que muestra la consola en un paso (null si el paso no es una llamada).
 * Compartido por el guion y la ventana: ambos deben coincidir.
 */
export function dialogoDePaso(d: DatosCaso, escenario: Escenario, id: string, ok = true): DialogoLlamada | undefined {
  const b = base(id);
  const D = d.dialogos;
  let clave: string | undefined = CLAVE[b];
  if (b === 'n5') {
    const adjudicada = d.excepcion?.tipo === 'Tarifa_sobre_tope' && d.decision?.aplicada?.efecto.tipo === 'continuar';
    if (adjudicada) return sintetizarAdjudicada(d) ?? D.negociar_0;
    clave = D.negociar_1 ? 'negociar_1' : 'negociar_0';
  } else if (b === 'r1') {
    clave = escenario === 'Sin_respuesta' ? CLAVE_REINTENTO[d.excepcion?.etapaOrigen ?? ''] ?? 'seguimiento_1' : 'seguimiento_1';
  } else if (b === 't1' && escenario === 'Conductor_ocupado' && D.seguimiento_2) {
    clave = 'seguimiento_2';
  }
  const dl = clave ? D[clave] : undefined;
  if (escenario === 'Sin_respuesta' && !ok && b !== 'r1' && D.sin_respuesta) {
    const sr = D.sin_respuesta;
    return dl ? { ...dl, turnos: sr.turnos, resultado: sr.resultado, resumen: sr.resumen } : sr;
  }
  return dl;
}

/** Instantes (0–1 del paso) en que empieza y termina de decirse cada turno. */
export function tiemposTurnos(turnos: TurnoLlamada[]): { ini: number; fin: number }[] {
  const pesosT = turnos.map(t => t.texto.length + 24);
  const total = pesosT.reduce((a, b) => a + b, 0) || 1;
  let acc = 0;
  return pesosT.map(w => {
    const ini = T_INI + ((T_FIN - T_INI) * acc) / total;
    acc += w;
    return { ini, fin: T_INI + ((T_FIN - T_INI) * acc) / total };
  });
}

/** Duración de la llamada en segundos (derivada de lo hablado). */
export function duracionLlamada(dl: DialogoLlamada): number {
  if (dl.resultado === 'sin_respuesta') return 38;
  const chars = dl.turnos.reduce((a, t) => a + t.texto.length, 0);
  return Math.max(14, Math.round(chars / 13));
}

export const formatoCrono = (seg: number): string => {
  const s = Math.max(0, Math.floor(seg));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

/** Diálogo modal del paso: solo compromisos o novedades. */
function dialogoModal(d: DatosCaso, dl: DialogoLlamada, id: string, escenario: Escenario): DialogoUI | undefined {
  const b = base(id);
  const m = /^negociar_(\d+)$/.exec(dl.clave);
  const ronda = m ? d.negociacion[Number(m[1])] : undefined;
  if (ronda && ronda.estado === 'sobre_tope') {
    const tope = d.trayectoria[0]?.tarifaMaxima ?? 0;
    return {
      tipo: 'info',
      titulo: 'No comprometer valores',
      cuerpo: `${ronda.transportador} pide ${pesos(ronda.contrapropuesta)} y el tope autorizado es ${pesos(tope)}. No acepto ni prometo ese valor: lo presento al coordinador.`,
      botones: ['Entendido'],
      regla: 'R07',
    };
  }
  if (b === 'z0' && escenario === 'Inconformidad_cliente') {
    return {
      tipo: 'confirmar',
      titulo: 'Crear caso de seguimiento',
      cuerpo: 'La inconformidad no queda como un comentario: abro un caso con responsable y plazo.',
      botones: ['Crear caso'],
      regla: 'R24',
    };
  }
  const conNovedad = dl.resultado === 'con_novedad'
    || (b === 'c5' && escenario === 'Retraso_transportador')
    || (b === 'c6' && escenario === 'Mercancia_no_lista');
  if (conNovedad) {
    return { tipo: 'info', titulo: 'Registrar novedad', cuerpo: dl.resumen, botones: ['Registrar'] };
  }
  return undefined;
}

function pensar(d: DatosCaso, dl: DialogoLlamada, id: string, escenario: Escenario): string {
  const b = base(id);
  const nom = dl.nombre;
  const pend = d.trayectoria[0]?.datosPendientes ?? [];
  const sr = dl.resultado === 'sin_respuesta';
  if (sr) return `${nom} no contesta tras varios timbres: dejo el intento registrado y no insisto sin parar, porque R29 manda reprogramar el contacto y avisar a la agenda en lugar de dar la llamada por hecha.`;
  const mapa: Record<string, string> = {
    a2: `Contesto la llamada entrante de ${nom}: primero identifico a la persona y su empresa, porque según R26 toda solicitud queda ligada a un interlocutor, una operación y una actividad, y la grabación se conserva en el expediente (R30).`,
    a3: pend.length
      ? `Voy anotando lo que ${nom} me dice; ${pend.join(' y ').toLowerCase()} no los tiene a la mano y, según R02, no los invento: los dejo pendientes y programo una llamada para completarlos.`
      : `Anoto origen, destino, mercancía, peso, volumen, vehículo, fecha y condiciones mientras ${nom} habla; con los nueve datos completos, R02 me permite pasar a validar sin volver a llamar.`,
    v4: `Llamo a ${nom} solo por lo que faltó (${(pend.length ? pend : ['un dato']).join(', ').toLowerCase()}): R02 pide completar la solicitud antes de iniciar la operación, y no avanzo con datos supuestos.`,
    p3: `Con la operación ya registrada llamo al contacto autorizado, ${nom}, para confirmar disponibilidad de cargue, acceso y horarios; R04 exige hablar solo con quien está autorizado en la solicitud.`,
    n1: dialogoModal(d, dl, id, escenario)
      ? `${nom} responde con una contrapropuesta por encima del tope. Según R07 no comprometo ningún valor fuera de lo autorizado: lo registro tal cual y lo escalo al coordinador.`
      : `Presento el viaje a ${nom} dentro de la tarifa autorizada (R06): ruta, mercancía y fecha, y registro su aceptación como preliminar, sin prometer la asignación.`,
    n5: dl.clave === 'negociar_autorizada'
      ? `El coordinador ya autorizó la tarifa; se la informo a ${nom} tal como quedó aprobada (R07) y le recuerdo que la asignación depende de la selección.`
      : `Llamo a los demás candidatos con la misma oferta (R06); ${nom} responde, y cada respuesta queda registrada como oferta preliminar, dentro del tope o escalada.`,
    c1: `Informo a ${nom} el vehículo asignado, la fecha y hora de cargue, el lugar y quién recibe; según R11 la confirmación al cliente lleva todos esos datos y queda registrada con el receptor.`,
    c2: `Confirmo con ${nom} el servicio completo y que está preparado para ejecutarlo; R11 pide la doble confirmación, cliente y transportador, antes de dar la asignación por cerrada.`,
    c5: escenario === 'Retraso_transportador'
      ? `${nom} avisa que llegará tarde. Lo registro como estimado y no se lo confirmo al cliente hasta validarlo con el coordinador (R12, R19).`
      : `Llamada preventiva a ${nom} (R12): verifico que siga disponible, dónde está y a qué hora llega; la hora que me da es una estimación y así la rotulo.`,
    c6: escenario === 'Mercancia_no_lista'
      ? `El cliente avisa que la mercancía no estará lista a tiempo. Registro la hora como estimada y activo la novedad; no la comunico al transportador sin autorización (R12, R19).`
      : `Llamada preventiva a ${nom} (R12): confirmo que la mercancía está preparada y el punto de cargue disponible, sin cambios en la programación.`,
    o1: `${nom} reporta que llegó al punto de origen. Registro su aviso como lo que es, un reporte, y lo contrasto con el cliente en la validación cruzada (R15) antes de confirmar la llegada.`,
    k3: dl.resultado === 'con_novedad'
      ? `${nom} confirma el despacho pero con unidades menos de las solicitadas. Registro la diferencia tal como la dice y la valido antes de seguir (R17).`
      : `Confirmo con ${nom} que la mercancía salió completa y la hora real de salida; R17 pide dejar el despacho confirmado por el cliente antes de seguir hacia el destino.`,
    t1: dl.resultado === 'con_novedad'
      ? `El conductor reporta una novedad en ruta. Separo lo confirmado de lo estimado: la hora de llegada que da es una estimación y así la registro (R19).`
      : `Hago el seguimiento programado a ${nom}: estado del viaje, ubicación y novedades; la hora de llegada que me da es una estimación y la rotulo como tal (R19).`,
    t4: `Informo a ${nom} la novedad con lo que está confirmado y lo que solo es estimado; según R19 no prometo una hora que nadie ha confirmado.`,
    t3: `${nom} llama a consultar el servicio. Antes de contarle nada valido que sea contacto autorizado de la operación (R20) y le doy únicamente lo confirmado.`,
    g0: dl.resultado === 'con_novedad'
      ? `El destinatario no puede recibir a la hora prevista. Registro su estimación sin confirmar cambios y activo la coordinación con el transportador y el responsable (R22).`
      : `Aviso a ${nom} que el vehículo está por llegar y verifico instalaciones, horario de descargue e ingreso (R22), para que el destino llegue preparado.`,
    g3: dl.resultado === 'con_novedad'
      ? `Hay demora en el descargue. Pregunto la causa y el tiempo estimado, y los dejo registrados como estimación para el coordinador (R22).`
      : `Sigo el descargue con ${nom} y pregunto si hubo diferencias o daños; registro la recepción tal como la confirma (R22).`,
    y0: dl.resultado === 'con_novedad'
      ? `Las versiones de la entrega no coinciden entre cliente y transportador. No cierro la operación: genero la novedad para el coordinador (R23).`
      : `Valido con ${nom} que la entrega fue completa; solo con la confirmación de ambas partes pido los soportes y avanzo al cierre (R23).`,
    z0: escenario === 'Inconformidad_cliente'
      ? `${nom} dice que quedó inconforme. Una inconformidad no se archiva como comentario: abro un caso de seguimiento con responsable y plazo (R24).`
      : `Llamada de cierre con ${nom}: servicio completado, observaciones y calificación; R24 pide registrar la satisfacción y cualquier inconformidad como caso.`,
    r1: escenario === 'Sin_respuesta'
      ? `Pasado el tiempo reprogramado reintento el contacto con ${nom}; según R29 solo cuento el intento como hecho si esta vez sí contesta.`
      : `Retomo la llamada con ${nom} en un momento seguro: R18 no permite insistir mientras el conductor va manejando.`,
  };
  return mapa[b] ?? `Atiendo la llamada con ${nom} y registro lo que confirma, separando lo confirmado de lo estimado (R19).`;
}

const ordenar = (ui: AccionUI[]): AccionUI[] => ui.map((a, i) => ({ a, i })).sort((x, y) => x.a.t - y.a.t || x.i - y.i).map(x => x.a);

const guionLlamada: Guion = (c: CtxGuion) => {
  const { d, escenario, id, ok, duracion } = c;
  const dl = dialogoDePaso(d, escenario, id, ok);
  if (!dl) return {};
  const sal = dl.sentido === 'saliente';
  const t = tiemposTurnos(dl.turnos);
  const final = dl.resultado === 'exitosa' ? 'ok' : 'aviso';
  const ui: AccionUI[] = [
    { t: 0, tipo: 'estado', texto: sal ? `Preparando la llamada a ${dl.nombre}…` : `Llamada entrante de ${dl.nombre}…` },
    { t: 0.02, tipo: 'mover', ancla: ANCLA_VOZ.interlocutor },
    { t: 0.03, hasta: 0.09, tipo: 'resaltar', ancla: ANCLA_VOZ.interlocutor, texto: dl.interlocutor === 'cliente' ? 'Cliente' : dl.interlocutor === 'transportador' ? 'Transportador' : 'Destinatario' },
    { t: 0.09, tipo: 'mover', ancla: ANCLA_VOZ.objetivo },
    { t: 0.1, hasta: 0.17, tipo: 'resaltar', ancla: ANCLA_VOZ.objetivo, texto: 'Objetivo de la llamada' },
  ];
  if (sal) {
    ui.push({ t: 0.17, tipo: 'mover', ancla: ANCLA_VOZ.telefono });
    // Tecleo del teléfono solo si dura al menos 300 ms reales.
    if (duracion * 0.1 >= 300) ui.push({ t: 0.18, hasta: 0.28, tipo: 'teclear', ancla: ANCLA_VOZ.telefono, texto: dl.telefono });
    ui.push({ t: 0.2, tipo: 'mover', ancla: ANCLA_VOZ.btnLlamar }, { t: 0.23, tipo: 'clic', ancla: ANCLA_VOZ.btnLlamar });
    ui.push({ t: 0.25, tipo: 'estado', texto: `Marcando a ${dl.nombre} · ${dl.telefono}…` });
  } else {
    ui.push({ t: 0.17, tipo: 'mover', ancla: ANCLA_VOZ.btnContestar }, { t: 0.23, tipo: 'clic', ancla: ANCLA_VOZ.btnContestar });
  }
  ui.push({ t: T_CONECTA, tipo: 'estado', texto: dl.resultado === 'sin_respuesta' ? `Timbrando a ${dl.nombre}…` : `En llamada con ${dl.nombre} · ${dl.objetivo.toLowerCase()}`, nivel: 'info' });
  // Datos estimados (R19): se señalan cuando se dicen.
  dl.turnos.forEach((turno, i) => {
    if (turno.confirmada === false) ui.push({ t: Math.min(0.97, t[i].ini + 0.01), hasta: Math.min(0.99, Math.max(t[i].fin, t[i].ini + 0.05)), tipo: 'resaltar', ancla: anclaTurno(i), texto: 'Dato estimado (R19)' });
  });
  ui.push({ t: T_COLGAR - 0.02, tipo: 'mover', ancla: ANCLA_VOZ.btnColgar }, { t: T_COLGAR, tipo: 'clic', ancla: ANCLA_VOZ.btnColgar });
  ui.push({ t: T_FINAL, tipo: 'estado', texto: `Llamada finalizada · ${dl.resumen}`, nivel: final });
  const dlg = dialogoModal(d, dl, id, escenario);
  if (dlg) {
    ui.push({ t: T_DLG, hasta: 0.985, tipo: 'dialogo', dialogo: dlg });
    ui.push({ t: 0.93, tipo: 'clic', ancla: anclaBoton(dlg.botones?.[0] ?? 'Entendido') });
  }
  return {
    vista: 'voz.consola' as Vista,
    ui: ordenar(ui),
    pensamiento: pensar(d, dl, id, escenario),
  };
};

/** Guiones de la ventana «voz». Claves: id de paso o `variante:id`. */
export const voz: Guiones = {
  // En llamada, a2 es de la consola; en los demás canales es de la bandeja.
  a2: (c: CtxGuion) => (c.canal === 'llamada_ia' ? guionLlamada(c) : a2Bandeja(c)),
  a3: guionLlamada,
  v4: guionLlamada,
  p3: guionLlamada,
  n1: guionLlamada,
  n5: guionLlamada,
  c1: guionLlamada,
  c2: guionLlamada,
  c5: guionLlamada,
  c6: guionLlamada,
  o1: guionLlamada,
  k3: guionLlamada,
  t1: guionLlamada,
  t4: guionLlamada,
  t3: guionLlamada,
  g0: guionLlamada,
  g3: guionLlamada,
  y0: guionLlamada,
  z0: guionLlamada,
  r1: guionLlamada,
  c1r: guionLlamada,
  c2r: guionLlamada,
  c5r: guionLlamada,
  c6r: guionLlamada,
  w1: guionLlamada,
  x7: guionLlamada,
};
