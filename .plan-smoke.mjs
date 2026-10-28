// src/data/procesoTexto.ts
var PARRAFOS = [
  "El proceso debe contemplar una gesti\xF3n integral de la comunicaci\xF3n y coordinaci\xF3n tanto con los transportadores como con los clientes, utilizando agentes de inteligencia artificial para automatizar llamadas, confirmar informaci\xF3n, gestionar compromisos, detectar novedades y mantener sincronizados a todos los participantes de la operaci\xF3n log\xEDstica.",
  "El proceso inicia con la recepci\xF3n de una solicitud de transporte realizada por el cliente, quien informa la necesidad de movilizar una mercanc\xEDa desde un origen hasta un destino. La solicitud puede recibirse por medio de una llamada telef\xF3nica atendida por inteligencia artificial, un formulario, una integraci\xF3n con los sistemas del cliente o mediante el registro realizado por un coordinador log\xEDstico.",
  "Cuando la solicitud ingresa mediante una llamada, el agente de inteligencia artificial atiende al cliente, identifica la empresa y la persona que realiza la solicitud, consulta las caracter\xEDsticas del servicio y recopila la informaci\xF3n necesaria para iniciar la operaci\xF3n. Durante la conversaci\xF3n verifica el origen, destino, tipo de mercanc\xEDa, peso, volumen, caracter\xEDsticas del veh\xEDculo, fecha y hora requerida para el cargue, condiciones de entrega y cualquier requisito especial. Si el cliente no dispone de toda la informaci\xF3n, el agente registra lo confirmado y programa una gesti\xF3n posterior para completar los datos faltantes.",
  "Una vez recibida la solicitud, el sistema valida que la informaci\xF3n sea suficiente para iniciar la operaci\xF3n. Si existen inconsistencias, datos incompletos o condiciones que requieren aclaraci\xF3n, el agente de inteligencia artificial puede comunicarse nuevamente con el cliente para solicitar la informaci\xF3n correspondiente. De esta manera, la validaci\xF3n no depende exclusivamente de actividades manuales del coordinador.",
  "Cuando la solicitud est\xE1 completa, se registra la operaci\xF3n con un identificador \xFAnico y se inicia la planeaci\xF3n log\xEDstica. El sistema identifica las caracter\xEDsticas del servicio, las restricciones operativas, las fechas comprometidas y los recursos requeridos. Si es necesario confirmar disponibilidad de cargue, condiciones de acceso, horarios de atenci\xF3n o instrucciones especiales, la inteligencia artificial realiza llamadas al contacto autorizado del cliente para validar estos aspectos antes de buscar un transportador.",
  "Con la informaci\xF3n confirmada, se inicia la b\xFAsqueda de transportadores que cumplan con las condiciones requeridas. El sistema consulta la base de proveedores disponibles y selecciona los candidatos que presentan mayor compatibilidad con el servicio, teniendo en cuenta ubicaci\xF3n, tipo de veh\xEDculo, capacidad, rutas habituales, historial de cumplimiento y condiciones comerciales.",
  "Posteriormente, el agente de inteligencia artificial inicia las llamadas de negociaci\xF3n con los transportadores seleccionados. Durante estas conversaciones presenta las caracter\xEDsticas del viaje, consulta la disponibilidad y el inter\xE9s en ejecutar el servicio, informa la tarifa ofrecida y recibe las contrapropuestas correspondientes.",
  "La inteligencia artificial desarrolla la negociaci\xF3n dentro de los par\xE1metros econ\xF3micos establecidos por la empresa, procurando obtener una tarifa conveniente sin superar los valores m\xE1ximos autorizados. Si el transportador acepta las condiciones, el sistema registra una aceptaci\xF3n preliminar. Cuando solicita una tarifa superior al l\xEDmite permitido, el agente presenta el resultado al coordinador para su evaluaci\xF3n, sin comprometer valores adicionales.",
  "Durante este proceso, el cliente tambi\xE9n puede recibir informaci\xF3n sobre el avance de la consecuci\xF3n del veh\xEDculo. Cuando la asignaci\xF3n presenta dificultades, no se encuentran transportadores disponibles o las condiciones de mercado superan los valores previstos, el sistema identifica la situaci\xF3n y activa una gesti\xF3n de coordinaci\xF3n con el cliente, siempre que sea necesario modificar las condiciones inicialmente solicitadas.",
  "En estos casos, el agente de inteligencia artificial puede comunicarse con el cliente para consultar si existe flexibilidad en la fecha de cargue, el horario, el tipo de veh\xEDculo o alguna otra condici\xF3n operativa que permita encontrar una alternativa. Cualquier modificaci\xF3n que implique un cambio comercial, contractual o econ\xF3mico debe quedar sujeta a autorizaci\xF3n de los responsables correspondientes.",
  "Una vez identificadas las opciones disponibles, el sistema consolida las ofertas recibidas, las condiciones de cada transportador y los resultados de las negociaciones. El coordinador puede revisar las alternativas y seleccionar la m\xE1s conveniente. Cuando las pol\xEDticas lo permitan, la plataforma puede realizar la selecci\xF3n autom\xE1ticamente si se cumplen los requisitos operativos, documentales y comerciales.",
  "Seleccionado el transportador, se realiza la validaci\xF3n de los documentos necesarios para prestar el servicio. Posteriormente, se formaliza la asignaci\xF3n y se activa una comunicaci\xF3n de confirmaci\xF3n tanto con el transportador como con el cliente.",
  "La inteligencia artificial puede llamar al cliente para informarle que el veh\xEDculo ha sido asignado, confirmar la fecha y hora de presentaci\xF3n, validar el lugar de cargue y verificar la disponibilidad de la mercanc\xEDa. Durante esta conversaci\xF3n tambi\xE9n puede solicitar el nombre y tel\xE9fono de la persona responsable de recibir el veh\xEDculo, las instrucciones de ingreso, las condiciones de seguridad y los requisitos particulares del establecimiento.",
  "Al mismo tiempo, el agente se comunica con el transportador para confirmar que recibi\xF3 la informaci\xF3n completa, conoce las condiciones del servicio y se encuentra preparado para ejecutarlo. El objetivo de esta doble confirmaci\xF3n es garantizar que tanto el cliente como el transportador tengan la misma informaci\xF3n y evitar desplazamientos innecesarios, tiempos de espera o dificultades de coordinaci\xF3n.",
  "Antes de la fecha programada para el cargue, la inteligencia artificial realiza llamadas preventivas a ambas partes. Con el transportador confirma su disponibilidad, ubicaci\xF3n y tiempo estimado de llegada. Con el cliente verifica que la mercanc\xEDa est\xE9 preparada, que el punto de cargue se encuentre disponible y que no existan cambios en la programaci\xF3n.",
  "Si el cliente informa que la mercanc\xEDa no estar\xE1 lista a la hora acordada, el agente registra la novedad, consulta el nuevo tiempo estimado y notifica al coordinador para evaluar el impacto sobre la operaci\xF3n. Tambi\xE9n puede contactar al transportador para comunicar una reprogramaci\xF3n previamente autorizada y verificar si contin\xFAa disponible.",
  "Si es el transportador quien informa una dificultad para cumplir el horario, el sistema identifica el posible retraso y coordina las acciones necesarias. La inteligencia artificial puede contactar al cliente para validar si existe margen de espera o disponibilidad para recibir el veh\xEDculo m\xE1s tarde, sin confirmar cambios definitivos antes de contar con las autorizaciones correspondientes.",
  "Una vez el transportador llega al punto de origen, el sistema verifica su presentaci\xF3n. La confirmaci\xF3n puede obtenerse mediante una actualizaci\xF3n del transportador, una llamada de inteligencia artificial o una integraci\xF3n con sistemas externos.",
  "Cuando el transportador informa su llegada, el agente puede comunicarse con el cliente para confirmar que el veh\xEDculo efectivamente se encuentra en las instalaciones, que fue autorizado su ingreso y que el proceso de cargue puede comenzar. Esta validaci\xF3n cruzada permite detectar diferencias entre lo reportado por el transportador y lo observado por el cliente.",
  "Si el veh\xEDculo se encuentra esperando porque la mercanc\xEDa no est\xE1 disponible, existe congesti\xF3n en el punto de cargue o se presenta alg\xFAn inconveniente documental, la inteligencia artificial consulta las causas y el tiempo estimado de soluci\xF3n. La novedad queda registrada y se notifica al coordinador cuando supera los par\xE1metros establecidos.",
  "Durante el cargue, el sistema realiza seguimiento al avance de la actividad, consultando con el transportador o el contacto del cliente cuando corresponda. Una vez finalizado, se confirma la hora real de salida, las condiciones del despacho y la informaci\xF3n necesaria para iniciar el recorrido.",
  "El agente de inteligencia artificial puede comunicarse con el cliente para confirmar que la mercanc\xEDa fue despachada y que la operaci\xF3n contin\xFAa hacia su destino. Cuando existan diferencias en cantidades, condiciones de la carga, documentos o instrucciones, estas deben quedar registradas para su validaci\xF3n antes de continuar.",
  "Durante el desplazamiento, la inteligencia artificial desarrolla el monitoreo de la operaci\xF3n mediante llamadas programadas al transportador. En estas conversaciones consulta el estado del viaje, la ubicaci\xF3n reportada, las novedades presentadas y la hora estimada de llegada.",
  "El sistema debe verificar que el conductor se encuentre en condiciones seguras para atender la llamada. Si est\xE1 conduciendo y no puede conversar sin distraerse, el agente debe finalizar el contacto y programarlo para un momento seguro.",
  "La informaci\xF3n obtenida en cada seguimiento se registra y permite actualizar la evoluci\xF3n de la operaci\xF3n. Si se identifica una demora, un cierre vial, una aver\xEDa o cualquier situaci\xF3n que afecte la entrega, el agente recopila los detalles, clasifica la novedad y genera las acciones de coordinaci\xF3n correspondientes.",
  "Cuando una situaci\xF3n afecta el compromiso con el cliente, la inteligencia artificial puede activar una llamada informativa para comunicar lo ocurrido, explicar el impacto conocido y consultar alternativas de recepci\xF3n cuando sea necesario. El agente debe diferenciar claramente entre informaci\xF3n confirmada y estimaciones, evitando prometer horarios o soluciones que todav\xEDa no hayan sido validados.",
  "El cliente tambi\xE9n puede comunicarse de manera entrante para consultar el estado de su operaci\xF3n. En este caso, el agente de inteligencia artificial identifica al solicitante, valida su autorizaci\xF3n para consultar la informaci\xF3n y accede al estado actualizado del servicio. Durante la llamada puede informar si el veh\xEDculo est\xE1 asignado, si se present\xF3 al cargue, si la mercanc\xEDa se encuentra en tr\xE1nsito, cu\xE1l es el \xFAltimo avance confirmado y si existen novedades pendientes.",
  "Si el cliente solicita informaci\xF3n que no est\xE1 disponible o requiere una decisi\xF3n que excede las atribuciones del agente, la inteligencia artificial debe generar una gesti\xF3n para el coordinador o transferir la comunicaci\xF3n a una persona cuando exista un mecanismo habilitado para hacerlo.",
  "De igual manera, el transportador puede comunicarse de manera entrante para reportar novedades, consultar instrucciones, informar cambios o solicitar apoyo. El sistema identifica la operaci\xF3n relacionada y registra el motivo del contacto, permitiendo mantener centralizadas las comunicaciones de ambas partes.",
  "Cuando se aproxima la hora estimada de llegada al destino, el agente de inteligencia artificial puede comunicarse con el contacto autorizado del cliente o del destinatario para confirmar que las instalaciones est\xE9n preparadas para recibir el veh\xEDculo, verificar los horarios de descargue y consultar las instrucciones de ingreso.",
  "Si el destinatario informa que no puede recibir la mercanc\xEDa en el horario previsto, la inteligencia artificial registra la situaci\xF3n y activa la coordinaci\xF3n con el transportador y el responsable log\xEDstico. Los cambios de horario, destino o condiciones de entrega deben seguir las autorizaciones definidas por la empresa.",
  "Cuando el transportador llega al destino, el sistema registra la hora reportada y puede confirmar la llegada con el contacto de recepci\xF3n. Si se presentan filas, demoras, dificultades de acceso o problemas documentales, la inteligencia artificial realiza las consultas necesarias para identificar la causa y el posible impacto.",
  "Durante el descargue, la plataforma mantiene seguimiento hasta confirmar que la mercanc\xEDa fue recibida. El agente puede comunicarse con el destinatario para validar la recepci\xF3n, consultar si se presentaron diferencias o da\xF1os y verificar si existe alguna observaci\xF3n que deba ser atendida.",
  "Una vez el transportador informa que complet\xF3 la entrega, la inteligencia artificial realiza una validaci\xF3n con el cliente o destinatario autorizado para confirmar el resultado. Si ambas partes coinciden en que el servicio fue ejecutado correctamente, el sistema registra la confirmaci\xF3n operativa y solicita los soportes correspondientes.",
  "Cuando existen diferencias entre lo informado por el transportador y lo confirmado por el cliente, el sistema no debe cerrar autom\xE1ticamente la operaci\xF3n. En su lugar, genera una novedad que permita al coordinador revisar los hechos, solicitar evidencias y determinar las acciones necesarias.",
  "Posteriormente, la inteligencia artificial puede realizar una llamada de cierre al cliente para confirmar que el servicio se complet\xF3 satisfactoriamente, consultar si existen observaciones pendientes y recoger informaci\xF3n sobre la calidad de la atenci\xF3n, el cumplimiento de los horarios y el desempe\xF1o general de la operaci\xF3n.",
  "La llamada de cierre tambi\xE9n puede utilizarse para identificar oportunidades de mejora, conocer dificultades experimentadas por el cliente y registrar recomendaciones que permitan optimizar futuros servicios. Cuando el cliente manifiesta una inconformidad, esta debe convertirse en un caso de seguimiento y no quedar registrada \xFAnicamente como un comentario.",
  "En paralelo, el sistema verifica la documentaci\xF3n final del servicio, las condiciones econ\xF3micas negociadas, los costos adicionales autorizados y las novedades que puedan afectar la liquidaci\xF3n. Solo despu\xE9s de completar las validaciones correspondientes se procede con el cierre administrativo.",
  "Toda la informaci\xF3n generada durante el proceso se conserva dentro del expediente de cada operaci\xF3n. Este expediente debe contener la solicitud inicial, las llamadas realizadas al cliente y al transportador, las transcripciones, las grabaciones cuando est\xE9n autorizadas, los resultados de negociaci\xF3n, las confirmaciones, las novedades, los compromisos adquiridos, las modificaciones aprobadas y los soportes de entrega.",
  "La plataforma debe mantener un historial cronol\xF3gico que permita reconstruir lo ocurrido en cada momento, identificar qui\xE9n suministr\xF3 una informaci\xF3n, qu\xE9 decisiones se tomaron, cu\xE1les fueron las instrucciones comunicadas y qu\xE9 actividades quedaron pendientes.",
  "Para evitar comunicaciones contradictorias, el sistema debe administrar una agenda centralizada de llamadas y seguimientos. Cada contacto realizado por inteligencia artificial debe tener un objetivo espec\xEDfico y estar vinculado a una operaci\xF3n, un interlocutor y una actividad. Cuando se confirma determinada informaci\xF3n, las tareas relacionadas deben actualizarse autom\xE1ticamente para evitar consultas duplicadas.",
  "Tambi\xE9n debe existir una coordinaci\xF3n entre los agentes de inteligencia artificial. El agente encargado de negociar con transportadores debe compartir los resultados de la asignaci\xF3n con el agente responsable del seguimiento. A su vez, el agente que se comunica con el cliente debe consultar la misma informaci\xF3n operativa para garantizar coherencia entre las conversaciones.",
  "La soluci\xF3n debe distinguir las comunicaciones informativas de aquellas que requieren una decisi\xF3n. Informar el estado de una operaci\xF3n, confirmar una hora de llegada o solicitar una actualizaci\xF3n puede gestionarse autom\xE1ticamente. Sin embargo, modificar una tarifa, aprobar sobrecostos, cambiar condiciones contractuales, cancelar un servicio o asumir compromisos no autorizados requiere la intervenci\xF3n del responsable correspondiente.",
  "Adicionalmente, el sistema debe contar con reglas para gestionar contactos no exitosos. Si el cliente o el transportador no responde, se registra el intento y se programa un nuevo contacto seg\xFAn la importancia de la actividad. Cuando la falta de respuesta pueda afectar el servicio, se genera una alerta para intervenci\xF3n humana.",
  "La plataforma debe ofrecer una visi\xF3n centralizada de las operaciones y las comunicaciones, mostrando qu\xE9 servicios se encuentran pendientes de asignaci\xF3n, cu\xE1les est\xE1n en negociaci\xF3n, qu\xE9 transportadores fueron confirmados, qu\xE9 clientes tienen informaci\xF3n pendiente, cu\xE1les operaciones est\xE1n en tr\xE1nsito y qu\xE9 novedades requieren atenci\xF3n.",
  "Los coordinadores deben poder consultar r\xE1pidamente la \xFAltima comunicaci\xF3n con cada participante, conocer los compromisos adquiridos y determinar qu\xE9 actividades debe ejecutar el sistema y cu\xE1les requieren su intervenci\xF3n directa.",
  "Finalmente, el proceso debe permitir evaluar la efectividad de la inteligencia artificial en la coordinaci\xF3n log\xEDstica. Para ello se deben medir los tiempos de respuesta de clientes y transportadores, el porcentaje de confirmaciones autom\xE1ticas, las llamadas exitosas, las negociaciones completadas, los contactos necesarios por operaci\xF3n, la anticipaci\xF3n en la detecci\xF3n de novedades, el cumplimiento de los compromisos y la satisfacci\xF3n de los clientes.",
  "El prop\xF3sito es que la inteligencia artificial no se limite a llamar al transportador para conocer d\xF3nde se encuentra, sino que funcione como un mecanismo de coordinaci\xF3n operativa entre el cliente, el transportador y el equipo log\xEDstico, capaz de recopilar informaci\xF3n, verificar compromisos, anticipar dificultades, mantener informadas a las partes y activar oportunamente la intervenci\xF3n humana cuando sea necesaria.",
  "De esta manera, cada operaci\xF3n contar\xE1 con una coordinaci\xF3n permanente desde la solicitud inicial hasta la confirmaci\xF3n final del servicio, reduciendo las llamadas manuales, las dificultades de comunicaci\xF3n, los tiempos de respuesta y los riesgos de incumplimiento, mientras se fortalece la trazabilidad y se mejora la experiencia del cliente y del transportador."
];
var P = (n) => PARRAFOS[n - 1];

// src/data/procesoData.ts
var OBJETIVO_TEXTO = P(1);
var PROPOSITO_TEXTO = [P(48), P(49)];
var BLOQUES = [
  { id: "Solicitud", nombre: "Solicitud y planeaci\xF3n", color: "#2563eb", colorBg: "#eaf1ff", descripcion: "Recibir, validar y registrar la operaci\xF3n" },
  { id: "Consecucion", nombre: "Consecuci\xF3n del veh\xEDculo", color: "#0d9488", colorBg: "#e5f6f3", descripcion: "Buscar, negociar, seleccionar y asignar" },
  { id: "Cargue", nombre: "Confirmaci\xF3n y cargue", color: "#d97706", colorBg: "#fdf1e0", descripcion: "Doble confirmaci\xF3n, preventivas, presentaci\xF3n y cargue" },
  { id: "Transito", nombre: "Tr\xE1nsito y entrega", color: "#7c3aed", colorBg: "#f2ecfd", descripcion: "Monitoreo, aviso de destino, descargue y validaci\xF3n" },
  { id: "Cierre", nombre: "Cierre y mejora", color: "#0891b2", colorBg: "#e0f4f9", descripcion: "Llamada de cierre y cierre administrativo" },
  { id: "Novedad", nombre: "Esperas y salidas", color: "#e11d48", colorBg: "#fdeaf0", descripcion: "Esperando datos, escalada al coordinador, cancelada" }
];
var FLUJO_ETAPAS = [
  { id: "Solicitud", numero: 1, nombre: "Recepci\xF3n de la solicitud", corto: "Solicitud", bloque: "Solicitud", p: [2, 3], agente: "Agente de cliente", resumen: "El cliente informa la necesidad de movilizar una mercanc\xEDa; llega por llamada, formulario, integraci\xF3n o registro del coordinador." },
  { id: "Validacion", numero: 2, nombre: "Validaci\xF3n de la solicitud", corto: "Validaci\xF3n", bloque: "Solicitud", p: [4], agente: "Agente de cliente", resumen: "El sistema valida que la informaci\xF3n sea suficiente; ante inconsistencias el agente llama de nuevo al cliente." },
  { id: "Planeacion", numero: 3, nombre: "Registro y planeaci\xF3n log\xEDstica", corto: "Planeaci\xF3n", bloque: "Solicitud", p: [5], agente: "Agente de cliente", resumen: "Se registra la operaci\xF3n con identificador \xFAnico y se confirman con el contacto autorizado cargue, acceso y horarios." },
  { id: "Busqueda", numero: 4, nombre: "B\xFAsqueda de transportadores", corto: "B\xFAsqueda", bloque: "Consecucion", p: [6], agente: "Sistema", resumen: "Se consulta la base de proveedores y se seleccionan los candidatos m\xE1s compatibles." },
  { id: "Negociacion", numero: 5, nombre: "Negociaci\xF3n con transportadores", corto: "Negociaci\xF3n", bloque: "Consecucion", p: [7, 8, 9, 10], agente: "Agente de negociaci\xF3n", resumen: "El agente llama a los candidatos, informa la tarifa y recibe contrapropuestas dentro de los l\xEDmites autorizados." },
  { id: "Seleccion", numero: 6, nombre: "Consolidaci\xF3n y selecci\xF3n", corto: "Selecci\xF3n", bloque: "Consecucion", p: [11], agente: "Sistema", resumen: "Se consolidan las ofertas; el coordinador elige o la plataforma selecciona autom\xE1ticamente si las pol\xEDticas lo permiten." },
  { id: "Asignacion", numero: 7, nombre: "Validaci\xF3n documental y asignaci\xF3n", corto: "Asignaci\xF3n", bloque: "Consecucion", p: [12], agente: "Sistema", resumen: "Se validan los documentos para prestar el servicio y se formaliza la asignaci\xF3n." },
  { id: "Confirmacion", numero: 8, nombre: "Doble confirmaci\xF3n", corto: "Confirmaci\xF3n", bloque: "Cargue", p: [13, 14], agente: "Agente de cliente", resumen: "El agente informa al cliente la asignaci\xF3n y confirma con el transportador, para que ambos tengan la misma informaci\xF3n." },
  { id: "Preventiva", numero: 9, nombre: "Llamadas preventivas", corto: "Preventivas", bloque: "Cargue", p: [15, 16, 17], agente: "Agente de seguimiento", resumen: "Antes del cargue se llama a ambas partes: disponibilidad, ubicaci\xF3n, tiempo de llegada, mercanc\xEDa preparada." },
  { id: "Presentacion", numero: 10, nombre: "Presentaci\xF3n en origen", corto: "Presentaci\xF3n", bloque: "Cargue", p: [18, 19, 20], agente: "Agente de seguimiento", resumen: "Se verifica la presentaci\xF3n del transportador y se valida de forma cruzada con el cliente." },
  { id: "Cargue", numero: 11, nombre: "Cargue y despacho", corto: "Cargue", bloque: "Cargue", p: [21, 22], agente: "Agente de seguimiento", resumen: "Seguimiento del cargue, hora real de salida y confirmaci\xF3n del despacho con el cliente." },
  { id: "Transito", numero: 12, nombre: "Monitoreo en tr\xE1nsito", corto: "Tr\xE1nsito", bloque: "Transito", p: [23, 24, 25, 26], agente: "Agente de seguimiento", resumen: "Llamadas programadas al transportador: estado, ubicaci\xF3n, novedades y hora estimada de llegada." },
  { id: "AvisoDestino", numero: 13, nombre: "Aviso de llegada al destino", corto: "Aviso destino", bloque: "Transito", p: [30, 31], agente: "Agente de cliente", resumen: "Al aproximarse la llegada se confirma con el destinatario que est\xE1 preparado para recibir." },
  { id: "Descargue", numero: 14, nombre: "Llegada y descargue", corto: "Descargue", bloque: "Transito", p: [32, 33], agente: "Agente de seguimiento", resumen: "Se registra la llegada y se hace seguimiento hasta confirmar que la mercanc\xEDa fue recibida." },
  { id: "ValidacionEntrega", numero: 15, nombre: "Validaci\xF3n de la entrega", corto: "Validaci\xF3n entrega", bloque: "Transito", p: [34, 35], agente: "Agente de cliente", resumen: "Se cruza lo informado por el transportador con lo confirmado por el cliente; si difieren, no se cierra." },
  { id: "LlamadaCierre", numero: 16, nombre: "Llamada de cierre al cliente", corto: "Llamada cierre", bloque: "Cierre", p: [36, 37], agente: "Agente de cliente", resumen: "Se confirma el servicio, se recogen observaciones y calidad; una inconformidad se convierte en caso de seguimiento." },
  { id: "CierreAdmin", numero: 17, nombre: "Cierre administrativo", corto: "Cierre admin.", bloque: "Cierre", p: [38], agente: "Sistema", resumen: "Se verifican documentaci\xF3n final, condiciones econ\xF3micas, costos adicionales y novedades; luego se cierra." }
];
var CONTACTOS_ENTRANTES = [
  { id: "cliente", nombre: "Consulta entrante del cliente", p: 27, texto: P(27) },
  { id: "fuera", nombre: "Informaci\xF3n o decisi\xF3n fuera de las atribuciones", p: 28, texto: P(28) },
  { id: "transportador", nombre: "Contacto entrante del transportador", p: 29, texto: P(29) }
];
var FLUJO_ASCII = `
 SOLICITUD \u2500\u25B6 VALIDACI\xD3N \u2500\u25B6 PLANEACI\xD3N \u2500\u25B6 B\xDASQUEDA \u2500\u25B6 NEGOCIACI\xD3N \u2500\u25B6 SELECCI\xD3N \u2500\u25B6 ASIGNACI\xD3N
 llamada IA   \xBFcompleta?     ID \xFAnico     base de      llamadas IA    coordinador   documentos
 formulario    \u2502 no          contacto     proveedores   tarifa \u2264 tope  o autom\xE1tica  validados
 integraci\xF3n   \u25BC             autorizado                  \u2502 > tope
 coordinador  llamada IA                                 \u25BC
              al cliente                           COORDINADOR decide
                                                        \u2502
 \u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518
 \u25BC
 CONFIRMACI\xD3N \u2500\u25B6 PREVENTIVAS \u2500\u25B6 PRESENTACI\xD3N \u2500\u25B6 CARGUE \u2500\u25B6 TR\xC1NSITO \u2500\u25B6 AVISO DESTINO
 cliente +       a ambas        validaci\xF3n      despacho  llamadas     destinatario
 transportador   partes         cruzada         confirmado programadas preparado
 misma info
                                                                          \u2502
 CIERRE ADMIN \u25C0\u2500 LLAMADA CIERRE \u25C0\u2500 VALIDACI\xD3N ENTREGA \u25C0\u2500 DESCARGUE \u25C0\u2500\u2500\u2500\u2500\u2500\u2518
 documentos,     satisfacci\xF3n,     transportador vs.      recepci\xF3n,
 costos,         inconformidad \u2192   cliente: si difieren   diferencias
 novedades       caso seguimiento  NO se cierra \u2192 novedad

 Transversal: agenda centralizada \xB7 expediente \xB7 historial \xB7 coordinaci\xF3n entre agentes
`.trim();
var REGLAS = [
  { id: "R01", politica: "POL-VAL-01", tema: "Validaci\xF3n", p: 4, etapas: ["Validacion"], texto: "El sistema valida que la informaci\xF3n sea suficiente; ante inconsistencias o datos incompletos, el agente puede comunicarse nuevamente con el cliente. La validaci\xF3n no depende exclusivamente de actividades manuales del coordinador." },
  { id: "R02", politica: "POL-VAL-01", tema: "Validaci\xF3n", p: 3, etapas: ["Solicitud", "Validacion"], texto: "Si el cliente no dispone de toda la informaci\xF3n, el agente registra lo confirmado y programa una gesti\xF3n posterior para completar los datos faltantes." },
  { id: "R03", politica: "POL-REG-01", tema: "Registro", p: 5, etapas: ["Planeacion"], texto: "Cuando la solicitud est\xE1 completa, se registra la operaci\xF3n con un identificador \xFAnico y se inicia la planeaci\xF3n log\xEDstica." },
  { id: "R04", politica: "POL-REG-01", tema: "Registro", p: 5, etapas: ["Planeacion"], texto: "Se confirma con el contacto autorizado del cliente la disponibilidad de cargue, condiciones de acceso, horarios de atenci\xF3n e instrucciones especiales antes de buscar un transportador." },
  { id: "R05", politica: "POL-BUS-01", tema: "B\xFAsqueda", p: 6, etapas: ["Busqueda"], texto: "Se seleccionan los candidatos con mayor compatibilidad seg\xFAn ubicaci\xF3n, tipo de veh\xEDculo, capacidad, rutas habituales, historial de cumplimiento y condiciones comerciales." },
  { id: "R06", politica: "POL-NEG-01", tema: "Negociaci\xF3n", p: 8, etapas: ["Negociacion"], texto: "La negociaci\xF3n se desarrolla dentro de los par\xE1metros econ\xF3micos establecidos por la empresa, sin superar los valores m\xE1ximos autorizados." },
  { id: "R07", politica: "POL-NEG-01", tema: "Negociaci\xF3n", p: 8, etapas: ["Negociacion"], texto: "Cuando el transportador solicita una tarifa superior al l\xEDmite permitido, el agente presenta el resultado al coordinador, sin comprometer valores adicionales." },
  { id: "R08", politica: "POL-AUT-01", tema: "Autorizaci\xF3n", p: 10, etapas: ["Negociacion"], texto: "Cualquier modificaci\xF3n que implique un cambio comercial, contractual o econ\xF3mico queda sujeta a autorizaci\xF3n de los responsables correspondientes." },
  { id: "R09", politica: "POL-SEL-01", tema: "Selecci\xF3n", p: 11, etapas: ["Seleccion"], texto: "Cuando las pol\xEDticas lo permitan, la plataforma puede seleccionar autom\xE1ticamente si se cumplen los requisitos operativos, documentales y comerciales; si no, el coordinador revisa y selecciona." },
  { id: "R10", politica: "POL-DOC-01", tema: "Documentos", p: 12, etapas: ["Asignacion"], texto: "Seleccionado el transportador, se validan los documentos necesarios para prestar el servicio antes de formalizar la asignaci\xF3n." },
  { id: "R11", politica: "POL-CON-01", tema: "Confirmaci\xF3n", p: 14, etapas: ["Confirmacion"], texto: "Doble confirmaci\xF3n con cliente y transportador para garantizar que ambos tengan la misma informaci\xF3n y evitar desplazamientos innecesarios y tiempos de espera." },
  { id: "R12", politica: "POL-PRE-01", tema: "Preventivas", p: 15, etapas: ["Preventiva"], texto: "Antes de la fecha programada para el cargue se realizan llamadas preventivas a ambas partes: disponibilidad, ubicaci\xF3n y tiempo estimado de llegada; mercanc\xEDa preparada, punto de cargue disponible, sin cambios." },
  { id: "R13", politica: "POL-PRE-01", tema: "Preventivas", p: 16, etapas: ["Preventiva"], texto: "Si la mercanc\xEDa no estar\xE1 lista, el agente registra la novedad, consulta el nuevo tiempo estimado y notifica al coordinador; solo comunica al transportador una reprogramaci\xF3n previamente autorizada." },
  { id: "R14", politica: "POL-AUT-01", tema: "Retrasos", p: 17, etapas: ["Preventiva", "Transito"], texto: "Ante un posible retraso del transportador se consulta al cliente si hay margen de espera, sin confirmar cambios definitivos antes de contar con las autorizaciones correspondientes." },
  { id: "R15", politica: "POL-CRU-01", tema: "Validaci\xF3n cruzada", p: 19, etapas: ["Presentacion"], texto: "Cuando el transportador informa su llegada se confirma con el cliente que el veh\xEDculo est\xE1 en las instalaciones y fue autorizado su ingreso, para detectar diferencias entre lo reportado y lo observado." },
  { id: "R16", politica: "POL-ESP-01", tema: "Esperas", p: 20, etapas: ["Presentacion", "Cargue"], texto: "Si el veh\xEDculo espera por mercanc\xEDa no disponible, congesti\xF3n o inconveniente documental, la IA consulta causas y tiempo de soluci\xF3n; se notifica al coordinador cuando supera los par\xE1metros establecidos." },
  { id: "R17", politica: "POL-DES-01", tema: "Despacho", p: 22, etapas: ["Cargue"], texto: "Cuando existan diferencias en cantidades, condiciones de la carga, documentos o instrucciones, estas deben quedar registradas para su validaci\xF3n antes de continuar." },
  { id: "R18", politica: "POL-SEG-01", tema: "Seguridad del conductor", p: 24, etapas: ["Transito"], texto: "El sistema verifica que el conductor est\xE9 en condiciones seguras para atender la llamada; si est\xE1 conduciendo, el agente finaliza el contacto y lo programa para un momento seguro." },
  { id: "R19", politica: "POL-COM-01", tema: "Comunicaci\xF3n", p: 26, etapas: ["Transito"], texto: "El agente debe diferenciar claramente entre informaci\xF3n confirmada y estimaciones, evitando prometer horarios o soluciones que todav\xEDa no hayan sido validados." },
  { id: "R20", politica: "POL-INF-01", tema: "Consulta entrante", p: 27, etapas: ["Transito"], texto: "En una llamada entrante el agente identifica al solicitante y valida su autorizaci\xF3n para consultar la informaci\xF3n antes de acceder al estado del servicio." },
  { id: "R21", politica: "POL-AUT-01", tema: "Atribuciones", p: 28, etapas: ["Transito"], texto: "Si el cliente solicita informaci\xF3n no disponible o una decisi\xF3n que excede las atribuciones del agente, se genera una gesti\xF3n para el coordinador o se transfiere a una persona cuando exista el mecanismo." },
  { id: "R22", politica: "POL-AUT-01", tema: "Destino", p: 31, etapas: ["AvisoDestino"], texto: "Los cambios de horario, destino o condiciones de entrega deben seguir las autorizaciones definidas por la empresa." },
  { id: "R23", politica: "POL-CIE-01", tema: "Cierre", p: 35, etapas: ["ValidacionEntrega"], texto: "Cuando existen diferencias entre lo informado por el transportador y lo confirmado por el cliente, el sistema no debe cerrar autom\xE1ticamente la operaci\xF3n: genera una novedad para que el coordinador revise hechos y solicite evidencias." },
  { id: "R24", politica: "POL-CIE-02", tema: "Cierre", p: 37, etapas: ["LlamadaCierre"], texto: "Cuando el cliente manifiesta una inconformidad, esta debe convertirse en un caso de seguimiento y no quedar registrada \xFAnicamente como un comentario." },
  { id: "R25", politica: "POL-CIE-01", tema: "Cierre", p: 38, etapas: ["CierreAdmin"], texto: "Solo despu\xE9s de verificar documentaci\xF3n final, condiciones econ\xF3micas negociadas, costos adicionales autorizados y novedades que afecten la liquidaci\xF3n se procede con el cierre administrativo." },
  { id: "R26", politica: "POL-AGE-01", tema: "Agenda", p: 41, etapas: [], texto: "Cada contacto realizado por IA tiene un objetivo espec\xEDfico y est\xE1 vinculado a una operaci\xF3n, un interlocutor y una actividad; al confirmarse informaci\xF3n, las tareas relacionadas se actualizan para evitar consultas duplicadas." },
  { id: "R27", politica: "POL-COO-01", tema: "Coordinaci\xF3n entre agentes", p: 42, etapas: [], texto: "El agente de negociaci\xF3n comparte los resultados de la asignaci\xF3n con el de seguimiento; el agente que habla con el cliente consulta la misma informaci\xF3n operativa." },
  { id: "R28", politica: "POL-AUT-01", tema: "Autorizaci\xF3n", p: 43, etapas: [], texto: "Informar el estado, confirmar una hora de llegada o solicitar una actualizaci\xF3n puede gestionarse autom\xE1ticamente; modificar una tarifa, aprobar sobrecostos, cambiar condiciones contractuales, cancelar un servicio o asumir compromisos no autorizados requiere al responsable." },
  { id: "R29", politica: "POL-CON-02", tema: "Contactos no exitosos", p: 44, etapas: [], texto: "Si el cliente o el transportador no responde, se registra el intento y se programa un nuevo contacto seg\xFAn la importancia de la actividad; si la falta de respuesta puede afectar el servicio, se genera una alerta para intervenci\xF3n humana." },
  { id: "R30", politica: "POL-GRA-01", tema: "Expediente", p: 39, etapas: [], texto: "El expediente conserva las grabaciones cuando est\xE9n autorizadas y todas las transcripciones." }
];
var REGLA_POR_ID = Object.fromEntries(REGLAS.map((r) => [r.id, r]));
var EXCEPCIONES_LISTA = [
  { tipo: "Datos_incompletos", nombre: "Datos incompletos o inconsistentes", p: 4, regla: "R01", categoria: "automatico", texto: P(4) },
  { tipo: "Sin_respuesta", nombre: "Contacto no exitoso", p: 44, regla: "R29", categoria: "automatico", texto: P(44) },
  { tipo: "Tarifa_sobre_tope", nombre: "Tarifa solicitada sobre el l\xEDmite", p: 8, regla: "R07", categoria: "humano", texto: P(8) },
  { tipo: "Sin_transportador", nombre: "Sin transportadores o mercado sobre lo previsto", p: 9, regla: "R08", categoria: "humano", texto: P(9) },
  { tipo: "Seleccion_manual", nombre: "Selecci\xF3n por el coordinador", p: 11, regla: "R09", categoria: "asistido", texto: P(11) },
  { tipo: "Mercancia_no_lista", nombre: "Mercanc\xEDa no estar\xE1 lista", p: 16, regla: "R13", categoria: "asistido", texto: P(16) },
  { tipo: "Retraso_transportador", nombre: "Transportador con dificultad de horario", p: 17, regla: "R14", categoria: "asistido", texto: P(17) },
  { tipo: "Diferencia_llegada", nombre: "Diferencia entre lo reportado y lo observado en origen", p: 19, regla: "R15", categoria: "asistido", texto: P(19) },
  { tipo: "Espera_en_cargue", nombre: "Veh\xEDculo esperando en el punto de cargue", p: 20, regla: "R16", categoria: "asistido", texto: P(20) },
  { tipo: "Diferencia_despacho", nombre: "Diferencias en cantidades, carga, documentos o instrucciones", p: 22, regla: "R17", categoria: "asistido", texto: P(22) },
  { tipo: "Novedad_en_ruta", nombre: "Demora, cierre vial o aver\xEDa en ruta", p: 25, regla: "R19", categoria: "asistido", texto: P(25) },
  { tipo: "Conductor_ocupado", nombre: "Conductor conduciendo", p: 24, regla: "R18", categoria: "automatico", texto: P(24) },
  { tipo: "Destinatario_no_recibe", nombre: "Destinatario no puede recibir en el horario", p: 31, regla: "R22", categoria: "humano", texto: P(31) },
  { tipo: "Demora_en_descargue", nombre: "Filas, demoras, acceso o problemas documentales en destino", p: 32, regla: "R16", categoria: "asistido", texto: P(32) },
  { tipo: "Diferencia_entrega", nombre: "Entrega informada \u2260 entrega confirmada", p: 35, regla: "R23", categoria: "asistido", texto: P(35) },
  { tipo: "Inconformidad_cliente", nombre: "Inconformidad del cliente", p: 37, regla: "R24", categoria: "asistido", texto: P(37) },
  { tipo: "Sobrecosto_liquidacion", nombre: "Costos adicionales o novedades que afectan la liquidaci\xF3n", p: 38, regla: "R25", categoria: "humano", texto: P(38) }
];
var TRANSVERSALES = [
  { id: "agenda", nombre: "Agenda centralizada de llamadas y seguimientos", p: 41, texto: P(41) },
  { id: "coordinacion", nombre: "Coordinaci\xF3n entre agentes de IA", p: 42, texto: P(42) },
  { id: "decision", nombre: "Informar vs. decidir", p: 43, texto: P(43) },
  { id: "no-exitosos", nombre: "Reglas para contactos no exitosos", p: 44, texto: P(44) },
  { id: "expediente", nombre: "Expediente de la operaci\xF3n", p: 39, texto: P(39) },
  { id: "historial", nombre: "Historial cronol\xF3gico", p: 40, texto: P(40) }
];
var ETAPA_POR_ID = Object.fromEntries(
  FLUJO_ETAPAS.map((e) => [e.id, e])
);

// src/lib/rng.ts
function elegir(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}
function entre(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}
function mezclar(rng, arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// src/data/mockData.ts
var ETAPAS_FLUJO = FLUJO_ETAPAS.map((e) => e.id);
var TODAS_LAS_ETAPAS = [...ETAPAS_FLUJO, "EsperaDatos", "Escalada", "Cerrada", "Cancelada"];
var esTerminal = (e) => e === "Cerrada" || e === "Cancelada";
var esEtapaFlujo = (e) => ETAPAS_FLUJO.includes(e);
var ETAPA_LABEL = {
  ...Object.fromEntries(FLUJO_ETAPAS.map((e) => [e.id, e.nombre])),
  EsperaDatos: "Esperando datos del cliente",
  Escalada: "En manos del coordinador",
  Cerrada: "Cerrada",
  Cancelada: "Cancelada"
};
var ETAPA_LABEL_CORTO = {
  ...Object.fromEntries(FLUJO_ETAPAS.map((e) => [e.id, e.corto])),
  EsperaDatos: "Espera datos",
  Escalada: "Coordinador",
  Cerrada: "Cerrada",
  Cancelada: "Cancelada"
};
var ETAPA_NUMERO = {
  ...Object.fromEntries(FLUJO_ETAPAS.map((e) => [e.id, e.numero])),
  EsperaDatos: 0,
  Escalada: 0,
  Cerrada: 0,
  Cancelada: 0
};
var ETAPA_BLOQUE = {
  ...Object.fromEntries(FLUJO_ETAPAS.map((e) => [e.id, e.bloque])),
  EsperaDatos: "Novedad",
  Escalada: "Novedad",
  Cerrada: "Cierre",
  Cancelada: "Novedad"
};
var BLOQUE_COLOR = Object.fromEntries(
  BLOQUES.map((b) => [
    b.id,
    {
      color: b.color,
      bg: b.colorBg,
      clase: b.id === "Solicitud" ? "bg-captura-light text-captura-dark border-captura/25" : b.id === "Consecucion" ? "bg-validacion-light text-validacion-dark border-validacion/25" : b.id === "Cargue" ? "bg-promesa-light text-promesa-dark border-promesa/25" : b.id === "Transito" ? "bg-liberacion-light text-liberacion-dark border-liberacion/25" : b.id === "Cierre" ? "bg-comunicacion-light text-comunicacion-dark border-comunicacion/25" : "bg-excepcion-light text-excepcion-dark border-excepcion/25"
    }
  ])
);
var ETAPA_BADGE = Object.fromEntries(
  TODAS_LAS_ETAPAS.map((e) => [e, BLOQUE_COLOR[ETAPA_BLOQUE[e]].clase])
);
function progresoDe(e, previa) {
  if (e === "Cerrada") return 100;
  const base = esEtapaFlujo(e) ? e : previa;
  if (!base) return 0;
  return Math.round((ETAPAS_FLUJO.indexOf(base) + (e === "Cancelada" ? 0 : 0.5)) / ETAPAS_FLUJO.length * 100);
}
function siguienteEtapa(e) {
  const i = ETAPAS_FLUJO.indexOf(e);
  return i === ETAPAS_FLUJO.length - 1 ? "Cerrada" : ETAPAS_FLUJO[i + 1];
}
var CANALES = ["llamada_ia", "formulario", "integracion", "coordinador"];
var CANAL_INFO = {
  llamada_ia: { label: "Llamada atendida por IA", corto: "LLAMADA", color: "#7c3aed" },
  formulario: { label: "Formulario", corto: "FORM", color: "#2563eb" },
  integracion: { label: "Integraci\xF3n con el cliente", corto: "INTEGR.", color: "#0d9488" },
  coordinador: { label: "Registro del coordinador", corto: "COORD.", color: "#d97706" }
};
var CLIENTES = [
  { id: "CL-001", nombre: "Distribuidora Andina del Hogar", tipo: "Distribuidor mayorista", contacto: "Marcela Ortiz", telefono: "+57 604 555 0101" },
  { id: "CL-002", nombre: "Almacenes La Ceiba", tipo: "Cadena de almacenes", contacto: "Juli\xE1n Barrera", telefono: "+57 601 555 0112" },
  { id: "CL-003", nombre: "Electrohogar del Caribe", tipo: "Distribuidor regional", contacto: "Paola Mendoza", telefono: "+57 605 555 0123" },
  { id: "CL-004", nombre: "Mercaplus Colombia", tipo: "Hipermercado", contacto: "Camilo Rinc\xF3n", telefono: "+57 601 555 0134" },
  { id: "CL-005", nombre: "Casa Confort Pac\xEDfico", tipo: "Cadena de almacenes", contacto: "Diana Cuero", telefono: "+57 602 555 0145" },
  { id: "CL-006", nombre: "Constructora Altavista", tipo: "Constructora (proyecto)", contacto: "Ricardo Salazar", telefono: "+57 604 555 0156" },
  { id: "CL-007", nombre: "Tiendas Mi Hogar Oriente", tipo: "Cadena de almacenes", contacto: "Natalia Pardo", telefono: "+57 607 555 0167" },
  { id: "CL-008", nombre: "Comercial Cafetera del Eje", tipo: "Distribuidor regional", contacto: "Andr\xE9s Giraldo", telefono: "+57 606 555 0178" },
  { id: "CL-009", nombre: "S\xFAper Ahorro Santanderes", tipo: "Hipermercado", contacto: "Liliana Ardila", telefono: "+57 607 555 0189" },
  { id: "CL-010", nombre: "Muebles y Electros del Sur", tipo: "Distribuidor regional", contacto: "Hern\xE1n Ibarra", telefono: "+57 602 555 0190" },
  { id: "CL-011", nombre: "Grupo Inmobiliario Bah\xEDa", tipo: "Constructora (proyecto)", contacto: "Sof\xEDa Villamizar", telefono: "+57 605 555 0201" },
  { id: "CL-012", nombre: "Centro Comercial Los Llanos", tipo: "Cadena de almacenes", contacto: "Mauricio C\xE1rdenas", telefono: "+57 608 555 0212" }
];
var NODOS = [
  { id: "N-MDE", ciudad: "Medell\xEDn", lugar: "Planta y CEDI Copacabana", lat: 6.35, lng: -75.51 },
  { id: "N-BOG", ciudad: "Bogot\xE1", lugar: "Bodega Fontib\xF3n", lat: 4.67, lng: -74.14 },
  { id: "N-CLO", ciudad: "Cali", lugar: "Centro de distribuci\xF3n Yumbo", lat: 3.58, lng: -76.49 },
  { id: "N-BAQ", ciudad: "Barranquilla", lugar: "Bodega Zona Franca", lat: 10.96, lng: -74.8 },
  { id: "N-BGA", ciudad: "Bucaramanga", lugar: "Almac\xE9n Gir\xF3n", lat: 7.07, lng: -73.17 },
  { id: "N-PEI", ciudad: "Pereira", lugar: "Bodega Dosquebradas", lat: 4.81, lng: -75.69 },
  { id: "N-CTG", ciudad: "Cartagena", lugar: "Bodega Mamonal", lat: 10.34, lng: -75.5 },
  { id: "N-CUC", ciudad: "C\xFAcuta", lugar: "Almac\xE9n Zona Industrial", lat: 7.89, lng: -72.5 },
  { id: "N-IBG", ciudad: "Ibagu\xE9", lugar: "Bodega Picale\xF1a", lat: 4.44, lng: -75.2 },
  { id: "N-SMR", ciudad: "Santa Marta", lugar: "Almac\xE9n Gaira", lat: 11.24, lng: -74.2 },
  { id: "N-PSO", ciudad: "Pasto", lugar: "Bodega Parque Industrial", lat: 1.21, lng: -77.28 },
  { id: "N-MZL", ciudad: "Manizales", lugar: "Almac\xE9n Los Cedros", lat: 5.07, lng: -75.52 },
  { id: "N-VVC", ciudad: "Villavicencio", lugar: "Bodega Anillo Vial", lat: 4.14, lng: -73.63 }
];
var NODOS_ORIGEN = NODOS.filter((n) => ["N-MDE", "N-BOG", "N-CLO", "N-BAQ"].includes(n.id));
var TRANSPORTADORES = [
  { id: "TR-01", nombre: "Transportes Andina Carga", base: "Medell\xEDn", flota: ["Tractomula", "Doble troque", "Sencillo"], cumplimiento: 96, conductor: "Gustavo Londo\xF1o", telefono: "+57 310 555 0301", placa: "SXK 482" },
  { id: "TR-02", nombre: "Log\xEDstica R\xEDo Magdalena", base: "Barrancabermeja", flota: ["Tractomula", "Doble troque"], cumplimiento: 91, conductor: "Edwin Martelo", telefono: "+57 311 555 0302", placa: "TQB 915" },
  { id: "TR-03", nombre: "Fletes del Pac\xEDfico", base: "Cali", flota: ["Sencillo", "Turbo", "Camioneta NHR"], cumplimiento: 94, conductor: "Jhon Fredy Qui\xF1ones", telefono: "+57 312 555 0303", placa: "WLM 207" },
  { id: "TR-04", nombre: "Cargas Express Capital", base: "Bogot\xE1", flota: ["Turbo", "Sencillo", "Camioneta NHR"], cumplimiento: 89, conductor: "Wilson Pe\xF1a", telefono: "+57 313 555 0304", placa: "UDH 630" },
  { id: "TR-05", nombre: "Transurandina", base: "Bucaramanga", flota: ["Tractomula", "Sencillo"], cumplimiento: 92, conductor: "N\xE9stor Rueda", telefono: "+57 314 555 0305", placa: "SOP 118" },
  { id: "TR-06", nombre: "Costa Atl\xE1ntica Log\xEDstica", base: "Barranquilla", flota: ["Tractomula", "Doble troque", "Turbo"], cumplimiento: 87, conductor: "Rafael Pertuz", telefono: "+57 315 555 0306", placa: "KJR 744" },
  { id: "TR-07", nombre: "Eje Cafetero Transportes", base: "Pereira", flota: ["Sencillo", "Turbo", "Camioneta NHR"], cumplimiento: 95, conductor: "\xD3scar Duque", telefono: "+57 316 555 0307", placa: "VHT 359" },
  { id: "TR-08", nombre: "Montecarga del Sur", base: "Pasto", flota: ["Sencillo", "Turbo"], cumplimiento: 90, conductor: "\xC1lvaro Chamorro", telefono: "+57 317 555 0308", placa: "XNC 521" },
  { id: "TR-09", nombre: "Veloz Carga Oriente", base: "Villavicencio", flota: ["Doble troque", "Sencillo", "Turbo"], cumplimiento: 85, conductor: "Henry Ram\xEDrez", telefono: "+57 318 555 0309", placa: "TZA 876" },
  { id: "TR-10", nombre: "Grupo Vial Antioquia", base: "Medell\xEDn", flota: ["Tractomula", "Sencillo", "Turbo"], cumplimiento: 93, conductor: "Fabi\xE1n Zapata", telefono: "+57 319 555 0310", placa: "SKN 063" }
];
var MERCANCIAS = [
  { tipo: "Refrigeraci\xF3n", descripcion: "Neveras no frost 300 L", kgUnidad: 68, m3Unidad: 0.62 },
  { tipo: "Refrigeraci\xF3n", descripcion: "Neveras 2 puertas 420 L", kgUnidad: 82, m3Unidad: 0.85 },
  { tipo: "Refrigeraci\xF3n", descripcion: "Congeladores horizontales", kgUnidad: 55, m3Unidad: 0.7 },
  { tipo: "Lavado", descripcion: "Lavadoras de carga superior 18 kg", kgUnidad: 52, m3Unidad: 0.48 },
  { tipo: "Lavado", descripcion: "Lavasecas 20 kg", kgUnidad: 71, m3Unidad: 0.6 },
  { tipo: "Cocci\xF3n", descripcion: "Estufas a gas de 4 puestos", kgUnidad: 34, m3Unidad: 0.35 },
  { tipo: "Cocci\xF3n", descripcion: "Estufas de empotrar", kgUnidad: 22, m3Unidad: 0.18 },
  { tipo: "Cocci\xF3n", descripcion: "Hornos el\xE9ctricos de empotrar", kgUnidad: 28, m3Unidad: 0.2 },
  { tipo: "Calentamiento de agua", descripcion: "Calentadores de paso a gas", kgUnidad: 9, m3Unidad: 0.04 },
  { tipo: "Campanas", descripcion: "Campanas extractoras de pared", kgUnidad: 14, m3Unidad: 0.12 },
  { tipo: "Peque\xF1os electrodom\xE9sticos", descripcion: "Licuadoras y freidoras (cajas master)", kgUnidad: 11, m3Unidad: 0.09 },
  { tipo: "Repuestos", descripcion: "Repuestos y accesorios para servicio t\xE9cnico", kgUnidad: 6, m3Unidad: 0.03 }
];
var REQUISITOS_ESPECIALES = [
  "Descargue con montacargas del cliente",
  "Cita previa en el muelle",
  "Ingreso con ARL y dotaci\xF3n completa",
  "Entrega en horario de recibo de 7:00 a 11:00",
  "Carga fr\xE1gil: sin apilar m\xE1s de dos niveles",
  "Sellos de seguridad en el contenedor",
  "Ayudante para descargue manual"
];
var CONDICIONES_ENTREGA = [
  "Entrega en bodega del cliente, recibo con acta",
  "Entrega en punto de venta, descargue por el conductor",
  "Entrega en obra, con firma del residente",
  "Entrega en CEDI del cliente con cita"
];
var DATOS_QUE_PUEDEN_FALTAR = [
  "Volumen de la carga",
  "Peso exacto",
  "Hora requerida de cargue",
  "Contacto de recibo en destino",
  "Requisitos de ingreso a la planta",
  "Tipo de veh\xEDculo requerido"
];
var KM_VEHICULO = {
  "Camioneta NHR": { cop: 3800, kg: 1800 },
  Turbo: { cop: 4800, kg: 4500 },
  Sencillo: { cop: 6200, kg: 8500 },
  "Doble troque": { cop: 7800, kg: 17e3 },
  Tractomula: { cop: 9400, kg: 32e3 }
};
function distanciaKm(a, b) {
  const R = 6371;
  const rad = (x) => x * Math.PI / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)) * 1.32);
}
function tarifaReferencia(vehiculo, km) {
  const base = KM_VEHICULO[vehiculo].cop * km + 38e4;
  return Math.round(base / 1e4) * 1e4;
}
function tarifaTope(referencia) {
  return Math.round(referencia * 1.08 / 1e4) * 1e4;
}
function vehiculoPara(pesoKg) {
  if (pesoKg <= 1800) return "Camioneta NHR";
  if (pesoKg <= 4500) return "Turbo";
  if (pesoKg <= 8500) return "Sencillo";
  if (pesoKg <= 17e3) return "Doble troque";
  return "Tractomula";
}
var contadorOperaciones = 0;
function siguienteSeq() {
  contadorOperaciones += 1;
  return contadorOperaciones;
}
var idOperacion = (seq) => `OP-${String(seq).padStart(4, "0")}`;
function generarMercancia(rng) {
  const m = elegir(rng, MERCANCIAS);
  const unidades = entre(rng, 18, 220);
  return {
    tipo: m.tipo,
    descripcion: m.descripcion,
    unidades,
    pesoKg: Math.round(unidades * m.kgUnidad),
    volumenM3: Math.round(unidades * m.m3Unidad * 10) / 10
  };
}
function generarOperacion(ts, rng, seq = siguienteSeq()) {
  const canal2 = elegir(rng, ["llamada_ia", "llamada_ia", "formulario", "formulario", "integracion", "coordinador"]);
  const cliente = elegir(rng, CLIENTES);
  const nodoOrigen = elegir(rng, NODOS_ORIGEN);
  const nodoDestino = elegir(rng, NODOS.filter((n) => n.id !== nodoOrigen.id));
  const mercancia = generarMercancia(rng);
  const vehiculo = vehiculoPara(mercancia.pesoKg);
  const km = distanciaKm(nodoOrigen, nodoDestino);
  const ref = tarifaReferencia(vehiculo, km);
  const diaCargue = new Date(ts + entre(rng, 1, 3) * 864e5);
  if (diaCargue.getDay() === 0) diaCargue.setDate(diaCargue.getDate() + 1);
  diaCargue.setHours(7 + entre(rng, 0, 7), entre(rng, 0, 1) * 30, 0, 0);
  const fechaCargue = diaCargue.getTime();
  const llamada = canal2 === "llamada_ia";
  const faltan = llamada && rng() < 0.3 ? mezclar(rng, DATOS_QUE_PUEDEN_FALTAR).slice(0, entre(rng, 1, 2)) : [];
  return {
    id: idOperacion(seq),
    seq,
    canal: canal2,
    origen: "simulacion",
    cliente,
    solicitante: cliente.contacto,
    nodoOrigen,
    nodoDestino,
    mercancia,
    vehiculoRequerido: vehiculo,
    fechaCargue,
    condicionesEntrega: elegir(rng, CONDICIONES_ENTREGA),
    requisitoEspecial: rng() < 0.55 ? elegir(rng, REQUISITOS_ESPECIALES) : null,
    datosPendientes: faltan,
    tarifaMaxima: tarifaTope(ref),
    tarifaPactada: null,
    costosAdicionales: 0,
    distanciaKm: km,
    etapa: "Solicitud",
    etapaRetorno: null,
    bloque: "Solicitud",
    progreso: 0,
    ofertas: [],
    transportador: null,
    receptor: null,
    llamadas: [],
    compromisos: [],
    intentosContacto: 0,
    excepcion: null,
    excepcionesPrevias: [],
    trazas: [],
    eventos: [],
    soportes: [],
    intervencionHumana: false,
    causaCancelacion: null,
    horaSalida: null,
    horaEntrega: null,
    retrasoHoras: 0,
    satisfaccion: null,
    casoSeguimiento: false,
    fechaCreacion: ts,
    fechaActualizacion: ts,
    fechaCierre: null
  };
}
var cop = (v) => `$ ${new Intl.NumberFormat("es-CO").format(Math.round(v))}`;
var alt = (id, titulo, descripcion, impactoCosto, impactoHoras, impactoSLA, reglas, efecto = { tipo: "continuar" }) => ({ id, titulo, descripcion, impactoCosto, impactoHoras, impactoSLA, reglas, efecto });
var ruta = (op) => `${op.nodoOrigen.ciudad} \u2192 ${op.nodoDestino.ciudad}`;
var PLANTILLA_EXCEPCION = {
  Datos_incompletos: {
    tipo: "Datos_incompletos",
    nombre: "Datos incompletos o inconsistentes",
    categoriaBase: "automatico",
    etapas: ["Validacion"],
    peso: 3,
    politica: "POL-VAL-01",
    regla: "R01",
    agente: "Agente de cliente",
    rechazo: { tipo: "continuar" },
    anticipacion: [240, 960],
    construir: (op, rng) => {
      const faltan = op.datosPendientes.length > 0 ? op.datosPendientes : [elegir(rng, DATOS_QUE_PUEDEN_FALTAR)];
      return {
        titulo: `Solicitud ${op.id} con datos por completar`,
        causa: `El cliente no ten\xEDa a la mano: ${faltan.join(", ").toLowerCase()}.`,
        impacto: "No se puede registrar la operaci\xF3n ni buscar transportador hasta completar la informaci\xF3n.",
        evidencia: [`Datos confirmados: ${ruta(op)}, ${op.mercancia.descripcion}`, `Faltan: ${faltan.join(" \xB7 ")}`, "El agente registr\xF3 lo confirmado y program\xF3 una gesti\xF3n posterior (R02)."],
        alternativas: [
          alt("A", "Llamar de nuevo al contacto autorizado", "El agente de cliente vuelve a llamar en la ventana acordada y completa los datos.", 0, 2, "bajo", ["R01", "R02"]),
          alt("B", "Enviar el formulario de datos faltantes", "El cliente completa lo pendiente por el formulario.", 0, 4, "medio", ["R01"]),
          alt("C", "El coordinador completa con el cliente", "Una persona contacta al solicitante.", 0, 3, "bajo", ["R01"])
        ],
        recomendada: "A"
      };
    }
  },
  Sin_respuesta: {
    tipo: "Sin_respuesta",
    nombre: "Contacto no exitoso",
    categoriaBase: "automatico",
    etapas: ["Confirmacion", "Preventiva", "Presentacion", "Transito", "AvisoDestino", "LlamadaCierre"],
    peso: 2.5,
    politica: "POL-CON-02",
    regla: "R29",
    agente: "Agente de seguimiento",
    rechazo: { tipo: "continuar" },
    anticipacion: [60, 240],
    categoria: (op) => op.intentosContacto >= 2 ? "asistido" : "automatico",
    construir: (op) => ({
      titulo: `Sin respuesta del contacto \xB7 intento ${op.intentosContacto + 1}`,
      causa: "El interlocutor no contest\xF3 la llamada programada.",
      impacto: op.intentosContacto >= 2 ? "La falta de respuesta puede afectar el servicio: se alerta al coordinador (R29)." : "Se registra el intento y se reprograma seg\xFAn la importancia de la actividad.",
      evidencia: [`Intentos acumulados: ${op.intentosContacto + 1}`, "Intento registrado en la agenda centralizada (R26)."],
      alternativas: [
        alt("A", "Reintentar en 30 minutos", "Nuevo contacto programado por el mismo agente.", 0, 0.5, "bajo", ["R29"]),
        alt("B", "Llamar a un contacto alterno autorizado", "Se usa el segundo contacto registrado en la operaci\xF3n.", 0, 0.3, "bajo", ["R29", "R20"]),
        alt("C", "Alertar al coordinador", "Intervenci\xF3n humana directa.", 0, 0.5, "bajo", ["R29"])
      ],
      recomendada: op.intentosContacto >= 2 ? "C" : "A"
    })
  },
  Tarifa_sobre_tope: {
    tipo: "Tarifa_sobre_tope",
    nombre: "Tarifa solicitada sobre el l\xEDmite",
    categoriaBase: "humano",
    etapas: ["Negociacion"],
    peso: 4,
    politica: "POL-NEG-01",
    regla: "R07",
    agente: "Agente de negociaci\xF3n",
    rechazo: { tipo: "volver", etapa: "Busqueda" },
    anticipacion: [30, 120],
    construir: (op, rng) => {
      const pide = op.ofertas.find((o) => o.estado === "sobre_tope")?.tarifaSolicitada ?? Math.round(op.tarifaMaxima * (1 + entre(rng, 6, 18) / 100) / 1e4) * 1e4;
      const dif = pide - op.tarifaMaxima;
      return {
        titulo: `Tarifa solicitada supera el tope en ${cop(dif)}`,
        causa: `El transportador pidi\xF3 ${cop(pide)} para ${ruta(op)}; el m\xE1ximo autorizado es ${cop(op.tarifaMaxima)}.`,
        impacto: "El agente no puede comprometer valores adicionales: la decisi\xF3n es del responsable (R07, R08).",
        evidencia: [`Tope autorizado: ${cop(op.tarifaMaxima)}`, `Contrapropuesta recibida: ${cop(pide)}`, "Dos rondas de negociaci\xF3n agotadas (G-CONTRA)", `Veh\xEDculo: ${op.vehiculoRequerido} \xB7 ${op.distanciaKm} km`],
        alternativas: [
          alt("A", "Mantener el tope y llamar al siguiente candidato", "Se descarta al transportador y se contin\xFAa la negociaci\xF3n.", 0, 3, "medio", ["R06", "R07"], { tipo: "volver", etapa: "Busqueda" }),
          alt("B", `Autorizar la tarifa solicitada (${cop(pide)})`, "Se aprueba el sobrecosto y se registra la autorizaci\xF3n.", dif, 0, "ninguno", ["R08", "R28"]),
          alt("C", "Autorizar un punto medio", "Se contrapropone a mitad de camino y se confirma con el transportador.", Math.round(dif / 2), 1, "bajo", ["R08"])
        ],
        recomendada: "A"
      };
    }
  },
  Sin_transportador: {
    tipo: "Sin_transportador",
    nombre: "Sin transportadores o mercado sobre lo previsto",
    categoriaBase: "humano",
    etapas: ["Busqueda", "Negociacion"],
    peso: 1.6,
    politica: "POL-AUT-01",
    regla: "R08",
    agente: "Agente de negociaci\xF3n",
    rechazo: { tipo: "cancelar" },
    anticipacion: [180, 600],
    construir: (op, rng) => {
      const sobre = Math.round(op.tarifaMaxima * entre(rng, 15, 30) / 100 / 1e4) * 1e4;
      return {
        titulo: `Sin veh\xEDculo disponible para ${ruta(op)}`,
        causa: "Ning\xFAn candidato acept\xF3 dentro de los valores previstos o no hay transportadores disponibles para la fecha.",
        impacto: "Se activa coordinaci\xF3n con el cliente: cualquier cambio de fecha, tipo de veh\xEDculo o valor requiere autorizaci\xF3n (R08).",
        evidencia: [`Candidatos consultados: ${entre(rng, 4, 7)}`, `Tope autorizado: ${cop(op.tarifaMaxima)}`, `Mercado hoy: ${cop(op.tarifaMaxima + sobre)}`, `Fecha de cargue solicitada: ${new Date(op.fechaCargue).toLocaleDateString("es-CO")}`],
        alternativas: [
          alt("A", "Consultar flexibilidad de fecha u horario al cliente", "El agente de cliente llama para ofrecer alternativas de cargue.", 0, 12, "medio", ["R08", "R19"], { tipo: "volver", etapa: "Busqueda" }),
          alt("B", "Autorizar tarifa de mercado", "El responsable aprueba el valor superior al previsto.", sobre, 0, "ninguno", ["R08", "R28"], { tipo: "volver", etapa: "Negociacion" }),
          alt("C", "Cambiar el tipo de veh\xEDculo", "Dos veh\xEDculos menores o uno de mayor capacidad, con aval del cliente.", Math.round(sobre * 0.6), 6, "bajo", ["R08"], { tipo: "volver", etapa: "Busqueda" }),
          alt("D", "Cancelar el servicio", "Se informa al cliente y se cierra la solicitud.", 0, 0, "alto", ["R28"], { tipo: "cancelar" })
        ],
        recomendada: "A"
      };
    }
  },
  Seleccion_manual: {
    tipo: "Seleccion_manual",
    nombre: "Selecci\xF3n por el coordinador",
    categoriaBase: "asistido",
    etapas: ["Seleccion"],
    peso: 0,
    politica: "POL-SEL-01",
    regla: "R09",
    agente: "Agente de negociaci\xF3n",
    rechazo: { tipo: "volver", etapa: "Busqueda" },
    anticipacion: [60, 180],
    construir: (op) => {
      const ordenadas = [...op.ofertas].sort((a, b) => (a.tarifaFinal ?? a.tarifaOfrecida) - (b.tarifaFinal ?? b.tarifaOfrecida));
      const barata = ordenadas[0];
      const cumplidora = [...op.ofertas].sort((a, b) => b.cumplimiento - a.cumplimiento)[0];
      const compatible = [...op.ofertas].sort((a, b) => b.compatibilidad - a.compatibilidad)[0];
      const t = (o) => o.tarifaFinal ?? o.tarifaOfrecida;
      return {
        titulo: `${op.ofertas.length} ofertas para consolidar`,
        causa: "La plataforma consolid\xF3 las ofertas; la selecci\xF3n autom\xE1tica est\xE1 desactivada o no se cumplen todos los requisitos.",
        impacto: "El coordinador revisa las alternativas y selecciona la m\xE1s conveniente (R09).",
        evidencia: op.ofertas.map((o) => `${o.nombre} \xB7 ${cop(t(o))} \xB7 cumplimiento ${o.cumplimiento} % \xB7 compatibilidad ${o.compatibilidad} %`),
        alternativas: [
          alt("A", `Menor tarifa \xB7 ${barata.nombre}`, `Tarifa ${cop(t(barata))}.`, t(barata) - t(ordenadas[ordenadas.length - 1]), 0, "ninguno", ["R09"]),
          alt("B", `Mayor cumplimiento \xB7 ${cumplidora.nombre}`, `Cumplimiento hist\xF3rico ${cumplidora.cumplimiento} %.`, t(cumplidora) - t(barata), 0, "ninguno", ["R09", "R05"]),
          alt("C", `Mayor compatibilidad \xB7 ${compatible.nombre}`, `Compatibilidad ${compatible.compatibilidad} % con el servicio.`, t(compatible) - t(barata), 0, "ninguno", ["R09", "R05"])
        ],
        recomendada: "A"
      };
    }
  },
  Mercancia_no_lista: {
    tipo: "Mercancia_no_lista",
    nombre: "Mercanc\xEDa no estar\xE1 lista",
    categoriaBase: "asistido",
    etapas: ["Preventiva"],
    peso: 3.2,
    politica: "POL-PRE-01",
    regla: "R13",
    agente: "Agente de seguimiento",
    rechazo: { tipo: "continuar" },
    anticipacion: [360, 1200],
    construir: (op, rng) => {
      const h = entre(rng, 3, 8);
      return {
        titulo: `Mercanc\xEDa lista con ${h} h de retraso`,
        causa: `El cliente inform\xF3 en la llamada preventiva que ${op.mercancia.descripcion.toLowerCase()} no estar\xE1 lista a la hora acordada.`,
        impacto: "Impacto sobre el transportador asignado y sobre la promesa de entrega; la reprogramaci\xF3n debe estar autorizada (R13).",
        evidencia: [`Nuevo tiempo estimado informado: +${h} h (estimaci\xF3n, no confirmada)`, `Cargue original: ${new Date(op.fechaCargue).toLocaleString("es-CO")}`, `Transportador: ${op.transportador?.nombre ?? "por asignar"}`],
        alternativas: [
          alt("A", `Reprogramar el cargue +${h} h`, "Se autoriza la reprogramaci\xF3n y el agente avisa al transportador.", 12e4, h, "medio", ["R13", "R14"], { tipo: "volver", etapa: "Confirmacion" }),
          alt("B", "Mantener la hora y cargar parcial", "Se carga lo disponible y el resto en un segundo viaje.", 38e4, 0, "bajo", ["R13"]),
          alt("C", "Reprogramar al d\xEDa siguiente", "Nueva cita con el transportador y el cliente.", 24e4, 24, "alto", ["R13"], { tipo: "volver", etapa: "Confirmacion" })
        ],
        recomendada: "A"
      };
    }
  },
  Retraso_transportador: {
    tipo: "Retraso_transportador",
    nombre: "Transportador con dificultad de horario",
    categoriaBase: "asistido",
    etapas: ["Preventiva", "Presentacion"],
    peso: 3,
    politica: "POL-AUT-01",
    regla: "R14",
    agente: "Agente de seguimiento",
    rechazo: { tipo: "volver", etapa: "Busqueda" },
    anticipacion: [120, 480],
    construir: (op, rng) => {
      const h = entre(rng, 2, 5);
      return {
        titulo: `Transportador llegar\xEDa ${h} h tarde`,
        causa: `${op.transportador?.nombre ?? "El transportador"} informa que no alcanza el horario del cargue.`,
        impacto: "Se consulta al cliente si hay margen de espera, sin confirmar cambios definitivos (R14).",
        evidencia: [`ETA reportada: +${h} h`, `Conductor: ${op.transportador?.conductor ?? "\u2014"}`, `Punto de cargue: ${op.nodoOrigen.lugar}`],
        alternativas: [
          alt("A", "El cliente recibe el veh\xEDculo m\xE1s tarde", "El cliente confirma margen de espera; se autoriza el nuevo horario.", 0, h, "bajo", ["R14", "R19"]),
          alt("B", "Reasignar a otro transportador", "Se reabre la b\xFAsqueda con prioridad.", 18e4, 6, "medio", ["R14", "R05"], { tipo: "volver", etapa: "Busqueda" }),
          alt("C", "Reprogramar el cargue", "Nueva fecha con ambas partes.", 1e5, 12, "alto", ["R14"], { tipo: "volver", etapa: "Confirmacion" })
        ],
        recomendada: "A"
      };
    }
  },
  Diferencia_llegada: {
    tipo: "Diferencia_llegada",
    nombre: "Diferencia entre lo reportado y lo observado en origen",
    categoriaBase: "asistido",
    etapas: ["Presentacion"],
    peso: 2,
    politica: "POL-CRU-01",
    regla: "R15",
    agente: "Agente de seguimiento",
    rechazo: { tipo: "continuar" },
    anticipacion: [10, 40],
    construir: (op) => ({
      titulo: "El transportador dice haber llegado; el cliente no lo ve",
      causa: `${op.transportador?.nombre ?? "El transportador"} report\xF3 presentaci\xF3n en ${op.nodoOrigen.lugar} pero el contacto del cliente no tiene el veh\xEDculo en las instalaciones.`,
      impacto: "La validaci\xF3n cruzada detect\xF3 la diferencia antes de iniciar el cargue (R15).",
      evidencia: ["Reporte del transportador: llegada confirmada", `Contacto del cliente: ${op.cliente.contacto} indica que no est\xE1 en porter\xEDa`, `Placa reportada: ${op.transportador?.placa ?? "\u2014"}`],
      alternativas: [
        alt("A", "Pedir ubicaci\xF3n y foto al transportador", "El agente solicita evidencia de su posici\xF3n.", 0, 0.5, "bajo", ["R15"]),
        alt("B", "El coordinador contacta a porter\xEDa", "Confirmaci\xF3n directa con el punto de cargue.", 0, 0.7, "bajo", ["R15"]),
        alt("C", "Reasignar el veh\xEDculo", "Se descarta al transportador por incumplimiento.", 25e4, 8, "alto", ["R15"], { tipo: "volver", etapa: "Busqueda" })
      ],
      recomendada: "A"
    })
  },
  Espera_en_cargue: {
    tipo: "Espera_en_cargue",
    nombre: "Veh\xEDculo esperando en el punto de cargue",
    categoriaBase: "asistido",
    etapas: ["Presentacion", "Cargue"],
    peso: 3.4,
    politica: "POL-ESP-01",
    regla: "R16",
    agente: "Agente de seguimiento",
    rechazo: { tipo: "continuar" },
    anticipacion: [0, 30],
    construir: (op, rng) => {
      const causa = elegir(rng, ["la mercanc\xEDa no est\xE1 disponible", "hay congesti\xF3n en el punto de cargue", "falta un documento del despacho"]);
      const min = entre(rng, 95, 190);
      return {
        titulo: `Veh\xEDculo espera ${min} min por cargue`,
        causa: `El veh\xEDculo est\xE1 esperando porque ${causa}.`,
        impacto: "La espera supera el par\xE1metro de 90 minutos: se notifica al coordinador (R16).",
        evidencia: [`Espera acumulada: ${min} min`, `Tiempo estimado de soluci\xF3n informado por ${op.cliente.contacto}: 40 min (estimaci\xF3n)`, `Punto: ${op.nodoOrigen.lugar}`],
        alternativas: [
          alt("A", "Esperar y registrar el tiempo", "Se contin\xFAa con seguimiento; el costo de espera se liquida luego.", 9e4, 0.7, "bajo", ["R16", "R25"]),
          alt("B", "Reprogramar el cargue", "El veh\xEDculo se retira y vuelve en nueva ventana.", 18e4, 10, "alto", ["R16"], { tipo: "volver", etapa: "Confirmacion" }),
          alt("C", "Autorizar cargue parcial", "Se despacha lo listo.", 15e4, 0, "medio", ["R16", "R17"])
        ],
        recomendada: "A"
      };
    }
  },
  Diferencia_despacho: {
    tipo: "Diferencia_despacho",
    nombre: "Diferencias en cantidades, carga, documentos o instrucciones",
    categoriaBase: "asistido",
    etapas: ["Cargue"],
    peso: 2.4,
    politica: "POL-DES-01",
    regla: "R17",
    agente: "Agente de seguimiento",
    rechazo: { tipo: "continuar" },
    anticipacion: [5, 30],
    construir: (op, rng) => {
      const faltan = entre(rng, 2, 9);
      return {
        titulo: `Diferencia de ${faltan} unidades en el despacho`,
        causa: `El conductor carg\xF3 ${op.mercancia.unidades - faltan} unidades; la solicitud dec\xEDa ${op.mercancia.unidades}.`,
        impacto: "La diferencia debe quedar registrada y validada antes de continuar (R17).",
        evidencia: [`Solicitud: ${op.mercancia.unidades} und`, `Cargadas: ${op.mercancia.unidades - faltan} und`, "Remisi\xF3n sin firmar por el cliente"],
        alternativas: [
          alt("A", "Aceptar el despacho con la novedad registrada", "Sigue el recorrido y se concilia en la entrega.", 0, 0, "bajo", ["R17"]),
          alt("B", "Solicitar correcci\xF3n documental", "El cliente ajusta la remisi\xF3n antes de salir.", 0, 1, "bajo", ["R17"]),
          alt("C", "Detener el despacho y revisar", "Se cuenta de nuevo en presencia de ambas partes.", 6e4, 2, "medio", ["R17"], { tipo: "volver", etapa: "Cargue" })
        ],
        recomendada: "B"
      };
    }
  },
  Novedad_en_ruta: {
    tipo: "Novedad_en_ruta",
    nombre: "Demora, cierre vial o aver\xEDa en ruta",
    categoriaBase: "asistido",
    etapas: ["Transito"],
    peso: 5,
    politica: "POL-COM-01",
    regla: "R19",
    agente: "Agente de seguimiento",
    rechazo: { tipo: "continuar" },
    anticipacion: [90, 420],
    construir: (op, rng) => {
      const tipo = elegir(rng, [
        { n: "cierre vial por derrumbe", h: 4 },
        { n: "aver\xEDa mec\xE1nica", h: 6 },
        { n: "accidente en la v\xEDa", h: 3 },
        { n: "manifestaci\xF3n en el corredor", h: 5 }
      ]);
      return {
        titulo: `Novedad en ruta: ${tipo.n}`,
        causa: `${op.transportador?.nombre ?? "El transportador"} reporta ${tipo.n} en el trayecto ${ruta(op)}.`,
        impacto: `Afecta la entrega comprometida: retraso estimado de ${tipo.h} h (estimaci\xF3n, a\xFAn no confirmada).`,
        evidencia: [`Ubicaci\xF3n reportada por el conductor`, `Hora estimada de llegada original vs. nueva: +${tipo.h} h (estimada)`, "Novedad clasificada y registrada (R19)"],
        alternativas: [
          alt("A", "Informar al cliente la nueva ETA como estimaci\xF3n", "Llamada informativa; no se promete hora hasta validarla.", 0, tipo.h, "medio", ["R19"]),
          alt("B", "Autorizar ruta alterna", "Mayor recorrido y peajes.", 22e4, tipo.h / 2, "bajo", ["R19", "R08"]),
          alt("C", "Trasbordar a otro veh\xEDculo", "Se env\xEDa un veh\xEDculo de apoyo.", 48e4, tipo.h / 3, "bajo", ["R19", "R08"])
        ],
        recomendada: "A"
      };
    }
  },
  Conductor_ocupado: {
    tipo: "Conductor_ocupado",
    nombre: "Conductor conduciendo",
    categoriaBase: "automatico",
    etapas: ["Transito"],
    peso: 5.5,
    politica: "POL-SEG-01",
    regla: "R18",
    agente: "Agente de seguimiento",
    rechazo: { tipo: "continuar" },
    anticipacion: [0, 0],
    construir: (op) => ({
      titulo: "Conductor atendi\xF3 la llamada mientras conduc\xEDa",
      causa: `${op.transportador?.conductor ?? "El conductor"} indic\xF3 que va conduciendo.`,
      impacto: "Se finaliza el contacto y se programa para un momento seguro (R18).",
      evidencia: ["Verificaci\xF3n de condiciones seguras: no cumple", "Llamada cerrada en < 10 s"],
      alternativas: [
        alt("A", "Reprogramar la llamada en 20 minutos", "Nuevo contacto en un momento seguro.", 0, 0.3, "ninguno", ["R18"]),
        alt("B", "Consultar ubicaci\xF3n por la integraci\xF3n externa", "Sin llamar al conductor.", 0, 0, "ninguno", ["R18"])
      ],
      recomendada: "A"
    })
  },
  Destinatario_no_recibe: {
    tipo: "Destinatario_no_recibe",
    nombre: "Destinatario no puede recibir en el horario",
    categoriaBase: "humano",
    etapas: ["AvisoDestino"],
    peso: 3,
    politica: "POL-AUT-01",
    regla: "R22",
    agente: "Agente de cliente",
    rechazo: { tipo: "continuar" },
    anticipacion: [60, 300],
    construir: (op, rng) => {
      const h = entre(rng, 2, 6);
      return {
        titulo: `Destinatario no recibe hasta dentro de ${h} h`,
        causa: `${op.cliente.contacto} informa que las instalaciones de ${op.nodoDestino.ciudad} no pueden recibir en el horario previsto.`,
        impacto: "Hay que coordinar con el transportador y el responsable log\xEDstico; los cambios siguen las autorizaciones (R22).",
        evidencia: [`Horario de recibo: ${op.condicionesEntrega}`, `Nueva ventana ofrecida: +${h} h (estimaci\xF3n)`, `Veh\xEDculo en tr\xE1nsito: ${op.transportador?.placa ?? "\u2014"}`],
        alternativas: [
          alt("A", "Reprogramar la entrega en la nueva ventana", "El transportador espera o reprograma el descargue.", 13e4, h, "medio", ["R22", "R08"]),
          alt("B", "Entregar en otro punto autorizado", "Cambio de destino aprobado por el responsable.", 26e4, 2, "medio", ["R22", "R08"]),
          alt("C", "Mantener el horario y presionar la recepci\xF3n", "El coordinador gestiona con el destinatario.", 0, 0, "alto", ["R22"])
        ],
        recomendada: "A"
      };
    }
  },
  Demora_en_descargue: {
    tipo: "Demora_en_descargue",
    nombre: "Filas, demoras, acceso o problemas documentales en destino",
    categoriaBase: "asistido",
    etapas: ["Descargue"],
    peso: 3.4,
    politica: "POL-ESP-01",
    regla: "R16",
    agente: "Agente de seguimiento",
    rechazo: { tipo: "continuar" },
    anticipacion: [0, 45],
    construir: (op, rng) => {
      const causa = elegir(rng, ["una fila de veh\xEDculos en el muelle", "dificultad de acceso a la bodega", "un problema documental con la orden de compra"]);
      return {
        titulo: `Demora en destino por ${causa}`,
        causa: `El veh\xEDculo no ha podido descargar en ${op.nodoDestino.lugar}: ${causa}.`,
        impacto: "Se identifica la causa y el posible impacto; se notifica si supera los par\xE1metros (R16).",
        evidencia: [`Espera en destino: ${entre(rng, 70, 160)} min`, `Receptor: ${op.cliente.contacto}`],
        alternativas: [
          alt("A", "Esperar turno y registrar el tiempo", "Seguimiento hasta confirmar recepci\xF3n.", 7e4, 1, "bajo", ["R16"]),
          alt("B", "Pedir turno prioritario al destinatario", "El agente de cliente gestiona el turno.", 0, 0.5, "ninguno", ["R16", "R21"]),
          alt("C", "Informar al responsable el costo de espera", "Se deja constancia para la liquidaci\xF3n.", 12e4, 1.5, "medio", ["R16", "R25"])
        ],
        recomendada: "B"
      };
    }
  },
  Diferencia_entrega: {
    tipo: "Diferencia_entrega",
    nombre: "Entrega informada \u2260 entrega confirmada",
    categoriaBase: "asistido",
    etapas: ["ValidacionEntrega"],
    peso: 4,
    politica: "POL-CIE-01",
    regla: "R23",
    agente: "Agente de cliente",
    rechazo: { tipo: "continuar" },
    anticipacion: [5, 25],
    construir: (_op, rng) => {
      const dif = elegir(rng, ["faltan unidades", "hay cajas con da\xF1o visible", "la remisi\xF3n no coincide con lo recibido"]);
      return {
        titulo: "Transportador y cliente no coinciden sobre la entrega",
        causa: `El transportador informa entrega completa; el destinatario indica que ${dif}.`,
        impacto: "El sistema no cierra autom\xE1ticamente: el coordinador revisa los hechos y solicita evidencias (R23).",
        evidencia: ["Reporte del transportador: entrega completa", `Reporte del cliente: ${dif}`, "Soportes de entrega pendientes"],
        alternativas: [
          alt("A", "Solicitar evidencias a ambas partes", "Fotos, remisi\xF3n firmada y registro de descargue.", 0, 4, "bajo", ["R23"]),
          alt("B", "Revisi\xF3n conjunta con cliente y transportador", "Llamada tripartita liderada por el coordinador.", 0, 6, "medio", ["R23"]),
          alt("C", "Abrir reclamaci\xF3n formal", "Se registra una reclamaci\xF3n y se suspende la liquidaci\xF3n.", 0, 24, "alto", ["R23", "R25"])
        ],
        recomendada: "A"
      };
    }
  },
  Inconformidad_cliente: {
    tipo: "Inconformidad_cliente",
    nombre: "Inconformidad del cliente",
    categoriaBase: "asistido",
    etapas: ["LlamadaCierre"],
    peso: 3.2,
    politica: "POL-CIE-02",
    regla: "R24",
    agente: "Agente de cliente",
    rechazo: { tipo: "continuar" },
    anticipacion: [0, 20],
    construir: (op, rng) => {
      const motivo = elegir(rng, ["la hora de llegada fue distinta a la acordada", "el conductor no us\xF3 la dotaci\xF3n exigida", "no recibi\xF3 avisos durante el recorrido"]);
      return {
        titulo: "Inconformidad manifestada en la llamada de cierre",
        causa: `${op.cliente.contacto} manifiesta que ${motivo}.`,
        impacto: "No puede quedar como un comentario: se convierte en caso de seguimiento (R24).",
        evidencia: [`Calificaci\xF3n del servicio: ${entre(rng, 2, 3)}/5`, `Observaci\xF3n: ${motivo}`],
        alternativas: [
          alt("A", "Crear caso de seguimiento y asignar responsable", "Se registra el caso con plazo de respuesta.", 0, 0, "bajo", ["R24"]),
          alt("B", "Ofrecer una compensaci\xF3n comercial", "Requiere autorizaci\xF3n del responsable.", 15e4, 0, "ninguno", ["R24", "R08"]),
          alt("C", "Escalar al responsable comercial del cliente", "Contacto directo del responsable.", 0, 2, "medio", ["R24"])
        ],
        recomendada: "A"
      };
    }
  },
  Sobrecosto_liquidacion: {
    tipo: "Sobrecosto_liquidacion",
    nombre: "Costos adicionales o novedades que afectan la liquidaci\xF3n",
    categoriaBase: "humano",
    etapas: ["CierreAdmin"],
    peso: 4,
    politica: "POL-CIE-01",
    regla: "R25",
    agente: "Agente de cliente",
    rechazo: { tipo: "continuar" },
    anticipacion: [0, 60],
    construir: (op, rng) => {
      const extra = entre(rng, 2, 7) * 5e4;
      return {
        titulo: `Costos adicionales por ${cop(extra)} sin autorizaci\xF3n`,
        causa: "El transportador presenta costos adicionales (esperas, ruta alterna) que no tienen una autorizaci\xF3n registrada.",
        impacto: "Solo se cierra despu\xE9s de validar las condiciones econ\xF3micas, costos adicionales y novedades (R25).",
        evidencia: [`Tarifa pactada: ${cop(op.tarifaPactada ?? op.tarifaMaxima)}`, `Costos adicionales solicitados: ${cop(extra)}`, `Costos autorizados a la fecha: ${cop(op.costosAdicionales)}`],
        alternativas: [
          alt("A", "Autorizar el sobrecosto", "Se registra la autorizaci\xF3n y se liquida.", extra, 0, "ninguno", ["R25", "R28"]),
          alt("B", "Autorizar parcialmente", "Se reconoce solo lo soportado.", Math.round(extra / 2), 0, "ninguno", ["R25", "R28"]),
          alt("C", "Rechazar y reclamar soportes", "No se reconoce sin soporte.", 0, 24, "bajo", ["R25"])
        ],
        recomendada: "B"
      };
    }
  }
};
var TIPOS_EXCEPCION = Object.keys(PLANTILLA_EXCEPCION);
var EXCEPCION_LABEL = Object.fromEntries(
  TIPOS_EXCEPCION.map((t) => [t, PLANTILLA_EXCEPCION[t].nombre])
);
function construirOfertas(op, rng) {
  const ref = op.tarifaMaxima / 1.08;
  const candidatos = mezclar(rng, TRANSPORTADORES.filter((t) => t.flota.includes(op.vehiculoRequerido))).slice(0, entre(rng, 3, 4));
  return candidatos.map((t) => {
    const ofrecida = Math.round(ref * (0.94 + rng() * 0.1) / 1e4) * 1e4;
    return {
      transportadorId: t.id,
      nombre: t.nombre,
      vehiculo: op.vehiculoRequerido,
      compatibilidad: entre(rng, 72, 98),
      cumplimiento: t.cumplimiento,
      tarifaOfrecida: ofrecida,
      tarifaSolicitada: ofrecida,
      tarifaFinal: null,
      estado: "aceptada_preliminar"
    };
  });
}

// src/data/motor.ts
var MIN_POR_DIA_OPERATIVO = 14 * 60;
var contadorLog = 0;
function nuevoLog(op, evento2, texto, ts, tipo = "evento") {
  contadorLog += 1;
  return { id: `L-${contadorLog}`, ts, evento: evento2, texto, operacionId: op ? op.id : null, tipo };
}
var RECEPTORES = ["Yesid Palacios", "Marta Luc\xEDa Ocampo", "Jairo Echeverri", "Luz Dary S\xE1nchez", "Carlos Arboleda", "Sandra Beltr\xE1n"];
function clonar(op) {
  return {
    ...op,
    ofertas: op.ofertas.map((o) => ({ ...o })),
    llamadas: [...op.llamadas],
    compromisos: op.compromisos.map((c) => ({ ...c })),
    excepcionesPrevias: [...op.excepcionesPrevias],
    trazas: [...op.trazas],
    eventos: [...op.eventos],
    soportes: [...op.soportes],
    datosPendientes: [...op.datosPendientes]
  };
}
function evento(c, ev, detalle) {
  c.n.eventos.push({ evento: ev, timestamp: c.ts, detalle });
  c.logs.push(nuevoLog(c.n, ev, `${c.n.id} \xB7 ${detalle}`, c.ts));
}
function traza(c, etapa, ejecutor, ocurrio, informacion, regla, decidio, ejecuto, resultado) {
  const r = REGLA_POR_ID[regla];
  c.n.trazas.push({
    id: `${c.n.id}-T${c.n.trazas.length + 1}`,
    ts: c.ts,
    etapa,
    ejecutor,
    ocurrio,
    informacion,
    regla: r ? `${r.id} \xB7 ${r.politica}` : regla,
    decidio,
    ejecuto,
    resultado
  });
}
function llamar(c, o) {
  const { n, rng } = c;
  const resultado = o.resultado ?? "exitosa";
  const nombre = o.nombre ?? (o.interlocutor === "transportador" ? n.transportador?.conductor ?? "Conductor" : o.interlocutor === "destinatario" ? n.receptor?.nombre ?? n.cliente.contacto : n.cliente.contacto);
  const base = o.interlocutor === "transportador" ? [1, 14] : [2, 24];
  n.llamadas.push({
    id: `${n.id}-C${n.llamadas.length + 1}`,
    ts: c.ts,
    sentido: o.sentido ?? "saliente",
    interlocutor: o.interlocutor,
    nombre,
    objetivo: o.objetivo,
    resultado,
    respuestaMin: resultado === "sin_respuesta" ? null : entre(rng, base[0], base[1]),
    duracionSeg: resultado === "sin_respuesta" ? 0 : entre(rng, 45, 230),
    agente: o.agente,
    etapa: o.etapa,
    resumen: o.resumen,
    confirmada: o.confirmada ?? resultado === "exitosa"
  });
}
function compromiso(c, texto, parte, venceEn) {
  c.n.compromisos.push({ id: `${c.n.id}-K${c.n.compromisos.length + 1}`, texto, parte, venceEn, estado: "pendiente" });
}
function resolverCompromisos(c, prefijo, incumplido) {
  c.n.compromisos = c.n.compromisos.map(
    (k) => k.estado === "pendiente" && k.texto.startsWith(prefijo) ? { ...k, estado: incumplido ? "incumplido" : "cumplido" } : k
  );
}
var hubo = (n, t) => n.excepcionesPrevias.some((e) => e.tipo === t);
function mejorOferta(n, criterio) {
  const lista = n.ofertas.filter((o) => o.estado !== "sin_interes" && o.estado !== "sobre_tope");
  const base = lista.length > 0 ? lista : n.ofertas;
  const t = (o) => o.tarifaFinal ?? o.tarifaOfrecida;
  return [...base].sort((a, b) => criterio === "tarifa" ? t(a) - t(b) : criterio === "cumplimiento" ? b.cumplimiento - a.cumplimiento : b.compatibilidad - a.compatibilidad)[0];
}
function completarEtapa(c, etapa) {
  const { n, rng, ts } = c;
  const horasCargue = (n.fechaCargue - ts) / 36e5;
  switch (etapa) {
    case "Solicitud":
      traza(c, etapa, "Agente de cliente", "Ingres\xF3 una solicitud de transporte", [`Canal: ${n.canal}`, `Solicitante: ${n.solicitante}`], "R02", "Registrar lo confirmado y pasar a validaci\xF3n", "Captura de datos m\xEDnimos", "Solicitud lista para validar");
      break;
    case "Validacion":
      evento(c, "SolicitudValidada", `Solicitud validada \xB7 ${n.mercancia.descripcion} \xB7 ${n.nodoOrigen.ciudad} \u2192 ${n.nodoDestino.ciudad}`);
      traza(c, etapa, "Sistema", "Se valid\xF3 la suficiencia de la solicitud", ["Datos m\xEDnimos completos", `Tipo de veh\xEDculo: ${n.vehiculoRequerido}`], "R01", "La informaci\xF3n es suficiente para iniciar", "Marcar solicitud como v\xE1lida", "Pasa a registro y planeaci\xF3n");
      break;
    case "Planeacion":
      llamar(c, { interlocutor: "cliente", objetivo: "Confirmar condiciones de cargue", agente: "Agente de cliente", etapa, resumen: `Confirma con ${n.cliente.contacto} disponibilidad de cargue, acceso y horarios en ${n.nodoOrigen.lugar}.` });
      evento(c, "OperacionRegistrada", `Operaci\xF3n registrada con identificador \xFAnico ${n.id}`);
      compromiso(c, "Mercanc\xEDa disponible para cargue en la fecha acordada", "cliente", n.fechaCargue);
      traza(c, etapa, "Agente de cliente", "Solicitud completa: se registra la operaci\xF3n", ["Identificador \xFAnico asignado", `Restricciones: ${n.requisitoEspecial ?? "ninguna"}`, `Fecha comprometida de cargue`], "R03", "Iniciar la planeaci\xF3n log\xEDstica", "Llamada al contacto autorizado para validar cargue y acceso", "Condiciones confirmadas; se puede buscar transportador");
      break;
    case "Busqueda": {
      n.ofertas = construirOfertas(n, rng);
      evento(c, "TransportadoresPreseleccionados", `${n.ofertas.length} candidatos preseleccionados en la base de proveedores`);
      traza(c, etapa, "Sistema", "Se buscaron transportadores compatibles", ["Ubicaci\xF3n", "Tipo de veh\xEDculo", "Capacidad", "Rutas habituales", "Historial de cumplimiento", "Condiciones comerciales"], "R05", `Preseleccionar ${n.ofertas.length} candidatos`, "Consulta a la base de proveedores", n.ofertas.map((o) => `${o.nombre} (${o.compatibilidad} %)`).join(" \xB7 "));
      break;
    }
    case "Negociacion": {
      evento(c, "NegociacionIniciada", `Llamadas de negociaci\xF3n a ${n.ofertas.length} transportadores`);
      for (const o of n.ofertas) {
        if (o.estado === "sobre_tope") {
          o.tarifaFinal = null;
          continue;
        }
        if (o.tarifaFinal !== null) continue;
        o.tarifaFinal = Math.min(o.tarifaOfrecida, n.tarifaMaxima);
        o.estado = "contraoferta_ok";
        llamar(c, { interlocutor: "transportador", objetivo: "Negociar tarifa", agente: "Agente de negociaci\xF3n", etapa, nombre: o.nombre, resumen: `Presenta el viaje ${n.nodoOrigen.ciudad} \u2192 ${n.nodoDestino.ciudad}; acuerda ${new Intl.NumberFormat("es-CO").format(o.tarifaFinal)} COP dentro del tope.` });
      }
      evento(c, "AceptacionPreliminar", `${n.ofertas.filter((o) => o.tarifaFinal !== null).length} aceptaciones preliminares registradas`);
      traza(c, etapa, "Agente de negociaci\xF3n", "Se negoci\xF3 con los candidatos", [`Tope autorizado ${new Intl.NumberFormat("es-CO").format(n.tarifaMaxima)} COP`, `${n.ofertas.length} llamadas`], "R06", "Aceptar tarifas que no superen el m\xE1ximo autorizado", "Registro de aceptaciones preliminares", "Ofertas listas para consolidar");
      break;
    }
    case "Seleccion": {
      if (n.ofertas.length === 0) {
        n.ofertas = construirOfertas(n, rng);
        for (const x of n.ofertas) x.tarifaFinal = Math.min(x.tarifaOfrecida, n.tarifaMaxima);
      }
      if (!n.transportador) {
        const o = mejorOferta(n, "tarifa");
        const t = TRANSP(o.transportadorId);
        n.transportador = t;
        n.tarifaPactada = o.tarifaFinal ?? o.tarifaOfrecida;
        evento(c, "TransportadorSeleccionado", `Selecci\xF3n autom\xE1tica \xB7 ${t.nombre} \xB7 ${new Intl.NumberFormat("es-CO").format(n.tarifaPactada)} COP`);
        traza(c, etapa, "Sistema", "Se consolidaron las ofertas", n.ofertas.map((x) => `${x.nombre}: ${new Intl.NumberFormat("es-CO").format(x.tarifaFinal ?? x.tarifaOfrecida)} COP`), "R09", "Seleccionar la mejor oferta que cumple requisitos operativos, documentales y comerciales", "Selecci\xF3n autom\xE1tica", `${t.nombre} seleccionado`);
      } else {
        evento(c, "TransportadorSeleccionado", `Seleccionado por el coordinador \xB7 ${n.transportador.nombre}`);
      }
      break;
    }
    case "Asignacion": {
      const t = n.transportador;
      n.soportes.push({ nombre: `Documentos de ${t.placa} y ${t.conductor}`, tipo: "documento", ts });
      evento(c, "DocumentosValidados", `Documentos del veh\xEDculo ${t.placa} y del conductor validados`);
      evento(c, "AsignacionConfirmada", `Asignaci\xF3n formalizada \xB7 ${t.nombre} \xB7 ${t.placa}`);
      traza(c, etapa, "Sistema", "Se validaron los documentos para prestar el servicio", ["Licencia, SOAT, revisi\xF3n t\xE9cnico-mec\xE1nica", "Afiliaciones del conductor"], "R10", "Formalizar la asignaci\xF3n", "Registro de la asignaci\xF3n", "Se activa la comunicaci\xF3n de confirmaci\xF3n");
      break;
    }
    case "Confirmacion": {
      n.receptor = { nombre: elegir(rng, RECEPTORES), telefono: `+57 3${entre(rng, 10, 24)} 555 0${entre(rng, 400, 899)}` };
      llamar(c, { interlocutor: "cliente", objetivo: "Informar asignaci\xF3n", agente: "Agente de cliente", etapa, resumen: `Informa veh\xEDculo asignado (${n.transportador?.placa}); confirma fecha y hora, lugar de cargue y disponibilidad. Receptor: ${n.receptor.nombre}.` });
      llamar(c, { interlocutor: "transportador", objetivo: "Confirmar con transportador", agente: "Agente de seguimiento", etapa, resumen: "Confirma que recibi\xF3 la informaci\xF3n completa, conoce las condiciones y est\xE1 preparado." });
      evento(c, "ConfirmacionDoble", "Cliente y transportador confirmaron la misma informaci\xF3n");
      compromiso(c, "Transportador se presenta en el punto de cargue a la hora acordada", "transportador", n.fechaCargue);
      traza(c, etapa, "Agente de cliente", "Se asign\xF3 el veh\xEDculo", ["Fecha y hora de presentaci\xF3n", "Lugar de cargue", "Instrucciones de ingreso y seguridad"], "R11", "Confirmar a las dos partes con la misma informaci\xF3n", "Dos llamadas (cliente y transportador)", "Ambas partes alineadas");
      break;
    }
    case "Preventiva": {
      llamar(c, { interlocutor: "transportador", objetivo: "Llamada preventiva", agente: "Agente de seguimiento", etapa, resumen: `Confirma disponibilidad, ubicaci\xF3n y tiempo estimado de llegada (faltan ${Math.max(1, Math.round(horasCargue))} h).` });
      llamar(c, { interlocutor: "cliente", objetivo: "Llamada preventiva", agente: "Agente de seguimiento", etapa, resumen: "Verifica que la mercanc\xEDa est\xE9 preparada, el punto de cargue disponible y sin cambios." });
      evento(c, "LlamadaPreventiva", "Llamadas preventivas a cliente y transportador completadas");
      traza(c, etapa, "Agente de seguimiento", "Se acerca la fecha de cargue", ["Disponibilidad del transportador", "Estado de la mercanc\xEDa"], "R12", "Verificar a ambas partes antes del cargue", "Dos llamadas preventivas", "Sin cambios en la programaci\xF3n");
      break;
    }
    case "Presentacion": {
      llamar(c, { interlocutor: "transportador", objetivo: "Validar presentaci\xF3n", agente: "Agente de seguimiento", etapa, resumen: "El transportador informa su llegada al punto de cargue." });
      llamar(c, { interlocutor: "cliente", objetivo: "Validar presentaci\xF3n", agente: "Agente de seguimiento", etapa, resumen: "Validaci\xF3n cruzada: el cliente confirma que el veh\xEDculo est\xE1 en las instalaciones y autoriz\xF3 el ingreso." });
      evento(c, "LlegadaOrigenConfirmada", `Llegada en origen confirmada por ambas partes \xB7 ${n.transportador?.placa}`);
      resolverCompromisos(c, "Transportador se presenta", false);
      traza(c, etapa, "Agente de seguimiento", "El transportador report\xF3 su llegada", ["Reporte del transportador", "Observaci\xF3n del cliente"], "R15", "Dar por presentado al veh\xEDculo", "Validaci\xF3n cruzada", "Lo reportado coincide con lo observado");
      break;
    }
    case "Cargue": {
      n.horaSalida = ts;
      llamar(c, { interlocutor: "cliente", objetivo: "Confirmar despacho", agente: "Agente de seguimiento", etapa, resumen: "Confirma hora real de salida, condiciones del despacho y que la mercanc\xEDa fue despachada." });
      evento(c, "CargueFinalizado", `Cargue finalizado \xB7 ${n.mercancia.unidades} und \xB7 ${n.mercancia.pesoKg} kg`);
      evento(c, "DespachoConfirmado", `Despacho confirmado \xB7 salida ${new Date(ts).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}`);
      n.soportes.push({ nombre: `Remisi\xF3n de despacho ${n.id}`, tipo: "documento", ts });
      resolverCompromisos(c, "Mercanc\xEDa disponible", hubo(n, "Mercancia_no_lista"));
      traza(c, etapa, "Agente de seguimiento", "Termin\xF3 el cargue", ["Hora real de salida", "Cantidades y condiciones de la carga"], "R17", "Registrar diferencias y dar inicio al recorrido", "Confirmaci\xF3n con el cliente", "Operaci\xF3n en tr\xE1nsito");
      break;
    }
    case "Transito": {
      const t = n.transportador;
      llamar(c, { interlocutor: "transportador", objetivo: "Seguimiento en ruta", agente: "Agente de seguimiento", etapa, resumen: `Estado del viaje, ubicaci\xF3n reportada (${t ? t.base : "ruta"}) y novedades: sin novedad. ETA estimada informada por el conductor.`, confirmada: false });
      llamar(c, { interlocutor: "transportador", objetivo: "Seguimiento en ruta", agente: "Agente de seguimiento", etapa, resumen: "Segundo seguimiento programado: avanza seg\xFAn lo previsto; hora estimada de llegada actualizada.", confirmada: false });
      if (rng() < 0.4) llamar(c, { interlocutor: "cliente", objetivo: "Consulta de estado", agente: "Agente de cliente", etapa, sentido: "entrante", resumen: `${n.cliente.contacto} consulta el estado: el agente valida su autorizaci\xF3n e informa \xFAltimo avance confirmado.` });
      evento(c, "SeguimientoRegistrado", "Seguimientos en ruta registrados; hora estimada de llegada actualizada");
      traza(c, etapa, "Agente de seguimiento", "Se ejecut\xF3 el monitoreo programado", ["Ubicaci\xF3n reportada", "Novedades", "Hora estimada de llegada"], "R19", "Informar solo lo confirmado; las estimaciones se rotulan como tales", "Llamadas programadas al transportador", "Estado de la operaci\xF3n actualizado");
      break;
    }
    case "AvisoDestino":
      llamar(c, { interlocutor: "destinatario", objetivo: "Preparar recepci\xF3n", agente: "Agente de cliente", etapa, resumen: `Confirma con ${n.cliente.contacto} que las instalaciones est\xE1n preparadas, horarios de descargue e instrucciones de ingreso.` });
      evento(c, "SeguimientoRegistrado", `Aviso de llegada al destino confirmado \xB7 ${n.nodoDestino.lugar}`);
      traza(c, etapa, "Agente de cliente", "Se aproxima la hora estimada de llegada", ["Horarios de descargue", "Instrucciones de ingreso"], "R22", "Confirmar preparaci\xF3n del destinatario", "Llamada al contacto de recepci\xF3n", "Destino listo para recibir");
      break;
    case "Descargue":
      n.horaEntrega = ts;
      llamar(c, { interlocutor: "destinatario", objetivo: "Confirmar recepci\xF3n", agente: "Agente de seguimiento", etapa, resumen: "Valida la recepci\xF3n, pregunta por diferencias o da\xF1os y por observaciones." });
      evento(c, "LlegadaDestinoConfirmada", `Llegada y descargue en ${n.nodoDestino.ciudad} confirmados`);
      traza(c, etapa, "Agente de seguimiento", "El transportador lleg\xF3 al destino", ["Hora reportada", "Confirmaci\xF3n del contacto de recepci\xF3n"], "R16", "Seguir hasta confirmar que la mercanc\xEDa fue recibida", "Llamada de recepci\xF3n", "Mercanc\xEDa recibida");
      break;
    case "ValidacionEntrega":
      llamar(c, { interlocutor: "cliente", objetivo: "Validar entrega", agente: "Agente de cliente", etapa, resumen: "Ambas partes coinciden en que el servicio fue ejecutado correctamente; se solicitan los soportes." });
      n.soportes.push({ nombre: `Soporte de entrega ${n.id}`, tipo: "soporte_entrega", ts });
      evento(c, "EntregaConfirmada", "Entrega confirmada por transportador y cliente");
      resolverCompromisos(c, "Entrega", false);
      traza(c, etapa, "Agente de cliente", "El transportador inform\xF3 entrega completa", ["Reporte del transportador", "Confirmaci\xF3n del cliente"], "R23", "Ambas versiones coinciden: registrar confirmaci\xF3n operativa", "Solicitud de soportes", "Entrega confirmada");
      break;
    case "LlamadaCierre": {
      const sat = n.casoSeguimiento ? entre(rng, 2, 3) : entre(rng, 4, 5);
      n.satisfaccion = sat;
      llamar(c, { interlocutor: "cliente", objetivo: "Cierre y satisfacci\xF3n", agente: "Agente de cliente", etapa, resumen: `Confirma servicio completado, recoge observaciones y calificaci\xF3n (${sat}/5): atenci\xF3n, horarios y desempe\xF1o.` });
      n.soportes.push({ nombre: `Transcripci\xF3n llamada de cierre ${n.id}`, tipo: "transcripcion", ts });
      if (rng() < 0.6) n.soportes.push({ nombre: `Grabaci\xF3n llamada de cierre ${n.id}`, tipo: "grabacion", ts, autorizada: true });
      evento(c, "LlamadaCierre", `Llamada de cierre completada \xB7 satisfacci\xF3n ${sat}/5`);
      traza(c, etapa, "Agente de cliente", "Se realiz\xF3 la llamada de cierre", ["Calificaci\xF3n", "Observaciones"], "R24", n.casoSeguimiento ? "Mantener el caso de seguimiento abierto" : "Sin inconformidad", "Registro de satisfacci\xF3n", "Listo para cierre administrativo");
      break;
    }
    case "CierreAdmin":
      n.soportes.push({ nombre: `Liquidaci\xF3n ${n.id}`, tipo: "liquidacion", ts });
      n.compromisos = n.compromisos.map((k) => k.estado === "pendiente" ? { ...k, estado: "cumplido" } : k);
      traza(c, etapa, "Sistema", "Se verificaron los documentos finales", [`Tarifa pactada ${new Intl.NumberFormat("es-CO").format(n.tarifaPactada ?? 0)} COP`, `Costos adicionales autorizados ${new Intl.NumberFormat("es-CO").format(n.costosAdicionales)} COP`], "R25", "Cerrar administrativamente", "Cierre y liquidaci\xF3n", "Operaci\xF3n cerrada");
      break;
  }
}
function TRANSP(id) {
  return TRANSPORTADORES.find((t) => t.id === id);
}
function avanzar(c, desde) {
  const { n } = c;
  completarEtapa(c, desde);
  n.intentosContacto = 0;
  const sig = siguienteEtapa(desde);
  n.etapaRetorno = null;
  if (sig === "Cerrada") {
    n.etapa = "Cerrada";
    n.fechaCierre = c.ts;
    evento(c, "OperacionCerrada", `Cierre administrativo \xB7 ${n.cliente.nombre} \xB7 ${n.nodoOrigen.ciudad} \u2192 ${n.nodoDestino.ciudad}`);
  } else {
    n.etapa = sig;
  }
}
function sincronizar(n, ts) {
  n.bloque = ETAPA_BLOQUE[n.etapa];
  n.progreso = progresoDe(n.etapa, n.etapaRetorno);
  n.fechaActualizacion = ts;
}
function levantarExcepcion(c, tipo, etapa) {
  const { n, rng, ts } = c;
  const pl = PLANTILLA_EXCEPCION[tipo];
  if (tipo === "Tarifa_sobre_tope") {
    if (n.ofertas.length === 0) n.ofertas = construirOfertas(n, rng);
    const o = n.ofertas[0];
    o.estado = "sobre_tope";
    o.tarifaSolicitada = Math.round(n.tarifaMaxima * (1 + entre(rng, 6, 18) / 100) / 1e4) * 1e4;
  }
  if (tipo === "Seleccion_manual") {
    for (const o of n.ofertas) if (o.tarifaFinal === null && o.estado !== "sobre_tope") o.tarifaFinal = Math.min(o.tarifaOfrecida, n.tarifaMaxima);
  }
  if ((tipo === "Mercancia_no_lista" || tipo === "Retraso_transportador") && !n.transportador) return;
  const categoria = pl.categoria ? pl.categoria(n) : pl.categoriaBase;
  const base = pl.construir(n, rng);
  const [min, max] = pl.anticipacion;
  const exc = {
    id: `${n.id}-X${n.excepcionesPrevias.length + 1}`,
    tipo,
    categoria,
    ...base,
    etapaOrigen: etapa,
    detectadaEn: ts,
    anticipacionMin: max === 0 ? 0 : entre(rng, min, max),
    politica: pl.politica
  };
  n.excepcion = exc;
  n.etapaRetorno = etapa;
  const evento_ = tipo === "Datos_incompletos" ? "DatosSolicitados" : tipo === "Tarifa_sobre_tope" ? "TarifaEscalada" : "NovedadRegistrada";
  if (tipo === "Sin_respuesta") {
    n.intentosContacto += 1;
    llamar(c, { interlocutor: etapa === "LlamadaCierre" || etapa === "AvisoDestino" ? "cliente" : "transportador", objetivo: etapa === "LlamadaCierre" ? "Cierre y satisfacci\xF3n" : "Seguimiento en ruta", agente: pl.agente, etapa, resultado: "sin_respuesta", resumen: "No contest\xF3; intento registrado y nuevo contacto programado.", confirmada: false });
  }
  if (tipo === "Conductor_ocupado") {
    llamar(c, { interlocutor: "transportador", objetivo: "Seguimiento en ruta", agente: pl.agente, etapa, resultado: "reprogramada", resumen: "El conductor va manejando: llamada finalizada y reprogramada a un momento seguro.", confirmada: false });
  }
  if (tipo === "Inconformidad_cliente") {
    n.casoSeguimiento = true;
    evento(c, "CasoSeguimientoCreado", `Inconformidad convertida en caso de seguimiento \xB7 ${n.cliente.nombre}`);
  }
  evento(c, evento_, `${exc.titulo}`);
  if (categoria === "automatico") {
    traza(c, etapa, pl.agente, exc.titulo, exc.evidencia, pl.regla, `Gestionar sin intervenci\xF3n: ${exc.alternativas.find((a) => a.id === exc.recomendada)?.titulo}`, "Acci\xF3n registrada en la agenda centralizada", "Se resuelve en el siguiente ciclo");
  } else {
    traza(c, etapa, pl.agente, exc.titulo, exc.evidencia, pl.regla, categoria === "humano" ? "No comprometer valores ni condiciones: presentar al responsable" : "Registrar la novedad y notificar al coordinador", "Gesti\xF3n creada para el coordinador (Mesa)", "Espera decisi\xF3n de una persona");
    n.etapa = "Escalada";
    n.intervencionHumana = true;
  }
}
function cerrarExcepcion(c, por, alt2, dh) {
  const exc = c.n.excepcion;
  c.n.excepcionesPrevias.push({
    ...exc,
    resueltaEn: c.ts,
    resueltaPor: por,
    decisionHumana: dh?.decision,
    alternativaElegida: alt2.id,
    decididoPor: dh?.por
  });
  c.n.excepcion = null;
}
function resolverAutomatica(c) {
  const { n } = c;
  const exc = n.excepcion;
  const alt2 = exc.alternativas.find((a) => a.id === exc.recomendada) ?? exc.alternativas[0];
  const origen = exc.etapaOrigen;
  cerrarExcepcion(c, "agente", alt2);
  n.retrasoHoras += Math.max(0, alt2.impactoHoras) * 0.2;
  traza(c, origen, PLANTILLA_EXCEPCION[exc.tipo].agente, `Resoluci\xF3n de \xAB${exc.titulo}\xBB`, [alt2.titulo], PLANTILLA_EXCEPCION[exc.tipo].regla, alt2.titulo, "Acci\xF3n ejecutada por el agente", "Novedad cerrada sin intervenci\xF3n humana");
  if (exc.tipo === "Datos_incompletos") {
    n.etapa = "EsperaDatos";
    n.etapaRetorno = "Validacion";
  } else {
    n.etapa = origen;
    n.etapaRetorno = null;
  }
}
function aplicarEfecto(c, efecto, origen, motivo) {
  const { n } = c;
  if (efecto.tipo === "cancelar") {
    n.etapa = "Cancelada";
    n.causaCancelacion = motivo;
    n.fechaCierre = c.ts;
    n.etapaRetorno = origen;
    evento(c, "OperacionCancelada", `Operaci\xF3n cancelada \xB7 ${motivo}`);
    return;
  }
  if (efecto.tipo === "volver") {
    n.etapa = efecto.etapa;
    n.etapaRetorno = null;
    if (efecto.etapa === "Busqueda") {
      n.ofertas = [];
      n.transportador = null;
      n.tarifaPactada = null;
    }
    if (efecto.etapa === "Negociacion" && n.ofertas.length === 0) n.etapa = "Busqueda";
    if (efecto.etapa === "Negociacion") {
      n.ofertas = n.ofertas.map((o) => ({ ...o, tarifaFinal: null, estado: o.estado === "sobre_tope" ? "aceptada_preliminar" : o.estado }));
    }
    if (efecto.etapa === "Confirmacion") {
      n.fechaCargue += 4 * 36e5;
    }
    return;
  }
  avanzar(c, origen);
}
function aplicarDecision(c, dh) {
  const { n } = c;
  const exc = n.excepcion;
  const pl = PLANTILLA_EXCEPCION[exc.tipo];
  const origen = exc.etapaOrigen;
  let alt2;
  let efecto;
  if (dh.decision === "RECHAZAR") {
    alt2 = { id: exc.recomendada, titulo: "Propuesta del agente no autorizada", descripcion: "", impactoCosto: 0, impactoHoras: 0, impactoSLA: "medio", reglas: [pl.regla], efecto: pl.rechazo };
    efecto = pl.rechazo;
  } else if (dh.decision === "CANCELAR") {
    alt2 = exc.alternativas.find((a) => a.efecto.tipo === "cancelar") ?? { id: exc.recomendada, titulo: "Cancelar el servicio", descripcion: "", impactoCosto: 0, impactoHoras: 0, impactoSLA: "alto", reglas: ["R28"], efecto: { tipo: "cancelar" } };
    efecto = { tipo: "cancelar" };
  } else {
    alt2 = exc.alternativas.find((a) => a.id === (dh.decision === "ALTERNATIVA" ? dh.alternativa : exc.recomendada)) ?? exc.alternativas[0];
    efecto = alt2.efecto;
  }
  if (efecto.tipo !== "cancelar") {
    if (alt2.impactoCosto > 0 && dh.decision !== "RECHAZAR") n.costosAdicionales += alt2.impactoCosto;
    if (alt2.impactoHoras > 0 && dh.decision !== "RECHAZAR") n.retrasoHoras += alt2.impactoHoras;
  }
  if (exc.tipo === "Tarifa_sobre_tope" && efecto.tipo === "continuar") {
    const of = n.ofertas.find((x) => x.estado === "sobre_tope");
    if (of) {
      of.tarifaFinal = n.tarifaMaxima + alt2.impactoCosto;
      of.estado = "contraoferta_ok";
      n.costosAdicionales -= alt2.impactoCosto;
      n.transportador = TRANSP(of.transportadorId);
      n.tarifaPactada = of.tarifaFinal;
    }
  }
  if (exc.tipo === "Seleccion_manual") {
    const o = mejorOferta(n, alt2.id === "A" ? "tarifa" : alt2.id === "B" ? "cumplimiento" : "compat");
    n.transportador = TRANSP(o.transportadorId);
    n.tarifaPactada = o.tarifaFinal ?? o.tarifaOfrecida;
  }
  if (exc.tipo === "Inconformidad_cliente") n.casoSeguimiento = true;
  if (exc.tipo === "Diferencia_entrega" && alt2.id === "C") n.casoSeguimiento = true;
  cerrarExcepcion(c, "coordinador", alt2, dh);
  evento(c, "DecisionCoordinador", `${dh.por.split(" \xB7 ")[0]} \xB7 ${dh.decision === "ALTERNATIVA" ? `alternativa ${alt2.id}` : dh.decision.toLowerCase()} \xB7 ${exc.titulo}`);
  traza(c, origen, "Coordinador", `Decisi\xF3n sobre \xAB${exc.titulo}\xBB`, [`Propuesta del agente: ${exc.recomendada}`, `Impacto costo ${alt2.impactoCosto} COP \xB7 ${alt2.impactoHoras} h`], pl.regla, dh.decision === "ALTERNATIVA" ? `Alternativa ${alt2.id}: ${alt2.titulo}` : alt2.titulo, dh.por, "La decisi\xF3n vuelve al proceso como evento estructurado");
  aplicarEfecto(c, efecto, origen, exc.titulo);
}
function elegirExcepcion(n, etapa, rng, seleccionAutomatica) {
  if (etapa === "Validacion" && n.datosPendientes.length > 0 && !hubo(n, "Datos_incompletos")) return "Datos_incompletos";
  if (etapa === "Seleccion" && !seleccionAutomatica && !hubo(n, "Seleccion_manual") && n.ofertas.length > 0) return "Seleccion_manual";
  const candidatas = TIPOS_EXCEPCION.map((t) => PLANTILLA_EXCEPCION[t]).filter(
    (p) => p.peso > 0 && p.etapas.includes(etapa) && !hubo(n, p.tipo) && !(p.tipo === "Datos_incompletos") && !(p.tipo === "Sin_respuesta" && n.intentosContacto >= 3)
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
function transicionar(op, o) {
  if (esTerminal(op.etapa)) return null;
  const rng = o.rng ?? Math.random;
  const c = { n: clonar(op), ts: o.ahora, rng, logs: [], seleccionAutomatica: o.seleccionAutomatica };
  const { n } = c;
  if (n.etapa === "Escalada") {
    if (!o.decisionHumana || !n.excepcion) return null;
    aplicarDecision(c, o.decisionHumana);
    sincronizar(n, o.ahora);
    return { operacion: n, logs: c.logs };
  }
  if (n.etapa === "EsperaDatos") {
    if (rng() < 0.2 && !o.forzar?.resolver) {
      llamar(c, { interlocutor: "cliente", objetivo: "Completar datos", agente: "Agente de cliente", etapa: "Validacion", resultado: "sin_respuesta", resumen: "Nuevo intento: el contacto no contest\xF3; se reprograma.", confirmada: false });
      n.intentosContacto += 1;
    } else {
      llamar(c, { interlocutor: "cliente", objetivo: "Completar datos", agente: "Agente de cliente", etapa: "Validacion", resumen: `Completa con ${n.cliente.contacto}: ${n.datosPendientes.join(", ").toLowerCase() || "datos faltantes"}.` });
      traza(c, "Validacion", "Agente de cliente", "Gesti\xF3n posterior para completar datos", n.datosPendientes, "R02", "Cerrar los datos pendientes", "Llamada al cliente", "Solicitud completa");
      n.datosPendientes = [];
      avanzar(c, "Validacion");
    }
    sincronizar(n, o.ahora);
    return { operacion: n, logs: c.logs };
  }
  const etapa = n.etapa;
  if (!esEtapaFlujo(etapa)) return null;
  if (n.excepcion && n.excepcion.categoria === "automatico") {
    resolverAutomatica(c);
    sincronizar(n, o.ahora);
    return { operacion: n, logs: c.logs };
  }
  if (o.forzar?.excepcion) {
    const t = o.forzar.excepcion;
    levantarExcepcion(c, t, etapa);
    sincronizar(n, o.ahora);
    return { operacion: n, logs: c.logs };
  }
  const tipo = o.forzar?.resolver ? null : elegirExcepcion(n, etapa, rng, o.seleccionAutomatica);
  if (tipo) {
    levantarExcepcion(c, tipo, etapa);
    sincronizar(n, o.ahora);
    return { operacion: n, logs: c.logs };
  }
  if (etapa === "Seleccion" && !o.seleccionAutomatica && n.ofertas.length > 0 && !hubo(n, "Seleccion_manual")) {
    levantarExcepcion(c, "Seleccion_manual", etapa);
  } else {
    avanzar(c, etapa);
  }
  sincronizar(n, o.ahora);
  return { operacion: n, logs: c.logs };
}
function nuevaOperacion(ts, rng, seq, canal2) {
  const n = generarOperacion(ts, rng, seq ?? siguienteSeq());
  if (canal2) n.canal = canal2;
  n.eventos.push({ evento: "SolicitudRecibida", timestamp: ts, detalle: `Solicitud recibida por ${n.canal}` });
  n.soportes.push({ nombre: `Solicitud inicial ${n.id}`, tipo: "solicitud", ts });
  if (n.canal === "llamada_ia") {
    const c = { n, ts, rng, logs: [], seleccionAutomatica: true };
    llamar(c, {
      interlocutor: "cliente",
      objetivo: "Recibir solicitud",
      agente: "Agente de cliente",
      etapa: "Solicitud",
      sentido: "entrante",
      resumen: `Atiende a ${n.solicitante} de ${n.cliente.nombre}; identifica empresa y solicitante y recopila origen, destino, mercanc\xEDa, peso, volumen, veh\xEDculo, fecha y condiciones.`
    });
    n.soportes.push({ nombre: `Transcripci\xF3n llamada de solicitud ${n.id}`, tipo: "transcripcion", ts });
  }
  const log = nuevoLog(n, "SolicitudRecibida", `${n.id} \xB7 Solicitud recibida \xB7 ${n.cliente.nombre} \xB7 ${n.nodoOrigen.ciudad} \u2192 ${n.nodoDestino.ciudad}`, ts);
  return { operacion: n, log };
}

// src/data/agentesCatalogo.ts
var AGENTES = [
  { id: "receptor", nombre: "Agente Receptor", rol: "Recibe la solicitud", etapa: "[1] Solicitud", familia: "Agente de cliente", sistema: "canal", sistemas: ["canal", "voz", "plataforma"], color: "#2563eb", descripcion: "Atiende la llamada o lee el formulario, la integraci\xF3n o el registro del coordinador; recopila los datos m\xEDnimos." },
  { id: "validador", nombre: "Agente Validador", rol: "Valida la solicitud", etapa: "[2] Validaci\xF3n", familia: "Agente de cliente", sistema: "revision", sistemas: ["revision", "voz", "agenda"], color: "#3b82f6", descripcion: "Revisa los 9 datos m\xEDnimos; si faltan, programa la gesti\xF3n posterior con el cliente." },
  { id: "planeador", nombre: "Agente de Planeaci\xF3n", rol: "Registra y planea", etapa: "[3] Planeaci\xF3n", familia: "Agente de cliente", sistema: "plataforma", sistemas: ["plataforma", "voz", "agenda"], color: "#1d4ed8", descripcion: "Registra la operaci\xF3n con identificador \xFAnico y confirma cargue, acceso y horarios con el contacto autorizado." },
  { id: "buscador", nombre: "Agente Buscador", rol: "Busca transportadores", etapa: "[4] B\xFAsqueda", familia: "Sistema", sistema: "proveedores", sistemas: ["proveedores"], color: "#0d9488", descripcion: "Consulta la base de proveedores y preselecciona los candidatos m\xE1s compatibles." },
  { id: "negociador", nombre: "Agente Negociador", rol: "Negocia la tarifa", etapa: "[5] Negociaci\xF3n", familia: "Agente de negociaci\xF3n", sistema: "voz", sistemas: ["voz", "proveedores"], color: "#0f766e", descripcion: "Llama a los candidatos, informa la tarifa y negocia sin superar el m\xE1ximo autorizado." },
  { id: "asignador", nombre: "Agente Asignador", rol: "Selecciona y asigna", etapa: "[6]+[7] Selecci\xF3n y asignaci\xF3n", familia: "Sistema", sistema: "plataforma", sistemas: ["plataforma", "revision"], color: "#14b8a6", descripcion: "Consolida las ofertas, selecciona (autom\xE1tica o por el coordinador), valida documentos y formaliza la asignaci\xF3n." },
  { id: "confirmador", nombre: "Agente Confirmador", rol: "Confirma a ambas partes", etapa: "[8]+[9] Confirmaci\xF3n y preventivas", familia: "Agente de seguimiento", sistema: "voz", sistemas: ["voz", "agenda", "plataforma"], color: "#d97706", descripcion: "Doble confirmaci\xF3n con cliente y transportador y llamadas preventivas antes del cargue." },
  { id: "origen", nombre: "Agente de Origen", rol: "Presentaci\xF3n y cargue", etapa: "[10]+[11] Presentaci\xF3n y cargue", familia: "Agente de seguimiento", sistema: "revision", sistemas: ["revision", "voz"], color: "#b45309", descripcion: "Validaci\xF3n cruzada de la llegada y control del cargue y del despacho." },
  { id: "seguimiento", nombre: "Agente de Seguimiento", rol: "Monitorea el tr\xE1nsito", etapa: "[12] Tr\xE1nsito", familia: "Agente de seguimiento", sistema: "tablero", sistemas: ["tablero", "voz"], color: "#7c3aed", descripcion: "Llamadas programadas al transportador; detecta y clasifica novedades; informa al cliente lo confirmado y lo estimado." },
  { id: "destino", nombre: "Agente de Destino", rol: "Aviso, descargue y entrega", etapa: "[13]+[14]+[15] Destino", familia: "Agente de cliente", sistema: "revision", sistemas: ["revision", "voz"], color: "#6d28d9", descripcion: "Prepara la recepci\xF3n, sigue el descargue y cruza la entrega del transportador con la del cliente." },
  { id: "cierre", nombre: "Agente de Cierre", rol: "Cierre con el cliente", etapa: "[16]+[17] Cierre", familia: "Agente de cliente", sistema: "revision", sistemas: ["revision", "voz", "plataforma"], color: "#0891b2", descripcion: "Llamada de cierre y cierre administrativo: documentos, condiciones econ\xF3micas, costos adicionales y novedades." },
  { id: "torre", nombre: "Agente Torre", rol: "Expediente e historial", etapa: "Trazabilidad transversal", familia: "Sistema", sistema: "expediente", sistemas: ["expediente"], color: "#475569", descripcion: "Re\xFAne solicitud, llamadas, transcripciones y soportes; ordena el historial y verifica la traza." }
];
var AGENTES_MAP = Object.fromEntries(AGENTES.map((a) => [a.id, a]));
var ETAPA_AGENTE = {
  Solicitud: "receptor",
  Validacion: "validador",
  Planeacion: "planeador",
  Busqueda: "buscador",
  Negociacion: "negociador",
  Seleccion: "asignador",
  Asignacion: "asignador",
  Confirmacion: "confirmador",
  Preventiva: "confirmador",
  Presentacion: "origen",
  Cargue: "origen",
  Transito: "seguimiento",
  AvisoDestino: "destino",
  Descargue: "destino",
  ValidacionEntrega: "destino",
  LlamadaCierre: "cierre",
  CierreAdmin: "cierre"
};
var HUMANOS = [
  { nombre: "Camila Restrepo", rol: "Coordinadora log\xEDstica", area: "Log\xEDstica", color: "#0f766e", firmaId: "f1" },
  { nombre: "Andr\xE9s Felipe Mora", rol: "Coordinador log\xEDstico", area: "Log\xEDstica", color: "#b45309", firmaId: "f2" },
  { nombre: "Laura Cifuentes", rol: "Coordinadora log\xEDstica", area: "Log\xEDstica", color: "#6d28d9", firmaId: "f3" },
  { nombre: "Sergio Duarte", rol: "Responsable comercial", area: "Comercial", color: "#1d4ed8", firmaId: "f2" },
  { nombre: "Paola Giraldo", rol: "Responsable de costos", area: "Finanzas", color: "#9f1239", firmaId: "f1" }
];
var POR_NOMBRE = (n) => HUMANOS.find((h) => h.nombre === n);
var APROBADOR = {
  Datos_incompletos: "Camila Restrepo",
  Sin_respuesta: "Camila Restrepo",
  Tarifa_sobre_tope: "Paola Giraldo",
  Sin_transportador: "Sergio Duarte",
  Seleccion_manual: "Camila Restrepo",
  Mercancia_no_lista: "Andr\xE9s Felipe Mora",
  Retraso_transportador: "Andr\xE9s Felipe Mora",
  Diferencia_llegada: "Andr\xE9s Felipe Mora",
  Espera_en_cargue: "Andr\xE9s Felipe Mora",
  Diferencia_despacho: "Andr\xE9s Felipe Mora",
  Novedad_en_ruta: "Camila Restrepo",
  Conductor_ocupado: "Camila Restrepo",
  Destinatario_no_recibe: "Laura Cifuentes",
  Demora_en_descargue: "Laura Cifuentes",
  Diferencia_entrega: "Laura Cifuentes",
  Inconformidad_cliente: "Sergio Duarte",
  Sobrecosto_liquidacion: "Paola Giraldo"
};
function humanoPara(tipo) {
  return POR_NOMBRE(APROBADOR[tipo]);
}
function excepcionDelEscenario(e) {
  if (e === "feliz" || e === "feliz_manual" || e === "consulta_entrante") return null;
  if (e === "cancelada") return "Sin_transportador";
  return e;
}
var ETAPA_DE_NOVEDAD = {
  Datos_incompletos: "Validacion",
  Sin_respuesta: "Preventiva",
  Tarifa_sobre_tope: "Negociacion",
  Sin_transportador: "Busqueda",
  Seleccion_manual: "Seleccion",
  Mercancia_no_lista: "Preventiva",
  Retraso_transportador: "Preventiva",
  Diferencia_llegada: "Presentacion",
  Espera_en_cargue: "Cargue",
  Diferencia_despacho: "Cargue",
  Novedad_en_ruta: "Transito",
  Conductor_ocupado: "Transito",
  Destinatario_no_recibe: "AvisoDestino",
  Demora_en_descargue: "Descargue",
  Diferencia_entrega: "ValidacionEntrega",
  Inconformidad_cliente: "LlamadaCierre",
  Sobrecosto_liquidacion: "CierreAdmin"
};
var ESCENAS = [
  { id: "feliz_llamada", etiqueta: "Flujo normal \xB7 llamada atendida por IA", sinopsis: "La solicitud entra por llamada y la operaci\xF3n llega al cierre administrativo sin novedades, con selecci\xF3n autom\xE1tica.", canal: "llamada_ia", escenario: "feliz", fin: "Cerrada" },
  { id: "feliz_manual", etiqueta: "Flujo normal \xB7 selecci\xF3n por el coordinador", sinopsis: "Solicitud por formulario; con la selecci\xF3n autom\xE1tica apagada, el coordinador elige entre las ofertas consolidadas.", canal: "formulario", escenario: "feliz_manual", categoria: "asistido", regla: "R09", fin: "Cerrada" },
  { id: "datos_incompletos", etiqueta: "Datos incompletos", sinopsis: "El cliente no tiene todos los datos al llamar: el agente registra lo confirmado y vuelve a llamar para completarlos.", canal: "llamada_ia", escenario: "Datos_incompletos", categoria: "automatico", regla: "R01 \xB7 R02", fin: "Cerrada" },
  { id: "sin_respuesta", etiqueta: "Contacto no exitoso", sinopsis: "El contacto no contesta la llamada preventiva: se registra el intento y se reprograma (R29).", escenario: "Sin_respuesta", categoria: "automatico", regla: "R29", fin: "Cerrada" },
  { id: "tarifa_sobre_tope", etiqueta: "Tarifa sobre el tope", sinopsis: "El transportador pide m\xE1s del m\xE1ximo autorizado: el agente no compromete valores y decide el responsable de costos.", escenario: "Tarifa_sobre_tope", categoria: "humano", regla: "R06 \xB7 R07 \xB7 R08", fin: "Cerrada" },
  { id: "sin_transportador", etiqueta: "Sin transportador", sinopsis: "Nadie acepta dentro de lo previsto: coordinaci\xF3n con el cliente y autorizaci\xF3n del responsable.", escenario: "Sin_transportador", categoria: "humano", regla: "R08", fin: "Cerrada" },
  { id: "seleccion_manual", etiqueta: "Selecci\xF3n por el coordinador", sinopsis: "Las ofertas se consolidan y la persona selecciona la m\xE1s conveniente.", escenario: "Seleccion_manual", categoria: "asistido", regla: "R09", fin: "Cerrada" },
  { id: "mercancia_no_lista", etiqueta: "Mercanc\xEDa no lista", sinopsis: "En la llamada preventiva el cliente avisa que no estar\xE1 lista: el coordinador autoriza la reprogramaci\xF3n.", escenario: "Mercancia_no_lista", categoria: "asistido", regla: "R13", fin: "Cerrada" },
  { id: "retraso_transportador", etiqueta: "Retraso del transportador", sinopsis: "El transportador no alcanza el horario: se consulta margen de espera sin confirmar cambios definitivos.", escenario: "Retraso_transportador", categoria: "asistido", regla: "R14", fin: "Cerrada" },
  { id: "diferencia_llegada", etiqueta: "Diferencia en la llegada", sinopsis: "El transportador dice que lleg\xF3 y el cliente no lo ve: la validaci\xF3n cruzada lo detecta.", escenario: "Diferencia_llegada", categoria: "asistido", regla: "R15", fin: "Cerrada" },
  { id: "espera_en_cargue", etiqueta: "Espera en el cargue", sinopsis: "El veh\xEDculo espera m\xE1s del par\xE1metro: se consulta la causa y se avisa al coordinador.", escenario: "Espera_en_cargue", categoria: "asistido", regla: "R16", fin: "Cerrada" },
  { id: "diferencia_despacho", etiqueta: "Diferencia en el despacho", sinopsis: "Las unidades cargadas no coinciden con la solicitud: se registra antes de continuar.", escenario: "Diferencia_despacho", categoria: "asistido", regla: "R17", fin: "Cerrada" },
  { id: "novedad_en_ruta", etiqueta: "Novedad en ruta", sinopsis: "Cierre vial o aver\xEDa: el agente clasifica, informa lo confirmado y lo estimado, y el coordinador decide.", escenario: "Novedad_en_ruta", categoria: "asistido", regla: "R19", fin: "Cerrada" },
  { id: "conductor_ocupado", etiqueta: "Conductor conduciendo", sinopsis: "El conductor contesta manejando: el agente cierra y reprograma la llamada (R18).", escenario: "Conductor_ocupado", categoria: "automatico", regla: "R18", fin: "Cerrada" },
  { id: "destinatario_no_recibe", etiqueta: "Destinatario no recibe", sinopsis: "No pueden recibir en el horario previsto: cambios de horario o destino siguen las autorizaciones (R22).", escenario: "Destinatario_no_recibe", categoria: "humano", regla: "R22", fin: "Cerrada" },
  { id: "demora_en_descargue", etiqueta: "Demora en el descargue", sinopsis: "Fila o acceso en destino: se identifica la causa y el impacto.", escenario: "Demora_en_descargue", categoria: "asistido", regla: "R16", fin: "Cerrada" },
  { id: "diferencia_entrega", etiqueta: "Diferencia en la entrega", sinopsis: "Transportador y cliente no coinciden: el sistema no cierra y el coordinador pide evidencias (R23).", escenario: "Diferencia_entrega", categoria: "asistido", regla: "R23", fin: "Cerrada" },
  { id: "inconformidad_cliente", etiqueta: "Inconformidad del cliente", sinopsis: "En la llamada de cierre el cliente expresa una inconformidad: se convierte en caso de seguimiento (R24).", escenario: "Inconformidad_cliente", categoria: "asistido", regla: "R24", fin: "Cerrada" },
  { id: "sobrecosto_liquidacion", etiqueta: "Sobrecosto en la liquidaci\xF3n", sinopsis: "Costos adicionales sin autorizaci\xF3n previa: el cierre espera al responsable (R25).", escenario: "Sobrecosto_liquidacion", categoria: "humano", regla: "R25", fin: "Cerrada" },
  { id: "cancelada", etiqueta: "Servicio cancelado", sinopsis: "Sin transportador y sin acuerdo con el cliente: el responsable cancela el servicio (R28).", escenario: "cancelada", categoria: "humano", regla: "R28", fin: "Cancelada" },
  { id: "consulta_entrante", etiqueta: "Consulta entrante del cliente", sinopsis: "El cliente llama por el estado: el agente valida su autorizaci\xF3n e informa el \xFAltimo avance confirmado (R20).", escenario: "consulta_entrante", categoria: "automatico", regla: "R20", fin: "Cerrada" }
];

// src/lib/utils.ts
function formatCOP(value) {
  if (value >= 1e9) return `$ ${(value / 1e9).toFixed(2)} MM`;
  if (value >= 1e6) return `$ ${(value / 1e6).toFixed(1)} M`;
  if (value >= 1e3) return `$ ${Math.round(value / 1e3)} K`;
  return `$ ${Math.round(value)}`;
}

// src/data/agentesUtil.ts
function rngDesde(seed) {
  let h = seed * 2654435761 >>> 0 || 1;
  return () => {
    h ^= h << 13;
    h >>>= 0;
    h ^= h >>> 17;
    h ^= h << 5;
    h >>>= 0;
    return (h >>> 0) / 4294967296;
  };
}
var pick = (rand, arr) => arr[Math.floor(rand() * arr.length)];
var entre2 = (rand, a, b) => Math.floor(a + rand() * (b - a + 1));
var hex = (rand, n) => Array.from({ length: n }, () => "0123456789abcdef"[Math.floor(rand() * 16)]).join("");
function horaMin(ts) {
  return new Date(ts).toLocaleTimeString("es-CO", { hour12: false, hour: "2-digit", minute: "2-digit" });
}
function miles(n) {
  return new Intl.NumberFormat("es-CO").format(n);
}
function pesos(n) {
  return `$ ${miles(Math.round(n))}`;
}
var CANAL_LABEL = Object.fromEntries(
  Object.keys(CANAL_INFO).map((c) => [c, CANAL_INFO[c].label])
);
var CANAL_CORTO = Object.fromEntries(
  Object.keys(CANAL_INFO).map((c) => [c, CANAL_INFO[c].corto])
);
var SESION_VM = "RPA-VM-COORD-01";

// src/data/agentesDatos.ts
var dia = (ts) => new Date(ts).toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });
var diaCorto = (ts) => new Date(ts).toLocaleDateString("es-CO", { weekday: "short", day: "numeric", month: "short" });
var fechaHora = (ts) => `${diaCorto(ts)} ${horaMin(ts)}`;
var A = (texto, confirmada = true) => ({ quien: "agente", texto, confirmada });
var O = (texto, confirmada = true) => ({ quien: "otro", texto, confirmada });
var numeroEn = (txt, def) => {
  const m = /(\d[\d.]*)/.exec(txt);
  return m ? Number(m[1].replace(/\./g, "")) : def;
};
function rutaDe(o) {
  return `${o.nodoOrigen.ciudad} \u2192 ${o.nodoDestino.ciudad}`;
}
function excDe(tr, tipo) {
  for (const o of tr) {
    if (o.excepcion?.tipo === tipo) return o.excepcion;
  }
  const fin = tr[tr.length - 1];
  return fin.excepcionesPrevias.find((e) => e.tipo === tipo) ?? null;
}
function construirSolicitud(o, seq, rand, ahora2) {
  const ref = `SOL-${new Date(ahora2).getFullYear()}-${String(seq).padStart(5, "0")}`;
  const m = o.mercancia;
  const resumen2 = `${m.unidades} und \xB7 ${m.descripcion} \xB7 ${rutaDe(o)} \xB7 cargue ${fechaHora(o.fechaCargue)}`;
  const base = [
    `Empresa: ${o.cliente.nombre}`,
    `Solicitante: ${o.solicitante} \xB7 ${o.cliente.telefono}`,
    `Origen: ${o.nodoOrigen.lugar}, ${o.nodoOrigen.ciudad}`,
    `Destino: ${o.nodoDestino.lugar}, ${o.nodoDestino.ciudad}`,
    `Mercanc\xEDa: ${m.tipo} \xB7 ${m.descripcion} \xB7 ${m.unidades} und`,
    `Peso: ${miles(m.pesoKg)} kg \xB7 Volumen: ${m.volumenM3.toString().replace(".", ",")} m\xB3`,
    `Veh\xEDculo: ${o.vehiculoRequerido}`,
    `Cargue: ${fechaHora(o.fechaCargue)}`,
    `Entrega: ${o.condicionesEntrega}`,
    `Requisito especial: ${o.requisitoEspecial ?? "ninguno"}`
  ].filter((l) => !o.datosPendientes.some((p) => l.toLowerCase().includes(p.toLowerCase().split(" ")[0])));
  const asunto = o.canal === "llamada_ia" ? `Llamada entrante de ${o.solicitante}` : o.canal === "formulario" ? `Formulario de transporte ${ref}` : o.canal === "integracion" ? `Solicitud ${ref} desde el sistema de ${o.cliente.nombre}` : `Registro del coordinador \xB7 ${ref}`;
  const remitente = o.canal === "integracion" ? `Sistema de ${o.cliente.nombre}` : o.canal === "coordinador" ? pick(rand, ["Camila Restrepo", "Andr\xE9s Felipe Mora", "Laura Cifuentes"]) : o.solicitante;
  return {
    canal: o.canal,
    remitente,
    remitenteContacto: o.canal === "integracion" ? `api.${o.cliente.nombre.split(" ")[0].toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")}.co` : o.cliente.telefono,
    referenciaCliente: ref,
    asunto,
    resumen: resumen2,
    crudo: o.canal === "integracion" ? [`{ "solicitud": "${ref}",`, `  "cliente": "${o.cliente.id}",`, `  "origen": "${o.nodoOrigen.id}", "destino": "${o.nodoDestino.id}",`, `  "peso_kg": ${m.pesoKg}, "volumen_m3": ${m.volumenM3},`, `  "vehiculo": "${o.vehiculoRequerido}",`, `  "cargue": "${new Date(o.fechaCargue).toISOString().slice(0, 16)}" }`] : base
  };
}
var SALUDO_A = "Buenos d\xEDas, habla el asistente virtual de coordinaci\xF3n log\xEDstica de Haceb.";
function construirDialogos(c, rand) {
  const { op, fin } = c;
  const m = op.mercancia;
  const ruta2 = rutaDe(op);
  const contacto = op.cliente.contacto;
  const tel = op.cliente.telefono;
  const out = {};
  const ag = { cliente: "Agente de cliente", neg: "Agente de negociaci\xF3n", seg: "Agente de seguimiento" };
  const add = (clave, d) => {
    out[clave] = { clave, ...d };
  };
  const exc = (t) => excDe(c.tr, t);
  const pend = op.datosPendientes;
  add("recibir", {
    objetivo: "Recibir solicitud",
    interlocutor: "cliente",
    nombre: contacto,
    telefono: tel,
    agente: ag.cliente,
    sentido: "entrante",
    turnos: [
      A(`${SALUDO_A} \xBFCon qui\xE9n hablo y de qu\xE9 empresa nos llama?`),
      O(`Soy ${contacto}, de ${op.cliente.nombre}.`),
      A(`Gracias, ${contacto.split(" ")[0]}. \xBFQu\xE9 mercanc\xEDa necesita movilizar y entre qu\xE9 ciudades?`),
      O(`${m.unidades} unidades de ${m.descripcion.toLowerCase()}, de ${op.nodoOrigen.ciudad} a ${op.nodoDestino.ciudad}.`),
      A(`Registro ${miles(m.pesoKg)} kg y ${m.volumenM3.toString().replace(".", ",")} metros c\xFAbicos. \xBFPara qu\xE9 fecha y hora necesita el cargue?`),
      ...pend.length > 0 ? [O(`El cargue ser\xEDa el ${dia(op.fechaCargue)}, pero ${pend.join(" y ").toLowerCase()} no los tengo a la mano.`), A(`Entendido. Registro lo confirmado y programo una llamada para completar: ${pend.join(", ").toLowerCase()}.`)] : [O(`El ${dia(op.fechaCargue)} a las ${horaMin(op.fechaCargue)}.`), A("\xBFHay alg\xFAn requisito especial de ingreso o de entrega?"), O(op.requisitoEspecial ?? "Ninguno, es una entrega normal."), A("Perfecto. Confirmo todos los datos y le asignamos el n\xFAmero de operaci\xF3n enseguida.")]
    ],
    resultado: "exitosa",
    resumen: `Solicitud recibida por llamada: ${ruta2}, ${m.unidades} und${pend.length ? ` \xB7 pendiente: ${pend.join(", ").toLowerCase()}` : ""}.`
  });
  add("completar", {
    objetivo: "Completar datos",
    interlocutor: "cliente",
    nombre: contacto,
    telefono: tel,
    agente: ag.cliente,
    sentido: "saliente",
    turnos: [
      A(`${SALUDO_A} Le llamo para completar la solicitud de transporte ${ruta2}.`),
      O("S\xED, d\xEDgame."),
      A(`Nos faltaba: ${(pend.length ? pend : ["un dato de la solicitud"]).join(", ").toLowerCase()}. \xBFMe lo puede confirmar?`),
      O("Claro: ya lo consult\xE9, se lo informo ahora mismo."),
      A("Gracias. Queda registrado y la solicitud queda completa.")
    ],
    resultado: "exitosa",
    resumen: "Datos pendientes completados con el cliente."
  });
  add("planeacion", {
    objetivo: "Confirmar condiciones de cargue",
    interlocutor: "cliente",
    nombre: contacto,
    telefono: tel,
    agente: ag.cliente,
    sentido: "saliente",
    turnos: [
      A(`${SALUDO_A} Registramos la operaci\xF3n ${op.id} y necesito confirmar con usted las condiciones del cargue en ${op.nodoOrigen.lugar}.`),
      O("Perfecto."),
      A(`\xBFHay disponibilidad de cargue el ${dia(op.fechaCargue)} desde las ${horaMin(op.fechaCargue)}?`),
      O("S\xED, el muelle est\xE1 disponible desde esa hora."),
      A("\xBFCu\xE1l es el horario de atenci\xF3n y las instrucciones de ingreso para el veh\xEDculo?"),
      O(op.requisitoEspecial ? `Ingreso por porter\xEDa 2. ${op.requisitoEspecial}.` : "Ingreso por porter\xEDa 2, de 7:00 a 17:00, con c\xE9dula y planilla."),
      A("Registrado. Con esto buscamos el transportador.")
    ],
    resultado: "exitosa",
    resumen: "Disponibilidad de cargue, acceso y horarios confirmados con el contacto autorizado."
  });
  c.rondas.forEach((r, i) => {
    const sobre = r.estado === "sobre_tope";
    add(`negociar_${i}`, {
      objetivo: "Negociar tarifa",
      interlocutor: "transportador",
      nombre: r.transportador,
      telefono: r.telefono,
      agente: ag.neg,
      sentido: "saliente",
      turnos: [
        A(`${SALUDO_A} Le llamo para un servicio ${ruta2}, ${m.tipo.toLowerCase()}, ${miles(m.pesoKg)} kg, cargue el ${dia(op.fechaCargue)}. \xBFTiene ${r.vehiculo.toLowerCase()} disponible?`),
        O("S\xED, tengo veh\xEDculo para esa fecha."),
        A(`La tarifa ofrecida es ${pesos(r.tarifaOfrecida)}. \xBFLe interesa?`),
        sobre ? O(`Por esa ruta no me sirve: necesito ${pesos(r.contrapropuesta)}.`) : O(i === 0 ? "Me interesa. Podemos dejarlo en esa tarifa." : "S\xED, la acepto."),
        sobre ? A("Ese valor supera el m\xE1ximo que tengo autorizado; no puedo comprometerlo. Presento su contrapropuesta al coordinador.") : A(`Registro la aceptaci\xF3n preliminar por ${pesos(r.tarifaFinal ?? r.tarifaOfrecida)}. Le confirmo la asignaci\xF3n cuando termine la selecci\xF3n.`)
      ],
      resultado: "exitosa",
      resumen: sobre ? `Contrapropuesta ${pesos(r.contrapropuesta)} sobre el tope: escalada.` : `Aceptaci\xF3n preliminar ${pesos(r.tarifaFinal ?? r.tarifaOfrecida)}.`
    });
  });
  add("informar", {
    objetivo: "Informar asignaci\xF3n",
    interlocutor: "cliente",
    nombre: contacto,
    telefono: tel,
    agente: ag.cliente,
    sentido: "saliente",
    turnos: [
      A(`${SALUDO_A} Le informo que la operaci\xF3n ${op.id} ya tiene veh\xEDculo asignado.`),
      A(`Se presentar\xE1 el ${dia(op.fechaCargue)} a las ${horaMin(op.fechaCargue)} en ${op.nodoOrigen.lugar}. Veh\xEDculo ${c.placa}, conductor ${c.conductor}.`),
      O("Perfecto. La mercanc\xEDa va a estar disponible."),
      A("\xBFQui\xE9n recibir\xE1 el veh\xEDculo y a qu\xE9 tel\xE9fono?"),
      O(`${c.receptor.nombre}, ${c.receptor.telefono}.`),
      A("Registrado, junto con las condiciones de seguridad del establecimiento.")
    ],
    resultado: "exitosa",
    resumen: `Asignaci\xF3n informada; receptor ${c.receptor.nombre}.`
  });
  add("confirmar", {
    objetivo: "Confirmar con transportador",
    interlocutor: "transportador",
    nombre: c.conductor,
    telefono: c.telT,
    agente: ag.seg,
    sentido: "saliente",
    turnos: [
      A(`${SALUDO_A} Le confirmo el servicio ${op.id}: ${ruta2}.`),
      A(`Presentaci\xF3n ${dia(op.fechaCargue)} a las ${horaMin(op.fechaCargue)} en ${op.nodoOrigen.lugar}. Contacto de recibo: ${c.receptor.nombre}.`),
      O("Recibido, todo claro."),
      A("\xBFConoce las condiciones del servicio y est\xE1 preparado para ejecutarlo?"),
      O("S\xED, estoy listo.")
    ],
    resultado: "exitosa",
    resumen: "Transportador confirma que recibi\xF3 la informaci\xF3n completa."
  });
  const eRet = exc("Retraso_transportador");
  const hRet = eRet ? numeroEn(eRet.titulo, 3) : 0;
  add("prev_transportador", {
    objetivo: "Llamada preventiva",
    interlocutor: "transportador",
    nombre: c.conductor,
    telefono: c.telT,
    agente: ag.seg,
    sentido: "saliente",
    turnos: eRet ? [
      A(`${SALUDO_A} Es la llamada preventiva del servicio ${op.id}. \xBFSigue disponible y d\xF3nde est\xE1?`),
      O(`Tengo un problema: voy a llegar unas ${hRet} horas tarde.`, false),
      A("Gracias por avisar. Eso es una estimaci\xF3n; no se la confirmo al cliente hasta validarlo con el coordinador.")
    ] : [
      A(`${SALUDO_A} Es la llamada preventiva del servicio ${op.id}. \xBFSigue disponible?`),
      O(`S\xED, estoy en ${c.op.nodoOrigen.ciudad === NODOS[0].ciudad ? "Copacabana" : op.nodoOrigen.ciudad}, saldr\xE9 a tiempo.`),
      A("\xBFA qu\xE9 hora estima llegar al punto de cargue?"),
      O(`Antes de las ${horaMin(op.fechaCargue - 30 * 6e4)}.`, false)
    ],
    resultado: "exitosa",
    resumen: eRet ? `Transportador anuncia retraso estimado de ${hRet} h.` : "Disponibilidad, ubicaci\xF3n y ETA confirmadas."
  });
  const eMer = exc("Mercancia_no_lista");
  const hMer = eMer ? numeroEn(eMer.titulo, 4) : 0;
  add("prev_cliente", {
    objetivo: "Llamada preventiva",
    interlocutor: "cliente",
    nombre: contacto,
    telefono: tel,
    agente: ag.seg,
    sentido: "saliente",
    turnos: eMer ? [
      A(`${SALUDO_A} Es la llamada preventiva de la operaci\xF3n ${op.id}. \xBFLa mercanc\xEDa estar\xE1 lista a la hora acordada?`),
      O(`No, se nos retras\xF3 el alistamiento; estar\xEDa lista unas ${hMer} horas despu\xE9s.`, false),
      A("Registro la novedad y la notifico al coordinador. Esa hora es una estimaci\xF3n; no la confirmo al transportador hasta que se autorice.")
    ] : [
      A(`${SALUDO_A} Es la llamada preventiva de la operaci\xF3n ${op.id}. \xBFLa mercanc\xEDa est\xE1 preparada y el punto de cargue disponible?`),
      O("S\xED, todo listo."),
      A("\xBFAlg\xFAn cambio en la programaci\xF3n?"),
      O("Ninguno.")
    ],
    resultado: "exitosa",
    resumen: eMer ? `Cliente avisa que la mercanc\xEDa no estar\xE1 lista: +${hMer} h (estimado).` : "Mercanc\xEDa preparada, punto disponible, sin cambios."
  });
  const eLleg = exc("Diferencia_llegada");
  add("presentacion_transportador", {
    objetivo: "Validar presentaci\xF3n",
    interlocutor: "transportador",
    nombre: c.conductor,
    telefono: c.telT,
    agente: ag.seg,
    sentido: "entrante",
    turnos: [O(`Ya llegu\xE9 a ${op.nodoOrigen.lugar}, veh\xEDculo ${c.placa}.`), A("Gracias. Validamos su presentaci\xF3n con el cliente y le confirmo.")],
    resultado: "exitosa",
    resumen: "El transportador reporta su llegada al punto de origen."
  });
  add("presentacion_cliente", {
    objetivo: "Validar presentaci\xF3n",
    interlocutor: "cliente",
    nombre: contacto,
    telefono: tel,
    agente: ag.seg,
    sentido: "saliente",
    turnos: eLleg ? [A(`${SALUDO_A} El transportador reporta que ya lleg\xF3. \xBFLo tiene en las instalaciones?`), O("No, en porter\xEDa no hay ning\xFAn veh\xEDculo con esa placa."), A("Gracias. Registro la diferencia entre lo reportado y lo observado y pido evidencia al transportador.")] : [A(`${SALUDO_A} El transportador reporta que ya lleg\xF3. \xBFLo tiene en las instalaciones y se autoriz\xF3 el ingreso?`), O("S\xED, ya est\xE1 en el muelle."), A("Entonces el cargue puede comenzar.")],
    resultado: eLleg ? "con_novedad" : "exitosa",
    resumen: eLleg ? "Validaci\xF3n cruzada: diferencia con lo reportado por el transportador." : "Cliente confirma presencia del veh\xEDculo y el ingreso autorizado."
  });
  const eDes = exc("Diferencia_despacho");
  const faltan = eDes ? numeroEn(eDes.titulo, 3) : 0;
  add("despacho", {
    objetivo: "Confirmar despacho",
    interlocutor: "cliente",
    nombre: contacto,
    telefono: tel,
    agente: ag.seg,
    sentido: "saliente",
    turnos: eDes ? [A(`${SALUDO_A} \xBFConfirma que la mercanc\xEDa fue despachada y las cantidades?`), O(`Sali\xF3, pero se cargaron ${faltan} unidades menos de las solicitadas.`), A("Queda registrada la diferencia para validarla antes de continuar.")] : [A(`${SALUDO_A} \xBFConfirma que la mercanc\xEDa fue despachada?`), O(`S\xED, sali\xF3 a las ${horaMin(op.fechaCargue + 90 * 6e4)} con las ${m.unidades} unidades.`), A("Registro la hora real de salida y que la operaci\xF3n sigue hacia el destino.")],
    resultado: eDes ? "con_novedad" : "exitosa",
    resumen: eDes ? `Despacho con diferencia de ${faltan} unidades.` : "Despacho confirmado con las cantidades solicitadas."
  });
  const eRuta = exc("Novedad_en_ruta");
  add("seguimiento_1", {
    objetivo: "Seguimiento en ruta",
    interlocutor: "transportador",
    nombre: c.conductor,
    telefono: c.telT,
    agente: ag.seg,
    sentido: "saliente",
    turnos: eRuta ? [A(`${SALUDO_A} Seguimiento del servicio ${op.id}: \xBFc\xF3mo va el viaje?`), O(`Hay una novedad: ${eRuta.titulo.replace("Novedad en ruta: ", "")}.`), A("\xBFCu\xE1nto retraso estima?"), O("Unas cuatro horas, aunque no lo puedo asegurar.", false), A("Registro la novedad y la clasifico. Esa hora es una estimaci\xF3n.")] : [A(`${SALUDO_A} Seguimiento del servicio ${op.id}: \xBFc\xF3mo va el viaje?`), O("Sin novedad, voy por la v\xEDa principal."), A("\xBFD\xF3nde se encuentra y a qu\xE9 hora estima llegar?"), O("Pasando el peaje, llego sobre las dos de la tarde.", false)],
    resultado: eRuta ? "con_novedad" : "exitosa",
    resumen: eRuta ? "Novedad en ruta reportada por el conductor." : "Estado del viaje, ubicaci\xF3n y ETA (estimada)."
  });
  add("seguimiento_2", {
    objetivo: "Seguimiento en ruta",
    interlocutor: "transportador",
    nombre: c.conductor,
    telefono: c.telT,
    agente: ag.seg,
    sentido: "saliente",
    turnos: [A(`${SALUDO_A} Segundo seguimiento: \xBFc\xF3mo va el recorrido?`), O("Bien, avanzando seg\xFAn lo previsto."), A("Actualizo la hora estimada de llegada.")],
    resultado: "exitosa",
    resumen: "Avance seg\xFAn lo previsto; ETA actualizada (estimada)."
  });
  add("informar_novedad", {
    objetivo: "Informar novedad",
    interlocutor: "cliente",
    nombre: contacto,
    telefono: tel,
    agente: ag.cliente,
    sentido: "saliente",
    turnos: [A(`${SALUDO_A} Le informo sobre la operaci\xF3n ${op.id}: hay una novedad en ruta.`), A("Lo confirmado es que el veh\xEDculo est\xE1 detenido por la novedad; la nueva hora de llegada es solo una estimaci\xF3n."), O("Entiendo, av\xEDseme cuando tengan una hora confirmada.")],
    resultado: "exitosa",
    resumen: "Cliente informado: novedad confirmada y hora estimada, sin prometer."
  });
  add("consulta", {
    objetivo: "Consulta de estado",
    interlocutor: "cliente",
    nombre: contacto,
    telefono: tel,
    agente: ag.cliente,
    sentido: "entrante",
    turnos: [
      O(`Hola, quiero saber c\xF3mo va el servicio ${op.id}.`),
      A(`Buenos d\xEDas. Para consultar necesito validar su autorizaci\xF3n: \xBFsu nombre y empresa?`),
      O(`${contacto}, de ${op.cliente.nombre}.`),
      A("Verificado: es contacto autorizado de la operaci\xF3n. El veh\xEDculo sali\xF3, est\xE1 en tr\xE1nsito y el \xFAltimo avance confirmado es el seguimiento m\xE1s reciente."),
      O("Gracias.")
    ],
    resultado: "exitosa",
    resumen: "Consulta entrante atendida: identidad validada e informado el \xFAltimo avance confirmado."
  });
  add("conductor_ocupado", {
    objetivo: "Seguimiento en ruta",
    interlocutor: "transportador",
    nombre: c.conductor,
    telefono: c.telT,
    agente: ag.seg,
    sentido: "saliente",
    turnos: [A(`${SALUDO_A} Seguimiento del servicio ${op.id}.`), O("Voy manejando, ahora no puedo hablar."), A("Entendido, no lo distraigo. Lo vuelvo a llamar en veinte minutos.")],
    resultado: "reprogramada",
    resumen: "El conductor iba manejando: contacto cerrado y reprogramado."
  });
  add("sin_respuesta", {
    objetivo: "Seguimiento en ruta",
    interlocutor: "transportador",
    nombre: c.conductor,
    telefono: c.telT,
    agente: ag.seg,
    sentido: "saliente",
    turnos: [A("Llamando\u2026"), A("Sin respuesta tras seis timbres. Se registra el intento y se programa un nuevo contacto.")],
    resultado: "sin_respuesta",
    resumen: "No contest\xF3: intento registrado y reprogramado."
  });
  const eDest = exc("Destinatario_no_recibe");
  const hDest = eDest ? numeroEn(eDest.titulo, 3) : 0;
  add("aviso", {
    objetivo: "Preparar recepci\xF3n",
    interlocutor: "destinatario",
    nombre: contacto,
    telefono: tel,
    agente: ag.cliente,
    sentido: "saliente",
    turnos: eDest ? [A(`${SALUDO_A} El veh\xEDculo de la operaci\xF3n ${op.id} llegar\xE1 pronto a ${op.nodoDestino.lugar}. \xBFPueden recibirlo?`), O(`No, hasta dentro de ${hDest} horas no tenemos muelle libre.`, false), A("Registro la situaci\xF3n y activo la coordinaci\xF3n con el transportador y el responsable. No confirmo cambios hasta tener las autorizaciones.")] : [A(`${SALUDO_A} El veh\xEDculo de la operaci\xF3n ${op.id} llegar\xE1 pronto a ${op.nodoDestino.lugar}. \xBFEst\xE1n preparados para recibirlo?`), O("S\xED, el muelle est\xE1 libre."), A("\xBFCu\xE1l es el horario de descargue y la instrucci\xF3n de ingreso?"), O("Hasta las cinco, con la orden de compra a la mano.")],
    resultado: eDest ? "con_novedad" : "exitosa",
    resumen: eDest ? `Destinatario no puede recibir hasta dentro de ${hDest} h (estimado).` : "Instalaciones preparadas, horarios e ingreso confirmados."
  });
  const eDem = exc("Demora_en_descargue");
  add("recepcion", {
    objetivo: "Confirmar recepci\xF3n",
    interlocutor: "destinatario",
    nombre: contacto,
    telefono: tel,
    agente: ag.seg,
    sentido: "saliente",
    turnos: eDem ? [A(`${SALUDO_A} El veh\xEDculo reporta que a\xFAn no ha podido descargar. \xBFCu\xE1l es la causa?`), O("Hay fila de veh\xEDculos en el muelle; en una hora lo atendemos.", false), A("Registro la demora y su causa; se la notifico al coordinador.")] : [A(`${SALUDO_A} \xBFSe recibi\xF3 la mercanc\xEDa? \xBFHubo diferencias o da\xF1os?`), O("Recibida completa y sin da\xF1os."), A("Registro la recepci\xF3n sin observaciones.")],
    resultado: eDem ? "con_novedad" : "exitosa",
    resumen: eDem ? "Demora en destino: se identifica causa y tiempo estimado." : "Recepci\xF3n confirmada sin diferencias ni da\xF1os."
  });
  const eEnt = exc("Diferencia_entrega");
  add("entrega", {
    objetivo: "Validar entrega",
    interlocutor: "cliente",
    nombre: contacto,
    telefono: tel,
    agente: ag.cliente,
    sentido: "saliente",
    turnos: eEnt ? [A(`${SALUDO_A} El transportador informa que la entrega fue completa. \xBFLo confirma?`), O(eEnt.causa.replace(/^.*indica que /, "No: ").replace(/\.$/, "") + "."), A("Las versiones no coinciden: no cierro la operaci\xF3n y genero una novedad para el coordinador.")] : [A(`${SALUDO_A} El transportador informa que la entrega fue completa. \xBFLo confirma?`), O("S\xED, recibida completa."), A("Gracias. Registro la confirmaci\xF3n y solicito los soportes de entrega.")],
    resultado: eEnt ? "con_novedad" : "exitosa",
    resumen: eEnt ? "Cliente y transportador no coinciden sobre la entrega." : "Entrega confirmada por ambas partes."
  });
  const eInc = exc("Inconformidad_cliente");
  add("cierre", {
    objetivo: "Cierre y satisfacci\xF3n",
    interlocutor: "cliente",
    nombre: contacto,
    telefono: tel,
    agente: ag.cliente,
    sentido: "saliente",
    turnos: eInc ? [A(`${SALUDO_A} Le llamo para cerrar la operaci\xF3n ${op.id}. \xBFSe complet\xF3 satisfactoriamente?`), O(`Se complet\xF3, pero ${eInc.causa.replace(/^.*manifiesta que /, "").replace(/\.$/, "")}.`), A("Lamento el inconveniente. No queda como un comentario: abro un caso de seguimiento con responsable y plazo."), O("Gracias.")] : [A(`${SALUDO_A} Le llamo para cerrar la operaci\xF3n ${op.id}. \xBFSe complet\xF3 satisfactoriamente?`), O("S\xED, todo bien."), A("\xBFObservaciones sobre la atenci\xF3n, el cumplimiento de horarios o el desempe\xF1o?"), O("Ninguna, el servicio fue puntual."), A("Gracias. \xBFC\xF3mo califica el servicio de 1 a 5?"), O(`${fin.satisfaccion ?? 5}.`)],
    resultado: eInc ? "con_novedad" : "exitosa",
    resumen: eInc ? "Inconformidad convertida en caso de seguimiento." : `Servicio completado \xB7 calificaci\xF3n ${fin.satisfaccion ?? 5}/5.`
  });
  void rand;
  return out;
}
var item = (id, etiqueta, valor, ok = true, regla, excepcion) => ({ id, etiqueta, valor, ok, regla, excepcion });
function construirDatosMinimos(o) {
  const m = o.mercancia;
  const falta = (clave) => o.datosPendientes.some((p) => p.toLowerCase().includes(clave));
  return [
    item("origen", "Origen", `${o.nodoOrigen.lugar}, ${o.nodoOrigen.ciudad}`),
    item("destino", "Destino", `${o.nodoDestino.lugar}, ${o.nodoDestino.ciudad}`),
    item("mercancia", "Tipo de mercanc\xEDa", `${m.tipo} \xB7 ${m.descripcion} \xB7 ${m.unidades} und`),
    item("peso", "Peso", falta("peso") ? "No informado" : `${miles(m.pesoKg)} kg`, !falta("peso"), "R01", "Datos_incompletos"),
    item("volumen", "Volumen", falta("volumen") ? "No informado" : `${m.volumenM3.toString().replace(".", ",")} m\xB3`, !falta("volumen"), "R01", "Datos_incompletos"),
    item("vehiculo", "Caracter\xEDsticas del veh\xEDculo", falta("veh\xEDculo") ? "No informado" : o.vehiculoRequerido, !falta("veh\xEDculo"), "R01", "Datos_incompletos"),
    item("cargue", "Fecha y hora de cargue", falta("hora") ? "Fecha sin hora" : fechaHora(o.fechaCargue), !falta("hora"), "R01", "Datos_incompletos"),
    item("entrega", "Condiciones de entrega", falta("recibo") ? "Sin contacto de recibo" : o.condicionesEntrega, !falta("recibo"), "R01", "Datos_incompletos"),
    item("especial", "Requisito especial", falta("ingreso") ? "Pendiente de confirmar" : o.requisitoEspecial ?? "Ninguno", !falta("ingreso"), "R01", "Datos_incompletos")
  ];
}
function construirDocumentos(placa, conductor, ahora2) {
  const vence = (meses) => new Date(ahora2 + meses * 30 * 864e5).toLocaleDateString("es-CO", { month: "2-digit", year: "numeric" });
  return [
    item("licencia", "Licencia de conducci\xF3n", `${conductor} \xB7 categor\xEDa C2 \xB7 vigente hasta ${vence(14)}`, true, "R10"),
    item("soat", "SOAT", `${placa} \xB7 vigente hasta ${vence(7)}`, true, "R10"),
    item("tecnomecanica", "Revisi\xF3n t\xE9cnico-mec\xE1nica", `${placa} \xB7 vigente hasta ${vence(5)}`, true, "R10"),
    item("propiedad", "Tarjeta de propiedad", `${placa} \xB7 a nombre de la empresa transportadora`, true, "R10"),
    item("seguridad", "Afiliaci\xF3n a seguridad social", `${conductor} \xB7 salud, pensi\xF3n y ARL al d\xEDa`, true, "R10"),
    item("manifiesto", "Manifiesto de carga electr\xF3nico", `Habilitado para la ruta`, true, "R10")
  ];
}
function construirDatos(seq, tr, rand, ahoraSim) {
  const op = tr[0];
  const fin = tr[tr.length - 1];
  const anio = new Date(ahoraSim).getFullYear();
  const transp = [...tr].reverse().find((o) => o.transportador)?.transportador ?? TRANSPORTADORES[0];
  const receptor = fin.receptor ?? { nombre: "Yesid Palacios", telefono: "+57 312 555 0431" };
  const tTarifa = excDe(tr, "Tarifa_sobre_tope");
  const ofertas = (tTarifa ? tr.find((o) => o.excepcion?.tipo === "Tarifa_sobre_tope")?.ofertas : [...tr].reverse().find((o) => o.ofertas.length > 0)?.ofertas) ?? [];
  const rondas = ofertas.map((x) => ({
    transportadorId: x.transportadorId,
    transportador: x.nombre,
    vehiculo: x.vehiculo,
    telefono: TRANSPORTADORES.find((t) => t.id === x.transportadorId)?.telefono ?? "+57 310 555 0300",
    tarifaOfrecida: x.tarifaOfrecida,
    contrapropuesta: x.tarifaSolicitada,
    tarifaFinal: x.tarifaFinal,
    estado: x.estado,
    compatibilidad: x.compatibilidad,
    cumplimiento: x.cumplimiento
  }));
  const dialogos = construirDialogos({ tr, fin, op, conductor: transp.conductor, telT: transp.telefono, transp: transp.nombre, placa: transp.placa, receptor, rondas }, rand);
  const eLleg = excDe(tr, "Diferencia_llegada");
  const horaLleg = fin.horaSalida ? fin.horaSalida - 80 * 6e4 : op.fechaCargue;
  const cruceLlegada = {
    titulo: "Presentaci\xF3n del transportador en el punto de origen",
    transportador: { fuente: `${transp.conductor} \xB7 actualizaci\xF3n del transportador`, afirma: `Llegu\xE9 a ${op.nodoOrigen.lugar} a las ${horaMin(horaLleg)}, placa ${transp.placa}` },
    cliente: { fuente: `${op.cliente.contacto} \xB7 porter\xEDa del cliente`, afirma: eLleg ? "No hay ning\xFAn veh\xEDculo con esa placa en porter\xEDa ni en el patio" : `Veh\xEDculo ${transp.placa} en el muelle, ingreso autorizado` },
    coincide: !eLleg,
    detalle: eLleg ? "Diferencia entre lo reportado y lo observado (R15)" : "Lo reportado coincide con lo observado (R15)"
  };
  const eDes = excDe(tr, "Diferencia_despacho");
  const eEsp = excDe(tr, "Espera_en_cargue");
  const faltan = eDes ? numeroEn(eDes.titulo, 3) : 0;
  const minEsp = eEsp ? numeroEn(eEsp.titulo, 120) : entre2(rand, 12, 55);
  const cargue = [
    item("espera", "Espera en el punto de cargue", `${minEsp} min${eEsp ? " \xB7 supera el par\xE1metro de 90 min" : ""}`, !eEsp, "R16", "Espera_en_cargue"),
    item("unidades", "Unidades cargadas", eDes ? `${op.mercancia.unidades - faltan} de ${op.mercancia.unidades} solicitadas` : `${op.mercancia.unidades} de ${op.mercancia.unidades} solicitadas`, !eDes, "R17", "Diferencia_despacho"),
    item("condiciones", "Condiciones de la carga", "Estibas \xEDntegras \xB7 sin da\xF1os visibles", true, "R17"),
    item("remision", "Remisi\xF3n de despacho", eDes ? `R-${String(seq).padStart(6, "0")} \xB7 sin firma del cliente` : `R-${String(seq).padStart(6, "0")} \xB7 firmada por ${op.cliente.contacto}`, !eDes, "R17", "Diferencia_despacho"),
    item("sellos", "Sellos de seguridad", `2 sellos \xB7 ${hex(rand, 6).toUpperCase()} / ${hex(rand, 6).toUpperCase()}`, true),
    item("salida", "Hora real de salida", fin.horaSalida ? horaMin(fin.horaSalida) : horaMin(op.fechaCargue + 100 * 6e4), true)
  ];
  const eEnt = excDe(tr, "Diferencia_entrega");
  const cruceEntrega = {
    titulo: "Entrega al destinatario",
    transportador: { fuente: `${transp.conductor} \xB7 actualizaci\xF3n del transportador`, afirma: `Entrega completa de ${op.mercancia.unidades} unidades en ${op.nodoDestino.lugar}` },
    cliente: { fuente: `${op.cliente.contacto} \xB7 destinatario`, afirma: eEnt ? eEnt.causa.replace(/^.*indica que /, "").replace(/\.$/, "") : `Recibidas ${op.mercancia.unidades} unidades completas, sin da\xF1os` },
    coincide: !eEnt,
    detalle: eEnt ? "No coinciden: no se cierra autom\xE1ticamente (R23)" : "Ambas partes coinciden (R23)"
  };
  const eSob = excDe(tr, "Sobrecosto_liquidacion");
  const extraSol = eSob ? numeroEn(eSob.titulo.replace(/\./g, ""), 0) : 0;
  const tarifa = fin.tarifaPactada ?? op.tarifaMaxima;
  const cierreAdmin = [
    item("documentos", "Documentaci\xF3n final del servicio", `Remisi\xF3n, soporte de entrega y manifiesto completos`, true, "R25"),
    item("economicas", "Condiciones econ\xF3micas negociadas", `Tarifa pactada ${pesos(tarifa)} \xB7 tope ${pesos(op.tarifaMaxima)}`, tarifa <= op.tarifaMaxima || fin.costosAdicionales > 0, "R25"),
    item("adicionales", "Costos adicionales autorizados", eSob ? `Solicitados ${pesos(extraSol)} \xB7 autorizados ${pesos(0)}` : `${pesos(fin.costosAdicionales)} autorizados`, !eSob, "R25", "Sobrecosto_liquidacion"),
    item("novedades", "Novedades que afectan la liquidaci\xF3n", fin.excepcionesPrevias.length ? `${fin.excepcionesPrevias.length} novedades registradas, todas resueltas` : "Sin novedades", true, "R25"),
    item("soportes", "Soportes de entrega", "Soporte firmado cargado en el expediente", true, "R25")
  ];
  const tareas = fin.llamadas.slice(0, 9).map((l, i) => ({
    id: `T-${seq}-${i + 1}`,
    hora: l.ts,
    objetivo: l.objetivo,
    interlocutor: `${l.nombre} (${l.interlocutor})`,
    actividad: l.resumen.length > 70 ? `${l.resumen.slice(0, 68)}\u2026` : l.resumen,
    estado: l.resultado === "sin_respuesta" || l.resultado === "reprogramada" ? "reprogramada" : "hecha"
  }));
  tareas.push({ id: `T-${seq}-p1`, hora: fin.fechaCargue + 6 * 36e5, objetivo: "Seguimiento en ruta", interlocutor: `${transp.conductor} (transportador)`, actividad: "Seguimiento programado del viaje", estado: "pendiente" });
  const rutas = [["Medell\xEDn", "Barranquilla"], ["Bogot\xE1", "Cali"], ["Cali", "Pereira"], ["Medell\xEDn", "Bucaramanga"], ["Bogot\xE1", "Ibagu\xE9"]];
  const estados = ["En ruta \xB7 sin novedad", "En ruta \xB7 retraso estimado", "Cargando", "En destino \xB7 descargando"];
  const filas = rutas.slice(0, 4).map((r, i) => {
    const cl = CLIENTES[(seq + i * 3) % CLIENTES.length];
    const tp = TRANSPORTADORES[(seq + i) % TRANSPORTADORES.length];
    return {
      operacion: `OP-${String(6900 + (seq * 7 + i * 13) % 90).padStart(4, "0")}`,
      cliente: cl.nombre,
      ruta: `${r[0]} \u2192 ${r[1]}`,
      vehiculo: `${tp.placa} \xB7 ${tp.nombre}`,
      estado: estados[(seq + i) % estados.length],
      eta: `${String(8 + (seq + i * 3) % 9).padStart(2, "0")}:${["00", "15", "30", "45"][(seq + i) % 4]}`,
      confirmada: (seq + i) % 3 === 0,
      propia: false
    };
  });
  filas.unshift({ operacion: op.id, cliente: op.cliente.nombre, ruta: rutaDe(op), vehiculo: `${transp.placa} \xB7 ${transp.nombre}`, estado: "En ruta \xB7 sin novedad", eta: horaMin(op.fechaCargue + 7 * 36e5), confirmada: false, propia: true });
  const conExc = tr.find((o) => o.excepcion !== null);
  const excepcion = conExc?.excepcion ?? null;
  const resuelta = excepcion ? fin.excepcionesPrevias.find((e) => e.tipo === excepcion.tipo) ?? null : null;
  let decision = null;
  if (excepcion && resuelta && resuelta.resueltaPor === "coordinador") {
    decision = {
      humano: humanoPara(excepcion.tipo),
      decision: resuelta.decisionHumana ?? "AUTORIZAR",
      alternativa: resuelta.alternativaElegida ?? null,
      aplicada: resuelta.alternativas.find((a) => a.id === resuelta.alternativaElegida) ?? null
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
    expediente: { numero: `EXP-COORD-${anio}-${String(seq).padStart(5, "0")}`, hash: hex(rand, 64) },
    sesion: { usuario: "rpa.coordinacion", servidor: "SRV-COORD-02", terminal: `T-${entre2(rand, 10, 24)}`, vm: SESION_VM },
    anio
  };
}

// src/data/guiones/canal.ts
var canal = {};

// src/data/guiones/voz.ts
var voz = {};

// src/data/guiones/plataforma.ts
var plataforma = {};

// src/data/guiones/proveedores.ts
var proveedores = {};

// src/data/guiones/agenda.ts
var agenda = {};

// src/data/guiones/revision.ts
var revision = {};

// src/data/guiones/tablero.ts
var tablero = {};

// src/data/guiones/mesa.ts
var mesa = {};

// src/data/guiones/expediente.ts
var expediente = {};

// src/data/guiones/index.ts
var GUIONES = {
  ...canal,
  ...voz,
  ...plataforma,
  ...proveedores,
  ...agenda,
  ...revision,
  ...tablero,
  ...mesa,
  ...expediente
};

// src/data/agentesPlan.ts
var DET = {
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
  CierreAdmin: { Sobrecosto_liquidacion: 1 }
};
function variar(rand, ms) {
  return Math.round(ms * (0.8 + rand() * 0.4));
}
function crearPaso(ctxBase) {
  return (id, texto, duracion, extra = {}) => {
    const { variante, ...resto } = extra;
    const base = id.replace(/_\d+$/, "");
    const guion = (variante ? GUIONES[`${variante}:${base}`] : void 0) ?? GUIONES[base];
    const p = { id, texto, duracion, ...resto };
    if (guion) {
      const g = guion({ ...ctxBase, id, duracion, ok: resto.ok !== false, humano: resto.humano, sistema: resto.sistema });
      p.vista = g.vista ?? p.vista;
      p.ui = g.ui ?? p.ui;
      p.pensamiento = g.pensamiento ?? p.pensamiento;
    }
    return p;
  };
}
var nombreEtapa = (e) => ETAPA_LABEL_CORTO[e] ?? e;
function generarPlan(seq, canal2, escenario, d) {
  const rand = rngDesde(seq * 104729 + 3);
  const v = (ms) => variar(rand, ms);
  const paso = crearPaso({ d, canal: canal2, escenario, seq });
  const tr = d.trayectoria;
  const fin = tr[tr.length - 1];
  const info = CANAL_INFO[canal2];
  const op0 = tr[0];
  const transp = [...tr].reverse().find((o) => o.transportador)?.transportador;
  const D = d.dialogos;
  const defEtapa = (S, o, nxt, raised) => {
    const det = DET[S];
    const f = (k) => !!raised && det[raised.tipo] === k;
    const S_ = (id, texto, ms, k, sistema, vista, extra = {}) => paso(id, texto, v(ms), { sistema, vista, ...extra, ok: f(k) ? false : extra.ok, resultado: f(k) ? raised.titulo : extra.resultado });
    const contacto = o.cliente.contacto;
    const ruta2 = rutaDe(o);
    const rondas = d.negociacion;
    const manual = !!nxt.transportador && false;
    void manual;
    switch (S) {
      case "Solicitud": {
        const esLl = canal2 === "llamada_ia";
        const sol = d.solicitud;
        return {
          pasos: [
            S_("a1", `Nueva solicitud detectada por ${info.label.charAt(0).toLowerCase()}${info.label.slice(1)}`, 700, -1, "canal", "canal.bandeja", { estado: "Solicitud", snapshot: 0, resultado: `${info.corto} \xB7 ${sol.referenciaCliente} \xB7 ${op0.cliente.nombre}`, bitacora: `${info.label} \xB7 ${sol.asunto}` }),
            ...esLl ? [
              S_("a2", "Atendiendo al cliente: identificando empresa y solicitante", 1300, -1, "voz", "voz.consola", { resultado: `${op0.solicitante} \xB7 ${op0.cliente.nombre}` }),
              S_("a3", "Recopilando origen, destino, mercanc\xEDa, peso, volumen, veh\xEDculo, fecha y condiciones", 1800, -1, "voz", "voz.consola", { regla: "R02", resultado: op0.datosPendientes.length ? `${9 - op0.datosPendientes.length} de 9 datos \xB7 pendiente: ${op0.datosPendientes.join(", ").toLowerCase()}` : "9 de 9 datos m\xEDnimos" })
            ] : [S_("a2", canal2 === "integracion" ? "Leyendo la solicitud que lleg\xF3 del sistema del cliente" : canal2 === "formulario" ? "Leyendo el formulario diligenciado por el cliente" : "Leyendo el registro hecho por el coordinador", 900, -1, "canal", "canal.bandeja", { resultado: sol.resumen })],
            S_("a4", "Guardando la solicitud inicial en el expediente", 800, -1, "plataforma", "plataforma.operacion", { resultado: esLl ? "Solicitud inicial y transcripci\xF3n de la llamada" : "Solicitud inicial" })
          ]
        };
      }
      case "Validacion":
        return {
          pasos: [
            S_("v1", "Revisando los 9 datos m\xEDnimos de la solicitud", 2200, 0, "revision", "revision.datos", { regla: "R01", resultado: "9 de 9 datos presentes" }),
            S_("v2", "Comprobando coherencia entre peso, volumen y veh\xEDculo requerido", 1e3, -1, "revision", "revision.datos", { regla: "R01", resultado: `${miles(o.mercancia.pesoKg)} kg dentro de la capacidad de ${o.vehiculoRequerido}` }),
            S_("v3", "Solicitud suficiente para iniciar la operaci\xF3n", 500, -1, "plataforma", "plataforma.operacion", { resultado: "SolicitudValidada" })
          ]
        };
      case "Planeacion":
        return {
          pasos: [
            S_("p1", `Registrando la operaci\xF3n con identificador \xFAnico ${o.id}`, 900, -1, "plataforma", "plataforma.operacion", { regla: "R03", resultado: `${o.id} \xB7 ${ruta2} \xB7 OperacionRegistrada` }),
            S_("p2", "Identificando restricciones operativas, fechas comprometidas y recursos requeridos", 1100, -1, "plataforma", "plataforma.operacion", { resultado: `${o.vehiculoRequerido} \xB7 cargue ${horaMin(o.fechaCargue)} \xB7 ${o.requisitoEspecial ?? "sin requisitos especiales"}` }),
            S_("p3", `Llamando al contacto autorizado (${contacto}): disponibilidad de cargue, acceso y horarios`, 1800, -1, "voz", "voz.consola", { regla: "R04", resultado: D.planeacion?.resumen }),
            S_("p4", "Registrando el compromiso \xABmercanc\xEDa disponible\xBB en la agenda", 600, -1, "agenda", "agenda.central", { regla: "R26", resultado: `Compromiso del cliente \xB7 vence ${horaMin(o.fechaCargue)}` })
          ]
        };
      case "Busqueda": {
        const n = nxt.ofertas.length || d.negociacion.length;
        return {
          pasos: [
            S_("b1", "Abriendo la base de proveedores", 700, -1, "proveedores", "proveedores.base", { resultado: `${o.vehiculoRequerido} \xB7 ruta ${ruta2}` }),
            S_("b2", "Filtrando por ubicaci\xF3n y tipo de veh\xEDculo requerido", 1100, -1, "proveedores", "proveedores.base", { resultado: `${n + 4} transportadores con ${o.vehiculoRequerido}` }),
            S_("b3", "Puntuando capacidad, rutas habituales, historial de cumplimiento y condiciones comerciales", 1500, -1, "proveedores", "proveedores.base", { regla: "R05", resultado: "Compatibilidad y cumplimiento calculados" }),
            S_("b4", raised ? "Sin candidatos que acepten dentro de lo previsto" : `${n} candidatos preseleccionados`, 600, 3, "proveedores", "proveedores.base", { resultado: `${n} candidatos \xB7 TransportadoresPreseleccionados` })
          ]
        };
      }
      case "Negociacion": {
        const r0 = rondas[0];
        const adjudicada = d.excepcion?.tipo === "Tarifa_sobre_tope" && d.decision?.aplicada?.efecto.tipo === "continuar";
        return {
          pasos: [
            S_("n1", `Llamando a ${r0?.transportador ?? "el candidato 1"}: presento el viaje y consulto disponibilidad`, 1800, -1, "voz", "voz.consola", { resultado: D.negociar_0?.resumen }),
            S_("n2", "Informando la tarifa ofrecida y recibiendo la contrapropuesta", 1500, -1, "proveedores", "proveedores.negociacion", { regla: "R06", resultado: r0 ? `Ofrecida ${pesos(r0.tarifaOfrecida)} \xB7 tope ${pesos(o.tarifaMaxima)}` : void 0 }),
            S_("n3", "Comparando la contrapropuesta contra el tope autorizado", 800, 2, "proveedores", "proveedores.negociacion", { regla: "R07", resultado: `Dentro del tope ${pesos(o.tarifaMaxima)}` }),
            S_("n4", "Registrando la aceptaci\xF3n preliminar", 700, -1, "proveedores", "proveedores.negociacion", { resultado: `AceptacionPreliminar \xB7 ${pesos(nxt.ofertas.find((x) => x.tarifaFinal !== null)?.tarifaFinal ?? o.tarifaMaxima)}` }),
            adjudicada ? S_("n5", `Informando a ${rondas[0]?.transportador ?? "el transportador"} la tarifa autorizada`, 1300, -1, "voz", "voz.consola", { resultado: `Tarifa autorizada ${pesos(nxt.tarifaPactada ?? 0)}` }) : S_("n5", `Llamando a los dem\xE1s candidatos (${Math.max(0, rondas.length - 1)})`, 1600, -1, "voz", "voz.consola", { resultado: `${rondas.length} ofertas dentro del tope o escaladas` }),
            S_("n6", "Compartiendo el resultado con el Agente de Seguimiento", 500, -1, "plataforma", "plataforma.operacion", { regla: "R27", resultado: "Resultado de la negociaci\xF3n disponible para todos los agentes" })
          ]
        };
      }
      case "Seleccion": {
        const t = nxt.transportador ?? transp;
        return {
          pasos: [
            S_("s1", "Consolidando ofertas, condiciones y resultados de negociaci\xF3n", 1200, -1, "plataforma", "plataforma.seleccion", { resultado: `${nxt.ofertas.length || rondas.length} ofertas consolidadas` }),
            S_("s2", raised ? "La selecci\xF3n queda en manos del coordinador" : "\xBFSelecci\xF3n autom\xE1tica? Verificando requisitos operativos, documentales y comerciales", 900, 1, "plataforma", "plataforma.seleccion", { regla: "R09", resultado: "Cumple los tres requisitos" }),
            S_("s3", `Transportador seleccionado: ${t?.nombre ?? "\u2014"}`, 700, -1, "plataforma", "plataforma.seleccion", { resultado: `${t?.nombre ?? "\u2014"} \xB7 ${pesos(nxt.tarifaPactada ?? o.tarifaPactada ?? o.tarifaMaxima)} \xB7 TransportadorSeleccionado` })
          ]
        };
      }
      case "Asignacion":
        return {
          pasos: [
            S_("s4", "Revisando documentos del veh\xEDculo y del conductor", 2200, -1, "revision", "revision.documentos", { regla: "R10", resultado: `${d.documentos.length} de ${d.documentos.length} documentos vigentes \xB7 DocumentosValidados` }),
            S_("s5", "Formalizando la asignaci\xF3n", 700, -1, "plataforma", "plataforma.operacion", { resultado: `${transp?.nombre ?? "\u2014"} \xB7 ${transp?.placa ?? ""} \xB7 AsignacionConfirmada` })
          ]
        };
      case "Confirmacion":
        return {
          pasos: [
            S_("c1", "Llamando al cliente: veh\xEDculo asignado, fecha y hora, lugar de cargue y receptor", 1800, -1, "voz", "voz.consola", { regla: "R11", resultado: D.informar?.resumen }),
            S_("c2", "Llamando al transportador: informaci\xF3n completa y preparado para ejecutarla", 1500, 1, "voz", "voz.consola", { regla: "R11", resultado: D.confirmar?.resumen }),
            S_("c3", "Doble confirmaci\xF3n: cliente y transportador con la misma informaci\xF3n", 600, -1, "plataforma", "plataforma.operacion", { resultado: "ConfirmacionDoble" }),
            S_("c4", "Programando las llamadas preventivas en la agenda centralizada", 800, -1, "agenda", "agenda.central", { regla: "R26", resultado: "Llamadas preventivas agendadas a ambas partes" })
          ]
        };
      case "Preventiva":
        return {
          pasos: [
            S_("c5", "Llamada preventiva al transportador: disponibilidad, ubicaci\xF3n y hora estimada de llegada", 1500, 0, "voz", "voz.consola", { regla: "R12", resultado: D.prev_transportador?.resumen }),
            S_("c6", "Llamada preventiva al cliente: mercanc\xEDa lista y punto de cargue disponible", 1500, 1, "voz", "voz.consola", { regla: "R12", resultado: D.prev_cliente?.resumen }),
            S_("c7", "Sin cambios en la programaci\xF3n", 500, -1, "plataforma", "plataforma.operacion", { resultado: "LlamadaPreventiva" })
          ]
        };
      case "Presentacion":
        return {
          pasos: [
            S_("o1", "El transportador reporta su llegada al punto de origen", 800, 0, "voz", "voz.consola", { resultado: D.presentacion_transportador?.resumen }),
            S_("o2", "Validaci\xF3n cruzada con el cliente: \xBFel veh\xEDculo est\xE1 en las instalaciones?", 2e3, 1, "revision", "revision.cruzada", { regla: "R15", resultado: d.cruceLlegada.detalle }),
            S_("o3", "Verificando espera por mercanc\xEDa, congesti\xF3n o documentos", 900, 2, "revision", "revision.cargue", { regla: "R16", resultado: "Sin espera que supere el par\xE1metro" }),
            S_("o4", "Llegada confirmada por ambas partes", 500, -1, "plataforma", "plataforma.operacion", { resultado: "LlegadaOrigenConfirmada" })
          ]
        };
      case "Cargue":
        return {
          pasos: [
            S_("k1", "Siguiendo el avance del cargue", 1600, 0, "revision", "revision.cargue", { regla: "R16", resultado: d.cargue[0]?.valor }),
            S_("k2", "Confirmando hora real de salida y condiciones del despacho", 1100, 1, "revision", "revision.cargue", { regla: "R17", resultado: `${d.cargue[1]?.valor} \xB7 salida ${d.cargue[5]?.valor}` }),
            S_("k3", "Confirmando con el cliente que la mercanc\xEDa fue despachada", 900, -1, "voz", "voz.consola", { resultado: D.despacho?.resumen }),
            S_("k4", "Despacho confirmado: la operaci\xF3n sigue hacia el destino", 500, -1, "plataforma", "plataforma.operacion", { resultado: "CargueFinalizado \xB7 DespachoConfirmado" })
          ]
        };
      case "Transito": {
        const consulta = escenario === "consulta_entrante" || nxt.llamadas.slice(o.llamadas.length).some((l) => l.sentido === "entrante" && l.objetivo === "Consulta de estado");
        const nov = raised?.tipo === "Novedad_en_ruta" || !!tr.find((x) => x.excepcion?.tipo === "Novedad_en_ruta" && x.seq === o.seq && x.fechaActualizacion >= o.fechaActualizacion);
        return {
          pasos: [
            S_("t0", "Verificando que el conductor est\xE9 en condiciones seguras para atender la llamada", 700, 0, "tablero", "tablero.seguimiento", { regla: "R18", resultado: "Condiciones seguras: puede atender" }),
            S_("t1", "Llamada programada al transportador: estado, ubicaci\xF3n, novedades y hora estimada", 1800, 1, "voz", "voz.consola", { regla: "R19", resultado: D.seguimiento_1?.resumen }),
            ...nov ? [S_("t4", "Informando al cliente la novedad: lo confirmado y lo estimado", 1600, -1, "voz", "voz.consola", { regla: "R19", resultado: D.informar_novedad?.resumen })] : [],
            S_("t2", "Registrando el seguimiento y actualizando la hora de llegada como estimada", 900, -1, "tablero", "tablero.seguimiento", { resultado: "SeguimientoRegistrado" }),
            ...consulta ? [S_("t3", "El cliente consulta el estado: valido su autorizaci\xF3n e informo lo confirmado", 1500, -1, "voz", "voz.consola", { regla: "R20", resultado: D.consulta?.resumen })] : []
          ]
        };
      }
      case "AvisoDestino":
        return {
          pasos: [
            S_("g0", "Llamando al contacto de recepci\xF3n: instalaciones preparadas, horarios de descargue e ingreso", 1600, 0, "voz", "voz.consola", { regla: "R22", resultado: D.aviso?.resumen }),
            S_("g1", "Registrando el aviso de llegada en la agenda", 600, -1, "agenda", "agenda.central", { resultado: "Destino listo para recibir" })
          ]
        };
      case "Descargue":
        return {
          pasos: [
            S_("g2", "Registrando la llegada al destino y confirm\xE1ndola con recepci\xF3n", 1e3, 0, "revision", "revision.entrega", { regla: "R16", resultado: `Llegada a ${o.nodoDestino.lugar}` }),
            S_("g3", "Siguiendo el descargue; consultando si hay diferencias o da\xF1os", 1500, -1, "voz", "voz.consola", { resultado: D.recepcion?.resumen }),
            S_("g4", "Mercanc\xEDa recibida por el destinatario", 500, -1, "plataforma", "plataforma.operacion", { resultado: "LlegadaDestinoConfirmada" })
          ]
        };
      case "ValidacionEntrega":
        return {
          pasos: [
            S_("y0", "Llamando al cliente para validar el resultado de la entrega", 1500, -1, "voz", "voz.consola", { resultado: D.entrega?.resumen }),
            S_("y1", "Cruce de entrega: lo informado por el transportador frente a lo confirmado por el cliente", 2e3, 1, "revision", "revision.entrega", { regla: "R23", resultado: d.cruceEntrega.detalle }),
            S_("y2", "Solicitando los soportes de entrega", 800, -1, "revision", "revision.entrega", { resultado: "EntregaConfirmada \xB7 soporte cargado" })
          ]
        };
      case "LlamadaCierre":
        return {
          pasos: [
            S_("z0", "Llamada de cierre: servicio completado, observaciones, calidad y horarios", 1800, 0, "voz", "voz.consola", { regla: "R24", resultado: D.cierre?.resumen }),
            S_("z1", "Registrando la calificaci\xF3n y las observaciones del cliente", 800, -1, "plataforma", "plataforma.operacion", { resultado: `LlamadaCierre \xB7 satisfacci\xF3n ${fin.satisfaccion ?? "\u2014"}/5` })
          ]
        };
      case "CierreAdmin":
        return {
          pasos: [
            S_("z2", "Revisando la documentaci\xF3n final del servicio", 1e3, -1, "revision", "revision.cierre", { regla: "R25", resultado: d.cierreAdmin[0]?.valor }),
            S_("z3", "Revisando condiciones econ\xF3micas negociadas y costos adicionales autorizados", 1100, 1, "revision", "revision.cierre", { regla: "R25", resultado: `${d.cierreAdmin[1]?.valor} \xB7 ${d.cierreAdmin[2]?.valor}` }),
            S_("z4", "Revisando las novedades que afectan la liquidaci\xF3n", 900, -1, "revision", "revision.cierre", { regla: "R25", resultado: d.cierreAdmin[3]?.valor }),
            S_("z5", "Cierre administrativo de la operaci\xF3n", 600, -1, "plataforma", "plataforma.operacion", { resultado: `OperacionCerrada \xB7 ${formatCOP(fin.tarifaPactada ?? 0)} + ${formatCOP(fin.costosAdicionales)} adicionales` })
          ]
        };
    }
  };
  const bloques = [];
  const push = (agente, pasos) => {
    if (pasos.length === 0) return;
    const ult = bloques[bloques.length - 1];
    if (ult && ult.agente === agente) ult.pasos.push(...pasos);
    else bloques.push({ agente, pasos: [...pasos] });
  };
  const pendiente = {};
  for (let i = 0; i < tr.length - 1; i++) {
    const cur = tr[i];
    const nxt = tr[i + 1];
    const S = esEtapaFlujo(cur.etapa) ? cur.etapa : cur.etapaRetorno;
    if (!S) continue;
    const ag = ETAPA_AGENTE[S];
    if (cur.etapa === "EsperaDatos") {
      push("validador", [
        paso("v4", "Llamando al cliente para completar los datos pendientes", v(1600), { sistema: "voz", vista: "voz.consola", regla: "R02", estado: "EsperaDatos", snapshot: i, resultado: d.dialogos.completar?.resumen }),
        paso("v5", "Datos completos: la solicitud es suficiente para iniciar", v(500), { sistema: "plataforma", vista: "plataforma.operacion", resultado: "SolicitudValidada" })
      ]);
      continue;
    }
    if (cur.etapa === "Escalada" && cur.excepcion) {
      const exc = cur.excepcion;
      const h2 = humanoPara(exc.tipo);
      const prev = nxt.excepcionesPrevias.find((e) => e.id === exc.id);
      const dec = prev?.decisionHumana ?? "AUTORIZAR";
      const alt2 = exc.alternativas.find((a) => a.id === (prev?.alternativaElegida ?? exc.recomendada)) ?? exc.alternativas[0];
      const continua = nxt.etapa !== "Cancelada" && (nxt.etapa === "Cerrada" || nxt.etapa === siguienteEtapa(S));
      const destino = nxt.etapa === "Cancelada" ? " \xB7 servicio cancelado" : continua ? "" : ` \xB7 la operaci\xF3n vuelve a ${nombreEtapa(nxt.etapa)}`;
      const resultado = dec === "RECHAZAR" ? `${h2.nombre} no autoriza la propuesta del agente${destino}` : dec === "CANCELAR" ? `${h2.nombre} cancela el servicio (R28)${destino}` : dec === "ALTERNATIVA" ? `${h2.nombre} elige la alternativa ${alt2.id}: ${alt2.titulo}${destino}` : `${h2.nombre} autoriza la propuesta del agente (${alt2.id}): ${alt2.titulo}${destino}`;
      push(ag, [
        paso("x3", `Esperando la decisi\xF3n de ${h2.nombre} (${h2.rol}) en la Mesa del coordinador`, v(15e3), {
          tipo: "espera_humana",
          sistema: "mesa",
          vista: "mesa.paquete",
          humano: h2,
          estado: "Escalada",
          snapshot: i,
          regla: PLANTILLA_EXCEPCION[exc.tipo].regla,
          resultado,
          variante: exc.tipo,
          bitacora: `Decisi\xF3n \xB7 ${resultado}`
        })
      ]);
      if (nxt.etapa === "Cancelada") {
        push(ag, [paso("x5", "Cancelando el servicio: se informa al cliente y se cierra la solicitud", v(900), { sistema: "plataforma", vista: "plataforma.operacion", ok: false, termina: "cancelada", estado: "Cancelada", snapshot: i + 1, regla: "R28", resultado: `OperacionCancelada \xB7 ${exc.titulo}`, variante: exc.tipo })]);
      } else if (continua) {
        const def2 = defEtapa(S, cur, nxt, null);
        const idx = DET[S][exc.tipo] ?? 0;
        const resto = def2.pasos.slice(idx + 1);
        push(ag, resto.length ? resto : [paso("x6", "Retomando la etapa con la decisi\xF3n registrada", v(600), { sistema: "plataforma", vista: "plataforma.operacion", resultado: "Decisi\xF3n registrada en el expediente" })]);
        const ultimo = bloques[bloques.length - 1].pasos;
        if (nxt.etapa === "Cerrada") {
          ultimo[ultimo.length - 1] = { ...ultimo[ultimo.length - 1], estado: "Cerrada", snapshot: i + 1 };
        }
      }
      continue;
    }
    if (cur.excepcion && cur.excepcion.categoria === "automatico" && nxt.excepcion === null) {
      const exc = cur.excepcion;
      const alt2 = exc.alternativas.find((a) => a.id === exc.recomendada) ?? exc.alternativas[0];
      push(ag, [
        paso("x4", `Resolviendo la novedad: ${alt2.titulo}`, v(900), {
          sistema: exc.tipo === "Datos_incompletos" ? "agenda" : "agenda",
          vista: "agenda.central",
          estado: nxt.etapa,
          snapshot: i + 1,
          regla: PLANTILLA_EXCEPCION[exc.tipo].regla,
          resultado: `${alt2.titulo} \xB7 sin intervenci\xF3n humana`,
          variante: exc.tipo
        })
      ]);
      if (exc.tipo !== "Datos_incompletos") pendiente[S] = exc.tipo;
      continue;
    }
    if (!cur.excepcion && nxt.excepcion) {
      const exc = nxt.excepcion;
      const pl = PLANTILLA_EXCEPCION[exc.tipo];
      const def2 = defEtapa(S, cur, nxt, exc);
      const idx = Math.min(DET[S][exc.tipo] ?? 0, def2.pasos.length - 1);
      const trabajo = def2.pasos.slice(0, idx + 1);
      trabajo[0] = { ...trabajo[0], estado: trabajo[0].estado ?? cur.etapa, snapshot: trabajo[0].snapshot ?? i };
      const auto = exc.categoria === "automatico";
      push(ag, trabajo);
      push(ag, [
        paso("x1", `Registrando la novedad: ${exc.titulo}`, v(700), { sistema: "plataforma", vista: "plataforma.operacion", ok: false, regla: `${pl.regla} \xB7 ${pl.politica}`, resultado: exc.causa, bitacora: `${exc.titulo} \xB7 ${pl.regla}`, variante: exc.tipo, ...auto ? { estado: cur.etapa, snapshot: i + 1 } : {} }),
        auto ? paso("x2", "Aplicando la gesti\xF3n autom\xE1tica de la agenda", v(800), { sistema: "agenda", vista: "agenda.central", regla: pl.regla, resultado: exc.alternativas.find((a) => a.id === exc.recomendada)?.titulo, variante: exc.tipo }) : paso("x2", `Armando el paquete de decisi\xF3n con ${exc.alternativas.length} alternativas`, v(1200), { sistema: "plataforma", vista: "plataforma.operacion", regla: pl.regla, resultado: `Recomendaci\xF3n ${exc.recomendada}: ${exc.alternativas.find((a) => a.id === exc.recomendada)?.titulo}`, variante: exc.tipo })
      ]);
      continue;
    }
    const def = defEtapa(S, cur, nxt, null);
    let pasos = def.pasos;
    const tipoPend = pendiente[S];
    if (tipoPend) {
      const idx = DET[S][tipoPend] ?? -1;
      pasos = def.pasos.slice(idx + 1);
      if (tipoPend === "Sin_respuesta" || tipoPend === "Conductor_ocupado") {
        pasos = [paso("r1", tipoPend === "Sin_respuesta" ? "Reintentando el contacto en la hora reprogramada" : "Retomando la llamada en un momento seguro", v(1500), { sistema: "voz", vista: "voz.consola", regla: tipoPend === "Sin_respuesta" ? "R29" : "R18", resultado: "Contacto exitoso en el reintento" }), ...pasos];
      }
      delete pendiente[S];
    }
    if (pasos.length === 0) pasos = [paso("r2", "Retomando la etapa tras resolver la novedad", v(600), { sistema: "plataforma", vista: "plataforma.operacion", resultado: "Etapa completada" })];
    const primero = pasos[0];
    pasos[0] = { ...primero, estado: primero.estado ?? cur.etapa, snapshot: primero.snapshot ?? i };
    if (nxt.etapa === "Cerrada") pasos[pasos.length - 1] = { ...pasos[pasos.length - 1], estado: "Cerrada", snapshot: i + 1 };
    push(ag, pasos);
  }
  push("torre", [
    paso("e1", "Reuniendo solicitud, llamadas, transcripciones y grabaciones autorizadas", v(1200), { sistema: "expediente", vista: "expediente.expediente", regla: "R30", resultado: `${fin.llamadas.length} llamadas \xB7 ${fin.soportes.length} soportes` }),
    paso("e2", "Ordenando el historial cronol\xF3gico", v(900), { sistema: "expediente", vista: "expediente.expediente", resultado: `${fin.eventos.length} eventos` }),
    paso("e3", "Verificando la traza: qu\xE9 ocurri\xF3, qu\xE9 informaci\xF3n, qu\xE9 regla, qu\xE9 decisi\xF3n, qu\xE9 ejecuci\xF3n", v(1100), { sistema: "expediente", vista: "expediente.expediente", regla: "R26", resultado: `${fin.trazas.length} decisiones trazadas` }),
    paso("e4", "Expediente cerrado", v(500), { sistema: "expediente", vista: "expediente.expediente", resultado: d.expediente.numero })
  ]);
  let h = 0;
  const etapas = bloques.map((b, idx) => {
    const pasos = [...b.pasos];
    const sig = bloques[idx + 1];
    if (sig) {
      h += 1;
      pasos.push(paso(`h${h}`, `Entregando a ${AGENTES_MAP[sig.agente].nombre}`, 400, { sistema: AGENTES_MAP[b.agente].sistema, vista: void 0 }));
    }
    return { agente: b.agente, pasos };
  });
  const vistos = {};
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

// src/data/agentesData.ts
var ESCENARIOS_PONDERADOS = [
  { escenario: "feliz", peso: 34 },
  { escenario: "Datos_incompletos", peso: 5 },
  { escenario: "Sin_respuesta", peso: 4 },
  { escenario: "Tarifa_sobre_tope", peso: 6 },
  { escenario: "Sin_transportador", peso: 3 },
  { escenario: "Mercancia_no_lista", peso: 4 },
  { escenario: "Retraso_transportador", peso: 4 },
  { escenario: "Diferencia_llegada", peso: 3 },
  { escenario: "Espera_en_cargue", peso: 4 },
  { escenario: "Diferencia_despacho", peso: 3 },
  { escenario: "Novedad_en_ruta", peso: 6 },
  { escenario: "Conductor_ocupado", peso: 4 },
  { escenario: "Destinatario_no_recibe", peso: 3 },
  { escenario: "Demora_en_descargue", peso: 3 },
  { escenario: "Diferencia_entrega", peso: 4 },
  { escenario: "Inconformidad_cliente", peso: 3 },
  { escenario: "Sobrecosto_liquidacion", peso: 3 },
  { escenario: "consulta_entrante", peso: 3 },
  { escenario: "cancelada", peso: 2 }
];
function elegirEscenario(rand, seleccionAutomatica) {
  const total = ESCENARIOS_PONDERADOS.reduce((s, e) => s + e.peso, 0);
  let r = rand() * total;
  for (const e of ESCENARIOS_PONDERADOS) {
    r -= e.peso;
    if (r <= 0) return e.escenario === "feliz" && !seleccionAutomatica ? "feliz_manual" : e.escenario;
  }
  return "feliz";
}
function elegirCanal(rand, escenario) {
  if (escenario === "Datos_incompletos") return "llamada_ia";
  const pesos2 = ["llamada_ia", "llamada_ia", "formulario", "formulario", "integracion", "coordinador"];
  return pesos2[Math.floor(rand() * pesos2.length)] ?? CANALES[0];
}
var usaSeleccionManual = (e) => e === "feliz_manual" || e === "Seleccion_manual";
function decisionPara(exc, escenario, seq) {
  const por = `${humanoPara(exc.tipo).nombre} \xB7 ${humanoPara(exc.tipo).rol}`;
  if (escenario === "cancelada") return { decision: "CANCELAR", por };
  if (exc.tipo === "Tarifa_sobre_tope") return { decision: "ALTERNATIVA", alternativa: seq % 2 === 0 ? "C" : "B", por };
  if (exc.tipo === "Sin_transportador" && seq % 2 === 0) return { decision: "ALTERNATIVA", alternativa: "B", por };
  if (exc.tipo === "Seleccion_manual" && seq % 3 === 1) return { decision: "ALTERNATIVA", alternativa: "B", por };
  if (exc.tipo === "Sobrecosto_liquidacion" && seq % 2 === 1) return { decision: "ALTERNATIVA", alternativa: "A", por };
  return { decision: "AUTORIZAR", por };
}
function avanzar2(ts, minutos) {
  const f = new Date(ts + minutos * 6e4);
  if (f.getHours() >= 20) {
    f.setDate(f.getDate() + 1);
    f.setHours(6, entre2(rngDesde(f.getTime()), 0, 30), 0, 0);
  } else if (f.getHours() < 6) {
    f.setHours(6, 0, 0, 0);
  }
  if (f.getDay() === 0) f.setDate(f.getDate() + 1);
  return f.getTime();
}
function recorrer(op0, escenario, seleccionAutomatica, ahoraSim, rand, seq) {
  const tipo = excepcionDelEscenario(escenario);
  const etapaObj = tipo ? ETAPA_DE_NOVEDAD[tipo] : null;
  const ops = [op0];
  let p = op0;
  let reloj = ahoraSim;
  let detectada = false;
  for (let i = 0; i < 80 && !esTerminal(p.etapa); i++) {
    reloj = avanzar2(reloj, entre2(rand, 4, 22));
    const forzarAqui = !!tipo && !detectada && p.etapa === etapaObj;
    const decision = p.etapa === "Escalada" && p.excepcion ? decisionPara(p.excepcion, escenario, seq) : void 0;
    const r = transicionar(p, {
      ahora: reloj,
      rng: rand,
      seleccionAutomatica: !usaSeleccionManual(escenario) && seleccionAutomatica !== void 0,
      decisionHumana: decision,
      forzar: forzarAqui ? { excepcion: tipo } : { resolver: true }
    });
    if (!r) break;
    p = r.operacion;
    ops.push(p);
    if (p.excepcion) detectada = true;
  }
  return ops;
}
function coherente(tr, escenario) {
  const tipo = excepcionDelEscenario(escenario);
  const fin = tr[tr.length - 1];
  const todas = /* @__PURE__ */ new Set([...tr.flatMap((o) => o.excepcion ? [o.excepcion.tipo] : []), ...fin.excepcionesPrevias.map((e) => e.tipo)]);
  const esperada = escenario === "cancelada" ? "Cancelada" : "Cerrada";
  if (fin.etapa !== esperada) return false;
  if (escenario === "feliz") return todas.size === 0;
  if (escenario === "feliz_manual") return todas.size === 1 && todas.has("Seleccion_manual");
  if (escenario === "consulta_entrante") return todas.size === 0 && fin.llamadas.some((l) => l.sentido === "entrante" && l.objetivo === "Consulta de estado");
  if (!tipo || !todas.has(tipo)) return false;
  for (const t of todas) if (t !== tipo && t !== "Seleccion_manual") return false;
  const exc = tr.find((o) => o.excepcion?.tipo === tipo)?.excepcion;
  if (!exc) return false;
  const humana = exc.categoria !== "automatico";
  const prev = fin.excepcionesPrevias.find((e) => e.tipo === tipo);
  if (humana && prev?.resueltaPor !== "coordinador") return false;
  if (escenario === "cancelada" && prev?.decisionHumana !== "CANCELAR") return false;
  return true;
}
var INTENTOS = 24;
function generarCaso(seq, ahora2, ctx2, opts) {
  const randBase = rngDesde(seq * 7919 + 11);
  const escenario = opts?.escenario ?? elegirEscenario(randBase, ctx2.seleccionAutomatica);
  const canal2 = opts?.canal ?? elegirCanal(randBase, escenario);
  const tipo = excepcionDelEscenario(escenario);
  let tr = null;
  let rand = randBase;
  for (let intento = 0; intento < INTENTOS; intento++) {
    rand = rngDesde(seq * 31 + intento * 97 + 5);
    const { operacion } = nuevaOperacion(ctx2.ahoraSim, rand, seq, canal2);
    const op0 = { ...operacion, id: idOperacion(seq), origen: "agentes" };
    op0.datosPendientes = tipo === "Datos_incompletos" ? [rand() < 0.5 ? "Volumen de la carga" : "Contacto de recibo en destino"] : [];
    if (new Date(op0.fechaCargue).getDay() === 0) op0.fechaCargue += 24 * 36e5;
    const candidata = recorrer(op0, escenario, ctx2.seleccionAutomatica, ctx2.ahoraSim, rand, seq);
    if (coherente(candidata, escenario) || intento === INTENTOS - 1) {
      tr = candidata;
      break;
    }
  }
  const trayectoria = tr;
  const datos = construirDatos(seq, trayectoria, rand, ctx2.ahoraSim);
  const plan = generarPlan(seq, canal2, escenario, datos);
  const p0 = trayectoria[0];
  return {
    id: `caso-${seq}`,
    seq,
    operacion: p0,
    canal: canal2,
    datos,
    escenario,
    plan,
    etapaIdx: 0,
    pasoIdx: 0,
    restante: plan[0].pasos[0].duracion,
    estado: "en_cola",
    recibidoEn: ahora2,
    tiemposEtapa: {},
    pasosHechos: {},
    excepciones: 0,
    ultimoEvento: ahora2
  };
}

// scripts/plan-smoke.entry.ts
var ahora = new Date(2026, 9, 27, 7, 30).getTime();
var ctx = { seleccionAutomatica: true, ahoraSim: ahora };
var mal = 0;
var resumen = (c) => c.plan.map((e) => `${e.agente}[${e.pasos.map((p) => p.id).join(" ")}]`).join(" \u203A ");
for (const e of ESCENAS) {
  const c = generarCaso(8e3 + ESCENAS.indexOf(e), ahora, e.id === "feliz_manual" ? { ...ctx, seleccionAutomatica: false } : ctx, { escenario: e.escenario, canal: e.canal });
  const tr = c.datos.trayectoria;
  const fin = tr[tr.length - 1];
  const ids = c.plan.flatMap((x) => x.pasos.map((p) => p.id));
  const dup = ids.length - new Set(ids).size;
  const snaps = c.plan.flatMap((x) => x.pasos).filter((p) => p.snapshot !== void 0).map((p) => p.snapshot);
  const creciente = snaps.every((s, i) => i === 0 || s >= snaps[i - 1]);
  const finOk = fin.etapa === e.fin;
  const nExc = /* @__PURE__ */ new Set([...tr.flatMap((o) => o.excepcion ? [o.excepcion.tipo] : []), ...fin.excepcionesPrevias.map((x) => x.tipo)]);
  const ultimoSnap = snaps[snaps.length - 1];
  const publicaFin = ultimoSnap === tr.length - 1;
  const humanos = c.plan.flatMap((x) => x.pasos).filter((p) => p.tipo === "espera_humana").length;
  const ok = dup === 0 && creciente && finOk && publicaFin;
  if (!ok) mal++;
  console.log(`${ok ? "OK " : "MAL"} ${e.id.padEnd(24)} fin=${fin.etapa} snaps=${tr.length} pasos=${ids.length} dup=${dup} creciente=${creciente} publicaFin=${publicaFin} novedades=[${[...nExc].join(",")}] humanos=${humanos}`);
  if (!ok) console.log("    ", resumen(c));
}
console.log("\nEjemplo tarifa_sobre_tope:\n", resumen(generarCaso(8100, ahora, ctx, { escenario: "Tarifa_sobre_tope" })));
console.log("\nEjemplo sin_transportador:\n", resumen(generarCaso(8101, ahora, ctx, { escenario: "Sin_transportador" })));
var conteo = {};
var incoherentes = 0;
for (let s = 7001; s < 7061; s++) {
  const c = generarCaso(s, ahora, ctx);
  conteo[c.escenario] = (conteo[c.escenario] ?? 0) + 1;
  const ids = c.plan.flatMap((x) => x.pasos.map((p) => p.id));
  if (ids.length !== new Set(ids).size) incoherentes++;
}
console.log("\n60 casos:", conteo, "con ids duplicados:", incoherentes, "\xB7 escenas mal:", mal);
