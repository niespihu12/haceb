// ============================================================================
// Ontología del dominio · Haceb · Coordinación logística con agentes de IA
//
// Todo lo que viaja por el simulador está tipado aquí. Lo que sale del
// insumo (docs/proceso.txt) y lo que es supuesto de diseño se distingue en
// procesoData.ts / mockData.ts; aquí solo se define la forma.
// ============================================================================

// --- Flujo ------------------------------------------------------------------

/** Las 17 etapas del flujo end-to-end, en orden. */
export type EtapaFlujo =
  | 'Solicitud'
  | 'Validacion'
  | 'Planeacion'
  | 'Busqueda'
  | 'Negociacion'
  | 'Seleccion'
  | 'Asignacion'
  | 'Confirmacion'
  | 'Preventiva'
  | 'Presentacion'
  | 'Cargue'
  | 'Transito'
  | 'AvisoDestino'
  | 'Descargue'
  | 'ValidacionEntrega'
  | 'LlamadaCierre'
  | 'CierreAdmin';

/** Estados de espera (la operación no avanza hasta que alguien actúe). */
export type EstadoEspera = 'EsperaDatos' | 'Escalada';

/** Estados de fin. SUPUESTO: «Cancelada» se deduce de «cancelar un servicio». */
export type EstadoFin = 'Cerrada' | 'Cancelada';

export type EtapaOperacion = EtapaFlujo | EstadoEspera | EstadoFin;

/** Agrupación VISUAL de etapas (no es del documento) + salida de novedad. */
export type BloqueFlujo = 'Solicitud' | 'Consecucion' | 'Cargue' | 'Transito' | 'Cierre' | 'Novedad';

// --- Canales, decisión, agentes ---------------------------------------------

export type Canal = 'llamada_ia' | 'formulario' | 'integracion' | 'coordinador';

/** Distinción del insumo (línea 85): informar vs. decidir. SUPUESTO: «asistido» = el agente propone, la persona decide. */
export type CategoriaDecision = 'automatico' | 'asistido' | 'humano';

export type AgenteIA = 'Agente de cliente' | 'Agente de negociación' | 'Agente de seguimiento';
export type Ejecutor = AgenteIA | 'Sistema' | 'Coordinador';

export type TipoExcepcion =
  | 'Datos_incompletos'
  | 'Sin_respuesta'
  | 'Tarifa_sobre_tope'
  | 'Sin_transportador'
  | 'Seleccion_manual'
  | 'Mercancia_no_lista'
  | 'Retraso_transportador'
  | 'Diferencia_llegada'
  | 'Espera_en_cargue'
  | 'Diferencia_despacho'
  | 'Novedad_en_ruta'
  | 'Conductor_ocupado'
  | 'Destinatario_no_recibe'
  | 'Demora_en_descargue'
  | 'Diferencia_entrega'
  | 'Inconformidad_cliente'
  | 'Sobrecosto_liquidacion';

/** SUPUESTO: el insumo no nombra eventos; estos nombres son propios. */
export type NombreEvento =
  | 'SolicitudRecibida'
  | 'SolicitudValidada'
  | 'DatosSolicitados'
  | 'OperacionRegistrada'
  | 'TransportadoresPreseleccionados'
  | 'NegociacionIniciada'
  | 'AceptacionPreliminar'
  | 'TarifaEscalada'
  | 'TransportadorSeleccionado'
  | 'DocumentosValidados'
  | 'AsignacionConfirmada'
  | 'ConfirmacionDoble'
  | 'LlamadaPreventiva'
  | 'NovedadRegistrada'
  | 'LlegadaOrigenConfirmada'
  | 'CargueFinalizado'
  | 'DespachoConfirmado'
  | 'SeguimientoRegistrado'
  | 'LlegadaDestinoConfirmada'
  | 'EntregaConfirmada'
  | 'LlamadaCierre'
  | 'CasoSeguimientoCreado'
  | 'DecisionCoordinador'
  | 'OperacionCerrada'
  | 'OperacionCancelada'
  | 'Sistema';

export type SistemaId =
  | 'plataforma'
  | 'agenteCliente'
  | 'agenteNegociacion'
  | 'agenteSeguimiento'
  | 'baseProveedores'
  | 'agenda'
  | 'expediente'
  | 'integracionCliente'
  | 'integracionExterna'
  | 'vistaCentral';

export type RolId =
  | 'cliente'
  | 'contacto'
  | 'destinatario'
  | 'transportador'
  | 'coordinador'
  | 'responsable'
  | 'agente';

export type SimulacionVelocidad = 1 | 2 | 5 | 10;

// --- Actores y maestros ------------------------------------------------------

export interface Cliente {
  id: string; // CL-001
  nombre: string;
  tipo: string;
  contacto: string;
  telefono: string;
}

export interface Nodo {
  id: string;
  ciudad: string;
  lugar: string; // bodega / CEDI / planta
  lat: number;
  lng: number;
}

export type TipoVehiculo = 'Camioneta NHR' | 'Turbo' | 'Sencillo' | 'Doble troque' | 'Tractomula';

export interface Transportador {
  id: string; // TR-01
  nombre: string;
  base: string;
  flota: TipoVehiculo[];
  cumplimiento: number; // 0-100, historial
  conductor: string;
  telefono: string;
  placa: string;
}

export interface Mercancia {
  tipo: string; // «Línea blanca · neveras»
  descripcion: string;
  unidades: number;
  pesoKg: number;
  volumenM3: number;
}

// --- Comunicación -------------------------------------------------------------

export type ObjetivoLlamada =
  | 'Recibir solicitud'
  | 'Completar datos'
  | 'Confirmar condiciones de cargue'
  | 'Negociar tarifa'
  | 'Informar asignación'
  | 'Confirmar con transportador'
  | 'Llamada preventiva'
  | 'Validar presentación'
  | 'Confirmar despacho'
  | 'Seguimiento en ruta'
  | 'Informar novedad'
  | 'Consulta de estado'
  | 'Preparar recepción'
  | 'Confirmar recepción'
  | 'Validar entrega'
  | 'Cierre y satisfacción';

export type ResultadoLlamada = 'exitosa' | 'sin_respuesta' | 'reprogramada' | 'con_novedad';

export interface Llamada {
  id: string;
  ts: number;
  sentido: 'saliente' | 'entrante';
  interlocutor: 'cliente' | 'transportador' | 'destinatario';
  nombre: string;
  objetivo: ObjetivoLlamada;
  resultado: ResultadoLlamada;
  /** Minutos que tardó en contestar (null si no contestó). */
  respuestaMin: number | null;
  duracionSeg: number;
  agente: AgenteIA;
  etapa: EtapaFlujo;
  resumen: string;
  /** Información confirmada vs. estimada (línea 51): solo lo confirmado se promete. */
  confirmada: boolean;
}

export interface Compromiso {
  id: string;
  texto: string;
  parte: 'cliente' | 'transportador' | 'coordinador' | 'agente';
  venceEn: number;
  estado: 'pendiente' | 'cumplido' | 'incumplido';
}

export type EstadoOferta = 'aceptada_preliminar' | 'sobre_tope' | 'sin_interes' | 'contraoferta_ok';

export interface Oferta {
  transportadorId: string;
  nombre: string;
  vehiculo: TipoVehiculo;
  compatibilidad: number;
  cumplimiento: number;
  tarifaOfrecida: number;
  tarifaSolicitada: number;
  tarifaFinal: number | null;
  estado: EstadoOferta;
}

// --- Excepción, traza, eventos ------------------------------------------------

export type EfectoAlternativa =
  | { tipo: 'continuar' }
  | { tipo: 'volver'; etapa: EtapaFlujo }
  | { tipo: 'cancelar' };

export type NivelSLA = 'ninguno' | 'bajo' | 'medio' | 'alto';

export interface Alternativa {
  id: 'A' | 'B' | 'C' | 'D';
  titulo: string;
  descripcion: string;
  /** Delta de costo en COP (puede ser negativo). */
  impactoCosto: number;
  /** Delta de tiempo en horas. */
  impactoHoras: number;
  impactoSLA: NivelSLA;
  /** Reglas / políticas que toca (códigos Rnn o POL-XX-nn). */
  reglas: string[];
  efecto: EfectoAlternativa;
}

export type DecisionHumana = 'AUTORIZAR' | 'ALTERNATIVA' | 'RECHAZAR' | 'CANCELAR';

export interface Excepcion {
  id: string;
  tipo: TipoExcepcion;
  categoria: CategoriaDecision;
  titulo: string;
  causa: string;
  impacto: string;
  evidencia: string[];
  alternativas: Alternativa[];
  recomendada: Alternativa['id'];
  etapaOrigen: EtapaFlujo;
  detectadaEn: number;
  /** Minutos de anticipación con que se detectó respecto del impacto sobre el compromiso. */
  anticipacionMin: number;
  politica: string;
  resueltaEn?: number;
  resueltaPor?: 'agente' | 'coordinador';
  decisionHumana?: DecisionHumana;
  alternativaElegida?: Alternativa['id'];
  decididoPor?: string;
}

export interface TrazaDecision {
  id: string;
  ts: number;
  etapa: EtapaFlujo;
  ejecutor: Ejecutor;
  /** Qué ocurrió → qué información utilizó → qué regla aplicó → qué decidió → qué ejecutó → resultado. */
  ocurrio: string;
  informacion: string[];
  regla: string;
  decidio: string;
  ejecuto: string;
  resultado: string;
}

export interface EventoOperacion {
  evento: NombreEvento;
  timestamp: number;
  detalle: string;
}

export interface Soporte {
  nombre: string;
  tipo: 'solicitud' | 'transcripcion' | 'grabacion' | 'documento' | 'soporte_entrega' | 'liquidacion';
  ts: number;
  /** Las grabaciones solo existen cuando están autorizadas (POL-GRA-01). */
  autorizada?: boolean;
}

// --- Unidad de trabajo ---------------------------------------------------------

export interface Operacion {
  id: string; // OP-0001
  seq: number;
  canal: Canal;
  origen: 'simulacion' | 'agentes';
  cliente: Cliente;
  solicitante: string;
  // Datos mínimos de la solicitud (insumo, línea 5)
  nodoOrigen: Nodo;
  nodoDestino: Nodo;
  mercancia: Mercancia;
  vehiculoRequerido: TipoVehiculo;
  fechaCargue: number;
  condicionesEntrega: string;
  requisitoEspecial: string | null;
  /** Datos que el cliente no tenía al llamar (se completan en una gestión posterior). */
  datosPendientes: string[];
  // Economía (parámetros ejemplo)
  tarifaMaxima: number;
  tarifaPactada: number | null;
  /** Costos adicionales autorizados (COP): sobrecostos, esperas, rutas alternas. */
  costosAdicionales: number;
  distanciaKm: number;
  // Estado
  etapa: EtapaOperacion;
  /** Etapa en la que estaba al esperar datos o escalarse. */
  etapaRetorno: EtapaFlujo | null;
  bloque: BloqueFlujo;
  progreso: number;
  // Asignación
  ofertas: Oferta[];
  transportador: Transportador | null;
  receptor: { nombre: string; telefono: string } | null;
  // Comunicación
  llamadas: Llamada[];
  compromisos: Compromiso[];
  intentosContacto: number;
  // Excepciones y trazabilidad
  excepcion: Excepcion | null;
  excepcionesPrevias: Excepcion[];
  trazas: TrazaDecision[];
  eventos: EventoOperacion[];
  soportes: Soporte[];
  intervencionHumana: boolean;
  causaCancelacion: string | null;
  /** Hora real de salida / entrega. */
  horaSalida: number | null;
  horaEntrega: number | null;
  /** Retraso acumulado en horas respecto al compromiso. */
  retrasoHoras: number;
  satisfaccion: number | null;
  casoSeguimiento: boolean;
  fechaCreacion: number;
  fechaActualizacion: number;
  fechaCierre: number | null;
}

// --- Filtros, bitácora, métricas -------------------------------------------------

export interface FiltrosOperacion {
  canales: Canal[];
  etapas: EtapaOperacion[];
  bloques: BloqueFlujo[];
  categorias: CategoriaDecision[];
  tipos: TipoExcepcion[];
  busqueda: string;
}

export interface LogEntry {
  id: string;
  ts: number;
  evento: NombreEvento;
  texto: string;
  operacionId: string | null;
  tipo: 'evento' | 'sistema';
}

/** Los 8 indicadores que nombra el insumo (línea 93) + conteos operativos. */
export interface MetricaKPI {
  total: number;
  activas: number;
  cerradas: number;
  canceladas: number;
  escaladas: number;
  esperaDatos: number;
  enTransito: number;
  conNovedad: number;
  enRiesgoSLA: number;
  respuestaClienteMin: number;
  respuestaTransportadorMin: number;
  pctConfirmacionesAutomaticas: number;
  pctLlamadasExitosas: number;
  negociacionesCompletadas: number;
  pctNegociacionesCompletadas: number;
  contactosPorOperacion: number;
  anticipacionNovedadesMin: number;
  pctCumplimientoCompromisos: number;
  satisfaccion: number;
}

export interface CanalMetrics {
  canal: Canal;
  total: number;
  activas: number;
  cerradas: number;
  escaladas: number;
  pctAutomatico: number;
  contactosPorOperacion: number;
}
