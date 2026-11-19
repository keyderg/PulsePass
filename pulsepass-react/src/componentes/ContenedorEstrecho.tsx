import type { ReactNode } from 'react'
import clsx from 'clsx'

/** Ancho de lectura (max-w-3xl) para las pantallas de administración. */
export function ContenedorEstrecho({
                                       children,
                                       className,
                                   }: {
    children: ReactNode
    className?: string
}) {
    return <div className={clsx('mx-auto flex w-full max-w-3xl flex-col gap-4', className)}>{children}</div>
}