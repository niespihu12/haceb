// ============================================================================
// Pestaña «Agentes» · Haceb · Coordinación logística
//
// Un equipo de 12 agentes ejecuta y revisa el proceso de procesoData.ts:
// 17 etapas, esperas, estados de fin, categorías de decisión, novedades,
// reglas Rnn. La unidad de trabajo es la Operación del simulador; cada caso
// guarda su trayectoria real calculada con motor.transicionar().
// ============================================================================

import type {
  Alternativa,
  AgenteIA,
  Canal,
  CategoriaDecision,
  Compromiso,
  DecisionHumana,
  EstadoOferta,
  EtapaOperacion,
  Excepcion,
  ObjetivoLlamada,
  Operacion,
  ResultadoLlamada,
  TipoExcepcion,
} from './index';

/* ─── Agentes: 12 puestos sobre las 3 familias de IA del insumo (P42) ─── */
export type AgenteId =
  | 'receptor'      // [1] Solicitud
  | 'validador'     // [2] Validación
  | 'planeador'     // [3] Planeación
  | 'buscador'      // [4] Búsqueda
  | 'negociador'    // [5] Negociación
  | 'asignador'     // [6]+[7] Selección y asignación
  | 'confirmador'   // [8]+[9] Doble confirmación y preventivas
  | 'origen'        // [10]+[11] Presentación y cargue
  | 'seguimiento'   // [12] Tránsito
  | 'destino'       // [13]+[14]+[15] Aviso, descargue y validación de entrega
  | 'cierre'        // [16]+[17] Llamada de cierre y cierre administrativo
  | 'torre';        // Trazabilidad transversal (expediente e historial)

/** Ventanas del escritorio RPA (nombres funcionales; el insumo no nombra productos). */
export type SistemaId =
  | 'canal'        // Bandeja de solicitudes (4 canales)
  | 'voz'          // Consola de voz del agente de IA
  | 'plataforma'   // Plataforma de coordinación: ficha de operación y comparativo de ofertas
  | 'proveedores'  // Base de proveedores + hoja de negociación
  | 'agenda'       // Agenda centralizada de llamadas
  | 'revision'     // Revisiones: listas de chequeo y cruces
  | 'tablero'      // Tablero de seguimiento en ruta
  | 'mesa'         // Mesa del coordinador (pantalla de la persona)
  | 'expediente';  // Expediente e historial

export type VentanaId = SistemaId;

export type FamiliaAgente = AgenteIA | 'Sistema';

export interface AgenteDef {
  id: AgenteId;
  nombre: string;
  rol: string;
  /** Etapa(s) del flujo que ejecuta. */
  etapa: string;
  familia: FamiliaAgente;
  sistema: SistemaId;
  sistemas: SistemaId[];
  color: string;
  descripcion: string;
}

/* ─── Plan de ejecución de un caso ─── */
export type TipoPaso = 'accion' | 'espera_humana' | 'espera_sistema';

export interface Humano {
  nombre: string;
  rol: string;
  area: string;
  color?: string;
  firmaId?: 'f1' | 'f2' | 'f3';
}

/* ─── Escritorio RPA: guion de interfaz por paso ─── */
export type Vista =
  | 'canal.bandeja'
  | 'voz.consola'
  | 'plataforma.operacion' | 'plataforma.seleccion'
  | 'proveedores.base' | 'proveedores.negociacion'
  | 'agenda.central'
  | 'revision.datos' | 'revision.documentos' | 'revision.cruzada' | 'revision.cargue' | 'revision.entrega' | 'revision.cierre'
  | 'tablero.seguimiento'
  | 'mesa.paquete'
  | 'expediente.expediente';

export type ActorUI = 'agente' | 'humano';
export type TipoAccionUI =
  | 'ventana' | 'mover' | 'clic' | 'clicDerecho' | 'teclear' | 'pegar' | 'tecla' | 'dialogo'
  | 'toast' | 'estado' | 'resaltar' | 'scroll' | 'barrido' | 'firmar' | 'arrastrar';
export type NivelUI = 'ok' | 'aviso' | 'error' | 'info';

export interface DialogoUI {
  tipo: 'confirmar' | 'progreso' | 'error' | 'info' | 'menu' | 'token' | 'firma';
  titulo: string;
  /** Admite «{cuenta}» → contador regresivo 30→0 s según progresoAccion. */
  cuerpo?: string;
  /** Anclas automáticas dlg.btn.<slug>. */
  botones?: string[];
  regla?: string;
  /** 'menu': opciones; 'progreso': una barra por item. */
  items?: string[];
  /** 'token' (6) / 'firma' (4 = PIN). */
  casillas?: number;
  /** Etiqueta de un campo de texto dentro del diálogo (ancla dlg.campo.<slug>). */
  campo?: string;
}

export interface AccionUI {
  /** Inicio (0–1 del paso). */
  t: number;
  /** Fin; por defecto: tecla t+0.06, toast/estado t+0.25, clic t+0.05, resto hasta el fin del paso. */
  hasta?: number;
  tipo: TipoAccionUI;
  /** Destino del cursor / campo objetivo; 'arrastrar' usa ancla (origen) + destino. */
  ancla?: string;
  destino?: string;
  /** teclear/pegar (valor), toast/estado (mensaje), resaltar (etiqueta). */
  texto?: string;
  tecla?: string;
  dialogo?: DialogoUI;
  /** tipo 'ventana'. */
  vista?: Vista;
  /** Por defecto 'agente'. */
  actor?: ActorUI;
  /** Teclear con «●». */
  mascara?: boolean;
  nivel?: NivelUI;
  /** 'scroll' en visores de texto (índices de línea). */
  desde?: number;
  hastaLinea?: number;
}

/* ─── Escenarios y escenas ─── */
/**
 * Escenario de un caso: flujo normal (selección automática o manual), una de
 * las 17 novedades del catálogo, la cancelación del servicio (R28) o la
 * consulta entrante del cliente (R20).
 */
export type Escenario = 'feliz' | 'feliz_manual' | TipoExcepcion | 'cancelada' | 'consulta_entrante';

export interface OpcionesCaso {
  canal?: Canal;
  escenario?: Escenario;
}

export interface Escena {
  id: string;
  etiqueta: string;
  sinopsis: string;
  canal?: Canal;
  escenario: Escenario;
  /** Categoría de decisión esperada y regla/política que aplica (texto corto). */
  categoria?: CategoriaDecision;
  regla?: string;
  /** Con qué estado de fin termina. */
  fin: 'Cerrada' | 'Cancelada';
}

export interface PasoPlan {
  id: string;
  texto: string;
  duracion: number;
  tipo?: TipoPaso;
  resultado?: string;
  ok?: boolean;
  regla?: string;
  sistema?: SistemaId;
  bitacora?: string;
  /** Estado global de la operación que cambia al iniciar el paso. */
  estado?: EtapaOperacion;
  /** Índice de `datos.trayectoria` que se publica al pipeline al iniciar el paso. */
  snapshot?: number;
  humano?: Humano;
  termina?: 'cancelada';
  /** Guion de interfaz (escritorio RPA): pantalla abierta, acciones del cursor y pensamiento del agente. */
  vista?: Vista;
  ui?: AccionUI[];
  pensamiento?: string;
}

export interface EtapaPlan {
  agente: AgenteId;
  pasos: PasoPlan[];
}

/* ─── Datos sintéticos que ven las pantallas ─── */

/** Cómo llegó la solicitud por su canal (lo que muestra la bandeja). */
export interface Solicitud {
  canal: Canal;
  /** Persona o sistema que envía. */
  remitente: string;
  remitenteContacto: string;
  /** Referencia del cliente (su número de solicitud o pedido). */
  referenciaCliente: string;
  asunto: string;
  /** Resumen de lo solicitado (ruta, mercancía, fecha de cargue). */
  resumen: string;
  /** Representación cruda para la ficha: líneas del formulario, JSON de la integración o notas del coordinador. */
  crudo: string[];
}

export interface TurnoLlamada {
  quien: 'agente' | 'otro';
  texto: string;
  /** false = el dato es una estimación (R19): se rotula como tal. */
  confirmada?: boolean;
}

/** Una llamada del agente de IA: lo que ve la consola de voz. */
export interface DialogoLlamada {
  clave: string;
  objetivo: ObjetivoLlamada;
  interlocutor: 'cliente' | 'transportador' | 'destinatario';
  nombre: string;
  telefono: string;
  agente: AgenteIA;
  sentido: 'saliente' | 'entrante';
  turnos: TurnoLlamada[];
  resultado: ResultadoLlamada;
  resumen: string;
}

/** Ítem de una lista de chequeo o revisión. */
export interface ItemRevision {
  id: string;
  etiqueta: string;
  valor: string;
  ok: boolean;
  regla?: string;
  /** Novedad del catálogo que dispara si falla. */
  excepcion?: TipoExcepcion;
}

export interface LadoCruce {
  fuente: string;
  afirma: string;
}

/** Validación cruzada: lo que reporta una parte frente a lo que observa la otra. */
export interface Cruce {
  titulo: string;
  transportador: LadoCruce;
  cliente: LadoCruce;
  coincide: boolean;
  detalle: string;
}

export interface RondaNegociacion {
  transportadorId: string;
  transportador: string;
  vehiculo: string;
  telefono: string;
  tarifaOfrecida: number;
  contrapropuesta: number;
  tarifaFinal: number | null;
  estado: EstadoOferta;
  compatibilidad: number;
  cumplimiento: number;
}

export interface TareaAgenda {
  id: string;
  /** Hora simulada (ms) de la tarea. */
  hora: number;
  objetivo: ObjetivoLlamada;
  interlocutor: string;
  actividad: string;
  estado: 'pendiente' | 'hecha' | 'reprogramada';
}

export interface FilaSeguimiento {
  operacion: string;
  cliente: string;
  ruta: string;
  vehiculo: string;
  estado: string;
  eta: string;
  /** false = la ETA es una estimación. */
  confirmada: boolean;
  propia: boolean;
}

export interface DecisionCaso {
  humano: Humano;
  decision: DecisionHumana;
  alternativa: 'A' | 'B' | 'C' | 'D' | null;
  /** Alternativa que finalmente se aplicó (recomendada o elegida). */
  aplicada: Alternativa | null;
}

export interface DatosCaso {
  /** Snapshots de la operación tras cada transición del motor; el índice 0 es la operación recibida. */
  trayectoria: Operacion[];
  solicitud: Solicitud;
  /** Diálogos de las llamadas del caso por clave (recibir, completar, planeacion, negociar_0…, ver agentesData). */
  dialogos: Record<string, DialogoLlamada>;
  datosMinimos: ItemRevision[];
  documentos: ItemRevision[];
  negociacion: RondaNegociacion[];
  cruceLlegada: Cruce;
  cargue: ItemRevision[];
  cruceEntrega: Cruce;
  cierreAdmin: ItemRevision[];
  agenda: TareaAgenda[];
  tablero: FilaSeguimiento[];
  /** Novedad principal del caso (la del paquete de decisión), si la hubo. */
  excepcion: Excepcion | null;
  decision: DecisionCaso | null;
  compromisos: Compromiso[];
  expediente: { numero: string; hash: string };
  sesion: { usuario: string; servidor: string; terminal: string; vm: string };
  /** Año calendario de la operación. */
  anio: number;
}

/* ─── Estado vivo de un caso ─── */
export type EstadoCaso = 'en_cola' | 'procesando' | 'esperando' | 'terminada';
export type ResultadoCaso = 'cerrada' | 'cancelada';

export interface PasoHecho {
  ok: boolean;
  resultado?: string;
  t: number;
}

export interface Caso {
  id: string;
  seq: number;
  /** Snapshot vigente de la operación (el último publicado al pipeline). */
  operacion: Operacion;
  canal: Canal;
  datos: DatosCaso;
  escenario: Escenario;
  plan: EtapaPlan[];
  etapaIdx: number;
  pasoIdx: number;
  restante: number;
  estado: EstadoCaso;
  resultado?: ResultadoCaso;
  recibidoEn: number;
  terminadoEn?: number;
  tiemposEtapa: Partial<Record<AgenteId, { inicio: number; fin?: number }>>;
  pasosHechos: Record<string, PasoHecho>;
  excepciones: number;
  ultimoEvento: number;
  /** Etiqueta de la escena elegida por el Director de escena (si la hubo). */
  escenaForzada?: string;
}

export interface EntradaBitacora {
  id: number;
  t: number;
  agente: AgenteId;
  casoId: string;
  numero: string;
  mensaje: string;
  sistema?: SistemaId;
  nivel: 'info' | 'ok' | 'aviso' | 'error' | 'handoff';
  regla?: string;
}

export interface EstadoAgente {
  id: AgenteId;
  activo: string | null;
  cola: string[];
  procesadas: number;
  ocupadoMs: number;
  ultimaAccion: string;
}

export interface Snapshot {
  version: number;
  ahora: number;
  relojSim: number;
  velocidad: number;
  casos: Caso[];
  agentes: Record<AgenteId, EstadoAgente>;
  bitacora: EntradaBitacora[];
  focoId: string | null;
  autoSeguir: boolean;
  corriendo: boolean;
  handoffs: { id: number; de: AgenteId; a: AgenteId; numero: string; t: number }[];
  stats: {
    recibidos: number;
    terminados: number;
    cerradas: number;
    canceladas: number;
    /** Cerradas sin intervención humana (straight-through). */
    stp: number;
    escalados: number;
    excepciones: number;
    cicloPromedioMs: number;
    accionesTotales: number;
  };
}
