import { DOC_PIE } from '@/data/procesoData'
import { CANALES, CANAL_INFO } from '@/data/mockData'

export default function Footer() {
  return (
    <footer className="border-t border-aion-line bg-white/60">
      <div className="max-w-[1440px] mx-auto px-6 py-3 flex items-center justify-between text-xs text-aion-muted flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span>Haceb · Coordinación logística v0.1</span>
          <span className="text-aion-line">|</span>
          <span>{DOC_PIE}</span>
        </div>
        <div className="hidden lg:flex items-center gap-2 font-mono text-[10.5px]">
          {CANALES.map((c, idx) => (
            <span key={c} className="flex items-center gap-2">
              {idx > 0 && <span className="text-aion-line">|</span>}
              {CANAL_INFO[c].corto}
            </span>
          ))}
        </div>
      </div>
    </footer>
  )
}
