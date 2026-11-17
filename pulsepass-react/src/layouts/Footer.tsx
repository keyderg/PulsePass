import { Link } from 'react-router'
import { RUTAS } from '../lib/rutas'

export function Footer() {
    return (
        <footer className="border-t border-slate-200 dark:border-slate-800">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-6 text-xs text-slate-600 dark:text-slate-400">
                <p>© 2026 PulsePass · Caso de estudio académico</p>
                <nav aria-label="Pie de página" className="flex gap-4">
                    <Link to={RUTAS.sedes} className="hover:underline">
                        Sedes
                    </Link>
                    <Link to={RUTAS.artistas} className="hover:underline">
                        Artistas
                    </Link>
                </nav>
            </div>
        </footer>
    )
}