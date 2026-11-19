import type { ReactNode } from 'react'
import { Footer } from './Footer'
import { Navbar } from './Navbar'

/** Navbar + contenido + footer. Lo usan Layout y también ErrorPagina (fuera del Outlet). */
export function MarcoPagina({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col overflow-x-clip has-[[data-barra-fija]]:pb-20 md:has-[[data-barra-fija]]:pb-0">
            <a
                href="#contenido"
                className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-marca-700"
            >
                Saltar al contenido
            </a>
            <Navbar />
            <main id="contenido" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
                {children}
            </main>
            <Footer />
        </div>
    )
}