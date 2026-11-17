import type { ComponentProps } from 'react'
import clsx from 'clsx'

export type VarianteBoton = 'primario' | 'secundario' | 'peligro' | 'fantasma'

const variantes: Record<VarianteBoton, string> = {
    primario: 'bg-marca-600 text-white hover:bg-marca-700',
    secundario:
        'border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800',
    peligro: 'bg-red-600 text-white hover:bg-red-700',
    fantasma:
        'bg-transparent text-marca-600 hover:bg-marca-50 dark:text-marca-500 dark:hover:bg-slate-800',
}

export function clasesBoton(variante: VarianteBoton = 'primario', className?: string): string {
    return clsx(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600',
        'disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:hover:bg-slate-200 dark:disabled:bg-slate-800 dark:disabled:text-slate-400',
        variantes[variante],
        className,
    )
}

export interface BotonProps extends ComponentProps<'button'> {
    variante?: VarianteBoton
    cargando?: boolean
}

export function Boton({
                          variante = 'primario',
                          cargando = false,
                          disabled,
                          className,
                          children,
                          type = 'button',
                          ...resto
                      }: BotonProps) {
    return (
        <button
            type={type}
            disabled={disabled || cargando}
            aria-busy={cargando || undefined}
            className={clasesBoton(variante, className)}
            {...resto}
        >
            {cargando ? 'Cargando…' : children}
        </button>
    )
}