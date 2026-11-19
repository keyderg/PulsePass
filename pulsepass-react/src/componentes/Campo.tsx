import { useId } from 'react'
import type { ComponentProps, ReactNode } from 'react'
import clsx from 'clsx'
import { IconoAlerta } from './Iconos'

export interface CampoProps extends ComponentProps<'input'> {
    etiqueta: string
    error?: string
    ayuda?: string
    /** Elemento a la derecha dentro del campo (por ejemplo, mostrar/ocultar contraseña). */
    accion?: ReactNode
}

export const claseControl =
    'min-h-11 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 dark:bg-slate-900 dark:text-slate-100'
export const claseBordeNormal = 'border-slate-300 dark:border-slate-600'
export const claseBordeError = 'border-red-500'

export function Campo({ etiqueta, error, ayuda, accion, className, id, ...resto }: CampoProps) {
    const idAuto = useId()
    const idCampo = id ?? idAuto
    const idError = `${idCampo}-error`
    const idAyuda = `${idCampo}-ayuda`
    const describedBy = [error ? idError : null, ayuda ? idAyuda : null].filter(Boolean).join(' ')

    return (
        <div className="flex flex-col gap-1">
            <label htmlFor={idCampo} className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {etiqueta}
            </label>
            <div className="relative">
                <input
                    id={idCampo}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={describedBy || undefined}
                    className={clsx(
                        claseControl,
                        error ? claseBordeError : claseBordeNormal,
                        accion ? 'pr-11' : null,
                        className,
                    )}
                    {...resto}
                />
                {accion ? (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-1">{accion}</div>
                ) : null}
            </div>
            {ayuda ? (
                <p id={idAyuda} className="text-xs text-slate-600 dark:text-slate-400">
                    {ayuda}
                </p>
            ) : null}
            {error ? (
                <p
                    id={idError}
                    aria-live="polite"
                    className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400"
                >
                    <IconoAlerta className="size-3.5" />
                    {error}
                </p>
            ) : null}
        </div>
    )
}