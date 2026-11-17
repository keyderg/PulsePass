import { Navigate, Outlet, useLocation } from 'react-router'
import { Cargando } from '../componentes/Cargando'
import { useAuth } from '../funcionalidades/auth/hooks'
import { leerEstadoNavegacion } from '../lib/navegacion'
import { RUTAS } from '../lib/rutas'

export default function SoloAnonimo() {
    const { sesion } = useAuth()
    const location = useLocation()

    if (sesion.estado === 'cargando') return <Cargando className="mx-auto max-w-md" />
    if (sesion.estado === 'autenticado') {
        // Respeta state.desde: evita la carrera entre esta redirección y el navigate() del login.
        return <Navigate to={leerEstadoNavegacion(location.state).desde ?? RUTAS.inicio} replace />
    }
    return <Outlet />
}