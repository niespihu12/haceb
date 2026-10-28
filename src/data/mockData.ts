// ============================================================================
// mockData.ts — OPERACIÓN SIMULADA (todo lo de aquí es ficticio salvo la
// máquina de estados y el catálogo de excepciones, que salen del insumo).
//
// Clientes, nodos, transportadores, mercancías, tarifas y teléfonos se inventan
// para la demostración. Las cifras (tarifas, topes, umbrales) son parámetros de
// ejemplo: // SUPUESTO.
// ============================================================================

import type {
  AgenteIA,
  Alternativa,
  BloqueFlujo,
  CategoriaDecision,
  Canal,
  CanalMetrics,
  Cliente,
  EfectoAlternativa,
  EstadoFin,
  EtapaFlujo,
  EtapaOperacion,
  Excepcion,
  MetricaKPI,
  Nodo,
  NivelSLA,
  Operacion,
  TipoExcepcion,
  TipoVehiculo,
  Transportador,
  Mercancia,
} from '@/types';
import { BLOQUES, FLUJO_ETAPAS } from './procesoData';
import { type Rng, elegir, entre, mezclar } from '@/lib/rng';

// --- Máquina de estados -----------------------------------------------------

export const ETAPAS_FLUJO: EtapaFlujo[] = FLUJO_ETAPAS.map((e) => e.id);
export const ESTADOS_ESPERA: EtapaOperacion[] = ['EsperaDatos', 'Escalada'];
export const ESTADOS_FIN: EstadoFin[] = ['Cerrada', 'Cancelada'];
export const TODAS_LAS_ETAPAS: EtapaOperacion[] = [...ETAPAS_FLUJO, 'EsperaDatos', 'Escalada', 'Cerrada', 'Cancelada'];

export const esTerminal = (e: EtapaOperacion): boolean => e === 'Cerrada' || e === 'Cancelada';
export const esEtapaFlujo = (e: EtapaOperacion): e is EtapaFlujo => (ETAPAS_FLUJO as string[]).includes(e);

export const ETAPA_LABEL: Record<EtapaOperacion, string> = {
  ...(Object.fromEntries(FLUJO_ETAPAS.map((e) => [e.id, e.nombre])) as Record<EtapaFlujo, string>),
  EsperaDatos: 'Esperando datos del cliente',
  Escalada: 'En manos del coordinador',
  Cerrada: 'Cerrada',
  Cancelada: 'Cancelada',
};

export const ETAPA_LABEL_CORTO: Record<EtapaOperacion, string> = {
  ...(Object.fromEntries(FLUJO_ETAPAS.map((e) => [e.id, e.corto])) as Record<EtapaFlujo, string>),
  EsperaDatos: 'Espera datos',
  Escalada: 'Coordinador',
  Cerrada: 'Cerrada',
  Cancelada: 'Cancelada',
};

export const ETAPA_NUMERO: Record<EtapaOperacion, number> = {
  ...(Object.fromEntries(FLUJO_ETAPAS.map((e) => [e.id, e.numero])) as Record<EtapaFlujo, number>),
  EsperaDatos: 0,
  Escalada: 0,
  Cerrada: 0,
  Cancelada: 0,
};

export const ETAPA_BLOQUE: Record<EtapaOperacion, BloqueFlujo> = {
  ...(Object.fromEntries(FLUJO_ETAPAS.map((e) => [e.id, e.bloque])) as Record<EtapaFlujo, BloqueFlujo>),
  EsperaDatos: 'Novedad',
  Escalada: 'Novedad',
  Cerrada: 'Cierre',
  Cancelada: 'Novedad',
};

export const BLOQUE_COLOR: Record<BloqueFlujo, { color: string; bg: string; clase: string }> = Object.fromEntries(
  BLOQUES.map((b) => [
    b.id,
    {
      color: b.color,
      bg: b.colorBg,
      clase:
        b.id === 'Solicitud' ? 'bg-captura-light text-captura-dark border-captura/25'
        : b.id === 'Consecucion' ? 'bg-validacion-light text-validacion-dark border-validacion/25'
        : b.id === 'Cargue' ? 'bg-promesa-light text-promesa-dark border-promesa/25'
        : b.id === 'Transito' ? 'bg-liberacion-light text-liberacion-dark border-liberacion/25'
        : b.id === 'Cierre' ? 'bg-comunicacion-light text-comunicacion-dark border-comunicacion/25'
        : 'bg-excepcion-light text-excepcion-dark border-excepcion/25',
    },
  ]),
) as Record<BloqueFlujo, { color: string; bg: string; clase: string }>;

export const ETAPA_BADGE: Record<EtapaOperacion, string> = Object.fromEntries(
  TODAS_LAS_ETAPAS.map((e) => [e, BLOQUE_COLOR[ETAPA_BLOQUE[e]].clase]),
) as Record<EtapaOperacion, string>;

/** Progreso (0-100) según la posición en el flujo. */
export function progresoDe(e: EtapaOperacion, previa: EtapaFlujo | null): number {
  if (e === 'Cerrada') return 100;
  const base = esEtapaFlujo(e) ? e : previa;
  if (!base) return 0;
  return Math.round(((ETAPAS_FLUJO.indexOf(base) + (e === 'Cancelada' ? 0 : 0.5)) / ETAPAS_FLUJO.length) * 100);
}

export function siguienteEtapa(e: EtapaFlujo): EtapaFlujo | 'Cerrada' {
  const i = ETAPAS_FLUJO.indexOf(e);
  return i === ETAPAS_FLUJO.length - 1 ? 'Cerrada' : ETAPAS_FLUJO[i + 1];
}

// --- Canales y categorías -----------------------------------------------------

export const CANALES: Canal[] = ['llamada_ia', 'formulario', 'integracion', 'coordinador'];

export const CANAL_INFO: Record<Canal, { label: string; corto: string; color: string }> = {
  llamada_ia: { label: 'Llamada atendida por IA', corto: 'LLAMADA', color: '#7c3aed' },
  formulario: { label: 'Formulario', corto: 'FORM', color: '#2563eb' },
  integracion: { label: 'Integración con el cliente', corto: 'INTEGR.', color: '#0d9488' },
  coordinador: { label: 'Registro del coordinador', corto: 'COORD.', color: '#d97706' },
};

export const CATEGORIAS: CategoriaDecision[] = ['automatico', 'asistido', 'humano'];

export const CATEGORIA_CLASE: Record<CategoriaDecision, string> = {
  automatico: 'bg-catA-light text-catA-dark',
  asistido: 'bg-catC-light text-catC-dark',
  humano: 'bg-catD-light text-catD-dark',
};

export const CATEGORIA_LABEL: Record<CategoriaDecision, string> = {
  automatico: 'Automático',
  asistido: 'Asistido',
  humano: 'Decisión humana',
};

export const AGENTES_IA: AgenteIA[] = ['Agente de cliente', 'Agente de negociación', 'Agente de seguimiento'];

// --- Maestros ficticios ----------------------------------------------------------

export const CLIENTES: Cliente[] = [
  { id: 'CL-001', nombre: 'Distribuidora Andina del Hogar', tipo: 'Distribuidor mayorista', contacto: 'Marcela Ortiz', telefono: '+57 604 555 0101' },
  { id: 'CL-002', nombre: 'Almacenes La Ceiba', tipo: 'Cadena de almacenes', contacto: 'Julián Barrera', telefono: '+57 601 555 0112' },
  { id: 'CL-003', nombre: 'Electrohogar del Caribe', tipo: 'Distribuidor regional', contacto: 'Paola Mendoza', telefono: '+57 605 555 0123' },
  { id: 'CL-004', nombre: 'Mercaplus Colombia', tipo: 'Hipermercado', contacto: 'Camilo Rincón', telefono: '+57 601 555 0134' },
  { id: 'CL-005', nombre: 'Casa Confort Pacífico', tipo: 'Cadena de almacenes', contacto: 'Diana Cuero', telefono: '+57 602 555 0145' },
  { id: 'CL-006', nombre: 'Constructora Altavista', tipo: 'Constructora (proyecto)', contacto: 'Ricardo Salazar', telefono: '+57 604 555 0156' },
  { id: 'CL-007', nombre: 'Tiendas Mi Hogar Oriente', tipo: 'Cadena de almacenes', contacto: 'Natalia Pardo', telefono: '+57 607 555 0167' },
  { id: 'CL-008', nombre: 'Comercial Cafetera del Eje', tipo: 'Distribuidor regional', contacto: 'Andrés Giraldo', telefono: '+57 606 555 0178' },
  { id: 'CL-009', nombre: 'Súper Ahorro Santanderes', tipo: 'Hipermercado', contacto: 'Liliana Ardila', telefono: '+57 607 555 0189' },
  { id: 'CL-010', nombre: 'Muebles y Electros del Sur', tipo: 'Distribuidor regional', contacto: 'Hernán Ibarra', telefono: '+57 602 555 0190' },
  { id: 'CL-011', nombre: 'Grupo Inmobiliario Bahía', tipo: 'Constructora (proyecto)', contacto: 'Sofía Villamizar', telefono: '+57 605 555 0201' },
  { id: 'CL-012', nombre: 'Centro Comercial Los Llanos', tipo: 'Cadena de almacenes', contacto: 'Mauricio Cárdenas', telefono: '+57 608 555 0212' },
];

export const NODOS: Nodo[] = [
  { id: 'N-MDE', ciudad: 'Medellín', lugar: 'Planta y CEDI Copacabana', lat: 6.35, lng: -75.51 },
  { id: 'N-BOG', ciudad: 'Bogotá', lugar: 'Bodega Fontibón', lat: 4.67, lng: -74.14 },
  { id: 'N-CLO', ciudad: 'Cali', lugar: 'Centro de distribución Yumbo', lat: 3.58, lng: -76.49 },
  { id: 'N-BAQ', ciudad: 'Barranquilla', lugar: 'Bodega Zona Franca', lat: 10.96, lng: -74.8 },
  { id: 'N-BGA', ciudad: 'Bucaramanga', lugar: 'Almacén Girón', lat: 7.07, lng: -73.17 },
  { id: 'N-PEI', ciudad: 'Pereira', lugar: 'Bodega Dosquebradas', lat: 4.81, lng: -75.69 },
  { id: 'N-CTG', ciudad: 'Cartagena', lugar: 'Bodega Mamonal', lat: 10.34, lng: -75.5 },
  { id: 'N-CUC', ciudad: 'Cúcuta', lugar: 'Almacén Zona Industrial', lat: 7.89, lng: -72.5 },
  { id: 'N-IBG', ciudad: 'Ibagué', lugar: 'Bodega Picaleña', lat: 4.44, lng: -75.2 },
  { id: 'N-SMR', ciudad: 'Santa Marta', lugar: 'Almacén Gaira', lat: 11.24, lng: -74.2 },
  { id: 'N-PSO', ciudad: 'Pasto', lugar: 'Bodega Parque Industrial', lat: 1.21, lng: -77.28 },
  { id: 'N-MZL', ciudad: 'Manizales', lugar: 'Almacén Los Cedros', lat: 5.07, lng: -75.52 },
  { id: 'N-VVC', ciudad: 'Villavicencio', lugar: 'Bodega Anillo Vial', lat: 4.14, lng: -73.63 },
];

/** Los despachos salen de la planta/CEDI de Medellín o de los CEDI regionales. */
export const NODOS_ORIGEN: Nodo[] = NODOS.filter((n) => ['N-MDE', 'N-BOG', 'N-CLO', 'N-BAQ'].includes(n.id));

/** Indicativo telefónico fijo de cada ciudad (para los teléfonos de las sedes). */
export const INDICATIVO: Record<string, string> = {
  Medellín: '604', Bogotá: '601', Cali: '602', Barranquilla: '605', Bucaramanga: '607', Pereira: '606', Cartagena: '605',
  Cúcuta: '607', Ibagué: '608', 'Santa Marta': '605', Pasto: '602', Manizales: '606', Villavicencio: '608',
};

export const TRANSPORTADORES: Transportador[] = [
  { id: 'TR-01', nombre: 'Transportes Andina Carga', base: 'Medellín', flota: ['Tractomula', 'Doble troque', 'Sencillo'], cumplimiento: 96, conductor: 'Gustavo Londoño', telefono: '+57 310 555 0301', placa: 'SXK 482' },
  { id: 'TR-02', nombre: 'Logística Río Magdalena', base: 'Barrancabermeja', flota: ['Tractomula', 'Doble troque'], cumplimiento: 91, conductor: 'Edwin Martelo', telefono: '+57 311 555 0302', placa: 'TQB 915' },
  { id: 'TR-03', nombre: 'Fletes del Pacífico', base: 'Cali', flota: ['Sencillo', 'Turbo', 'Camioneta NHR'], cumplimiento: 94, conductor: 'Jhon Fredy Quiñones', telefono: '+57 312 555 0303', placa: 'WLM 207' },
  { id: 'TR-04', nombre: 'Cargas Express Capital', base: 'Bogotá', flota: ['Turbo', 'Sencillo', 'Camioneta NHR'], cumplimiento: 89, conductor: 'Wilson Peña', telefono: '+57 313 555 0304', placa: 'UDH 630' },
  { id: 'TR-05', nombre: 'Transurandina', base: 'Bucaramanga', flota: ['Tractomula', 'Sencillo'], cumplimiento: 92, conductor: 'Néstor Rueda', telefono: '+57 314 555 0305', placa: 'SOP 118' },
  { id: 'TR-06', nombre: 'Costa Atlántica Logística', base: 'Barranquilla', flota: ['Tractomula', 'Doble troque', 'Turbo'], cumplimiento: 87, conductor: 'Rafael Pertuz', telefono: '+57 315 555 0306', placa: 'TKR 744' },
  { id: 'TR-07', nombre: 'Eje Cafetero Transportes', base: 'Pereira', flota: ['Sencillo', 'Turbo', 'Camioneta NHR'], cumplimiento: 95, conductor: 'Óscar Duque', telefono: '+57 316 555 0307', placa: 'VHT 359' },
  { id: 'TR-08', nombre: 'Montecarga del Sur', base: 'Pasto', flota: ['Sencillo', 'Turbo'], cumplimiento: 90, conductor: 'Álvaro Chamorro', telefono: '+57 317 555 0308', placa: 'XNC 521' },
  { id: 'TR-09', nombre: 'Veloz Carga Oriente', base: 'Villavicencio', flota: ['Doble troque', 'Sencillo', 'Turbo'], cumplimiento: 85, conductor: 'Henry Ramírez', telefono: '+57 318 555 0309', placa: 'TZA 876' },
  { id: 'TR-10', nombre: 'Grupo Vial Antioquia', base: 'Medellín', flota: ['Tractomula', 'Sencillo', 'Turbo'], cumplimiento: 93, conductor: 'Fabián Zapata', telefono: '+57 319 555 0310', placa: 'SKN 063' },
];

/** Mercancías de línea blanca / cocción (genérico, sin marcas). */
export const MERCANCIAS: { tipo: string; descripcion: string; kgUnidad: number; m3Unidad: number }[] = [
  { tipo: 'Refrigeración', descripcion: 'Neveras no frost 300 L', kgUnidad: 68, m3Unidad: 0.62 },
  { tipo: 'Refrigeración', descripcion: 'Neveras 2 puertas 420 L', kgUnidad: 82, m3Unidad: 0.85 },
  { tipo: 'Refrigeración', descripcion: 'Congeladores horizontales', kgUnidad: 55, m3Unidad: 0.7 },
  { tipo: 'Lavado', descripcion: 'Lavadoras de carga superior 18 kg', kgUnidad: 52, m3Unidad: 0.48 },
  { tipo: 'Lavado', descripcion: 'Lavasecas 20 kg', kgUnidad: 71, m3Unidad: 0.6 },
  { tipo: 'Cocción', descripcion: 'Estufas a gas de 4 puestos', kgUnidad: 34, m3Unidad: 0.35 },
  { tipo: 'Cocción', descripcion: 'Estufas de empotrar', kgUnidad: 22, m3Unidad: 0.18 },
  { tipo: 'Cocción', descripcion: 'Hornos eléctricos de empotrar', kgUnidad: 28, m3Unidad: 0.2 },
  { tipo: 'Calentamiento de agua', descripcion: 'Calentadores de paso a gas', kgUnidad: 9, m3Unidad: 0.04 },
  { tipo: 'Campanas', descripcion: 'Campanas extractoras de pared', kgUnidad: 14, m3Unidad: 0.12 },
  { tipo: 'Pequeños electrodomésticos', descripcion: 'Licuadoras y freidoras (cajas master)', kgUnidad: 11, m3Unidad: 0.09 },
  { tipo: 'Repuestos', descripcion: 'Repuestos y accesorios para servicio técnico', kgUnidad: 6, m3Unidad: 0.03 },
];

export const REQUISITOS_ESPECIALES = [
  'Descargue con montacargas del cliente',
  'Cita previa en el muelle',
  'Ingreso con ARL y dotación completa',
  'Entrega en horario de recibo de 7:00 a 11:00',
  'Carga frágil: sin apilar más de dos niveles',
  'Sellos de seguridad en el contenedor',
  'Ayudante para descargue manual',
];

export const CONDICIONES_ENTREGA = [
  'Entrega en bodega del cliente, recibo con acta',
  'Entrega en punto de venta, descargue por el conductor',
  'Entrega en obra, con firma del residente',
  'Entrega en CEDI del cliente con cita',
];

export const DATOS_QUE_PUEDEN_FALTAR = [
  'Volumen de la carga',
  'Peso exacto',
  'Hora requerida de cargue',
  'Contacto de recibo en destino',
  'Requisitos de ingreso a la planta',
  'Tipo de vehículo requerido',
];

// --- Tarifas (parámetros de ejemplo) ------------------------------------------------

/** Tarifa por km, capacidad en kg y volumen útil en m³ de cada tipo de vehículo. */
export const KM_VEHICULO: Record<TipoVehiculo, { cop: number; kg: number; m3: number }> = {
  'Camioneta NHR': { cop: 3_800, kg: 1_800, m3: 12 },
  Turbo: { cop: 4_800, kg: 4_500, m3: 24 },
  Sencillo: { cop: 6_200, kg: 8_500, m3: 38 },
  'Doble troque': { cop: 7_800, kg: 17_000, m3: 58 },
  Tractomula: { cop: 9_400, kg: 32_000, m3: 85 },
};

const COSTA = new Set(['N-BAQ', 'N-CTG', 'N-SMR']);

export function distanciaKm(a: Nodo, b: Nodo): number {
  const R = 6371;
  const rad = (x: number) => (x * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  // Factor de sinuosidad: la carretera andina da más vueltas que la de la costa.
  const factor = COSTA.has(a.id) || COSTA.has(b.id) ? 1.4 : 1.7;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)) * factor);
}

export function tarifaReferencia(vehiculo: TipoVehiculo, km: number): number {
  const base = KM_VEHICULO[vehiculo].cop * km + 380_000;
  return Math.round(base / 10_000) * 10_000;
}

/** Tope autorizado: referencia + 8 % (POL-NEG-01 · G-TARIFA). SUPUESTO. */
export function tarifaTope(referencia: number): number {
  return Math.round((referencia * 1.08) / 10_000) * 10_000;
}

export function vehiculoPara(pesoKg: number, volumenM3 = 0, km = 0): TipoVehiculo {
  const orden: TipoVehiculo[] = ['Camioneta NHR', 'Turbo', 'Sencillo', 'Doble troque', 'Tractomula'];
  // En troncales largas no se contrata una camioneta de 1,8 t.
  const desde = km > 400 ? 1 : 0;
  for (const v of orden.slice(desde)) {
    if (KM_VEHICULO[v].kg >= pesoKg && KM_VEHICULO[v].m3 >= volumenM3) return v;
  }
  return 'Tractomula';
}

// --- Generación de operaciones ------------------------------------------------------------

let contadorOperaciones = 0;
export function reiniciarContador(n = 0): void {
  contadorOperaciones = n;
}
export function siguienteSeq(): number {
  contadorOperaciones += 1;
  return contadorOperaciones;
}
export const idOperacion = (seq: number): string => `OP-${String(seq).padStart(4, '0')}`;

export function generarMercancia(rng: Rng): Mercancia {
  const m = elegir(rng, MERCANCIAS);
  // Un despacho cabe en la mayor capacidad (tractomula): 85 m³ y 30 t.
  const tope = Math.max(6, Math.min(Math.floor(80 / m.m3Unidad), Math.floor(30_000 / m.kgUnidad)));
  const unidades = Math.min(entre(rng, 12, 110), tope);
  return {
    tipo: m.tipo,
    descripcion: m.descripcion,
    unidades,
    pesoKg: Math.round(unidades * m.kgUnidad),
    volumenM3: Math.round(unidades * m.m3Unidad * 10) / 10,
  };
}

/** Crea una operación recién recibida por alguno de los 4 canales. */
export function generarOperacion(ts: number, rng: Rng, seq = siguienteSeq()): Operacion {
  const canal = elegir(rng, ['llamada_ia', 'llamada_ia', 'formulario', 'formulario', 'integracion', 'coordinador'] as Canal[]);
  const cliente = elegir(rng, CLIENTES);
  const nodoOrigen = elegir(rng, NODOS_ORIGEN);
  const nodoDestino = elegir(rng, NODOS.filter((n) => n.id !== nodoOrigen.id));
  const mercancia = generarMercancia(rng);
  const km = distanciaKm(nodoOrigen, nodoDestino);
  const vehiculo = vehiculoPara(mercancia.pesoKg, mercancia.volumenM3, km);
  const ref = tarifaReferencia(vehiculo, km);
  const diaCargue = new Date(ts + entre(rng, 1, 3) * 86_400_000);
  while (esNoHabil(diaCargue)) diaCargue.setDate(diaCargue.getDate() + 1);
  diaCargue.setHours(7 + entre(rng, 0, 7), entre(rng, 0, 1) * 30, 0, 0);
  const fechaCargue = diaCargue.getTime();
  const llamada = canal === 'llamada_ia';
  const faltan = llamada && rng() < 0.3 ? mezclar(rng, DATOS_QUE_PUEDEN_FALTAR).slice(0, entre(rng, 1, 2)) : [];
  return {
    id: idOperacion(seq),
    seq,
    canal,
    origen: 'simulacion',
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
    etapa: 'Solicitud',
    etapaRetorno: null,
    bloque: 'Solicitud',
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
    fechaCierre: null,
  };
}

// --- Catálogo de excepciones ---------------------------------------------------------------

type ConstruidaExcepcion = Pick<Excepcion, 'titulo' | 'causa' | 'impacto' | 'evidencia' | 'alternativas' | 'recomendada'>;

export interface PlantillaExcepcion {
  tipo: TipoExcepcion;
  nombre: string;
  categoriaBase: CategoriaDecision;
  /** Etapas del flujo donde puede ocurrir. */
  etapas: EtapaFlujo[];
  /** Probabilidad relativa (por avance en una de sus etapas). */
  peso: number;
  politica: string;
  regla: string;
  agente: AgenteIA;
  /** Qué ocurre si la persona rechaza la propuesta del agente. */
  rechazo: EfectoAlternativa;
  /** Anticipación típica de la detección, en minutos. */
  anticipacion: [number, number];
  /** Categoría final puede depender de la operación (p. ej. el 3.er intento sin respuesta). */
  categoria?: (op: Operacion) => CategoriaDecision;
  construir: (op: Operacion, rng: Rng) => ConstruidaExcepcion;
}

const cop = (v: number) => `$ ${new Intl.NumberFormat('es-CO').format(Math.round(v))}`;
const alt = (
  id: Alternativa['id'],
  titulo: string,
  descripcion: string,
  impactoCosto: number,
  impactoHoras: number,
  impactoSLA: NivelSLA,
  reglas: string[],
  efecto: EfectoAlternativa = { tipo: 'continuar' },
): Alternativa => ({ id, titulo, descripcion, impactoCosto, impactoHoras, impactoSLA, reglas, efecto });
const ruta = (op: Operacion) => `${op.nodoOrigen.ciudad} → ${op.nodoDestino.ciudad}`;

export const PLANTILLA_EXCEPCION: Record<TipoExcepcion, PlantillaExcepcion> = {
  Datos_incompletos: {
    tipo: 'Datos_incompletos',
    nombre: 'Datos incompletos o inconsistentes',
    categoriaBase: 'automatico',
    etapas: ['Validacion'],
    peso: 3,
    politica: 'POL-VAL-01',
    regla: 'R01',
    agente: 'Agente de cliente',
    rechazo: { tipo: 'continuar' },
    anticipacion: [240, 960],
    construir: (op, rng) => {
      const faltan = op.datosPendientes.length > 0 ? op.datosPendientes : [elegir(rng, DATOS_QUE_PUEDEN_FALTAR)];
      return {
        titulo: `Solicitud ${op.id} con datos por completar`,
        causa: `El cliente no tenía a la mano: ${faltan.join(', ').toLowerCase()}.`,
        impacto: 'No se puede registrar la operación ni buscar transportador hasta completar la información.',
        evidencia: [`Datos confirmados: ${ruta(op)}, ${op.mercancia.descripcion}`, `Faltan: ${faltan.join(' · ')}`, 'El agente registró lo confirmado y programó una gestión posterior (R02).'],
        alternativas: [
          alt('A', 'Llamar de nuevo al contacto autorizado', 'El agente de cliente vuelve a llamar en la ventana acordada y completa los datos.', 0, 2, 'bajo', ['R01', 'R02']),
          alt('B', 'Enviar el formulario de datos faltantes', 'El cliente completa lo pendiente por el formulario.', 0, 4, 'medio', ['R01']),
          alt('C', 'El coordinador completa con el cliente', 'Una persona contacta al solicitante.', 0, 3, 'bajo', ['R01']),
        ],
        recomendada: 'A',
      };
    },
  },
  Sin_respuesta: {
    tipo: 'Sin_respuesta',
    nombre: 'Contacto no exitoso',
    categoriaBase: 'automatico',
    etapas: ['Confirmacion', 'Preventiva', 'Presentacion', 'Transito', 'AvisoDestino', 'LlamadaCierre'],
    peso: 2.5,
    politica: 'POL-CON-02',
    regla: 'R29',
    agente: 'Agente de seguimiento',
    rechazo: { tipo: 'continuar' },
    anticipacion: [60, 240],
    categoria: (op) => (op.intentosContacto >= 2 ? 'asistido' : 'automatico'),
    construir: (op) => ({
      titulo: `Sin respuesta del contacto · intento ${op.intentosContacto + 1}`,
      causa: 'El interlocutor no contestó la llamada programada.',
      impacto: op.intentosContacto >= 2 ? 'La falta de respuesta puede afectar el servicio: se alerta al coordinador (R29).' : 'Se registra el intento y se reprograma según la importancia de la actividad.',
      evidencia: [`Intentos acumulados: ${op.intentosContacto + 1}`, 'Intento registrado en la agenda centralizada (R26).'],
      alternativas: [
        alt('A', 'Reintentar en 30 minutos', 'Nuevo contacto programado por el mismo agente.', 0, 0.5, 'bajo', ['R29']),
        alt('B', 'Llamar a un contacto alterno autorizado', 'Se usa el segundo contacto registrado en la operación.', 0, 0.3, 'bajo', ['R29', 'R20']),
        alt('C', 'Alertar al coordinador', 'Intervención humana directa.', 0, 0.5, 'bajo', ['R29']),
      ],
      recomendada: op.intentosContacto >= 2 ? 'C' : 'A',
    }),
  },
  Tarifa_sobre_tope: {
    tipo: 'Tarifa_sobre_tope',
    nombre: 'Tarifa solicitada sobre el límite',
    categoriaBase: 'humano',
    etapas: ['Negociacion'],
    peso: 4,
    politica: 'POL-NEG-01',
    regla: 'R07',
    agente: 'Agente de negociación',
    rechazo: { tipo: 'volver', etapa: 'Busqueda' },
    anticipacion: [30, 120],
    construir: (op, rng) => {
      const pide = op.ofertas.find((o) => o.estado === 'sobre_tope')?.tarifaSolicitada ?? Math.round((op.tarifaMaxima * (1 + entre(rng, 6, 18) / 100)) / 10_000) * 10_000;
      const dif = pide - op.tarifaMaxima;
      return {
        titulo: `Tarifa solicitada supera el tope en ${cop(dif)}`,
        causa: `El transportador pidió ${cop(pide)} para ${ruta(op)}; el máximo autorizado es ${cop(op.tarifaMaxima)}.`,
        impacto: 'El agente no puede comprometer valores adicionales: la decisión es del responsable (R07, R08).',
        evidencia: [`Tope autorizado: ${cop(op.tarifaMaxima)}`, `Contrapropuesta recibida: ${cop(pide)}`, 'Dos rondas de negociación agotadas (G-CONTRA)', `Vehículo: ${op.vehiculoRequerido} · ${op.distanciaKm} km`],
        alternativas: [
          alt('A', 'Mantener el tope y llamar al siguiente candidato', 'Se descarta al transportador y se continúa la negociación.', 0, 3, 'medio', ['R06', 'R07'], { tipo: 'volver', etapa: 'Busqueda' }),
          alt('B', `Autorizar la tarifa solicitada (${cop(pide)})`, 'Se aprueba el sobrecosto y se registra la autorización.', dif, 0, 'ninguno', ['R08', 'R28']),
          alt('C', 'Autorizar un punto medio', 'Se contrapropone a mitad de camino y se confirma con el transportador.', Math.round(dif / 2), 1, 'bajo', ['R08']),
        ],
        recomendada: 'A',
      };
    },
  },
  Sin_transportador: {
    tipo: 'Sin_transportador',
    nombre: 'Sin transportadores o mercado sobre lo previsto',
    categoriaBase: 'humano',
    etapas: ['Busqueda', 'Negociacion'],
    peso: 1.6,
    politica: 'POL-AUT-01',
    regla: 'R08',
    agente: 'Agente de negociación',
    rechazo: { tipo: 'cancelar' },
    anticipacion: [180, 600],
    construir: (op, rng) => {
      const sobre = Math.round((op.tarifaMaxima * entre(rng, 15, 30)) / 100 / 10_000) * 10_000;
      return {
        titulo: `Sin vehículo disponible para ${ruta(op)}`,
        causa: 'Ningún candidato aceptó dentro de los valores previstos o no hay transportadores disponibles para la fecha.',
        impacto: 'Se activa coordinación con el cliente: cualquier cambio de fecha, tipo de vehículo o valor requiere autorización (R08).',
        evidencia: [`Candidatos consultados: ${entre(rng, 4, 7)}`, `Tope autorizado: ${cop(op.tarifaMaxima)}`, `Mercado hoy: ${cop(op.tarifaMaxima + sobre)}`, `Fecha de cargue solicitada: ${new Date(op.fechaCargue).toLocaleDateString('es-CO')}`],
        alternativas: [
          alt('A', 'Consultar flexibilidad de fecha u horario al cliente', 'El agente de cliente llama para ofrecer alternativas de cargue.', 0, 12, 'medio', ['R08', 'R19'], { tipo: 'volver', etapa: 'Busqueda' }),
          alt('B', 'Autorizar tarifa de mercado', 'El responsable aprueba el valor superior al previsto.', sobre, 0, 'ninguno', ['R08', 'R28'], { tipo: 'volver', etapa: 'Negociacion' }),
          alt('C', 'Cambiar el tipo de vehículo', 'Dos vehículos menores o uno de mayor capacidad, con aval del cliente.', Math.round(sobre * 0.6), 6, 'bajo', ['R08'], { tipo: 'volver', etapa: 'Busqueda' }),
          alt('D', 'Cancelar el servicio', 'Se informa al cliente y se cierra la solicitud.', 0, 0, 'alto', ['R28'], { tipo: 'cancelar' }),
        ],
        recomendada: 'A',
      };
    },
  },
  Seleccion_manual: {
    tipo: 'Seleccion_manual',
    nombre: 'Selección por el coordinador',
    categoriaBase: 'asistido',
    etapas: ['Seleccion'],
    peso: 0,
    politica: 'POL-SEL-01',
    regla: 'R09',
    agente: 'Agente de negociación',
    rechazo: { tipo: 'volver', etapa: 'Busqueda' },
    anticipacion: [60, 180],
    construir: (op) => {
      const ordenadas = [...op.ofertas].sort((a, b) => (a.tarifaFinal ?? a.tarifaOfrecida) - (b.tarifaFinal ?? b.tarifaOfrecida));
      const barata = ordenadas[0];
      const cumplidora = [...op.ofertas].sort((a, b) => b.cumplimiento - a.cumplimiento)[0];
      const compatible = [...op.ofertas].sort((a, b) => b.compatibilidad - a.compatibilidad)[0];
      const t = (o: typeof barata) => o.tarifaFinal ?? o.tarifaOfrecida;
      return {
        titulo: `${op.ofertas.length} ofertas para consolidar`,
        causa: 'La plataforma consolidó las ofertas; la selección automática está desactivada o no se cumplen todos los requisitos.',
        impacto: 'El coordinador revisa las alternativas y selecciona la más conveniente (R09).',
        evidencia: op.ofertas.map((o) => `${o.nombre} · ${cop(t(o))} · cumplimiento ${o.cumplimiento} % · compatibilidad ${o.compatibilidad} %`),
        alternativas: [
          alt('A', `Menor tarifa · ${barata.nombre}`, `Tarifa ${cop(t(barata))}.`, t(barata) - t(ordenadas[ordenadas.length - 1]), 0, 'ninguno', ['R09']),
          alt('B', `Mayor cumplimiento · ${cumplidora.nombre}`, `Cumplimiento histórico ${cumplidora.cumplimiento} %.`, t(cumplidora) - t(barata), 0, 'ninguno', ['R09', 'R05']),
          (compatible.transportadorId !== barata.transportadorId || ordenadas.length < 2)
            ? alt('C', `Mayor compatibilidad · ${compatible.nombre}`, `Compatibilidad ${compatible.compatibilidad} % con el servicio.`, t(compatible) - t(barata), 0, 'ninguno', ['R09', 'R05'])
            : alt('C', `Segunda mejor tarifa · ${ordenadas[1].nombre}`, `Tarifa ${cop(t(ordenadas[1]))}.`, t(ordenadas[1]) - t(barata), 0, 'ninguno', ['R09', 'R05']),
        ],
        recomendada: 'A',
      };
    },
  },
  Mercancia_no_lista: {
    tipo: 'Mercancia_no_lista',
    nombre: 'Mercancía no estará lista',
    categoriaBase: 'asistido',
    etapas: ['Preventiva'],
    peso: 3.2,
    politica: 'POL-PRE-01',
    regla: 'R13',
    agente: 'Agente de seguimiento',
    rechazo: { tipo: 'continuar' },
    anticipacion: [360, 1_200],
    construir: (op, rng) => {
      const h = entre(rng, 3, 8);
      return {
        titulo: `Mercancía lista con ${h} h de retraso`,
        causa: `El cliente informó en la llamada preventiva que ${op.mercancia.descripcion.toLowerCase()} no estará lista a la hora acordada.`,
        impacto: 'Impacto sobre el transportador asignado y sobre la promesa de entrega; la reprogramación debe estar autorizada (R13).',
        evidencia: [`Nuevo tiempo estimado informado: +${h} h (estimación, no confirmada)`, `Cargue original: ${new Date(op.fechaCargue).toLocaleString('es-CO')}`, `Transportador: ${op.transportador?.nombre ?? 'por asignar'}`],
        alternativas: [
          alt('A', `Reprogramar el cargue +${h} h`, 'Se autoriza la reprogramación y el agente avisa al transportador.', 120_000, h, 'medio', ['R13', 'R14'], { tipo: 'volver', etapa: 'Confirmacion' }),
          alt('B', 'Mantener la hora y cargar parcial', 'Se carga lo disponible y el resto en un segundo viaje.', 380_000, 0, 'bajo', ['R13']),
          alt('C', 'Reprogramar al día siguiente', 'Nueva cita con el transportador y el cliente.', 240_000, 24, 'alto', ['R13'], { tipo: 'volver', etapa: 'Confirmacion' }),
        ],
        recomendada: 'A',
      };
    },
  },
  Retraso_transportador: {
    tipo: 'Retraso_transportador',
    nombre: 'Transportador con dificultad de horario',
    categoriaBase: 'asistido',
    etapas: ['Preventiva', 'Presentacion'],
    peso: 3,
    politica: 'POL-AUT-01',
    regla: 'R14',
    agente: 'Agente de seguimiento',
    rechazo: { tipo: 'volver', etapa: 'Busqueda' },
    anticipacion: [120, 480],
    construir: (op, rng) => {
      const h = entre(rng, 2, 5);
      return {
        titulo: `Transportador llegaría ${h} h tarde`,
        causa: `${op.transportador?.nombre ?? 'El transportador'} informa que no alcanza el horario del cargue.`,
        impacto: 'Se consulta al cliente si hay margen de espera, sin confirmar cambios definitivos (R14).',
        evidencia: [`ETA reportada: +${h} h`, `Conductor: ${op.transportador?.conductor ?? '—'}`, `Punto de cargue: ${op.nodoOrigen.lugar}`],
        alternativas: [
          alt('A', 'El cliente recibe el vehículo más tarde', 'El cliente confirma margen de espera; se autoriza el nuevo horario.', 0, h, 'bajo', ['R14', 'R19']),
          alt('B', 'Reasignar a otro transportador', 'Se reabre la búsqueda con prioridad.', 180_000, 6, 'medio', ['R14', 'R05'], { tipo: 'volver', etapa: 'Busqueda' }),
          alt('C', 'Reprogramar el cargue', 'Nueva fecha con ambas partes.', 100_000, 12, 'alto', ['R14'], { tipo: 'volver', etapa: 'Confirmacion' }),
        ],
        recomendada: 'A',
      };
    },
  },
  Diferencia_llegada: {
    tipo: 'Diferencia_llegada',
    nombre: 'Diferencia entre lo reportado y lo observado en origen',
    categoriaBase: 'asistido',
    etapas: ['Presentacion'],
    peso: 2,
    politica: 'POL-CRU-01',
    regla: 'R15',
    agente: 'Agente de seguimiento',
    rechazo: { tipo: 'continuar' },
    anticipacion: [10, 40],
    construir: (op) => ({
      titulo: 'El transportador dice haber llegado; el cliente no lo ve',
      causa: `${op.transportador?.nombre ?? 'El transportador'} reportó presentación en ${op.nodoOrigen.lugar} pero el contacto del cliente no tiene el vehículo en las instalaciones.`,
      impacto: 'La validación cruzada detectó la diferencia antes de iniciar el cargue (R15).',
      evidencia: ['Reporte del transportador: llegada confirmada', `Contacto del cliente: ${op.cliente.contacto} indica que no está en portería`, `Placa reportada: ${op.transportador?.placa ?? '—'}`],
      alternativas: [
        alt('A', 'Pedir ubicación y foto al transportador', 'El agente solicita evidencia de su posición.', 0, 0.5, 'bajo', ['R15']),
        alt('B', 'El coordinador contacta a portería', 'Confirmación directa con el punto de cargue.', 0, 0.7, 'bajo', ['R15']),
        alt('C', 'Reasignar el vehículo', 'Se descarta al transportador por incumplimiento.', 250_000, 8, 'alto', ['R15'], { tipo: 'volver', etapa: 'Busqueda' }),
      ],
      recomendada: 'A',
    }),
  },
  Espera_en_cargue: {
    tipo: 'Espera_en_cargue',
    nombre: 'Vehículo esperando en el punto de cargue',
    categoriaBase: 'asistido',
    etapas: ['Presentacion', 'Cargue'],
    peso: 3.4,
    politica: 'POL-ESP-01',
    regla: 'R16',
    agente: 'Agente de seguimiento',
    rechazo: { tipo: 'continuar' },
    anticipacion: [0, 30],
    construir: (op, rng) => {
      const causa = elegir(rng, ['la mercancía no está disponible', 'hay congestión en el punto de cargue', 'falta un documento del despacho']);
      const min = entre(rng, 95, 190);
      return {
        titulo: `Vehículo espera ${min} min por cargue`,
        causa: `El vehículo está esperando porque ${causa}.`,
        impacto: 'La espera supera el parámetro de 90 minutos: se notifica al coordinador (R16).',
        evidencia: [`Espera acumulada: ${min} min`, `Tiempo estimado de solución informado por ${op.cliente.contacto}: 40 min (estimación)`, `Punto: ${op.nodoOrigen.lugar}`],
        alternativas: [
          alt('A', 'Esperar y registrar el tiempo', 'Se continúa con seguimiento; el costo de espera se liquida luego.', 90_000, 0.7, 'bajo', ['R16', 'R25']),
          alt('B', 'Reprogramar el cargue', 'El vehículo se retira y vuelve en nueva ventana.', 180_000, 10, 'alto', ['R16'], { tipo: 'volver', etapa: 'Confirmacion' }),
          alt('C', 'Autorizar cargue parcial', 'Se despacha lo listo.', 150_000, 0, 'medio', ['R16', 'R17']),
        ],
        recomendada: 'A',
      };
    },
  },
  Diferencia_despacho: {
    tipo: 'Diferencia_despacho',
    nombre: 'Diferencias en cantidades, carga, documentos o instrucciones',
    categoriaBase: 'asistido',
    etapas: ['Cargue'],
    peso: 2.4,
    politica: 'POL-DES-01',
    regla: 'R17',
    agente: 'Agente de seguimiento',
    rechazo: { tipo: 'continuar' },
    anticipacion: [5, 30],
    construir: (op, rng) => {
      const faltan = entre(rng, 2, 9);
      return {
        titulo: `Diferencia de ${faltan} unidades en el despacho`,
        causa: `El conductor cargó ${op.mercancia.unidades - faltan} unidades; la solicitud decía ${op.mercancia.unidades}.`,
        impacto: 'La diferencia debe quedar registrada y validada antes de continuar (R17).',
        evidencia: [`Solicitud: ${op.mercancia.unidades} und`, `Cargadas: ${op.mercancia.unidades - faltan} und`, 'Remisión sin firmar por el cliente'],
        alternativas: [
          alt('A', 'Aceptar el despacho con la novedad registrada', 'Sigue el recorrido y se concilia en la entrega.', 0, 0, 'bajo', ['R17']),
          alt('B', 'Solicitar corrección documental', 'El cliente ajusta la remisión antes de salir.', 0, 1, 'bajo', ['R17']),
          alt('C', 'Detener el despacho y revisar', 'Se cuenta de nuevo en presencia de ambas partes.', 60_000, 2, 'medio', ['R17'], { tipo: 'volver', etapa: 'Cargue' }),
        ],
        recomendada: 'B',
      };
    },
  },
  Novedad_en_ruta: {
    tipo: 'Novedad_en_ruta',
    nombre: 'Demora, cierre vial o avería en ruta',
    categoriaBase: 'asistido',
    etapas: ['Transito'],
    peso: 5,
    politica: 'POL-COM-01',
    regla: 'R19',
    agente: 'Agente de seguimiento',
    rechazo: { tipo: 'continuar' },
    anticipacion: [90, 420],
    construir: (op, rng) => {
      const tipo = elegir(rng, [
        { n: 'cierre vial por derrumbe', h: 4 },
        { n: 'avería mecánica', h: 6 },
        { n: 'accidente en la vía', h: 3 },
        { n: 'manifestación en el corredor', h: 5 },
      ]);
      return {
        titulo: `Novedad en ruta: ${tipo.n}`,
        causa: `${op.transportador?.nombre ?? 'El transportador'} reporta ${tipo.n} en el trayecto ${ruta(op)}.`,
        impacto: `Afecta la entrega comprometida: retraso estimado de ${tipo.h} h (estimación, aún no confirmada).`,
        evidencia: [`Ubicación reportada por el conductor`, `Hora estimada de llegada original vs. nueva: +${tipo.h} h (estimada)`, 'Novedad clasificada y registrada (R19)'],
        alternativas: [
          alt('A', 'Informar al cliente la nueva ETA como estimación', 'Llamada informativa; no se promete hora hasta validarla.', 0, tipo.h, 'medio', ['R19']),
          alt('B', 'Autorizar ruta alterna', 'Mayor recorrido y peajes.', 220_000, tipo.h / 2, 'bajo', ['R19', 'R08']),
          alt('C', 'Trasbordar a otro vehículo', 'Se envía un vehículo de apoyo.', 480_000, tipo.h / 3, 'bajo', ['R19', 'R08']),
        ],
        recomendada: 'A',
      };
    },
  },
  Conductor_ocupado: {
    tipo: 'Conductor_ocupado',
    nombre: 'Conductor conduciendo',
    categoriaBase: 'automatico',
    etapas: ['Transito'],
    peso: 5.5,
    politica: 'POL-SEG-01',
    regla: 'R18',
    agente: 'Agente de seguimiento',
    rechazo: { tipo: 'continuar' },
    anticipacion: [0, 0],
    construir: (op) => ({
      titulo: 'Conductor atendió la llamada mientras conducía',
      causa: `${op.transportador?.conductor ?? 'El conductor'} indicó que va conduciendo.`,
      impacto: 'Se finaliza el contacto y se programa para un momento seguro (R18).',
      evidencia: ['Verificación de condiciones seguras: no cumple', 'Llamada cerrada en < 10 s'],
      alternativas: [
        alt('A', 'Reprogramar la llamada en 20 minutos', 'Nuevo contacto en un momento seguro.', 0, 0.3, 'ninguno', ['R18']),
        alt('B', 'Consultar ubicación por la integración externa', 'Sin llamar al conductor.', 0, 0, 'ninguno', ['R18']),
      ],
      recomendada: 'A',
    }),
  },
  Destinatario_no_recibe: {
    tipo: 'Destinatario_no_recibe',
    nombre: 'Destinatario no puede recibir en el horario',
    categoriaBase: 'humano',
    etapas: ['AvisoDestino'],
    peso: 3,
    politica: 'POL-AUT-01',
    regla: 'R22',
    agente: 'Agente de cliente',
    rechazo: { tipo: 'continuar' },
    anticipacion: [60, 300],
    construir: (op, rng) => {
      const h = entre(rng, 2, 6);
      return {
        titulo: `Destinatario no recibe hasta dentro de ${h} h`,
        causa: `${op.cliente.contacto} informa que las instalaciones de ${op.nodoDestino.ciudad} no pueden recibir en el horario previsto.`,
        impacto: 'Hay que coordinar con el transportador y el responsable logístico; los cambios siguen las autorizaciones (R22).',
        evidencia: [`Horario de recibo: ${op.condicionesEntrega}`, `Nueva ventana ofrecida: +${h} h (estimación)`, `Vehículo en tránsito: ${op.transportador?.placa ?? '—'}`],
        alternativas: [
          alt('A', 'Reprogramar la entrega en la nueva ventana', 'El transportador espera o reprograma el descargue.', 130_000, h, 'medio', ['R22', 'R08']),
          alt('B', 'Entregar en otro punto autorizado', 'Cambio de destino aprobado por el responsable.', 260_000, 2, 'medio', ['R22', 'R08']),
          alt('C', 'Mantener el horario y presionar la recepción', 'El coordinador gestiona con el destinatario.', 0, 0, 'alto', ['R22']),
        ],
        recomendada: 'A',
      };
    },
  },
  Demora_en_descargue: {
    tipo: 'Demora_en_descargue',
    nombre: 'Filas, demoras, acceso o problemas documentales en destino',
    categoriaBase: 'asistido',
    etapas: ['Descargue'],
    peso: 3.4,
    politica: 'POL-ESP-01',
    regla: 'R16',
    agente: 'Agente de seguimiento',
    rechazo: { tipo: 'continuar' },
    anticipacion: [0, 45],
    construir: (op, rng) => {
      const causa = elegir(rng, ['una fila de vehículos en el muelle', 'dificultad de acceso a la bodega', 'un problema documental con la orden de compra']);
      return {
        titulo: `Demora en destino por ${causa}`,
        causa: `El vehículo no ha podido descargar en ${op.nodoDestino.lugar}: ${causa}.`,
        impacto: 'Se identifica la causa y el posible impacto; se notifica si supera los parámetros (R16).',
        evidencia: [`Espera en destino: ${entre(rng, 70, 160)} min`, `Receptor: ${op.cliente.contacto}`],
        alternativas: [
          alt('A', 'Esperar turno y registrar el tiempo', 'Seguimiento hasta confirmar recepción.', 70_000, 1, 'bajo', ['R16']),
          alt('B', 'Pedir turno prioritario al destinatario', 'El agente de cliente gestiona el turno.', 0, 0.5, 'ninguno', ['R16', 'R21']),
          alt('C', 'Informar al responsable el costo de espera', 'Se deja constancia para la liquidación.', 120_000, 1.5, 'medio', ['R16', 'R25']),
        ],
        recomendada: 'B',
      };
    },
  },
  Diferencia_entrega: {
    tipo: 'Diferencia_entrega',
    nombre: 'Entrega informada ≠ entrega confirmada',
    categoriaBase: 'asistido',
    etapas: ['ValidacionEntrega'],
    peso: 4,
    politica: 'POL-CIE-01',
    regla: 'R23',
    agente: 'Agente de cliente',
    rechazo: { tipo: 'continuar' },
    anticipacion: [5, 25],
    construir: (op, rng) => {
      const f = entre(rng, 2, 9);
      const dif = elegir(rng, [`recibió ${op.mercancia.unidades - f} de ${op.mercancia.unidades} unidades`, `hay ${f} cajas con daño visible`, 'la remisión no coincide con lo recibido']);
      return {
        titulo: 'Transportador y cliente no coinciden sobre la entrega',
        causa: `El transportador informa entrega completa; el destinatario indica que ${dif}.`,
        impacto: 'El sistema no cierra automáticamente: el coordinador revisa los hechos y solicita evidencias (R23).',
        evidencia: ['Reporte del transportador: entrega completa', `Reporte del cliente: ${dif}`, 'Soportes de entrega pendientes'],
        alternativas: [
          alt('A', 'Solicitar evidencias a ambas partes', 'Fotos, remisión firmada y registro de descargue.', 0, 4, 'bajo', ['R23']),
          alt('B', 'Revisión conjunta con cliente y transportador', 'Llamada tripartita liderada por el coordinador.', 0, 6, 'medio', ['R23']),
          alt('C', 'Abrir reclamación formal', 'Se registra una reclamación y se suspende la liquidación.', 0, 24, 'alto', ['R23', 'R25']),
        ],
        recomendada: 'A',
      };
    },
  },
  Inconformidad_cliente: {
    tipo: 'Inconformidad_cliente',
    nombre: 'Inconformidad del cliente',
    categoriaBase: 'asistido',
    etapas: ['LlamadaCierre'],
    peso: 3.2,
    politica: 'POL-CIE-02',
    regla: 'R24',
    agente: 'Agente de cliente',
    rechazo: { tipo: 'continuar' },
    anticipacion: [0, 20],
    construir: (op, rng) => {
      const motivo = elegir(rng, ['la hora de llegada fue distinta a la acordada', 'el conductor no usó la dotación exigida', 'no recibió avisos durante el recorrido']);
      return {
        titulo: 'Inconformidad manifestada en la llamada de cierre',
        causa: `${op.cliente.contacto} manifiesta que ${motivo}.`,
        impacto: 'No puede quedar como un comentario: se convierte en caso de seguimiento (R24).',
        evidencia: [`Calificación del servicio: ${entre(rng, 2, 3)}/5`, `Observación: ${motivo}`],
        alternativas: [
          alt('A', 'Crear caso de seguimiento y asignar responsable', 'Se registra el caso con plazo de respuesta.', 0, 0, 'bajo', ['R24']),
          alt('B', 'Ofrecer una compensación comercial', 'Requiere autorización del responsable.', 150_000, 0, 'ninguno', ['R24', 'R08']),
          alt('C', 'Escalar al responsable comercial del cliente', 'Contacto directo del responsable.', 0, 2, 'medio', ['R24']),
        ],
        recomendada: 'A',
      };
    },
  },
  Sobrecosto_liquidacion: {
    tipo: 'Sobrecosto_liquidacion',
    nombre: 'Costos adicionales o novedades que afectan la liquidación',
    categoriaBase: 'humano',
    etapas: ['CierreAdmin'],
    peso: 4,
    politica: 'POL-CIE-01',
    regla: 'R25',
    agente: 'Agente de cliente',
    rechazo: { tipo: 'continuar' },
    anticipacion: [0, 60],
    construir: (op, rng) => {
      const extra = entre(rng, 2, 7) * 50_000;
      return {
        titulo: `Costos adicionales por ${cop(extra)} sin autorización`,
        causa: 'El transportador presenta costos adicionales (esperas, ruta alterna) que no tienen una autorización registrada.',
        impacto: 'Solo se cierra después de validar las condiciones económicas, costos adicionales y novedades (R25).',
        evidencia: [`Tarifa pactada: ${cop(op.tarifaPactada ?? op.tarifaMaxima)}`, `Costos adicionales solicitados: ${cop(extra)}`, `Costos autorizados a la fecha: ${cop(op.costosAdicionales)}`],
        alternativas: [
          alt('A', 'Autorizar el sobrecosto', 'Se registra la autorización y se liquida.', extra, 0, 'ninguno', ['R25', 'R28']),
          alt('B', 'Autorizar parcialmente', 'Se reconoce solo lo soportado.', Math.round(extra / 2), 0, 'ninguno', ['R25', 'R28']),
          alt('C', 'Rechazar y reclamar soportes', 'No se reconoce sin soporte.', 0, 24, 'bajo', ['R25']),
        ],
        recomendada: 'B',
      };
    },
  },
};

export const TIPOS_EXCEPCION = Object.keys(PLANTILLA_EXCEPCION) as TipoExcepcion[];
export const EXCEPCION_LABEL: Record<TipoExcepcion, string> = Object.fromEntries(
  TIPOS_EXCEPCION.map((t) => [t, PLANTILLA_EXCEPCION[t].nombre]),
) as Record<TipoExcepcion, string>;

// --- Ofertas de transportadores ------------------------------------------------------------------

export function construirOfertas(op: Operacion, rng: Rng) {
  const ref = op.tarifaMaxima / 1.08;
  const candidatos = mezclar(rng, TRANSPORTADORES.filter((t) => t.flota.includes(op.vehiculoRequerido))).slice(0, entre(rng, 3, 4));
  return candidatos.map((t) => {
    // Haceb ofrece un solo flete por viaje; el transportador puede pedir hasta 8 % más.
    const ofrecida = Math.round((ref * 0.94) / 10_000) * 10_000;
    const pide = Math.round((ofrecida * (1 + entre(rng, 0, 8) / 100)) / 10_000) * 10_000;
    return {
      transportadorId: t.id,
      nombre: t.nombre,
      vehiculo: op.vehiculoRequerido,
      compatibilidad: entre(rng, 72, 98),
      cumplimiento: t.cumplimiento,
      tarifaOfrecida: ofrecida,
      tarifaSolicitada: pide,
      tarifaFinal: null as number | null,
      estado: 'aceptada_preliminar' as const,
    };
  });
}

// --- KPIs ---------------------------------------------------------------------------------------------

const prom = (a: number[]): number => (a.length === 0 ? 0 : a.reduce((s, x) => s + x, 0) / a.length);

export function calcularKPIs(ops: Operacion[], ahora: number): MetricaKPI {
  const activas = ops.filter((o) => !esTerminal(o.etapa));
  const cerradas = ops.filter((o) => o.etapa === 'Cerrada');
  const llamadas = ops.flatMap((o) => o.llamadas);
  const resp = (quien: 'cliente' | 'transportador') =>
    prom(llamadas.filter((l) => l.interlocutor === quien && l.respuestaMin !== null).map((l) => l.respuestaMin as number));
  const exitosas = llamadas.filter((l) => l.resultado === 'exitosa').length;
  const confirmaciones = llamadas.filter((l) => ['Informar asignación', 'Confirmar con transportador', 'Llamada preventiva', 'Validar presentación', 'Confirmar despacho', 'Confirmar recepción', 'Validar entrega'].includes(l.objetivo));
  const confAuto = confirmaciones.filter((l) => l.resultado === 'exitosa').length;
  const conNegociacion = ops.filter((o) => o.ofertas.length > 0);
  const negociadas = conNegociacion.filter((o) => o.ofertas.some((x) => x.tarifaFinal !== null));
  const todasExc = ops.flatMap((o) => [...o.excepcionesPrevias, ...(o.excepcion ? [o.excepcion] : [])]);
  const comp = ops.flatMap((o) => o.compromisos).filter((c) => c.estado !== 'pendiente' || c.venceEn < ahora);
  const cumplidos = comp.filter((c) => c.estado === 'cumplido').length;
  const sats = ops.map((o) => o.satisfaccion).filter((s): s is number => s !== null);
  return {
    total: ops.length,
    activas: activas.length,
    cerradas: cerradas.length,
    canceladas: ops.filter((o) => o.etapa === 'Cancelada').length,
    escaladas: ops.filter((o) => o.etapa === 'Escalada').length,
    esperaDatos: ops.filter((o) => o.etapa === 'EsperaDatos').length,
    enTransito: ops.filter((o) => ['Transito', 'AvisoDestino', 'Descargue'].includes(o.etapa as string)).length,
    conNovedad: activas.filter((o) => o.excepcion !== null).length,
    enRiesgoSLA: activas.filter((o) => o.retrasoHoras >= 2 || (o.excepcion && o.excepcion.alternativas.some((a) => a.impactoSLA === 'alto') && o.etapa === 'Escalada')).length,
    respuestaClienteMin: resp('cliente'),
    respuestaTransportadorMin: resp('transportador'),
    pctConfirmacionesAutomaticas: confirmaciones.length ? (confAuto / confirmaciones.length) * 100 : 0,
    pctLlamadasExitosas: llamadas.length ? (exitosas / llamadas.length) * 100 : 0,
    negociacionesCompletadas: negociadas.length,
    pctNegociacionesCompletadas: conNegociacion.length ? (negociadas.length / conNegociacion.length) * 100 : 0,
    contactosPorOperacion: ops.length ? llamadas.length / ops.length : 0,
    anticipacionNovedadesMin: prom(todasExc.map((e) => e.anticipacionMin)),
    pctCumplimientoCompromisos: comp.length ? (cumplidos / comp.length) * 100 : 100,
    satisfaccion: prom(sats),
  };
}

export function calcularCanalMetrics(ops: Operacion[]): CanalMetrics[] {
  return CANALES.map((canal) => {
    const o = ops.filter((x) => x.canal === canal);
    const exc = o.flatMap((x) => [...x.excepcionesPrevias, ...(x.excepcion ? [x.excepcion] : [])]);
    return {
      canal,
      total: o.length,
      activas: o.filter((x) => !esTerminal(x.etapa)).length,
      cerradas: o.filter((x) => x.etapa === 'Cerrada').length,
      escaladas: o.filter((x) => x.etapa === 'Escalada').length,
      pctAutomatico: exc.length ? (exc.filter((e) => e.resueltaPor === 'agente' || (!e.resueltaPor && e.categoria === 'automatico')).length / exc.length) * 100 : 100,
      contactosPorOperacion: o.length ? o.reduce((s, x) => s + x.llamadas.length, 0) / o.length : 0,
    };
  });
}


// --- Calendario y tiempos de servicio ----------------------------------------------------

/** Festivos de Colombia (2026-2027) en que no se carga ni se recibe. */
const FESTIVOS = new Set([
  '2026-11-02', '2026-11-16', '2026-12-08', '2026-12-25',
  '2027-01-01', '2027-01-11', '2027-03-22', '2027-03-25', '2027-03-26', '2027-05-01',
]);

const isoLocal = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Domingo o festivo. */
export function esNoHabil(d: Date): boolean {
  return d.getDay() === 0 || FESTIVOS.has(isoLocal(d));
}

/** Tarifa a la que cierra la negociación: si el transportador pide más, se contrapropone el punto medio. */
export function tarifaDeCierre(ofrecida: number, solicitada: number, tope: number): number {
  const medio = solicitada > ofrecida ? Math.round((ofrecida + solicitada) / 2 / 10_000) * 10_000 : ofrecida;
  return Math.min(medio, tope);
}

export interface TiemposServicio {
  llegadaOrigen: number;
  salida: number;
  llegadaDestino: number;
  /** Horas de viaje (sin la pernocta). */
  horasViaje: number;
}

/**
 * Tiempos coherentes de un servicio: el transportador llega poco antes del cargue, espera, se carga,
 * viaja a ~45 km/h más descansos y llega en horario de recibo (07:00-16:00; si no, al día hábil siguiente).
 */
export function calcularTiempos(op: Operacion, opts: { esperaMin?: number; retrasoRutaH?: number; adelantoMin?: number } = {}): TiemposServicio {
  const adelanto = opts.adelantoMin ?? 5 + (op.seq % 25);
  const espera = opts.esperaMin ?? 15 + (op.seq % 4) * 10;
  const cargue = 60 + (op.seq % 4) * 15;
  const llegadaOrigen = op.fechaCargue - adelanto * 60_000;
  const salida = llegadaOrigen + (espera + cargue) * 60_000;
  const horasViaje = op.distanciaKm / 45 + 1 + (opts.retrasoRutaH ?? 0);
  let llegada = new Date(salida + horasViaje * 3_600_000);
  const h = llegada.getHours() + llegada.getMinutes() / 60;
  if (h >= 16) {
    llegada.setDate(llegada.getDate() + 1);
    llegada.setHours(7, 30 + (op.seq % 4) * 15, 0, 0);
  } else if (h < 7) {
    llegada.setHours(7, 30 + (op.seq % 4) * 15, 0, 0);
  }
  while (esNoHabil(llegada)) {
    llegada = new Date(llegada.getTime() + 86_400_000);
    llegada.setHours(7, 30, 0, 0);
  }
  return { llegadaOrigen, salida, llegadaDestino: llegada.getTime(), horasViaje };
}

/** Una reprogramación nunca deja el cargue de noche, en domingo ni en festivo. */
export function ajustarCargue(ts: number): number {
  const d = new Date(ts);
  if (d.getHours() >= 16) {
    d.setDate(d.getDate() + 1);
    d.setHours(7, 30, 0, 0);
  } else if (d.getHours() < 7) {
    d.setHours(7, 30, 0, 0);
  }
  while (esNoHabil(d)) {
    d.setDate(d.getDate() + 1);
    d.setHours(7, 30, 0, 0);
  }
  return d.getTime();
}
