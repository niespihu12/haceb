# Haceb · Coordinación logística con agentes de IA — simulador de demostración

Simulador del proceso **gestión integral de la comunicación y coordinación con transportadores y clientes mediante
agentes de inteligencia artificial** (llamar, confirmar información, gestionar compromisos, detectar novedades y
sincronizar a todos los participantes). Misma metodología de la familia `Logistica/` (AION ORDER), `dba/` y `arealimpia/`:
Vite + React 19 + TypeScript + Tailwind 3 + framer-motion + recharts + lucide, `HashRouter`, contexto de simulación en vivo.

```bash
npm install
npm run dev      # http://localhost:3038
npm run build    # tsc -b && vite build
npx eslint .
```

Puerto **3038** (registrado en `antifraude/.claude/launch.json` con el nombre `haceb`).

## 1. Fuente del contenido

| Capa | Archivo | Qué es |
|---|---|---|
| Documental | `docs/proceso.txt` → `src/data/procesoTexto.ts` (generado: 49 párrafos verbatim, `P(n)`) → `src/data/procesoData.ts` | Transcripción 1:1 del insumo: objetivo, alcance, canales, datos mínimos, 17 etapas, roles, sistemas funcionales, 30 reglas, 17 novedades, expediente, preguntas de negocio, 9 KPIs |
| Operación simulada | `src/data/mockData.ts`, `src/data/motor.ts` | Clientes, nodos, transportadores, mercancías, tarifas, teléfonos: **ficticios**. La máquina de estados y el catálogo de novedades sí salen del insumo |
| Supuestos | `// SUPUESTO:` en código y etiqueta «supuesto de diseño» en la UI | Ver `INVENTARIO.md` §2 y `SUPUESTOS_DE_DISENO` |

**Unidad de trabajo**: la *Operación de transporte* (`OP-0001`). **Disparador**: la solicitud de transporte por llamada
atendida por IA, formulario, integración o registro del coordinador.

### Supuestos de diseño (el insumo no los trae)
Estado final «Cancelada» (deducido de «cancelar un servicio»); nombres de eventos y de políticas `POL-XX-nn`; categoría
«asistido»; cifras de los guardrails (tope = referencia + 8 %, 3 intentos, espera de 90 min…); fases de adopción
(no existen: se ofrece el interruptor *Selección automática*, que sí sale de P11); los 5 bloques de color son una
agrupación **visual** de las 17 etapas, no del documento.

## 2. Paleta

Fondo `#F7F8FA`, tinta `#141b2d`, paneles `glass-panel`, Inter + JetBrains Mono. Un color por bloque: Solicitud y
planeación `captura` azul · Consecución del vehículo `validacion` teal · Confirmación y cargue `promesa` ámbar · Tránsito y
entrega `liberacion` violeta · Cierre y mejora `comunicacion` cian · Esperas/salidas `excepcion` rosa. Categorías de decisión:
automático `catA` gris · asistido `catC` ámbar · humano `catD` rojo.

## 3. Rutas

| Ruta | Página | Contenido |
|---|---|---|
| `#/` | Dashboard | 4 canales, 6 KPIs del insumo, operaciones por etapa y estados de fin, donut por bloque, top de novedades, bitácora, tabla de operaciones activas con acciones |
| `#/proceso` | Proceso | **Ruta de implementación** (por defecto) y **Blueprint del proceso** (documento 1:1, índice lateral; sin KPIs ni contadores) |
| `#/pipeline` | Pipeline | Tablero por bloque + salidas, vista por canal, filtros |
| `#/coordinador` | Mesa del coordinador | Bandeja humana (HITL): paquete de decisión completo y botones; provocar novedades para la demo |
| `#/sistemas` | Sistemas | Arquitectura lógica interactiva, sistemas con tráfico derivado, canales |
| `#/control-tower` | Control Tower | 9 KPIs en vivo, preguntas de negocio respondidas, gráficos, heatmap etapa × canal, riesgo de SLA |
| `#/ontologia` | Ontología | Entidades · Relaciones · Taxonomías · Máquina de estados · Reglas · Glosario · Supuestos |
| `#/operacion/:id` | Detalle | Recorrido, datos mínimos, novedad y alternativas, comunicaciones, trazabilidad, expediente |
| `#/agentes` | Agentes | Equipo de 12 agentes ejecutando y revisando el proceso en vivo: cinta, bandeja de solicitudes, estación con escritorio RPA, pensamiento, bitácora, expediente, Director de escena (21 escenas) y modo teatro |

Barra superior: marca, pestañas, interruptor **Selección automática** (R09), velocidad 1x/2x/5x/10x, play/pause/stop,
reloj simulado (salta noches y domingos) + tick, botón **Visión** (presentación ejecutiva).

## 4. Flujo (17 etapas)

```
 SOLICITUD ─▶ VALIDACIÓN ─▶ PLANEACIÓN ─▶ BÚSQUEDA ─▶ NEGOCIACIÓN ─▶ SELECCIÓN ─▶ ASIGNACIÓN
 llamada IA   ¿completa?     ID único     base de      llamadas IA    coordinador   documentos
 formulario    │ no          contacto     proveedores   tarifa ≤ tope  o automática  validados
 integración   ▼             autorizado                  │ > tope
 coordinador  llamada IA                                 ▼
              al cliente                           COORDINADOR decide
 CONFIRMACIÓN ─▶ PREVENTIVAS ─▶ PRESENTACIÓN ─▶ CARGUE ─▶ TRÁNSITO ─▶ AVISO DESTINO
 CIERRE ADMIN ◀─ LLAMADA CIERRE ◀─ VALIDACIÓN ENTREGA ◀─ DESCARGUE ◀──────┘
```

Esperas: `EsperaDatos` (agente completa datos con el cliente), `Escalada` (decide el coordinador). Fines: `Cerrada`,
`Cancelada`. La agrupación en 5 bloques es visual, no del documento.

## 5. Motor y simulación

`motor.transicionar(op, opts)` es pura (rng inyectable): implementa bifurcaciones, reingresos, escalamiento y rechazo con
causa, emite eventos y deja la traza *qué ocurrió → información → regla → decidió → ejecutó → resultado*. El tick (3 s a 1x)
avanza una fracción de las operaciones activas (WIP estable ~25–35), hace llegar solicitudes y deja que el coordinador
simulado atienda la Mesa. Las operaciones con `origen: 'agentes'` las moverá el motor de la pestaña Agentes.

## 6. Ruta de implementación

Cinco fases secuenciales (Ingesta · Extracción · Validación · Clasificación y destino · Registro, cierre y aviso) con
prerrequisitos redactados como lo que el cliente debe tener listo (stoppers de proyecto y de fase), actividades técnicas en
días hábiles y criterios de certificación. Con el estado inicial de ejemplo la Ruta da **8 semanas (40 días hábiles: 34 de trabajo técnico con la integración incluida + 6 por prerrequisitos faltantes)**. El tiempo **lo calcula** `src/lib/rutaImplementacion.ts`; los ajustes exigen
justificación (≥ 20 caracteres) y autor. Persistencia en `localStorage` (`aion:levantamiento:haceb-coordinacion-logistica`),
exportar/importar JSON y levantamiento compartido vía Supabase (`antifraude/.env.local`, sin credenciales sigue en modo
local). Archivos: `src/data/implementacionData.ts`, `src/components/RutaImplementacion.tsx`, `SubprocesoSimulacion.tsx`.

## 7. Pestaña Agentes

Equipo de **12 agentes** (sobre las 3 familias de IA del insumo: negociación, seguimiento y cliente) que ejecutan y revisan las 17
etapas **en vivo y como si fuera real** (`#/agentes`). Mapa aprobado: `AGENTES-MAPA.md`.

- **Cinta de agentes** con la operación en manos, la acción en curso y la cola; entregas animadas.
- **Bandeja de solicitudes**: llamada IA · formulario · integración · registro del coordinador.
- **Estación del agente** (toggle Escritorio / Tarjetas): pensamiento en primera persona citando `Rnn`, stepper revisable y el
  **escritorio RPA** con 9 ventanas funcionales (bandeja, consola de voz, plataforma de coordinación, base de proveedores, agenda
  centralizada, revisiones, tablero de seguimiento, Mesa del coordinador y expediente) y un cursor que las opera.
- **Mesa del coordinador** (cinta ámbar «fuera del software del agente»): la persona lee el paquete, firma con PIN y decide; el agente
  sigue con otro caso.
- **Bitácora**, **expediente** (los 10 contenidos del insumo), **Director de escena** (21 escenas: normal, selección manual, las 17
  novedades, cancelación y consulta entrante) y **modo teatro** (`T`); atajos: Espacio pausa, 1/2/5/0 velocidad, N solicitud, → siguiente.
- Cada caso es una `Operacion` real: su trayectoria completa se calcula al crearla con `motor.transicionar()` (rng por `seq`,
  reintentos hasta que la novedad coincide con el escenario) y el plan de pasos se **deriva de esa trayectoria**
  (`src/data/agentesPlan.ts`, soporta reingresos y cancelación). Cada paso que cambia el estado lo publica al pipeline
  (`origen: 'agentes'`).
- Reglas de oro: todo lo visible es función pura del progreso del paso (sin timers ni `AnimatePresence` con salida), determinismo por `seq`.
- **Verificación**: `node scripts/verificar-agentes.mjs` (81 casos: 60 aleatorios + 21 escenas; anclas existentes en el DOM, orden de
  acciones, un diálogo por paso, actores humanos en las esperas, sin timers) → 0 incoherencias; `node scripts/plan-ver.mjs <escena>`
  imprime el plan de una escena.

## 8. Estructura

```
src/
  data/ procesoTexto · procesoData · mockData · motor · implementacionData
  types/ index · implementacion
  context/ simulation-context · SimulationContext
  hooks/ useSimulation
  components/ Layout · Navbar · Footer · shared · PresentationModal · RutaImplementacion · SubprocesoSimulacion
  pages/ Home · Proceso · Pipeline · Coordinador · Sistemas · ControlTower · Ontologia · OperacionDetail
  lib/ utils · rng · rutaImplementacion · levantamientoRemoto
scripts/ smoke-motor.entry.ts · plan-smoke.entry.ts · plan-ver.mjs · verificar-agentes.mjs · guion-comercial.py
```
