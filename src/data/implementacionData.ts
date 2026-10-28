// ============================================================================
// Ruta de implementacion · Haceb · Coordinacion logistica con agentes de IA
//
// Dos piezas:
//  1. PLANTILLA_CAPAS: las cinco fases genericas (objetivo, habilitador y
//     resultado en terminos neutrales). Cualquier otro proceso las reutiliza
//     con `crearProcesoImplementacion()` aportando sus prerrequisitos,
//     actividades tecnicas y criterios de certificacion.
//  2. IMPLEMENTACION_HACEB: la instancia para este proceso.
//
// El tiempo no se escribe aqui: se calcula (src/lib/rutaImplementacion.ts)
// con las actividades tecnicas en alcance mas el impacto de cada
// prerrequisito que no esta disponible. Los dias son dias habiles.
//
// Lo que dice el proceso (canales, datos minimos, reglas R01-R30, agentes,
// Mesa del coordinador, agenda, expediente) sale de procesoData.ts. Lo que es
// diseño de implementacion (telefonia SIP, despliegue, firewall, piloto) es
// propuesta de AION para este simulador, no parte del insumo.
// ============================================================================

import type {
  ActividadTecnica,
  CapaId,
  CapaImplementacion,
  CriterioHabilitador,
  PasoSubproceso,
  Prerrequisito,
  ProcesoImplementacion,
  Subproceso,
} from '@/types/implementacion';

export const ACLARACION_TIEMPOS =
  'Tiempo estimado sujeto al cumplimiento de los prerrequisitos y condiciones del camino feliz.';

/** Condiciones que afectan el tiempo estimado y la promesa de entrega y/o configuración. */
export const NOTAS_TIEMPO: string[] = [
  'El tiempo está sujeto a la cantidad de integraciones o accesos requeridos: cada fuente, integración o acceso adicional suma actividades y días a su fase.',
  'El tiempo está sujeto a los tiempos de demora en la entrega de prerrequisitos (credenciales, APIs, puertos, accesos, documentación, definiciones) por parte del cliente o de terceros: cada faltante suma días a su fase.',
  'La promesa de entrega y/o configuración se establece únicamente cuando los prerrequisitos están disponibles y los stoppers están resueltos.',
];

export const DESCRIPCION_DISCOVERY =
  'El Discovery es una actividad previa de levantamiento y refinamiento para identificar los insumos, ' +
  'datos, integraciones o reglas necesarias antes de establecer una estimación definitiva. No tiene una duración fija.';

// ---------------------------------------------------------------------------
// 1. Plantilla generica de las cinco fases
// ---------------------------------------------------------------------------

export type PlantillaCapa = Pick<CapaImplementacion, 'id' | 'numero' | 'nombre' | 'resumen' | 'objetivo' | 'resultado'> & {
  habilitador: string;
};

export const PLANTILLA_CAPAS: PlantillaCapa[] = [
  {
    id: 'ingesta',
    numero: 1,
    nombre: 'Ingesta',
    resumen: 'conectar la fuente',
    objetivo: 'Conectar la solución con la fuente de información y recibir de forma confiable lo que hay que procesar.',
    habilitador: 'Conexión con la fuente de información exitosa, confiable y estable.',
    resultado: 'La información entra a la solución de forma continua y trazable.',
  },
  {
    id: 'extraccion',
    numero: 2,
    nombre: 'Extracción',
    resumen: 'obtener los datos',
    objetivo: 'Extraer de cada formato los datos necesarios y llevarlos a una estructura estándar.',
    habilitador: 'Los datos necesarios se extraen completos y correctos de fuentes certificadas.',
    resultado: 'Registros estructurados, listos para validar.',
  },
  {
    id: 'validacion',
    numero: 3,
    nombre: 'Validación',
    resumen: 'comprobar reglas',
    objetivo: 'Comprobar que la información cumple las reglas y definiciones del negocio.',
    habilitador: 'Reglas de validación aprobadas por el negocio y ejecutándose sobre datos reales.',
    resultado: 'Registros validados o marcados con su inconsistencia.',
  },
  {
    id: 'clasificacion',
    numero: 4,
    nombre: 'Clasificación y destino',
    resumen: 'decidir y dirigir',
    objetivo: 'Clasificar cada caso y dirigirlo a su destino: automático, agente o persona.',
    habilitador: 'Cada caso de prueba se clasifica correctamente y llega a su destino.',
    resultado: 'Cada caso resuelto por quien corresponde, con su evidencia.',
  },
  {
    id: 'registro',
    numero: 5,
    nombre: 'Registro, cierre y aviso',
    resumen: 'cerrar y comunicar',
    objetivo: 'Registrar lo ocurrido, cerrar el caso y avisar a quien corresponda.',
    habilitador: 'Caso cerrado en el sistema destino, con traza registrada y aviso enviado.',
    resultado: 'Operación cerrada, trazable y comunicada.',
  },
];

// ---------------------------------------------------------------------------
// 2. Constructor reutilizable
// ---------------------------------------------------------------------------

export interface ConfigCapa {
  /** Sobrescribe los textos genericos cuando el proceso lo requiere. */
  objetivo?: string;
  habilitador?: string;
  resultado?: string;
  prerrequisitos: Prerrequisito[];
  actividades: ActividadTecnica[];
  /** Criterios que certifican la fase (todos deben cumplirse). */
  criterios: CriterioHabilitador[];
}

export interface ConfigProceso {
  id: string;
  nombre: string;
  descripcion: string;
  capas: Record<CapaId, ConfigCapa>;
  /** Permite reemplazar las notas genericas sobre el tiempo. */
  notasTiempo?: string[];
  /** Etiquetas cortas por id de prerrequisito para las cajas del diagrama. */
  etiquetas?: Record<string, string>;
}

export function crearProcesoImplementacion(config: ConfigProceso): ProcesoImplementacion {
  return {
    id: config.id,
    nombre: config.nombre,
    descripcion: config.descripcion,
    aclaracionTiempos: ACLARACION_TIEMPOS,
    notasTiempo: config.notasTiempo ?? NOTAS_TIEMPO,
    descripcionDiscovery: DESCRIPCION_DISCOVERY,
    capas: PLANTILLA_CAPAS.map((plantilla) => {
      const c = config.capas[plantilla.id];
      return {
        id: plantilla.id,
        numero: plantilla.numero,
        nombre: plantilla.nombre,
        resumen: plantilla.resumen,
        objetivo: c.objetivo ?? plantilla.objetivo,
        resultado: c.resultado ?? plantilla.resultado,
        habilitador: { condicion: c.habilitador ?? plantilla.habilitador, criterios: c.criterios },
        prerrequisitos: c.prerrequisitos.map((pre) => ({ ...pre, etiqueta: pre.etiqueta ?? config.etiquetas?.[pre.id] })),
        actividades: c.actividades,
      };
    }),
  };
}

interface OpcionesPr {
  bloqueante?: Prerrequisito['bloqueante'];
  impacto?: Prerrequisito['impacto'];
  subproceso?: Subproceso;
}

/** Atajo para escribir prerrequisitos de forma compacta. */
function pr(
  id: string,
  texto: string,
  tipo: Prerrequisito['tipo'],
  responsable: Prerrequisito['responsable'],
  estado: Prerrequisito['estado'],
  opciones: OpcionesPr = {},
): Prerrequisito {
  return { id, texto, tipo, responsable, estado, ...opciones };
}

/** Atajo para actividades tecnicas (dias habiles de camino feliz). */
function act(
  id: string,
  texto: string,
  tipo: ActividadTecnica['tipo'],
  dias: number,
  opciones: Pick<ActividadTecnica, 'opcional' | 'incluidaPorDefecto' | 'requiere'> = {},
): ActividadTecnica {
  return { id, texto, tipo, dias, ...opciones };
}

/** Atajo para criterios del habilitador. */
function crit(id: string, texto: string, cumplido = false): CriterioHabilitador {
  return { id, texto, cumplido };
}

function paso(id: string, actor: PasoSubproceso['actor'], titulo: string, detalle: string, evidencia: string, segundos = 1): PasoSubproceso {
  return { id, actor, titulo, detalle, evidencia, segundos };
}

// ---------------------------------------------------------------------------
// Subprocesos: como se conecta o configura cada elemento (simulacion pequena)
// Los datos de los ejemplos son ficticios.
// ---------------------------------------------------------------------------

export const SUB_TELEFONIA_VOZ: Subproceso = {
  titulo: 'Cómo se conecta la telefonía y el agente de voz con IA',
  mecanismo: 'Conector',
  descripcion: 'Una troncal SIP con numeración asignada conecta las llamadas del cliente y del transportador con el agente de voz, que atiende y realiza llamadas con identidad clara.',
  pasos: [
    paso('t1', 'Cliente', 'Asignar la numeración', 'El cliente (o su operador) entrega el número de atención entrante y la línea de salida que mostrarán los agentes de IA.', 'Número de atención asignado · línea de salida asignada', 1),
    paso('t2', 'Sistema', 'Registrar la troncal SIP', 'AION registra la troncal con el operador de telefonía, el códec y el rango de puertos de audio acordado con el firewall.', 'Troncal SIP registrada · TLS/SRTP habilitado', 0.8),
    paso('t3', 'Sistema', 'Enrutar la llamada al agente', 'La llamada entrante llega al agente de IA de comunicación con el cliente; la saliente se origina desde la agenda centralizada.', 'Llamada entrante enrutada · agente de cliente', 0.6),
    paso('t4', 'Agente', 'Atender e identificar', 'El agente se presenta, identifica la empresa y la persona que llama y comienza a recopilar la solicitud.', 'Empresa y solicitante identificados', 1.2),
    paso('t5', 'Sistema', 'Registrar la llamada en la operación', 'La llamada queda vinculada a la operación con su transcripción y, si hay autorización, su grabación.', 'OP-0001 · llamada registrada · transcripción lista', 0.6),
  ],
  resultado: 'La telefonía queda habilitada en ambos sentidos: el agente atiende y llama, y cada llamada queda vinculada a una operación.',
};

export const SUB_INTEGRACION_CLIENTE: Subproceso = {
  titulo: 'Cómo se recibe una solicitud desde los sistemas del cliente',
  mecanismo: 'API',
  descripcion: 'Con el acceso entregado por el cliente, su sistema envía la solicitud de transporte y la plataforma la registra como una operación.',
  pasos: [
    paso('i1', 'Cliente', 'Entregar acceso y especificación', 'El cliente entrega el usuario técnico o token, el endpoint y la especificación del mensaje de solicitud.', 'Token vigente · especificación recibida', 0.8),
    paso('i2', 'Sistema', 'Probar la conexión', 'Se autentica y se envía una solicitud de prueba al ambiente de certificación del cliente.', 'HTTP 200 · ambiente de pruebas', 0.5),
    paso('i3', 'Sistema', 'Recibir la solicitud', 'Llega la solicitud con origen, destino, mercancía, peso, volumen y fecha de cargue.', 'Solicitud recibida · canal Integración', 0.5),
    paso('i4', 'Sistema', 'Mapear a los datos mínimos', 'Cada campo del sistema del cliente alimenta un dato mínimo de la solicitud; lo que falta queda marcado.', '8 de 9 datos mínimos · falta requisito especial', 0.8),
    paso('i5', 'Sistema', 'Registrar la operación', 'Se crea la operación con su identificador único y se inicia la validación.', 'OP-0001 · Validación', 0.4),
  ],
  resultado: 'Las solicitudes de los sistemas del cliente entran sin digitación, ya estructuradas y con trazabilidad desde el primer momento.',
};

export const SUB_BASE_PROVEEDORES: Subproceso = {
  titulo: 'Cómo se certifica la base de proveedores (transportadores)',
  mecanismo: 'Agente IA',
  descripcion: 'La búsqueda de transportadores solo es confiable si la base trae ubicación, vehículo, capacidad, rutas, historial y condiciones comerciales limpios.',
  pasos: [
    paso('b1', 'Sistema', 'Cargar la base de proveedores', 'Se lee la base entregada por el cliente (archivo o API) y se normalizan los campos.', 'Base de transportadores cargada', 0.8),
    paso('b2', 'Agente', 'Detectar duplicados y vacíos', 'Se comparan identificación, placas y teléfonos; se marcan duplicados y campos que la búsqueda necesita y no tienen valor.', 'Duplicados probables · teléfonos y capacidades por completar', 1.3),
    paso('b3', 'Sistema', 'Entregar el reporte de calidad', 'El cliente recibe el listado de hallazgos priorizado por su efecto en la búsqueda.', 'Reporte de calidad de la base', 0.5),
    paso('b4', 'Cliente', 'Depurar la fuente', 'El cliente corrige o confirma cada hallazgo en su sistema.', 'Hallazgos resueltos', 1.2),
    paso('b5', 'Persona', 'Certificar la base', 'El responsable del cliente aprueba la base como fuente para la búsqueda y la negociación.', 'Base certificada para búsqueda', 0.5),
  ],
  resultado: 'Base de proveedores certificada: la búsqueda puede ordenar candidatos por compatibilidad con datos en los que se puede confiar.',
};

export const SUB_CONTACTOS_AUTORIZADOS: Subproceso = {
  titulo: 'Cómo se certifican los contactos autorizados del cliente',
  mecanismo: 'Agente IA',
  descripcion: 'Solo el contacto autorizado puede confirmar condiciones de cargue y consultar el estado: la lista debe estar limpia antes de que el agente llame.',
  pasos: [
    paso('c1', 'Sistema', 'Cargar clientes y contactos', 'Se lee el maestro de clientes, sus sedes y sus contactos con cargo y teléfono.', 'Clientes, sedes y contactos cargados', 0.8),
    paso('c2', 'Agente', 'Detectar inconsistencias', 'Marca contactos duplicados, teléfonos inválidos y sedes sin contacto autorizado.', 'Contactos duplicados · sedes sin contacto', 1.2),
    paso('c3', 'Cliente', 'Confirmar quién está autorizado', 'El cliente confirma por sede quién puede validar cargue y consultar el estado de una operación.', 'Contactos autorizados confirmados', 1.2),
    paso('c4', 'Sistema', 'Cargar la lista certificada', 'La lista queda disponible para que el agente valide la autorización antes de dar información.', 'Lista certificada · vigente', 0.5),
  ],
  resultado: 'El agente identifica al solicitante y valida su autorización contra una lista confiable antes de informar el estado.',
};

export const SUB_AGENDA: Subproceso = {
  titulo: 'Cómo funciona la agenda centralizada de llamadas',
  mecanismo: 'Conector',
  descripcion: 'Cada llamada de IA nace de una tarea con objetivo específico, vinculada a una operación, un interlocutor y una actividad.',
  pasos: [
    paso('g1', 'Sistema', 'Generar la tarea de contacto', 'Una etapa de la operación crea la tarea: objetivo, interlocutor y actividad.', 'Tarea: confirmar cargue · OP-0001', 0.5),
    paso('g2', 'Sistema', 'Revisar duplicados', 'Antes de llamar, la agenda comprueba si la información ya fue confirmada por otro agente.', 'Sin consulta duplicada', 0.5),
    paso('g3', 'Agente', 'Ejecutar el contacto', 'El agente asignado llama dentro de la ventana permitida y registra el resultado.', 'Contacto exitoso · dato confirmado', 1.2),
    paso('g4', 'Sistema', 'Actualizar las tareas relacionadas', 'Al confirmarse la información, las tareas relacionadas se actualizan o se cancelan.', '2 tareas relacionadas actualizadas', 0.6),
  ],
  resultado: 'Los contactos no se contradicen ni se duplican: la agenda es la única fuente de qué se llama, a quién y para qué.',
};

export const SUB_MESA_COORDINADOR: Subproceso = {
  titulo: 'Cómo llega un caso a la Mesa del coordinador',
  mecanismo: 'Agente IA',
  descripcion: 'Cuando la decisión no es del agente, el coordinador recibe el caso con el contexto completo y su decisión reanuda la operación.',
  pasos: [
    paso('m1', 'Agente', 'Identificar que requiere decisión', 'Aplica la regla de autorización: una tarifa sobre el tope, un sobrecosto o un cambio contractual no lo decide el agente.', 'Tarifa sobre el límite · requiere al responsable', 0.6),
    paso('m2', 'Agente', 'Armar el caso', 'Reúne la operación, lo ofertado, las alternativas y la última comunicación con cada parte.', 'Caso con alternativas y evidencia', 1),
    paso('m3', 'Sistema', 'Notificar al coordinador', 'Avisa al coordinador (y a su suplente) por el canal acordado.', 'Coordinador notificado', 0.5),
    paso('m4', 'Persona', 'Decidir', 'El coordinador aprueba, rechaza o elige otra alternativa desde la Mesa.', 'Decisión registrada', 1.2),
    paso('m5', 'Sistema', 'Reanudar la operación', 'La decisión actualiza la operación y la agenda genera los contactos que siguen.', 'Operación reanudada · contactos programados', 0.5),
  ],
  resultado: 'La persona decide con todo el contexto en un solo lugar y el proceso continúa sin reconstruir lo hablado.',
};

export const SUB_TOPE_TARIFA: Subproceso = {
  titulo: 'Cómo se configura el tope de tarifa autorizado',
  mecanismo: 'Manual',
  descripcion: 'El agente negocia solo dentro de los parámetros económicos que la empresa define; esos valores se acuerdan, se cargan y se prueban.',
  pasos: [
    paso('p1', 'Cliente', 'Definir el parámetro', 'El responsable de autorización define cuánto puede pagarse por tipo de servicio, ruta o vehículo.', 'Tope definido por el responsable', 1),
    paso('p2', 'Sistema', 'Cargar en el motor de reglas', 'El tope y el número de rondas de contrapropuesta quedan configurados en la política de negociación.', 'Política de negociación configurada', 0.6),
    paso('p3', 'Agente', 'Ensayar una negociación', 'Se simula una llamada en la que el transportador pide una tarifa mayor al tope.', 'Contrapropuesta sobre el tope', 1.2),
    paso('p4', 'Sistema', 'Verificar que no compromete valores', 'El agente no compromete valores adicionales y presenta el resultado al coordinador.', 'Sin compromiso adicional · caso a la Mesa', 0.6),
  ],
  resultado: 'La negociación respeta el tope y todo lo que lo supera pasa al responsable, con evidencia de la prueba.',
};

export const SUB_DOCS_TRANSPORTADOR: Subproceso = {
  titulo: 'Cómo se valida la documentación del transportador',
  mecanismo: 'API',
  descripcion: 'Antes de formalizar la asignación se comprueban los documentos exigidos para prestar el servicio.',
  pasos: [
    paso('d1', 'Cliente', 'Definir los documentos exigidos', 'El cliente entrega la lista de documentos del conductor, del vehículo y de la empresa transportadora.', 'Lista de documentos definida', 0.8),
    paso('d2', 'Sistema', 'Consultar o recibir los documentos', 'Se leen los documentos del transportador seleccionado desde la fuente acordada.', 'Documentos recibidos', 0.6),
    paso('d3', 'Sistema', 'Comprobar vigencia y completitud', 'Se verifica que cada documento exista y esté vigente.', 'Un documento por vencer', 0.6),
    paso('d4', 'Sistema', 'Decidir el avance', 'Si todo está en regla se formaliza la asignación; si no, se solicita lo faltante o se avisa al coordinador.', 'Asignación habilitada o solicitud de documento', 0.5),
  ],
  resultado: 'Ninguna asignación se formaliza con documentos faltantes o vencidos.',
};

export const SUB_NO_EXITOSOS: Subproceso = {
  titulo: 'Cómo se gestiona un contacto no exitoso',
  mecanismo: 'Agente IA',
  descripcion: 'Si el cliente o el transportador no responde, se registra el intento y se reprograma según la importancia de la actividad.',
  pasos: [
    paso('n1', 'Agente', 'Intentar el contacto', 'El agente llama al interlocutor y no obtiene respuesta.', 'Intento 1 sin respuesta', 0.8),
    paso('n2', 'Sistema', 'Registrar el intento', 'El intento queda en el expediente y vinculado a la tarea de la agenda.', 'Intento registrado', 0.4),
    paso('n3', 'Sistema', 'Reprogramar según importancia', 'La agenda programa el nuevo contacto con la separación que corresponde a la actividad.', 'Nuevo contacto programado', 0.5),
    paso('n4', 'Sistema', 'Alertar si afecta el servicio', 'Si la falta de respuesta puede afectar el servicio, se genera una alerta para intervención humana.', 'Alerta al coordinador', 0.5),
  ],
  resultado: 'Ningún contacto fallido se pierde: queda registrado, reprogramado o escalado a una persona.',
};

export const SUB_COORDINACION_AGENTES: Subproceso = {
  titulo: 'Cómo se coordinan los tres agentes de IA',
  mecanismo: 'Agente IA',
  descripcion: 'Los agentes de cliente, de negociación y de seguimiento comparten la misma información operativa para no contradecirse.',
  pasos: [
    paso('a1', 'Agente', 'El agente de negociación cierra con un transportador', 'Registra la aceptación y las condiciones acordadas en la operación.', 'Aceptación preliminar registrada', 0.8),
    paso('a2', 'Sistema', 'Publicar el resultado', 'El resultado de la asignación queda disponible en la información operativa compartida.', 'Contexto operativo actualizado', 0.5),
    paso('a3', 'Agente', 'El agente de seguimiento lo recibe', 'Programa las llamadas preventivas con el transportador asignado.', 'Preventivas programadas', 0.8),
    paso('a4', 'Agente', 'El agente de cliente consulta lo mismo', 'Antes de hablar con el cliente consulta la misma información operativa y comunica solo lo confirmado.', 'Mensaje consistente con la asignación', 0.8),
  ],
  resultado: 'Cliente y transportador reciben la misma información, venga del agente que venga.',
};

export const SUB_LLAMADA_CIERRE: Subproceso = {
  titulo: 'Cómo se hace la llamada de cierre y se trata una inconformidad',
  mecanismo: 'Agente IA',
  descripcion: 'La llamada de cierre confirma el servicio y recoge observaciones; una inconformidad se convierte en un caso de seguimiento.',
  pasos: [
    paso('l1', 'Sistema', 'Programar la llamada', 'Cuando la entrega queda confirmada, la agenda programa la llamada de cierre con el contacto autorizado.', 'Llamada de cierre programada', 0.5),
    paso('l2', 'Agente', 'Confirmar el servicio', 'Confirma que el servicio se completó y pregunta por observaciones, calidad y cumplimiento de horarios.', 'Servicio confirmado · observaciones recogidas', 1.2),
    paso('l3', 'Agente', 'Detectar la inconformidad', 'El cliente expresa una inconformidad con la atención.', 'Inconformidad identificada', 0.6),
    paso('l4', 'Sistema', 'Abrir el caso de seguimiento', 'La inconformidad se convierte en un caso con responsable, y no queda como un simple comentario.', 'Caso de seguimiento abierto', 0.5),
  ],
  resultado: 'Cada cierre deja la percepción del cliente registrada y cada inconformidad tiene un caso con dueño.',
};

// ---------------------------------------------------------------------------
// 3. Instancia: Haceb · Coordinacion logistica con agentes de IA
// ---------------------------------------------------------------------------

export const IMPLEMENTACION_HACEB: ProcesoImplementacion = crearProcesoImplementacion({
  id: 'haceb-coordinacion-logistica',
  nombre: 'Haceb · Coordinación logística con agentes de IA',
  etiquetas: {
    'ing-1': 'Canales y contacto autorizado',
    'ing-8': 'Ambiente de despliegue',
    'ing-2': 'Telefonía SIP y numeración',
    'ing-9': 'Puertos, firewall y TLS',
    'ing-10': 'VPN / conectividad privada',
    'ing-3': 'Acceso a sistemas del cliente',
    'ing-4': 'Especificación de la solicitud',
    'ing-5': 'Acceso a la base de proveedores',
    'ing-6': 'Ubicación del formulario',
    'ing-7': 'Ventanas de llamada (agenda)',
    'ing-11': 'Usuarios de coordinadores',
    'ext-1': 'Diccionario de datos mínimos',
    'ext-2': 'Contactos autorizados limpios',
    'ext-3': 'Base de proveedores certificable',
    'ext-4': 'Mapeo formulario / integración',
    'ext-5': 'Catálogos de mercancía y vehículo',
    'ext-6': 'Solicitudes históricas de muestra',
    'val-1': 'Reglas R01–R30 aprobadas',
    'val-2': 'Tope de tarifa autorizado',
    'val-3': 'Documentos exigidos al transportador',
    'val-4': 'Política de selección automática',
    'val-5': 'Espera y reintentos',
    'val-6': 'Responsables de autorización',
    'val-7': 'Fuente de documentos del transportador',
    'cla-1': 'Matriz informar vs. decidir',
    'cla-2': 'Reglas de escalamiento',
    'cla-3': 'Coordinadores de la Mesa',
    'cla-4': 'Transferencia a una persona',
    'cla-5': 'Contactos no exitosos',
    'cla-6': 'Guardrails de los agentes',
    'cla-7': 'Contexto compartido entre agentes',
    'reg-4': 'Alcance firmado',
    'reg-1': 'Contenido y retención del expediente',
    'reg-2': 'Autorización de grabación',
    'reg-3': 'Guion de la llamada de cierre',
    'reg-5': 'Criterios de cierre administrativo',
    'reg-6': 'Definición de indicadores',
    'reg-7': 'Operaciones y usuarios del piloto',
    'reg-8': 'Equipo de hiperatención',
  },
  descripcion:
    'Fases secuenciales para poner en operación el piloto de los agentes de IA: qué debe tener listo el cliente en cada una, qué la bloquea, qué trabajo técnico se ejecuta, qué certifica que terminó y cuánto tarda según lo que está disponible hoy.',
  capas: {
    ingesta: {
      objetivo: 'Conectar los cuatro canales de entrada (llamada atendida por IA, formulario, integración con los sistemas del cliente y registro del coordinador), la base de proveedores y la agenda de llamadas, para recibir cada solicitud de transporte como una operación.',
      habilitador: 'Conexión con cada canal del piloto exitosa, confiable y estable.',
      resultado: 'Las solicitudes de los canales del piloto llegan a la plataforma y quedan registradas como operaciones.',
      prerrequisitos: [
        pr('ing-1', 'Canales de entrada del piloto definidos, contacto técnico del cliente asignado y contactos autorizados identificados por sede', 'informacion', 'ambos', 'disponible', { bloqueante: 'proyecto' }),
        pr('ing-8', 'Ambiente para desplegar el stack (plataforma, agentes de IA y servicios de voz): servidor o nube del cliente con capacidad acordada (CPU, memoria, almacenamiento) y acceso administrativo', 'infraestructura', 'cliente', 'disponible', { bloqueante: 'proyecto' }),
        pr('ing-2', 'Troncal SIP y numeración telefónica: número de atención entrante, línea de salida de los agentes y operador de telefonía habilitado', 'conectividad', 'ambos', 'disponible', { bloqueante: 'fase', subproceso: SUB_TELEFONIA_VOZ }),
        pr('ing-9', 'Puertos y reglas de firewall abiertos: 443 y señalización SIP/TLS, rango de audio RTP/SRTP y lista blanca de IPs del stack', 'conectividad', 'cliente', 'disponible', { bloqueante: 'fase' }),
        pr('ing-10', 'VPN o conectividad privada con la red del cliente, si los sistemas del cliente o la base de proveedores no son públicos', 'conectividad', 'ambos', 'requiere_validacion'),
        pr('ing-3', 'Acceso a los sistemas del cliente para la integración: usuario técnico o token, endpoint y límites de uso en ambiente de pruebas', 'credencial', 'cliente', 'pendiente', { subproceso: SUB_INTEGRACION_CLIENTE }),
        pr('ing-4', 'Especificación del mensaje de solicitud que envían los sistemas del cliente (campos, formato y autenticación)', 'documentacion', 'cliente', 'disponible'),
        pr('ing-5', 'Acceso a la base de proveedores (transportadores): archivo, vista de base de datos o API de lectura', 'acceso', 'cliente', 'pendiente'),
        pr('ing-6', 'Dónde se publicará el formulario de solicitud y qué usuarios del cliente lo diligenciarán', 'acceso', 'cliente', 'disponible'),
        pr('ing-7', 'Ventanas horarias y días en que los agentes pueden llamar a clientes y transportadores', 'regla', 'ambos', 'disponible', { subproceso: SUB_AGENDA }),
        pr('ing-11', 'Usuarios de los coordinadores creados para el registro manual de solicitudes y el acceso a la Mesa', 'acceso', 'cliente', 'disponible'),
      ],
      actividades: [
        act('ing-a1', 'Levantamiento técnico de los canales de entrada, sistemas del cliente y volumen de solicitudes del piloto', 'levantamiento', 2, { requiere: ['ing-1', 'ing-4'] }),
        act('ing-a2', 'Despliegue del stack en el ambiente del cliente: contenedores, base de datos, colas de mensajes y gestor de secretos', 'infraestructura', 3, { requiere: ['ing-8'] }),
        act('ing-a3', 'Configuración de conectividad: puertos, reglas de firewall, lista blanca de IPs, certificados TLS y VPN si aplica', 'conectividad', 2, { requiere: ['ing-9', 'ing-10'] }),
        act('ing-a4', 'Telefonía: registro de la troncal SIP, numeración, enrutamiento al agente de voz y pruebas de audio entrante y saliente', 'integracion', 3, { requiere: ['ing-2', 'ing-9'] }),
        act('ing-a5', 'Publicación del formulario de solicitud y habilitación del registro manual del coordinador', 'configuracion', 1, { requiere: ['ing-6', 'ing-11'] }),
        act('ing-a6', 'Integración con los sistemas del cliente: autenticación, recepción de la solicitud, reintentos y manejo de errores', 'integracion', 4, { opcional: true, requiere: ['ing-3', 'ing-4'] }),
        act('ing-a7', 'Conexión de lectura a la base de proveedores y carga inicial', 'integracion', 2, { requiere: ['ing-5'] }),
        act('ing-a8', 'Configuración de la agenda centralizada de llamadas: ventanas horarias, objetivos por contacto y vínculo con la operación', 'configuracion', 1, { requiere: ['ing-7'] }),
        act('ing-a9', 'Pruebas de recepción de extremo a extremo por cada canal del piloto', 'pruebas', 2),
      ],
      criterios: [
        crit('ing-h1', 'Conexión autenticada con cada canal del piloto (prueba de conectividad y de audio superada)', true),
        crit('ing-h2', 'Una solicitud de prueba por cada canal queda registrada como operación con su identificador único', true),
        crit('ing-h3', 'Estabilidad: 48 horas de operación continua sin caídas de la troncal ni pérdida de solicitudes'),
        crit('ing-h4', 'Acta de conexión firmada por el contacto técnico del cliente'),
      ],
    },
    extraccion: {
      objetivo: 'Capturar los datos mínimos de la solicitud (origen, destino, mercancía, peso, volumen, vehículo, fecha y hora de cargue, condiciones de entrega y requisitos especiales) desde la voz, el formulario y la integración, sobre maestros certificados.',
      habilitador: 'Solicitudes de prueba de los tres medios convertidas en operaciones con los datos mínimos, a partir de maestros certificados.',
      resultado: 'Cada solicitud estructurada con los datos mínimos o con lo confirmado y la gestión posterior programada.',
      prerrequisitos: [
        pr('ext-1', 'Diccionario de los datos mínimos de la solicitud acordado y firmado, con los requisitos especiales que el cliente exige', 'regla', 'ambos', 'disponible', { bloqueante: 'fase' }),
        pr('ext-2', 'Maestro de clientes, sedes y contactos autorizados limpio, con quién valida cargue y consulta el estado', 'fuente', 'cliente', 'requiere_validacion', { bloqueante: 'fase', subproceso: SUB_CONTACTOS_AUTORIZADOS }),
        pr('ext-3', 'Base de proveedores certificable: ubicación, tipo de vehículo, capacidad, rutas habituales, historial de cumplimiento y condiciones comerciales', 'fuente', 'cliente', 'pendiente', { bloqueante: 'fase', subproceso: SUB_BASE_PROVEEDORES }),
        pr('ext-4', 'Mapeo de campos entregado: qué campo del formulario y del sistema del cliente alimenta cada dato mínimo', 'documentacion', 'cliente', 'pendiente'),
        pr('ext-5', 'Catálogos de tipos de mercancía y de vehículos que el agente debe reconocer', 'informacion', 'cliente', 'disponible'),
        pr('ext-6', 'Solicitudes históricas de muestra por canal (voz, formulario e integración) entregadas', 'informacion', 'cliente', 'requiere_validacion'),
      ],
      actividades: [
        act('ext-a1', 'Definición del modelo de la solicitud y del diccionario de datos mínimos con el negocio', 'levantamiento', 2, { requiere: ['ext-1'] }),
        act('ext-a2', 'Configuración del agente de voz: guion de captura, identificación de la empresa y el solicitante, y registro de lo confirmado cuando faltan datos', 'configuracion', 3, { requiere: ['ext-1', 'ext-5'] }),
        act('ext-a3', 'Mapeo de campos y transformaciones del formulario a los datos mínimos', 'configuracion', 2, { requiere: ['ext-4'] }),
        act('ext-a4', 'Mapeo de campos y transformaciones de la integración con los sistemas del cliente', 'configuracion', 2, { opcional: true, requiere: ['ext-4'] }),
        act('ext-a5', 'Limpieza y depuración del maestro de clientes y contactos autorizados: duplicados, teléfonos y sedes sin contacto', 'datos', 3, { requiere: ['ext-2'] }),
        act('ext-a6', 'Limpieza y normalización de la base de proveedores: duplicados, placas, teléfonos, capacidades y rutas', 'datos', 3, { requiere: ['ext-3'] }),
        act('ext-a7', 'Certificación de las fuentes con el cliente: muestreo, conciliación y acta de fuente limpia', 'certificacion', 2, { requiere: ['ext-2', 'ext-3'] }),
        act('ext-a8', 'Pruebas de captura con llamadas simuladas y solicitudes históricas, y ajuste del guion', 'pruebas', 2, { requiere: ['ext-6'] }),
      ],
      criterios: [
        crit('ext-h1', 'Maestro de clientes y contactos autorizados y base de proveedores certificados como fuente limpia por el responsable del cliente'),
        crit('ext-h2', 'Mapeos del formulario y de la integración aprobados por el negocio'),
        crit('ext-h3', 'Las solicitudes de prueba quedan con los datos mínimos completos, o con lo confirmado y una gestión posterior programada (R02)'),
        crit('ext-h4', 'El agente identifica la empresa y la persona que llama en las llamadas de prueba'),
      ],
    },
    validacion: {
      objetivo: 'Configurar y probar las reglas de negocio R01–R30 sobre cada operación: suficiencia de la solicitud, tope de tarifa, documentos del transportador, política de selección automática y parámetros de espera y reintentos.',
      habilitador: 'Reglas aprobadas por el negocio y ejecutándose en las pruebas sin falsos positivos relevantes.',
      resultado: 'Operaciones validadas, con la inconsistencia identificada o con la decisión dirigida al responsable.',
      prerrequisitos: [
        pr('val-1', 'Reglas de negocio R01–R30 y sus políticas revisadas y aprobadas por el cliente', 'regla', 'ambos', 'requiere_validacion', { bloqueante: 'fase' }),
        pr('val-2', 'Tope de tarifa autorizado (parámetros económicos máximos por tipo de servicio, ruta o vehículo) y número de rondas de contrapropuesta', 'regla', 'cliente', 'no_disponible', { bloqueante: 'fase', subproceso: SUB_TOPE_TARIFA }),
        pr('val-3', 'Documentos exigidos al transportador, al conductor y al vehículo, con su vigencia', 'documentacion', 'cliente', 'pendiente', { subproceso: SUB_DOCS_TRANSPORTADOR }),
        pr('val-4', 'Requisitos operativos, documentales y comerciales que habilitan la selección automática', 'regla', 'cliente', 'pendiente'),
        pr('val-5', 'Parámetros de espera y reintentos: espera en cargue que alerta, intentos antes de alerta y anticipación de las llamadas preventivas', 'regla', 'cliente', 'requiere_validacion'),
        pr('val-6', 'Responsables de autorización nombrados (tarifas, sobrecostos, cambios contractuales y cancelaciones)', 'informacion', 'cliente', 'disponible'),
        pr('val-7', 'Fuente desde la que se leen los documentos del transportador (archivo, repositorio o API) y acceso a ella', 'api', 'cliente', 'requiere_validacion'),
      ],
      actividades: [
        act('val-a1', 'Parametrización de las reglas de validación de la solicitud (R01–R04) y de los datos faltantes con gestión posterior', 'configuracion', 3, { requiere: ['val-1'] }),
        act('val-a2', 'Configuración de la política de negociación: tope de tarifa, rondas de contrapropuesta y escalamiento al responsable (R06–R08)', 'configuracion', 3, { requiere: ['val-2', 'val-6'] }),
        act('val-a3', 'Configuración de la validación documental del transportador antes de formalizar la asignación (R10)', 'configuracion', 3, { requiere: ['val-3'] }),
        act('val-a4', 'Configuración de la política de selección automática y del interruptor para el coordinador (R09)', 'configuracion', 2, { requiere: ['val-4'] }),
        act('val-a5', 'Parametrización de esperas, reintentos y anticipación de llamadas preventivas', 'configuracion', 2, { requiere: ['val-5'] }),
        act('val-a6', 'Conexión de lectura a la fuente de documentos del transportador', 'integracion', 3, { opcional: true, requiere: ['val-7'] }),
        act('val-a7', 'Pruebas de las reglas con casos del catálogo de novedades y aprobación de cada responsable', 'pruebas', 3, { requiere: ['val-1', 'val-6'] }),
      ],
      criterios: [
        crit('val-h1', 'Reglas parametrizadas y aprobadas por su responsable de negocio'),
        crit('val-h2', 'Una tarifa sobre el tope se presenta al coordinador sin comprometer valores adicionales (R06–R07)'),
        crit('val-h3', 'Un documento faltante o vencido impide formalizar la asignación (R10)'),
        crit('val-h4', 'Pruebas del catálogo de novedades superadas sin falsos positivos relevantes'),
      ],
    },
    clasificacion: {
      objetivo: 'Separar lo informativo de lo que requiere decisión, configurar el escalamiento a la Mesa del coordinador, coordinar los tres agentes de IA y definir las reglas para los contactos no exitosos, dentro de guardrails aprobados.',
      habilitador: 'Cada caso de prueba se clasifica como informativo, novedad o decisión y llega a la persona o al agente que corresponde.',
      resultado: 'Cada caso resuelto por el agente, el coordinador o el responsable, con su contexto y su evidencia.',
      prerrequisitos: [
        pr('cla-1', 'Matriz informar vs. decidir aprobada: qué gestiona el agente y qué requiere al responsable (tarifas, sobrecostos, cambios contractuales, cancelaciones)', 'regla', 'ambos', 'pendiente', { bloqueante: 'fase' }),
        pr('cla-2', 'Reglas de escalamiento al coordinador definidas: qué novedades escalan y con qué parámetros', 'regla', 'cliente', 'requiere_validacion', { bloqueante: 'fase' }),
        pr('cla-3', 'Coordinadores de la Mesa nombrados, con suplentes y horario de atención', 'informacion', 'cliente', 'disponible', { subproceso: SUB_MESA_COORDINADOR }),
        pr('cla-4', 'Mecanismo de transferencia de una llamada a una persona (línea y horario), si el cliente lo habilita', 'integracion', 'cliente', 'pendiente'),
        pr('cla-5', 'Reglas para contactos no exitosos: reintentos según la importancia de la actividad y cuándo se alerta a una persona', 'regla', 'ambos', 'pendiente', { subproceso: SUB_NO_EXITOSOS }),
        pr('cla-6', 'Guardrails de los agentes aprobados: solo información confirmada, contacto con el conductor únicamente si no conduce y límites de atribuciones', 'regla', 'ambos', 'requiere_validacion'),
        pr('cla-7', 'Definición de la información operativa compartida entre los tres agentes (cliente, negociación y seguimiento)', 'regla', 'aion', 'disponible', { subproceso: SUB_COORDINACION_AGENTES }),
      ],
      actividades: [
        act('cla-a1', 'Configuración de la matriz informar vs. decidir y de las reglas de escalamiento al responsable (R21, R28)', 'configuracion', 2, { requiere: ['cla-1', 'cla-2'] }),
        act('cla-a2', 'Configuración de la Mesa del coordinador: usuarios, roles, suplentes, notificaciones y horarios', 'configuracion', 2, { requiere: ['cla-3'] }),
        act('cla-a3', 'Coordinación entre los tres agentes de IA: información operativa compartida, publicación de resultados y consulta común (R27)', 'integracion', 3, { requiere: ['cla-7'] }),
        act('cla-a4', 'Configuración de los guiones y límites del agente de negociación y del agente de seguimiento', 'configuracion', 3, { requiere: ['cla-6'] }),
        act('cla-a5', 'Configuración de las reglas de contactos no exitosos en la agenda: reintentos, reprogramación y alertas (R29)', 'configuracion', 2, { requiere: ['cla-5'] }),
        act('cla-a6', 'Habilitación de la transferencia de la llamada a una persona', 'integracion', 2, { opcional: true, requiere: ['cla-4'] }),
        act('cla-a7', 'Operación en sombra sobre solicitudes reales, sin afectar la operación del cliente', 'pruebas', 5),
      ],
      criterios: [
        crit('cla-h1', 'Cada caso de prueba se clasifica como informativo, novedad o decisión'),
        crit('cla-h2', 'Las decisiones llegan a la Mesa del coordinador con su contexto completo y su decisión reanuda la operación'),
        crit('cla-h3', 'Los contactos no exitosos se registran, se reprograman y escalan según las reglas (R29)'),
        crit('cla-h4', 'Operación en sombra sin diferencias críticas frente a las decisiones del equipo de coordinación'),
      ],
    },
    registro: {
      objetivo: 'Dejar el expediente y el historial de cada operación, la llamada de cierre al cliente, el cierre administrativo y la medición de los indicadores, y llevar todo a un piloto controlado con hiperatención.',
      habilitador: 'Operación cerrada solo tras las validaciones, con expediente completo, cliente consultado y piloto certificado.',
      resultado: 'Operación cerrada, trazable y comunicada, y piloto controlado listo para salir a producción.',
      prerrequisitos: [
        pr('reg-4', 'Alcance del piloto firmado por el cliente: canales, rutas, tipos de servicio y agentes en alcance', 'regla', 'ambos', 'disponible', { bloqueante: 'proyecto' }),
        pr('reg-1', 'Contenido, retención y acceso del expediente e historial de cada operación definidos', 'documentacion', 'cliente', 'disponible', { bloqueante: 'fase' }),
        pr('reg-2', 'Autorización para grabar las llamadas, si el cliente decide grabarlas', 'regla', 'cliente', 'requiere_validacion'),
        pr('reg-3', 'Guion de la llamada de cierre aprobado: confirmación, observaciones, calidad de la atención y cumplimiento de horarios', 'informacion', 'cliente', 'pendiente', { subproceso: SUB_LLAMADA_CIERRE }),
        pr('reg-5', 'Criterios del cierre administrativo: documentación final, condiciones económicas negociadas, costos adicionales autorizados y novedades que afecten la liquidación', 'regla', 'cliente', 'requiere_validacion', { bloqueante: 'fase' }),
        pr('reg-6', 'Definición acordada de los indicadores del proceso y de dónde se leen', 'informacion', 'ambos', 'disponible'),
        pr('reg-7', 'Operaciones reales y usuarios del cliente asignados al piloto controlado', 'informacion', 'cliente', 'disponible'),
        pr('reg-8', 'Equipo de hiperatención nombrado: coordinadores del cliente y soporte de AION', 'informacion', 'ambos', 'pendiente'),
      ],
      actividades: [
        act('reg-a1', 'Configuración del expediente e historial cronológico: solicitud, llamadas, transcripciones, negociación, confirmaciones, novedades, compromisos y soportes', 'configuracion', 2, { requiere: ['reg-1'] }),
        act('reg-a2', 'Configuración de la grabación de llamadas únicamente con autorización', 'configuracion', 2, { opcional: true, requiere: ['reg-2'] }),
        act('reg-a3', 'Configuración de la llamada de cierre y del caso de seguimiento ante una inconformidad (R24)', 'configuracion', 2, { requiere: ['reg-3'] }),
        act('reg-a4', 'Configuración del cierre administrativo: verificación previa de documentación, costos y novedades (R25)', 'configuracion', 2, { requiere: ['reg-5'] }),
        act('reg-a5', 'Configuración de la medición de los indicadores del proceso', 'configuracion', 1, { requiere: ['reg-6'] }),
        act('reg-a6', 'Pruebas integrales de extremo a extremo y pruebas de aceptación con los usuarios del cliente', 'pruebas', 3, { requiere: ['reg-7'] }),
        act('reg-a7', 'Piloto controlado con operaciones reales del alcance firmado', 'pruebas', 4, { requiere: ['reg-4', 'reg-7'] }),
        act('reg-a8', 'Hiperatención del piloto: seguimiento diario, ajustes de guiones y reglas, y certificación de salida', 'certificacion', 4, { requiere: ['reg-8'] }),
      ],
      criterios: [
        crit('reg-h1', 'El expediente de una operación de prueba contiene todo lo ocurrido y el historial permite reconstruirlo'),
        crit('reg-h2', 'La llamada de cierre registra las observaciones y una inconformidad se convierte en un caso de seguimiento'),
        crit('reg-h3', 'Una diferencia entre lo informado y lo confirmado impide el cierre automático y el cierre administrativo solo ocurre tras las validaciones'),
        crit('reg-h4', 'Pruebas de aceptación aprobadas, piloto controlado completado con hiperatención y salida a producción certificada'),
      ],
    },
  },
});

/** Procesos disponibles para la vista (otros simuladores agregan aquí el suyo). */
export const PROCESOS_IMPLEMENTACION: ProcesoImplementacion[] = [IMPLEMENTACION_HACEB];
