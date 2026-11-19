import { Link } from 'react-router'
import { RUTAS } from '../lib/rutas'
import { clasesBoton } from './Boton'
import { Tarjeta } from './Tarjeta'

interface PaginaCodigoProps {
    codigo: string
    mensaje: string
}

export function PaginaCodigo({ codigo, mensaje }: PaginaCodigoProps) {
    return (
        <Tarjeta className="mx-auto flex max-w-xl flex-col items-center gap-4 py-10 text-center">
            <h1 className="text-6xl font-bold text-marca-600 dark:text-marca-500">{codigo}</h1>
            <p>{mensaje}</p>
            <Link to={RUTAS.inicio} className={clasesBoton('primario')}>
                Volver al inicio
            </Link>
        </Tarjeta>
    )
}