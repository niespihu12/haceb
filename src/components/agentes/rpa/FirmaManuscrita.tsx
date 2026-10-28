import { memo, useLayoutEffect, useRef } from 'react';
import { FIRMA_VIEWBOX, firmaPath, type FirmaId } from '@/data/firmas';

/** Geometría del trazo (se mide una sola vez por firma). */
interface Geometria {
  total: number;
  puntos: { x: number; y: number }[];
}

const MUESTRAS = 160;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/**
 * Firma que «se dibuja» según t (0–1). El trazo se revela con
 * strokeDasharray/strokeDashoffset; la longitud y una polilínea de muestra se
 * miden UNA vez en useLayoutEffect (al cambiar de firma), nunca por tick: la
 * punta del bolígrafo (0 < t < 1) se toma de esa muestra. Sin estado React:
 * las propiedades se escriben directamente en el SVG. A t = 1 no hay transición.
 */
function FirmaManuscrita({ firmaId, t, ancho = 220, color = '#1e3a8a' }: {
  firmaId: FirmaId;
  /** 0–1 del trazo. */
  t: number;
  ancho?: number;
  color?: string;
}) {
  const pathRef = useRef<SVGPathElement>(null);
  const puntaRef = useRef<SVGCircleElement>(null);
  const geo = useRef<Geometria | null>(null);
  const d = firmaPath(firmaId);
  const tt = clamp01(t);
  const alto = Math.round((ancho * FIRMA_VIEWBOX.alto) / FIRMA_VIEWBOX.ancho);

  // 1) Medición: solo al cambiar de firma.
  useLayoutEffect(() => {
    const el = pathRef.current;
    geo.current = null;
    if (!el || typeof el.getTotalLength !== 'function') return;
    const total = el.getTotalLength();
    const puntos: { x: number; y: number }[] = [];
    for (let i = 0; i <= MUESTRAS; i++) {
      const p = el.getPointAtLength((total * i) / MUESTRAS);
      puntos.push({ x: p.x, y: p.y });
    }
    geo.current = { total, puntos };
  }, [d]);

  // 2) Pintado: lee lo cacheado y escribe en el DOM (sin medir, sin estado).
  useLayoutEffect(() => {
    const el = pathRef.current;
    const punta = puntaRef.current;
    const g = geo.current;
    if (!el) return;
    if (!g) {
      el.style.strokeDasharray = '';
      el.style.strokeDashoffset = '';
      el.style.opacity = tt > 0 ? '1' : '0';
      if (punta) punta.style.visibility = 'hidden';
      return;
    }
    el.style.opacity = '1';
    el.style.transition = tt >= 1 || tt <= 0 ? 'none' : 'stroke-dashoffset 120ms linear';
    el.style.strokeDasharray = String(g.total);
    el.style.strokeDashoffset = String(g.total * (1 - tt));
    if (punta) {
      const dibujando = tt > 0 && tt < 1;
      punta.style.visibility = dibujando ? 'visible' : 'hidden';
      if (dibujando) {
        const p = g.puntos[Math.min(MUESTRAS, Math.round(tt * MUESTRAS))];
        punta.setAttribute('cx', String(p.x));
        punta.setAttribute('cy', String(p.y));
      }
    }
  }, [d, tt]);

  return (
    <svg
      width={ancho}
      height={alto}
      viewBox={`0 0 ${FIRMA_VIEWBOX.ancho} ${FIRMA_VIEWBOX.alto}`}
      className="block select-none"
      aria-label="Firma manuscrita simulada"
    >
      <path
        ref={pathRef}
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle ref={puntaRef} r={2.6} fill={color} />
    </svg>
  );
}

export default memo(FirmaManuscrita);
