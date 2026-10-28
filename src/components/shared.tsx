import { Fragment } from 'react'
import { cn } from '@/lib/utils'
import { CATEGORIA_CLASE, CATEGORIA_LABEL, CANAL_INFO, ETAPA_BADGE, ETAPA_LABEL_CORTO, ETAPA_NUMERO } from '@/data/mockData'
import type { Canal, CategoriaDecision, EtapaOperacion } from '@/types'

// ---------------------------------------------------------------------------
// Render de marcado en línea: **negrilla**, `código` y *cursiva*
// (los tramos entre ** corresponden a las negrillas del documento original)
// ---------------------------------------------------------------------------

export function TextoInline({ texto, className }: { texto: string; className?: string }) {
  const partes = texto.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean)
  return (
    <span className={className}>
      {partes.map((parte, i) => {
        if (parte.startsWith('`') && parte.endsWith('`')) {
          return (
            <code key={i} className="font-mono text-[0.92em] bg-slate-100 text-aion-ink px-1.5 py-0.5 rounded">
              {parte.slice(1, -1)}
            </code>
          )
        }
        if (parte.startsWith('**') && parte.endsWith('**')) {
          return (
            <b key={i} className="font-semibold text-aion-ink">
              {parte.slice(2, -2)}
            </b>
          )
        }
        if (parte.startsWith('*') && parte.endsWith('*')) {
          return (
            <i key={i} className="italic text-aion-ink">
              {parte.slice(1, -1)}
            </i>
          )
        }
        return <Fragment key={i}>{parte}</Fragment>
      })}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Badges
// ---------------------------------------------------------------------------

export function CategoriaBadge({ categoria, largo = false, className }: { categoria: CategoriaDecision; largo?: boolean; className?: string }) {
  return (
    <span className={cn('badge-compact font-bold', CATEGORIA_CLASE[categoria], className)} title={CATEGORIA_LABEL[categoria]}>
      {CATEGORIA_LABEL[categoria]}
      {largo && <span className="font-medium ml-1">· supuesto de diseño</span>}
    </span>
  )
}

export function EtapaBadge({ etapa, className }: { etapa: EtapaOperacion; className?: string }) {
  return (
    <span className={cn('badge-compact border', ETAPA_BADGE[etapa], className)}>
      {ETAPA_NUMERO[etapa] > 0 && `[${ETAPA_NUMERO[etapa]}] `}
      {ETAPA_LABEL_CORTO[etapa]}
    </span>
  )
}

export function CanalBadge({ canal, className }: { canal: Canal; className?: string }) {
  const info = CANAL_INFO[canal]
  return (
    <span className={cn('badge-compact font-mono', className)} style={{ backgroundColor: `${info.color}14`, color: info.color }} title={info.label}>
      {info.corto}
    </span>
  )
}

export function TituloSeccion({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2 id={id} className="text-[19px] font-bold text-aion-ink flex items-center gap-2.5 mt-2 scroll-mt-24">
      <span className="w-2.5 h-2.5 rounded-full bg-aion-ink shrink-0" />
      {children}
    </h2>
  )
}

/** Marca visible de lo que no sale del insumo. */
export function SupuestoTag({ className }: { className?: string }) {
  return (
    <span className={cn('badge-compact bg-promesa-light text-promesa-dark border border-promesa/30 font-semibold', className)} title="No sale del insumo: es una decisión de diseño del simulador">
      supuesto de diseño
    </span>
  )
}

/** Marca visible de la operación simulada (datos ficticios). */
export function SimuladoTag({ className }: { className?: string }) {
  return (
    <span className={cn('badge-compact bg-slate-100 text-slate-600 border border-slate-200 font-semibold', className)} title="Dato de la operación simulada: ficticio">
      operación simulada
    </span>
  )
}
