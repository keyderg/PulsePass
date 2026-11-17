import { Link } from 'react-router'
import { useAuth } from '../../auth/hooks'
import { RUTAS } from '../../../lib/rutas'

const base =
    'inline-flex min-h-11 items-center justify-center rounded-lg px-5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'

export function HeroInicio() {
    const { sesion } = useAuth()
    return (
        <section className="relative left-1/2 -mt-8 w-screen -translate-x-1/2 bg-linear-to-r from-marca-600 to-acento-500 text-white">
            <div className="mx-auto max-w-6xl px-4 py-12 sm:py-20">
                <h1 className="max-w-md text-3xl font-bold sm:text-5xl">Descubre los mejores eventos</h1>
                <p className="mt-3 max-w-lg text-sm sm:text-base">
                    Música, cultura, deporte y tecnología en un solo lugar.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Link to={RUTAS.eventos} className={`${base} bg-white text-marca-700 hover:bg-marca-50`}>
                        Ver cartelera
                    </Link>
                    {sesion.estado === 'anonimo' ? (
                        <Link to={RUTAS.registro} className={`${base} border border-white/70 hover:bg-white/10`}>
                            Crear cuenta
                        </Link>
                    ) : null}
                </div>
            </div>
        </section>
    )
}