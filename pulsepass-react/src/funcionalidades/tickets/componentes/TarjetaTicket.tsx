import { Link } from 'react-router'
import { BadgeEstadoTicket } from '../../../componentes/Badge'
import { Boton, clasesBoton } from '../../../componentes/Boton'
import { CodigoTexto } from '../../../componentes/CodigoTexto'
import { PrecioCOP } from '../../../componentes/PrecioCOP'
import { Tarjeta } from '../../../componentes/Tarjeta'
import { formatearFechaCorta } from '../../../lib/formato'
import { RUTAS } from '../../../lib/rutas'
import type { TicketResponse } from '../tipos'

interface Props {
    ticket: TicketResponse
    onCancelar: (ticket: TicketResponse) => void
}

export function TarjetaTicket({ ticket, onCancelar }: Props) {
    return (
        <Tarjeta className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h2 className="font-titulo text-base font-bold">{ticket.eventName}</h2>
                    <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-xs text-slate-600 dark:text-slate-400">
                        <CodigoTexto>{ticket.ticketCode}</CodigoTexto>
                        <span>· {ticket.type} ·</span>
                        <PrecioCOP valor={ticket.price} />
                        {ticket.purchaseDate ? <span>· {formatearFechaCorta(ticket.purchaseDate)}</span> : null}
                    </p>
                </div>
                <BadgeEstadoTicket estado={ticket.status} />
            </div>
            <div className="flex flex-wrap justify-end gap-2">
                <Link to={RUTAS.ticket(ticket.ticketCode)} className={clasesBoton('secundario')}>
                    Ver detalle
                </Link>
                {ticket.status === 'PAID' ? (
                    <Boton variante="peligro" onClick={() => onCancelar(ticket)}>
                        Cancelar
                    </Boton>
                ) : null}
            </div>
        </Tarjeta>
    )
}