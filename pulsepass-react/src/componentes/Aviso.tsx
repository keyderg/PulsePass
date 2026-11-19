import { useEffect } from 'react'
import type { ReactNode } from 'react'
import clsx from 'clsx'
import { IconoAlerta, IconoCerrar, IconoCheck, IconoRayo } from './Iconos'

export type TonoAviso = 'exito' | 'error' | 'info' | 'advertencia'

const estilos: Record<TonoAviso, string> = {
    exito:
        'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300',
    error:
        'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-300',
    info: 'border-indigo-200 bg-marca-50 text-marca-700 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300',
    advertencia:
        'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300',
}

const iconos: Record<TonoAviso, typeof IconoCheck> = {
    exito: IconoCheck,
    error: IconoAlerta,
    info: IconoRayo,
    advertencia: IconoAlerta,
}

export interface AvisoProps {
    tono: TonoAviso
    children: ReactNode
    /** Si se indica, muestra un botón de cierre. */
    onCerrar?: () => void
    /** Cierre automático en ms (usar 4000 en éxitos de mutación). Requiere onCerrar. */
    autoCierreMs?: number
    className?: string
}

export function Aviso({ tono, children, onCerrar, autoCierreMs, className }: AvisoProps) {
    const Icono = iconos[tono]

    useEffect(() => {
        if (!onCerrar || !autoCierreMs) return
        const id = setTimeout(onCerrar, autoCierreMs)
        return () => clearTimeout(id)
    }, [onCerrar, autoCierreMs])

    return (
        <div
            role={tono === 'error' ? 'alert' : 'status'}
            aria-live={tono === 'error' ? 'assertive' : 'polite'}
            className={clsx(
                'flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm',
                estilos[tono],
                className,
            )}
        >
            <Icono className="mt-0.5 size-4" />
            <div className="flex-1">{children}</div>
            {onCerrar ? (
                <button
                    type="button"
                    onClick={onCerrar}
                    aria-label="Cerrar aviso"
                    className="-m-1 rounded p-1 hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-marca-600 dark:hover:bg-white/10"
                >
                    <IconoCerrar className="size-4" />
                </button>
            ) : null}
        </div>
    )
}
