# Guion de demo · Haceb · Coordinación logística con agentes de IA (10–14 min)

Antes de empezar: `npm run dev` → http://localhost:3038 · pantalla a 1440×900 · velocidad 5x lista. Todo lo que se ve de
clientes, transportadores y tarifas es **operación simulada**; el proceso sale de `proceso.txt`.

## 0. Apertura (1 min) · botón **Visión**
- «El proceso no es solo llamar al transportador para saber dónde va: es una coordinación permanente entre cliente,
  transportador y equipo logístico, desde la solicitud hasta la confirmación final.»
- Pasa las láminas 1–6 (lo que escuchamos, retos, posición, flujo). Cierra con `Esc`.

## 1. Dashboard (2 min) · `#/`
- Pulsa **Play** a 5x. Señala las **4 puertas de entrada**: llamada atendida por IA, formulario, integración, registro del coordinador.
- «Aquí están los indicadores que pide el documento: tiempo de respuesta de clientes y transportadores, confirmaciones
  automáticas, llamadas exitosas, negociaciones completadas, cumplimiento de compromisos.»
- Muestra el avance por las 17 etapas y las dos esperas (esperando datos / en manos del coordinador).
- Abre una operación activa con **Ver detalle**.

## 2. Detalle de una operación (2 min) · `#/operacion/:id`
- Recorrido por el flujo; datos mínimos de la solicitud; **comunicaciones** (quién llamó, con qué objetivo, resultado,
  «confirmada» vs «estimada» — R19).
- **Trazabilidad**: qué ocurrió → información → regla → decidió → ejecutó → resultado. Expediente y compromisos.

## 3. Proceso (2 min) · `#/proceso`
- **Ruta de implementación** (por defecto): 5 fases, stoppers, tiempo calculado. Marca un prerrequisito «no disponible» y
  muestra cómo suma días; abre un stopper de proyecto y muestra que impide iniciar. Registra un ajuste con justificación.
- **Blueprint**: el documento 1:1 con índice lateral, el flujo con bloques de color y el ASCII original; las reglas R01–R30.

## 4. Pipeline (1 min) · `#/pipeline`
- Tablero por bloque y vista por canal; filtra por categoría (automático / asistido / humano).

## 5. Mesa del coordinador (2 min) · `#/coordinador`
- Abre «Provocar una novedad»: fuerza **Tarifa solicitada sobre el límite** en una operación en negociación.
- Paquete de decisión: causa, impacto, evidencia, alternativas A–C con costo/horas/SLA/reglas y recomendación del agente.
- Pulsa **Autorizar propuesta del agente**. «El agente no puede comprometer valores adicionales (R07): la decide una persona.»
- Prueba **Cancelar servicio** con una operación «Sin transportador» (R28).
- Cambia a **Selección manual** en la barra: aparecen «Selección por el coordinador» con las ofertas consolidadas (R09).

## 6. Sistemas y Control Tower (2 min) · `#/sistemas` · `#/control-tower`
- Arquitectura lógica interactiva: canales → plataforma → 3 agentes → base de proveedores, agenda, expediente.
- Control Tower: los 9 indicadores del insumo en vivo, las preguntas de negocio respondidas (¿qué está pendiente de
  asignación? ¿qué novedades requieren atención? ¿qué hace el sistema y qué requiere al coordinador?), heatmap etapa × canal.

## 7. Ontología (1 min) · `#/ontologia`
- Relaciones: novedad × categoría × agente × quién decide. Máquina de estados. Supuestos de diseño: «esto no sale del insumo».

## 8. Pestaña Agentes · pendiente
- Se muestra `AGENTES-MAPA.md`; tras el OK se construye la pestaña viva (cinta de agentes, consola de voz, Director de escena).

## Frases útiles
- «Informar el estado, confirmar una hora o pedir una actualización se gestiona automáticamente; modificar una tarifa, aprobar
  sobrecostos o cancelar un servicio requiere a la persona responsable.»
- «Si transportador y cliente no coinciden en la entrega, el sistema no cierra: abre una novedad.»
- «Cada llamada tiene un objetivo, una operación y un interlocutor; así no se llama dos veces por lo mismo.»
