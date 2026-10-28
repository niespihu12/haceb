import { memo, useEffect, useMemo, useRef, useState, type ComponentType } from 'react';
import { motion } from 'framer-motion';
import { UserRound } from 'lucide-react';
import type { Caso, PasoPlan, VentanaId } from '@/types/agentes';
import { AGENTES_MAP } from '@/data/agentesData';
import { actorActivo, progresoEfectivo, useAnclas, vistaActiva } from '@/components/agentes/guion';
import { formatDuracion, horaCorta } from '@/components/agentes/helpers';
import type { PropsVentana } from './tipos';
import { CROMO, ORDEN_TASKBAR } from './cromo';
import CursorAgente from './CursorAgente';
import VentanaCanal from './ventanas/VentanaCanal';
import VentanaVoz from './ventanas/VentanaVoz';
import VentanaPlataforma from './ventanas/VentanaPlataforma';
import VentanaProveedores from './ventanas/VentanaProveedores';
import VentanaAgenda from './ventanas/VentanaAgenda';
import VentanaRevision from './ventanas/VentanaRevision';
import VentanaTablero from './ventanas/VentanaTablero';
import VentanaMesa from './ventanas/VentanaMesa';
import VentanaExpediente from './ventanas/VentanaExpediente';

export interface PropsEscritorio {
  caso: Caso;
  etapaIdx: number;
  paso?: PasoPlan;
  /** Progreso del paso (0–1); ya cuantizado a 0.02 por Estacion salvo con tecleo activo. */
  progreso: number;
  velocidad: number;
  relojSim: number;
  ahora: number;
  corriendo: boolean;
  /** Se está revisando una etapa ya completada: `progreso` llega como 1 y `paso` es el último con vista. */
  revisando: boolean;
  teatro: boolean;
}

const VENTANAS: Record<VentanaId, ComponentType<PropsVentana>> = {
  canal: VentanaCanal,
  voz: VentanaVoz,
  plataforma: VentanaPlataforma,
  proveedores: VentanaProveedores,
  agenda: VentanaAgenda,
  revision: VentanaRevision,
  tablero: VentanaTablero,
  mesa: VentanaMesa,
  expediente: VentanaExpediente,
};

/** Placeholder por si alguna ventana faltara en el mapa (nunca debería pasar). */
function VentanaEnConstruccion({ vista }: PropsVentana) {
  const id = vista.split('.')[0] as VentanaId;
  const c = CROMO[id];
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-slate-500" style={{ backgroundColor: c?.fondo ?? '#f8fafc' }}>
      <div className="text-[12px] font-semibold">{c?.titulo ?? id}</div>
      <div className="text-[10px] italic">Ventana en construcción</div>
    </div>
  );
}

const COLOR_HUMANO = '#d97706';

/** «Camila Restrepo» → «Camila R.» */
function etiquetaHumano(nombre: string): string {
  const partes = nombre.trim().split(/\s+/);
  if (partes.length < 2) return partes[0] ?? '';
  return `${partes[0]} ${partes[1][0]}.`;
}

/** Ancho por debajo del cual la barra de tareas se compacta (icono solo en ventanas inactivas). */
const ANCHO_COMPACTO = 760;

/**
 * Escritorio de la máquina virtual del agente (RPA-VM-COORD-01): decide qué
 * ventana está al frente según el guion del paso, monta los cursores (agente
 * y, en esperas humanas, el de la persona) y pinta la barra de tareas con los
 * pantallas de los agentes, el indicador de grabación y la sesión.
 * Todo lo visible es función pura de `progreso`; nada avanza por sí solo.
 */
function EscritorioRPA({ caso, etapaIdx, paso, progreso, velocidad, relojSim, ahora, corriendo, revisando, teatro }: PropsEscritorio) {
  const ref = useRef<HTMLDivElement>(null);
  const etapa = caso.plan[etapaIdx];
  const agente = etapa?.agente ?? 'torre';
  const defAgente = AGENTES_MAP[agente];
  // A velocidad ≥ 5 las ventanas y el cursor pintan el estado final: la vista debe decidirse igual.
  const pEf = progresoEfectivo(progreso, velocidad);
  const vista = vistaActiva(caso, etapaIdx, pEf, revisando && etapa ? etapa.pasos.length - 1 : undefined);
  const ventanaId = vista.split('.')[0] as VentanaId;
  const actor = revisando ? 'agente' : actorActivo(paso, pEf);
  const claveVista = `${caso.id}-${vista}`;
  const medir = useAnclas(ref, claveVista);
  const Ventana = VENTANAS[ventanaId] ?? VentanaEnConstruccion;
  const cromoActivo = CROMO[ventanaId];

  // Ancho del escritorio (solo para compactar la barra de tareas); lo entrega el ResizeObserver.
  const [ancho, setAncho] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(entradas => {
      const w = Math.round(entradas[0]?.contentRect.width ?? 0);
      setAncho(prev => (prev === w ? prev : w));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const compacto = ancho > 0 && ancho < ANCHO_COMPACTO;

  // Ventanas ya usadas en etapas anteriores (aparecen "minimizadas" en la barra).
  const hechas = useMemo(() => {
    const s = new Set<VentanaId>();
    caso.plan.slice(0, etapaIdx).forEach(e => e.pasos.forEach(p => {
      if (p.vista) s.add(p.vista.split('.')[0] as VentanaId);
      p.ui?.forEach(a => { if (a.tipo === 'ventana' && a.vista) s.add(a.vista.split('.')[0] as VentanaId); });
    }));
    return s;
  }, [caso.plan, etapaIdx]);
  const esperaHumana = !revisando && paso?.tipo === 'espera_humana' && !!paso.humano;
  const taskbar: VentanaId[] = useMemo(() => {
    const base = [...ORDEN_TASKBAR];
    if (ventanaId === 'mesa' || esperaHumana) base.push('mesa');
    if (agente === 'torre' || ventanaId === 'expediente') base.push('expediente');
    return base;
  }, [ventanaId, esperaHumana, agente]);

  const humano = paso?.humano;
  const sesionCorta = caso.datos.expediente.hash.slice(0, 4);

  return (
    <div
      ref={ref}
      className={`relative w-full flex-1 min-h-0 ${teatro ? '' : 'min-h-[320px] [@media(max-height:840px)]:min-h-[260px]'} rounded-lg overflow-hidden select-none`}
      style={{
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(160deg, #1e293b, #0f172a)',
        backgroundSize: '22px 22px, 100% 100%',
      }}
      data-ancla="escritorio"
    >
      {/* Zona de ventana: la ventana al frente emerge al cambiar de sistema (mismo key dentro del sistema). */}
      <div className="absolute inset-x-2 top-2 bottom-8">
        <motion.div
          key={ventanaId}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: velocidad >= 5 ? 0 : 0.22 }}
          className="absolute inset-0"
        >
          <Ventana caso={caso} vista={vista} paso={paso} progreso={progreso} velocidad={velocidad} actor={actor} medir={medir} relojSim={relojSim} />
        </motion.div>
      </div>

      {/* Cursor del agente: siempre presente; se aparca mientras opera el humano. */}
      <CursorAgente
        contenedorRef={ref}
        medir={medir}
        casoId={caso.id}
        paso={paso}
        progreso={progreso}
        actor="agente"
        etiqueta={defAgente.nombre}
        color={defAgente.color}
        velocidad={velocidad}
        claveVista={claveVista}
        aparcado={actor === 'humano'}
        clasico={cromoActivo?.tipo === 'clasico'}
      />
      {actor === 'humano' && humano && (
        <CursorAgente
          contenedorRef={ref}
          medir={medir}
          casoId={caso.id}
          paso={paso}
          progreso={progreso}
          actor="humano"
          etiqueta={etiquetaHumano(humano.nombre)}
          color={humano.color ?? COLOR_HUMANO}
          velocidad={velocidad}
          claveVista={claveVista}
          clasico={cromoActivo?.tipo === 'clasico'}
        />
      )}

      {/* Barra de tareas */}
      <div
        className="absolute bottom-0 inset-x-0 h-[26px] bg-slate-900/80 backdrop-blur border-t border-white/10 flex items-center px-2 gap-1 text-white overflow-hidden"
        data-ancla="taskbar"
      >
        <span className="w-6 h-5 shrink-0 rounded flex items-center justify-center text-white/60 hover:bg-white/10 text-[12px] leading-none">⊞</span>

        {esperaHumana && humano && (
          <span
            className="h-5 shrink-0 px-1.5 rounded flex items-center gap-1 text-[9.5px] font-medium bg-amber-500/20 border border-amber-400/40 text-amber-200 whitespace-nowrap"
            data-ancla="taskbar.espera"
            title={`${defAgente.nombre} atiende otra operación · esta espera a ${humano.nombre}`}
          >
            <UserRound className="w-3 h-3 text-amber-300" />
            {compacto
              ? <>Espera a <b className="font-semibold">{etiquetaHumano(humano.nombre)}</b></>
              : <>{defAgente.nombre} atiende otra operación · esta espera a <b className="font-semibold">{humano.nombre}</b></>}
          </span>
        )}

        {taskbar.map(id => {
          const c = CROMO[id];
          const activa = id === ventanaId;
          const minimizada = !activa && hechas.has(id);
          const soloIcono = compacto && !activa;
          return (
            <span
              key={id}
              data-ancla={`taskbar.${id}`}
              title={c.titulo}
              className={`h-5 shrink-0 rounded flex items-center gap-1 text-[10px] leading-none whitespace-nowrap ${soloIcono ? 'w-6 justify-center' : 'min-w-[24px] px-1.5'} ${activa ? 'bg-white/15 text-white' : 'text-white/60'}`}
              style={activa ? { boxShadow: `inset 0 -2px 0 ${c.barra}` } : undefined}
            >
              <c.icono className="w-3 h-3 shrink-0" style={activa ? { color: '#fff' } : undefined} />
              {!soloIcono && <span>{c.corto}</span>}
              {minimizada && <span className="w-1 h-1 rounded-full bg-white/40" />}
            </span>
          );
        })}

        <span className="ml-auto flex items-center gap-2 font-mono text-[9.5px] text-white/60 shrink-0 min-w-0">
          <span className="flex items-center gap-1 text-white/85 shrink-0" data-ancla="taskbar.rec" title={corriendo ? 'Grabando la sesión del agente' : 'Grabación en pausa'}>
            <span className={`w-1.5 h-1.5 rounded-full bg-red-500 ${corriendo ? 'animate-rec-blink' : ''}`} />
            REC {formatDuracion(relojSim)}
          </span>
          {!compacto && (
            <span className="truncate" data-ancla="taskbar.sesion">
              {caso.datos.sesion.vm} · {defAgente.nombre} · sesión {sesionCorta}
            </span>
          )}
          {compacto && <span className="truncate" data-ancla="taskbar.sesion">{caso.datos.sesion.vm}</span>}
          <span className="text-white/80 shrink-0" data-ancla="taskbar.hora">{horaCorta(ahora)}</span>
        </span>
      </div>
    </div>
  );
}

export default memo(EscritorioRPA);
