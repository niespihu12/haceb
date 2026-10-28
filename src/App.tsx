import { lazy } from 'react'
import { Routes, Route } from 'react-router'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import { SimulationProvider } from '@/context/SimulationContext'
import AgentesBridge from '@/context/AgentesBridge'

// El tablero viaja en el bundle inicial; el resto de vistas se cargan bajo
// demanda. El límite de Suspense vive dentro de Layout para que la barra de
// navegación y los controles de simulación no parpadeen al cambiar de ruta.
const Proceso = lazy(() => import('@/pages/Proceso'))
const Pipeline = lazy(() => import('@/pages/Pipeline'))
const Agentes = lazy(() => import('@/pages/Agentes'))
const Coordinador = lazy(() => import('@/pages/Coordinador'))
const Sistemas = lazy(() => import('@/pages/Sistemas'))
const ControlTower = lazy(() => import('@/pages/ControlTower'))
const Ontologia = lazy(() => import('@/pages/Ontologia'))
const OperacionDetail = lazy(() => import('@/pages/OperacionDetail'))

export default function App() {
  return (
    <SimulationProvider>
      <AgentesBridge />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/proceso" element={<Proceso />} />
          <Route path="/pipeline" element={<Pipeline />} />
          <Route path="/agentes" element={<Agentes />} />
          <Route path="/coordinador" element={<Coordinador />} />
          <Route path="/sistemas" element={<Sistemas />} />
          <Route path="/control-tower" element={<ControlTower />} />
          <Route path="/ontologia" element={<Ontologia />} />
          <Route path="/operacion/:id" element={<OperacionDetail />} />
        </Route>
      </Routes>
    </SimulationProvider>
  )
}
