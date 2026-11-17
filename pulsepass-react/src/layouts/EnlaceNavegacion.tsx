import { Link, useLocation } from 'react-router'
import { claseEnlaceNav, type EnlaceNav } from './enlaces'

interface Props {
    enlace: EnlaceNav
    onClick?: () => void
}

/** Enlace de navegación con estado activo propio (NavLink no permite personalizarlo). */
export function EnlaceNavegacion({ enlace, onClick }: Props) {
    const { pathname } = useLocation()
    const activo = enlace.activa
        ? enlace.activa(pathname)
        : pathname === enlace.a || pathname.startsWith(`${enlace.a}/`)

    return (
        <Link
            to={enlace.a}
            onClick={onClick}
            aria-current={activo ? 'page' : undefined}
            className={claseEnlaceNav({ isActive: activo })}
        >
            {enlace.etiqueta}
        </Link>
    )
}