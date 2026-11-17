import type { ComponentProps } from 'react'
import clsx from 'clsx'

/** Muestra códigos (CMF-2026, TKT-8F2A1C) en fuente monoespaciada (DES-05). */
export function CodigoTexto({ className, children, ...resto }: ComponentProps<'code'>) {
    return (
        <code className={clsx('font-mono text-[0.9em] tracking-tight', className)} {...resto}>
            {children}
        </code>
    )
}
