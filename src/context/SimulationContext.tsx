import { useState, useCallback, useEffect, useMemo, useRef, type ReactNode } from 'react';
import type { DecisionHumana, FiltrosOperacion, LogEntry, Operacion, SimulacionVelocidad, TipoExcepcion } from '@/types';
import { SimulationContext, type SimulationContextType } from '@/context/simulation-context';
import { EXCEPCION_LABEL, calcularCanalMetrics, calcularKPIs, esTerminal } from '@/data/mockData';
import {
  nuevaOperacion,
  nuevoLog,
  relojEn,
  seedOperaciones,
  simularDecisionHumana,
  transicionar,
  type OpcionesTransicion,
} from '@/data/motor';

const SPEED_INTERVALS: Record<SimulacionVelocidad, number> = { 1: 3000, 2: 1500, 5: 600, 10: 300 };

const MAX_OPERACIONES = 90;
const MAX_LOGS = 48;
const SEMILLA = 38;
const N_SEMILLA = 26;

// Probabilidades del tick (documentadas para que el comportamiento sea legible)
const P_LLEGADA = 0.5; // llega una solicitud nueva por tick
const FRACCION_AVANCE = 0.34; // fracción de las operaciones activas que avanza una etapa por tick
const P_MESA = 0.22; // el coordinador atiende una gestión de la Mesa

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [seleccionAutomatica, setSeleccionState] = useState(true);
  const [allOperaciones, setAll] = useState<Operacion[]>(() => seedOperaciones(N_SEMILLA, relojEn(0), true, SEMILLA));
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [tick, setTick] = useState(0);
  const [speed, setSpeed] = useState<SimulacionVelocidad>(1);
  const [isRunning, setIsRunning] = useState(false);
  const [filters, setFilters] = useState<FiltrosOperacion>({ canales: [], etapas: [], bloques: [], categorias: [], tipos: [], busqueda: '' });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const allRef = useRef(allOperaciones);
  const tickRef = useRef(tick);
  const selRef = useRef(seleccionAutomatica);
  useEffect(() => {
    allRef.current = allOperaciones;
  }, [allOperaciones]);
  useEffect(() => {
    tickRef.current = tick;
  }, [tick]);
  useEffect(() => {
    selRef.current = seleccionAutomatica;
  }, [seleccionAutomatica]);

  const ahora = useMemo(() => relojEn(tick), [tick]);

  const play = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);

  const stop = useCallback(() => {
    setIsRunning(false);
    setAll(seedOperaciones(N_SEMILLA, relojEn(0), selRef.current, SEMILLA));
    setTick(0);
    setLogs([]);
  }, []);

  const empujarLogs = useCallback((entradas: LogEntry[]) => {
    if (entradas.length === 0) return;
    setLogs((prev) => {
      const merged = [...prev, ...entradas];
      return merged.length > MAX_LOGS ? merged.slice(merged.length - MAX_LOGS) : merged;
    });
  }, []);

  const setSeleccionAutomatica = useCallback(
    (v: boolean) => {
      setSeleccionState(v);
      empujarLogs([
        nuevoLog(
          null,
          'Sistema',
          v
            ? 'Selección automática activada: la plataforma elige si se cumplen los requisitos operativos, documentales y comerciales (R09)'
            : 'Selección automática desactivada: el coordinador revisa las ofertas y selecciona (R09)',
          relojEn(tickRef.current),
          'sistema',
        ),
      ]);
    },
    [empujarLogs],
  );

  const tickFn = useCallback(() => {
    const t = tickRef.current + 1;
    const ts = relojEn(t);
    setTick(t);

    let items = [...allRef.current];
    const entradas: LogEntry[] = [];
    const base: Omit<OpcionesTransicion, 'ahora'> = { seleccionAutomatica: selRef.current };

    // Llegan solicitudes nuevas por los distintos canales.
    if (Math.random() < P_LLEGADA) {
      const { operacion, log } = nuevaOperacion(ts, Math.random);
      items.push(operacion);
      entradas.push(log);
    }

    // Una fracción de las operaciones activas avanza una etapa por tick (WIP estable ~25-30).
    // Las operaciones de la pestaña Agentes (origen 'agentes') las mueve su propio motor.
    const activas = items.filter((o) => !esTerminal(o.etapa) && o.etapa !== 'Escalada' && o.origen !== 'agentes');
    const cuantos = Math.min(activas.length, Math.max(3, Math.round(activas.length * FRACCION_AVANCE)));
    const barajadas = [...activas].sort(() => Math.random() - 0.5).slice(0, cuantos);
    for (const o of barajadas) {
      const res = transicionar(o, { ...base, ahora: ts });
      if (!res) continue;
      const idx = items.findIndex((x) => x.id === o.id);
      if (idx === -1) continue;
      items[idx] = res.operacion;
      entradas.push(...res.logs);
    }

    // Mesa del coordinador: una persona atiende gestiones.
    for (const o of items.filter((x) => x.etapa === 'Escalada' && x.excepcion && x.origen !== 'agentes')) {
      if (Math.random() >= P_MESA) continue;
      const dh = simularDecisionHumana(o.excepcion!);
      const res = transicionar(o, { ...base, ahora: ts, decisionHumana: dh });
      if (!res) continue;
      const idx = items.findIndex((x) => x.id === o.id);
      if (idx === -1) continue;
      items[idx] = res.operacion;
      entradas.push(...res.logs);
    }

    // Retención: se conserva la bitácora, no la operación cerrada.
    if (items.length > MAX_OPERACIONES) {
      const exceso = items.length - MAX_OPERACIONES;
      const aRemover = items
        .filter((o) => esTerminal(o.etapa))
        .sort((a, b) => a.fechaActualizacion - b.fechaActualizacion)
        .slice(0, exceso)
        .map((o) => o.id);
      if (aRemover.length > 0) {
        entradas.push(
          nuevoLog(null, 'Sistema', `Retención (${MAX_OPERACIONES}): ${aRemover.length} operaciones cerradas archivadas en la Control Tower`, ts, 'sistema'),
        );
        items = items.filter((o) => !aRemover.includes(o.id));
      }
    }

    allRef.current = items;
    setAll(items);
    empujarLogs(entradas);
  }, [empujarLogs]);

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    intervalRef.current = setInterval(tickFn, SPEED_INTERVALS[speed]);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, speed, tickFn]);

  // --- Acciones manuales -------------------------------------------------------

  const aplicarManual = useCallback(
    (id: string, extra: Partial<OpcionesTransicion>) => {
      const actual = allRef.current.find((o) => o.id === id);
      if (!actual || actual.origen === 'agentes') return;
      const ts = relojEn(tickRef.current);
      const res = transicionar(actual, { seleccionAutomatica: selRef.current, ahora: ts, ...extra });
      if (!res) return;
      const nuevos = allRef.current.map((o) => (o.id === id ? res.operacion : o));
      allRef.current = nuevos;
      setAll(nuevos);
      empujarLogs(res.logs);
    },
    [empujarLogs],
  );

  const avanzarOperacion = useCallback((id: string) => aplicarManual(id, { forzar: { resolver: true } }), [aplicarManual]);

  const decidirOperacion = useCallback(
    (id: string, decision: DecisionHumana, alternativa?: 'A' | 'B' | 'C' | 'D') =>
      aplicarManual(id, { decisionHumana: { decision, alternativa, por: 'Coordinador de la Mesa · sesión demo' } }),
    [aplicarManual],
  );

  const cancelarOperacion = useCallback(
    (id: string) => {
      const actual = allRef.current.find((o) => o.id === id);
      if (!actual || esTerminal(actual.etapa) || actual.origen === 'agentes') return;
      if (actual.etapa === 'Escalada') {
        aplicarManual(id, { decisionHumana: { decision: 'CANCELAR', por: 'Responsable de autorización · sesión demo' } });
        return;
      }
      const ts = relojEn(tickRef.current);
      const nuevos = allRef.current.map((o) =>
        o.id === id
          ? {
              ...o,
              etapa: 'Cancelada' as const,
              bloque: 'Novedad' as const,
              causaCancelacion: `Cancelada manualmente en ${o.etapa} por el responsable`,
              etapaRetorno: null,
              intervencionHumana: true,
              eventos: [...o.eventos, { evento: 'OperacionCancelada' as const, timestamp: ts, detalle: 'Cancelada manualmente por el responsable' }],
              fechaActualizacion: ts,
              fechaCierre: ts,
            }
          : o,
      );
      allRef.current = nuevos;
      setAll(nuevos);
      empujarLogs([nuevoLog(actual, 'OperacionCancelada', `${actual.id} · Servicio cancelado · manual por el responsable`, ts)]);
    },
    [aplicarManual, empujarLogs],
  );

  const forzarExcepcion = useCallback(
    (id: string, tipo: TipoExcepcion) => {
      aplicarManual(id, { forzar: { excepcion: tipo } });
      empujarLogs([nuevoLog(null, 'Sistema', `Novedad forzada para la demo: ${EXCEPCION_LABEL[tipo]}`, relojEn(tickRef.current), 'sistema')]);
    },
    [aplicarManual, empujarLogs],
  );

  // --- Pestaña Agentes ----------------------------------------------------------

  const registrarOperacionExterna = useCallback(
    (o: Operacion) => {
      if (allRef.current.some((x) => x.id === o.id)) return;
      const nuevos = [...allRef.current, o];
      allRef.current = nuevos;
      setAll(nuevos);
      empujarLogs([nuevoLog(o, 'SolicitudRecibida', `${o.id} · Solicitud recibida · ${o.cliente.nombre} · equipo de agentes`, relojEn(tickRef.current))]);
    },
    [empujarLogs],
  );

  const publicarOperacionExterna = useCallback(
    (o: Operacion, mensaje: string, ts: number) => {
      const existe = allRef.current.some((x) => x.id === o.id);
      const nuevos = existe ? allRef.current.map((x) => (x.id === o.id ? o : x)) : [...allRef.current, o];
      allRef.current = nuevos;
      setAll(nuevos);
      const ultimo = o.eventos[o.eventos.length - 1];
      empujarLogs([nuevoLog(o, ultimo?.evento ?? 'Sistema', `${o.id} · ${mensaje}`, ts)]);
    },
    [empujarLogs],
  );

  // --- Derivados -------------------------------------------------------------------

  const operaciones = useMemo(() => {
    return allOperaciones.filter((o) => {
      if (filters.canales.length > 0 && !filters.canales.includes(o.canal)) return false;
      if (filters.etapas.length > 0 && !filters.etapas.includes(o.etapa)) return false;
      if (filters.bloques.length > 0 && !filters.bloques.includes(o.bloque)) return false;
      if (filters.categorias.length > 0 && (!o.excepcion || !filters.categorias.includes(o.excepcion.categoria))) return false;
      if (filters.tipos.length > 0 && (!o.excepcion || !filters.tipos.includes(o.excepcion.tipo))) return false;
      if (filters.busqueda) {
        const q = filters.busqueda.toLowerCase();
        if (
          !o.id.toLowerCase().includes(q) &&
          !o.cliente.nombre.toLowerCase().includes(q) &&
          !o.nodoOrigen.ciudad.toLowerCase().includes(q) &&
          !o.nodoDestino.ciudad.toLowerCase().includes(q) &&
          !o.mercancia.descripcion.toLowerCase().includes(q) &&
          !(o.transportador && o.transportador.nombre.toLowerCase().includes(q)) &&
          !(o.excepcion && EXCEPCION_LABEL[o.excepcion.tipo].toLowerCase().includes(q))
        )
          return false;
      }
      return true;
    });
  }, [allOperaciones, filters]);

  const kpis = useMemo(() => calcularKPIs(allOperaciones, ahora), [allOperaciones, ahora]);
  const canalMetrics = useMemo(() => calcularCanalMetrics(allOperaciones), [allOperaciones]);

  const value = useMemo<SimulationContextType>(
    () => ({
      operaciones,
      allOperaciones,
      logs,
      tick,
      ahora,
      speed,
      isRunning,
      seleccionAutomatica,
      setSeleccionAutomatica,
      kpis,
      canalMetrics,
      filters,
      setFilters,
      play,
      pause,
      stop,
      setSpeed,
      avanzarOperacion,
      decidirOperacion,
      cancelarOperacion,
      forzarExcepcion,
      registrarOperacionExterna,
      publicarOperacionExterna,
    }),
    [
      operaciones,
      allOperaciones,
      logs,
      tick,
      ahora,
      speed,
      isRunning,
      seleccionAutomatica,
      setSeleccionAutomatica,
      kpis,
      canalMetrics,
      filters,
      play,
      pause,
      stop,
      avanzarOperacion,
      decidirOperacion,
      cancelarOperacion,
      forzarExcepcion,
      registrarOperacionExterna,
      publicarOperacionExterna,
    ],
  );

  return <SimulationContext.Provider value={value}>{children}</SimulationContext.Provider>;
}
