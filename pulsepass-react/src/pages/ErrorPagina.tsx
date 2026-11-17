import { isRouteErrorResponse, Link, useNavigate, useRouteError } from 'react-router'
import { Boton, clasesBoton } from '../componentes/Boton'
import { Tarjeta } from '../componentes/Tarjeta'
import { MarcoPagina } from '../layouts/MarcoPagina'
import { MENSAJES } from '../lib/mensajesError'
import { RUTAS } from '../lib/rutas'

function mensajeSeguro(error: unknown): string {
    if (isRouteErrorResponse(error)) {
        if (error.status === 404) return 'No encontramos esta página.'
        if (error.status === 403) return MENSAJES.sinPermisos
    }
    return MENSAJES.inesperado
}

export default function ErrorPagina() {
    const error = useRouteError()
    const navigate = useNavigate()

    return (
        <MarcoPagina>
            <Tarjeta className="flex flex-col gap-3">
                <h1 className="text-2xl font-bold">¡Ups! Algo salió mal.</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">{mensajeSeguro(error)}</p>
                <div className="flex gap-3">
                    <Boton onClick={() => void navigate(0)}>Reintentar</Boton>
                    <Link to={RUTAS.inicio} className={clasesBoton('secundario')}>
                        Volver al inicio
                    </Link>
                </div>
            </Tarjeta>
        </MarcoPagina>
    )
}