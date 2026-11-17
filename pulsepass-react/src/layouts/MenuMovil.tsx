import { Link } from 'react-router'
import { Boton, clasesBoton } from '../componentes/Boton'
import { RUTAS } from '../lib/rutas'
import type { EnlaceNav } from './enlaces'
import { EnlaceNavegacion } from './EnlaceNavegacion'


interface MenuMovilProps {
    enlaces: EnlaceNav[]
    autenticado: boolean
    onNavegar: () => void
    onSalir: () => void
}

export function MenuMovil({ enlaces, autenticado, onNavegar, onSalir }: MenuMovilProps) {
    return (
        <nav
            id="menu-movil"
            aria-label="Menú móvil"
            className="border-t border-slate-200 px-4 py-3 md:hidden dark:border-slate-800"
        >
            <ul className="flex flex-col">
                {enlaces.map((e) => (
                    <li key={e.a}>
                        <EnlaceNavegacion enlace={e} onClick={onNavegar} />
                    </li>
                ))}
            </ul>
            <div className="mt-3 flex gap-2 border-t border-slate-200 pt-3 dark:border-slate-800">
                {autenticado ? (
                    <>
                        <Link to={RUTAS.cuenta} onClick={onNavegar} className={clasesBoton('secundario')}>
                            Mi cuenta
                        </Link>
                        <Boton variante="primario" onClick={onSalir}>
                            Salir
                        </Boton>
                    </>
                ) : (
                    <>
                        <Link to={RUTAS.login} onClick={onNavegar} className={clasesBoton('secundario')}>
                            Ingresar
                        </Link>
                        <Link to={RUTAS.registro} onClick={onNavegar} className={clasesBoton('primario')}>
                            Registrarse
                        </Link>
                    </>
                )}
            </div>
        </nav>
    )
}