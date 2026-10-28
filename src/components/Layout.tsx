import { Outlet } from 'react-router'
import { Suspense, useState } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import PresentationModal from './PresentationModal'

function CargandoVista() {
  return (
    <div className="max-w-[1440px] mx-auto px-6 py-24 flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-captura-light border-t-captura animate-spin" />
      <p className="text-sm text-aion-muted">Cargando vista...</p>
    </div>
  )
}

export default function Layout() {
  const [presentationOpen, setPresentationOpen] = useState(false)

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#F7F8FA]">
      <Navbar onPresentationMode={() => setPresentationOpen(true)} />
      <main className="flex-1 pt-4">
        <Suspense fallback={<CargandoVista />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <PresentationModal open={presentationOpen} onClose={() => setPresentationOpen(false)} />
    </div>
  )
}
