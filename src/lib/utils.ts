import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('es-CO').format(value)
}

export function formatPercent(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`
}

/** Valor comercial en pesos colombianos, compacto: $ 84,2 M */
export function formatCOP(value: number): string {
  if (value >= 1_000_000_000) return `$ ${(value / 1_000_000_000).toFixed(2)} MM`
  if (value >= 1_000_000) return `$ ${(value / 1_000_000).toFixed(1)} M`
  if (value >= 1_000) return `$ ${Math.round(value / 1_000)} K`
  return `$ ${Math.round(value)}`
}

export function formatCOPLargo(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

/** Duraciones del proceso: minutos -> "4 h 20 m" */
export function formatDuracion(minutos: number): string {
  if (minutos < 1) return '< 1 m'
  if (minutos < 60) return `${Math.round(minutos)} m`
  const h = Math.floor(minutos / 60)
  const m = Math.round(minutos % 60)
  if (h >= 48) return `${(h / 24).toFixed(1)} d`
  return m === 0 ? `${h} h` : `${h} h ${m} m`
}

export function formatHora(ts: number): string {
  return new Date(ts).toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function formatFecha(ts: number): string {
  return new Date(ts).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/** Fecha con dia de la semana: "vie 25 sep" */
export function formatFechaDia(ts: number): string {
  return new Date(ts).toLocaleDateString('es-CO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export function formatFechaHora(ts: number): string {
  return new Date(ts).toLocaleString('es-CO', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
