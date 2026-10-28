# INVENTARIO — Haceb · Coordinación logística con agentes de IA

Insumo único: `docs/proceso.txt` (97 líneas, 49 párrafos narrativos, sin títulos ni códigos de proceso).
El documento es una **narrativa continua**: no trae secciones numeradas, ni códigos L1, ni nombres de sistemas
de marca, ni nombres de eventos, ni fases de adopción. Eso se declara abajo y se marca como *supuesto de diseño*.

## 1. Lo que el insumo SÍ trae (y a qué pieza alimenta)

| Elemento | Dónde está en el insumo (línea) | Pieza del simulador |
|---|---|---|
| Objetivo: gestión integral de comunicación y coordinación con transportadores y clientes mediante agentes de IA (llamar, confirmar, gestionar compromisos, detectar novedades, sincronizar) | 1 | `OBJETIVO_TEXTO`, Blueprint §1, Visión |
| Alcance: inicio = recepción de la solicitud de transporte; fin = confirmación final / cierre administrativo | 3, 75, 97 | `ALCANCE_*`, estados de fin |
| 4 canales de entrada: llamada atendida por IA · formulario · integración con sistemas del cliente · registro del coordinador | 3 | `Canal`, tarjetas del Dashboard |
| Datos mínimos de la solicitud (origen, destino, tipo de mercancía, peso, volumen, vehículo, fecha/hora de cargue, condiciones de entrega, requisito especial) | 5 | `Operacion` (ontología), Detalle |
| Flujo end-to-end: 17 etapas (solicitud → validación → planeación → búsqueda → negociación → selección → asignación → doble confirmación → preventivas → presentación → cargue → tránsito → aviso de destino → descargue → validación de entrega → cierre con cliente → cierre administrativo) | 3–75 | `FLUJO_ETAPAS`, máquina de estados, motor |
| Bifurcaciones y reingresos: datos incompletos → nueva llamada; tarifa sobre tope → coordinador; sin transportador → coordinación con cliente; diferencias de entrega → no cierra; inconformidad → caso de seguimiento | 7, 15, 17–19, 69, 73 | `motor.ts`, catálogo de excepciones |
| Roles: cliente, contacto autorizado, destinatario, transportador/conductor, coordinador logístico, responsables de autorización, 3 clases de agente de IA | 9, 21, 25, 53, 83, 85 | `ROLES`, Ontología, Mesa del coordinador |
| Sistemas (funcionales, sin marca): plataforma, base de proveedores, agenda centralizada de llamadas, expediente, historial, vista centralizada, integraciones con sistemas del cliente / externos | 9, 11, 35, 77–81, 89 | `SISTEMAS`, página Sistemas |
| Reglas de negocio (30) | 7, 15, 19, 21, 29–33, 37, 47, 51, 55, 61, 67–69, 73, 75, 81–87 | `REGLAS`, Ontología → Reglas |
| Excepciones / novedades (17 tipos) | 5, 15, 17, 31, 33, 37, 39, 43, 49, 55, 61, 63, 69, 73, 75, 87 | `EXCEPCIONES_LISTA`, catálogo |
| Distinción informativa vs. decisión | 85 | categorías de decisión `automatico / asistido / humano` |
| Contactos no exitosos | 87 | regla R-CON, excepción `Sin_respuesta` |
| Expediente e historial cronológico | 77, 79 | `EXPEDIENTE_CONTENIDO`, Detalle |
| Agenda centralizada y coordinación entre agentes | 81, 83 | Sistemas, Ontología → Relaciones |
| Visión centralizada para el coordinador | 89, 91 | Dashboard, Pipeline, Mesa |
| KPIs (8): tiempos de respuesta de clientes y transportadores, % confirmaciones automáticas, llamadas exitosas, negociaciones completadas, contactos por operación, anticipación en detección de novedades, cumplimiento de compromisos, satisfacción | 93 | `KPIS_INSUMO`, Control Tower |
| Criterios de éxito / propósito: coordinación operativa permanente, menos llamadas manuales, trazabilidad | 95, 97 | `PROPOSITO_*`, Visión (cierre) |

## 2. Lo que el insumo NO trae → *supuesto de diseño* (marcado `// SUPUESTO:` y «supuesto de diseño» en la UI)

1. **Nombre de la unidad de trabajo**: el insumo dice «operación» y «servicio». Se usa **Operación de transporte** (`OP-0001`).
2. **Estados de fin**: el insumo habla de «cierre administrativo» y «confirmación final»; **Cancelada** se deduce de «cancelar un servicio» (línea 85). Ambos terminales se marcan.
3. **Códigos de proceso L1**: no existen. No se inventan; los 5 bloques de color son una agrupación visual.
4. **Nombres de eventos**: no existen. Se usan nombres en español PascalCase propios (supuesto).
5. **Fases de adopción (Observe/Assist/…)**: no existen. En su lugar, el insumo sí habla de «selección automática cuando las políticas lo permitan» (línea 21): la barra superior trae el interruptor **Selección automática**.
6. **Valores numéricos** (tarifa tope, umbrales de espera, nº de reintentos, ventana de seguridad del conductor): el insumo dice «parámetros establecidos» sin cifras → parámetros ejemplo en `GUARDRAILS`.
7. **Nombres de personas, empresas, ciudades, flota, tarifas, teléfonos**: todo ficticio (operación simulada).
8. **Mesa del coordinador**: el insumo habla del «coordinador» y de «intervención humana»; el nombre de la bandeja es propio.
9. **Fases de implementación / Ruta**: el insumo no define MVP; la Ruta de implementación usa la plantilla de 5 capas de la familia, con actividades y prerrequisitos redactados para este proceso (diseño de implementación, no del proceso).

## 3. Datos de entrada del encargo que venían vacíos y cómo se dedujeron

| Campo | Valor deducido |
|---|---|
| Puerto | **3038** (3037 era el último usado) |
| Estilo | Familia de simuladores; acento propio azul petróleo / turquesa (Haceb no aporta guía de marca en el insumo) |
| Unidad de trabajo | Operación de transporte |
| Disparador | Solicitud de transporte: llamada IA · formulario · integración · registro del coordinador |
| Sistemas | Los funcionales del insumo (ver §1) |
| Personas que deciden fuera del software | Coordinador logístico y «responsables correspondientes» (comercial / contractual / económico) — nombres ficticios |
| Excepciones a ver en la demo | Las 17 derivadas del insumo; el Director de escena (pestaña Agentes) forzará cada una |
