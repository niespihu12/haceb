import { useMemo, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { CircleCheck, CircleX, LoaderCircle, Circle, TriangleAlert } from 'lucide-react';
import type { AgenteId, SistemaId } from '@/types/agentes';
import { AGENTES_MAP, SISTEMAS } from '@/data/agentesData';
import { iniciales } from '@/data/agentesUtil';
import { ICONO_AGENTE, type EstadoPaso } from './helpers';

export function AvatarAgente({ id, size = 36, activo = false }: { id: AgenteId; size?: number; activo?: boolean }) {
  const Icono = ICONO_AGENTE[id];
  const color = AGENTES_MAP[id].color;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {activo && (
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{ boxShadow: `0 0 0 2px ${color}55` }}
          animate={{ scale: [1, 1.35, 1], opacity: [0.9, 0, 0.9] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
        />
      )}
      <div
        className="w-full h-full rounded-full flex items-center justify-center text-white shadow-sm"
        style={{ backgroundColor: color }}
      >
        <Icono style={{ width: size * 0.5, height: size * 0.5 }} />
      </div>
    </div>
  );
}

export function AvatarHumano({ nombre, size = 32, color = '#334155' }: { nombre: string; size?: number; color?: string }) {
  return (
    <div
      className="rounded-full flex items-center justify-center font-semibold text-white shrink-0 ring-2 ring-white shadow-sm"
      style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.36 }}
    >
      {iniciales(nombre)}
    </div>
  );
}

export function ChipSistema({ id, latencia }: { id: SistemaId; latencia?: string }) {
  const s = SISTEMAS[id];
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-[1px] rounded text-[10px] font-medium border leading-tight"
      style={{ color: s.color, borderColor: `${s.color}40`, backgroundColor: `${s.color}0d` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
      {s.nombre}
      {latencia && <span className="font-mono opacity-70">{latencia}</span>}
    </span>
  );
}

export function ChipRegla({ codigo }: { codigo: string }) {
  return (
    <span className="inline-flex items-center px-1.5 py-[1px] rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-mono font-semibold leading-tight">
      {codigo}
    </span>
  );
}

export function Spinner({ className = 'w-3.5 h-3.5', color }: { className?: string; color?: string }) {
  return <LoaderCircle className={`${className} animate-spin`} style={color ? { color } : undefined} />;
}

export function IconoEstadoPaso({ estado, color }: { estado: EstadoPaso; color: string }) {
  switch (estado) {
    case 'hecho': return <CircleCheck className="w-4 h-4 text-emerald-600" />;
    case 'fallo': return <CircleX className="w-4 h-4 text-red-600" />;
    case 'en_curso': return <Spinner className="w-4 h-4" color={color} />;
    case 'esperando': return <TriangleAlert className="w-4 h-4 text-amber-500" />;
    default: return <Circle className="w-4 h-4 text-slate-300" />;
  }
}

/* ─── Sello tipo caucho ─── */
export function Sello({ texto, color, className = '' }: { texto: string; color: string; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.6, rotate: -14 }}
      animate={{ opacity: 1, scale: 1, rotate: -8 }}
      transition={{ type: 'spring', stiffness: 420, damping: 18 }}
      className={`inline-block px-3 py-1 rounded-md border-[3px] font-black tracking-[0.18em] text-[13px] uppercase select-none ${className}`}
      style={{ color, borderColor: color, backgroundColor: `${color}0d`, boxShadow: `inset 0 0 0 1px ${color}33` }}
    >
      {texto}
    </motion.div>
  );
}

/* ─── Campo etiqueta/valor que "se escribe" ─── */
export function Campo({ etiqueta, valor, mono = true, visible = true, resaltar = false, ancho = 'auto' }: {
  etiqueta: string; valor: ReactNode; mono?: boolean; visible?: boolean; resaltar?: boolean; ancho?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5 min-w-0" style={{ width: ancho }}>
      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{etiqueta}</span>
      <div className={`h-6 flex items-center rounded px-1.5 border text-[12px] min-w-0 ${visible ? (resaltar ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200') : 'bg-slate-50 border-dashed border-slate-200'}`}>
        {visible ? (
          <motion.span
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            className={`truncate ${mono ? 'font-mono text-slate-800' : 'text-slate-700'}`}
          >
            {valor}
          </motion.span>
        ) : (
          <span className="w-2 h-3 bg-slate-300/70 animate-caret-blink rounded-[1px]" />
        )}
      </div>
    </div>
  );
}

export function Cursor() {
  return <span className="inline-block w-[7px] h-[13px] bg-slate-700 align-middle animate-caret-blink ml-0.5 rounded-[1px]" />;
}

export function BarraProgreso({ valor, color, alto = 4 }: { valor: number; color: string; alto?: number }) {
  return (
    <div className="w-full rounded-full bg-slate-100 overflow-hidden" style={{ height: alto }}>
      <div className="h-full rounded-full transition-[width] duration-150 ease-linear" style={{ width: `${Math.round(valor * 100)}%`, backgroundColor: color }} />
    </div>
  );
}


/* ═══════════════ Escritorio RPA ═══════════════ */

/** Texto que se escribe solo (por palabras o por caracteres) según el progreso 0–1. */
export function TextoEnVivo({ texto, progreso, porPalabras = true, className = '' }: {
  texto: string; progreso: number; porPalabras?: boolean; className?: string;
}) {
  const partes = useMemo(() => (porPalabras ? texto.split(/(\s+)/) : Array.from(texto)), [texto, porPalabras]);
  const n = Math.max(0, Math.min(partes.length, Math.ceil(partes.length * Math.max(0, Math.min(1, progreso)))));
  const visible = partes.slice(0, n).join('');
  return (
    <span className={className}>
      {visible}
      {progreso < 1 && <Cursor />}
    </span>
  );
}

/**
 * Campo de formulario que el agente teclea. `tecleo` (0–1) muestra los primeros
 * caracteres; `pegado` muestra todo; `mascara` pinta «●»; `foco` resalta el borde;
 * `clasico` usa el estilo de formulario de escritorio (estilo clásico).
 */
export function CampoTecleado({
  etiqueta, valor, ancla, tecleo, foco = false, pegado = false, resaltado = false, mascara = false,
  mono = true, visible = true, ancho, clasico = false, className = '',
}: {
  etiqueta?: string; valor: string; ancla: string; tecleo?: number; foco?: boolean; pegado?: boolean;
  resaltado?: boolean; mascara?: boolean; mono?: boolean; visible?: boolean; ancho?: string; clasico?: boolean; className?: string;
}) {
  const escribiendo = tecleo !== undefined && tecleo < 1;
  const mostrado = !visible
    ? ''
    : pegado
      ? valor
      : tecleo === undefined
        ? valor
        : valor.slice(0, Math.floor(tecleo * valor.length));
  const texto = mascara ? '●'.repeat(mostrado.length) : mostrado;
  const borde = clasico
    ? foco ? 'border border-dotted border-black' : 'border-t-slate-500 border-l-slate-500 border-b-white border-r-white border'
    : foco ? 'border-2 border-blue-600' : 'border border-slate-300';
  return (
    <div className={`flex flex-col gap-0.5 min-w-0 ${className}`} style={ancho ? { width: ancho } : undefined}>
      {etiqueta && (
        <span className={clasico ? 'text-[10.5px] text-black' : 'text-[10px] uppercase tracking-wider text-slate-400 font-semibold'}>{etiqueta}</span>
      )}
      <div
        data-ancla={ancla}
        className={`h-5 flex items-center px-1.5 text-[11.5px] min-w-0 ${clasico ? 'bg-white' : 'bg-white rounded'} ${borde} ${resaltado ? '!bg-amber-100' : ''}`}
      >
        {visible ? (
          <span className={`truncate ${mono ? 'font-mono text-slate-800' : 'text-slate-800'}`}>
            {texto}
            {escribiendo && <Cursor />}
          </span>
        ) : (
          <span className="text-slate-400">—</span>
        )}
      </div>
    </div>
  );
}
