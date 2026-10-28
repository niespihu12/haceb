# Pestaña «Agentes» · Haceb — Mapa del proceso (aprobado y construido)

Contrato para construir `#/agentes`: un equipo de agentes ejecutando y revisando **este** proceso tal como está
en `src/data/procesoData.ts` (17 etapas, 2 esperas, 2 estados de fin, 3 categorías de decisión, 17 novedades,
30 reglas `Rnn` con políticas `POL-XX-nn`, 25 nombres de evento — supuesto, 3 familias de agente de IA).
Arquitectura reutilizada de `Logistica` / `MEDVISION-v2` (motor discreto, escritorio RPA, guiones, estación, bandeja,
cinta, bitácora, expediente, director, teatro). **Estado: construido (28/10/2026).** Ver README §7.

- **Unidad de trabajo**: la Operación de transporte (`Operacion`, id `OP-0001`).
- **Disparador**: la solicitud de transporte por los 4 canales del insumo (P2–P3): **llamada atendida por IA ·
  formulario · integración con los sistemas del cliente · registro del coordinador**. La bandeja del disparador es la
  **bandeja de solicitudes**: cada entrada muestra canal, cliente, ruta y mercancía, y en qué agente va o cómo terminó.
- **Estados globales** que recorre (los del simulador): Solicitud → Validación → [EsperaDatos] → Planeación →
  Búsqueda → Negociación → [Escalada] → Selección → Asignación → Confirmación → Preventiva → Presentación → Cargue →
  Tránsito → Aviso destino → Descargue → Validación entrega → Llamada cierre → Cierre admin → **Cerrada** | **Cancelada**.
- **Trayectoria**: como en Logistica, cada caso es una `Operacion` real cuya trayectoria completa se calcula al crearla con
  `motor.transicionar()` (rng por `seq`, reintentos hasta que la novedad detectada coincide con el escenario); el plan de
  pasos se deriva de esos snapshots y cada paso que cambia el estado global lo publica al pipeline
  (`origen: 'agentes'`, `registrarOperacionExterna` / `publicarOperacionExterna`, ya existentes en el contexto).

## 1. Agentes (12 roles de ejecución sobre las 3 familias de IA del insumo, P42)

El insumo habla de **tres agentes de IA** (negociación · seguimiento · cliente). Para ver el proceso etapa por etapa se
presentan 12 «puestos», cada uno perteneciente a una de esas tres familias (columna *Familia*) o al sistema.

| # | Etapa(s) | Agente | Familia (P42) | Pantalla / sistema principal | Estado global que cambia | Reglas | Novedades que puede detectar | Persona que decide |
|---|---|---|---|---|---|---|---|---|
| 1 | [1] Solicitud | **Agente Receptor** | Cliente | Bandeja de solicitudes (`canal.bandeja`) + consola de voz si es llamada (`voz.consola`) | `Solicitud` · `SolicitudRecibida` | R02 | — | — |
| 2 | [2] Validación | **Agente Validador** | Cliente | Revisión: lista de chequeo de datos mínimos (`rev.datos`) + consola de voz para completar | `Validacion` → (`EsperaDatos`) · `SolicitudValidada` / `DatosSolicitados` | R01, R02 | Datos_incompletos (automático) | — |
| 3 | [3] Planeación | **Agente de Planeación** | Cliente | Plataforma de coordinación — ficha de operación (`plat.operacion`) + consola de voz al contacto autorizado | `Planeacion` · `OperacionRegistrada` | R03, R04 | Sin_respuesta (automático) | — |
| 4 | [4] Búsqueda | **Agente Buscador** | Sistema | Base de proveedores (`prov.base`) con filtros y puntaje de compatibilidad | `Busqueda` · `TransportadoresPreseleccionados` | R05 | Sin_transportador | **Sí** (humano): Sergio Duarte · responsable comercial |
| 5 | [5] Negociación | **Agente Negociador** | Negociación | Consola de voz (`voz.consola`) + hoja de negociación (`neg.hoja`: tarifa vs tope, rondas) | `Negociacion` · `NegociacionIniciada`, `AceptacionPreliminar`, `TarifaEscalada` | R06, R07, R08 | Tarifa_sobre_tope (humano), Sin_transportador | **Sí**: Paola Giraldo · responsable de costos |
| 6 | [6]+[7] Selección y asignación | **Agente Asignador** | Sistema | Comparativo de ofertas (`plat.seleccion`) + validación documental (`rev.documentos`) | `Seleccion` → `Asignacion` · `TransportadorSeleccionado`, `DocumentosValidados`, `AsignacionConfirmada` | R09, R10 | Seleccion_manual | **Sí**: Camila Restrepo · coordinadora logística (solo con selección manual) |
| 7 | [8]+[9] Confirmación y preventivas | **Agente Confirmador** | Cliente + Seguimiento | Consola de voz + agenda centralizada (`agenda.central`) | `Confirmacion` → `Preventiva` · `ConfirmacionDoble`, `LlamadaPreventiva` | R11, R12, R13, R14, R26 | Sin_respuesta, Mercancia_no_lista, Retraso_transportador | **Sí**: Andrés Felipe Mora · coordinador logístico |
| 8 | [10]+[11] Presentación y cargue | **Agente de Origen** | Seguimiento | Revisión cruzada transportador vs. cliente (`rev.cruzada`) + control de cargue y despacho (`cargue.control`) | `Presentacion` → `Cargue` · `LlegadaOrigenConfirmada`, `CargueFinalizado`, `DespachoConfirmado` | R15, R16, R17 | Diferencia_llegada, Espera_en_cargue, Diferencia_despacho | **Sí**: Andrés Felipe Mora |
| 9 | [12] Tránsito | **Agente de Seguimiento** | Seguimiento | Tablero de seguimiento en ruta (`seg.tablero`) + consola de voz (incluye llamada entrante del cliente) | `Transito` · `SeguimientoRegistrado` | R18, R19, R20, R21 | Novedad_en_ruta, Conductor_ocupado (automático) | **Sí**: Camila Restrepo |
| 10 | [13]+[14]+[15] Destino | **Agente de Destino** | Cliente + Seguimiento | Consola de voz + revisión cruzada de entrega (`rev.entrega`) | `AvisoDestino` → `Descargue` → `ValidacionEntrega` · `LlegadaDestinoConfirmada`, `EntregaConfirmada` | R16, R22, R23 | Destinatario_no_recibe, Demora_en_descargue, Diferencia_entrega | **Sí**: Laura Cifuentes · coordinadora logística; Sergio Duarte (cambio de destino) |
| 11 | [16]+[17] Cierre | **Agente de Cierre** | Cliente | Consola de voz (satisfacción) + revisión de cierre administrativo (`rev.cierre`) | `LlamadaCierre` → `CierreAdmin` → **Cerrada** · `LlamadaCierre`, `CasoSeguimientoCreado`, `OperacionCerrada` | R24, R25 | Inconformidad_cliente, Sobrecosto_liquidacion | **Sí**: Paola Giraldo · responsable de costos |
| 12 | Trazabilidad transversal | **Agente Torre** | Sistema | Expediente e historial de la operación (`exp.expediente`) | no cambia estado; cierra el expediente | R26, R27, R30 | — | — |

Cuando decide una persona aparece la **Mesa del coordinador** (`mesa.paquete`) con cinta ámbar «fuera del software del
agente» y el agente sigue con otro caso.

## 2. Pasos por agente (id · texto · ms aprox. → resultado / estado / regla)

Los textos citan datos reales del caso (cliente, ruta, mercancía, transportador, tarifa, hora) que salen de
`generarDatos`; `v(ms)` varía ±20 % por caso. Cada paso es una actividad, validación o regla real de la etapa.

**1 · Receptor** — `canal.bandeja` / `voz.consola`
- `r1` Nueva solicitud detectada por el canal {llamada IA | formulario | integración | registro del coordinador} · 700 · `Solicitud` · `SolicitudRecibida`
- `r2` (solo llamada) Atendiendo al cliente: identificando empresa y solicitante · 1300 · transcripción en vivo
- `r3` (solo llamada) Recopilando origen, destino, mercancía, peso, volumen, vehículo, fecha y condiciones · 1800 · R02
- `r4` Guardando la solicitud inicial y la transcripción en el expediente · 800
- `r5` Entregando al Agente Validador · 400

**2 · Validador** — `rev.datos` (revisión ítem por ítem) + `voz.consola`
- `v1` Revisando los datos mínimos: origen · destino · tipo de mercancía · peso · volumen · vehículo · fecha y hora de cargue · condiciones de entrega · requisito especial · 2200 (9 ítems, ✓/✗ uno a uno) · `Validacion` · R01
- `v2` Comprobando coherencia (peso vs. vehículo, fecha vs. horario del punto) · 1000 · ✗ Datos_incompletos
- `v3` (si faltan) Llamando al cliente para completar: «{dato}» · 1600 · `DatosSolicitados` · R02 → `EsperaDatos` (la operación sigue con otro agente)
- `v4` Solicitud suficiente para iniciar la operación · 500 · `SolicitudValidada`

**3 · Planeación** — `plat.operacion` + `voz.consola`
- `p1` Registrando la operación con identificador único «OP-xxxx» · 900 · `Planeacion` · `OperacionRegistrada` · R03
- `p2` Identificando restricciones operativas, fechas comprometidas y recursos requeridos · 1100
- `p3` Llamando al contacto autorizado: disponibilidad de cargue, acceso, horarios, instrucciones · 1800 · R04 · ✗ Sin_respuesta (R29)
- `p4` Registrando el compromiso «mercancía disponible» · 600 · R26
- `p5` Entregando al Agente Buscador · 400

**4 · Buscador** — `prov.base`
- `b1` Abriendo la base de proveedores · 700 · `Busqueda`
- `b2` Filtrando por ubicación y tipo de vehículo requerido · 1100
- `b3` Puntuando capacidad, rutas habituales, historial de cumplimiento y condiciones comerciales · 1500 · R05
- `b4` {n} candidatos preseleccionados · 600 · `TransportadoresPreseleccionados` · ✗ Sin_transportador (humano)
- `b5` Entregando al Agente Negociador · 400

**5 · Negociador** — `voz.consola` + `neg.hoja`
- `n1` Llamando al candidato 1: presento el viaje, consulto disponibilidad e interés · 1800 · `Negociacion` · `NegociacionIniciada`
- `n2` Informando la tarifa ofrecida y recibiendo contrapropuesta · 1500 · R06
- `n3` Comparando contra el tope autorizado · 800 · ✗ Tarifa_sobre_tope (R07 · humano · `TarifaEscalada`)
- `n4` Registrando aceptación preliminar · 700 · `AceptacionPreliminar`
- `n5` Llamando a los demás candidatos · 1600
- `n6` Compartiendo el resultado con el Agente de Seguimiento · 500 · R27

**6 · Asignador** — `plat.seleccion` + `rev.documentos`
- `s1` Consolidando ofertas, condiciones y resultados de negociación · 1200 · `Seleccion`
- `s2` ¿Selección automática? Verificando requisitos operativos, documentales y comerciales · 900 · R09 · ✗ Seleccion_manual (coordinador elige)
- `s3` Transportador seleccionado: {nombre} · 700 · `TransportadorSeleccionado`
- `s4` Revisando documentos del vehículo y del conductor (licencia, SOAT, revisión técnico-mecánica, afiliaciones) · 2200 (ítem por ítem) · `Asignacion` · `DocumentosValidados` · R10
- `s5` Formalizando la asignación · 700 · `AsignacionConfirmada`

**7 · Confirmador** — `voz.consola` + `agenda.central`
- `c1` Llamando al cliente: vehículo asignado, fecha y hora, lugar de cargue, responsable de recibir · 1800 · `Confirmacion` · R11
- `c2` Llamando al transportador: recibió la información completa y está preparado · 1500
- `c3` Doble confirmación: ambos con la misma información · 600 · `ConfirmacionDoble`
- `c4` Programando llamadas preventivas en la agenda centralizada · 800 · R26
- `c5` (24 h antes) Llamada preventiva al transportador: disponibilidad, ubicación, ETA · 1500 · `Preventiva` · R12 · ✗ Retraso_transportador (R14)
- `c6` Llamada preventiva al cliente: mercancía lista, punto disponible, sin cambios · 1500 · ✗ Mercancia_no_lista (R13) · `LlamadaPreventiva`

**8 · Origen** — `rev.cruzada` + `cargue.control`
- `o1` El transportador reporta llegada al punto de origen · 800 · `Presentacion`
- `o2` Validación cruzada con el cliente: ¿el vehículo está en las instalaciones y se autorizó el ingreso? · 2000 (lado a lado) · R15 · ✗ Diferencia_llegada · `LlegadaOrigenConfirmada`
- `o3` Verificando espera por mercancía, congestión o documentos · 900 · R16 · ✗ Espera_en_cargue
- `o4` Siguiendo el avance del cargue · 1600 · `Cargue`
- `o5` Confirmando hora real de salida y condiciones del despacho · 1100 · R17 · ✗ Diferencia_despacho · `CargueFinalizado`
- `o6` Confirmando con el cliente que fue despachada · 900 · `DespachoConfirmado`

**9 · Seguimiento** — `seg.tablero` + `voz.consola`
- `t1` Llamada programada al transportador: estado, ubicación, novedades, ETA · 1800 · `Transito` · R19
- `t2` Verificando que el conductor esté en condiciones seguras · 700 · R18 · ✗ Conductor_ocupado (cierra y reprograma)
- `t3` Registrando seguimiento y actualizando la ETA como «estimada» · 900 · `SeguimientoRegistrado`
- `t4` Clasificando la novedad detectada (demora, cierre vial, avería) · 1100 · ✗ Novedad_en_ruta
- `t5` (cuando afecta el compromiso) Llamada informativa al cliente: confirmado vs. estimado · 1600 · R19
- `t6` (entrante) Cliente consulta el estado: identifico y valido autorización · 1500 · R20, R21

**10 · Destino** — `voz.consola` + `rev.entrega`
- `d1` Llamada al contacto de recepción: instalaciones preparadas, horarios, ingreso · 1600 · `AvisoDestino` · R22 · ✗ Destinatario_no_recibe (humano)
- `d2` Registrando la llegada y confirmándola con recepción · 1000 · `Descargue` · `LlegadaDestinoConfirmada` · ✗ Demora_en_descargue (R16)
- `d3` Siguiendo el descargue; consultando diferencias o daños · 1500
- `d4` Cruce de entrega: transportador vs. cliente · 2000 (lado a lado) · `ValidacionEntrega` · R23 · ✗ Diferencia_entrega (no cierra)
- `d5` Solicitando soportes de entrega · 800 · `EntregaConfirmada`

**11 · Cierre** — `voz.consola` + `rev.cierre`
- `z1` Llamada de cierre: servicio completado, observaciones, calidad, horarios · 1800 · `LlamadaCierre` · ✗ Inconformidad_cliente (R24 → `CasoSeguimientoCreado`)
- `z2` Revisando documentación final · 1000 · `CierreAdmin` · R25
- `z3` Revisando condiciones económicas negociadas y costos adicionales autorizados · 1100 · ✗ Sobrecosto_liquidacion (humano)
- `z4` Revisando novedades que afecten la liquidación · 900
- `z5` Cierre administrativo · 600 · `OperacionCerrada` → **Cerrada**

**12 · Torre** — `exp.expediente`
- `x1` Reuniendo solicitud, llamadas, transcripciones y grabaciones autorizadas · 1200 · R30
- `x2` Ordenando el historial cronológico · 900
- `x3` Verificando la traza (qué ocurrió → información → regla → decisión → ejecución → resultado) · 1100
- `x4` Expediente cerrado · 500

## 3. Pantallas a construir (tipo)

| Id | Pantalla | Tipo | Se muestra… |
|---|---|---|---|
| `canal.bandeja` | Bandeja de solicitudes (4 canales) | web | filas con canal, cliente, ruta; la nueva entra y se abre |
| `voz.consola` | Consola de voz del agente de IA | escritorio | llamada en curso: interlocutor, objetivo (de la agenda), transcripción turno a turno, estado «confirmado / estimado», resultado |
| `rev.datos` | Datos mínimos de la solicitud | lista de chequeo | 9 ítems marcándose ✓/✗ |
| `plat.operacion` | Plataforma · ficha de la operación | web | registro con identificador único, restricciones, fechas |
| `prov.base` | Base de proveedores | web | tabla filtrable + puntaje de compatibilidad |
| `neg.hoja` | Hoja de negociación | documento | tarifa ofrecida / contrapropuesta / tope, rondas |
| `plat.seleccion` | Comparativo de ofertas | web | ofertas lado a lado + selección |
| `rev.documentos` | Validación documental del vehículo y conductor | lista de chequeo | licencia, SOAT, revisión técnico-mecánica, afiliaciones |
| `agenda.central` | Agenda centralizada de llamadas | web | tareas con objetivo, interlocutor y actividad; se actualizan al confirmar |
| `rev.cruzada` | Validación cruzada de llegada | revisión | reporte del transportador vs. observación del cliente |
| `cargue.control` | Control de cargue y despacho | lista de chequeo | cantidades, condiciones, documentos, hora real de salida |
| `seg.tablero` | Tablero de seguimiento en ruta | web | operaciones en tránsito con ETA «estimada/confirmada» |
| `rev.entrega` | Cruce de entrega | revisión | transportador vs. destinatario, soportes |
| `rev.cierre` | Cierre administrativo | lista de chequeo | documentación, condiciones económicas, costos adicionales, novedades |
| `exp.expediente` | Expediente e historial | documento | los 10 contenidos del expediente + línea de tiempo |
| `mesa.paquete` | Mesa del coordinador (pantalla de la persona) | web con cinta ámbar | paquete de decisión con alternativas y botones |

Si una etapa no tiene sistema, la pantalla es la revisión misma (chequeo, cruce, acta): no se inventan sistemas.

## 4. Escenas del Director (ESCENAS)

`normal` (camino feliz con selección automática) · `normal-manual` (selección manual) · 17 novedades: Datos_incompletos,
Sin_respuesta, Tarifa_sobre_tope, Sin_transportador, Seleccion_manual, Mercancia_no_lista, Retraso_transportador,
Diferencia_llegada, Espera_en_cargue, Diferencia_despacho, Novedad_en_ruta, Conductor_ocupado, Destinatario_no_recibe,
Demora_en_descargue, Diferencia_entrega, Inconformidad_cliente, Sobrecosto_liquidacion · `cancelada` (Sin_transportador →
cancelar servicio, R28) · `consulta-entrante` (cliente llama por el estado, R20). Total previsto: **21 escenas**.

## 5. Documentos reales que se muestran

Solicitud de transporte (formulario/ficha), transcripción de llamada, hoja de negociación, ficha de documentos del vehículo
y conductor, remisión de despacho, soporte de entrega, acta de cierre/liquidación. Formatos colombianos creíbles
(placas `SXK 482`, NIT, `COP`, ciudades reales, horarios de recibo); sin logos ni marcas.

## 6. Qué necesito de ti

1. **¿Vamos con los 12 puestos de agente?** (Se puede fusionar Planeación en Receptor y/o Torre en Cierre → 10.)
2. **¿Los nombres de las personas** (Camila Restrepo, Andrés Felipe Mora, Laura Cifuentes, Sergio Duarte, Paola Giraldo)
   están bien o tienes los reales de Haceb?
3. **¿Alguna pantalla o documento real** (formato de remisión, hoja de ruta, software de seguimiento) para imitar?
4. Tras tu OK: Fase 1 (contrato y esqueleto) → Fase 2 (pantallas y guiones en paralelo) → Fase 3 (verificación y QA) →
   Fase 4 (credibilidad).
