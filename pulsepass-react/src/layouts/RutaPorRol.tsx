import { Navigate, Outlet, useLocation } from 'react-router'
import { Cargando } from '../componentes/Cargando'
import { useAuth } from '../funcionalidades/auth/hooks'
import type { Rol } from '../funcionalidades/auth/tipos'
import { RUTAS } from '../lib/rutas'

interface RutaPorRolProps {
    roles: Rol[]
}

/** Solo UX: el servidor aplica la autorización real y su 403 siempre prevalece. */
export default function RutaPorRol({ roles }: RutaPorRolProps) {
    const { sesion } = useAuth()
    const location = useLocation()

    if (sesion.estado === 'cargando') return <Cargando className="mx-auto max-w-md" />
    if (sesion.estado === 'anonimo') {
        return <Navigate to={RUTAS.login} replace state={{ desde: location.pathname + location.search }} />
    }
    if (!roles.some((r) => sesion.usuario.roles.includes(r))) {
        return <Navigate to={RUTAS.sinPermisos} replace />
    }
    return <Outlet />
}