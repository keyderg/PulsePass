import { Aviso } from '../../../componentes/Aviso'
import { Boton } from '../../../componentes/Boton'
import { Modal } from '../../../componentes/Modal'
import { mensajeDeError } from '../../../lib/mensajesError'
import { usePublicarEvento } from '../hooks'
import type { EventResponse } from '../tipos'

interface Props {
    evento: EventResponse
    onCerrar: () => void
}

export function ModalPublicarEvento({ evento, onCerrar }: Props) {
    const publicar = usePublicarEvento()

    return (
        <Modal abierto titulo="Publicar evento" onCerrar={onCerrar}>
            <p className="mb-4 text-sm">
                ¿Quieres publicar <strong>{evento.name}</strong> ({evento.eventCode})? Será visible para todo
                el público.
            </p>
            {publicar.isError ? (
                <Aviso tono="error" className="mb-4">
                    {mensajeDeError(publicar.error, { noEncontrado: 'Evento no encontrado' })}
                </Aviso>
            ) : null}
            <div className="flex justify-end gap-3">
                <Boton variante="secundario" onClick={onCerrar}>
                    Volver
                </Boton>
                <Boton
                    cargando={publicar.isPending}
                    onClick={() => publicar.mutate(evento.eventCode, { onSuccess: onCerrar })}
                >
                    Publicar
                </Boton>
            </div>
        </Modal>
    )
}