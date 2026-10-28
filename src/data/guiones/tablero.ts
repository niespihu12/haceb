import type { AccionUI, DatosCaso } from '@/types/agentes';
import type { CtxGuion, Guion, Guiones } from './tipos';

/* ═══════════════ Helpers compartidos con VentanaTablero ═══════════════ */

/** Fila de la propia operación en el tablero (la resaltada). */
export const filaPropia = (d: DatosCaso) => d.tablero.find(f => f.propia) ?? d.tablero[0];

/** Instantes de los pasos del tablero (compartidos por guion y ventana). */
export const T_TABLERO = {
  /** t0 · cada condición del conductor se marca; luego el veredicto. */
  t0Item1: 0.26, t0Item2: 0.46, t0Item3: 0.64, t0Veredicto: 0.82,
  /** t2 · tecleo de la hora estimada, clic en registrar y sello de registrado. */
  t2TecleoDesde: 0.2, t2Clic: 0.76, t2Registrado: 0.82,
} as const;

/* ═══════════════ Verificación de condiciones seguras (R18) ═══════════════ */

function verificar(c: CtxGuion, ocupado: boolean): ReturnType<Guion> {
  const f = filaPropia(c.d);
  const conductor = c.d.trayectoria[c.d.trayectoria.length - 1].transportador?.conductor ?? 'el conductor';
  const seguro = c.ok;
  const ui: AccionUI[] = [
    { t: 0, tipo: 'ventana', vista: 'tablero.seguimiento' },
    { t: 0.02, hasta: T_TABLERO.t0Veredicto, tipo: 'estado', texto: `Verificando condiciones seguras de ${conductor}…` },
    { t: 0.04, tipo: 'mover', ancla: 'tablero.fila.propia' },
    { t: 0.04, hasta: 0.22, tipo: 'resaltar', ancla: 'tablero.fila.propia', texto: f.operacion },
    { t: T_TABLERO.t0Item1 + 0.02, tipo: 'mover', ancla: 'tablero.item.vehiculo' },
    { t: T_TABLERO.t0Item2 + 0.02, tipo: 'mover', ancla: 'tablero.item.conductor' },
    { t: T_TABLERO.t0Item3 + 0.02, tipo: 'mover', ancla: 'tablero.item.decision' },
    { t: T_TABLERO.t0Veredicto, hasta: 1, tipo: 'toast', texto: seguro ? 'Condiciones seguras: puede atender' : 'Conductor en marcha: no se llama ahora', nivel: seguro ? 'ok' : 'aviso' },
    { t: T_TABLERO.t0Veredicto, hasta: 1, tipo: 'estado', texto: seguro ? `${conductor} puede atender la llamada · POL-SEG-01` : `${conductor} va conduciendo · se difiere y se reprograma · POL-SEG-01`, nivel: seguro ? 'ok' : 'aviso' },
  ];
  return {
    vista: 'tablero.seguimiento',
    ui,
    pensamiento: ocupado || !seguro
      ? `Antes de llamar compruebo en el tablero si ${conductor} puede atender: va en marcha, así que no insisto; aplico R18, cierro el contacto y lo difiero a un momento seguro.`
      : `Antes de llamar a ${conductor} verifico en el tablero que esté en condiciones seguras: vehículo detenido o en parada segura y disponible para atender, como exige R18.`,
  };
}

const t0: Guion = (c: CtxGuion) => verificar(c, false);
const t0Ocupado: Guion = (c: CtxGuion) => verificar(c, true);

/* ═══════════════ Registro del seguimiento (ETA estimada, R19) ═══════════════ */

const t2: Guion = (c: CtxGuion) => {
  const f = filaPropia(c.d);
  const span = Math.min(0.5, Math.max(0.45, 340 / Math.max(1, c.duracion)));
  const hastaTecleo = Math.round((T_TABLERO.t2TecleoDesde + span) * 1000) / 1000;
  const ui: AccionUI[] = [
    { t: 0, tipo: 'ventana', vista: 'tablero.seguimiento' },
    { t: 0.02, hasta: T_TABLERO.t2Registrado, tipo: 'estado', texto: `Registrando el seguimiento de ${f.operacion}…` },
    { t: 0.04, tipo: 'mover', ancla: 'tablero.fila.propia' },
    { t: 0.12, tipo: 'mover', ancla: 'tablero.campo.eta' },
    { t: T_TABLERO.t2TecleoDesde, hasta: hastaTecleo, tipo: 'teclear', ancla: 'tablero.campo.eta', texto: f.eta },
    { t: hastaTecleo + 0.02, tipo: 'mover', ancla: 'tablero.btn.registrar' },
    { t: T_TABLERO.t2Clic, tipo: 'clic', ancla: 'tablero.btn.registrar' },
    { t: T_TABLERO.t2Registrado, hasta: 1, tipo: 'toast', texto: `Seguimiento registrado · llegada estimada ${f.eta}`, nivel: 'ok' },
    { t: T_TABLERO.t2Registrado, hasta: 1, tipo: 'estado', texto: `SeguimientoRegistrado · llegada ${f.eta} rotulada como estimada (R19)`, nivel: 'ok' },
  ];
  return {
    vista: 'tablero.seguimiento',
    ui,
    pensamiento: `Registro el seguimiento de ${f.operacion} y dejo la llegada de las ${f.eta} rotulada como estimada: solo lo confirmado se promete al cliente, como pide R19.`,
  };
};

export const tablero: Guiones = {
  t0,
  'Conductor_ocupado:t0': t0Ocupado,
  t2,
};
