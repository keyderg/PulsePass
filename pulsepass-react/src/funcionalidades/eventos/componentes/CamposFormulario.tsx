import { useId } from 'react'
import type { ComponentProps } from 'react'
import clsx from 'clsx'
import { claseBordeError, claseBordeNormal, claseControl } from '../../../componentes/Campo'
import { IconoAlerta } from '../../../componentes/Iconos'

function MensajeError({ id, mensaje }: { id: string; mensaje: string }) {
    return (
        <p id={id} aria-live="polite" className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
            <IconoAlerta className="size-3.5" />
            {mensaje}
        </p>
    )
}

interface CampoSelectProps extends ComponentProps<'select'> {
    etiqueta: string
    error?: string
}

export function CampoSelect({ etiqueta, error, className, id, children, ...resto }: CampoSelectProps) {
    const idAuto = useId()
    const idCampo = id ?? idAuto
    const idError = `${idCampo}-error`
    return (
        <div className="flex flex-col gap-1">
            <label htmlFor={idCampo} className="text-sm font-medium">
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
            {error ? <MensajeError id={idError} mensaje={error} /> : null}
        </div>
    )
}

interface CampoAreaProps extends ComponentProps<'textarea'> {
    etiqueta: string
    error?: string
    contador?: string
}

export function CampoArea({ etiqueta, error, contador, className, id, ...resto }: CampoAreaProps) {
    const idAuto = useId()
    const idCampo = id ?? idAuto
    const idError = `${idCampo}-error`
    return (
        <div className="flex flex-col gap-1">
            <label htmlFor={idCampo} className="text-sm font-medium">
                {etiqueta}
            </label>
            <textarea
                id={idCampo}
                rows={4}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? idError : undefined}
                className={clsx(claseControl, 'py-2', error ? claseBordeError : claseBordeNormal, className)}
                {...resto}
            />
            <div className="flex justify-between gap-2">
                <div>{error ? <MensajeError id={idError} mensaje={error} /> : null}</div>
                {contador ? (
                    <span className="text-xs text-slate-600 dark:text-slate-400">{contador}</span>
                ) : null}
            </div>
        </div>
    )
}