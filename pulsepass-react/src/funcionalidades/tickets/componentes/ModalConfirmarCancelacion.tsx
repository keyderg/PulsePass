import { Aviso } from '../../../componentes/Aviso'
import { Boton } from '../../../componentes/Boton'
import { Modal } from '../../../componentes/Modal'
import { mensajeDeError } from '../../../lib/mensajesError'
import { useCancelarTicket } from '../hooks'
import type { TicketResponse } from '../tipos'

interface Props {
    ticket: TicketResponse
    onCerrar: () => void
}

export function ModalConfirmarCancelacion({ ticket, onCerrar }: Props) {
    const cancelar = useCancelarTicket()

    function confirmar() {
        cancelar.mutate(ticket.ticketCode, { onSuccess: onCerrar })
    }

    return (
        <Modal abierto titulo="Cancelar ticket" onCerrar={onCerrar}>
            <p className="mb-4 text-sm">
                ¿Quieres cancelar el ticket <strong>{ticket.ticketCode}</strong> ({ticket.type}) de{' '}
                {ticket.eventName}?
            </p>
            {cancelar.isError ? (
                <Aviso tono="error" className="mb-4">
                    {mensajeDeError(cancelar.error, { noEncontrado: 'Ticket no disponible' })}
                </Aviso>
            ) : null}
            <div className="flex justify-end gap-3">
                <Boton variante="secundario" onClick={onCerrar}>
                    Volver
                </Boton>
                <Boton variante="peligro" cargando={cancelar.isPending} onClick={confirmar}>
                    Cancelar ticket
                </Boton>
            </div>
        </Modal>
    )
}