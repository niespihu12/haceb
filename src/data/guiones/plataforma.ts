import type { EstadoOferta, EtapaFlujo, Excepcion, NombreEvento, TipoExcepcion, Transportador } from '@/types';
import type { AccionUI, DatosCaso, Vista } from '@/types/agentes';
import { PLANTILLA_EXCEPCION, TIPOS_EXCEPCION } from '@/data/mockData';
import { humanoPara } from '@/data/agentesCatalogo';
import { horaMin, pesos } from '@/data/agentesUtil';
import type { CtxGuion, Guion, Guiones } from './tipos';

/* ─── Anclas de la ventana «plataforma» ─── */
export const ANCLA_PLAT = {
  operacion: 'plataforma.campo.operacion',
  estado: 'plataforma.campo.estado',
  cliente: 'plataforma.campo.cliente',
  solicitud: 'plataforma.campo.solicitud',
  ruta: 'plataforma.campo.ruta',
  mercancia: 'plataforma.campo.mercancia',
  vehiculo: 'plataforma.campo.vehiculo',
  cargue: 'plataforma.campo.cargue',
  requisitos: 'plataforma.campo.requisitos',
  transportador: 'plataforma.campo.transportador',
  receptor: 'plataforma.campo.receptor',
  negociacion: 'plataforma.campo.negociacion',
  confirmacion: 'plataforma.campo.confirmacion',
  satisfaccion: 'plataforma.campo.satisfaccion',
  tarifa: 'plataforma.campo.tarifa',
  etapas: 'plataforma.lista.etapas',
  compromisos: 'plataforma.lista.compromisos',
  eventos: 'plataforma.lista.eventos',
  novedad: 'plataforma.bloque.novedad',
  btnNovedad: 'plataforma.btn.novedad',
  btnCancelar: 'plataforma.btn.cancelar',
  btnPaquete: 'plataforma.btn.paquete',
  // Vista de selección
  modo: 'plataforma.campo.modo',
  tope: 'plataforma.campo.tope',
  reqOperativo: 'plataforma.item.operativo',
  reqDocumental: 'plataforma.item.documental',
  reqComercial: 'plataforma.item.comercial',
  btnConsolidar: 'plataforma.btn.consolidar',
  btnVerificar: 'plataforma.btn.verificar',
  btnSeleccionar: 'plataforma.btn.seleccionar',
} as const;

export const anclaOferta = (id: string): string => `plataforma.fila.${id.toLowerCase()}`;
export const anclaAlt = (id: string): string => `plataforma.alt.${id.toLowerCase()}`;

/** Botón principal de la barra de herramientas de la ficha para cada paso. */
export const BOTON_PASO: Record<string, { slug: string; etiqueta: string }> = {
  a4: { slug: 'guardar', etiqueta: 'Guardar solicitud' },
  v3: { slug: 'validar', etiqueta: 'Marcar validada' },
  v5: { slug: 'validar', etiqueta: 'Marcar validada' },
  p1: { slug: 'registrar', etiqueta: 'Registrar operación' },
  p2: { slug: 'restricciones', etiqueta: 'Guardar restricciones' },
  n6: { slug: 'compartir', etiqueta: 'Compartir resultado' },
  s5: { slug: 'formalizar', etiqueta: 'Formalizar asignación' },
  c3: { slug: 'doble-confirmacion', etiqueta: 'Doble confirmación' },
  c7: { slug: 'preventivas', etiqueta: 'Registrar preventivas' },
  o4: { slug: 'confirmar-llegada', etiqueta: 'Confirmar llegada' },
  k4: { slug: 'confirmar-despacho', etiqueta: 'Confirmar despacho' },
  g4: { slug: 'confirmar-recepcion', etiqueta: 'Confirmar recepción' },
  z1: { slug: 'calificacion', etiqueta: 'Registrar calificación' },
  z5: { slug: 'cerrar', etiqueta: 'Cerrar operación' },
  x1: { slug: 'novedad', etiqueta: 'Registrar novedad' },
  x2: { slug: 'paquete', etiqueta: 'Armar paquete' },
  x5: { slug: 'cancelar', etiqueta: 'Cancelar servicio' },
  x6: { slug: 'reanudar', etiqueta: 'Reanudar etapa' },
  r2: { slug: 'reanudar', etiqueta: 'Reanudar etapa' },
};
export const BOTON_POR_DEFECTO = { slug: 'guardar', etiqueta: 'Guardar' };
export const anclaBtn = (idBase: string): string => `plataforma.btn.${(BOTON_PASO[idBase] ?? BOTON_POR_DEFECTO).slug}`;

/* ─── Instantes compartidos con VentanaPlataforma ─── */
/** x1: aparece el bloque de la novedad registrada. */
export const T_NOV = 0.86;
/** Instante en que el chip de resultado aparece en la barra. */
export const T_RESULTADO = 0.85;
/** s3: la oferta queda marcada como seleccionada. */
export const T_SELEC = 0.55;
/** s2: instantes en que se marca cada requisito (operativo, documental, comercial). */
export const T_REQ = [0.3, 0.5, 0.7] as const;
/** x2: instante en que aparece la alternativa i de n. */
export const tAlt = (i: number, n: number): number => 0.2 + i * (0.52 / Math.max(1, n));
/** s1: instante en que se consolida la oferta i de n. */
export const tOferta = (i: number, n: number): number => 0.2 + i * (0.5 / Math.max(1, n));

/* ─── Datos derivados ─── */
export const base = (id?: string): string => (id ?? '').replace(/_\d+$/, '');

/** Etapa del flujo a la que pertenece cada paso de la plataforma. */
export const ETAPA_DE_PASO: Record<string, EtapaFlujo> = Object.fromEntries(
  ([
    ['Solicitud', ['a1', 'a2', 'a3', 'a4']],
    ['Validacion', ['v1', 'v2', 'v3', 'v4', 'v5']],
    ['Planeacion', ['p1', 'p2', 'p3', 'p4']],
    ['Busqueda', ['b1', 'b2', 'b3', 'b4']],
    ['Negociacion', ['n1', 'n2', 'n3', 'n4', 'n5', 'n6']],
    ['Seleccion', ['s1', 's2', 's3']],
    ['Asignacion', ['s4', 's5']],
    ['Confirmacion', ['c1', 'c2', 'c3', 'c4']],
    ['Preventiva', ['c5', 'c6', 'c7']],
    ['Presentacion', ['o1', 'o2', 'o3', 'o4']],
    ['Cargue', ['k1', 'k2', 'k3', 'k4']],
    ['Transito', ['t0', 't1', 't2', 't3', 't4']],
    ['AvisoDestino', ['g0', 'g1']],
    ['Descargue', ['g2', 'g3', 'g4']],
    ['ValidacionEntrega', ['y0', 'y1', 'y2']],
    ['LlamadaCierre', ['z0', 'z1']],
    ['CierreAdmin', ['z2', 'z3', 'z4', 'z5']],
  ] as [EtapaFlujo, string[]][]).flatMap(([e, ids]) => ids.map(i => [i, e])),
);

const EVENTOS: NombreEvento[] = [
  'SolicitudRecibida', 'SolicitudValidada', 'DatosSolicitados', 'OperacionRegistrada', 'TransportadoresPreseleccionados',
  'NegociacionIniciada', 'AceptacionPreliminar', 'TarifaEscalada', 'TransportadorSeleccionado', 'DocumentosValidados',
  'AsignacionConfirmada', 'ConfirmacionDoble', 'LlamadaPreventiva', 'NovedadRegistrada', 'LlegadaOrigenConfirmada',
  'CargueFinalizado', 'DespachoConfirmado', 'SeguimientoRegistrado', 'LlegadaDestinoConfirmada', 'EntregaConfirmada',
  'LlamadaCierre', 'CasoSeguimientoCreado', 'DecisionCoordinador', 'OperacionCerrada', 'OperacionCancelada',
];

/** Primer nombre de evento que aparece en un texto (el `resultado` de un paso). */
export function eventoEnTexto(texto?: string): NombreEvento | null {
  if (!texto) return null;
  return EVENTOS.find(e => texto.includes(e)) ?? null;
}

export function ultimoTransportador(d: DatosCaso): Transportador | null {
  return [...d.trayectoria].reverse().find(o => o.transportador)?.transportador ?? null;
}

export function ultimaPactada(d: DatosCaso): number | null {
  return [...d.trayectoria].reverse().find(o => o.tarifaPactada !== null)?.tarifaPactada ?? null;
}

export interface OfertaVista {
  id: string;
  nombre: string;
  vehiculo: string;
  tarifa: number;
  cumplimiento: number;
  compatibilidad: number;
  estado: EstadoOferta;
}

/** Ofertas consolidadas del caso (último snapshot que las trae; si no, las rondas de negociación). */
export function ofertasDe(d: DatosCaso): OfertaVista[] {
  const ofertas = [...d.trayectoria].reverse().find(o => o.ofertas.length > 0)?.ofertas ?? [];
  if (ofertas.length > 0) {
    return ofertas.map(o => ({
      id: o.transportadorId,
      nombre: o.nombre,
      vehiculo: o.vehiculo,
      tarifa: o.tarifaFinal ?? (o.estado === 'sobre_tope' ? o.tarifaSolicitada : o.tarifaOfrecida),
      cumplimiento: o.cumplimiento,
      compatibilidad: o.compatibilidad,
      estado: o.estado,
    }));
  }
  return d.negociacion.map(r => ({
    id: r.transportadorId,
    nombre: r.transportador,
    vehiculo: r.vehiculo,
    tarifa: r.tarifaFinal ?? (r.estado === 'sobre_tope' ? r.contrapropuesta : r.tarifaOfrecida),
    cumplimiento: r.cumplimiento,
    compatibilidad: r.compatibilidad,
    estado: r.estado,
  }));
}

/** La novedad del tipo pedido (si el caso la tuvo); si no, la principal del caso. */
export function excDe(d: DatosCaso, tipo?: TipoExcepcion): Excepcion | null {
  if (!tipo || d.excepcion?.tipo === tipo) return d.excepcion;
  for (const o of d.trayectoria) {
    if (o.excepcion?.tipo === tipo) return o.excepcion;
    const previa = o.excepcionesPrevias.find(e => e.tipo === tipo);
    if (previa) return previa;
  }
  return d.excepcion;
}

export const fmtCosto = (n: number): string => (n === 0 ? '$ 0' : `${n > 0 ? '+' : '−'}${pesos(Math.abs(n))}`);

/* ─── Utilidades de guion ─── */
const ordenar = (ui: AccionUI[]): AccionUI[] => ui.map((a, i) => ({ a, i })).sort((x, y) => x.a.t - y.a.t || x.i - y.i).map(x => x.a);
const corta = (s: string, n: number): string => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);
const OPERACION: Vista = 'plataforma.operacion';
const SELECCION: Vista = 'plataforma.seleccion';
/** Fin de un tecleo que dure al menos 320 ms reales. */
const finTecleo = (t: number, duracion: number): number => Math.min(0.85, t + 320 / Math.max(1, duracion) + 0.02);

const mover = (t: number, ancla: string): AccionUI => ({ t, tipo: 'mover', ancla });
const clic = (t: number, ancla: string): AccionUI => ({ t, tipo: 'clic', ancla });
const resaltar = (t: number, hasta: number, ancla: string, texto: string): AccionUI => ({ t, hasta, tipo: 'resaltar', ancla, texto });
const estado = (t: number, texto: string, nivel: AccionUI['nivel'] = 'info'): AccionUI => ({ t, tipo: 'estado', texto, nivel });

const idOperacion = (d: DatosCaso): string => d.trayectoria[0].id;

/* ─── Pasos de la ficha de la operación ─── */
const a4: Guion = ({ d }: CtxGuion) => {
  const s = d.solicitud;
  const llamada = s.canal === 'llamada_ia';
  return {
    vista: OPERACION,
    ui: ordenar([
      estado(0, `Abriendo la solicitud ${s.referenciaCliente} en la plataforma…`),
      mover(0.04, ANCLA_PLAT.cliente),
      resaltar(0.08, 0.26, ANCLA_PLAT.cliente, 'Cliente'),
      resaltar(0.26, 0.44, ANCLA_PLAT.ruta, 'Ruta'),
      resaltar(0.44, 0.58, ANCLA_PLAT.mercancia, 'Mercancía'),
      mover(0.58, anclaBtn('a4')),
      clic(0.68, anclaBtn('a4')),
      estado(0.74, llamada ? 'Solicitud inicial y transcripción guardadas en el expediente' : 'Solicitud inicial guardada en el expediente', 'ok'),
    ]),
    pensamiento: `Guardo la solicitud ${s.referenciaCliente} de ${d.trayectoria[0].cliente.nombre} en el expediente${llamada ? ' junto con la transcripción de la llamada' : ''}: según R26 queda ligada a un interlocutor, una operación y una actividad, y la conservo completa (R30).`,
  };
};

const validar = (pensamiento: string): Guion => ({ d }: CtxGuion) => ({
  vista: OPERACION,
  ui: ordenar([
    estado(0, 'Abriendo la solicitud para marcarla como validada…'),
    mover(0.1, ANCLA_PLAT.estado),
    resaltar(0.14, 0.4, ANCLA_PLAT.estado, 'Estado'),
    mover(0.3, anclaBtn('v3')),
    clic(0.5, anclaBtn('v3')),
    estado(0.62, `Solicitud validada · ${d.datosMinimos.length} datos mínimos revisados`, 'ok'),
  ]),
  pensamiento,
});

const p1: Guion = ({ d, duracion }: CtxGuion) => {
  const id = idOperacion(d);
  const fin = finTecleo(0.1, duracion);
  return {
    vista: OPERACION,
    ui: ordenar([
      estado(0, 'Creando la operación en la plataforma…'),
      mover(0.04, ANCLA_PLAT.operacion),
      { t: 0.1, hasta: fin, tipo: 'teclear', ancla: ANCLA_PLAT.operacion, texto: id },
      mover(fin + 0.02, anclaBtn('p1')),
      clic(Math.min(0.94, fin + 0.1), anclaBtn('p1')),
      estado(Math.min(0.96, fin + 0.14), `Operación ${id} registrada`, 'ok'),
    ]),
    pensamiento: `Registro la operación con el identificador único ${id} (R03): desde aquí todo lo que ocurra queda ligado a ese número, a un interlocutor y a una actividad (R26).`,
  };
};

const p2: Guion = ({ d }: CtxGuion) => {
  const o = d.trayectoria[0];
  return {
    vista: OPERACION,
    ui: ordenar([
      estado(0, 'Identificando restricciones y recursos de la operación…'),
      mover(0.04, ANCLA_PLAT.vehiculo),
      resaltar(0.08, 0.3, ANCLA_PLAT.vehiculo, 'Vehículo requerido'),
      resaltar(0.3, 0.52, ANCLA_PLAT.cargue, 'Fecha comprometida'),
      resaltar(0.52, 0.72, ANCLA_PLAT.requisitos, 'Restricciones'),
      mover(0.74, anclaBtn('p2')),
      clic(0.84, anclaBtn('p2')),
      estado(0.9, `${o.vehiculoRequerido} · cargue ${horaMin(o.fechaCargue)} · ${o.requisitoEspecial ?? 'sin requisitos especiales'}`, 'ok'),
    ]),
    pensamiento: `Dejo asentado en ${o.id} qué vehículo se necesita (${o.vehiculoRequerido}), la fecha comprometida y las restricciones del cliente; con eso la búsqueda sabe qué puede ofrecer y cada compromiso queda trazado (R26).`,
  };
};

const n6: Guion = () => ({
  vista: OPERACION,
  ui: ordenar([
    estado(0, 'Compartiendo el resultado de la negociación…'),
    mover(0.04, ANCLA_PLAT.negociacion),
    resaltar(0.08, 0.45, ANCLA_PLAT.negociacion, 'Resultado de la negociación'),
    mover(0.4, anclaBtn('n6')),
    clic(0.55, anclaBtn('n6')),
    { t: 0.62, hasta: 0.95, tipo: 'toast', texto: 'Resultado disponible para el Agente de Seguimiento (R27)', nivel: 'info' },
    estado(0.66, 'Resultado de la negociación compartido con todos los agentes', 'ok'),
  ]),
  pensamiento: 'Comparto en la plataforma el resultado de la negociación para que el Agente de Seguimiento y los demás lean lo mismo sin repetir llamadas (R27).',
});

const s5: Guion = ({ d }: CtxGuion) => {
  const t = ultimoTransportador(d);
  const o = d.trayectoria[0];
  const tarifa = ultimaPactada(d) ?? o.tarifaMaxima;
  const nombre = t?.nombre ?? 'el transportador';
  return {
    vista: OPERACION,
    ui: ordenar([
      estado(0, 'Preparando la asignación…'),
      mover(0.04, anclaBtn('s5')),
      clic(0.12, anclaBtn('s5')),
      {
        t: 0.18,
        hasta: 0.74,
        tipo: 'dialogo',
        dialogo: {
          tipo: 'confirmar',
          titulo: 'Formalizar asignación',
          cuerpo: `Asignar ${nombre}${t ? ` · ${t.placa}` : ''} a ${o.id} por ${pesos(tarifa)}.\nSe avisará al cliente y al transportador.`,
          botones: ['Confirmar', 'Cancelar'],
          regla: 'R10',
        },
      },
      mover(0.5, 'dlg.btn.confirmar'),
      clic(0.6, 'dlg.btn.confirmar'),
      estado(0.78, `Asignación confirmada · ${nombre}${t ? ` · ${t.placa}` : ''}`, 'ok'),
    ]),
    pensamiento: `Formalizo la asignación de ${nombre} a ${o.id}: los documentos ya están vigentes (R10) y pido confirmación antes de dejarla en firme y avisar a las dos partes.`,
  };
};

/** Pasos cortos de confirmación: botón + resaltado de lo que cambia en la ficha. */
function confirmacion(
  slugPaso: string, resaltado: { ancla: string; texto: string }[], textoEstado: (d: DatosCaso) => string, inicial: string, pensamiento: (d: DatosCaso) => string,
): Guion {
  return ({ d }: CtxGuion) => {
    const ui: AccionUI[] = [estado(0, inicial)];
    let t = 0.04;
    const paso = 0.4 / Math.max(1, resaltado.length);
    resaltado.forEach((r, i) => {
      ui.push(mover(t, r.ancla), resaltar(t + 0.02, t + paso, r.ancla, r.texto));
      t += paso;
      if (i === resaltado.length - 1) t += 0.02;
    });
    ui.push(mover(t, anclaBtn(slugPaso)), clic(t + 0.12, anclaBtn(slugPaso)), estado(t + 0.2, textoEstado(d), 'ok'));
    return { vista: OPERACION, ui: ordenar(ui), pensamiento: pensamiento(d) };
  };
}

const c3 = confirmacion(
  'c3',
  [{ ancla: ANCLA_PLAT.confirmacion, texto: 'Misma información' }],
  () => 'Doble confirmación registrada: cliente y transportador',
  'Revisando las dos confirmaciones…',
  () => 'Registro la doble confirmación: cliente y transportador recibieron la misma fecha, hora y lugar de cargue, y solo así la asignación queda firme (R11).',
);
const c7 = confirmacion(
  'c7',
  [{ ancla: ANCLA_PLAT.compromisos, texto: 'Compromisos vigentes' }],
  () => 'Llamadas preventivas registradas sin cambios',
  'Revisando los compromisos tras las llamadas preventivas…',
  () => 'Las dos llamadas preventivas salieron sin cambios: dejo la programación tal como está y los compromisos siguen vigentes (R12).',
);
const o4 = confirmacion(
  'o4',
  [{ ancla: ANCLA_PLAT.compromisos, texto: 'Presentación' }, { ancla: ANCLA_PLAT.eventos, texto: 'Llegada' }],
  () => 'Llegada al origen confirmada por ambas partes',
  'Registrando la llegada al origen…',
  () => 'Transportador y cliente coinciden en que el vehículo está en las instalaciones (R15): confirmo la llegada al origen y la dejo en la operación.',
);
const k4 = confirmacion(
  'k4',
  [{ ancla: ANCLA_PLAT.eventos, texto: 'Cargue y despacho' }],
  () => 'Despacho confirmado: la operación sigue hacia el destino',
  'Registrando el despacho…',
  () => 'Con la hora real de salida y el despacho confirmado por el cliente (R17), marco el cargue como finalizado y la operación sigue hacia el destino.',
);
const g4 = confirmacion(
  'g4',
  [{ ancla: ANCLA_PLAT.eventos, texto: 'Llegada a destino' }],
  () => 'Mercancía recibida por el destinatario',
  'Registrando la recepción en destino…',
  () => 'Recepción confirmó la mercancía y no hay diferencias ni daños (R16): registro la llegada a destino y la entrega al destinatario.',
);

const z1: Guion = ({ d, duracion }: CtxGuion) => {
  const sat = d.trayectoria[d.trayectoria.length - 1].satisfaccion;
  const fin = finTecleo(0.1, duracion);
  const ui: AccionUI[] = [estado(0, 'Registrando la calificación del cliente…'), mover(0.04, ANCLA_PLAT.satisfaccion)];
  if (sat !== null) ui.push({ t: 0.1, hasta: fin, tipo: 'teclear', ancla: ANCLA_PLAT.satisfaccion, texto: String(sat) });
  ui.push(mover(fin + 0.02, anclaBtn('z1')), clic(Math.min(0.94, fin + 0.1), anclaBtn('z1')), estado(Math.min(0.96, fin + 0.14), `Calificación ${sat ?? '—'} sobre 5 registrada`, 'ok'));
  return {
    vista: OPERACION,
    ui: ordenar(ui),
    pensamiento: `Registro la calificación ${sat ?? 'del cliente'} sobre 5 y las observaciones que dio en la llamada de cierre (R24); queda en la operación para el indicador de satisfacción.`,
  };
};

const z5: Guion = ({ d }: CtxGuion) => {
  const fin = d.trayectoria[d.trayectoria.length - 1];
  return {
    vista: OPERACION,
    ui: ordenar([
      estado(0, 'Preparando el cierre administrativo…'),
      mover(0.04, ANCLA_PLAT.tarifa),
      resaltar(0.08, 0.4, ANCLA_PLAT.tarifa, 'Tarifa pactada y adicionales'),
      mover(0.38, anclaBtn('z5')),
      clic(0.5, anclaBtn('z5')),
      estado(0.58, `Operación ${fin.id} cerrada`, 'ok'),
    ]),
    pensamiento: `Con documentos, condiciones económicas y novedades ya revisados (R25), cierro ${fin.id}: queda la tarifa pactada más los costos adicionales autorizados y nada más sin soporte.`,
  };
};

/* ─── Selección (comparativo de ofertas) ─── */
const s1: Guion = ({ d }: CtxGuion) => {
  const ofertas = ofertasDe(d);
  const n = ofertas.length;
  const o = d.trayectoria[0];
  const ui: AccionUI[] = [
    estado(0, 'Consolidando las ofertas recibidas…'),
    mover(0.04, ANCLA_PLAT.btnConsolidar),
    clic(0.1, ANCLA_PLAT.btnConsolidar),
  ];
  ofertas.forEach((of, i) => {
    const t = tOferta(i, n);
    ui.push(mover(t, anclaOferta(of.id)), resaltar(t, Math.min(0.92, t + 0.5 / Math.max(1, n)), anclaOferta(of.id), of.nombre));
  });
  ui.push(estado(0.9, `${n} ofertas consolidadas · tope ${pesos(o.tarifaMaxima)}`, 'ok'));
  return {
    vista: SELECCION,
    ui: ordenar(ui),
    pensamiento: `Pongo lado a lado las ${n} ofertas con tarifa, cumplimiento y compatibilidad, y las comparo con el tope autorizado de ${pesos(o.tarifaMaxima)} (R07) antes de decidir la selección (R09).`,
  };
};

const s2: Guion = ({ d, ok }: CtxGuion) => {
  const manual = !ok;
  const ui: AccionUI[] = manual
    ? [
      estado(0, 'Comprobando si aplica la selección automática…'),
      mover(0.04, ANCLA_PLAT.modo),
      resaltar(0.08, 0.45, ANCLA_PLAT.modo, 'Modo de selección'),
      mover(0.45, ANCLA_PLAT.reqOperativo),
      resaltar(0.48, 0.78, ANCLA_PLAT.reqOperativo, 'Requisitos'),
      estado(0.8, 'La selección queda en manos del coordinador (R09)', 'aviso'),
    ]
    : [
      estado(0, 'Verificando los requisitos de la selección automática…'),
      mover(0.04, ANCLA_PLAT.reqOperativo),
      resaltar(0.08, T_REQ[0], ANCLA_PLAT.reqOperativo, 'Requisito operativo'),
      mover(T_REQ[0], ANCLA_PLAT.reqDocumental),
      resaltar(T_REQ[0], T_REQ[1], ANCLA_PLAT.reqDocumental, 'Requisito documental'),
      mover(T_REQ[1], ANCLA_PLAT.reqComercial),
      resaltar(T_REQ[1], T_REQ[2], ANCLA_PLAT.reqComercial, 'Requisito comercial'),
      estado(0.76, 'Cumple los tres requisitos: selección automática', 'ok'),
    ];
  const titulo = d.excepcion?.titulo ?? 'ofertas consolidadas';
  return {
    vista: SELECCION,
    ui: ordenar(ui),
    pensamiento: manual
      ? `La selección automática no aplica a esta operación (${titulo}): según R09 dejo las ofertas consolidadas y la elección en manos del coordinador, con una propuesta para que decida rápido.`
      : 'Reviso los tres requisitos de R09: operativo, documental y comercial. Como los cumple, selecciono yo misma y no le quito tiempo al coordinador.',
  };
};

const s3: Guion = ({ d }: CtxGuion) => {
  const t = ultimoTransportador(d);
  const ofertas = ofertasDe(d);
  const sel = ofertas.find(o => o.id === t?.id) ?? ofertas[0];
  const manual = d.excepcion?.tipo === 'Seleccion_manual';
  const tarifa = ultimaPactada(d);
  if (!sel) return { vista: SELECCION, ui: [estado(0, 'Seleccionando el transportador…')], pensamiento: 'Selecciono al transportador con la información consolidada (R09).' };
  const nombre = t?.nombre ?? sel.nombre;
  return {
    vista: SELECCION,
    ui: ordenar([
      estado(0, 'Seleccionando el transportador…'),
      mover(0.05, anclaOferta(sel.id)),
      clic(0.18, anclaOferta(sel.id)),
      mover(0.34, ANCLA_PLAT.btnSeleccionar),
      clic(0.44, ANCLA_PLAT.btnSeleccionar),
      estado(0.6, `Transportador seleccionado: ${nombre}${tarifa ? ` · ${pesos(tarifa)}` : ''}`, 'ok'),
    ]),
    pensamiento: manual
      ? `Registro la selección que hizo el coordinador, ${nombre}, y la dejo en la operación como ganadora de las ofertas consolidadas (R09).`
      : `Selecciono a ${nombre}${tarifa ? ` por ${pesos(tarifa)}` : ''}: cumple los tres requisitos de R09 y su tarifa es la autorizada para esta operación.`,
  };
};

/* ─── Novedades: registrar (x1), armar el paquete (x2), cancelar (x5), retomar (x6, r2) ─── */
const RAZON: Record<TipoExcepcion, string> = {
  Datos_incompletos: 'al cliente le faltan datos de la solicitud; registro lo confirmado y programo una gestión posterior',
  Sin_respuesta: 'el contacto no respondió; dejo el intento anotado y reprogramo el reintento',
  Tarifa_sobre_tope: 'la contrapropuesta supera el tope autorizado y no puedo aceptarla sin autorización',
  Sin_transportador: 'ningún candidato aceptó dentro de lo previsto para esta ruta y fecha',
  Seleccion_manual: 'la selección automática no aplica y las ofertas consolidadas pasan al coordinador',
  Mercancia_no_lista: 'el cliente avisó que la mercancía no estará lista a la hora acordada',
  Retraso_transportador: 'el transportador no llegaría a tiempo al punto de cargue',
  Diferencia_llegada: 'el transportador dice haber llegado y el cliente no lo ve en las instalaciones',
  Espera_en_cargue: 'el vehículo lleva en espera de cargue más del parámetro',
  Diferencia_despacho: 'lo despachado no coincide con lo solicitado',
  Novedad_en_ruta: 'hay una demora, un cierre vial o una avería en el trayecto',
  Conductor_ocupado: 'el conductor atendió mientras conducía y no sigo la llamada',
  Destinatario_no_recibe: 'el destinatario no puede recibir en el horario previsto',
  Demora_en_descargue: 'filas, acceso o documentos demoran el descargue en destino',
  Diferencia_entrega: 'transportador y cliente no coinciden sobre la entrega',
  Inconformidad_cliente: 'el cliente manifestó inconformidad en la llamada de cierre',
  Sobrecosto_liquidacion: 'hay costos adicionales sin autorización que afectan la liquidación',
};

function contexto(c: CtxGuion, tipo?: TipoExcepcion) {
  const exc = excDe(c.d, tipo);
  const pl = exc ? PLANTILLA_EXCEPCION[exc.tipo] : undefined;
  return { exc, pl };
}

const x1 = (tipo?: TipoExcepcion): Guion => (c: CtxGuion) => {
  const { exc, pl } = contexto(c, tipo);
  if (!exc || !pl) return {};
  const consecuencia = exc.categoria === 'automatico'
    ? 'la resuelvo sin intervención humana'
    : exc.categoria === 'asistido'
      ? 'armo el paquete con alternativas y una persona lo confirma'
      : 'armo el paquete y la decide una persona';
  return {
    vista: OPERACION,
    ui: ordenar([
      estado(0, 'Abriendo el registro de novedades…'),
      mover(0.05, ANCLA_PLAT.btnNovedad),
      clic(0.12, ANCLA_PLAT.btnNovedad),
      {
        t: 0.16,
        hasta: 0.82,
        tipo: 'dialogo',
        dialogo: {
          tipo: 'confirmar',
          titulo: 'Registrar novedad',
          cuerpo: `${exc.titulo}\nCausa: ${corta(exc.causa, 120)}\nPolítica ${pl.politica}`,
          botones: ['Registrar', 'Cancelar'],
          regla: pl.regla,
        },
      },
      mover(0.5, 'dlg.btn.registrar'),
      clic(0.64, 'dlg.btn.registrar'),
      estado(T_NOV, `Novedad registrada · ${exc.titulo}`, 'aviso'),
    ]),
    pensamiento: `Registro la novedad «${exc.titulo}» en ${idOperacion(c.d)}: ${RAZON[exc.tipo]}. Aplico ${pl.regla} (${pl.politica}) y, como es ${exc.categoria === 'automatico' ? 'automática' : exc.categoria}, ${consecuencia}.`,
  };
};

const x2 = (tipo?: TipoExcepcion): Guion => (c: CtxGuion) => {
  const { exc, pl } = contexto(c, tipo);
  if (!exc || !pl || exc.categoria === 'automatico') return {};
  const alts = exc.alternativas;
  const n = alts.length;
  const h = humanoPara(exc.tipo);
  const rec = alts.find(a => a.id === exc.recomendada) ?? alts[0];
  const ui: AccionUI[] = [
    estado(0, 'Armando el paquete de decisión…'),
    mover(0.04, ANCLA_PLAT.btnPaquete),
    clic(0.1, ANCLA_PLAT.btnPaquete),
  ];
  alts.forEach((a, i) => {
    const t = tAlt(i, n);
    ui.push(mover(t, anclaAlt(a.id)), resaltar(t, Math.min(0.78, t + 0.52 / n), anclaAlt(a.id), `Alternativa ${a.id}`));
  });
  ui.push(resaltar(0.78, 0.92, anclaAlt(rec.id), 'Recomendación'), estado(0.9, `Paquete listo · recomendación ${rec.id}: ${rec.titulo}`, 'ok'));
  const quien = exc.categoria === 'humano' ? `la decide ${h.nombre} (${h.rol})` : `${h.nombre} (${h.rol}) lo confirma`;
  return {
    vista: OPERACION,
    ui: ordenar(ui),
    pensamiento: `Reúno causa, impacto y evidencia en un paquete con ${n} alternativas (${alts.map(a => a.id).join(', ')}) y recomiendo la ${rec.id}: «${rec.titulo}». Aplico ${pl.regla} (${pl.politica}); ${quien}, no la tomo yo.`,
  };
};

const x5: Guion = ({ d }: CtxGuion) => {
  const exc = d.excepcion;
  const o = d.trayectoria[0];
  const motivo = exc?.titulo ?? 'decisión del coordinador';
  return {
    vista: OPERACION,
    ui: ordenar([
      estado(0, 'Preparando la cancelación del servicio…'),
      mover(0.05, ANCLA_PLAT.btnCancelar),
      clic(0.12, ANCLA_PLAT.btnCancelar),
      {
        t: 0.16,
        hasta: 0.76,
        tipo: 'dialogo',
        dialogo: {
          tipo: 'confirmar',
          titulo: 'Cancelar el servicio',
          cuerpo: `Se cancelará ${o.id} (${o.nodoOrigen.ciudad} → ${o.nodoDestino.ciudad}).\nMotivo: ${corta(motivo, 90)}\nSe informa al cliente y se cierra la solicitud.`,
          botones: ['Cancelar servicio', 'Volver'],
          regla: 'R28',
        },
      },
      mover(0.48, 'dlg.btn.cancelar-servicio'),
      clic(0.6, 'dlg.btn.cancelar-servicio'),
      estado(0.8, `Servicio cancelado · ${o.id}`, 'error'),
    ]),
    pensamiento: `El coordinador decidió cancelar (R28): pido confirmación, informo al cliente, cierro la solicitud de ${o.id} y dejo la decisión y su motivo en el expediente (R30).`,
  };
};

const retomar = (nota: string): Guion => (c: CtxGuion) => {
  const { exc, pl } = contexto(c);
  return {
    vista: OPERACION,
    ui: ordenar([
      estado(0, 'Registrando la decisión en la operación…'),
      mover(0.05, ANCLA_PLAT.novedad),
      resaltar(0.08, 0.5, ANCLA_PLAT.novedad, 'Novedad resuelta'),
      mover(0.5, anclaBtn('x6')),
      clic(0.64, anclaBtn('x6')),
      estado(0.76, 'Etapa retomada con la decisión registrada', 'ok'),
    ]),
    pensamiento: `${nota}${exc && pl ? ` Según ${pl.regla} la novedad «${exc.titulo}» queda resuelta y retomo la etapa donde se quedó.` : ' Retomo la etapa donde se quedó.'} La decisión queda en el expediente (R30).`,
  };
};

/** Guiones de la ventana «plataforma». Claves: id de paso o `variante:id`. */
export const plataforma: Guiones = {
  a4,
  v3: validar('Con los nueve datos mínimos ya revisados (R01), marco la solicitud como validada: es suficiente para registrar la operación.'),
  v5: validar('El cliente completó lo pendiente (R02): con los nueve datos completos marco la solicitud como validada y sigo con la planeación.'),
  p1,
  p2,
  n6,
  s1,
  s2,
  'Seleccion_manual:s2': s2,
  s3,
  s5,
  c3,
  c7,
  o4,
  k4,
  g4,
  z1,
  z5,
  x1: x1(),
  x2: x2(),
  x5,
  x6: retomar('Con la decisión ya tomada por la persona, la dejo registrada en la operación.'),
  r2: retomar('Resuelta la novedad, completo lo que faltaba de la etapa.'),
};

/* Una variante de x1 por cada tipo de novedad; x2 solo donde el paquete lo arma la plataforma. */
for (const t of TIPOS_EXCEPCION) {
  plataforma[`${t}:x1`] = x1(t);
  if (PLANTILLA_EXCEPCION[t].categoriaBase !== 'automatico') plataforma[`${t}:x2`] = x2(t);
}
