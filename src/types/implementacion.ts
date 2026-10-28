// ============================================================================
// Modelo generico de la "Ruta de implementacion" de una solucion.
//
// Es independiente del proceso que se automatiza: cualquier simulador de la
// familia describe su implementacion con estas cinco fases (Ingesta,
// Extraccion, Validacion, Clasificacion y destino, Registro/cierre/aviso) y
// el componente <RutaImplementacion/> lo renderiza sin cambios.
//
// Reglas del modelo:
//  - Las fases son secuenciales: una fase no inicia hasta que la anterior
//    queda certificada (todos los criterios de su habilitador cumplidos).
//  - Cada fase tiene prerrequisitos (credenciales, APIs, accesos, puertos,
//    fuentes...). Algunos son bloqueantes ("stoppers"): de proyecto (impiden
//    iniciar el proyecto) o de fase (impiden iniciar o certificar la fase).
//  - El tiempo NO se escribe a mano: se calcula con las actividades tecnicas
//    de la fase mas el impacto de cada prerrequisito que no esta disponible.
//    Se puede ajustar, pero cada ajuste exige una justificacion registrada.
//  - Aqui no van KPIs ni estadisticas de la operacion: eso vive en el
//    Dashboard y en la Control Tower.
// ============================================================================

/** Las cinco fases de la implementacion, en orden. */
export type CapaId = 'ingesta' | 'extraccion' | 'validacion' | 'clasificacion' | 'registro';

/** Estado de un prerrequisito segun el levantamiento con el cliente. */
export type EstadoPrerrequisito =
  | 'disponible'          // listo para usarse
  | 'pendiente'           // definido, pero aun no se entrega
  | 'requiere_validacion' // existe, pero hay que confirmarlo
  | 'no_disponible';      // no existe o no esta definido

/** Que clase de insumo es el prerrequisito. */
export type TipoPrerrequisito =
  | 'informacion'     // definiciones, contactos, muestras
  | 'credencial'      // usuarios tecnicos, tokens, certificados
  | 'acceso'          // buzones, numeros, cuentas
  | 'api'             // API o servicio habilitado y documentado
  | 'integracion'     // punto de entrada o salida con otro sistema
  | 'conectividad'    // puertos, firewall, VPN, lista blanca de IP
  | 'infraestructura' // servidores, ambientes, stack
  | 'fuente'          // fuentes de informacion y maestros de datos
  | 'documentacion'
  | 'regla';          // reglas de negocio, matrices, limites

/** Quien debe proporcionarlo. */
export type ResponsablePrerrequisito = 'cliente' | 'aion' | 'ambos';

/**
 * Prerrequisito bloqueante ("stopper"):
 *  - 'proyecto': mientras no este disponible, el proyecto no puede iniciar.
 *  - 'fase': mientras no este disponible, la fase no puede iniciar ni certificarse.
 */
export type AlcanceBloqueo = 'proyecto' | 'fase';

/** Dias habiles que suma un prerrequisito a su fase mientras no este disponible. */
export interface ImpactoPrerrequisito {
  pendiente: number;
  validacion: number;
}

// ---------------------------------------------------------------------------
// Subproceso: como se conecta / configura un elemento, con una simulacion
// pequena paso a paso (RPA, API, EDI, conector, agente IA...).
// ---------------------------------------------------------------------------

export type MecanismoSubproceso = 'RPA' | 'API' | 'EDI' | 'Conector' | 'Agente IA' | 'Manual';

export type ActorPaso = 'RPA' | 'Sistema' | 'Agente' | 'Persona' | 'Cliente';

export interface PasoSubproceso {
  id: string;
  titulo: string;
  detalle: string;
  actor: ActorPaso;
  /** Evidencia o resultado que deja el paso al ejecutarse (se muestra en la bitacora). */
  evidencia: string;
  /** Duracion simulada del paso, en segundos (solo para la animacion y la bitacora). */
  segundos: number;
}

export interface Subproceso {
  titulo: string;
  mecanismo: MecanismoSubproceso;
  descripcion: string;
  pasos: PasoSubproceso[];
  resultado: string;
}

export interface Prerrequisito {
  id: string;
  /** Etiqueta corta para la caja del diagrama (si falta, se deriva del texto). */
  etiqueta?: string;
  texto: string;
  tipo: TipoPrerrequisito;
  responsable: ResponsablePrerrequisito;
  /** Estado inicial del levantamiento. */
  estado: EstadoPrerrequisito;
  /** Si es un stopper y de que alcance. */
  bloqueante?: AlcanceBloqueo;
  /** Sobrescribe el impacto por defecto del tipo. */
  impacto?: ImpactoPrerrequisito;
  /** Como se conecta o configura este elemento (opcional). */
  subproceso?: Subproceso;
}

/** Clase de trabajo tecnico que realiza el equipo de implementacion. */
export type TipoActividad =
  | 'levantamiento'
  | 'infraestructura'
  | 'conectividad'
  | 'configuracion'
  | 'integracion'
  | 'datos'
  | 'pruebas'
  | 'certificacion';

export interface ActividadTecnica {
  id: string;
  texto: string;
  tipo: TipoActividad;
  /** Esfuerzo en dias habiles, en condiciones de camino feliz (todo disponible). */
  dias: number;
  /** Puede sacarse del alcance (p. ej. un canal que no entra al piloto). */
  opcional?: boolean;
  /** Si es opcional: si arranca incluida en el alcance. Por defecto, si. */
  incluidaPorDefecto?: boolean;
  /** Prerrequisitos que necesita para ejecutarse (referencia informativa). */
  requiere?: string[];
}

/** Un criterio que certifica que la fase quedo terminada. */
export interface CriterioHabilitador {
  id: string;
  texto: string;
  /** Estado inicial del levantamiento. */
  cumplido?: boolean;
}

export interface Habilitador {
  /** Condicion que declara la fase terminada. */
  condicion: string;
  /** Todos deben cumplirse para certificar la fase y habilitar la siguiente. */
  criterios: CriterioHabilitador[];
}

export interface CapaImplementacion {
  id: CapaId;
  numero: number;
  nombre: string;
  /** Verbo corto para la tarjeta del flujo. */
  resumen: string;
  objetivo: string;
  prerrequisitos: Prerrequisito[];
  /** Trabajo tecnico real de la fase; su suma es el tiempo de camino feliz. */
  actividades: ActividadTecnica[];
  habilitador: Habilitador;
  resultado: string;
}

export interface ProcesoImplementacion {
  id: string;
  nombre: string;
  descripcion: string;
  capas: CapaImplementacion[];
  /** Se muestra siempre junto a los tiempos. */
  aclaracionTiempos: string;
  /** Condiciones adicionales que afectan el tiempo y la promesa de entrega/configuracion. */
  notasTiempo: string[];
  /** Texto que explica que es el Discovery. */
  descripcionDiscovery: string;
}

// ---------------------------------------------------------------------------
// Levantamiento editable (se persiste) y estados derivados (no se persisten)
// ---------------------------------------------------------------------------

/** Ajuste manual del tiempo de una fase: siempre con su justificacion. */
export interface AjusteTiempo {
  id: string;
  /** Dias habiles que suma (positivo) o resta (negativo). */
  dias: number;
  justificacion: string;
  autor: string;
  /** ISO 8601. */
  fecha: string;
  /** Un ajuste no se borra: se anula y queda en el historial. */
  anulado?: { por: string; fecha: string };
}

export interface EstadoFaseEditable {
  prerrequisitos: Record<string, EstadoPrerrequisito>;
  criterios: Record<string, boolean>;
  /** Actividades opcionales dentro (true) o fuera (false) del alcance. */
  actividades: Record<string, boolean>;
  ajustes: AjusteTiempo[];
}

export interface EstadoLevantamiento {
  /** Fecha de inicio del proyecto (AAAA-MM-DD). */
  inicio: string;
  capas: Record<CapaId, EstadoFaseEditable>;
}

export type EstadoCapa =
  | 'completada'  // todos los criterios del habilitador certificados
  | 'en_espera'   // la fase anterior aun no esta certificada
  | 'bloqueada'   // hay stoppers (de proyecto o de fase) sin resolver
  | 'discovery'   // puede iniciar, pero hay prerrequisitos sin definir
  | 'en_curso'    // iniciada: algunos criterios ya certificados
  | 'lista';      // puede iniciar: anterior certificada y sin stoppers
