import clsx from 'clsx'

export interface CargandoProps {
    className?: string
}

/** Esqueleto con la forma de una tarjeta de contenido (imagen + 3 líneas). */
export function Cargando({ className }: CargandoProps) {
    return (
        <div
            aria-busy="true"
            aria-label="Cargando"
            role="status"
            className={clsx('flex animate-pulse flex-col gap-3', className)}
        >
            <div className="h-28 rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="h-3 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-4/5 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-3 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
        </div>
    )
}
