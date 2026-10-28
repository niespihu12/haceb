import type { TipoVehiculo } from '@/types';
import type { AccionUI, DatosCaso, RondaNegociacion, Vista } from '@/types/agentes';
import { TRANSPORTADORES } from '@/data/mockData';
import type { CtxGuion, Guion, Guiones } from './tipos';

/* ─── Anclas de la ventana «proveedores» ─── */
export const ANCLA_PROV = {
  ubicacion: 'proveedores.campo.ubicacion',
  vehiculo: 'proveedores.campo.vehiculo',
  btnFiltrar: 'proveedores.btn.filtrar',
  btnPuntuar: 'proveedores.btn.puntuar',
  btnPreseleccionar: 'proveedores.btn.preseleccionar',
  colCompat: 'proveedores.col.compat',
  critCapacidad: 'proveedores.criterio.capacidad',
  critRutas: 'proveedores.criterio.rutas',
  critCumplimiento: 'proveedores.criterio.cumplimiento',
  critCondiciones: 'proveedores.criterio.condiciones',
  aviso: 'proveedores.aviso.resultado',
  tope: 'proveedores.campo.tope',
  celdaOfrecida: 'proveedores.celda.ofrecida',
  celdaContra: 'proveedores.celda.contrapropuesta',
  celdaFrente: 'proveedores.celda.frente',
  celdaFinal: 'proveedores.celda.final',
  btnAceptar: 'proveedores.btn.aceptar',
} as const;

export const anclaFilaBase = (id: string): string => `proveedores.fila.${id.toLowerCase()}`;
export const anclaRonda = (id: string): string => `proveedores.ronda.${id.toLowerCase()}`;

/* ─── Instantes compartidos con VentanaProveedores ─── */
/** b2: se pulsa «Filtrar»; luego salen las filas fuera de zona y las de otro vehículo. */
export const T_FILTRAR = 0.62;
export const T_ZONA: [number, number] = [0.66, 0.8];
export const T_VEH: [number, number] = [0.82, 0.95];
/** b3: puntaje fila a fila. */
export const T_PUNTUAR = 0.12;
export const T_PUNTAJE: [number, number] = [0.2, 0.85];
/** b4: se pulsa «Preseleccionar» y se marcan los candidatos. */
export const T_PRESEL_CLIC = 0.2;
export const T_PRESEL = 0.3;
/** n3: aparece el resultado de la comparación contra el tope. */
export const T_COMPARA = 0.55;

export const pesos = (n: number): string => `$ ${Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;

const ordenar = (ui: AccionUI[]): AccionUI[] => ui.map((a, i) => ({ a, i })).sort((x, y) => x.a.t - y.a.t || x.i - y.i).map(x => x.a);
const hastaTecleo = (t: number, dur: number, ms = 360): number => Math.min(0.97, t + ms / Math.max(dur, 1));

/* ─── Modelo de la base de proveedores (compartido ventana ↔ guion) ─── */
const COORD: Record<string, [number, number]> = {
  Medellín: [6.25, -75.57], Barrancabermeja: [7.07, -73.85], Cali: [3.45, -76.53], Bogotá: [4.71, -74.07],
  Bucaramanga: [7.12, -73.12], Barranquilla: [10.96, -74.78], Pereira: [4.81, -75.69], Pasto: [1.21, -77.28],
  Villavicencio: [4.15, -73.63],
};
const RUTAS_ALT = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Pereira', 'Bucaramanga', 'Cartagena'];

function km(a: [number, number], b: [number, number]): number {
  const r = (g: number) => (g * Math.PI) / 180;
  const h = Math.sin(r(b[0] - a[0]) / 2) ** 2 + Math.cos(r(a[0])) * Math.cos(r(b[0])) * Math.sin(r(b[1] - a[1]) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

export interface FilaBase {
  id: string;
  nombre: string;
  base: string;
  flota: TipoVehiculo[];
  placa: string;
  cumplimiento: number;
  dist: number;
  tieneVeh: boolean;
  /** Motivo de descarte antes de puntuar: fuera de zona o sin el vehículo. */
  descarte: '' | 'zona' | 'vehiculo';
  candidata: boolean;
  puntaje: number;
  rutas: string[];
  /** Posición dentro de su grupo de filtro / de puntaje (para escalonar la animación). */
  ordGrupo: number;
  nGrupo: number;
  ordPunt: number;
}

export interface ModeloBase {
  filas: FilaBase[];
  vehiculo: TipoVehiculo;
  origen: string;
  destino: string;
  ruta: string;
  total: number;
  /** Transportadores que quedan tras ubicación y vehículo. */
  quedan: number;
  fueraZona: number;
  sinVeh: number;
  candidatas: FilaBase[];
}

export function modeloBase(d: DatosCaso): ModeloBase {
  const op = d.trayectoria[0];
  const vehiculo = op.vehiculoRequerido;
  const origen = op.nodoOrigen.ciudad;
  const destino = op.nodoDestino.ciudad;
  const pOri: [number, number] = [op.nodoOrigen.lat, op.nodoOrigen.lng];
  const ids = new Set(d.negociacion.map(r => r.transportadorId));
  const minCand = d.negociacion.length ? Math.min(...d.negociacion.map(r => r.compatibilidad)) : 72;
  const n = d.negociacion.length;
  const objetivo = n + 4;

  const base = TRANSPORTADORES.map(t => {
    const num = Number(t.id.slice(3)) || 0;
    const tieneVeh = t.flota.includes(vehiculo);
    const candidata = ids.has(t.id);
    const r = d.negociacion.find(x => x.transportadorId === t.id);
    const dist = Math.round(km(pOri, COORD[t.base] ?? COORD['Bogotá']));
    const alt1 = RUTAS_ALT[(num * 3) % RUTAS_ALT.length];
    const alt2 = RUTAS_ALT[(num * 5 + 2) % RUTAS_ALT.length];
    const rutas = [alt1 === t.base ? RUTAS_ALT[(num + 1) % RUTAS_ALT.length] : alt1, alt2 === t.base ? RUTAS_ALT[(num + 4) % RUTAS_ALT.length] : alt2].map(c => `${t.base} ↔ ${c}`);
    if (candidata) rutas.unshift(`${origen} → ${destino}`);
    return {
      id: t.id, nombre: t.nombre, base: t.base, flota: t.flota, placa: t.placa, cumplimiento: t.cumplimiento,
      dist, tieneVeh, candidata,
      puntaje: r ? r.compatibilidad : Math.min(minCand - 4, 46 + ((num * 13) % 24)),
      rutas: rutas.slice(0, 2),
    };
  });

  const enV = base.filter(f => f.tieneVeh);
  const sobran = Math.max(0, enV.length - objetivo);
  const lejanas = enV.filter(f => !f.candidata).sort((x, y) => y.dist - x.dist || x.id.localeCompare(y.id)).slice(0, sobran).map(f => f.id);
  const zonaIds = new Set([...lejanas, ...base.filter(f => !f.tieneVeh && f.dist > 600).map(f => f.id)]);
  const vehIds = new Set(base.filter(f => !f.tieneVeh && !zonaIds.has(f.id)).map(f => f.id));

  const grupo = (set: Set<string>) => base.filter(f => set.has(f.id)).sort((x, y) => y.dist - x.dist || x.id.localeCompare(y.id)).map(f => f.id);
  const gz = grupo(zonaIds);
  const gv = grupo(vehIds);
  const conservadas = base.filter(f => !zonaIds.has(f.id) && !vehIds.has(f.id));

  const filas: FilaBase[] = base.map(f => {
    const descarte: FilaBase['descarte'] = zonaIds.has(f.id) ? 'zona' : vehIds.has(f.id) ? 'vehiculo' : '';
    const lista = descarte === 'zona' ? gz : descarte === 'vehiculo' ? gv : [];
    return {
      ...f, descarte,
      ordGrupo: lista.indexOf(f.id), nGrupo: lista.length,
      ordPunt: conservadas.findIndex(c => c.id === f.id),
    };
  });
  return {
    filas, vehiculo, origen, destino, ruta: `${origen} → ${destino}`,
    total: filas.length, quedan: conservadas.length, fueraZona: gz.length, sinVeh: gv.length,
    candidatas: filas.filter(f => f.candidata).sort((x, y) => y.puntaje - x.puntaje),
  };
}

/* ─── Modelo de la hoja de negociación ─── */
export interface ModeloNeg {
  rondas: RondaNegociacion[];
  tope: number;
  ruta: string;
  vehiculo: TipoVehiculo;
  opId: string;
  /** Tarifa final registrada por transportador (si existe en alguna instantánea). */
  finalDe: (id: string) => number | null;
  aceptada?: { ronda: RondaNegociacion; tarifa: number };
  escalada?: RondaNegociacion;
  excedente: number;
  adjudicada: boolean;
}

export function modeloNeg(d: DatosCaso): ModeloNeg {
  const op = d.trayectoria[0];
  const rondas = d.negociacion;
  const finalDe = (id: string): number | null => {
    for (let i = d.trayectoria.length - 1; i >= 0; i--) {
      const o = d.trayectoria[i].ofertas.find(x => x.transportadorId === id && x.tarifaFinal !== null);
      if (o) return o.tarifaFinal;
    }
    return rondas.find(r => r.transportadorId === id)?.tarifaFinal ?? null;
  };
  const conFinal = rondas.find(r => finalDe(r.transportadorId) !== null);
  const escalada = rondas.find(r => r.estado === 'sobre_tope');
  return {
    rondas, tope: op.tarifaMaxima, ruta: `${op.nodoOrigen.ciudad} → ${op.nodoDestino.ciudad}`, vehiculo: op.vehiculoRequerido, opId: op.id,
    finalDe,
    aceptada: conFinal ? { ronda: conFinal, tarifa: finalDe(conFinal.transportadorId) as number } : undefined,
    escalada,
    excedente: escalada ? escalada.contrapropuesta - op.tarifaMaxima : 0,
    adjudicada: d.excepcion?.tipo === 'Tarifa_sobre_tope' && d.decision?.aplicada?.efecto.tipo === 'continuar',
  };
}

const lista = (xs: string[]): string => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} y ${xs[xs.length - 1]}`);

/* ─── Búsqueda: b1–b4 ─── */
const b1: Guion = ({ d }: CtxGuion) => {
  const m = modeloBase(d);
  const ui: AccionUI[] = [
    { t: 0, tipo: 'estado', texto: 'Abriendo la base de proveedores…' },
    { t: 0.36, tipo: 'estado', texto: `${m.total} transportadores en la base`, nivel: 'info' },
    { t: 0.4, tipo: 'mover', ancla: ANCLA_PROV.vehiculo },
    { t: 0.46, hasta: 0.7, tipo: 'resaltar', ancla: ANCLA_PROV.vehiculo, texto: 'Vehículo requerido' },
    { t: 0.62, tipo: 'mover', ancla: ANCLA_PROV.ubicacion },
    { t: 0.68, hasta: 0.96, tipo: 'resaltar', ancla: ANCLA_PROV.ubicacion, texto: 'Ruta del viaje' },
    { t: 0.9, tipo: 'estado', texto: `${m.vehiculo} · ruta ${m.ruta}`, nivel: 'ok' },
  ];
  return {
    vista: 'proveedores.base' as Vista,
    ui: ordenar(ui),
    pensamiento: `Abro la base de proveedores con lo que ya sé del viaje: ${m.vehiculo} para la ruta ${m.ruta}. Busco siempre en la misma base y con los mismos criterios para que cada operación se trate igual, como pide R05.`,
  };
};

const b2: Guion = ({ d }: CtxGuion) => {
  const m = modeloBase(d);
  const ui: AccionUI[] = [
    { t: 0, tipo: 'estado', texto: 'Aplicando filtros de ubicación y vehículo…' },
    { t: 0.05, tipo: 'mover', ancla: ANCLA_PROV.ubicacion },
    { t: 0.12, tipo: 'clic', ancla: ANCLA_PROV.ubicacion },
    { t: 0.16, hasta: 0.34, tipo: 'resaltar', ancla: ANCLA_PROV.ubicacion, texto: `Ubicación · ${m.ruta}` },
    { t: 0.36, tipo: 'mover', ancla: ANCLA_PROV.vehiculo },
    { t: 0.42, tipo: 'clic', ancla: ANCLA_PROV.vehiculo },
    { t: 0.46, hasta: 0.56, tipo: 'resaltar', ancla: ANCLA_PROV.vehiculo, texto: `Vehículo · ${m.vehiculo}` },
    { t: 0.56, tipo: 'mover', ancla: ANCLA_PROV.btnFiltrar },
    { t: T_FILTRAR, tipo: 'clic', ancla: ANCLA_PROV.btnFiltrar },
    { t: 0.93, tipo: 'estado', texto: `${m.quedan} transportadores con ${m.vehiculo}`, nivel: 'ok' },
  ];
  return {
    vista: 'proveedores.base' as Vista,
    ui: ordenar(ui),
    pensamiento: `Filtro primero por ubicación y luego por tipo de vehículo: de ${m.total} transportadores salen ${m.fueraZona} por quedar fuera de zona y ${m.sinVeh} por no tener ${m.vehiculo}. Quedan ${m.quedan} que pueden cubrir ${m.ruta}; es el primer corte de R05.`,
  };
};

const b3: Guion = ({ d }: CtxGuion) => {
  const m = modeloBase(d);
  const ui: AccionUI[] = [
    { t: 0, tipo: 'estado', texto: 'Puntuando transportadores…' },
    { t: 0.04, tipo: 'mover', ancla: ANCLA_PROV.btnPuntuar },
    { t: T_PUNTUAR, tipo: 'clic', ancla: ANCLA_PROV.btnPuntuar },
    { t: 0.2, hasta: 0.34, tipo: 'resaltar', ancla: ANCLA_PROV.critCapacidad, texto: 'Capacidad' },
    { t: 0.34, hasta: 0.48, tipo: 'resaltar', ancla: ANCLA_PROV.critRutas, texto: 'Rutas habituales' },
    { t: 0.48, hasta: 0.62, tipo: 'resaltar', ancla: ANCLA_PROV.critCumplimiento, texto: 'Historial de cumplimiento' },
    { t: 0.62, hasta: 0.76, tipo: 'resaltar', ancla: ANCLA_PROV.critCondiciones, texto: 'Condiciones comerciales' },
    { t: 0.78, tipo: 'mover', ancla: ANCLA_PROV.colCompat },
    { t: 0.82, hasta: 0.97, tipo: 'resaltar', ancla: ANCLA_PROV.colCompat, texto: 'Compatibilidad' },
    { t: 0.9, tipo: 'estado', texto: `Compatibilidad y cumplimiento calculados · ${m.quedan} transportadores`, nivel: 'ok' },
  ];
  return {
    vista: 'proveedores.base' as Vista,
    ui: ordenar(ui),
    pensamiento: `Puntúo a los ${m.quedan} que quedaron con cuatro criterios: capacidad, rutas habituales, historial de cumplimiento y condiciones comerciales (R05). Todavía no miro la tarifa: eso se define al negociar, dentro del tope de R06.`,
  };
};

const b4Ok: Guion = ({ d }: CtxGuion) => {
  const m = modeloBase(d);
  const c = m.candidatas;
  const ui: AccionUI[] = [
    { t: 0, tipo: 'estado', texto: 'Preseleccionando candidatos…' },
    { t: 0.06, tipo: 'mover', ancla: ANCLA_PROV.btnPreseleccionar },
    { t: T_PRESEL_CLIC, tipo: 'clic', ancla: ANCLA_PROV.btnPreseleccionar },
    { t: 0.34, tipo: 'mover', ancla: anclaFilaBase(c[0]?.id ?? 'TR-01') },
    { t: 0.4, hasta: 0.96, tipo: 'resaltar', ancla: ANCLA_PROV.aviso, texto: `${c.length} candidatos preseleccionados` },
    { t: 0.6, tipo: 'estado', texto: `${c.length} candidatos · TransportadoresPreseleccionados`, nivel: 'ok' },
  ];
  return {
    vista: 'proveedores.base' as Vista,
    ui: ordenar(ui),
    pensamiento: `Preselecciono a los ${c.length} de mayor compatibilidad: ${lista(c.map(f => f.nombre))}. Son los que llamaré a negociar bajo R06; el resto de la base queda como reserva.`,
  };
};

const b4Sin: Guion = ({ d }: CtxGuion) => {
  const m = modeloBase(d);
  const ui: AccionUI[] = [
    { t: 0, tipo: 'estado', texto: 'Preseleccionando candidatos…' },
    { t: 0.06, tipo: 'mover', ancla: ANCLA_PROV.btnPreseleccionar },
    { t: T_PRESEL_CLIC, tipo: 'clic', ancla: ANCLA_PROV.btnPreseleccionar },
    { t: 0.34, tipo: 'toast', hasta: 0.95, texto: `0 candidatos para ${m.ruta}`, nivel: 'error' },
    { t: 0.4, hasta: 0.96, tipo: 'resaltar', ancla: ANCLA_PROV.aviso, texto: '0 candidatos' },
    { t: 0.6, tipo: 'estado', texto: 'Sin candidatos que acepten dentro de lo previsto', nivel: 'error' },
  ];
  return {
    vista: 'proveedores.base' as Vista,
    ui: ordenar(ui),
    pensamiento: `Ninguno de los ${m.quedan} transportadores que pasaron los filtros tiene unidad libre para ${m.ruta} en el plazo previsto, así que no puedo preseleccionar a nadie. Según R05 no cambio por mi cuenta el vehículo requerido: registro la novedad Sin_transportador y la paso al coordinador.`,
  };
};

/* ─── Negociación: n2–n4 ─── */
const n2: Guion = ({ d, duracion }: CtxGuion) => {
  const m = modeloNeg(d);
  const r = m.rondas[0];
  if (!r) return {};
  const ofr = pesos(r.tarifaOfrecida);
  const con = pesos(r.contrapropuesta);
  const h1 = hastaTecleo(0.22, duracion);
  const t2 = Math.min(0.8, h1 + 0.12);
  const h2 = hastaTecleo(t2, duracion);
  const acepta = r.contrapropuesta <= r.tarifaOfrecida;
  const ui: AccionUI[] = [
    { t: 0, tipo: 'estado', texto: `Negociando con ${r.transportador}…` },
    { t: 0.04, tipo: 'mover', ancla: anclaRonda(r.transportadorId) },
    { t: 0.1, hasta: 0.2, tipo: 'resaltar', ancla: anclaRonda(r.transportadorId), texto: r.transportador },
    { t: 0.14, tipo: 'mover', ancla: ANCLA_PROV.celdaOfrecida },
    { t: 0.2, tipo: 'clic', ancla: ANCLA_PROV.celdaOfrecida },
    { t: 0.22, hasta: h1, tipo: 'teclear', ancla: ANCLA_PROV.celdaOfrecida, texto: ofr },
    { t: h1 + 0.02, tipo: 'mover', ancla: ANCLA_PROV.celdaContra },
    { t: t2, hasta: h2, tipo: 'teclear', ancla: ANCLA_PROV.celdaContra, texto: con },
    { t: Math.min(0.97, h2 + 0.01), hasta: 1, tipo: 'resaltar', ancla: ANCLA_PROV.celdaContra, texto: acepta ? 'Acepta la tarifa ofrecida' : 'Contrapropuesta recibida' },
    { t: Math.min(0.98, h2 + 0.01), tipo: 'estado', texto: `Ofrecida ${ofr} · contrapropuesta ${con}`, nivel: 'info' },
  ];
  return {
    vista: 'proveedores.negociacion' as Vista,
    ui: ordenar(ui),
    pensamiento: `Registro en la hoja lo que acabo de hablar con ${r.transportador}: le informé ${ofr} y ${acepta ? 'aceptó esa misma tarifa' : `me devolvió ${con}`}. El tope autorizado es ${pesos(m.tope)} y por R06 solo negocio dentro de él.`,
  };
};

const n3Base = (d: DatosCaso, sobre: boolean): ReturnType<Guion> => {
  const m = modeloNeg(d);
  const r = m.rondas[0];
  if (!r) return {};
  const ui: AccionUI[] = [
    { t: 0, tipo: 'estado', texto: 'Comparando contra el tope autorizado…' },
    { t: 0.05, tipo: 'mover', ancla: ANCLA_PROV.tope },
    { t: 0.08, hasta: 0.32, tipo: 'resaltar', ancla: ANCLA_PROV.tope, texto: `Tope autorizado ${pesos(m.tope)}` },
    { t: 0.34, tipo: 'mover', ancla: ANCLA_PROV.celdaContra },
    { t: 0.38, hasta: 0.54, tipo: 'resaltar', ancla: ANCLA_PROV.celdaContra, texto: `Contrapropuesta ${pesos(r.contrapropuesta)}` },
    { t: 0.52, tipo: 'mover', ancla: ANCLA_PROV.celdaFrente },
    { t: T_COMPARA + 0.03, hasta: 0.97, tipo: 'resaltar', ancla: ANCLA_PROV.celdaFrente, texto: sobre ? `Supera el tope en ${pesos(m.excedente)}` : 'Dentro del tope' },
  ];
  if (sobre) {
    ui.push({ t: T_COMPARA + 0.05, hasta: 0.97, tipo: 'toast', texto: `La tarifa solicitada supera el tope en ${pesos(m.excedente)}`, nivel: 'error' });
    ui.push({ t: 0.7, tipo: 'estado', texto: `Supera el tope en ${pesos(m.excedente)} · escalada al coordinador`, nivel: 'error' });
  } else {
    ui.push({ t: 0.7, tipo: 'estado', texto: `Dentro del tope ${pesos(m.tope)}`, nivel: 'ok' });
  }
  return { vista: 'proveedores.negociacion' as Vista, ui: ordenar(ui) };
};

const n3Ok: Guion = ({ d }: CtxGuion) => {
  const m = modeloNeg(d);
  const r = m.rondas[0];
  return {
    ...n3Base(d, false),
    pensamiento: r ? `Pongo la contrapropuesta de ${pesos(r.contrapropuesta)} al lado del tope de ${pesos(m.tope)}: queda dentro, así que la acepto sin escalar nada. Es justo el control que fija R06.` : undefined,
  };
};

const n3Sobre: Guion = ({ d }: CtxGuion) => {
  const m = modeloNeg(d);
  const r = m.rondas[0];
  return {
    ...n3Base(d, true),
    pensamiento: r ? `${r.transportador} pide ${pesos(r.contrapropuesta)} y el tope autorizado es ${pesos(m.tope)}: se pasa por ${pesos(m.excedente)}. Por R06 no puedo aceptar y por R07 no comprometo ningún valor; marco la fila y presento el resultado al coordinador.` : undefined,
  };
};

/** El plan no marca la variante en b4/n3 que fallan: el guion base decide por `ok`. */
const b4: Guion = (c: CtxGuion) => (c.ok ? b4Ok(c) : b4Sin(c));
const n3: Guion = (c: CtxGuion) => (c.ok ? n3Ok(c) : n3Sobre(c));

const n4: Guion = ({ d }: CtxGuion) => {
  const m = modeloNeg(d);
  const a = m.aceptada;
  const ronda = a?.ronda ?? m.rondas[0];
  if (!ronda) return {};
  const tarifa = a?.tarifa ?? m.tope;
  const ui: AccionUI[] = [
    { t: 0, tipo: 'estado', texto: 'Registrando la aceptación preliminar…' },
    { t: 0.08, tipo: 'mover', ancla: ANCLA_PROV.btnAceptar },
    { t: 0.2, tipo: 'clic', ancla: ANCLA_PROV.btnAceptar },
    { t: 0.3, tipo: 'mover', ancla: ANCLA_PROV.celdaFinal },
    { t: 0.36, tipo: 'pegar', ancla: ANCLA_PROV.celdaFinal, texto: pesos(tarifa) },
    { t: 0.5, hasta: 0.97, tipo: 'resaltar', ancla: ANCLA_PROV.aviso, texto: 'Aceptación preliminar' },
    { t: 0.6, tipo: 'estado', texto: `AceptacionPreliminar · ${pesos(tarifa)}`, nivel: 'ok' },
  ];
  const autorizada = d.excepcion?.tipo === 'Tarifa_sobre_tope';
  return {
    vista: 'proveedores.negociacion' as Vista,
    ui: ordenar(ui),
    pensamiento: autorizada
      ? `Con la decisión del coordinador en mano, registro la aceptación preliminar de ${ronda.transportador} por ${pesos(tarifa)}. Ese valor supera lo que yo podía pactar, así que queda anotado como autorizado por el coordinador (R08).`
      : `Registro la aceptación preliminar de ${ronda.transportador} por ${pesos(tarifa)}, que está dentro del tope de ${pesos(m.tope)} (R06). Aún no es la asignación: falta compararla con las demás ofertas.`,
  };
};

/** Guiones de la ventana «proveedores». Claves: id de paso o `variante:id`. */
export const proveedores: Guiones = {
  b1,
  b2,
  b3,
  b4,
  'Sin_transportador:b4': b4Sin,
  n2,
  n3,
  'Tarifa_sobre_tope:n3': n3Sobre,
  n4,
};
