import { Aviso } from './Aviso'
import { Boton } from './Boton'

export interface EstadoErrorProps {
    mensaje: string
    onReintentar?: () => void
}

export function EstadoError({ mensaje, onReintentar }: EstadoErrorProps) {
    return (
        <div className="flex flex-col items-center gap-3 py-2">
            <Aviso tono="error" className="w-full">
                {mensaje}
            </Aviso>
            {onReintentar ? <Boton onClick={onReintentar}>Reintentar</Boton> : null}
        </div>
    )
}
