import { Link, useParams } from 'react-router'
import { BadgeEstadoTicket } from '../componentes/Badge'
import { clasesBoton } from '../componentes/Boton'
import { Cargando } from '../componentes/Cargando'
import { CodigoTexto } from '../componentes/CodigoTexto'
import { EstadoError } from '../componentes/EstadoError'
import { IconoCheck } from '../componentes/Iconos'
import { PrecioCOP } from '../componentes/PrecioCOP'
import { Tarjeta } from '../componentes/Tarjeta'
import { useTicket } from '../funcionalidades/tickets/hooks'
import { tieneEstado } from '../lib/apiError'
import { mensajeDeError } from '../lib/mensajesError'
import { RUTAS } from '../lib/rutas'

export default function ConfirmacionCompra() {
  const { ticketCode } = useParams()
  const consulta = useTicket(ticketCode)

  if (tieneEstado(consulta.error, 403, 404)) {
    return (
        <Tarjeta className="mx-auto max-w-md py-10 text-center">
          <h1 className="text-2xl font-bold">Ticket no disponible</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Este ticket no existe o no te pertenece.
          </p>
        </Tarjeta>
    )
  }

  const ticket = consulta.data

  return (
      <div className="mx-auto max-w-md">
        {consulta.isPending ? <Cargando /> : null}
        {consulta.isError ? (
            <EstadoError
                mensaje={mensajeDeError(consulta.error)}
                onReintentar={() => void consulta.refetch()}
            />
        ) : null}
        {ticket ? (
            <Tarjeta className="flex flex-col items-center gap-3 py-8 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <IconoCheck className="size-7" />
          </span>
              <h1 className="font-titulo text-2xl font-bold">¡Compra realizada con éxito!</h1>
              <p className="font-semibold">{ticket.eventName}</p>
              <p className="flex flex-wrap items-center justify-center gap-x-1.5 text-sm text-slate-600 dark:text-slate-400">
                Ticket <CodigoTexto>{ticket.ticketCode}</CodigoTexto>
                <span>· {ticket.type} ·</span>
                <PrecioCOP valor={ticket.price} />
              </p>
              <BadgeEstadoTicket estado={ticket.status} />
              <div className="mt-2 flex flex-wrap justify-center gap-3">
                <Link to={RUTAS.misTickets} className={clasesBoton('primario')}>
                  Ver mis tickets
                </Link>
                <Link to={RUTAS.eventos} className={clasesBoton('secundario')}>
                  Seguir explorando
                </Link>
              </div>
            </Tarjeta>
        ) : null}
      </div>
  )
}