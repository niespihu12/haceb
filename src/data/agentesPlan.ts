// ============================================================================
// generarPlan: deriva los pasos de los agentes de la TRAYECTORIA real de la
// operación (motor.transicionar). Cada transición del motor produce un bloque
// de pasos: etapa completada, novedad levantada, resolución automática, espera
// de la persona (Mesa), tarea posterior a la decisión o cancelación. Los
// reingresos («volver a Búsqueda») y las cancelaciones salen solos.
// ============================================================================

import type { EtapaFlujo, Excepcion, Operacion, TipoExcepcion } from '@/types';
import type { AgenteId, DatosCaso, Escenario, EtapaPlan, PasoPlan, SistemaId, Vista } from '@/types/agentes';
import type { Canal } from '@/types';
import type { CtxGuion } from './guiones/tipos';
import { GUIONES } from './guiones';
import { AGENTES_MAP, ETAPA_AGENTE, humanoPara } from './agentesCatalogo';
import { CANAL_INFO, ETAPA_LABEL_CORTO, PLANTILLA_EXCEPCION, esEtapaFlujo, siguienteEtapa } from './mockData';
import { formatCOP, miles, pesos, rngDesde, horaMin } from './agentesUtil';
import { rutaDe } from './agentesDatos';

/** Paso (índice dentro de la etapa) en que se detecta cada novedad. */
const DET: Record<EtapaFlujo, Partial<Record<TipoExcepcion, number>>> = {
  Solicitud: {},
  Validacion: { Datos_incompletos: 0 },
  Planeacion: {},
  Busqueda: { Sin_transportador: 3 },
  Negociacion: { Tarifa_sobre_tope: 2, Sin_transportador: 2 },
  Seleccion: { Seleccion_manual: 1 },
  Asignacion: {},
  Confirmacion: { Sin_respuesta: 1 },
  Preventiva: { Retraso_transportador: 0, Sin_respuesta: 0, Mercancia_no_lista: 1 },
  Presentacion: { Diferencia_llegada: 1, Espera_en_cargue: 2, Retraso_transportador: 0 },
  Cargue: { Espera_en_cargue: 0, Diferencia_despacho: 1 },
  Transito: { Conductor_ocupado: 0, Novedad_en_ruta: 1, Sin_respuesta: 1 },
  AvisoDestino: { Destinatario_no_recibe: 0, Sin_respuesta: 0 },
  Descargue: { Demora_en_descargue: 0 },
  ValidacionEntrega: { Diferencia_entrega: 1 },
  LlamadaCierre: { Inconformidad_cliente: 0, Sin_respuesta: 0 },
  CierreAdmin: { Sobrecosto_liquidacion: 1 },
};

interface DefEtapa {
  pasos: PasoPlan[];
}

type ExtraPaso = Omit<PasoPlan, 'id' | 'texto' | 'duracion'> & { variante?: string };

function variar(rand: () => number, ms: number): number {
  return Math.round(ms * (0.8 + rand() * 0.4));
}

function crearPaso(ctxBase: Omit<CtxGuion, 'id' | 'duracion' | 'ok' | 'humano' | 'sistema'>) {
  return (id: string, texto: string, duracion: number, extra: ExtraPaso = {}): PasoPlan => {
    const { variante, ...resto } = extra;
    const base = id.replace(/_\d+$/, '');
    const guion = (variante ? GUIONES[`${variante}:${base}`] : undefined) ?? GUIONES[base];
    const p: PasoPlan = { id, texto, duracion, ...resto };
    if (guion) {
      const g = guion({ ...ctxBase, id, duracion, ok: resto.ok !== false, humano: resto.humano, sistema: resto.sistema });
      p.vista = g.vista ?? p.vista;
      p.ui = g.ui ?? p.ui;
      p.pensamiento = g.pensamiento ?? p.pensamiento;
    }
    return p;
  };
}

const nombreEtapa = (e: string) => ETAPA_LABEL_CORTO[e as EtapaFlujo] ?? e;

export function generarPlan(seq: number, canal: Canal, escenario: Escenario, d: DatosCaso): EtapaPlan[] {
  const rand = rngDesde(seq * 104729 + 3);
  const v = (ms: number) => variar(rand, ms);
  const paso = crearPaso({ d, canal, escenario, seq });
  const tr = d.trayectoria;
  const fin = tr[tr.length - 1];
  const info = CANAL_INFO[canal];
  const op0 = tr[0];
  const transp = [...tr].reverse().find((o) => o.transportador)?.transportador;
  const D = d.dialogos;

  const defEtapa = (S: EtapaFlujo, o: Operacion, nxt: Operacion, raised: Excepcion | null): DefEtapa => {
    const det = DET[S];
    const f = (k: number) => !!raised && det[raised.tipo] === k;
    const S_ = (id: string, texto: string, ms: number, k: number, sistema: SistemaId, vista: Vista, extra: ExtraPaso = {}): PasoPlan =>
      paso(id, texto, v(ms), { sistema, vista, ...extra, ok: f(k) ? false : extra.ok, resultado: f(k) ? raised!.titulo : extra.resultado });
    const contacto = o.cliente.contacto;
    const ruta = rutaDe(o);
    const rondas = d.negociacion;
    const manual = !!nxt.transportador && false; // (la selección manual la marca la novedad Seleccion_manual)
    void manual;
    switch (S) {
      case 'Solicitud': {
        const esLl = canal === 'llamada_ia';
        const sol = d.solicitud;
        return {
          pasos: [
            S_('a1', `Nueva solicitud detectada por ${info.label.charAt(0).toLowerCase()}${info.label.slice(1)}`, 700, -1, 'canal', 'canal.bandeja', { estado: 'Solicitud', snapshot: 0, resultado: `${info.corto} · ${sol.referenciaCliente} · ${op0.cliente.nombre}`, bitacora: `${info.label} · ${sol.asunto}` }),
            ...(esLl
              ? [
                S_('a2', 'Atendiendo al cliente: identificando empresa y solicitante', 1300, -1, 'voz', 'voz.consola', { resultado: `${op0.solicitante} · ${op0.cliente.nombre}` }),
                S_('a3', 'Recopilando origen, destino, mercancía, peso, volumen, vehículo, fecha y condiciones', 1800, -1, 'voz', 'voz.consola', { regla: 'R02', resultado: op0.datosPendientes.length ? `${9 - op0.datosPendientes.length} de 9 datos · pendiente: ${op0.datosPendientes.join(', ').toLowerCase()}` : '9 de 9 datos mínimos' }),
              ]
              : [S_('a2', canal === 'integracion' ? 'Leyendo la solicitud que llegó del sistema del cliente' : canal === 'formulario' ? 'Leyendo el formulario diligenciado por el cliente' : 'Leyendo el registro hecho por el coordinador', 900, -1, 'canal', 'canal.bandeja', { resultado: sol.resumen })]),
            S_('a4', 'Guardando la solicitud inicial en el expediente', 800, -1, 'plataforma', 'plataforma.operacion', { resultado: esLl ? 'Solicitud inicial y transcripción de la llamada' : 'Solicitud inicial' }),
          ],
        };
      }
      case 'Validacion':
        return {
          pasos: [
            S_('v1', 'Revisando los 9 datos mínimos de la solicitud', 2200, 0, 'revision', 'revision.datos', { regla: 'R01', resultado: '9 de 9 datos presentes' }),
            S_('v2', 'Comprobando coherencia entre peso, volumen y vehículo requerido', 1000, -1, 'revision', 'revision.datos', { regla: 'R01', resultado: `${miles(o.mercancia.pesoKg)} kg dentro de la capacidad de ${o.vehiculoRequerido}` }),
            S_('v3', 'Solicitud suficiente para iniciar la operación', 500, -1, 'plataforma', 'plataforma.operacion', { resultado: 'SolicitudValidada' }),
          ],
        };
      case 'Planeacion':
        return {
          pasos: [
            S_('p1', `Registrando la operación con identificador único ${o.id}`, 900, -1, 'plataforma', 'plataforma.operacion', { regla: 'R03', resultado: `${o.id} · ${ruta} · OperacionRegistrada` }),
            S_('p2', 'Identificando restricciones operativas, fechas comprometidas y recursos requeridos', 1100, -1, 'plataforma', 'plataforma.operacion', { resultado: `${o.vehiculoRequerido} · cargue ${horaMin(o.fechaCargue)} · ${o.requisitoEspecial ?? 'sin requisitos especiales'}` }),
            S_('p3', `Llamando al contacto autorizado (${contacto}): disponibilidad de cargue, acceso y horarios`, 1800, -1, 'voz', 'voz.consola', { regla: 'R04', resultado: D.planeacion?.resumen }),
            S_('p4', 'Registrando el compromiso «mercancía disponible» en la agenda', 600, -1, 'agenda', 'agenda.central', { regla: 'R26', resultado: `Compromiso del cliente · vence ${horaMin(o.fechaCargue)}` }),
          ],
        };
      case 'Busqueda': {
        const n = nxt.ofertas.length || d.negociacion.length;
        return {
          pasos: [
            S_('b1', 'Abriendo la base de proveedores', 700, -1, 'proveedores', 'proveedores.base', { resultado: `${o.vehiculoRequerido} · ruta ${ruta}` }),
            S_('b2', 'Filtrando por ubicación y tipo de vehículo requerido', 1100, -1, 'proveedores', 'proveedores.base', { resultado: `${n + 4} transportadores con ${o.vehiculoRequerido}` }),
            S_('b3', 'Puntuando capacidad, rutas habituales, historial de cumplimiento y condiciones comerciales', 1500, -1, 'proveedores', 'proveedores.base', { regla: 'R05', resultado: 'Compatibilidad y cumplimiento calculados' }),
            S_('b4', raised ? 'Sin candidatos que acepten dentro de lo previsto' : `${n} candidatos preseleccionados`, 600, 3, 'proveedores', 'proveedores.base', { resultado: `${n} candidatos · TransportadoresPreseleccionados` }),
          ],
        };
      }
      case 'Negociacion': {
        const r0 = rondas[0];
        const adjudicada = d.excepcion?.tipo === 'Tarifa_sobre_tope' && d.decision?.aplicada?.efecto.tipo === 'continuar';
        return {
          pasos: [
            S_('n1', `Llamando a ${r0?.transportador ?? 'el candidato 1'}: presento el viaje y consulto disponibilidad`, 1800, -1, 'voz', 'voz.consola', { resultado: D.negociar_0?.resumen }),
            S_('n2', 'Informando la tarifa ofrecida y recibiendo la contrapropuesta', 1500, -1, 'proveedores', 'proveedores.negociacion', { regla: 'R06', resultado: r0 ? `Ofrecida ${pesos(r0.tarifaOfrecida)} · tope ${pesos(o.tarifaMaxima)}` : undefined }),
            S_('n3', 'Comparando la contrapropuesta contra el tope autorizado', 800, 2, 'proveedores', 'proveedores.negociacion', { regla: 'R07', resultado: `Dentro del tope ${pesos(o.tarifaMaxima)}` }),
            S_('n4', 'Registrando la aceptación preliminar', 700, -1, 'proveedores', 'proveedores.negociacion', { resultado: `AceptacionPreliminar · ${pesos(nxt.ofertas.find((x) => x.tarifaFinal !== null)?.tarifaFinal ?? o.tarifaMaxima)}` }),
            adjudicada
              ? S_('n5', `Informando a ${rondas[0]?.transportador ?? 'el transportador'} la tarifa autorizada`, 1300, -1, 'voz', 'voz.consola', { resultado: `Tarifa autorizada ${pesos(nxt.tarifaPactada ?? 0)}` })
              : S_('n5', `Llamando a los demás candidatos (${Math.max(0, rondas.length - 1)})`, 1600, -1, 'voz', 'voz.consola', { resultado: `${rondas.length} ofertas dentro del tope o escaladas` }),
            S_('n6', 'Compartiendo el resultado con el Agente de Seguimiento', 500, -1, 'plataforma', 'plataforma.operacion', { regla: 'R27', resultado: 'Resultado de la negociación disponible para todos los agentes' }),
          ],
        };
      }
      case 'Seleccion': {
        const t = nxt.transportador ?? transp;
        return {
          pasos: [
            S_('s1', 'Consolidando ofertas, condiciones y resultados de negociación', 1200, -1, 'plataforma', 'plataforma.seleccion', { resultado: `${nxt.ofertas.length || rondas.length} ofertas consolidadas` }),
            S_('s2', raised ? 'La selección queda en manos del coordinador' : '¿Selección automática? Verificando requisitos operativos, documentales y comerciales', 900, 1, 'plataforma', 'plataforma.seleccion', { regla: 'R09', resultado: 'Cumple los tres requisitos' }),
            S_('s3', `Transportador seleccionado: ${t?.nombre ?? '—'}`, 700, -1, 'plataforma', 'plataforma.seleccion', { resultado: `${t?.nombre ?? '—'} · ${pesos(nxt.tarifaPactada ?? o.tarifaPactada ?? o.tarifaMaxima)} · TransportadorSeleccionado` }),
          ],
        };
      }
      case 'Asignacion':
        return {
          pasos: [
            S_('s4', 'Revisando documentos del vehículo y del conductor', 2200, -1, 'revision', 'revision.documentos', { regla: 'R10', resultado: `${d.documentos.length} de ${d.documentos.length} documentos vigentes · DocumentosValidados` }),
            S_('s5', 'Formalizando la asignación', 700, -1, 'plataforma', 'plataforma.operacion', { resultado: `${transp?.nombre ?? '—'} · ${transp?.placa ?? ''} · AsignacionConfirmada` }),
          ],
        };
      case 'Confirmacion':
        return {
          pasos: [
            S_('c1', 'Llamando al cliente: vehículo asignado, fecha y hora, lugar de cargue y receptor', 1800, -1, 'voz', 'voz.consola', { regla: 'R11', resultado: D.informar?.resumen }),
            S_('c2', 'Llamando al transportador: información completa y preparado para ejecutarla', 1500, 1, 'voz', 'voz.consola', { regla: 'R11', resultado: D.confirmar?.resumen }),
            S_('c3', 'Doble confirmación: cliente y transportador con la misma información', 600, -1, 'plataforma', 'plataforma.operacion', { resultado: 'ConfirmacionDoble' }),
            S_('c4', 'Programando las llamadas preventivas en la agenda centralizada', 800, -1, 'agenda', 'agenda.central', { regla: 'R26', resultado: 'Llamadas preventivas agendadas a ambas partes' }),
          ],
        };
      case 'Preventiva':
        return {
          pasos: [
            S_('c5', 'Llamada preventiva al transportador: disponibilidad, ubicación y hora estimada de llegada', 1500, 0, 'voz', 'voz.consola', { regla: 'R12', resultado: D.prev_transportador?.resumen }),
            S_('c6', 'Llamada preventiva al cliente: mercancía lista y punto de cargue disponible', 1500, 1, 'voz', 'voz.consola', { regla: 'R12', resultado: D.prev_cliente?.resumen }),
            S_('c7', 'Sin cambios en la programación', 500, -1, 'plataforma', 'plataforma.operacion', { resultado: 'LlamadaPreventiva' }),
          ],
        };
      case 'Presentacion':
        return {
          pasos: [
            S_('o1', 'El transportador reporta su llegada al punto de origen', 800, 0, 'voz', 'voz.consola', { resultado: D.presentacion_transportador?.resumen }),
            S_('o2', 'Validación cruzada con el cliente: ¿el vehículo está en las instalaciones?', 2000, 1, 'revision', 'revision.cruzada', { regla: 'R15', resultado: d.cruceLlegada.detalle }),
            S_('o3', 'Verificando espera por mercancía, congestión o documentos', 900, 2, 'revision', 'revision.cargue', { regla: 'R16', resultado: 'Sin espera que supere el parámetro' }),
            S_('o4', 'Llegada confirmada por ambas partes', 500, -1, 'plataforma', 'plataforma.operacion', { resultado: 'LlegadaOrigenConfirmada' }),
          ],
        };
      case 'Cargue':
        return {
          pasos: [
            S_('k1', 'Siguiendo el avance del cargue', 1600, 0, 'revision', 'revision.cargue', { regla: 'R16', resultado: d.cargue[0]?.valor }),
            S_('k2', 'Confirmando hora real de salida y condiciones del despacho', 1100, 1, 'revision', 'revision.cargue', { regla: 'R17', resultado: `${d.cargue[1]?.valor} · salida ${d.cargue[5]?.valor}` }),
            S_('k3', 'Confirmando con el cliente que la mercancía fue despachada', 900, -1, 'voz', 'voz.consola', { resultado: D.despacho?.resumen }),
            S_('k4', 'Despacho confirmado: la operación sigue hacia el destino', 500, -1, 'plataforma', 'plataforma.operacion', { resultado: 'CargueFinalizado · DespachoConfirmado' }),
          ],
        };
      case 'Transito': {
        const consulta = escenario === 'consulta_entrante' || nxt.llamadas.slice(o.llamadas.length).some((l) => l.sentido === 'entrante' && l.objetivo === 'Consulta de estado');
        const nov = raised?.tipo === 'Novedad_en_ruta' || !!tr.find((x) => x.excepcion?.tipo === 'Novedad_en_ruta' && x.seq === o.seq && x.fechaActualizacion >= o.fechaActualizacion);
        return {
          pasos: [
            S_('t0', 'Verificando que el conductor esté en condiciones seguras para atender la llamada', 700, 0, 'tablero', 'tablero.seguimiento', { regla: 'R18', resultado: 'Condiciones seguras: puede atender' }),
            S_('t1', 'Llamada programada al transportador: estado, ubicación, novedades y hora estimada', 1800, 1, 'voz', 'voz.consola', { regla: 'R19', resultado: D.seguimiento_1?.resumen }),
            ...(nov ? [S_('t4', 'Informando al cliente la novedad: lo confirmado y lo estimado', 1600, -1, 'voz', 'voz.consola', { regla: 'R19', resultado: D.informar_novedad?.resumen })] : []),
            S_('t2', 'Registrando el seguimiento y actualizando la hora de llegada como estimada', 900, -1, 'tablero', 'tablero.seguimiento', { resultado: 'SeguimientoRegistrado' }),
            ...(consulta ? [S_('t3', 'El cliente consulta el estado: valido su autorización e informo lo confirmado', 1500, -1, 'voz', 'voz.consola', { regla: 'R20', resultado: D.consulta?.resumen })] : []),
          ],
        };
      }
      case 'AvisoDestino':
        return {
          pasos: [
            S_('g0', 'Llamando al contacto de recepción: instalaciones preparadas, horarios de descargue e ingreso', 1600, 0, 'voz', 'voz.consola', { regla: 'R22', resultado: D.aviso?.resumen }),
            S_('g1', 'Registrando el aviso de llegada en la agenda', 600, -1, 'agenda', 'agenda.central', { resultado: 'Destino listo para recibir' }),
          ],
        };
      case 'Descargue':
        return {
          pasos: [
            S_('g2', 'Registrando la llegada al destino y confirmándola con recepción', 1000, 0, 'revision', 'revision.entrega', { regla: 'R16', resultado: `Llegada a ${o.nodoDestino.lugar}` }),
            S_('g3', 'Siguiendo el descargue; consultando si hay diferencias o daños', 1500, -1, 'voz', 'voz.consola', { resultado: D.recepcion?.resumen }),
            S_('g4', 'Mercancía recibida por el destinatario', 500, -1, 'plataforma', 'plataforma.operacion', { resultado: 'LlegadaDestinoConfirmada' }),
          ],
        };
      case 'ValidacionEntrega':
        return {
          pasos: [
            S_('y0', 'Llamando al cliente para validar el resultado de la entrega', 1500, -1, 'voz', 'voz.consola', { resultado: D.entrega?.resumen }),
            S_('y1', 'Cruce de entrega: lo informado por el transportador frente a lo confirmado por el cliente', 2000, 1, 'revision', 'revision.entrega', { regla: 'R23', resultado: d.cruceEntrega.detalle }),
            S_('y2', 'Solicitando los soportes de entrega', 800, -1, 'revision', 'revision.entrega', { resultado: 'EntregaConfirmada · soporte cargado' }),
          ],
        };
      case 'LlamadaCierre':
        return {
          pasos: [
            S_('z0', 'Llamada de cierre: servicio completado, observaciones, calidad y horarios', 1800, 0, 'voz', 'voz.consola', { regla: 'R24', resultado: D.cierre?.resumen }),
            S_('z1', 'Registrando la calificación y las observaciones del cliente', 800, -1, 'plataforma', 'plataforma.operacion', { resultado: `LlamadaCierre · satisfacción ${fin.satisfaccion ?? '—'}/5` }),
          ],
        };
      case 'CierreAdmin':
        return {
          pasos: [
            S_('z2', 'Revisando la documentación final del servicio', 1000, -1, 'revision', 'revision.cierre', { regla: 'R25', resultado: d.cierreAdmin[0]?.valor }),
            S_('z3', 'Revisando condiciones económicas negociadas y costos adicionales autorizados', 1100, 1, 'revision', 'revision.cierre', { regla: 'R25', resultado: `${d.cierreAdmin[1]?.valor} · ${d.cierreAdmin[2]?.valor}` }),
            S_('z4', 'Revisando las novedades que afectan la liquidación', 900, -1, 'revision', 'revision.cierre', { regla: 'R25', resultado: d.cierreAdmin[3]?.valor }),
            S_('z5', 'Cierre administrativo de la operación', 600, -1, 'plataforma', 'plataforma.operacion', { resultado: `OperacionCerrada · ${formatCOP(fin.tarifaPactada ?? 0)} + ${formatCOP(fin.costosAdicionales)} adicionales` }),
          ],
        };
    }
  };

  /* ─── Ensamblado por transiciones ─── */
  const bloques: { agente: AgenteId; pasos: PasoPlan[] }[] = [];
  const push = (agente: AgenteId, pasos: PasoPlan[]) => {
    if (pasos.length === 0) return;
    const ult = bloques[bloques.length - 1];
    if (ult && ult.agente === agente) ult.pasos.push(...pasos);
    else bloques.push({ agente, pasos: [...pasos] });
  };
  const pendiente: Partial<Record<EtapaFlujo, TipoExcepcion>> = {};

  for (let i = 0; i < tr.length - 1; i++) {
    const cur = tr[i];
    const nxt = tr[i + 1];
    const S: EtapaFlujo | null = esEtapaFlujo(cur.etapa) ? cur.etapa : cur.etapaRetorno;
    if (!S) continue;
    const ag = ETAPA_AGENTE[S];

    /* Espera de datos del cliente → completa y valida */
    if (cur.etapa === 'EsperaDatos') {
      push('validador', [
        paso('v4', 'Llamando al cliente para completar los datos pendientes', v(1600), { sistema: 'voz', vista: 'voz.consola', regla: 'R02', estado: 'EsperaDatos', snapshot: i, resultado: d.dialogos.completar?.resumen }),
        paso('v5', 'Datos completos: la solicitud es suficiente para iniciar', v(500), { sistema: 'plataforma', vista: 'plataforma.operacion', resultado: 'SolicitudValidada' }),
      ]);
      continue;
    }

    /* En manos del coordinador: la persona decide */
    if (cur.etapa === 'Escalada' && cur.excepcion) {
      const exc = cur.excepcion;
      const h = humanoPara(exc.tipo);
      const prev = nxt.excepcionesPrevias.find((e) => e.id === exc.id);
      const dec = prev?.decisionHumana ?? 'AUTORIZAR';
      const alt = exc.alternativas.find((a) => a.id === (prev?.alternativaElegida ?? exc.recomendada)) ?? exc.alternativas[0];
      const continua = nxt.etapa !== 'Cancelada' && (nxt.etapa === 'Cerrada' || nxt.etapa === siguienteEtapa(S));
      const destino = nxt.etapa === 'Cancelada' ? ' · servicio cancelado' : continua ? '' : ` · la operación vuelve a ${nombreEtapa(nxt.etapa)}`;
      const resultado =
        dec === 'RECHAZAR' ? `${h.nombre} no autoriza la propuesta del agente${destino}` :
        dec === 'CANCELAR' ? `${h.nombre} cancela el servicio (R28)${destino}` :
        dec === 'ALTERNATIVA' ? `${h.nombre} elige la alternativa ${alt.id}: ${alt.titulo}${destino}` :
        `${h.nombre} autoriza la propuesta del agente (${alt.id}): ${alt.titulo}${destino}`;
      push(ag, [
        paso('x3', `Esperando la decisión de ${h.nombre} (${h.rol}) en la Mesa del coordinador`, v(15000), {
          tipo: 'espera_humana', sistema: 'mesa', vista: 'mesa.paquete', humano: h, estado: 'Escalada', snapshot: i, regla: PLANTILLA_EXCEPCION[exc.tipo].regla, resultado, variante: exc.tipo,
          bitacora: `Decisión · ${resultado}`,
        }),
      ]);
      if (nxt.etapa === 'Cancelada') {
        push(ag, [paso('x5', 'Cancelando el servicio: se informa al cliente y se cierra la solicitud', v(900), { sistema: 'plataforma', vista: 'plataforma.operacion', ok: false, termina: 'cancelada', estado: 'Cancelada', snapshot: i + 1, regla: 'R28', resultado: `OperacionCancelada · ${exc.titulo}`, variante: exc.tipo })]);
      } else if (continua) {
        const def = defEtapa(S, cur, nxt, null);
        const idx = DET[S][exc.tipo] ?? 0;
        const resto = def.pasos.slice(idx + 1);
        push(ag, resto.length ? resto : [paso('x6', 'Retomando la etapa con la decisión registrada', v(600), { sistema: 'plataforma', vista: 'plataforma.operacion', resultado: 'Decisión registrada en el expediente' })]);
        const ultimo = bloques[bloques.length - 1].pasos;
        if (nxt.etapa === 'Cerrada') {
          ultimo[ultimo.length - 1] = { ...ultimo[ultimo.length - 1], estado: 'Cerrada', snapshot: i + 1 };
        }
      }
      continue;
    }

    /* Novedad automática en curso → el agente la resuelve */
    if (cur.excepcion && cur.excepcion.categoria === 'automatico' && nxt.excepcion === null) {
      const exc = cur.excepcion;
      const alt = exc.alternativas.find((a) => a.id === exc.recomendada) ?? exc.alternativas[0];
      push(ag, [
        paso('x4', `Resolviendo la novedad: ${alt.titulo}`, v(900), {
          sistema: exc.tipo === 'Datos_incompletos' ? 'agenda' : 'agenda', vista: 'agenda.central', estado: nxt.etapa, snapshot: i + 1, regla: PLANTILLA_EXCEPCION[exc.tipo].regla, resultado: `${alt.titulo} · sin intervención humana`, variante: exc.tipo,
        }),
      ]);
      if (exc.tipo !== 'Datos_incompletos') pendiente[S] = exc.tipo;
      continue;
    }

    /* Se levanta una novedad en la etapa */
    if (!cur.excepcion && nxt.excepcion) {
      const exc = nxt.excepcion;
      const pl = PLANTILLA_EXCEPCION[exc.tipo];
      const def = defEtapa(S, cur, nxt, exc);
      const idx = Math.min(DET[S][exc.tipo] ?? 0, def.pasos.length - 1);
      const trabajo = def.pasos.slice(0, idx + 1);
      trabajo[0] = { ...trabajo[0], estado: trabajo[0].estado ?? cur.etapa, snapshot: trabajo[0].snapshot ?? i };
      const auto = exc.categoria === 'automatico';
      push(ag, trabajo);
      push(ag, [
        paso('x1', `Registrando la novedad: ${exc.titulo}`, v(700), { sistema: 'plataforma', vista: 'plataforma.operacion', ok: false, regla: `${pl.regla} · ${pl.politica}`, resultado: exc.causa, bitacora: `${exc.titulo} · ${pl.regla}`, variante: exc.tipo, ...(auto ? { estado: cur.etapa, snapshot: i + 1 } : {}) }),
        auto
          ? paso('x2', 'Aplicando la gestión automática de la agenda', v(800), { sistema: 'agenda', vista: 'agenda.central', regla: pl.regla, resultado: exc.alternativas.find((a) => a.id === exc.recomendada)?.titulo, variante: exc.tipo })
          : paso('x2', `Armando el paquete de decisión con ${exc.alternativas.length} alternativas`, v(1200), { sistema: 'plataforma', vista: 'plataforma.operacion', regla: pl.regla, resultado: `Recomendación ${exc.recomendada}: ${exc.alternativas.find((a) => a.id === exc.recomendada)?.titulo}`, variante: exc.tipo }),
      ]);
      continue;
    }

    /* Etapa completada (con o sin novedad previa ya resuelta) */
    const def = defEtapa(S, cur, nxt, null);
    let pasos = def.pasos;
    const tipoPend = pendiente[S];
    if (tipoPend) {
      const idx = DET[S][tipoPend] ?? -1;
      pasos = def.pasos.slice(idx + 1);
      if (tipoPend === 'Sin_respuesta' || tipoPend === 'Conductor_ocupado') {
        pasos = [paso('r1', tipoPend === 'Sin_respuesta' ? 'Reintentando el contacto en la hora reprogramada' : 'Retomando la llamada en un momento seguro', v(1500), { sistema: 'voz', vista: 'voz.consola', regla: tipoPend === 'Sin_respuesta' ? 'R29' : 'R18', resultado: 'Contacto exitoso en el reintento' }), ...pasos];
      }
      delete pendiente[S];
    }
    if (pasos.length === 0) pasos = [paso('r2', 'Retomando la etapa tras resolver la novedad', v(600), { sistema: 'plataforma', vista: 'plataforma.operacion', resultado: 'Etapa completada' })];
    const primero = pasos[0];
    pasos[0] = { ...primero, estado: primero.estado ?? cur.etapa, snapshot: primero.snapshot ?? i };
    if (nxt.etapa === 'Cerrada') pasos[pasos.length - 1] = { ...pasos[pasos.length - 1], estado: 'Cerrada', snapshot: i + 1 };
    push(ag, pasos);
  }

  /* Torre: expediente e historial */
  push('torre', [
    paso('e1', 'Reuniendo solicitud, llamadas, transcripciones y grabaciones autorizadas', v(1200), { sistema: 'expediente', vista: 'expediente.expediente', regla: 'R30', resultado: `${fin.llamadas.length} llamadas · ${fin.soportes.length} soportes` }),
    paso('e2', 'Ordenando el historial cronológico', v(900), { sistema: 'expediente', vista: 'expediente.expediente', resultado: `${fin.eventos.length} eventos` }),
    paso('e3', 'Verificando la traza: qué ocurrió, qué información, qué regla, qué decisión, qué ejecución', v(1100), { sistema: 'expediente', vista: 'expediente.expediente', regla: 'R26', resultado: `${fin.trazas.length} decisiones trazadas` }),
    paso('e4', 'Expediente cerrado', v(500), { sistema: 'expediente', vista: 'expediente.expediente', resultado: d.expediente.numero }),
  ]);

  /* Entregas entre agentes + ids únicos */
  let h = 0;
  const etapas: EtapaPlan[] = bloques.map((b, idx) => {
    const pasos = [...b.pasos];
    const sig = bloques[idx + 1];
    if (sig) {
      h += 1;
      pasos.push(paso(`h${h}`, `Entregando a ${AGENTES_MAP[sig.agente].nombre}`, 400, { sistema: AGENTES_MAP[b.agente].sistema, vista: undefined }));
    }
    return { agente: b.agente, pasos };
  });
  const vistos: Record<string, number> = {};
  for (const e of etapas) {
    for (const p of e.pasos) {
      const n = (vistos[p.id] ?? 0) + 1;
      vistos[p.id] = n;
      if (n > 1) p.id = `${p.id}_${n}`;
    }
  }
  void miles;
  return etapas;
}
