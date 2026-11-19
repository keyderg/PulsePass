import { useId } from 'react'
import type { ComponentProps } from 'react'
import clsx from 'clsx'
import { claseBordeError, claseBordeNormal, claseControl } from './Campo'
import { IconoAlerta } from './Iconos'

export interface SelectorProps extends ComponentProps<'select'> {
    etiqueta: string
    error?: string
}

export function Selector({ etiqueta, error, className, id, children, ...resto }: SelectorProps) {
    const idAuto = useId()
    const idCampo = id ?? idAuto
    const idError = `${idCampo}-error`

    return (
        <div className="flex flex-col gap-1">
            <label htmlFor={idCampo} className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {etiqueta}
            </label>
            <select
                id={idCampo}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? idError : undefined}
                className={clsx(claseControl, error ? claseBordeError : claseBordeNormal, className)}
                {...resto}
            >
                {children}
            </select>
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
