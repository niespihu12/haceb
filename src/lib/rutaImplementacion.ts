// ============================================================================
// Calculo de la Ruta de implementacion (funciones puras, sin React)
//
//  - Tiempo por fase = actividades tecnicas en alcance
//                    + impacto de cada prerrequisito que no esta disponible
//                    + ajustes manuales vigentes (cada uno con justificacion).
//  - Las fases son secuenciales: cada una inicia el dia habil siguiente al
//    cierre de la anterior, a partir de la fecha de inicio del proyecto.
//  - Stoppers: de proyecto (nada puede iniciar) y de fase (la fase no puede
//    iniciar ni certificarse) mientras no esten disponibles.
// ============================================================================

import type {
  AjusteTiempo,
  CapaId,
  CapaImplementacion,
  EstadoCapa,
  EstadoFaseEditable,
  EstadoLevantamiento,
  EstadoPrerrequisito,
  ImpactoPrerrequisito,
  Prerrequisito,
  ProcesoImplementacion,
  TipoPrerrequisito,
} from '@/types/implementacion';

export const ORDEN_ESTADOS: EstadoPrerrequisito[] = ['disponible', 'pendiente', 'requiere_validacion', 'no_disponible'];

/**
 * Dias habiles que suma cada clase de prerrequisito mientras no esta disponible:
 * lo que normalmente tarda conseguirlo (pendiente) o confirmarlo (por validar).
 * Un prerrequisito "no disponible" suma su impacto de pendiente como minimo y
 * ademas pide Discovery: su tiempo real no se puede comprometer.
 */
export const IMPACTO_POR_TIPO: Record<TipoPrerrequisito, ImpactoPrerrequisito> = {
  informacion: { pendiente: 2, validacion: 1 },
  credencial: { pendiente: 3, validacion: 1 },
  acceso: { pendiente: 3, validacion: 1 },
  api: { pendiente: 8, validacion: 3 },
  integracion: { pendiente: 5, validacion: 2 },
  conectividad: { pendiente: 5, validacion: 2 },
  infraestructura: { pendiente: 7, validacion: 3 },
  fuente: { pendiente: 5, validacion: 3 },
  documentacion: { pendiente: 3, validacion: 1 },
  regla: { pendiente: 4, validacion: 2 },
};

/** Minimo de caracteres de una justificacion de ajuste manual. */
export const MIN_JUSTIFICACION = 20;

/**
 * Los faltantes de una misma fase se gestionan en paralelo (el cliente pide
 * credenciales, puertos y accesos al tiempo): la espera la marca el faltante
 * mas largo, mas este porcentaje del resto por coordinacion y reprocesos.
 */
export const FACTOR_CONCURRENCIA = 0.25;

/** Dias de espera de una fase dados los impactos individuales de sus faltantes. */
export function esperaPorFaltantes(dias: number[]): number {
  if (dias.length === 0) return 0;
  const mayor = Math.max(...dias);
  const resto = dias.reduce((s, d) => s + d, 0) - mayor;
  return Math.round((mayor + FACTOR_CONCURRENCIA * resto) * 2) / 2;
}

export function impactoDe(p: Prerrequisito): ImpactoPrerrequisito {
  return p.impacto ?? IMPACTO_POR_TIPO[p.tipo];
}

/** Dias que suma un prerrequisito en su estado actual (0 si esta disponible). */
export function diasImpacto(p: Prerrequisito, estado: EstadoPrerrequisito): number {
  const i = impactoDe(p);
  if (estado === 'pendiente' || estado === 'no_disponible') return i.pendiente;
  if (estado === 'requiere_validacion') return i.validacion;
  return 0;
}

// ---------------------------------------------------------------------------
// Estado inicial, migracion y fusion del levantamiento
// ---------------------------------------------------------------------------

/** Proximo lunes (o hoy si es lunes), AAAA-MM-DD en hora local. */
export function proximoLunes(desde = new Date()): string {
  const d = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate());
  while (d.getDay() !== 1) d.setDate(d.getDate() + 1);
  return aISO(d);
}

export function aISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function desdeISO(iso: string): Date {
  const [a, m, d] = iso.split('-').map(Number);
  return new Date(a, (m || 1) - 1, d || 1);
}

function faseInicial(capa: CapaImplementacion): EstadoFaseEditable {
  return {
    prerrequisitos: Object.fromEntries(capa.prerrequisitos.map((p) => [p.id, p.estado])),
    criterios: Object.fromEntries(capa.habilitador.criterios.map((c) => [c.id, !!c.cumplido])),
    actividades: Object.fromEntries(capa.actividades.filter((a) => a.opcional).map((a) => [a.id, a.incluidaPorDefecto !== false])),
    ajustes: [],
  };
}

export function levantamientoInicial(proceso: ProcesoImplementacion, inicio = proximoLunes()): EstadoLevantamiento {
  return {
    inicio,
    capas: Object.fromEntries(proceso.capas.map((c) => [c.id, faseInicial(c)])) as Record<CapaId, EstadoFaseEditable>,
  };
}

function esAjusteValido(a: unknown): a is AjusteTiempo {
  const x = a as Partial<AjusteTiempo>;
  return !!x && typeof x.id === 'string' && typeof x.dias === 'number' && Number.isFinite(x.dias)
    && typeof x.justificacion === 'string' && x.justificacion.trim().length >= MIN_JUSTIFICACION
    && typeof x.autor === 'string' && typeof x.fecha === 'string';
}

/**
 * Fusiona un levantamiento guardado (version 1 o 2, posiblemente parcial) con
 * la base del proceso. La version 1 guardaba un mapa por capa con
 * `prerrequisitos`, `condiciones`, `habilitador` (booleano) y `tiempo` manual:
 * se conservan los estados de los prerrequisitos y, si la capa estaba
 * completada, se marcan sus criterios; el tiempo manual se descarta porque
 * ahora se calcula.
 */
export function fusionarLevantamiento(base: EstadoLevantamiento, guardado: unknown): EstadoLevantamiento {
  if (!guardado || typeof guardado !== 'object') return base;
  const g = guardado as Partial<EstadoLevantamiento> & Record<string, unknown>;
  const esV2 = typeof g.capas === 'object' && g.capas !== null;
  const capasG = (esV2 ? g.capas : g) as Record<string, Partial<EstadoFaseEditable> & { habilitador?: boolean }>;
  const inicio = esV2 && typeof g.inicio === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(g.inicio) ? g.inicio : base.inicio;

  const capas = Object.fromEntries(
    (Object.keys(base.capas) as CapaId[]).map((capaId) => {
      const b = base.capas[capaId];
      const v = capasG[capaId];
      if (!v || typeof v !== 'object') return [capaId, b];
      const prerrequisitos = { ...b.prerrequisitos };
      for (const id of Object.keys(b.prerrequisitos)) {
        const e = v.prerrequisitos?.[id];
        if (e && ORDEN_ESTADOS.includes(e)) prerrequisitos[id] = e;
      }
      const criterios = { ...b.criterios };
      for (const id of Object.keys(b.criterios)) {
        const c = v.criterios?.[id];
        if (typeof c === 'boolean') criterios[id] = c;
        else if (!esV2 && typeof v.habilitador === 'boolean') criterios[id] = v.habilitador;
      }
      const actividades = { ...b.actividades };
      for (const id of Object.keys(b.actividades)) {
        const a = v.actividades?.[id];
        if (typeof a === 'boolean') actividades[id] = a;
      }
      const ajustes = Array.isArray(v.ajustes) ? v.ajustes.filter(esAjusteValido) : b.ajustes;
      return [capaId, { prerrequisitos, criterios, actividades, ajustes }];
    }),
  ) as Record<CapaId, EstadoFaseEditable>;

  return { inicio, capas };
}

// ---------------------------------------------------------------------------
// Dias habiles
// ---------------------------------------------------------------------------

function esHabil(d: Date): boolean {
  const w = d.getDay();
  return w !== 0 && w !== 6;
}

/** Primer dia habil en o despues de `d`. */
export function primerHabil(d: Date): Date {
  const x = new Date(d);
  while (!esHabil(x)) x.setDate(x.getDate() + 1);
  return x;
}

/** Dia habil en que termina un trabajo de `dias` que empieza en `inicio` (inclusive). */
export function finTrabajo(inicio: Date, dias: number): Date {
  const x = primerHabil(inicio);
  let restantes = Math.max(1, Math.ceil(dias)) - 1;
  while (restantes > 0) {
    x.setDate(x.getDate() + 1);
    if (esHabil(x)) restantes -= 1;
  }
  return x;
}

/** Siguiente dia habil despues de `d`. */
export function siguienteHabil(d: Date): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + 1);
  return primerHabil(x);
}

export function formatDias(d: number): string {
  const v = Math.round(d * 10) / 10;
  return `${String(v).replace('.', ',')} ${v === 1 ? 'día hábil' : 'días hábiles'}`;
}

/** 5 dias habiles = 1 semana. */
export function formatSemanas(d: number): string {
  const s = Math.round((d / 5) * 10) / 10;
  return `${String(s).replace('.', ',')} ${s === 1 ? 'semana' : 'semanas'}`;
}

export function formatFecha(d: Date): string {
  return d.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatFechaCorta(d: Date): string {
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
}

// ---------------------------------------------------------------------------
// Derivacion de cada fase
// ---------------------------------------------------------------------------

export interface ImpactoFaltante {
  prerrequisito: Prerrequisito;
  estado: EstadoPrerrequisito;
  dias: number;
}

export interface FaseDerivada {
  capa: CapaImplementacion;
  indice: number;
  estado: EstadoCapa;
  /** Puede iniciar: la anterior esta certificada y no hay stoppers abiertos. */
  puedeIniciar: boolean;
  /** Por que no puede iniciar (vacio si puede). */
  motivosEspera: string[];
  certificada: boolean;
  criteriosCumplidos: number;
  conteo: Record<EstadoPrerrequisito, number>;
  stoppersFase: Prerrequisito[];
  stoppersFaseAbiertos: Prerrequisito[];
  requiereDiscovery: boolean;
  porRefinar: boolean;
  /** Tiempo de camino feliz: actividades en alcance con todo disponible. */
  diasBase: number;
  /** Impacto individual de cada faltante. */
  impactos: ImpactoFaltante[];
  /** Espera de la fase por faltantes (en paralelo: el mayor + 25 % del resto). */
  diasImpacto: number;
  ajustesVigentes: AjusteTiempo[];
  diasAjuste: number;
  /** Tiempo estimado final de la fase (minimo 1 dia habil). */
  diasTotal: number;
  inicio: Date;
  fin: Date;
}

export interface RutaDerivada {
  fases: FaseDerivada[];
  stoppersProyecto: Prerrequisito[];
  stoppersProyectoAbiertos: Prerrequisito[];
  proyectoPuedeIniciar: boolean;
  diasBase: number;
  diasImpacto: number;
  diasAjuste: number;
  diasTotal: number;
  inicio: Date;
  fin: Date;
  requiereDiscovery: boolean;
  porRefinar: boolean;
  /** Primera fase no certificada (la que esta en juego ahora). */
  faseActual: FaseDerivada | null;
}

export function derivarRuta(proceso: ProcesoImplementacion, lev: EstadoLevantamiento): RutaDerivada {
  const estadoDe = (capaId: CapaId, id: string): EstadoPrerrequisito => lev.capas[capaId]?.prerrequisitos[id] ?? 'disponible';

  const stoppersProyecto = proceso.capas.flatMap((c) => c.prerrequisitos.filter((p) => p.bloqueante === 'proyecto'));
  const stoppersProyectoAbiertos = proceso.capas.flatMap((c) =>
    c.prerrequisitos.filter((p) => p.bloqueante === 'proyecto' && estadoDe(c.id, p.id) !== 'disponible'),
  );
  const proyectoPuedeIniciar = stoppersProyectoAbiertos.length === 0;

  const inicioProyecto = primerHabil(desdeISO(lev.inicio));
  let cursor = inicioProyecto;
  let anteriorCertificada = true;
  const fases: FaseDerivada[] = [];

  proceso.capas.forEach((capa, indice) => {
    const v = lev.capas[capa.id];
    const conteo: Record<EstadoPrerrequisito, number> = { disponible: 0, pendiente: 0, requiere_validacion: 0, no_disponible: 0 };
    const impactos: ImpactoFaltante[] = [];
    for (const p of capa.prerrequisitos) {
      const e = estadoDe(capa.id, p.id);
      conteo[e] += 1;
      const d = diasImpacto(p, e);
      if (d > 0) impactos.push({ prerrequisito: p, estado: e, dias: d });
    }
    const stoppersFase = capa.prerrequisitos.filter((p) => p.bloqueante === 'fase');
    const stoppersFaseAbiertos = stoppersFase.filter((p) => estadoDe(capa.id, p.id) !== 'disponible');
    const requiereDiscovery = conteo.no_disponible > 0;
    const porRefinar = conteo.requiere_validacion > 0 || requiereDiscovery;

    const diasBase = capa.actividades
      .filter((a) => !a.opcional || v.actividades[a.id] !== false)
      .reduce((s, a) => s + a.dias, 0);
    const diasImpactoFase = esperaPorFaltantes(impactos.map((i) => i.dias));
    const ajustesVigentes = v.ajustes.filter((a) => !a.anulado);
    const diasAjuste = ajustesVigentes.reduce((s, a) => s + a.dias, 0);
    const diasTotal = Math.max(1, diasBase + diasImpactoFase + diasAjuste);

    const motivosEspera: string[] = [];
    if (!proyectoPuedeIniciar) motivosEspera.push(`El proyecto tiene ${stoppersProyectoAbiertos.length} stopper(s) sin resolver.`);
    if (!anteriorCertificada && indice > 0) motivosEspera.push(`La fase ${indice} · ${proceso.capas[indice - 1].nombre} aún no está certificada.`);
    if (stoppersFaseAbiertos.length > 0) motivosEspera.push(`${stoppersFaseAbiertos.length} stopper(s) de la fase sin resolver.`);
    const puedeIniciar = motivosEspera.length === 0;

    const criteriosCumplidos = capa.habilitador.criterios.filter((c) => v.criterios[c.id]).length;
    const todosCriterios = criteriosCumplidos === capa.habilitador.criterios.length && capa.habilitador.criterios.length > 0;
    // Una fase solo cuenta como certificada si ademas pudo iniciar: la
    // secuencia y los stoppers no se pueden saltar marcando criterios.
    const certificada = todosCriterios && puedeIniciar;

    let estado: EstadoCapa;
    if (certificada) estado = 'completada';
    else if (!anteriorCertificada && indice > 0) estado = 'en_espera';
    else if (!puedeIniciar) estado = 'bloqueada';
    else if (requiereDiscovery) estado = 'discovery';
    else if (criteriosCumplidos > 0) estado = 'en_curso';
    else estado = 'lista';

    const inicio = primerHabil(cursor);
    const fin = finTrabajo(inicio, diasTotal);
    cursor = siguienteHabil(fin);

    fases.push({
      capa,
      indice,
      estado,
      puedeIniciar,
      motivosEspera,
      certificada,
      criteriosCumplidos,
      conteo,
      stoppersFase,
      stoppersFaseAbiertos,
      requiereDiscovery,
      porRefinar,
      diasBase,
      impactos,
      diasImpacto: diasImpactoFase,
      ajustesVigentes,
      diasAjuste,
      diasTotal,
      inicio,
      fin,
    });
    anteriorCertificada = certificada;
  });

  const suma = (f: (x: FaseDerivada) => number) => fases.reduce((s, x) => s + f(x), 0);
  return {
    fases,
    stoppersProyecto,
    stoppersProyectoAbiertos,
    proyectoPuedeIniciar,
    diasBase: suma((f) => f.diasBase),
    diasImpacto: suma((f) => f.diasImpacto),
    diasAjuste: suma((f) => f.diasAjuste),
    diasTotal: suma((f) => f.diasTotal),
    inicio: inicioProyecto,
    fin: fases.length ? fases[fases.length - 1].fin : inicioProyecto,
    requiereDiscovery: fases.some((f) => f.requiereDiscovery),
    porRefinar: fases.some((f) => f.porRefinar),
    faseActual: fases.find((f) => !f.certificada) ?? null,
  };
}

/** Busca un prerrequisito y la fase a la que pertenece. */
export function ubicarPrerrequisito(proceso: ProcesoImplementacion, id: string): { capa: CapaImplementacion; prerrequisito: Prerrequisito } | null {
  for (const capa of proceso.capas) {
    const p = capa.prerrequisitos.find((x) => x.id === id);
    if (p) return { capa, prerrequisito: p };
  }
  return null;
}
