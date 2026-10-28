// ============================================================================
// Datos sintéticos coherentes que ven las pantallas del escritorio RPA.
// Todo se deriva de la trayectoria real (motor.transicionar) de la operación:
// nada se inventa aquí que contradiga lo que el motor decidió.
// ============================================================================

import type { Excepcion, Llamada, Operacion, TipoExcepcion } from '@/types';
import type {
  Cruce,
  DatosCaso,
  DecisionCaso,
  DialogoLlamada,
  FilaSeguimiento,
  ItemRevision,
  RondaNegociacion,
  Solicitud,
  TareaAgenda,
  TurnoLlamada,
} from '@/types/agentes';
import { CANAL_INFO, CLIENTES, NODOS, TRANSPORTADORES } from '@/data/mockData';
import { humanoPara } from './agentesCatalogo';
import { SESION_VM, entre, hex, horaMin, miles, pesos, pick } from './agentesUtil';

type Rand = () => number;

const dia = (ts: number) => new Date(ts).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
const diaCorto = (ts: number) => new Date(ts).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' });
const fechaHora = (ts: number) => `${diaCorto(ts)} ${horaMin(ts)}`;

const A = (texto: string, confirmada = true): TurnoLlamada => ({ quien: 'agente', texto, confirmada });
const O = (texto: string, confirmada = true): TurnoLlamada => ({ quien: 'otro', texto, confirmada });

const numeroEn = (txt: string, def: number): number => {
  const m = /(\d[\d.]*)/.exec(txt);
  return m ? Number(m[1].replace(/\./g, '')) : def;
};

export function rutaDe(o: Operacion): string {
  return `${o.nodoOrigen.ciudad} → ${o.nodoDestino.ciudad}`;
}

/** Excepción de un tipo dado, busque donde busque en la trayectoria. */
function excDe(tr: Operacion[], tipo: TipoExcepcion): Excepcion | null {
  for (const o of tr) {
    if (o.excepcion?.tipo === tipo) return o.excepcion;
  }
  const fin = tr[tr.length - 1];
  return fin.excepcionesPrevias.find((e) => e.tipo === tipo) ?? null;
}

/* ─── Solicitud (bandeja) ─── */
function construirSolicitud(o: Operacion, seq: number, rand: Rand, ahora: number): Solicitud {
  const ref = `SOL-${new Date(ahora).getFullYear()}-${String(seq).padStart(5, '0')}`;
  const m = o.mercancia;
  const resumen = `${m.unidades} und · ${m.descripcion} · ${rutaDe(o)} · cargue ${fechaHora(o.fechaCargue)}`;
  const base: string[] = [
    `Empresa: ${o.cliente.nombre}`,
    `Solicitante: ${o.solicitante} · ${o.cliente.telefono}`,
    `Origen: ${o.nodoOrigen.lugar}, ${o.nodoOrigen.ciudad}`,
    `Destino: ${o.nodoDestino.lugar}, ${o.nodoDestino.ciudad}`,
    `Mercancía: ${m.tipo} · ${m.descripcion} · ${m.unidades} und`,
    `Peso: ${miles(m.pesoKg)} kg · Volumen: ${m.volumenM3.toString().replace('.', ',')} m³`,
    `Vehículo: ${o.vehiculoRequerido}`,
    `Cargue: ${fechaHora(o.fechaCargue)}`,
    `Entrega: ${o.condicionesEntrega}`,
    `Requisito especial: ${o.requisitoEspecial ?? 'ninguno'}`,
  ].filter((l) => !o.datosPendientes.some((p) => l.toLowerCase().includes(p.toLowerCase().split(' ')[0])));
  const asunto =
    o.canal === 'llamada_ia' ? `Llamada entrante de ${o.solicitante}` :
    o.canal === 'formulario' ? `Formulario de transporte ${ref}` :
    o.canal === 'integracion' ? `Solicitud ${ref} desde el sistema de ${o.cliente.nombre}` :
    `Registro del coordinador · ${ref}`;
  const remitente = o.canal === 'integracion' ? `Sistema de ${o.cliente.nombre}` : o.canal === 'coordinador' ? pick(rand, ['Camila Restrepo', 'Andrés Felipe Mora', 'Laura Cifuentes']) : o.solicitante;
  return {
    canal: o.canal,
    remitente,
    remitenteContacto: o.canal === 'integracion' ? `api.${o.cliente.nombre.split(' ')[0].toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')}.co` : o.cliente.telefono,
    referenciaCliente: ref,
    asunto,
    resumen,
    crudo: o.canal === 'integracion' ? [`{ "solicitud": "${ref}",`, `  "cliente": "${o.cliente.id}",`, `  "origen": "${o.nodoOrigen.id}", "destino": "${o.nodoDestino.id}",`, `  "peso_kg": ${m.pesoKg}, "volumen_m3": ${m.volumenM3},`, `  "vehiculo": "${o.vehiculoRequerido}",`, `  "cargue": "${new Date(o.fechaCargue).toISOString().slice(0, 16)}" }`] : base,
  };
}

/* ─── Diálogos de las llamadas ─── */
interface CtxDlg {
  tr: Operacion[];
  fin: Operacion;
  op: Operacion;
  conductor: string;
  telT: string;
  transp: string;
  placa: string;
  receptor: { nombre: string; telefono: string };
  rondas: RondaNegociacion[];
}

const SALUDO_A = 'Buenos días, habla el asistente virtual de coordinación logística de Haceb.';

function construirDialogos(c: CtxDlg, rand: Rand): Record<string, DialogoLlamada> {
  const { op, fin } = c;
  const m = op.mercancia;
  const ruta = rutaDe(op);
  const contacto = op.cliente.contacto;
  const tel = op.cliente.telefono;
  const out: Record<string, DialogoLlamada> = {};
  const ag = { cliente: 'Agente de cliente', neg: 'Agente de negociación', seg: 'Agente de seguimiento' } as const;
  const add = (clave: string, d: Omit<DialogoLlamada, 'clave'>) => {
    out[clave] = { clave, ...d };
  };
  const exc = (t: TipoExcepcion) => excDe(c.tr, t);
  const pend = op.datosPendientes;

  add('recibir', {
    objetivo: 'Recibir solicitud', interlocutor: 'cliente', nombre: contacto, telefono: tel, agente: ag.cliente, sentido: 'entrante',
    turnos: [
      A(`${SALUDO_A} ¿Con quién hablo y de qué empresa nos llama?`),
      O(`Soy ${contacto}, de ${op.cliente.nombre}.`),
      A(`Gracias, ${contacto.split(' ')[0]}. ¿Qué mercancía necesita movilizar y entre qué ciudades?`),
      O(`${m.unidades} unidades de ${m.descripcion.toLowerCase()}, de ${op.nodoOrigen.ciudad} a ${op.nodoDestino.ciudad}.`),
      A(`Registro ${miles(m.pesoKg)} kg y ${m.volumenM3.toString().replace('.', ',')} metros cúbicos. ¿Para qué fecha y hora necesita el cargue?`),
      ...(pend.length > 0
        ? [O(`El cargue sería el ${dia(op.fechaCargue)}, pero ${pend.join(' y ').toLowerCase()} no los tengo a la mano.`), A(`Entendido. Registro lo confirmado y programo una llamada para completar: ${pend.join(', ').toLowerCase()}.`)]
        : [O(`El ${dia(op.fechaCargue)} a las ${horaMin(op.fechaCargue)}.`), A('¿Hay algún requisito especial de ingreso o de entrega?'), O(op.requisitoEspecial ?? 'Ninguno, es una entrega normal.'), A('Perfecto. Confirmo todos los datos y le asignamos el número de operación enseguida.')]),
    ],
    resultado: 'exitosa', resumen: `Solicitud recibida por llamada: ${ruta}, ${m.unidades} und${pend.length ? ` · pendiente: ${pend.join(', ').toLowerCase()}` : ''}.`,
  });

  add('completar', {
    objetivo: 'Completar datos', interlocutor: 'cliente', nombre: contacto, telefono: tel, agente: ag.cliente, sentido: 'saliente',
    turnos: [
      A(`${SALUDO_A} Le llamo para completar la solicitud de transporte ${ruta}.`),
      O('Sí, dígame.'),
      A(`Nos faltaba: ${(pend.length ? pend : ['un dato de la solicitud']).join(', ').toLowerCase()}. ¿Me lo puede confirmar?`),
      O('Claro: ya lo consulté, se lo informo ahora mismo.'),
      A('Gracias. Queda registrado y la solicitud queda completa.'),
    ],
    resultado: 'exitosa', resumen: 'Datos pendientes completados con el cliente.',
  });

  add('planeacion', {
    objetivo: 'Confirmar condiciones de cargue', interlocutor: 'cliente', nombre: contacto, telefono: tel, agente: ag.cliente, sentido: 'saliente',
    turnos: [
      A(`${SALUDO_A} Registramos la operación ${op.id} y necesito confirmar con usted las condiciones del cargue en ${op.nodoOrigen.lugar}.`),
      O('Perfecto.'),
      A(`¿Hay disponibilidad de cargue el ${dia(op.fechaCargue)} desde las ${horaMin(op.fechaCargue)}?`),
      O('Sí, el muelle está disponible desde esa hora.'),
      A('¿Cuál es el horario de atención y las instrucciones de ingreso para el vehículo?'),
      O(op.requisitoEspecial ? `Ingreso por portería 2. ${op.requisitoEspecial}.` : 'Ingreso por portería 2, de 7:00 a 17:00, con cédula y planilla.'),
      A('Registrado. Con esto buscamos el transportador.'),
    ],
    resultado: 'exitosa', resumen: 'Disponibilidad de cargue, acceso y horarios confirmados con el contacto autorizado.',
  });

  c.rondas.forEach((r, i) => {
    const sobre = r.estado === 'sobre_tope';
    add(`negociar_${i}`, {
      objetivo: 'Negociar tarifa', interlocutor: 'transportador', nombre: r.transportador, telefono: r.telefono, agente: ag.neg, sentido: 'saliente',
      turnos: [
        A(`${SALUDO_A} Le llamo para un servicio ${ruta}, ${m.tipo.toLowerCase()}, ${miles(m.pesoKg)} kg, cargue el ${dia(op.fechaCargue)}. ¿Tiene ${r.vehiculo.toLowerCase()} disponible?`),
        O('Sí, tengo vehículo para esa fecha.'),
        A(`La tarifa ofrecida es ${pesos(r.tarifaOfrecida)}. ¿Le interesa?`),
        sobre ? O(`Por esa ruta no me sirve: necesito ${pesos(r.contrapropuesta)}.`) : O(i === 0 ? 'Me interesa. Podemos dejarlo en esa tarifa.' : 'Sí, la acepto.'),
        sobre ? A('Ese valor supera el máximo que tengo autorizado; no puedo comprometerlo. Presento su contrapropuesta al coordinador.') : A(`Registro la aceptación preliminar por ${pesos(r.tarifaFinal ?? r.tarifaOfrecida)}. Le confirmo la asignación cuando termine la selección.`),
      ],
      resultado: 'exitosa', resumen: sobre ? `Contrapropuesta ${pesos(r.contrapropuesta)} sobre el tope: escalada.` : `Aceptación preliminar ${pesos(r.tarifaFinal ?? r.tarifaOfrecida)}.`,
    });
  });

  add('informar', {
    objetivo: 'Informar asignación', interlocutor: 'cliente', nombre: contacto, telefono: tel, agente: ag.cliente, sentido: 'saliente',
    turnos: [
      A(`${SALUDO_A} Le informo que la operación ${op.id} ya tiene vehículo asignado.`),
      A(`Se presentará el ${dia(op.fechaCargue)} a las ${horaMin(op.fechaCargue)} en ${op.nodoOrigen.lugar}. Vehículo ${c.placa}, conductor ${c.conductor}.`),
      O('Perfecto. La mercancía va a estar disponible.'),
      A('¿Quién recibirá el vehículo y a qué teléfono?'),
      O(`${c.receptor.nombre}, ${c.receptor.telefono}.`),
      A('Registrado, junto con las condiciones de seguridad del establecimiento.'),
    ],
    resultado: 'exitosa', resumen: `Asignación informada; receptor ${c.receptor.nombre}.`,
  });

  add('confirmar', {
    objetivo: 'Confirmar con transportador', interlocutor: 'transportador', nombre: c.conductor, telefono: c.telT, agente: ag.seg, sentido: 'saliente',
    turnos: [
      A(`${SALUDO_A} Le confirmo el servicio ${op.id}: ${ruta}.`),
      A(`Presentación ${dia(op.fechaCargue)} a las ${horaMin(op.fechaCargue)} en ${op.nodoOrigen.lugar}. Contacto de recibo: ${c.receptor.nombre}.`),
      O('Recibido, todo claro.'),
      A('¿Conoce las condiciones del servicio y está preparado para ejecutarlo?'),
      O('Sí, estoy listo.'),
    ],
    resultado: 'exitosa', resumen: 'Transportador confirma que recibió la información completa.',
  });

  const eRet = exc('Retraso_transportador');
  const hRet = eRet ? numeroEn(eRet.titulo, 3) : 0;
  add('prev_transportador', {
    objetivo: 'Llamada preventiva', interlocutor: 'transportador', nombre: c.conductor, telefono: c.telT, agente: ag.seg, sentido: 'saliente',
    turnos: eRet
      ? [
        A(`${SALUDO_A} Es la llamada preventiva del servicio ${op.id}. ¿Sigue disponible y dónde está?`),
        O(`Tengo un problema: voy a llegar unas ${hRet} horas tarde.`, false),
        A('Gracias por avisar. Eso es una estimación; no se la confirmo al cliente hasta validarlo con el coordinador.'),
      ]
      : [
        A(`${SALUDO_A} Es la llamada preventiva del servicio ${op.id}. ¿Sigue disponible?`),
        O(`Sí, estoy en ${c.op.nodoOrigen.ciudad === NODOS[0].ciudad ? 'Copacabana' : op.nodoOrigen.ciudad}, saldré a tiempo.`),
        A('¿A qué hora estima llegar al punto de cargue?'),
        O(`Antes de las ${horaMin(op.fechaCargue - 30 * 60_000)}.`, false),
      ],
    resultado: 'exitosa', resumen: eRet ? `Transportador anuncia retraso estimado de ${hRet} h.` : 'Disponibilidad, ubicación y ETA confirmadas.',
  });

  const eMer = exc('Mercancia_no_lista');
  const hMer = eMer ? numeroEn(eMer.titulo, 4) : 0;
  add('prev_cliente', {
    objetivo: 'Llamada preventiva', interlocutor: 'cliente', nombre: contacto, telefono: tel, agente: ag.seg, sentido: 'saliente',
    turnos: eMer
      ? [
        A(`${SALUDO_A} Es la llamada preventiva de la operación ${op.id}. ¿La mercancía estará lista a la hora acordada?`),
        O(`No, se nos retrasó el alistamiento; estaría lista unas ${hMer} horas después.`, false),
        A('Registro la novedad y la notifico al coordinador. Esa hora es una estimación; no la confirmo al transportador hasta que se autorice.'),
      ]
      : [
        A(`${SALUDO_A} Es la llamada preventiva de la operación ${op.id}. ¿La mercancía está preparada y el punto de cargue disponible?`),
        O('Sí, todo listo.'),
        A('¿Algún cambio en la programación?'),
        O('Ninguno.'),
      ],
    resultado: 'exitosa', resumen: eMer ? `Cliente avisa que la mercancía no estará lista: +${hMer} h (estimado).` : 'Mercancía preparada, punto disponible, sin cambios.',
  });

  const eLleg = exc('Diferencia_llegada');
  add('presentacion_transportador', {
    objetivo: 'Validar presentación', interlocutor: 'transportador', nombre: c.conductor, telefono: c.telT, agente: ag.seg, sentido: 'entrante',
    turnos: [O(`Ya llegué a ${op.nodoOrigen.lugar}, vehículo ${c.placa}.`), A('Gracias. Validamos su presentación con el cliente y le confirmo.')],
    resultado: 'exitosa', resumen: 'El transportador reporta su llegada al punto de origen.',
  });
  add('presentacion_cliente', {
    objetivo: 'Validar presentación', interlocutor: 'cliente', nombre: contacto, telefono: tel, agente: ag.seg, sentido: 'saliente',
    turnos: eLleg
      ? [A(`${SALUDO_A} El transportador reporta que ya llegó. ¿Lo tiene en las instalaciones?`), O('No, en portería no hay ningún vehículo con esa placa.'), A('Gracias. Registro la diferencia entre lo reportado y lo observado y pido evidencia al transportador.')]
      : [A(`${SALUDO_A} El transportador reporta que ya llegó. ¿Lo tiene en las instalaciones y se autorizó el ingreso?`), O('Sí, ya está en el muelle.'), A('Entonces el cargue puede comenzar.')],
    resultado: eLleg ? 'con_novedad' : 'exitosa', resumen: eLleg ? 'Validación cruzada: diferencia con lo reportado por el transportador.' : 'Cliente confirma presencia del vehículo y el ingreso autorizado.',
  });

  const eDes = exc('Diferencia_despacho');
  const faltan = eDes ? numeroEn(eDes.titulo, 3) : 0;
  add('despacho', {
    objetivo: 'Confirmar despacho', interlocutor: 'cliente', nombre: contacto, telefono: tel, agente: ag.seg, sentido: 'saliente',
    turnos: eDes
      ? [A(`${SALUDO_A} ¿Confirma que la mercancía fue despachada y las cantidades?`), O(`Salió, pero se cargaron ${faltan} unidades menos de las solicitadas.`), A('Queda registrada la diferencia para validarla antes de continuar.')]
      : [A(`${SALUDO_A} ¿Confirma que la mercancía fue despachada?`), O(`Sí, salió a las ${horaMin(op.fechaCargue + 90 * 60_000)} con las ${m.unidades} unidades.`), A('Registro la hora real de salida y que la operación sigue hacia el destino.')],
    resultado: eDes ? 'con_novedad' : 'exitosa', resumen: eDes ? `Despacho con diferencia de ${faltan} unidades.` : 'Despacho confirmado con las cantidades solicitadas.',
  });

  const eRuta = exc('Novedad_en_ruta');
  add('seguimiento_1', {
    objetivo: 'Seguimiento en ruta', interlocutor: 'transportador', nombre: c.conductor, telefono: c.telT, agente: ag.seg, sentido: 'saliente',
    turnos: eRuta
      ? [A(`${SALUDO_A} Seguimiento del servicio ${op.id}: ¿cómo va el viaje?`), O(`Hay una novedad: ${eRuta.titulo.replace('Novedad en ruta: ', '')}.`), A('¿Cuánto retraso estima?'), O('Unas cuatro horas, aunque no lo puedo asegurar.', false), A('Registro la novedad y la clasifico. Esa hora es una estimación.')]
      : [A(`${SALUDO_A} Seguimiento del servicio ${op.id}: ¿cómo va el viaje?`), O('Sin novedad, voy por la vía principal.'), A('¿Dónde se encuentra y a qué hora estima llegar?'), O('Pasando el peaje, llego sobre las dos de la tarde.', false)],
    resultado: eRuta ? 'con_novedad' : 'exitosa', resumen: eRuta ? 'Novedad en ruta reportada por el conductor.' : 'Estado del viaje, ubicación y ETA (estimada).',
  });
  add('seguimiento_2', {
    objetivo: 'Seguimiento en ruta', interlocutor: 'transportador', nombre: c.conductor, telefono: c.telT, agente: ag.seg, sentido: 'saliente',
    turnos: [A(`${SALUDO_A} Segundo seguimiento: ¿cómo va el recorrido?`), O('Bien, avanzando según lo previsto.'), A('Actualizo la hora estimada de llegada.')],
    resultado: 'exitosa', resumen: 'Avance según lo previsto; ETA actualizada (estimada).',
  });
  add('informar_novedad', {
    objetivo: 'Informar novedad', interlocutor: 'cliente', nombre: contacto, telefono: tel, agente: ag.cliente, sentido: 'saliente',
    turnos: [A(`${SALUDO_A} Le informo sobre la operación ${op.id}: hay una novedad en ruta.`), A('Lo confirmado es que el vehículo está detenido por la novedad; la nueva hora de llegada es solo una estimación.'), O('Entiendo, avíseme cuando tengan una hora confirmada.')],
    resultado: 'exitosa', resumen: 'Cliente informado: novedad confirmada y hora estimada, sin prometer.',
  });
  add('consulta', {
    objetivo: 'Consulta de estado', interlocutor: 'cliente', nombre: contacto, telefono: tel, agente: ag.cliente, sentido: 'entrante',
    turnos: [
      O(`Hola, quiero saber cómo va el servicio ${op.id}.`),
      A(`Buenos días. Para consultar necesito validar su autorización: ¿su nombre y empresa?`),
      O(`${contacto}, de ${op.cliente.nombre}.`),
      A('Verificado: es contacto autorizado de la operación. El vehículo salió, está en tránsito y el último avance confirmado es el seguimiento más reciente.'),
      O('Gracias.'),
    ],
    resultado: 'exitosa', resumen: 'Consulta entrante atendida: identidad validada e informado el último avance confirmado.',
  });
  add('conductor_ocupado', {
    objetivo: 'Seguimiento en ruta', interlocutor: 'transportador', nombre: c.conductor, telefono: c.telT, agente: ag.seg, sentido: 'saliente',
    turnos: [A(`${SALUDO_A} Seguimiento del servicio ${op.id}.`), O('Voy manejando, ahora no puedo hablar.'), A('Entendido, no lo distraigo. Lo vuelvo a llamar en veinte minutos.')],
    resultado: 'reprogramada', resumen: 'El conductor iba manejando: contacto cerrado y reprogramado.',
  });
  add('sin_respuesta', {
    objetivo: 'Seguimiento en ruta', interlocutor: 'transportador', nombre: c.conductor, telefono: c.telT, agente: ag.seg, sentido: 'saliente',
    turnos: [A('Llamando…'), A('Sin respuesta tras seis timbres. Se registra el intento y se programa un nuevo contacto.')],
    resultado: 'sin_respuesta', resumen: 'No contestó: intento registrado y reprogramado.',
  });

  const eDest = exc('Destinatario_no_recibe');
  const hDest = eDest ? numeroEn(eDest.titulo, 3) : 0;
  add('aviso', {
    objetivo: 'Preparar recepción', interlocutor: 'destinatario', nombre: contacto, telefono: tel, agente: ag.cliente, sentido: 'saliente',
    turnos: eDest
      ? [A(`${SALUDO_A} El vehículo de la operación ${op.id} llegará pronto a ${op.nodoDestino.lugar}. ¿Pueden recibirlo?`), O(`No, hasta dentro de ${hDest} horas no tenemos muelle libre.`, false), A('Registro la situación y activo la coordinación con el transportador y el responsable. No confirmo cambios hasta tener las autorizaciones.')]
      : [A(`${SALUDO_A} El vehículo de la operación ${op.id} llegará pronto a ${op.nodoDestino.lugar}. ¿Están preparados para recibirlo?`), O('Sí, el muelle está libre.'), A('¿Cuál es el horario de descargue y la instrucción de ingreso?'), O('Hasta las cinco, con la orden de compra a la mano.')],
    resultado: eDest ? 'con_novedad' : 'exitosa', resumen: eDest ? `Destinatario no puede recibir hasta dentro de ${hDest} h (estimado).` : 'Instalaciones preparadas, horarios e ingreso confirmados.',
  });
  const eDem = exc('Demora_en_descargue');
  add('recepcion', {
    objetivo: 'Confirmar recepción', interlocutor: 'destinatario', nombre: contacto, telefono: tel, agente: ag.seg, sentido: 'saliente',
    turnos: eDem
      ? [A(`${SALUDO_A} El vehículo reporta que aún no ha podido descargar. ¿Cuál es la causa?`), O('Hay fila de vehículos en el muelle; en una hora lo atendemos.', false), A('Registro la demora y su causa; se la notifico al coordinador.')]
      : [A(`${SALUDO_A} ¿Se recibió la mercancía? ¿Hubo diferencias o daños?`), O('Recibida completa y sin daños.'), A('Registro la recepción sin observaciones.')],
    resultado: eDem ? 'con_novedad' : 'exitosa', resumen: eDem ? 'Demora en destino: se identifica causa y tiempo estimado.' : 'Recepción confirmada sin diferencias ni daños.',
  });
  const eEnt = exc('Diferencia_entrega');
  add('entrega', {
    objetivo: 'Validar entrega', interlocutor: 'cliente', nombre: contacto, telefono: tel, agente: ag.cliente, sentido: 'saliente',
    turnos: eEnt
      ? [A(`${SALUDO_A} El transportador informa que la entrega fue completa. ¿Lo confirma?`), O(eEnt.causa.replace(/^.*indica que /, 'No: ').replace(/\.$/, '') + '.'), A('Las versiones no coinciden: no cierro la operación y genero una novedad para el coordinador.')]
      : [A(`${SALUDO_A} El transportador informa que la entrega fue completa. ¿Lo confirma?`), O('Sí, recibida completa.'), A('Gracias. Registro la confirmación y solicito los soportes de entrega.')],
    resultado: eEnt ? 'con_novedad' : 'exitosa', resumen: eEnt ? 'Cliente y transportador no coinciden sobre la entrega.' : 'Entrega confirmada por ambas partes.',
  });
  const eInc = exc('Inconformidad_cliente');
  add('cierre', {
    objetivo: 'Cierre y satisfacción', interlocutor: 'cliente', nombre: contacto, telefono: tel, agente: ag.cliente, sentido: 'saliente',
    turnos: eInc
      ? [A(`${SALUDO_A} Le llamo para cerrar la operación ${op.id}. ¿Se completó satisfactoriamente?`), O(`Se completó, pero ${eInc.causa.replace(/^.*manifiesta que /, '').replace(/\.$/, '')}.`), A('Lamento el inconveniente. No queda como un comentario: abro un caso de seguimiento con responsable y plazo.'), O('Gracias.')]
      : [A(`${SALUDO_A} Le llamo para cerrar la operación ${op.id}. ¿Se completó satisfactoriamente?`), O('Sí, todo bien.'), A('¿Observaciones sobre la atención, el cumplimiento de horarios o el desempeño?'), O('Ninguna, el servicio fue puntual.'), A('Gracias. ¿Cómo califica el servicio de 1 a 5?'), O(`${fin.satisfaccion ?? 5}.`)],
    resultado: eInc ? 'con_novedad' : 'exitosa', resumen: eInc ? 'Inconformidad convertida en caso de seguimiento.' : `Servicio completado · calificación ${fin.satisfaccion ?? 5}/5.`,
  });
  void rand;
  return out;
}

/* ─── Revisiones ─── */
const item = (id: string, etiqueta: string, valor: string, ok = true, regla?: string, excepcion?: TipoExcepcion): ItemRevision => ({ id, etiqueta, valor, ok, regla, excepcion });

function construirDatosMinimos(o: Operacion): ItemRevision[] {
  const m = o.mercancia;
  const falta = (clave: string) => o.datosPendientes.some((p) => p.toLowerCase().includes(clave));
  return [
    item('origen', 'Origen', `${o.nodoOrigen.lugar}, ${o.nodoOrigen.ciudad}`),
    item('destino', 'Destino', `${o.nodoDestino.lugar}, ${o.nodoDestino.ciudad}`),
    item('mercancia', 'Tipo de mercancía', `${m.tipo} · ${m.descripcion} · ${m.unidades} und`),
    item('peso', 'Peso', falta('peso') ? 'No informado' : `${miles(m.pesoKg)} kg`, !falta('peso'), 'R01', 'Datos_incompletos'),
    item('volumen', 'Volumen', falta('volumen') ? 'No informado' : `${m.volumenM3.toString().replace('.', ',')} m³`, !falta('volumen'), 'R01', 'Datos_incompletos'),
    item('vehiculo', 'Características del vehículo', falta('vehículo') ? 'No informado' : o.vehiculoRequerido, !falta('vehículo'), 'R01', 'Datos_incompletos'),
    item('cargue', 'Fecha y hora de cargue', falta('hora') ? 'Fecha sin hora' : fechaHora(o.fechaCargue), !falta('hora'), 'R01', 'Datos_incompletos'),
    item('entrega', 'Condiciones de entrega', falta('recibo') ? 'Sin contacto de recibo' : o.condicionesEntrega, !falta('recibo'), 'R01', 'Datos_incompletos'),
    item('especial', 'Requisito especial', falta('ingreso') ? 'Pendiente de confirmar' : o.requisitoEspecial ?? 'Ninguno', !falta('ingreso'), 'R01', 'Datos_incompletos'),
  ];
}

function construirDocumentos(placa: string, conductor: string, ahora: number): ItemRevision[] {
  const vence = (meses: number) => new Date(ahora + meses * 30 * 86_400_000).toLocaleDateString('es-CO', { month: '2-digit', year: 'numeric' });
  return [
    item('licencia', 'Licencia de conducción', `${conductor} · categoría C2 · vigente hasta ${vence(14)}`, true, 'R10'),
    item('soat', 'SOAT', `${placa} · vigente hasta ${vence(7)}`, true, 'R10'),
    item('tecnomecanica', 'Revisión técnico-mecánica', `${placa} · vigente hasta ${vence(5)}`, true, 'R10'),
    item('propiedad', 'Tarjeta de propiedad', `${placa} · a nombre de la empresa transportadora`, true, 'R10'),
    item('seguridad', 'Afiliación a seguridad social', `${conductor} · salud, pensión y ARL al día`, true, 'R10'),
    item('manifiesto', 'Manifiesto de carga electrónico', `Habilitado para la ruta`, true, 'R10'),
  ];
}

export function construirDatos(seq: number, tr: Operacion[], rand: Rand, ahoraSim: number): DatosCaso {
  const op = tr[0];
  const fin = tr[tr.length - 1];
  const anio = new Date(ahoraSim).getFullYear();
  const transp = [...tr].reverse().find((o) => o.transportador)?.transportador ?? TRANSPORTADORES[0];
  const receptor = fin.receptor ?? { nombre: 'Yesid Palacios', telefono: '+57 312 555 0431' };
  const tTarifa = excDe(tr, 'Tarifa_sobre_tope');
  const ofertas = (tTarifa ? tr.find((o) => o.excepcion?.tipo === 'Tarifa_sobre_tope')?.ofertas : [...tr].reverse().find((o) => o.ofertas.length > 0)?.ofertas) ?? [];
  const rondas: RondaNegociacion[] = ofertas.map((x) => ({
    transportadorId: x.transportadorId,
    transportador: x.nombre,
    vehiculo: x.vehiculo,
    telefono: TRANSPORTADORES.find((t) => t.id === x.transportadorId)?.telefono ?? '+57 310 555 0300',
    tarifaOfrecida: x.tarifaOfrecida,
    contrapropuesta: x.tarifaSolicitada,
    tarifaFinal: x.tarifaFinal,
    estado: x.estado,
    compatibilidad: x.compatibilidad,
    cumplimiento: x.cumplimiento,
  }));
  const dialogos = construirDialogos({ tr, fin, op, conductor: transp.conductor, telT: transp.telefono, transp: transp.nombre, placa: transp.placa, receptor, rondas }, rand);

  const eLleg = excDe(tr, 'Diferencia_llegada');
  const horaLleg = fin.horaSalida ? fin.horaSalida - 80 * 60_000 : op.fechaCargue;
  const cruceLlegada: Cruce = {
    titulo: 'Presentación del transportador en el punto de origen',
    transportador: { fuente: `${transp.conductor} · actualización del transportador`, afirma: `Llegué a ${op.nodoOrigen.lugar} a las ${horaMin(horaLleg)}, placa ${transp.placa}` },
    cliente: { fuente: `${op.cliente.contacto} · portería del cliente`, afirma: eLleg ? 'No hay ningún vehículo con esa placa en portería ni en el patio' : `Vehículo ${transp.placa} en el muelle, ingreso autorizado` },
    coincide: !eLleg,
    detalle: eLleg ? 'Diferencia entre lo reportado y lo observado (R15)' : 'Lo reportado coincide con lo observado (R15)',
  };

  const eDes = excDe(tr, 'Diferencia_despacho');
  const eEsp = excDe(tr, 'Espera_en_cargue');
  const faltan = eDes ? numeroEn(eDes.titulo, 3) : 0;
  const minEsp = eEsp ? numeroEn(eEsp.titulo, 120) : entre(rand, 12, 55);
  const cargue: ItemRevision[] = [
    item('espera', 'Espera en el punto de cargue', `${minEsp} min${eEsp ? ' · supera el parámetro de 90 min' : ''}`, !eEsp, 'R16', 'Espera_en_cargue'),
    item('unidades', 'Unidades cargadas', eDes ? `${op.mercancia.unidades - faltan} de ${op.mercancia.unidades} solicitadas` : `${op.mercancia.unidades} de ${op.mercancia.unidades} solicitadas`, !eDes, 'R17', 'Diferencia_despacho'),
    item('condiciones', 'Condiciones de la carga', 'Estibas íntegras · sin daños visibles', true, 'R17'),
    item('remision', 'Remisión de despacho', eDes ? `R-${String(seq).padStart(6, '0')} · sin firma del cliente` : `R-${String(seq).padStart(6, '0')} · firmada por ${op.cliente.contacto}`, !eDes, 'R17', 'Diferencia_despacho'),
    item('sellos', 'Sellos de seguridad', `2 sellos · ${hex(rand, 6).toUpperCase()} / ${hex(rand, 6).toUpperCase()}`, true),
    item('salida', 'Hora real de salida', fin.horaSalida ? horaMin(fin.horaSalida) : horaMin(op.fechaCargue + 100 * 60_000), true),
  ];

  const eEnt = excDe(tr, 'Diferencia_entrega');
  const cruceEntrega: Cruce = {
    titulo: 'Entrega al destinatario',
    transportador: { fuente: `${transp.conductor} · actualización del transportador`, afirma: `Entrega completa de ${op.mercancia.unidades} unidades en ${op.nodoDestino.lugar}` },
    cliente: { fuente: `${op.cliente.contacto} · destinatario`, afirma: eEnt ? eEnt.causa.replace(/^.*indica que /, '').replace(/\.$/, '') : `Recibidas ${op.mercancia.unidades} unidades completas, sin daños` },
    coincide: !eEnt,
    detalle: eEnt ? 'No coinciden: no se cierra automáticamente (R23)' : 'Ambas partes coinciden (R23)',
  };

  const eSob = excDe(tr, 'Sobrecosto_liquidacion');
  const extraSol = eSob ? numeroEn(eSob.titulo.replace(/\./g, ''), 0) : 0;
  const tarifa = fin.tarifaPactada ?? op.tarifaMaxima;
  const cierreAdmin: ItemRevision[] = [
    item('documentos', 'Documentación final del servicio', `Remisión, soporte de entrega y manifiesto completos`, true, 'R25'),
    item('economicas', 'Condiciones económicas negociadas', `Tarifa pactada ${pesos(tarifa)} · tope ${pesos(op.tarifaMaxima)}`, tarifa <= op.tarifaMaxima || fin.costosAdicionales > 0, 'R25'),
    item('adicionales', 'Costos adicionales autorizados', eSob ? `Solicitados ${pesos(extraSol)} · autorizados ${pesos(0)}` : `${pesos(fin.costosAdicionales)} autorizados`, !eSob, 'R25', 'Sobrecosto_liquidacion'),
    item('novedades', 'Novedades que afectan la liquidación', fin.excepcionesPrevias.length ? `${fin.excepcionesPrevias.length} novedades registradas, todas resueltas` : 'Sin novedades', true, 'R25'),
    item('soportes', 'Soportes de entrega', 'Soporte firmado cargado en el expediente', true, 'R25'),
  ];

  // Agenda centralizada: una tarea por llamada del caso + las que siguen pendientes
  const tareas: TareaAgenda[] = fin.llamadas.slice(0, 9).map((l: Llamada, i) => ({
    id: `T-${seq}-${i + 1}`,
    hora: l.ts,
    objetivo: l.objetivo,
    interlocutor: `${l.nombre} (${l.interlocutor})`,
    actividad: l.resumen.length > 70 ? `${l.resumen.slice(0, 68)}…` : l.resumen,
    estado: l.resultado === 'sin_respuesta' || l.resultado === 'reprogramada' ? 'reprogramada' : 'hecha',
  }));
  tareas.push({ id: `T-${seq}-p1`, hora: fin.fechaCargue + 6 * 3_600_000, objetivo: 'Seguimiento en ruta', interlocutor: `${transp.conductor} (transportador)`, actividad: 'Seguimiento programado del viaje', estado: 'pendiente' });

  // Tablero: esta operación + 4 operaciones de relleno (otros clientes)
  const rutas: [string, string][] = [['Medellín', 'Barranquilla'], ['Bogotá', 'Cali'], ['Cali', 'Pereira'], ['Medellín', 'Bucaramanga'], ['Bogotá', 'Ibagué']];
  const estados = ['En ruta · sin novedad', 'En ruta · retraso estimado', 'Cargando', 'En destino · descargando'];
  const filas: FilaSeguimiento[] = rutas.slice(0, 4).map((r, i) => {
    const cl = CLIENTES[(seq + i * 3) % CLIENTES.length];
    const tp = TRANSPORTADORES[(seq + i) % TRANSPORTADORES.length];
    return {
      operacion: `OP-${String(6900 + ((seq * 7 + i * 13) % 90)).padStart(4, '0')}`,
      cliente: cl.nombre,
      ruta: `${r[0]} → ${r[1]}`,
      vehiculo: `${tp.placa} · ${tp.nombre}`,
      estado: estados[(seq + i) % estados.length],
      eta: `${String(8 + ((seq + i * 3) % 9)).padStart(2, '0')}:${['00', '15', '30', '45'][(seq + i) % 4]}`,
      confirmada: (seq + i) % 3 === 0,
      propia: false,
    };
  });
  filas.unshift({ operacion: op.id, cliente: op.cliente.nombre, ruta: rutaDe(op), vehiculo: `${transp.placa} · ${transp.nombre}`, estado: 'En ruta · sin novedad', eta: horaMin(op.fechaCargue + 7 * 3_600_000), confirmada: false, propia: true });

  const conExc = tr.find((o) => o.excepcion !== null);
  const excepcion = conExc?.excepcion ?? null;
  const resuelta = excepcion ? fin.excepcionesPrevias.find((e) => e.tipo === excepcion.tipo) ?? null : null;
  let decision: DecisionCaso | null = null;
  if (excepcion && resuelta && resuelta.resueltaPor === 'coordinador') {
    decision = {
      humano: humanoPara(excepcion.tipo),
      decision: resuelta.decisionHumana ?? 'AUTORIZAR',
      alternativa: resuelta.alternativaElegida ?? null,
      aplicada: resuelta.alternativas.find((a) => a.id === resuelta.alternativaElegida) ?? null,
    };
  }

  return {
    trayectoria: tr,
    solicitud: construirSolicitud(op, seq, rand, ahoraSim),
    dialogos,
    datosMinimos: construirDatosMinimos(op),
    documentos: construirDocumentos(transp.placa, transp.conductor, ahoraSim),
    negociacion: rondas,
    cruceLlegada,
    cargue,
    cruceEntrega,
    cierreAdmin,
    agenda: tareas,
    tablero: filas,
    excepcion,
    decision,
    compromisos: fin.compromisos,
    expediente: { numero: `EXP-COORD-${anio}-${String(seq).padStart(5, '0')}`, hash: hex(rand, 64) },
    sesion: { usuario: 'rpa.coordinacion', servidor: 'SRV-COORD-02', terminal: `T-${entre(rand, 10, 24)}`, vm: SESION_VM },
    anio,
  };
}

export { CANAL_INFO };
