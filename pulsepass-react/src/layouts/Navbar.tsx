import { useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { Link } from 'react-router'
import { clasesBoton } from '../componentes/Boton'
import { IconoCerrar, IconoMenu, IconoMusica } from '../componentes/Iconos'
import { useAuth, useSalir } from '../funcionalidades/auth/hooks'
import { RUTAS } from '../lib/rutas'
import { enlacesDeRol, ENLACES_PUBLICOS } from './enlaces'
import { EnlaceNavegacion } from './EnlaceNavegacion'
import { MenuMovil } from './MenuMovil'
import { MenuUsuario } from './MenuUsuario'

export function Navbar() {
    const { sesion } = useAuth()
    const salir = useSalir()
    const [abierto, setAbierto] = useState(false)
    const botonMenu = useRef<HTMLButtonElement>(null)

    const usuario = sesion.estado === 'autenticado' ? sesion.usuario : null
    const enlaces = [...ENLACES_PUBLICOS, ...(usuario ? enlacesDeRol(usuario.roles) : [])]

    function alTeclear(e: KeyboardEvent<HTMLElement>) {
        if (e.key === 'Escape' && abierto) {
            setAbierto(false)
            botonMenu.current?.focus()
        }
    }

    function alSalir() {
        setAbierto(false)
        void salir()
    }

    return (
        <header
            onKeyDown={alTeclear}
            className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95"
        >
            <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
                <Link
                    to={RUTAS.inicio}
                    className="flex items-center gap-2 font-titulo text-lg font-bold focus-visible:outline-2 focus-visible:outline-marca-600"
                >
                    <span className="flex size-8 items-center justify-center rounded-lg bg-marca-600 text-white">
                        <IconoMusica className="size-4" />
                    </span>
                    PulsePass
                </Link>

                <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
                    {enlaces.map((e) => (
                        <EnlaceNavegacion key={e.a} enlace={e} />
                    ))}
                </nav>

                <div className="ml-auto hidden items-center gap-2 md:flex">
                    {usuario ? (
                        <MenuUsuario
                            nombre={usuario.nombre}
                            mostrarTickets={usuario.roles.includes('USER')}
                            onSalir={alSalir}
                        />
                    ) : (
                        <>
                            <Link to={RUTAS.login} className={clasesBoton('fantasma')}>
                                Ingresar
                            </Link>
                            <Link to={RUTAS.registro} className={clasesBoton('primario')}>
                                Registrarse
                            </Link>
                        </>
                    )}
                </div>

                <button
                    ref={botonMenu}
                    type="button"
                    aria-expanded={abierto}
                    aria-controls={abierto ? 'menu-movil' : undefined}
                    aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
                    onClick={() => setAbierto((v) => !v)}
                    className="ml-auto flex size-11 items-center justify-center rounded-lg hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-marca-600 md:hidden dark:hover:bg-slate-800"
                >
                    {abierto ? <IconoCerrar /> : <IconoMenu />}
                </button>
            </div>

            {abierto ? (
                <MenuMovil
                    enlaces={enlaces}
                    autenticado={usuario !== null}
                    onNavegar={() => setAbierto(false)}
                    onSalir={alSalir}
                />
            ) : null}
        </header>
    )
}