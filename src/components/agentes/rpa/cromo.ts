import {
  Inbox, PhoneCall, LayoutDashboard, Truck, CalendarClock, ListChecks, Radar, UserCheck, FolderOpen, type LucideIcon,
} from 'lucide-react';
import type { VentanaId } from '@/types/agentes';

export type TipoCromo = 'web' | 'escritorio' | 'clasico';

export interface Cromo {
  titulo: string;
  tipo: TipoCromo;
  /** Color de la barra de título. */
  barra: string;
  /** Fondo del cuerpo. */
  fondo: string;
  menu?: string[];
  url?: string;
  icono: LucideIcon;
  /** Nombre corto para la barra de tareas. */
  corto: string;
}

/**
 * Apariencia de cada pantalla del equipo de agentes (nombres funcionales: el
 * insumo no nombra productos). Sin logos ni marcas; los dominios son ficticios.
 */
export const CROMO: Record<VentanaId, Cromo> = {
  canal: { titulo: 'Bandeja de solicitudes', tipo: 'web', barra: '#334155', fondo: '#f8fafc', url: 'solicitudes.coordinacion-cliente.co/bandeja', icono: Inbox, corto: 'Solicitudes' },
  voz: { titulo: 'Consola de voz · Agente de IA', tipo: 'escritorio', barra: '#5b21b6', fondo: '#faf5ff', menu: ['Llamada', 'Transcripción', 'Agenda', 'Ayuda'], icono: PhoneCall, corto: 'Consola de voz' },
  plataforma: { titulo: 'Plataforma de coordinación', tipo: 'web', barra: '#1d4ed8', fondo: '#eff6ff', url: 'plataforma.coordinacion-cliente.co/operaciones', icono: LayoutDashboard, corto: 'Plataforma' },
  proveedores: { titulo: 'Base de proveedores', tipo: 'web', barra: '#0f766e', fondo: '#f0fdfa', url: 'proveedores.coordinacion-cliente.co/transportadores', icono: Truck, corto: 'Proveedores' },
  agenda: { titulo: 'Agenda centralizada de llamadas', tipo: 'web', barra: '#b45309', fondo: '#fffbeb', url: 'agenda.coordinacion-cliente.co/llamadas', icono: CalendarClock, corto: 'Agenda' },
  revision: { titulo: 'Revisiones del proceso', tipo: 'escritorio', barra: '#475569', fondo: '#f1f5f9', menu: ['Archivo', 'Revisión', 'Cruces', 'Ayuda'], icono: ListChecks, corto: 'Revisiones' },
  tablero: { titulo: 'Tablero de seguimiento en ruta', tipo: 'web', barra: '#0f172a', fondo: '#0b1220', url: 'seguimiento.coordinacion-cliente.co/ruta', icono: Radar, corto: 'Seguimiento' },
  mesa: { titulo: 'Mesa del coordinador', tipo: 'web', barra: '#9f1239', fondo: '#fff1f2', url: 'mesa.coordinacion-cliente.co/decisiones', icono: UserCheck, corto: 'Mesa' },
  expediente: { titulo: 'Expediente e historial', tipo: 'escritorio', barra: '#3f3f46', fondo: '#fafaf9', menu: ['Archivo', 'Expediente', 'Historial', 'Ayuda'], icono: FolderOpen, corto: 'Expediente' },
};

/** Orden fijo de la barra de tareas (la Mesa solo con la persona; el Expediente solo con la Torre). */
export const ORDEN_TASKBAR: VentanaId[] = ['canal', 'voz', 'plataforma', 'proveedores', 'agenda', 'revision', 'tablero'];
