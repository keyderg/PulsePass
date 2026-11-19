import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Boton } from '../../../componentes/Boton'
import { Campo } from '../../../componentes/Campo'
import { BuscarEventoSchema, type BuscarEventoForm } from '../tipos'

interface BuscadorEventoPorCodigoProps {
    etiqueta: string
    textoBoton: string
    /** Código actual (por ejemplo, el de la URL). Si cambia, el campo se actualiza. */
    valorInicial?: string
    onBuscar: (codigo: string) => void
    className?: string
}

/** Formulario RHF + zod: un código obligatorio. Un envío inválido no llama a onBuscar. */
export function BuscadorEventoPorCodigo({
                                            etiqueta,
                                            textoBoton,
                                            valorInicial = '',
                                            onBuscar,
                                            className,
                                        }: BuscadorEventoPorCodigoProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<BuscarEventoForm>({
        resolver: zodResolver(BuscarEventoSchema),
        values: { codigo: valorInicial },
    })

    return (
        <form
            onSubmit={handleSubmit((datos) => onBuscar(datos.codigo))}
            noValidate
            className={className ?? 'flex items-start gap-3'}
        >
            <div className="flex-1">
                <Campo
                    etiqueta={etiqueta}
                    autoComplete="off"
                    error={errors.codigo?.message}
                    {...register('codigo')}
                />
            </div>
            <Boton type="submit" variante="secundario" className="mt-6">
                {textoBoton}
            </Boton>
        </form>
    )
}
