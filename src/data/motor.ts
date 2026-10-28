// ============================================================================
// motor.ts — transicionar(): función pura con las reglas del proceso.
//
// Implementa el flujo del insumo etapa por etapa: bifurcaciones (datos
// incompletos, tarifa sobre el tope, sin transportador), reingresos (volver a
// buscar, reprogramar), escalamiento a la persona (Mesa del coordinador) y
// rechazo con causa. En cada acción automática deja la TRAZA:
//   qué ocurrió → qué información utilizó → qué regla aplicó → qué decidió
//   → qué ejecutó → resultado.
// ============================================================================

import type {
  AgenteIA,
  Alternativa,
  CategoriaDecision,
  DecisionHumana,
  EfectoAlternativa,
  Ejecutor,
  EtapaFlujo,
  Excepcion,
  Llamada,
  LogEntry,
  NombreEvento,
  ObjetivoLlamada,
  Operacion,
  ResultadoLlamada,
  TipoExcepcion,
} from '@/types';
import {
  PLANTILLA_EXCEPCION,
  TIPOS_EXCEPCION,
  TRANSPORTADORES,
  construirOfertas,
  esEtapaFlujo,
  INDICATIVO,
  calcularTiempos,
  tarifaDeCierre,
  esTerminal,
  generarOperacion,
  progresoDe,
  reiniciarContador,
  siguienteEtapa,
  siguienteSeq,
  ETAPA_BLOQUE,
} from './mockData';
import { REGLA_POR_ID } from './procesoData';
import { type Rng, crearRng, elegir, entre } from '@/lib/rng';

// --- Reloj simulado -------------------------------------------------------------

export const MINUTOS_POR_TICK = 45;
const MIN_POR_DIA_OPERATIVO = 14 * 60; // 06:00-20:00, lunes a sábado

/** El reloj salta las noches (20:00-06:00) y los domingos. */
export function relojEn(tick: number): number {
  const min = tick * MINUTOS_POR_TICK;
  const dias = Math.floor(min / MIN_POR_DIA_OPERATIVO);
  const resto = min % MIN_POR_DIA_OPERATIVO;
  const f = new Date(2026, 9, 26, 6, 0, 0, 0); // lunes 26 de octubre de 2026
  let pendientes = dias;
  while (pendientes > 0) {
    f.setDate(f.getDate() + 1);
    if (f.getDay() !== 0) pendientes -= 1;
  }
  return f.getTime() + resto * 60_000;
}

// --- Opciones y resultado ----------------------------------------------------------

export interface DecisionSimulada {
  decision: DecisionHumana;
  alternativa?: Alternativa['id'];
  por: string;
}

export interface OpcionesTransicion {
  ahora: number;
  rng?: Rng;
  /** Interruptor «Selección automática» (R09). */
  seleccionAutomatica: boolean;
  decisionHumana?: DecisionSimulada;
  forzar?: { excepcion?: TipoExcepcion; resolver?: boolean };
}

export interface ResultadoTransicion {
  operacion: Operacion;
  logs: LogEntry[];
}

let contadorLog = 0;
export function nuevoLog(
  op: Pick<Operacion, 'id'> | null,
  evento: NombreEvento,
  texto: string,
  ts: number,
  tipo: LogEntry['tipo'] = 'evento',
): LogEntry {
  contadorLog += 1;
  return { id: `L-${contadorLog}`, ts, evento, texto, operacionId: op ? op.id : null, tipo };
}

const COORDINADORES = ['Camila Restrepo · coordinadora logística', 'Andrés Felipe Mora · coordinador logístico', 'Laura Cifuentes · coordinadora logística'];
const RECEPTORES = ['Yesid Palacios', 'Marta Lucía Ocampo', 'Jairo Echeverri', 'Luz Dary Sánchez', 'Carlos Arboleda', 'Sandra Beltrán'];

// --- Utilidades internas -------------------------------------------------------------

function clonar(op: Operacion): Operacion {
  return {
    ...op,
    ofertas: op.ofertas.map((o) => ({ ...o })),
    llamadas: [...op.llamadas],
    compromisos: op.compromisos.map((c) => ({ ...c })),
    excepcionesPrevias: [...op.excepcionesPrevias],
    trazas: [...op.trazas],
    eventos: [...op.eventos],
    soportes: [...op.soportes],
    datosPendientes: [...op.datosPendientes],
  };
}

interface Ctx {
  n: Operacion;
  ts: number;
  rng: Rng;
  logs: LogEntry[];
  seleccionAutomatica: boolean;
}

function evento(c: Ctx, ev: NombreEvento, detalle: string) {
  c.n.eventos.push({ evento: ev, timestamp: c.ts, detalle });
  c.logs.push(nuevoLog(c.n, ev, `${c.n.id} · ${detalle}`, c.ts));
}

function traza(
  c: Ctx,
  etapa: EtapaFlujo,
  ejecutor: Ejecutor,
  ocurrio: string,
  informacion: string[],
  regla: string,
  decidio: string,
  ejecuto: string,
  resultado: string,
) {
  const r = REGLA_POR_ID[regla];
  c.n.trazas.push({
    id: `${c.n.id}-T${c.n.trazas.length + 1}`,
    ts: c.ts,
    etapa,
    ejecutor,
    ocurrio,
    informacion,
    regla: r ? `${r.id} · ${r.politica}` : regla,
    decidio,
    ejecuto,
    resultado,
  });
}

function llamar(
  c: Ctx,
  o: {
    interlocutor: Llamada['interlocutor'];
    objetivo: ObjetivoLlamada;
    agente: AgenteIA;
    etapa: EtapaFlujo;
    resumen: string;
    resultado?: ResultadoLlamada;
    sentido?: Llamada['sentido'];
    confirmada?: boolean;
    nombre?: string;
  },
) {
  const { n, rng } = c;
  const resultado = o.resultado ?? 'exitosa';
  const nombre =
    o.nombre ??
    (o.interlocutor === 'transportador' ? n.transportador?.conductor ?? 'Conductor' : o.interlocutor === 'destinatario' ? n.receptor?.nombre ?? n.cliente.contacto : n.cliente.contacto);
  const base = o.interlocutor === 'transportador' ? [1, 14] : [2, 24];
  n.llamadas.push({
    id: `${n.id}-C${n.llamadas.length + 1}`,
    ts: c.ts,
    sentido: o.sentido ?? 'saliente',
    interlocutor: o.interlocutor,
    nombre,
    objetivo: o.objetivo,
    resultado,
    respuestaMin: resultado === 'sin_respuesta' ? null : entre(rng, base[0], base[1]),
    duracionSeg: resultado === 'sin_respuesta' ? 0 : entre(rng, 45, 230),
    agente: o.agente,
    etapa: o.etapa,
    resumen: o.resumen,
    confirmada: o.confirmada ?? resultado === 'exitosa',
  });
}

function compromiso(c: Ctx, texto: string, parte: Operacion['compromisos'][number]['parte'], venceEn: number) {
  c.n.compromisos.push({ id: `${c.n.id}-K${c.n.compromisos.length + 1}`, texto, parte, venceEn, estado: 'pendiente' });
}

function resolverCompromisos(c: Ctx, prefijo: string, incumplido: boolean) {
  c.n.compromisos = c.n.compromisos.map((k) =>
    k.estado === 'pendiente' && k.texto.startsWith(prefijo) ? { ...k, estado: incumplido ? 'incumplido' : 'cumplido' } : k,
  );
}

const hubo = (n: Operacion, t: TipoExcepcion) => n.excepcionesPrevias.some((e) => e.tipo === t);

function mejorOferta(n: Operacion, criterio: 'tarifa' | 'cumplimiento' | 'compat') {
  const lista = n.ofertas.filter((o) => o.estado !== 'sin_interes' && o.estado !== 'sobre_tope');
  const base = lista.length > 0 ? lista : n.ofertas;
  const t = (o: (typeof base)[number]) => o.tarifaFinal ?? o.tarifaOfrecida;
  return [...base].sort((a, b) => (criterio === 'tarifa' ? t(a) - t(b) : criterio === 'cumplimiento' ? b.cumplimiento - a.cumplimiento : b.compatibilidad - a.compatibilidad))[0];
}

// --- Qué ocurre al COMPLETAR cada etapa -----------------------------------------------------

function completarEtapa(c: Ctx, etapa: EtapaFlujo): void {
  const { n, rng, ts } = c;
  const horasCargue = (n.fechaCargue - ts) / 3_600_000;
  switch (etapa) {
    case 'Solicitud':
      traza(c, etapa, 'Agente de cliente', 'Ingresó una solicitud de transporte', [`Canal: ${n.canal}`, `Solicitante: ${n.solicitante}`], 'R02', 'Registrar lo confirmado y pasar a validación', 'Captura de datos mínimos', 'Solicitud lista para validar');
      break;
    case 'Validacion':
      evento(c, 'SolicitudValidada', `Solicitud validada · ${n.mercancia.descripcion} · ${n.nodoOrigen.ciudad} → ${n.nodoDestino.ciudad}`);
      traza(c, etapa, 'Sistema', 'Se validó la suficiencia de la solicitud', ['Datos mínimos completos', `Tipo de vehículo: ${n.vehiculoRequerido}`], 'R01', 'La información es suficiente para iniciar', 'Marcar solicitud como válida', 'Pasa a registro y planeación');
      break;
    case 'Planeacion':
      llamar(c, { interlocutor: 'cliente', objetivo: 'Confirmar condiciones de cargue', agente: 'Agente de cliente', etapa, resumen: `Confirma con ${n.cliente.contacto} disponibilidad de cargue, acceso y horarios en ${n.nodoOrigen.lugar}.` });
      evento(c, 'OperacionRegistrada', `Operación registrada con identificador único ${n.id}`);
      compromiso(c, 'Mercancía disponible para cargue en la fecha acordada', 'cliente', n.fechaCargue);
      traza(c, etapa, 'Agente de cliente', 'Solicitud completa: se registra la operación', ['Identificador único asignado', `Restricciones: ${n.requisitoEspecial ?? 'ninguna'}`, `Fecha comprometida de cargue`], 'R03', 'Iniciar la planeación logística', 'Llamada al contacto autorizado para validar cargue y acceso', 'Condiciones confirmadas; se puede buscar transportador');
      break;
    case 'Busqueda': {
      n.ofertas = construirOfertas(n, rng);
      evento(c, 'TransportadoresPreseleccionados', `${n.ofertas.length} candidatos preseleccionados en la base de proveedores`);
      traza(c, etapa, 'Sistema', 'Se buscaron transportadores compatibles', ['Ubicación', 'Tipo de vehículo', 'Capacidad', 'Rutas habituales', 'Historial de cumplimiento', 'Condiciones comerciales'], 'R05', `Preseleccionar ${n.ofertas.length} candidatos`, 'Consulta a la base de proveedores', n.ofertas.map((o) => `${o.nombre} (${o.compatibilidad} %)`).join(' · '));
      break;
    }
    case 'Negociacion': {
      evento(c, 'NegociacionIniciada', `Llamadas de negociación a ${n.ofertas.length} transportadores`);
      for (const o of n.ofertas) {
        if (o.estado === 'sobre_tope') {
          o.tarifaFinal = null;
          continue;
        }
        if (o.estado === 'sin_interes') continue;
        if (o.tarifaFinal !== null) continue;
        o.tarifaFinal = tarifaDeCierre(o.tarifaOfrecida, o.tarifaSolicitada, n.tarifaMaxima);
        o.estado = 'contraoferta_ok';
        llamar(c, { interlocutor: 'transportador', objetivo: 'Negociar tarifa', agente: 'Agente de negociación', etapa, nombre: o.nombre, resumen: `Presenta el viaje ${n.nodoOrigen.ciudad} → ${n.nodoDestino.ciudad}; acuerda ${new Intl.NumberFormat('es-CO').format(o.tarifaFinal)} COP dentro del tope.` });
      }
      evento(c, 'AceptacionPreliminar', `${n.ofertas.filter((o) => o.tarifaFinal !== null).length} aceptaciones preliminares registradas`);
      traza(c, etapa, 'Agente de negociación', 'Se negoció con los candidatos', [`Tope autorizado ${new Intl.NumberFormat('es-CO').format(n.tarifaMaxima)} COP`, `${n.ofertas.length} llamadas`], 'R06', 'Aceptar tarifas que no superen el máximo autorizado', 'Registro de aceptaciones preliminares', 'Ofertas listas para consolidar');
      break;
    }
    case 'Seleccion': {
      if (n.ofertas.length === 0) {
        n.ofertas = construirOfertas(n, rng);
        for (const x of n.ofertas) x.tarifaFinal = Math.min(x.tarifaOfrecida, n.tarifaMaxima);
      }
      if (!n.transportador) {
        const o = mejorOferta(n, 'tarifa');
        const t = TRANSP(o.transportadorId);
        n.transportador = t;
        n.tarifaPactada = o.tarifaFinal ?? o.tarifaOfrecida;
        evento(c, 'TransportadorSeleccionado', `Selección automática · ${t.nombre} · ${new Intl.NumberFormat('es-CO').format(n.tarifaPactada)} COP`);
        traza(c, etapa, 'Sistema', 'Se consolidaron las ofertas', n.ofertas.map((x) => `${x.nombre}: ${new Intl.NumberFormat('es-CO').format(x.tarifaFinal ?? x.tarifaOfrecida)} COP`), 'R09', 'Seleccionar la mejor oferta que cumple requisitos operativos, documentales y comerciales', 'Selección automática', `${t.nombre} seleccionado`);
      } else {
        evento(c, 'TransportadorSeleccionado', `Seleccionado por el coordinador · ${n.transportador.nombre}`);
      }
      break;
    }
    case 'Asignacion': {
      const t = n.transportador!;
      n.soportes.push({ nombre: `Documentos de ${t.placa} y ${t.conductor}`, tipo: 'documento', ts });
      evento(c, 'DocumentosValidados', `Documentos del vehículo ${t.placa} y del conductor validados`);
      evento(c, 'AsignacionConfirmada', `Asignación formalizada · ${t.nombre} · ${t.placa}`);
      traza(c, etapa, 'Sistema', 'Se validaron los documentos para prestar el servicio', ['Licencia, SOAT, revisión técnico-mecánica', 'Afiliaciones del conductor'], 'R10', 'Formalizar la asignación', 'Registro de la asignación', 'Se activa la comunicación de confirmación');
      break;
    }
    case 'Confirmacion': {
      n.receptor = { nombre: elegir(rng, RECEPTORES), telefono: `+57 ${INDICATIVO[n.nodoDestino.ciudad] ?? '601'} 555 0${entre(rng, 400, 899)}` };
      llamar(c, { interlocutor: 'cliente', objetivo: 'Informar asignación', agente: 'Agente de cliente', etapa, resumen: `Informa vehículo asignado (${n.transportador?.placa}); confirma fecha y hora, lugar de cargue y disponibilidad. Receptor: ${n.receptor.nombre}.` });
      llamar(c, { interlocutor: 'transportador', objetivo: 'Confirmar con transportador', agente: 'Agente de seguimiento', etapa, resumen: 'Confirma que recibió la información completa, conoce las condiciones y está preparado.' });
      evento(c, 'ConfirmacionDoble', 'Cliente y transportador confirmaron la misma información');
      compromiso(c, 'Transportador se presenta en el punto de cargue a la hora acordada', 'transportador', n.fechaCargue);
      traza(c, etapa, 'Agente de cliente', 'Se asignó el vehículo', ['Fecha y hora de presentación', 'Lugar de cargue', 'Instrucciones de ingreso y seguridad'], 'R11', 'Confirmar a las dos partes con la misma información', 'Dos llamadas (cliente y transportador)', 'Ambas partes alineadas');
      break;
    }
    case 'Preventiva': {
      llamar(c, { interlocutor: 'transportador', objetivo: 'Llamada preventiva', agente: 'Agente de seguimiento', etapa, resumen: `Confirma disponibilidad, ubicación y tiempo estimado de llegada (faltan ${Math.max(1, Math.round(horasCargue))} h).` });
      llamar(c, { interlocutor: 'cliente', objetivo: 'Llamada preventiva', agente: 'Agente de seguimiento', etapa, resumen: 'Verifica que la mercancía esté preparada, el punto de cargue disponible y sin cambios.' });
      evento(c, 'LlamadaPreventiva', 'Llamadas preventivas a cliente y transportador completadas');
      traza(c, etapa, 'Agente de seguimiento', 'Se acerca la fecha de cargue', ['Disponibilidad del transportador', 'Estado de la mercancía'], 'R12', 'Verificar a ambas partes antes del cargue', 'Dos llamadas preventivas', 'Sin cambios en la programación');
      break;
    }
    case 'Presentacion': {
      llamar(c, { interlocutor: 'transportador', objetivo: 'Validar presentación', agente: 'Agente de seguimiento', etapa, resumen: 'El transportador informa su llegada al punto de cargue.' });
      llamar(c, { interlocutor: 'cliente', objetivo: 'Validar presentación', agente: 'Agente de seguimiento', etapa, resumen: 'Validación cruzada: el cliente confirma que el vehículo está en las instalaciones y autorizó el ingreso.' });
      evento(c, 'LlegadaOrigenConfirmada', `Llegada en origen confirmada por ambas partes · ${n.transportador?.placa}`);
      resolverCompromisos(c, 'Transportador se presenta', false);
      traza(c, etapa, 'Agente de seguimiento', 'El transportador reportó su llegada', ['Reporte del transportador', 'Observación del cliente'], 'R15', 'Dar por presentado al vehículo', 'Validación cruzada', 'Lo reportado coincide con lo observado');
      break;
    }
    case 'Cargue': {
      n.horaSalida = calcularTiempos(n).salida;
      llamar(c, { interlocutor: 'cliente', objetivo: 'Confirmar despacho', agente: 'Agente de seguimiento', etapa, resumen: 'Confirma hora real de salida, condiciones del despacho y que la mercancía fue despachada.' });
      evento(c, 'CargueFinalizado', `Cargue finalizado · ${n.mercancia.unidades} und · ${n.mercancia.pesoKg} kg`);
      evento(c, 'DespachoConfirmado', `Despacho confirmado · salida ${new Date(ts).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`);
      n.soportes.push({ nombre: `Remisión de despacho ${n.id}`, tipo: 'documento', ts });
      resolverCompromisos(c, 'Mercancía disponible', hubo(n, 'Mercancia_no_lista'));
      traza(c, etapa, 'Agente de seguimiento', 'Terminó el cargue', ['Hora real de salida', 'Cantidades y condiciones de la carga'], 'R17', 'Registrar diferencias y dar inicio al recorrido', 'Confirmación con el cliente', 'Operación en tránsito');
      break;
    }
    case 'Transito': {
      const t = n.transportador;
      llamar(c, { interlocutor: 'transportador', objetivo: 'Seguimiento en ruta', agente: 'Agente de seguimiento', etapa, resumen: `Estado del viaje, ubicación reportada (${t ? t.base : 'ruta'}) y novedades: sin novedad. ETA estimada informada por el conductor.`, confirmada: false });
      llamar(c, { interlocutor: 'transportador', objetivo: 'Seguimiento en ruta', agente: 'Agente de seguimiento', etapa, resumen: 'Segundo seguimiento programado: avanza según lo previsto; hora estimada de llegada actualizada.', confirmada: false });
      if (rng() < 0.4) llamar(c, { interlocutor: 'cliente', objetivo: 'Consulta de estado', agente: 'Agente de cliente', etapa, sentido: 'entrante', resumen: `${n.cliente.contacto} consulta el estado: el agente valida su autorización e informa último avance confirmado.` });
      evento(c, 'SeguimientoRegistrado', 'Seguimientos en ruta registrados; hora estimada de llegada actualizada');
      traza(c, etapa, 'Agente de seguimiento', 'Se ejecutó el monitoreo programado', ['Ubicación reportada', 'Novedades', 'Hora estimada de llegada'], 'R19', 'Informar solo lo confirmado; las estimaciones se rotulan como tales', 'Llamadas programadas al transportador', 'Estado de la operación actualizado');
      break;
    }
    case 'AvisoDestino':
      llamar(c, { interlocutor: 'destinatario', objetivo: 'Preparar recepción', agente: 'Agente de cliente', etapa, resumen: `Confirma con ${n.cliente.contacto} que las instalaciones están preparadas, horarios de descargue e instrucciones de ingreso.` });
      evento(c, 'SeguimientoRegistrado', `Aviso de llegada al destino confirmado · ${n.nodoDestino.lugar}`);
      traza(c, etapa, 'Agente de cliente', 'Se aproxima la hora estimada de llegada', ['Horarios de descargue', 'Instrucciones de ingreso'], 'R22', 'Confirmar preparación del destinatario', 'Llamada al contacto de recepción', 'Destino listo para recibir');
      break;
    case 'Descargue':
      n.horaEntrega = calcularTiempos(n).llegadaDestino;
      llamar(c, { interlocutor: 'destinatario', objetivo: 'Confirmar recepción', agente: 'Agente de seguimiento', etapa, resumen: 'Valida la recepción, pregunta por diferencias o daños y por observaciones.' });
      evento(c, 'LlegadaDestinoConfirmada', `Llegada y descargue en ${n.nodoDestino.ciudad} confirmados`);
      traza(c, etapa, 'Agente de seguimiento', 'El transportador llegó al destino', ['Hora reportada', 'Confirmación del contacto de recepción'], 'R16', 'Seguir hasta confirmar que la mercancía fue recibida', 'Llamada de recepción', 'Mercancía recibida');
      break;
    case 'ValidacionEntrega':
      llamar(c, { interlocutor: 'cliente', objetivo: 'Validar entrega', agente: 'Agente de cliente', etapa, resumen: 'Ambas partes coinciden en que el servicio fue ejecutado correctamente; se solicitan los soportes.' });
      n.soportes.push({ nombre: `Soporte de entrega ${n.id}`, tipo: 'soporte_entrega', ts });
      evento(c, 'EntregaConfirmada', 'Entrega confirmada por transportador y cliente');
      resolverCompromisos(c, 'Entrega', false);
      traza(c, etapa, 'Agente de cliente', 'El transportador informó entrega completa', ['Reporte del transportador', 'Confirmación del cliente'], 'R23', 'Ambas versiones coinciden: registrar confirmación operativa', 'Solicitud de soportes', 'Entrega confirmada');
      break;
    case 'LlamadaCierre': {
      const sat = n.casoSeguimiento ? entre(rng, 2, 3) : entre(rng, 4, 5);
      n.satisfaccion = sat;
      llamar(c, { interlocutor: 'cliente', objetivo: 'Cierre y satisfacción', agente: 'Agente de cliente', etapa, resumen: `Confirma servicio completado, recoge observaciones y calificación (${sat}/5): atención, horarios y desempeño.` });
      n.soportes.push({ nombre: `Transcripción llamada de cierre ${n.id}`, tipo: 'transcripcion', ts });
      if (rng() < 0.6) n.soportes.push({ nombre: `Grabación llamada de cierre ${n.id}`, tipo: 'grabacion', ts, autorizada: true });
      evento(c, 'LlamadaCierre', `Llamada de cierre completada · satisfacción ${sat}/5`);
      traza(c, etapa, 'Agente de cliente', 'Se realizó la llamada de cierre', ['Calificación', 'Observaciones'], 'R24', n.casoSeguimiento ? 'Mantener el caso de seguimiento abierto' : 'Sin inconformidad', 'Registro de satisfacción', 'Listo para cierre administrativo');
      break;
    }
    case 'CierreAdmin':
      n.soportes.push({ nombre: `Liquidación ${n.id}`, tipo: 'liquidacion', ts });
      n.compromisos = n.compromisos.map((k) => (k.estado === 'pendiente' ? { ...k, estado: 'cumplido' } : k));
      traza(c, etapa, 'Sistema', 'Se verificaron los documentos finales', [`Tarifa pactada ${new Intl.NumberFormat('es-CO').format(n.tarifaPactada ?? 0)} COP`, `Costos adicionales autorizados ${new Intl.NumberFormat('es-CO').format(n.costosAdicionales)} COP`], 'R25', 'Cerrar administrativamente', 'Cierre y liquidación', 'Operación cerrada');
      break;
  }
}

function TRANSP(id: string) {
  return TRANSPORTADORES.find((t) => t.id === id)!;
}

function avanzar(c: Ctx, desde: EtapaFlujo) {
  const { n } = c;
  completarEtapa(c, desde);
  n.intentosContacto = 0;
  const sig = siguienteEtapa(desde);
  n.etapaRetorno = null;
  if (sig === 'Cerrada') {
    n.etapa = 'Cerrada';
    n.fechaCierre = c.ts;
    evento(c, 'OperacionCerrada', `Cierre administrativo · ${n.cliente.nombre} · ${n.nodoOrigen.ciudad} → ${n.nodoDestino.ciudad}`);
  } else {
    n.etapa = sig;
  }
}

function sincronizar(n: Operacion, ts: number) {
  n.bloque = ETAPA_BLOQUE[n.etapa];
  n.progreso = progresoDe(n.etapa, n.etapaRetorno);
  n.fechaActualizacion = ts;
}

// --- Excepciones: levantar y resolver -------------------------------------------------------

function levantarExcepcion(c: Ctx, tipo: TipoExcepcion, etapa: EtapaFlujo): void {
  const { n, rng, ts } = c;
  const pl = PLANTILLA_EXCEPCION[tipo];
  // Preparar el estado que la plantilla necesita para describirse con coherencia
  if (tipo === 'Tarifa_sobre_tope') {
    if (n.ofertas.length === 0) n.ofertas = construirOfertas(n, rng);
    const o = n.ofertas[0];
    o.estado = 'sobre_tope';
    o.tarifaSolicitada = Math.round((n.tarifaMaxima * (1 + entre(rng, 6, 18) / 100)) / 10_000) * 10_000;
    // Los demás candidatos no tienen vehículo disponible para esa fecha: por eso la persona autoriza esta tarifa.
    for (const x of n.ofertas.slice(1)) {
      x.estado = 'sin_interes';
      x.tarifaFinal = null;
    }
  }
  if (tipo === 'Seleccion_manual') {
    for (const o of n.ofertas) if (o.tarifaFinal === null && o.estado !== 'sobre_tope') o.tarifaFinal = tarifaDeCierre(o.tarifaOfrecida, o.tarifaSolicitada, n.tarifaMaxima);
  }
  if ((tipo === 'Mercancia_no_lista' || tipo === 'Retraso_transportador') && !n.transportador) return;
  const categoria: CategoriaDecision = pl.categoria ? pl.categoria(n) : pl.categoriaBase;
  const base = pl.construir(n, rng);
  const [min, max] = pl.anticipacion;
  const exc: Excepcion = {
    id: `${n.id}-X${n.excepcionesPrevias.length + 1}`,
    tipo,
    categoria,
    ...base,
    etapaOrigen: etapa,
    detectadaEn: ts,
    anticipacionMin: max === 0 ? 0 : entre(rng, min, max),
    politica: pl.politica,
  };
  n.excepcion = exc;
  n.etapaRetorno = etapa;
  const evento_: NombreEvento = tipo === 'Datos_incompletos' ? 'DatosSolicitados' : tipo === 'Tarifa_sobre_tope' ? 'TarifaEscalada' : 'NovedadRegistrada';
  // Efectos de registro
  if (tipo === 'Sin_respuesta') {
    n.intentosContacto += 1;
    llamar(c, { interlocutor: etapa === 'LlamadaCierre' || etapa === 'AvisoDestino' ? 'cliente' : 'transportador', objetivo: etapa === 'LlamadaCierre' ? 'Cierre y satisfacción' : 'Seguimiento en ruta', agente: pl.agente, etapa, resultado: 'sin_respuesta', resumen: 'No contestó; intento registrado y nuevo contacto programado.', confirmada: false });
  }
  if (tipo === 'Conductor_ocupado') {
    llamar(c, { interlocutor: 'transportador', objetivo: 'Seguimiento en ruta', agente: pl.agente, etapa, resultado: 'reprogramada', resumen: 'El conductor va manejando: llamada finalizada y reprogramada a un momento seguro.', confirmada: false });
  }
  if (tipo === 'Inconformidad_cliente') {
    n.casoSeguimiento = true;
    evento(c, 'CasoSeguimientoCreado', `Inconformidad convertida en caso de seguimiento · ${n.cliente.nombre}`);
  }
  evento(c, evento_, `${exc.titulo}`);
  if (categoria === 'automatico') {
    traza(c, etapa, pl.agente, exc.titulo, exc.evidencia, pl.regla, `Gestionar sin intervención: ${exc.alternativas.find((a) => a.id === exc.recomendada)?.titulo}`, 'Acción registrada en la agenda centralizada', 'Se resuelve en el siguiente ciclo');
  } else {
    traza(c, etapa, pl.agente, exc.titulo, exc.evidencia, pl.regla, categoria === 'humano' ? 'No comprometer valores ni condiciones: presentar al responsable' : 'Registrar la novedad y notificar al coordinador', 'Gestión creada para el coordinador (Mesa)', 'Espera decisión de una persona');
    n.etapa = 'Escalada';
    n.intervencionHumana = true;
  }
}

function cerrarExcepcion(c: Ctx, por: 'agente' | 'coordinador', alt: Alternativa, dh?: DecisionSimulada) {
  const exc = c.n.excepcion!;
  c.n.excepcionesPrevias.push({
    ...exc,
    resueltaEn: c.ts,
    resueltaPor: por,
    decisionHumana: dh?.decision,
    alternativaElegida: alt.id,
    decididoPor: dh?.por,
  });
  c.n.excepcion = null;
}

function resolverAutomatica(c: Ctx): void {
  const { n } = c;
  const exc = n.excepcion!;
  const alt = exc.alternativas.find((a) => a.id === exc.recomendada) ?? exc.alternativas[0];
  const origen = exc.etapaOrigen;
  cerrarExcepcion(c, 'agente', alt);
  n.retrasoHoras += Math.max(0, alt.impactoHoras) * 0.2;
  traza(c, origen, PLANTILLA_EXCEPCION[exc.tipo].agente, `Resolución de «${exc.titulo}»`, [alt.titulo], PLANTILLA_EXCEPCION[exc.tipo].regla, alt.titulo, 'Acción ejecutada por el agente', 'Novedad cerrada sin intervención humana');
  if (exc.tipo === 'Datos_incompletos') {
    n.etapa = 'EsperaDatos';
    n.etapaRetorno = 'Validacion';
  } else {
    n.etapa = origen;
    n.etapaRetorno = null;
  }
}

function aplicarEfecto(c: Ctx, efecto: EfectoAlternativa, origen: EtapaFlujo, motivo: string) {
  const { n } = c;
  if (efecto.tipo === 'cancelar') {
    n.etapa = 'Cancelada';
    n.causaCancelacion = motivo;
    n.fechaCierre = c.ts;
    n.etapaRetorno = origen;
    evento(c, 'OperacionCancelada', `Operación cancelada · ${motivo}`);
    return;
  }
  if (efecto.tipo === 'volver') {
    n.etapa = efecto.etapa;
    n.etapaRetorno = null;
    if (efecto.etapa === 'Busqueda') {
      n.ofertas = [];
      n.transportador = null;
      n.tarifaPactada = null;
    }
    if (efecto.etapa === 'Negociacion' && n.ofertas.length === 0) n.etapa = 'Busqueda';
    if (efecto.etapa === 'Negociacion') {
      n.ofertas = n.ofertas.map((o) => ({ ...o, tarifaFinal: null, estado: o.estado === 'sobre_tope' ? 'aceptada_preliminar' : o.estado }));
    }
    if (efecto.etapa === 'Confirmacion') {
      n.fechaCargue += 4 * 3_600_000;
    }
    return;
  }
  // continuar → la etapa de origen se completa
  avanzar(c, origen);
}

function aplicarDecision(c: Ctx, dh: DecisionSimulada): void {
  const { n } = c;
  const exc = n.excepcion!;
  const pl = PLANTILLA_EXCEPCION[exc.tipo];
  const origen = exc.etapaOrigen;
  let alt: Alternativa;
  let efecto: EfectoAlternativa;
  if (dh.decision === 'RECHAZAR') {
    alt = { id: exc.recomendada, titulo: 'Propuesta del agente no autorizada', descripcion: '', impactoCosto: 0, impactoHoras: 0, impactoSLA: 'medio', reglas: [pl.regla], efecto: pl.rechazo };
    efecto = pl.rechazo;
  } else if (dh.decision === 'CANCELAR') {
    alt = exc.alternativas.find((a) => a.efecto.tipo === 'cancelar') ?? { id: exc.recomendada, titulo: 'Cancelar el servicio', descripcion: '', impactoCosto: 0, impactoHoras: 0, impactoSLA: 'alto', reglas: ['R28'], efecto: { tipo: 'cancelar' } };
    efecto = { tipo: 'cancelar' };
  } else {
    alt = exc.alternativas.find((a) => a.id === (dh.decision === 'ALTERNATIVA' ? dh.alternativa : exc.recomendada)) ?? exc.alternativas[0];
    efecto = alt.efecto;
  }
  // Efectos específicos por tipo antes de aplicar el efecto general
  if (efecto.tipo !== 'cancelar') {
    if (alt.impactoCosto > 0 && dh.decision !== 'RECHAZAR') n.costosAdicionales += alt.impactoCosto;
    if (alt.impactoHoras > 0 && dh.decision !== 'RECHAZAR') n.retrasoHoras += alt.impactoHoras;
  }
  if (exc.tipo === 'Tarifa_sobre_tope' && efecto.tipo === 'continuar') {
    // El extra autorizado pasa a ser parte de la tarifa final, no un costo adicional aparte.
    const of = n.ofertas.find((x) => x.estado === 'sobre_tope');
    if (of) {
      of.tarifaFinal = n.tarifaMaxima + alt.impactoCosto;
      of.estado = 'contraoferta_ok';
      n.costosAdicionales -= alt.impactoCosto;
      // Autorizar la tarifa de ese candidato equivale a adjudicarle el servicio.
      n.transportador = TRANSP(of.transportadorId);
      n.tarifaPactada = of.tarifaFinal;
    }
  }
  if (exc.tipo === 'Seleccion_manual') {
    const barata = mejorOferta(n, 'tarifa');
    let o = alt.id === 'A' ? barata : alt.id === 'B' ? mejorOferta(n, 'cumplimiento') : mejorOferta(n, 'compat');
    if (alt.id === 'C' && o.transportadorId === barata.transportadorId) {
      const t = (x: typeof o) => x.tarifaFinal ?? x.tarifaOfrecida;
      const otra = n.ofertas.filter((x) => x.estado !== 'sin_interes' && x.estado !== 'sobre_tope' && x.transportadorId !== barata.transportadorId).sort((a, b) => t(a) - t(b))[0];
      if (otra) o = otra;
    }
    n.transportador = TRANSP(o.transportadorId);
    n.tarifaPactada = o.tarifaFinal ?? o.tarifaOfrecida;
  }
  if (exc.tipo === 'Inconformidad_cliente') n.casoSeguimiento = true;
  if (exc.tipo === 'Diferencia_entrega') n.casoSeguimiento = true;
  // Tarifa final contra el tope: tras autorizar, la tarifa pactada se fija al asignar
  cerrarExcepcion(c, 'coordinador', alt, dh);
  evento(c, 'DecisionCoordinador', `${dh.por.split(' · ')[0]} · ${dh.decision === 'ALTERNATIVA' ? `alternativa ${alt.id}` : dh.decision.toLowerCase()} · ${exc.titulo}`);
  traza(c, origen, 'Coordinador', `Decisión sobre «${exc.titulo}»`, [`Propuesta del agente: ${exc.recomendada}`, `Impacto costo ${alt.impactoCosto} COP · ${alt.impactoHoras} h`], pl.regla, dh.decision === 'ALTERNATIVA' ? `Alternativa ${alt.id}: ${alt.titulo}` : alt.titulo, dh.por, 'La decisión vuelve al proceso como evento estructurado');
  aplicarEfecto(c, efecto, origen, exc.titulo);
}

// --- Probabilidad de excepción por etapa ------------------------------------------------------

function elegirExcepcion(n: Operacion, etapa: EtapaFlujo, rng: Rng, seleccionAutomatica: boolean): TipoExcepcion | null {
  if (etapa === 'Validacion' && n.datosPendientes.length > 0 && !hubo(n, 'Datos_incompletos')) return 'Datos_incompletos';
  if (etapa === 'Seleccion' && !seleccionAutomatica && !hubo(n, 'Seleccion_manual') && n.ofertas.length > 0) return 'Seleccion_manual';
  const candidatas = TIPOS_EXCEPCION.map((t) => PLANTILLA_EXCEPCION[t]).filter(
    (p) => p.peso > 0 && p.etapas.includes(etapa) && !hubo(n, p.tipo) && !(p.tipo === 'Datos_incompletos') && !(p.tipo === 'Sin_respuesta' && n.intentosContacto >= 3),
  );
  if (candidatas.length === 0) return null;
  const suma = candidatas.reduce((s, p) => s + p.peso, 0);
  if (rng() > Math.min(0.3, 0.035 * suma)) return null;
  let r = rng() * suma;
  for (const p of candidatas) {
    r -= p.peso;
    if (r <= 0) return p.tipo;
  }
  return candidatas[0].tipo;
}

// --- Transición principal --------------------------------------------------------------------------

export function transicionar(op: Operacion, o: OpcionesTransicion): ResultadoTransicion | null {
  if (esTerminal(op.etapa)) return null;
  const rng = o.rng ?? Math.random;
  const c: Ctx = { n: clonar(op), ts: o.ahora, rng, logs: [], seleccionAutomatica: o.seleccionAutomatica };
  const { n } = c;

  if (n.etapa === 'Escalada') {
    if (!o.decisionHumana || !n.excepcion) return null;
    aplicarDecision(c, o.decisionHumana);
    sincronizar(n, o.ahora);
    return { operacion: n, logs: c.logs };
  }

  if (n.etapa === 'EsperaDatos') {
    if (rng() < 0.2 && !o.forzar?.resolver) {
      llamar(c, { interlocutor: 'cliente', objetivo: 'Completar datos', agente: 'Agente de cliente', etapa: 'Validacion', resultado: 'sin_respuesta', resumen: 'Nuevo intento: el contacto no contestó; se reprograma.', confirmada: false });
      n.intentosContacto += 1;
    } else {
      llamar(c, { interlocutor: 'cliente', objetivo: 'Completar datos', agente: 'Agente de cliente', etapa: 'Validacion', resumen: `Completa con ${n.cliente.contacto}: ${n.datosPendientes.join(', ').toLowerCase() || 'datos faltantes'}.` });
      traza(c, 'Validacion', 'Agente de cliente', 'Gestión posterior para completar datos', n.datosPendientes, 'R02', 'Cerrar los datos pendientes', 'Llamada al cliente', 'Solicitud completa');
      n.datosPendientes = [];
      avanzar(c, 'Validacion');
    }
    sincronizar(n, o.ahora);
    return { operacion: n, logs: c.logs };
  }

  const etapa = n.etapa as EtapaFlujo;
  if (!esEtapaFlujo(etapa)) return null;

  // Una excepción automática en curso se resuelve primero
  if (n.excepcion && n.excepcion.categoria === 'automatico') {
    resolverAutomatica(c);
    sincronizar(n, o.ahora);
    return { operacion: n, logs: c.logs };
  }

  // Forzar una excepción (Director / botón de la demo)
  if (o.forzar?.excepcion) {
    const t = o.forzar.excepcion;
    levantarExcepcion(c, t, etapa);
    sincronizar(n, o.ahora);
    return { operacion: n, logs: c.logs };
  }

  // Excepción probable en esta etapa
  const tipo = o.forzar?.resolver ? null : elegirExcepcion(n, etapa, rng, o.seleccionAutomatica);
  if (tipo) {
    levantarExcepcion(c, tipo, etapa);
    sincronizar(n, o.ahora);
    return { operacion: n, logs: c.logs };
  }

  // Camino feliz: la etapa se completa y se avanza
  if (etapa === 'Seleccion' && !o.seleccionAutomatica && n.ofertas.length > 0 && !hubo(n, 'Seleccion_manual')) {
    levantarExcepcion(c, 'Seleccion_manual', etapa);
  } else {
    avanzar(c, etapa);
  }
  sincronizar(n, o.ahora);
  return { operacion: n, logs: c.logs };
}

// --- Operación nueva y semilla -------------------------------------------------------------------------

/** Una operación recién recibida, con su evento y soporte de origen. */
export function nuevaOperacion(ts: number, rng: Rng, seq?: number, canal?: Operacion['canal']): { operacion: Operacion; log: LogEntry } {
  const n = generarOperacion(ts, rng, seq ?? siguienteSeq());
  if (canal) n.canal = canal;
  n.eventos.push({ evento: 'SolicitudRecibida', timestamp: ts, detalle: `Solicitud recibida por ${n.canal}` });
  n.soportes.push({ nombre: `Solicitud inicial ${n.id}`, tipo: 'solicitud', ts });
  if (n.canal === 'llamada_ia') {
    const c: Ctx = { n, ts, rng, logs: [], seleccionAutomatica: true };
    llamar(c, {
      interlocutor: 'cliente',
      objetivo: 'Recibir solicitud',
      agente: 'Agente de cliente',
      etapa: 'Solicitud',
      sentido: 'entrante',
      resumen: `Atiende a ${n.solicitante} de ${n.cliente.nombre}; identifica empresa y solicitante y recopila origen, destino, mercancía, peso, volumen, vehículo, fecha y condiciones.`,
    });
    n.soportes.push({ nombre: `Transcripción llamada de solicitud ${n.id}`, tipo: 'transcripcion', ts });
  }
  const log = nuevoLog(n, 'SolicitudRecibida', `${n.id} · Solicitud recibida · ${n.cliente.nombre} · ${n.nodoOrigen.ciudad} → ${n.nodoDestino.ciudad}`, ts);
  return { operacion: n, log };
}

export function simularDecisionHumana(exc: Excepcion, rng: Rng = Math.random): DecisionSimulada {
  const por = elegir(rng, COORDINADORES);
  const r = rng();
  const puedeCancelar = exc.alternativas.some((a) => a.efecto.tipo === 'cancelar');
  if (r < 0.7) return { decision: 'AUTORIZAR', por };
  if (r < 0.9 && exc.alternativas.length > 1) {
    const otras = exc.alternativas.filter((a) => a.id !== exc.recomendada && a.efecto.tipo !== 'cancelar');
    if (otras.length > 0) return { decision: 'ALTERNATIVA', alternativa: elegir(rng, otras).id, por };
  }
  if (r < 0.96) return { decision: 'RECHAZAR', por };
  return puedeCancelar ? { decision: 'CANCELAR', por } : { decision: 'AUTORIZAR', por };
}

/** Reparte n operaciones por todo el flujo con estados coherentes. */
export function seedOperaciones(n: number, ahora: number, seleccionAutomatica: boolean, semilla = 38): Operacion[] {
  const rng = crearRng(semilla);
  reiniciarContador(0);
  const salida: Operacion[] = [];
  for (let i = 0; i < n; i++) {
    const edadMin = Math.round((1 - i / n) * entre(rng, 600, 2400)) + entre(rng, 0, 90);
    const creada = ahora - edadMin * 60_000;
    let op = nuevaOperacion(creada, rng).operacion;
    const pasos = Math.min(entre(rng, 0, 62), Math.floor(edadMin / MINUTOS_POR_TICK) + 2);
    for (let k = 0; k < pasos; k++) {
      const ts = Math.min(ahora, creada + (k + 1) * MINUTOS_POR_TICK * 60_000);
      const dec = op.etapa === 'Escalada' && op.excepcion && rng() < 0.85 ? simularDecisionHumana(op.excepcion, rng) : undefined;
      if (op.etapa === 'Escalada' && !dec) break;
      const r = transicionar(op, { ahora: ts, rng, seleccionAutomatica, decisionHumana: dec });
      if (!r) break;
      op = r.operacion;
    }
    sincronizar(op, op.fechaActualizacion);
    salida.push(op);
  }
  return salida;
}

