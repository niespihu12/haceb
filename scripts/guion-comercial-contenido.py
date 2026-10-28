S = []

# ================================================================= PORTADA
S += [
    Spacer(1, 52 * mm),
    p('HACEB · COORDINACIÓN LOGÍSTICA CON AGENTES DE IA', 'kicker_portada'),
    p('Guion comercial', 'titulo_portada'),
    p('Cómo presentar la coordinación con<br/>transportadores y clientes mediante agentes', 'sub_portada'),
    Spacer(1, 26 * mm),
]
ficha = [
    ['Para quién', 'Equipo comercial y preventa que presenta el piloto al cliente'],
    ['Audiencia del cliente', 'Logística y transporte, operaciones, comercial, costos y tecnología'],
    ['Duración de la reunión', '45 minutos: 8 de conversación, 12 de demostración, 25 de discusión y cierre'],
    ['Objetivo', 'Salir con un Discovery agendado y un responsable por cada prerrequisito'],
    ['Material', 'Simulador Haceb (pestañas Dashboard, Proceso, Pipeline, Agentes, Mesa del coordinador, Sistemas, Control Tower y Ontología), presentación Visión y este guion'],
]
t = Table([[Paragraph(f'<font color="#8ab4ff">{a}</font>', E['celda_b']), Paragraph(f'<font color="#e8eaf0">{b}</font>', E['celda'])] for a, b in ficha], colWidths=[42 * mm, ANCHO_UTIL - 42 * mm])
t.setStyle(TableStyle([
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('LEFTPADDING', (0, 0), (-1, -1), 0), ('RIGHTPADDING', (0, 0), (-1, -1), 0),
    ('TOPPADDING', (0, 0), (-1, -1), 4), ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ('LINEBELOW', (0, 0), (-1, -2), 0.4, colors.HexColor('#2a3350')),
]))
S += [t, Spacer(1, 14 * mm), p('El contenido del proceso está tomado 1:1 del documento <i>proceso.txt</i> (gestión integral de la comunicación y coordinación con transportadores y clientes con agentes de inteligencia artificial).<br/>Los clientes, transportadores, tarifas y cifras que aparecen en el simulador son de una operación simulada: sirven para explicar el modelo, no son promesas de resultado.', 'pie_portada')]
S += [NextPageTemplate('interior'), PageBreak()]

# ================================================================= 1. MAPA
S += seccion('1', 'La conversación en seis momentos', 'No es una demo con introducción: es una conversación con una demo adentro.', '45 min')
mapa = [
    ['Momento', 'Qué logras', 'Tiempo', 'Señal de que puedes avanzar'],
    ['<b>1. Apertura</b><br/>Una operación se sostiene con llamadas', 'Que reconozcan su propia operación en la primera frase', '3 min', 'Asienten o corrigen con un dato suyo'],
    ['<b>2. Diagnóstico</b><br/>Cinco preguntas', 'Que ellos digan el problema, no tú', '5 min', 'Dan un número: llamadas por viaje, horas, novedades por semana'],
    ['<b>3. La idea</b><br/>Informar vs. decidir, y tres agentes coordinados', 'Que entiendan que no es «la IA llama y ya»', '4 min', 'Preguntan «¿y quién autoriza una tarifa?»'],
    ['<b>4. Demostración</b><br/>La operación corriendo', 'Que vean su proceso, no un producto genérico', '12 min', 'Piden ver una novedad concreta suya'],
    ['<b>5. Cómo se implementa</b><br/>Cinco fases, stoppers y tiempos', 'Que vean un camino secuencial con responsables y tiempos calculados', '8 min', 'Empiezan a decir quién entrega cada cosa'],
    ['<b>6. Cierre</b><br/>Discovery y próximos pasos', 'Una fecha y un responsable por cada stopper', '13 min', 'Queda agendado el Discovery'],
]
S += [tabla(mapa, [48 * mm, 52 * mm, 17 * mm, ANCHO_UTIL - 117 * mm], alineacion_centro=(2,)), Spacer(1, 7)]
S += [aviso('La regla del guion: <b>el cliente habla la mitad del tiempo</b>. Si llegas al minuto 20 y solo has hablado tú, detente y pregunta. La demo funciona mucho mejor cuando ya sabes qué novedad les duele.', AZUL, AZUL_CLARO, 'Cómo se usa este guion')]

# ================================================================= 2. APERTURA
S += [Spacer(1, 9)] + seccion('2', 'Apertura', 'Primeros noventa segundos. Describe su operación sin acusarla.', '3 min')
S += [decir('Hoy un servicio de transporte se sostiene con llamadas: alguien llama al cliente para completar datos, llama a varios transportadores para negociar, vuelve a llamar para confirmar, llama antes del cargue, llama en ruta para saber dónde va, y llama al cierre. Cada llamada es un dato que vive en la cabeza de una persona. Lo que les voy a mostrar es ese mismo proceso, de la solicitud a la confirmación final, con agentes que llaman, confirman, registran compromisos y detectan novedades, y que llaman a una persona solo cuando hay algo que decidir.'), Spacer(1, 7)]
S += [p('Por qué funciona esta apertura', 'h3')]
S += vinetas([
    'Habla de <b>llamadas y coordinación</b>, que es donde el cliente y el transportador sienten el desorden, no de tecnología.',
    'Nombra el síntoma real: <b>información contradictoria entre las partes</b> y novedades que se detectan tarde.',
    'Cierra con la promesa completa del documento: <b>reducir llamadas manuales, tiempos de respuesta y riesgos de incumplimiento, con trazabilidad</b>.',
    'No promete ahorro de personal. Promete <b>criterio</b>: que el coordinador decida lo que vale la pena decidir.',
])
S += [Spacer(1, 5), aviso('Si el cliente arranca con «ya tenemos un TMS»: <i>«Perfecto, y lo vamos a usar. Esto no lo reemplaza: es la capa de comunicación que llama, confirma y mantiene sincronizados al cliente, al transportador y al equipo, y deja todo en el expediente de la operación.»</i>', GRIS, PANEL, 'Primera objeción típica')]

# ================================================================= 3. DIAGNOSTICO
S += [PageBreak()] + seccion('3', 'Diagnóstico', 'Cinco preguntas. Anota las respuestas: son el argumento del cierre.', '5 min')
preg = [
    ['Pregunta', 'Qué estás midiendo', 'Qué haces con la respuesta'],
    ['¿Por qué canales les llegan las solicitudes de transporte: llamada, formulario, integración o las registra el coordinador?', 'Superficie del problema y carga de la atención telefónica', 'Si la llamada pesa, la demo empieza por la consola de voz'],
    ['Por cada servicio, ¿cuántas llamadas se hacen entre cliente, transportador y coordinador?', 'El indicador <b>contactos por operación</b>', 'Es el número contra el que se compara el piloto'],
    ['Cuando no hay vehículo o el transportador pide más del tope, ¿quién decide y con qué información al frente?', 'Autoridad de decisión y evidencia', 'Entrada natural al paquete de decisión de la Mesa'],
    ['¿Cuáles son las tres novedades que más se repiten: mercancía no lista, retrasos, esperas, diferencias de entrega?', 'Su catálogo real de novedades', 'Se fuerzan esas escenas en la demo con el Director de escena'],
    ['Si el cliente y el transportador dicen cosas distintas sobre la entrega, ¿cómo se entera y qué pasa con el cierre?', 'Validación cruzada y cierre administrativo', 'Entrada a la regla «no se cierra con diferencias»'],
]
S += [tabla(preg, [62 * mm, 46 * mm, ANCHO_UTIL - 108 * mm]), Spacer(1, 7)]
S += [decir('Lo pregunto porque el piloto no se mide en «funciona o no funciona»: se mide contra esos números suyos. Si hoy un servicio necesita once llamadas, ese es el número que vamos a mover.', 'CÓMO LO ENMARCAS')]

# ================================================================= 4. LA IDEA
S += [PageBreak()] + seccion('4', 'La idea', 'Tres ideas, en este orden. No avances si la anterior no quedó clara.', '4 min')
S += [p('4.1 &nbsp;Tres agentes que comparten la misma información', 'h2')]
S += vinetas([
    '<b>El agente de negociación</b> habla con los transportadores: presenta el viaje, consulta disponibilidad, informa la tarifa y recibe contrapropuestas <b>sin superar los valores máximos autorizados</b>.',
    '<b>El agente de seguimiento</b> hace las llamadas preventivas, valida la presentación en origen y monitorea el tránsito; detecta y clasifica novedades.',
    '<b>El agente de cliente</b> atiende y llama al cliente y al destinatario; consulta <b>la misma información operativa</b> que los demás, para no contradecirse.',
], AZUL)
S += [Spacer(1, 4), decir('No son tres robots sueltos: son tres voces del mismo expediente. Lo que negoció uno lo sabe el otro. Por eso el cliente nunca recibe una versión distinta de la que tiene el transportador.'), Spacer(1, 6)]
S += [p('4.2 &nbsp;Informar no es lo mismo que decidir', 'h2')]
dec = [
    ['Lo gestiona el agente solo', 'Lo decide una persona'],
    ['Informar el estado de una operación<br/>Confirmar una hora de llegada<br/>Solicitar una actualización<br/>Reintentar un contacto no exitoso<br/>Reprogramar una llamada si el conductor va manejando', 'Modificar una tarifa<br/>Aprobar sobrecostos<br/>Cambiar condiciones contractuales<br/>Cancelar un servicio<br/>Asumir compromisos no autorizados'],
]
S += [tabla(dec, [ANCHO_UTIL / 2, ANCHO_UTIL / 2]), Spacer(1, 4), p('Entre las dos hay una zona intermedia que el simulador llama <b>asistido</b> (supuesto de diseño): el agente registra la novedad y se la presenta al coordinador, que decide el impacto.', 'p_s'), Spacer(1, 6)]
S += [p('4.3 &nbsp;Todo queda en un expediente y en una agenda', 'h2')]
S += vinetas([
    '<b>Agenda centralizada:</b> cada llamada tiene un objetivo, una operación, un interlocutor y una actividad. Al confirmarse algo, las tareas relacionadas se actualizan y no se pregunta dos veces lo mismo.',
    '<b>Expediente e historial:</b> solicitud, llamadas, transcripciones, grabaciones (solo si están autorizadas), negociaciones, confirmaciones, novedades, compromisos, modificaciones aprobadas y soportes de entrega, en orden cronológico.',
    '<b>Visión centralizada:</b> qué está pendiente de asignar, qué se negocia, qué está en tránsito y qué novedades requieren al coordinador.',
], VERDE)

# ================================================================= 5. DEMO
S += [PageBreak()] + seccion('5', 'La demostración', 'Doce minutos. Cinco pestañas, en este orden. No las recorras todas.', '12 min')
S += [aviso('<b>Antes de entrar:</b> simulador abierto en la pestaña <b>Proceso</b>, velocidad 2x y <b>Selección automática</b> activada. Ten a la mano la novedad que mencionaron en el diagnóstico: la vas a forzar con el <b>Director de escena</b> (pestaña Agentes) o con «Provocar una novedad» (Mesa del coordinador). Todo lo que ves de clientes, tarifas y transportadores es una operación simulada.', GRIS, PANEL, 'Preparación'), Spacer(1, 8)]

S += [KeepTogether([p('5.1 &nbsp;Proceso — «esto es lo suyo, no un producto»', 'h2'), p('<b>2 min.</b> Abre la sub-vista <i>Blueprint del proceso</i> y recorre las 17 etapas agrupadas en cinco bloques.', 'p_s'),
decir('Solicitud, validación, planeación; búsqueda, negociación, selección y asignación; doble confirmación, llamadas preventivas, presentación y cargue; tránsito, aviso de destino, descargue y validación de la entrega; llamada de cierre y cierre administrativo. Es el documento que ustedes ya conocen: aquí cada párrafo está citado, no inventamos nada.')])]
S += [Spacer(1, 6)]

S += [p('5.2 &nbsp;Agentes — el momento de oro', 'h2'), p('<b>5 min.</b> Es la pestaña que convierte el documento en algo que se ve pasar. Déjala correr treinta segundos antes de hablar.', 'p_s')]
S += vinetas([
    '<b>La cinta:</b> «doce puestos, que son las tres voces del documento repartidas por etapa. Cada uno con su pantalla, su cola y la operación que tiene en manos.»',
    '<b>La consola de voz:</b> «así es una llamada: el agente se identifica, pregunta, y fíjense en esto: lo que el interlocutor da como estimación lo marca como estimado y no lo promete.»',
    '<b>Pausa con la barra espaciadora</b> en mitad de una llamada o de una revisión y lee en voz alta el pensamiento del agente: cita la regla que está aplicando.',
    '<b>Fuerza la novedad de ellos</b> con el Director de escena y acompáñala con la frase de abajo.',
], VIOLETA)
S += [Spacer(1, 5), decir('El transportador pidió más del máximo autorizado. Miren lo que hace: no compromete valores, arma las alternativas con su impacto en costo, tiempo y cumplimiento, y presenta el paquete. Ahora cambia la pantalla: esta ya no es la del agente, es la del responsable de costos. Él lee, autoriza o elige otra alternativa. Y fíjense en lo que más importa: el agente no se quedó esperando, ya está con la siguiente operación.'), Spacer(1, 6)]

S += [KeepTogether([p('5.3 &nbsp;Mesa del coordinador — el paquete de decisión', 'h2'), p('<b>2 min.</b> Muestra la misma gestión en la Mesa: causa, impacto, evidencia, alternativas A–D con costo, horas y SLA, recomendación y botones.', 'p_s'),
decir('Este es el paquete que recibe la persona. No es un aviso suelto: tiene causa, impacto, evidencia, alternativas y una recomendación. Y la decisión vuelve al proceso como un evento registrado: queda quién decidió, qué eligió y con qué regla.')])]
S += [Spacer(1, 4), p('Si te lo piden, apaga <b>Selección automática</b> en la barra: las ofertas llegan a la Mesa como «Selección por el coordinador» (regla R09).', 'p_s'), Spacer(1, 6)]

S += [KeepTogether([p('5.4 &nbsp;Control Tower — cerrar con números', 'h2'), p('<b>2 min.</b> Enlaza con lo que dijeron en el diagnóstico: los nueve indicadores del documento calculados en vivo y las preguntas de negocio respondidas.', 'p_s'),
decir('La torre no coordina: observa. Cuántas operaciones esperan asignación, cuáles están en negociación, cuáles en tránsito, qué novedades requieren al coordinador, cuántas llamadas se necesitan por operación y cuánto tarda en responder un cliente y un transportador. Es la línea base contra la que se mide el piloto.')])]
S += [Spacer(1, 6)]
S += [aviso('<b>No hagas esto:</b> recorrer todas las pestañas «para que vean todo». La ontología, los sistemas y el pipeline se enseñan <b>solo si preguntan</b> por el modelo de datos, la integración o el detalle operativo. Una demo larga vende menos que una novedad bien contada.', ROJO, colors.HexColor('#fdeaf0'), 'Error frecuente')]

# ================================================================= 6. IMPLEMENTACION
S += [Spacer(1, 9)] + seccion('6', 'Cómo se implementa', 'Aquí se gana la credibilidad: un camino con responsables, no una promesa.', '8 min')
S += [p('La pestaña <b>Proceso → Ruta de implementación</b> muestra cinco fases secuenciales. Una fase no inicia hasta que la anterior esté certificada, y cada fase lista lo que <b>el cliente debe tener listo</b> para empezar.', 'p')]
fases = [
    ['Fase', 'Qué se hace', 'Lo que el cliente debe tener listo (ejemplos)'],
    ['<b>1. Ingesta</b>', 'Conectar los cuatro canales de entrada y las fuentes', 'Canales y contacto autorizado, ambiente de despliegue, numeración telefónica y troncal, puertos, firewall y TLS, acceso a la base de proveedores'],
    ['<b>2. Extracción</b>', 'Captar los datos mínimos de la solicitud y estructurarlos', 'Maestros de clientes y contactos autorizados limpios, base de transportadores certificable, diccionario de datos'],
    ['<b>3. Validación</b>', 'Configurar las reglas del proceso y los límites', 'Tope de tarifa autorizado, documentos exigidos al transportador, parámetros de espera y reintentos, responsables de autorización nombrados'],
    ['<b>4. Clasificación y destino</b>', 'Informar vs. decidir; escalamiento a la Mesa; coordinación entre agentes', 'Matriz de decisiones, coordinadores de la Mesa, reglas de escalamiento y de contactos no exitosos'],
    ['<b>5. Registro, cierre y aviso</b>', 'Expediente, llamada de cierre, cierre administrativo, piloto e hiperatención', 'Política de grabación autorizada, alcance firmado, definición de los indicadores'],
]
S += [tabla(fases, [32 * mm, 52 * mm, ANCHO_UTIL - 84 * mm]), Spacer(1, 7)]
S += vinetas([
    '<b>Stoppers:</b> algunos prerrequisitos bloquean el proyecto (canales y contacto autorizado, ambiente, alcance firmado) o la fase (numeración, puertos). Mientras estén abiertos, no hay fecha.',
    '<b>El tiempo no se escribe a mano:</b> la Ruta lo calcula con las actividades técnicas de cada fase más el impacto de cada prerrequisito que falta. Cada faltante suma días; si no existe, se pide Discovery.',
    '<b>Ajustes manuales:</b> exigen justificación y nombre de quien los registra, y quedan en el historial.',
], AZUL)
S += [Spacer(1, 6), decir('Con todo disponible son semanas, no horas. Y cada cosa que falte suma días a su fase. Por eso lo primero que les propongo es un Discovery: es la actividad en la que ponemos nombre y fecha a cada prerrequisito antes de comprometer una fecha.', 'QUÉ DICES SOBRE LOS TIEMPOS'), Spacer(1, 6)]
S += [aviso('Tiempo estimado sujeto al cumplimiento de los prerrequisitos y condiciones del camino feliz. El tiempo depende de la cantidad de integraciones o accesos, de la demora en la entrega de prerrequisitos y de que los stoppers estén resueltos. <b>No prometas una fecha sin el Discovery.</b>', AMBAR, AMBAR_CLARO, 'Texto fijo que siempre acompaña a los tiempos')]

# ================================================================= 7. OBJECIONES
S += [PageBreak()] + seccion('7', 'Objeciones frecuentes', 'Respuestas cortas, con la regla del documento detrás.', '')
obj = [
    ['Objeción', 'Respuesta'],
    ['«¿Un agente va a llamar a mis clientes y transportadores sin supervisión?»', 'No hay supervisión que se pierda: informar se automatiza; modificar una tarifa, aprobar un sobrecosto, cambiar condiciones o cancelar un servicio requiere a la persona responsable (R28). Y el agente no promete horarios no validados: separa lo confirmado de lo estimado (R19).'],
    ['«¿Y si el conductor va manejando?»', 'El agente verifica que esté en condiciones seguras; si conduce, cierra la llamada y la reprograma para un momento seguro (R18).'],
    ['«¿Y si nadie contesta?»', 'Se registra el intento y se reprograma según la importancia de la actividad; si la falta de respuesta puede afectar el servicio, se alerta al coordinador (R29).'],
    ['«¿Y si el transportador dice que entregó y el cliente dice que no?»', 'El sistema no cierra automáticamente: genera una novedad para que el coordinador revise los hechos y pida evidencias (R23).'],
    ['«¿Quién puede consultar el estado de una operación?»', 'El agente identifica al solicitante y valida su autorización antes de informar; si pide algo que excede las atribuciones, se genera una gestión para el coordinador (R20, R21).'],
    ['«¿Graban las llamadas?»', 'Solo cuando están autorizadas; siempre queda la transcripción en el expediente (R30).'],
    ['«¿Esto reemplaza al coordinador?»', 'No: lo libera de llamar para preguntar dónde va el vehículo y lo pone a decidir con el paquete completo al frente.'],
]
S += [tabla(obj, [52 * mm, ANCHO_UTIL - 52 * mm])]

# ================================================================= 8. CIERRE
S += [Spacer(1, 10)] + seccion('8', 'Cierre', 'No cierres con «¿qué les pareció?». Cierra con una fecha.', '6 min')
cierre = [decir('Lo que sigue no es una propuesta de precio: es un Discovery de levantamiento. En él ponemos nombre y fecha a cada prerrequisito, definimos el tope de tarifa y los responsables de autorización, y de ahí sale la estimación de tiempo. ¿Qué día de esta semana o la próxima nos sirve?'), Spacer(1, 6), p('Preguntas de cierre', 'h3')]
cierre += vinetas([
    '¿Quién es el contacto autorizado y la persona de tecnología para el ambiente y la telefonía?',
    '¿Quién firma el tope de tarifa y los límites de autonomía: hasta cuánto negocia el agente solo?',
    '¿Qué canal vamos a piloto primero: llamada, formulario o integración?',
    '¿Quiénes serán los coordinadores de la Mesa y con qué horarios?',
], VERDE) + [Spacer(1, 6)]
cierre.append(aviso('<b>Envío al día siguiente:</b> el enlace al simulador para que lo recorran, la Ruta de implementación con los prerrequisitos marcados según lo que dijeron en la reunión, y la propuesta de agenda del Discovery con nombres y fechas. El levantamiento del simulador se puede exportar y compartir: se llena entre todos y queda como acta de la sesión.', VERDE, colors.HexColor('#d1fae5'), 'Seguimiento'))
S += [KeepTogether(cierre)]

# ================================================================= 9. ANEXO
S += [Spacer(1, 10)] + seccion('9', 'Anexo', 'Para tener a mano mientras presentas.', '')
S += [p('Los indicadores que nombra el documento', 'h2')]
kpis = [
    ['Indicador', 'Qué mide', 'Cómo lo dices en la reunión'],
    ['<b>Tiempo de respuesta de clientes</b>', 'Minutos entre el intento de contacto y la respuesta', '«cuánto tarda un cliente en contestar»'],
    ['<b>Tiempo de respuesta de transportadores</b>', 'Minutos entre el intento de contacto y la respuesta', '«cuánto tarda un transportador en contestar»'],
    ['<b>% de confirmaciones automáticas</b>', 'Confirmaciones logradas sin intervención del coordinador', '«cuántas confirmaciones ya no necesitan a una persona»'],
    ['<b>Llamadas exitosas</b>', 'Llamadas en que el interlocutor respondió y se logró el objetivo', '«de cada cien llamadas, cuántas sirven»'],
    ['<b>Negociaciones completadas</b>', 'Negociaciones que terminan en aceptación dentro de los límites', '«cuántas se cierran sin pasar del tope»'],
    ['<b>Contactos por operación</b>', 'Llamadas promedio por operación', '«cuántas llamadas cuesta cada servicio»'],
    ['<b>Anticipación en la detección de novedades</b>', 'Minutos de anticipación antes de afectar el compromiso', '«con cuánta ventaja nos enteramos»'],
    ['<b>Cumplimiento de compromisos</b>', 'Compromisos cumplidos sobre los vencidos', '«qué tanto se cumple lo que se acordó»'],
    ['<b>Satisfacción de clientes</b>', 'Calificación recogida en la llamada de cierre', '«cómo califica el cliente el servicio»'],
]
S += [tabla(kpis, [52 * mm, 62 * mm, ANCHO_UTIL - 114 * mm]), Spacer(1, 8)]
S += [p('Vocabulario: dígalo así', 'h2')]
voc = [
    ['En vez de…', 'Di…'],
    ['«inteligencia artificial», «el modelo»', '«el agente», «la regla», «la política que ustedes definen»'],
    ['«automatización total»', '«lo informativo corre solo; lo que se decide llega decidible»'],
    ['«ahorro de personal»', '«menos llamadas repetitivas, más criterio en lo que importa»'],
    ['«el sistema decide»', '«decide dentro de los límites que ustedes fijaron; por encima, escala al responsable»'],
    ['«le garantizo X semanas»', '«con todo disponible son X semanas; cada faltante suma días y la fecha sale del Discovery»'],
    ['«esto reemplaza su TMS»', '«esto llama, confirma y registra; su TMS sigue siendo su TMS»'],
]
S += [tabla(voc, [62 * mm, ANCHO_UTIL - 62 * mm]), Spacer(1, 8)]
S += [aviso('Las cifras que se ven corriendo en el simulador provienen de una operación simulada construida para explicar el modelo: clientes, transportadores, tarifas y tiempos de ejemplo. <b>No las presentes como resultados esperados del cliente.</b> Los resultados se estiman después del Discovery, contra la línea base real de la operación. Los nombres de los eventos, de las políticas y la categoría «asistido» son supuestos de diseño del simulador, no del documento.', ROJO, colors.HexColor('#fdeaf0'), 'Aviso obligatorio en toda presentación')]

doc.build(S)
print('PDF:', SALIDA)
