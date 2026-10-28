// ============================================================================
// procesoData.ts — transcripción 1:1 del insumo (docs/proceso.txt)
//
// Todo lo que aquí se afirma sale del documento: el texto original vive en
// procesoTexto.ts (un elemento por párrafo) y cada constante cita el párrafo
// de origen en `p` (P1…P49). Lo que el documento NO trae se marca con
// `supuesto: true` y se muestra en la UI como «supuesto de diseño».
// ============================================================================

import { P, PP } from './procesoTexto';
import type {
  BloqueFlujo,
  CategoriaDecision,
  Canal,
  EtapaFlujo,
  RolId,
  SistemaId,
  TipoExcepcion,
} from '@/types';

// --- Encabezado del documento -----------------------------------------------

export const DOC_FRAMEWORK = 'Haceb · Coordinación logística';
export const DOC_KICKER = 'Proceso end-to-end · de la solicitud a la confirmación final';
export const DOC_TITULO = 'Gestión integral de la comunicación y coordinación con transportadores y clientes mediante agentes de inteligencia artificial';
export const DOC_VERSION = 'Fuente: proceso.txt · simulador v0.1';
export const DOC_PIE = 'Haceb · Coordinación logística con agentes de IA · simulador de demostración (operación simulada)';

// --- 1. Objetivo y alcance ---------------------------------------------------

export const OBJETIVO_TEXTO = P(1);
export const PROPOSITO_TEXTO = [P(48), P(49)];

export const ALCANCE_INICIO = 'Recepción de una solicitud de transporte realizada por el cliente: movilizar una mercancía desde un origen hasta un destino.';
export const ALCANCE_INICIO_P = 2;
export const ALCANCE_FIN = 'Coordinación permanente desde la solicitud inicial hasta la confirmación final del servicio, con cierre administrativo solo después de las validaciones correspondientes.';
export const ALCANCE_FIN_P = [38, 49];

export interface EstadoFinDef {
  id: 'Cerrada' | 'Cancelada';
  nombre: string;
  descripcion: string;
  p: number;
  supuesto: boolean;
}

export const ESTADOS_FIN: EstadoFinDef[] = [
  {
    id: 'Cerrada',
    nombre: 'Cerrada (cierre administrativo)',
    descripcion: 'Servicio confirmado por ambas partes, documentación final, condiciones económicas, costos adicionales y novedades validados.',
    p: 38,
    supuesto: false,
  },
  {
    id: 'Cancelada',
    nombre: 'Cancelada',
    descripcion: 'El documento nombra «cancelar un servicio» como decisión que requiere al responsable; no define un estado final con ese nombre.',
    p: 43,
    supuesto: true,
  },
];

export const FUERA_DE_ALCANCE =
  'El documento no declara exclusiones. Queda fuera del simulador todo lo que no se describe: facturación, pagos al transportador y reglas tarifarias reales.';

// --- 2. Canales de entrada ----------------------------------------------------

export interface CanalDef {
  id: Canal;
  nombre: string;
  corto: string;
  descripcion: string;
  color: string;
  p: number;
}

export const CANALES_DEF: CanalDef[] = [
  { id: 'llamada_ia', nombre: 'Llamada atendida por IA', corto: 'LLAMADA', descripcion: 'El agente atiende al cliente, identifica la empresa y la persona, consulta las características y recopila la información.', color: '#7c3aed', p: 3 },
  { id: 'formulario', nombre: 'Formulario', corto: 'FORM', descripcion: 'El cliente diligencia la solicitud de transporte.', color: '#2563eb', p: 2 },
  { id: 'integracion', nombre: 'Integración con sistemas del cliente', corto: 'INTEGR.', descripcion: 'La solicitud llega desde los sistemas del cliente.', color: '#0d9488', p: 2 },
  { id: 'coordinador', nombre: 'Registro del coordinador logístico', corto: 'COORD.', descripcion: 'El coordinador registra la operación manualmente.', color: '#d97706', p: 2 },
];

/** Datos mínimos de la solicitud (párrafo 3). */
export const DATOS_MINIMOS = [
  'Origen',
  'Destino',
  'Tipo de mercancía',
  'Peso',
  'Volumen',
  'Características del vehículo',
  'Fecha y hora requerida para el cargue',
  'Condiciones de entrega',
  'Requisito especial',
];
export const DATOS_MINIMOS_P = 3;

// --- 3. Flujo end-to-end -------------------------------------------------------

export interface BloqueDef {
  id: BloqueFlujo;
  nombre: string;
  color: string;
  colorBg: string;
  descripcion: string;
}

/** La agrupación en bloques de color es VISUAL; no existe en el documento. */
export const BLOQUES: BloqueDef[] = [
  { id: 'Solicitud', nombre: 'Solicitud y planeación', color: '#2563eb', colorBg: '#eaf1ff', descripcion: 'Recibir, validar y registrar la operación' },
  { id: 'Consecucion', nombre: 'Consecución del vehículo', color: '#0d9488', colorBg: '#e5f6f3', descripcion: 'Buscar, negociar, seleccionar y asignar' },
  { id: 'Cargue', nombre: 'Confirmación y cargue', color: '#d97706', colorBg: '#fdf1e0', descripcion: 'Doble confirmación, preventivas, presentación y cargue' },
  { id: 'Transito', nombre: 'Tránsito y entrega', color: '#7c3aed', colorBg: '#f2ecfd', descripcion: 'Monitoreo, aviso de destino, descargue y validación' },
  { id: 'Cierre', nombre: 'Cierre y mejora', color: '#0891b2', colorBg: '#e0f4f9', descripcion: 'Llamada de cierre y cierre administrativo' },
  { id: 'Novedad', nombre: 'Esperas y salidas', color: '#e11d48', colorBg: '#fdeaf0', descripcion: 'Esperando datos, escalada al coordinador, cancelada' },
];

export interface EtapaDef {
  id: EtapaFlujo;
  numero: number;
  nombre: string;
  corto: string;
  bloque: BloqueFlujo;
  /** Párrafos del insumo que describen la etapa. */
  p: number[];
  /** Qué hace la etapa, con las palabras del documento. */
  resumen: string;
  /** Agente de IA que la conduce (insumo, P42: negociación · cliente · seguimiento). */
  agente: 'Agente de cliente' | 'Agente de negociación' | 'Agente de seguimiento' | 'Sistema';
}

export const FLUJO_ETAPAS: EtapaDef[] = [
  { id: 'Solicitud', numero: 1, nombre: 'Recepción de la solicitud', corto: 'Solicitud', bloque: 'Solicitud', p: [2, 3], agente: 'Agente de cliente', resumen: 'El cliente informa la necesidad de movilizar una mercancía; llega por llamada, formulario, integración o registro del coordinador.' },
  { id: 'Validacion', numero: 2, nombre: 'Validación de la solicitud', corto: 'Validación', bloque: 'Solicitud', p: [4], agente: 'Agente de cliente', resumen: 'El sistema valida que la información sea suficiente; ante inconsistencias el agente llama de nuevo al cliente.' },
  { id: 'Planeacion', numero: 3, nombre: 'Registro y planeación logística', corto: 'Planeación', bloque: 'Solicitud', p: [5], agente: 'Agente de cliente', resumen: 'Se registra la operación con identificador único y se confirman con el contacto autorizado cargue, acceso y horarios.' },
  { id: 'Busqueda', numero: 4, nombre: 'Búsqueda de transportadores', corto: 'Búsqueda', bloque: 'Consecucion', p: [6], agente: 'Sistema', resumen: 'Se consulta la base de proveedores y se seleccionan los candidatos más compatibles.' },
  { id: 'Negociacion', numero: 5, nombre: 'Negociación con transportadores', corto: 'Negociación', bloque: 'Consecucion', p: [7, 8, 9, 10], agente: 'Agente de negociación', resumen: 'El agente llama a los candidatos, informa la tarifa y recibe contrapropuestas dentro de los límites autorizados.' },
  { id: 'Seleccion', numero: 6, nombre: 'Consolidación y selección', corto: 'Selección', bloque: 'Consecucion', p: [11], agente: 'Sistema', resumen: 'Se consolidan las ofertas; el coordinador elige o la plataforma selecciona automáticamente si las políticas lo permiten.' },
  { id: 'Asignacion', numero: 7, nombre: 'Validación documental y asignación', corto: 'Asignación', bloque: 'Consecucion', p: [12], agente: 'Sistema', resumen: 'Se validan los documentos para prestar el servicio y se formaliza la asignación.' },
  { id: 'Confirmacion', numero: 8, nombre: 'Doble confirmación', corto: 'Confirmación', bloque: 'Cargue', p: [13, 14], agente: 'Agente de cliente', resumen: 'El agente informa al cliente la asignación y confirma con el transportador, para que ambos tengan la misma información.' },
  { id: 'Preventiva', numero: 9, nombre: 'Llamadas preventivas', corto: 'Preventivas', bloque: 'Cargue', p: [15, 16, 17], agente: 'Agente de seguimiento', resumen: 'Antes del cargue se llama a ambas partes: disponibilidad, ubicación, tiempo de llegada, mercancía preparada.' },
  { id: 'Presentacion', numero: 10, nombre: 'Presentación en origen', corto: 'Presentación', bloque: 'Cargue', p: [18, 19, 20], agente: 'Agente de seguimiento', resumen: 'Se verifica la presentación del transportador y se valida de forma cruzada con el cliente.' },
  { id: 'Cargue', numero: 11, nombre: 'Cargue y despacho', corto: 'Cargue', bloque: 'Cargue', p: [21, 22], agente: 'Agente de seguimiento', resumen: 'Seguimiento del cargue, hora real de salida y confirmación del despacho con el cliente.' },
  { id: 'Transito', numero: 12, nombre: 'Monitoreo en tránsito', corto: 'Tránsito', bloque: 'Transito', p: [23, 24, 25, 26], agente: 'Agente de seguimiento', resumen: 'Llamadas programadas al transportador: estado, ubicación, novedades y hora estimada de llegada.' },
  { id: 'AvisoDestino', numero: 13, nombre: 'Aviso de llegada al destino', corto: 'Aviso destino', bloque: 'Transito', p: [30, 31], agente: 'Agente de cliente', resumen: 'Al aproximarse la llegada se confirma con el destinatario que está preparado para recibir.' },
  { id: 'Descargue', numero: 14, nombre: 'Llegada y descargue', corto: 'Descargue', bloque: 'Transito', p: [32, 33], agente: 'Agente de seguimiento', resumen: 'Se registra la llegada y se hace seguimiento hasta confirmar que la mercancía fue recibida.' },
  { id: 'ValidacionEntrega', numero: 15, nombre: 'Validación de la entrega', corto: 'Validación entrega', bloque: 'Transito', p: [34, 35], agente: 'Agente de cliente', resumen: 'Se cruza lo informado por el transportador con lo confirmado por el cliente; si difieren, no se cierra.' },
  { id: 'LlamadaCierre', numero: 16, nombre: 'Llamada de cierre al cliente', corto: 'Llamada cierre', bloque: 'Cierre', p: [36, 37], agente: 'Agente de cliente', resumen: 'Se confirma el servicio, se recogen observaciones y calidad; una inconformidad se convierte en caso de seguimiento.' },
  { id: 'CierreAdmin', numero: 17, nombre: 'Cierre administrativo', corto: 'Cierre admin.', bloque: 'Cierre', p: [38], agente: 'Sistema', resumen: 'Se verifican documentación final, condiciones económicas, costos adicionales y novedades; luego se cierra.' },
];

/** Otros párrafos del flujo que no son una etapa: contactos entrantes (P27–P29). */
export const CONTACTOS_ENTRANTES = [
  { id: 'cliente', nombre: 'Consulta entrante del cliente', p: 27, texto: P(27) },
  { id: 'fuera', nombre: 'Información o decisión fuera de las atribuciones', p: 28, texto: P(28) },
  { id: 'transportador', nombre: 'Contacto entrante del transportador', p: 29, texto: P(29) },
];

export const FLUJO_ASCII = `
 SOLICITUD ─▶ VALIDACIÓN ─▶ PLANEACIÓN ─▶ BÚSQUEDA ─▶ NEGOCIACIÓN ─▶ SELECCIÓN ─▶ ASIGNACIÓN
 llamada IA   ¿completa?     ID único     base de      llamadas IA    coordinador   documentos
 formulario    │ no          contacto     proveedores   tarifa ≤ tope  o automática  validados
 integración   ▼             autorizado                  │ > tope
 coordinador  llamada IA                                 ▼
              al cliente                           COORDINADOR decide
                                                        │
 ┌────────────────────────────────────────────────────────┘
 ▼
 CONFIRMACIÓN ─▶ PREVENTIVAS ─▶ PRESENTACIÓN ─▶ CARGUE ─▶ TRÁNSITO ─▶ AVISO DESTINO
 cliente +       a ambas        validación      despacho  llamadas     destinatario
 transportador   partes         cruzada         confirmado programadas preparado
 misma info
                                                                          │
 CIERRE ADMIN ◀─ LLAMADA CIERRE ◀─ VALIDACIÓN ENTREGA ◀─ DESCARGUE ◀─────┘
 documentos,     satisfacción,     transportador vs.      recepción,
 costos,         inconformidad →   cliente: si difieren   diferencias
 novedades       caso seguimiento  NO se cierra → novedad

 Transversal: agenda centralizada · expediente · historial · coordinación entre agentes
`.trim();

// --- 4. Roles --------------------------------------------------------------------

export interface RolDef {
  id: RolId;
  nombre: string;
  descripcion: string;
  p: number[];
  /** Actor humano o agente. */
  tipo: 'externo' | 'interno' | 'agente';
}

export const ROLES: RolDef[] = [
  { id: 'cliente', nombre: 'Cliente', descripcion: 'Quien solicita la operación de transporte y recibe la información de avance.', p: [2, 9], tipo: 'externo' },
  { id: 'contacto', nombre: 'Contacto autorizado del cliente', descripcion: 'Persona con quien se validan cargue, acceso, horarios e instrucciones; solo él puede consultar el estado.', p: [5, 27], tipo: 'externo' },
  { id: 'destinatario', nombre: 'Destinatario / contacto de recepción', descripcion: 'Confirma preparación de instalaciones, horarios de descargue y recepción de la mercancía.', p: [30, 32, 33], tipo: 'externo' },
  { id: 'transportador', nombre: 'Transportador (conductor)', descripcion: 'Acepta el viaje, confirma disponibilidad, reporta ubicación, novedades, llegada y entrega.', p: [7, 14, 23], tipo: 'externo' },
  { id: 'coordinador', nombre: 'Coordinador logístico', descripcion: 'Recibe las novedades, revisa alternativas y selecciona; interviene cuando la IA activa la intervención humana.', p: [8, 11, 46], tipo: 'interno' },
  { id: 'responsable', nombre: 'Responsables de autorización', descripcion: 'Autorizan cambios comerciales, contractuales o económicos, tarifas, sobrecostos y cancelaciones.', p: [10, 43], tipo: 'interno' },
  { id: 'agente', nombre: 'Agentes de inteligencia artificial', descripcion: 'Tres agentes coordinados: negociación con transportadores, seguimiento y comunicación con el cliente.', p: [42], tipo: 'agente' },
];

// --- 5. Sistemas (funcionales; el documento no nombra productos) -----------------

export interface SistemaDef {
  id: SistemaId;
  nombre: string;
  tipo: 'plataforma' | 'agente' | 'datos' | 'integracion';
  descripcion: string;
  p: number[];
}

export const SISTEMAS: SistemaDef[] = [
  { id: 'plataforma', nombre: 'Plataforma de coordinación', tipo: 'plataforma', descripcion: 'Registra la operación con identificador único, valida, planea y consolida ofertas; puede seleccionar automáticamente.', p: [4, 5, 11] },
  { id: 'agenteCliente', nombre: 'Agente de IA · comunicación con el cliente', tipo: 'agente', descripcion: 'Atiende y realiza llamadas al cliente y al destinatario; consulta la misma información operativa que los demás agentes.', p: [3, 13, 42] },
  { id: 'agenteNegociacion', nombre: 'Agente de IA · negociación con transportadores', tipo: 'agente', descripcion: 'Llama a los candidatos, informa la tarifa y negocia dentro de los parámetros económicos; comparte el resultado con el seguimiento.', p: [7, 8, 42] },
  { id: 'agenteSeguimiento', nombre: 'Agente de IA · seguimiento de la operación', tipo: 'agente', descripcion: 'Llamadas preventivas, validación de presentación, monitoreo en tránsito y detección de novedades.', p: [15, 23, 42] },
  { id: 'baseProveedores', nombre: 'Base de proveedores (transportadores)', tipo: 'datos', descripcion: 'Ubicación, tipo de vehículo, capacidad, rutas habituales, historial de cumplimiento y condiciones comerciales.', p: [6] },
  { id: 'agenda', nombre: 'Agenda centralizada de llamadas y seguimientos', tipo: 'plataforma', descripcion: 'Cada contacto tiene objetivo específico y se vincula a una operación, un interlocutor y una actividad; evita consultas duplicadas.', p: [41, 44] },
  { id: 'expediente', nombre: 'Expediente e historial de la operación', tipo: 'datos', descripcion: 'Conserva solicitud, llamadas, transcripciones, grabaciones autorizadas, negociaciones, confirmaciones, novedades, compromisos y soportes; historial cronológico.', p: [39, 40] },
  { id: 'integracionCliente', nombre: 'Integración con los sistemas del cliente', tipo: 'integracion', descripcion: 'Una de las vías de entrada de la solicitud de transporte.', p: [2] },
  { id: 'integracionExterna', nombre: 'Integración con sistemas externos', tipo: 'integracion', descripcion: 'Una de las vías para confirmar la presentación del transportador en origen.', p: [18] },
  { id: 'vistaCentral', nombre: 'Visión centralizada de operaciones y comunicaciones', tipo: 'plataforma', descripcion: 'Pendientes de asignación, en negociación, confirmados, información pendiente, en tránsito y novedades que requieren atención.', p: [45, 46] },
];

// --- 6. Categorías de decisión -------------------------------------------------------

export interface CategoriaDef {
  id: CategoriaDecision;
  nombre: string;
  descripcion: string;
  ejemplos: string;
  p: number;
  supuesto: boolean;
}

export const CATEGORIA_DEF: Record<CategoriaDecision, CategoriaDef> = {
  automatico: {
    id: 'automatico',
    nombre: 'Informativa · se gestiona automáticamente',
    descripcion: 'Informar el estado de una operación, confirmar una hora de llegada o solicitar una actualización.',
    ejemplos: 'Estado, hora de llegada, actualización',
    p: 43,
    supuesto: false,
  },
  asistido: {
    id: 'asistido',
    nombre: 'Novedad · el agente propone, el coordinador decide',
    descripcion: 'Novedades que el agente registra y notifica al coordinador para que evalúe el impacto sobre la operación.',
    ejemplos: 'Mercancía no lista, retraso, diferencias, esperas',
    p: 16,
    supuesto: true,
  },
  humano: {
    id: 'humano',
    nombre: 'Decisión · requiere al responsable',
    descripcion: 'Modificar una tarifa, aprobar sobrecostos, cambiar condiciones contractuales, cancelar un servicio o asumir compromisos no autorizados.',
    ejemplos: 'Tarifa, sobrecostos, contrato, cancelación',
    p: 43,
    supuesto: false,
  },
};

// --- 7. Reglas de negocio (frase del documento + política) --------------------------------

export interface ReglaDef {
  id: string; // R01
  politica: string; // POL-XX-nn (el código de la política es propio; la regla es del documento)
  tema: string;
  texto: string;
  p: number;
  etapas: EtapaFlujo[];
}

export const REGLAS: ReglaDef[] = [
  { id: 'R01', politica: 'POL-VAL-01', tema: 'Validación', p: 4, etapas: ['Validacion'], texto: 'El sistema valida que la información sea suficiente; ante inconsistencias o datos incompletos, el agente puede comunicarse nuevamente con el cliente. La validación no depende exclusivamente de actividades manuales del coordinador.' },
  { id: 'R02', politica: 'POL-VAL-01', tema: 'Validación', p: 3, etapas: ['Solicitud', 'Validacion'], texto: 'Si el cliente no dispone de toda la información, el agente registra lo confirmado y programa una gestión posterior para completar los datos faltantes.' },
  { id: 'R03', politica: 'POL-REG-01', tema: 'Registro', p: 5, etapas: ['Planeacion'], texto: 'Cuando la solicitud está completa, se registra la operación con un identificador único y se inicia la planeación logística.' },
  { id: 'R04', politica: 'POL-REG-01', tema: 'Registro', p: 5, etapas: ['Planeacion'], texto: 'Se confirma con el contacto autorizado del cliente la disponibilidad de cargue, condiciones de acceso, horarios de atención e instrucciones especiales antes de buscar un transportador.' },
  { id: 'R05', politica: 'POL-BUS-01', tema: 'Búsqueda', p: 6, etapas: ['Busqueda'], texto: 'Se seleccionan los candidatos con mayor compatibilidad según ubicación, tipo de vehículo, capacidad, rutas habituales, historial de cumplimiento y condiciones comerciales.' },
  { id: 'R06', politica: 'POL-NEG-01', tema: 'Negociación', p: 8, etapas: ['Negociacion'], texto: 'La negociación se desarrolla dentro de los parámetros económicos establecidos por la empresa, sin superar los valores máximos autorizados.' },
  { id: 'R07', politica: 'POL-NEG-01', tema: 'Negociación', p: 8, etapas: ['Negociacion'], texto: 'Cuando el transportador solicita una tarifa superior al límite permitido, el agente presenta el resultado al coordinador, sin comprometer valores adicionales.' },
  { id: 'R08', politica: 'POL-AUT-01', tema: 'Autorización', p: 10, etapas: ['Negociacion'], texto: 'Cualquier modificación que implique un cambio comercial, contractual o económico queda sujeta a autorización de los responsables correspondientes.' },
  { id: 'R09', politica: 'POL-SEL-01', tema: 'Selección', p: 11, etapas: ['Seleccion'], texto: 'Cuando las políticas lo permitan, la plataforma puede seleccionar automáticamente si se cumplen los requisitos operativos, documentales y comerciales; si no, el coordinador revisa y selecciona.' },
  { id: 'R10', politica: 'POL-DOC-01', tema: 'Documentos', p: 12, etapas: ['Asignacion'], texto: 'Seleccionado el transportador, se validan los documentos necesarios para prestar el servicio antes de formalizar la asignación.' },
  { id: 'R11', politica: 'POL-CON-01', tema: 'Confirmación', p: 14, etapas: ['Confirmacion'], texto: 'Doble confirmación con cliente y transportador para garantizar que ambos tengan la misma información y evitar desplazamientos innecesarios y tiempos de espera.' },
  { id: 'R12', politica: 'POL-PRE-01', tema: 'Preventivas', p: 15, etapas: ['Preventiva'], texto: 'Antes de la fecha programada para el cargue se realizan llamadas preventivas a ambas partes: disponibilidad, ubicación y tiempo estimado de llegada; mercancía preparada, punto de cargue disponible, sin cambios.' },
  { id: 'R13', politica: 'POL-PRE-01', tema: 'Preventivas', p: 16, etapas: ['Preventiva'], texto: 'Si la mercancía no estará lista, el agente registra la novedad, consulta el nuevo tiempo estimado y notifica al coordinador; solo comunica al transportador una reprogramación previamente autorizada.' },
  { id: 'R14', politica: 'POL-AUT-01', tema: 'Retrasos', p: 17, etapas: ['Preventiva', 'Transito'], texto: 'Ante un posible retraso del transportador se consulta al cliente si hay margen de espera, sin confirmar cambios definitivos antes de contar con las autorizaciones correspondientes.' },
  { id: 'R15', politica: 'POL-CRU-01', tema: 'Validación cruzada', p: 19, etapas: ['Presentacion'], texto: 'Cuando el transportador informa su llegada se confirma con el cliente que el vehículo está en las instalaciones y fue autorizado su ingreso, para detectar diferencias entre lo reportado y lo observado.' },
  { id: 'R16', politica: 'POL-ESP-01', tema: 'Esperas', p: 20, etapas: ['Presentacion', 'Cargue'], texto: 'Si el vehículo espera por mercancía no disponible, congestión o inconveniente documental, la IA consulta causas y tiempo de solución; se notifica al coordinador cuando supera los parámetros establecidos.' },
  { id: 'R17', politica: 'POL-DES-01', tema: 'Despacho', p: 22, etapas: ['Cargue'], texto: 'Cuando existan diferencias en cantidades, condiciones de la carga, documentos o instrucciones, estas deben quedar registradas para su validación antes de continuar.' },
  { id: 'R18', politica: 'POL-SEG-01', tema: 'Seguridad del conductor', p: 24, etapas: ['Transito'], texto: 'El sistema verifica que el conductor esté en condiciones seguras para atender la llamada; si está conduciendo, el agente finaliza el contacto y lo programa para un momento seguro.' },
  { id: 'R19', politica: 'POL-COM-01', tema: 'Comunicación', p: 26, etapas: ['Transito'], texto: 'El agente debe diferenciar claramente entre información confirmada y estimaciones, evitando prometer horarios o soluciones que todavía no hayan sido validados.' },
  { id: 'R20', politica: 'POL-INF-01', tema: 'Consulta entrante', p: 27, etapas: ['Transito'], texto: 'En una llamada entrante el agente identifica al solicitante y valida su autorización para consultar la información antes de acceder al estado del servicio.' },
  { id: 'R21', politica: 'POL-AUT-01', tema: 'Atribuciones', p: 28, etapas: ['Transito'], texto: 'Si el cliente solicita información no disponible o una decisión que excede las atribuciones del agente, se genera una gestión para el coordinador o se transfiere a una persona cuando exista el mecanismo.' },
  { id: 'R22', politica: 'POL-AUT-01', tema: 'Destino', p: 31, etapas: ['AvisoDestino'], texto: 'Los cambios de horario, destino o condiciones de entrega deben seguir las autorizaciones definidas por la empresa.' },
  { id: 'R23', politica: 'POL-CIE-01', tema: 'Cierre', p: 35, etapas: ['ValidacionEntrega'], texto: 'Cuando existen diferencias entre lo informado por el transportador y lo confirmado por el cliente, el sistema no debe cerrar automáticamente la operación: genera una novedad para que el coordinador revise hechos y solicite evidencias.' },
  { id: 'R24', politica: 'POL-CIE-02', tema: 'Cierre', p: 37, etapas: ['LlamadaCierre'], texto: 'Cuando el cliente manifiesta una inconformidad, esta debe convertirse en un caso de seguimiento y no quedar registrada únicamente como un comentario.' },
  { id: 'R25', politica: 'POL-CIE-01', tema: 'Cierre', p: 38, etapas: ['CierreAdmin'], texto: 'Solo después de verificar documentación final, condiciones económicas negociadas, costos adicionales autorizados y novedades que afecten la liquidación se procede con el cierre administrativo.' },
  { id: 'R26', politica: 'POL-AGE-01', tema: 'Agenda', p: 41, etapas: [], texto: 'Cada contacto realizado por IA tiene un objetivo específico y está vinculado a una operación, un interlocutor y una actividad; al confirmarse información, las tareas relacionadas se actualizan para evitar consultas duplicadas.' },
  { id: 'R27', politica: 'POL-COO-01', tema: 'Coordinación entre agentes', p: 42, etapas: [], texto: 'El agente de negociación comparte los resultados de la asignación con el de seguimiento; el agente que habla con el cliente consulta la misma información operativa.' },
  { id: 'R28', politica: 'POL-AUT-01', tema: 'Autorización', p: 43, etapas: [], texto: 'Informar el estado, confirmar una hora de llegada o solicitar una actualización puede gestionarse automáticamente; modificar una tarifa, aprobar sobrecostos, cambiar condiciones contractuales, cancelar un servicio o asumir compromisos no autorizados requiere al responsable.' },
  { id: 'R29', politica: 'POL-CON-02', tema: 'Contactos no exitosos', p: 44, etapas: [], texto: 'Si el cliente o el transportador no responde, se registra el intento y se programa un nuevo contacto según la importancia de la actividad; si la falta de respuesta puede afectar el servicio, se genera una alerta para intervención humana.' },
  { id: 'R30', politica: 'POL-GRA-01', tema: 'Expediente', p: 39, etapas: [], texto: 'El expediente conserva las grabaciones cuando estén autorizadas y todas las transcripciones.' },
];

export const REGLA_POR_ID: Record<string, ReglaDef> = Object.fromEntries(REGLAS.map((r) => [r.id, r]));

/** Parámetros de las políticas. SUPUESTO: el documento dice «parámetros establecidos» sin cifras. */
export interface GuardrailDef {
  id: string;
  nombre: string;
  valor: string;
  politica: string;
  regla: string;
  descripcion: string;
  supuesto: true;
}

export const GUARDRAILS: GuardrailDef[] = [
  { id: 'G-TARIFA', nombre: 'Tope de tarifa autorizado', valor: 'Referencia de mercado + 8 %', politica: 'POL-NEG-01', regla: 'R06', descripcion: 'El agente nunca compromete una tarifa por encima del valor máximo autorizado.', supuesto: true },
  { id: 'G-CONTRA', nombre: 'Rondas de contrapropuesta', valor: '2 por transportador', politica: 'POL-NEG-01', regla: 'R06', descripcion: 'Número de contrapropuestas antes de escalar o descartar el candidato.', supuesto: true },
  { id: 'G-INTENTOS', nombre: 'Intentos de contacto antes de alerta', valor: '3 intentos', politica: 'POL-CON-02', regla: 'R29', descripcion: 'Al tercer intento sin respuesta sobre una actividad crítica se alerta al coordinador.', supuesto: true },
  { id: 'G-ESPERA', nombre: 'Espera en cargue que alerta al coordinador', valor: '90 min', politica: 'POL-ESP-01', regla: 'R16', descripcion: 'Parámetro «establecido» del documento, con cifra de ejemplo.', supuesto: true },
  { id: 'G-ANTICIPA', nombre: 'Anticipación de la llamada preventiva', valor: '24 h antes del cargue', politica: 'POL-PRE-01', regla: 'R12', descripcion: 'Momento en que se llama a ambas partes antes del cargue.', supuesto: true },
  { id: 'G-CONDUCTOR', nombre: 'Contacto con el conductor', valor: 'Solo si no conduce', politica: 'POL-SEG-01', regla: 'R18', descripcion: 'Si conduce, el agente cierra el contacto y reprograma.', supuesto: true },
  { id: 'G-PROMESA', nombre: 'Promesas al cliente', valor: 'Solo información confirmada', politica: 'POL-COM-01', regla: 'R19', descripcion: 'Las estimaciones se comunican como estimaciones.', supuesto: true },
  { id: 'G-SELECCION', nombre: 'Selección automática', valor: 'Requisitos operativos + documentales + comerciales', politica: 'POL-SEL-01', regla: 'R09', descripcion: 'Si no se cumplen los tres, selecciona el coordinador.', supuesto: true },
  { id: 'G-GRABA', nombre: 'Grabación de llamadas', valor: 'Solo con autorización', politica: 'POL-GRA-01', regla: 'R30', descripcion: 'Sin autorización queda la transcripción, no la grabación.', supuesto: true },
];

// --- 8. Excepciones y novedades ---------------------------------------------------------------

export interface ExcepcionDef {
  tipo: TipoExcepcion;
  nombre: string;
  /** Lo que dice el documento. */
  texto: string;
  p: number;
  regla: string;
  categoria: CategoriaDecision;
}

export const EXCEPCIONES_LISTA: ExcepcionDef[] = [
  { tipo: 'Datos_incompletos', nombre: 'Datos incompletos o inconsistentes', p: 4, regla: 'R01', categoria: 'automatico', texto: P(4) },
  { tipo: 'Sin_respuesta', nombre: 'Contacto no exitoso', p: 44, regla: 'R29', categoria: 'automatico', texto: P(44) },
  { tipo: 'Tarifa_sobre_tope', nombre: 'Tarifa solicitada sobre el límite', p: 8, regla: 'R07', categoria: 'humano', texto: P(8) },
  { tipo: 'Sin_transportador', nombre: 'Sin transportadores o mercado sobre lo previsto', p: 9, regla: 'R08', categoria: 'humano', texto: P(9) },
  { tipo: 'Seleccion_manual', nombre: 'Selección por el coordinador', p: 11, regla: 'R09', categoria: 'asistido', texto: P(11) },
  { tipo: 'Mercancia_no_lista', nombre: 'Mercancía no estará lista', p: 16, regla: 'R13', categoria: 'asistido', texto: P(16) },
  { tipo: 'Retraso_transportador', nombre: 'Transportador con dificultad de horario', p: 17, regla: 'R14', categoria: 'asistido', texto: P(17) },
  { tipo: 'Diferencia_llegada', nombre: 'Diferencia entre lo reportado y lo observado en origen', p: 19, regla: 'R15', categoria: 'asistido', texto: P(19) },
  { tipo: 'Espera_en_cargue', nombre: 'Vehículo esperando en el punto de cargue', p: 20, regla: 'R16', categoria: 'asistido', texto: P(20) },
  { tipo: 'Diferencia_despacho', nombre: 'Diferencias en cantidades, carga, documentos o instrucciones', p: 22, regla: 'R17', categoria: 'asistido', texto: P(22) },
  { tipo: 'Novedad_en_ruta', nombre: 'Demora, cierre vial o avería en ruta', p: 25, regla: 'R19', categoria: 'asistido', texto: P(25) },
  { tipo: 'Conductor_ocupado', nombre: 'Conductor conduciendo', p: 24, regla: 'R18', categoria: 'automatico', texto: P(24) },
  { tipo: 'Destinatario_no_recibe', nombre: 'Destinatario no puede recibir en el horario', p: 31, regla: 'R22', categoria: 'humano', texto: P(31) },
  { tipo: 'Demora_en_descargue', nombre: 'Filas, demoras, acceso o problemas documentales en destino', p: 32, regla: 'R16', categoria: 'asistido', texto: P(32) },
  { tipo: 'Diferencia_entrega', nombre: 'Entrega informada ≠ entrega confirmada', p: 35, regla: 'R23', categoria: 'asistido', texto: P(35) },
  { tipo: 'Inconformidad_cliente', nombre: 'Inconformidad del cliente', p: 37, regla: 'R24', categoria: 'asistido', texto: P(37) },
  { tipo: 'Sobrecosto_liquidacion', nombre: 'Costos adicionales o novedades que afectan la liquidación', p: 38, regla: 'R25', categoria: 'humano', texto: P(38) },
];

// --- 9. Expediente, comunicación transversal --------------------------------------------------

export const EXPEDIENTE_CONTENIDO = [
  'Solicitud inicial',
  'Llamadas realizadas al cliente y al transportador',
  'Transcripciones',
  'Grabaciones (cuando estén autorizadas)',
  'Resultados de negociación',
  'Confirmaciones',
  'Novedades',
  'Compromisos adquiridos',
  'Modificaciones aprobadas',
  'Soportes de entrega',
];
export const EXPEDIENTE_P = 39;

export const HISTORIAL_PREGUNTAS = [
  'Qué ocurrió en cada momento',
  'Quién suministró cada información',
  'Qué decisiones se tomaron',
  'Cuáles fueron las instrucciones comunicadas',
  'Qué actividades quedaron pendientes',
];

export const TRANSVERSALES = [
  { id: 'agenda', nombre: 'Agenda centralizada de llamadas y seguimientos', p: 41, texto: P(41) },
  { id: 'coordinacion', nombre: 'Coordinación entre agentes de IA', p: 42, texto: P(42) },
  { id: 'decision', nombre: 'Informar vs. decidir', p: 43, texto: P(43) },
  { id: 'no-exitosos', nombre: 'Reglas para contactos no exitosos', p: 44, texto: P(44) },
  { id: 'expediente', nombre: 'Expediente de la operación', p: 39, texto: P(39) },
  { id: 'historial', nombre: 'Historial cronológico', p: 40, texto: P(40) },
];

/** Preguntas que la visión centralizada debe responder (P45–P46). */
export const PREGUNTAS_NEGOCIO = [
  { id: 'q1', texto: '¿Qué servicios están pendientes de asignación?', p: 45 },
  { id: 'q2', texto: '¿Cuáles están en negociación?', p: 45 },
  { id: 'q3', texto: '¿Qué transportadores fueron confirmados?', p: 45 },
  { id: 'q4', texto: '¿Qué clientes tienen información pendiente?', p: 45 },
  { id: 'q5', texto: '¿Cuáles operaciones están en tránsito?', p: 45 },
  { id: 'q6', texto: '¿Qué novedades requieren atención?', p: 45 },
  { id: 'q7', texto: '¿Cuál fue la última comunicación con cada participante?', p: 46 },
  { id: 'q8', texto: '¿Qué compromisos hay adquiridos?', p: 46 },
  { id: 'q9', texto: '¿Qué ejecuta el sistema y qué requiere intervención directa del coordinador?', p: 46 },
];

// --- 10. KPIs del insumo (P47) ------------------------------------------------------------------

export interface KpiDef {
  id: string;
  nombre: string;
  definicion: string;
  unidad: string;
  /** Mejor cuando es 'alto' o 'bajo'. */
  mejor: 'alto' | 'bajo';
}

export const KPIS_INSUMO: KpiDef[] = [
  { id: 'respuestaCliente', nombre: 'Tiempo de respuesta de clientes', definicion: 'Minutos entre el intento de contacto y la respuesta del cliente.', unidad: 'min', mejor: 'bajo' },
  { id: 'respuestaTransportador', nombre: 'Tiempo de respuesta de transportadores', definicion: 'Minutos entre el intento de contacto y la respuesta del transportador.', unidad: 'min', mejor: 'bajo' },
  { id: 'confirmacionesAutomaticas', nombre: '% de confirmaciones automáticas', definicion: 'Confirmaciones logradas por la IA sin intervención del coordinador.', unidad: '%', mejor: 'alto' },
  { id: 'llamadasExitosas', nombre: 'Llamadas exitosas', definicion: 'Llamadas en que el interlocutor respondió y se logró el objetivo.', unidad: '%', mejor: 'alto' },
  { id: 'negociacionesCompletadas', nombre: 'Negociaciones completadas', definicion: 'Negociaciones que terminan en aceptación dentro de los límites.', unidad: '%', mejor: 'alto' },
  { id: 'contactosPorOperacion', nombre: 'Contactos necesarios por operación', definicion: 'Llamadas promedio por operación.', unidad: 'llamadas', mejor: 'bajo' },
  { id: 'anticipacionNovedades', nombre: 'Anticipación en la detección de novedades', definicion: 'Minutos de anticipación con que se detecta una novedad antes de afectar el compromiso.', unidad: 'min', mejor: 'alto' },
  { id: 'cumplimientoCompromisos', nombre: 'Cumplimiento de los compromisos', definicion: 'Compromisos cumplidos sobre los vencidos.', unidad: '%', mejor: 'alto' },
  { id: 'satisfaccion', nombre: 'Satisfacción de los clientes', definicion: 'Calificación recogida en la llamada de cierre.', unidad: '/5', mejor: 'alto' },
];
export const KPIS_P = 47;

// --- 11. Índice del documento (Blueprint) -------------------------------------------------------------

export interface SeccionDoc {
  id: string;
  numero: number;
  titulo: string;
}

export const SECCIONES_DOC: SeccionDoc[] = [
  { id: 'objetivo', numero: 1, titulo: 'Objetivo y alcance' },
  { id: 'canales', numero: 2, titulo: 'Canales de entrada y datos mínimos' },
  { id: 'flujo', numero: 3, titulo: 'Flujo end-to-end' },
  { id: 'entrantes', numero: 4, titulo: 'Contactos entrantes' },
  { id: 'roles', numero: 5, titulo: 'Roles y agentes' },
  { id: 'transversal', numero: 6, titulo: 'Agenda, coordinación, expediente' },
  { id: 'decision', numero: 7, titulo: 'Informar vs. decidir' },
  { id: 'reglas', numero: 8, titulo: 'Reglas de negocio' },
  { id: 'excepciones', numero: 9, titulo: 'Excepciones y novedades' },
  { id: 'sistemas', numero: 10, titulo: 'Sistemas' },
  { id: 'vision', numero: 11, titulo: 'Visión centralizada' },
  { id: 'kpis', numero: 12, titulo: 'Indicadores' },
  { id: 'proposito', numero: 13, titulo: 'Propósito' },
];

export const SUPUESTOS_DE_DISENO = [
  'Nombre de la unidad de trabajo: «Operación de transporte» (el documento dice «operación» y «servicio»).',
  'Estado final «Cancelada»: se deduce de «cancelar un servicio» (P43).',
  'Los nombres de los eventos y de las políticas (POL-XX-nn) son propios; el documento no los define.',
  'Los 5 bloques de color son una agrupación visual de las 17 etapas.',
  'La categoría «asistido» (el agente registra y notifica; el coordinador decide) es propia; el documento solo distingue informar de decidir.',
  'Las cifras de los guardrails (tarifa tope, intentos, espera) son parámetros de ejemplo.',
  'El documento no define fases de adopción: se ofrece el interruptor «Selección automática» (P11).',
  'Clientes, transportadores, ciudades, tarifas y teléfonos son ficticios (operación simulada).',
];

export const ETAPA_POR_ID: Record<EtapaFlujo, EtapaDef> = Object.fromEntries(
  FLUJO_ETAPAS.map((e) => [e.id, e]),
) as Record<EtapaFlujo, EtapaDef>;

export { P, PP };
