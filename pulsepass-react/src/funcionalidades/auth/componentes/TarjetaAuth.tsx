import type { ReactNode } from 'react'
import clsx from 'clsx'
import { IconoMusica } from '../../../componentes/Iconos'
import { Tarjeta } from '../../../componentes/Tarjeta'

interface TarjetaAuthProps {
    titulo: string
    children: ReactNode
    ancho?: 'sm' | 'lg'
}

const anchos = { sm: 'max-w-sm', lg: 'max-w-lg' } as const

export function TarjetaAuth({ titulo, children, ancho = 'sm' }: TarjetaAuthProps) {
    return (
        <Tarjeta className={clsx('mx-auto w-full p-6 sm:p-8', anchos[ancho])}>
            <div className="mb-4 flex justify-center">
        <span className="flex size-12 items-center justify-center rounded-xl bg-marca-600 text-white">
          <IconoMusica className="size-6" />
        </span>
            </div>
            <h1 className="mb-6 text-center text-2xl font-bold">{titulo}</h1>
            {children}
        </Tarjeta>
    )
}