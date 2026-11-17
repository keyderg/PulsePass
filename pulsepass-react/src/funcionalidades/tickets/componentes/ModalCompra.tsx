import { useNavigate } from 'react-router'
import { Aviso } from '../../../componentes/Aviso'
import { Boton } from '../../../componentes/Boton'
import { Modal } from '../../../componentes/Modal'
import { mensajeDeError } from '../../../lib/mensajesError'
import { RUTAS } from '../../../lib/rutas'
import { useAuth } from '../../auth/hooks'
import type { EventResponse } from '../../eventos/tipos'
import { useComprarTicket } from '../hooks'
import type { TicketType } from '../tipos'
import { FilaDato } from './FilaDato'

interface Props {
    evento: EventResponse
    tipo: TicketType
    onCerrar: () => void
}

export function ModalCompra({ evento, tipo, onCerrar }: Props) {
    const { sesion } = useAuth()
    const navigate = useNavigate()
    const comprar = useComprarTicket()
    // La cuenta sale de la sesión: se muestra, nunca se edita.
    const email = sesion.estado === 'autenticado' ? sesion.usuario.email : ''

    function confirmar() {
        comprar.mutate(
            { eventCode: evento.eventCode, type: tipo },
            { onSuccess: (ticket) => void navigate(RUTAS.confirmacionCompra(ticket.ticketCode)) },
        )
    }

    return (
        <Modal abierto titulo="Confirmar compra" onCerrar={onCerrar}>
            <dl className="mb-4">
                <FilaDato etiqueta="Evento">{evento.name}</FilaDato>
                <FilaDato etiqueta="Tipo">{tipo}</FilaDato>
                <FilaDato etiqueta="Cuenta">{email}</FilaDato>
            </dl>
            {comprar.isError ? (
                <Aviso tono="error" className="mb-4">
                    {mensajeDeError(comprar.error, { noEncontrado: 'Evento no disponible' })}
                </Aviso>
            ) : null}
            <div className="flex justify-end gap-3">
                <Boton variante="secundario" onClick={onCerrar}>
                    Cancelar
                </Boton>
                <Boton cargando={comprar.isPending} onClick={confirmar}>
                    Confirmar
                </Boton>
            </div>
        </Modal>
    )
}