import { Navigate, Outlet, useLocation } from 'react-router'
import { Cargando } from '../componentes/Cargando'
import { useAuth } from '../funcionalidades/auth/hooks'
import { RUTAS } from '../lib/rutas'

export default function RutaProtegida() {
    const { sesion } = useAuth()
    const location = useLocation()

    if (sesion.estado === 'cargando') return <Cargando className="mx-auto max-w-md" />
    if (sesion.estado === 'anonimo') {
        return (
            <Navigate
                to={RUTAS.login}
                replace
                state={{
                    desde: location.pathname + location.search,
                    ...(sesion.motivo ? { motivo: sesion.motivo } : {}),
                }}
            />
        )
    }
    return <Outlet />
}