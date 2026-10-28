import { memo, useLayoutEffect, useRef, type RefObject } from 'react';
import { animate, motion, useMotionValue } from 'framer-motion';
import { Hourglass } from 'lucide-react';
import type { AccionUI, ActorUI, PasoPlan } from '@/types/agentes';
import {
  dialogoActivo,
  finAccion,
  progresoAccion,
  progresoEfectivo,
  ultimaAccionCursor,
  type Rect,
} from '@/components/agentes/guion';
import TeclaPulsada from './TeclaPulsada';

export interface PropsCursorAgente {
  /** Contenedor del escritorio (el mismo `ref` que recibe `useAnclas`). */
  contenedorRef: RefObject<HTMLDivElement | null>;
  /** `medir` de `useAnclas(ref, claveVista)`: rect relativo al contenedor. */
  medir: (ancla: string) => Rect | undefined;
  casoId: string;
  paso?: PasoPlan;
  /** Progreso crudo del paso (0–1); se aplica `progresoEfectivo` internamente. */
  progreso: number;
  /** A quién representa este cursor. */
  actor: ActorUI;
  /** «Agente Negociador» / «Camila R.». */
  etiqueta: string;
  /** Color del agente; para humano '#d97706'. */
  color: string;
  velocidad: number;
  claveVista: string;
  /** Fuerza el reposo (p. ej. el cursor del agente mientras opera el humano). */
  aparcado?: boolean;
  /** La ventana al frente es clásica (CoreERP): el chip de tecla va sin sombra. */
  clasico?: boolean;
}

interface Punto { x: number; y: number }

/** Anclas que se apuntan al centro (botones, filas, mensajes); el resto al centro-izquierda. */
const RE_CENTRO = /\.(btn|fila|msg|adj|buzon|pestana|tab)\./;

function puntoDe(ancla: string, r: Rect): Punto {
  if (RE_CENTRO.test(ancla)) return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
  return { x: r.x + Math.min(12, r.w / 2), y: r.y + r.h / 2 };
}

const esClic = (a?: AccionUI) => a?.tipo === 'clic' || a?.tipo === 'clicDerecho';

/** Paso sin guion de interfaz (entregas, colas): el cursor descansa. */
const esEntrega = (paso?: PasoPlan) => !!paso && !paso.vista && !(paso.ui?.length);

/**
 * Cursor que flota sobre el escritorio y ejecuta visualmente el guion del paso:
 * se desplaza entre anclas, hace clic (onda), arrastra, muestra el chip de tecla
 * y se convierte en reloj de arena cuando el sistema no responde. Todo deriva
 * de `progreso`; la única transición es la de framer-motion hacia el punto
 * medido (duración 0 a velocidad ≥ 5). Las mediciones ocurren solo al cambiar
 * de acción, de vista o de tamaño (identidad de `medir`), nunca por tick.
 */
function CursorAgente({
  contenedorRef, medir, casoId, paso, progreso, actor, etiqueta, color, velocidad, claveVista, aparcado = false, clasico = false,
}: PropsCursorAgente) {
  const pEf = progresoEfectivo(progreso, velocidad);
  const ultima = ultimaAccionCursor(paso, pEf, actor);
  const accion = ultima?.accion;
  const idxAccion = ultima?.idx ?? -1;
  const humano = actor === 'humano';

  const reposo = aparcado || !paso || esEntrega(paso) || progreso >= 1;
  const arrastre = accion?.tipo === 'arrastrar' ? progresoAccion(accion, pEf) : -1;
  const onda = !reposo && !!accion && esClic(accion) && progresoAccion(accion, pEf) < 1;
  const derecho = !reposo && accion?.tipo === 'clicDerecho';
  const dlg = paso?.tipo === 'espera_sistema' ? dialogoActivo(paso, pEf) : undefined;
  const esperaSistema = !!dlg && dlg.dialogo?.tipo === 'error';
  const accionTecla = !humano && paso?.ui
    ? paso.ui.find(a => a.tipo === 'tecla' && a.tecla && a.t <= pEf && pEf < finAccion(a))
    : undefined;

  // Posición y opacidad como motion values: no re-renderizan y permiten una
  // transición suave hacia el objetivo derivado del progreso.
  const mx = useMotionValue(24);
  const my = useMotionValue(24);
  const mo = useMotionValue(0.6);
  const medida = useRef<{ origen?: Punto; destino?: Punto; ancho: number; alto: number }>({ ancho: 0, alto: 0 });
  const ultimaPos = useRef<Punto | undefined>(undefined);

  // 1) Medición: solo al cambiar de caso, paso, acción, vista o tamaño.
  useLayoutEffect(() => {
    const el = contenedorRef.current;
    const m = medida.current;
    m.ancho = el?.clientWidth ?? 0;
    m.alto = el?.clientHeight ?? 0;
    m.origen = undefined;
    m.destino = undefined;
    if (accion?.ancla) {
      const r = medir(accion.ancla);
      if (r) m.origen = puntoDe(accion.ancla, r);
    }
    if (accion?.tipo === 'arrastrar' && accion.destino) {
      const r = medir(accion.destino);
      if (r) m.destino = puntoDe(accion.destino, r);
    }
    if (m.origen) ultimaPos.current = m.origen;
  }, [casoId, paso?.id, accion, claveVista, medir, contenedorRef]);

  // 2) Objetivo: se recalcula sin medir (lee lo cacheado) y se anima hacia él.
  useLayoutEffect(() => {
    const m = medida.current;
    let destino: Punto;
    let opacidad: number;
    let duracion: number;
    const msAccion = accion && paso ? (finAccion(accion) - accion.t) * paso.duracion : 300;
    const durBase = Math.max(0.1, Math.min(0.45, msAccion / Math.max(1, velocidad) / 1000));

    if (reposo && m.ancho > 0) {
      destino = { x: m.ancho - 40, y: m.alto - 60 };
      opacidad = 0.5;
      duracion = 0.45;
    } else if (accion?.tipo === 'arrastrar' && m.origen && m.destino) {
      const k = Math.max(0, arrastre);
      destino = { x: m.origen.x + (m.destino.x - m.origen.x) * k, y: m.origen.y + (m.destino.y - m.origen.y) * k };
      opacidad = 1;
      duracion = 0.12;
    } else if (m.origen) {
      destino = m.origen;
      opacidad = 1;
      duracion = durBase;
    } else if (ultimaPos.current) {
      destino = ultimaPos.current;
      opacidad = reposo ? 0.5 : 1;
      duracion = 0.3;
    } else {
      // Sin acción iniciada ni posición previa: el cursor «entra» con su primera acción
      // (invisible en la esquina de reposo, no flotando sobre la barra de título).
      destino = m.ancho > 0 ? { x: m.ancho - 40, y: m.alto - 60 } : { x: 24, y: 24 };
      opacidad = 0;
      duracion = 0;
    }
    if (velocidad >= 5) duracion = 0;

    if (duracion === 0) {
      mx.set(destino.x);
      my.set(destino.y);
      mo.set(opacidad);
      return;
    }
    const tr = { duration: duracion, ease: 'easeInOut' as const };
    const cx = animate(mx, destino.x, tr);
    const cy = animate(my, destino.y, tr);
    const co = animate(mo, opacidad, { duration: Math.min(0.25, duracion) });
    return () => { cx.stop(); cy.stop(); co.stop(); };
  }, [casoId, paso, accion, claveVista, medir, reposo, arrastre, velocidad, mx, my, mo]);

  const relleno = humano ? '#fff7ed' : '#ffffff';

  return (
    <>
      <motion.div
        className="absolute left-0 top-0 pointer-events-none z-40"
        style={{ x: mx, y: my, opacity: mo }}
        data-ancla={`cursor.${actor}`}
      >
        {onda && paso && (
          <span
            key={`${paso.id}-${idxAccion}`}
            className="absolute -left-2 -top-2 w-6 h-6 rounded-full border-2 animate-clic-onda"
            style={{ borderColor: color }}
          />
        )}
        <motion.div
          animate={{ rotate: derecho ? -8 : 0 }}
          transition={{ duration: velocidad >= 5 ? 0 : 0.15 }}
          className="relative w-[18px] h-[18px]"
        >
          {esperaSistema ? (
            <Hourglass
              className="w-[18px] h-[18px] animate-spin [animation-duration:3s]"
              style={{ color }}
              strokeWidth={2}
            />
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" className="drop-shadow-sm">
              <path
                d="M3 1.5 L3 14.5 L6.6 11.4 L9 16.4 L11.4 15.3 L9.1 10.4 L14 10.4 Z"
                fill={relleno}
                stroke={color}
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </motion.div>

        {arrastre >= 0 && arrastre < 1 && accion?.texto && (
          <div className="absolute left-3 top-[22px] max-w-[170px] truncate rounded border border-slate-300 bg-slate-100/95 px-1.5 py-0.5 text-[9px] text-slate-700 shadow-md whitespace-nowrap">
            {accion.texto}
          </div>
        )}

        {/* Chip de etiqueta: abajo-derecha de la flecha; aparcado, a la izquierda para no salirse del escritorio. */}
        <span
          className={`absolute rounded-md px-1.5 py-[1px] text-[9px] font-semibold text-white whitespace-nowrap shadow-sm ${reposo ? 'right-0 top-[19px]' : arrastre >= 0 && arrastre < 1 ? 'left-[14px] top-[42px]' : 'left-[14px] top-[17px]'}`}
          style={{ backgroundColor: color }}
        >
          {humano ? `${etiqueta} · humano` : etiqueta}
        </span>
      </motion.div>

      {accionTecla && paso && (
        <TeclaPulsada key={`${paso.id}-${accionTecla.t}`} tecla={accionTecla.tecla ?? ''} clasico={clasico} />
      )}
    </>
  );
}

export default memo(CursorAgente);
