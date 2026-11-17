import type { ReactNode } from 'react'
import { IconoBandeja } from './Iconos'

export interface EstadoVacioProps {
    mensaje: string
    /** Acción sugerida (por ejemplo un <Boton variante="secundario">). */
    accion?: ReactNode
}

export function EstadoVacio({ mensaje, accion }: EstadoVacioProps) {
    return (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
            <IconoBandeja className="size-8 text-slate-500 dark:text-slate-400" />
            <p className="text-sm font-semibold">{mensaje}</p>
            {accion}
        </div>
    )
}
