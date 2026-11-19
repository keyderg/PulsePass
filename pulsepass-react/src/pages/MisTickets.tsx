import { useState } from 'react'
import { Link } from 'react-router'
import { Cargando } from '../componentes/Cargando'
import { clasesBoton } from '../componentes/Boton'
import { EstadoError } from '../componentes/EstadoError'
import { EstadoVacio } from '../componentes/EstadoVacio'
import { FiltroEstadoTicket } from '../funcionalidades/tickets/componentes/FiltroEstadoTicket'
import { ModalConfirmarCancelacion } from '../funcionalidades/tickets/componentes/ModalConfirmarCancelacion'
import { TarjetaTicket } from '../funcionalidades/tickets/componentes/TarjetaTicket'
import { filtrarTickets, type FiltroTicket } from '../funcionalidades/tickets/filtros'
import { useMisTickets } from '../funcionalidades/tickets/hooks'
import type { TicketResponse } from '../funcionalidades/tickets/tipos'
import { mensajeDeError } from '../lib/mensajesError'
import { RUTAS } from '../lib/rutas'

export default function MisTickets() {
  const consulta = useMisTickets()
  const [filtro, setFiltro] = useState<FiltroTicket>('TODOS')
  const [aCancelar, setACancelar] = useState<TicketResponse | null>(null)

  const tickets = consulta.data ?? []
  const visibles = filtrarTickets(tickets, filtro)

  return (
      <div className="flex max-w-4xl flex-col gap-5">
        <h1 className="text-3xl font-bold">Mis tickets</h1>

        {consulta.isPending ? <Cargando /> : null}
        {consulta.isError ? (
            <EstadoError
                mensaje={mensajeDeError(consulta.error)}
                onReintentar={() => void consulta.refetch()}
            />
        ) : null}

        {consulta.data && tickets.length === 0 ? (
            <EstadoVacio
                mensaje="Aún no tienes tickets"
                accion={
                  <Link to={RUTAS.eventos} className={clasesBoton('secundario')}>
                    Ver cartelera
                  </Link>
                }
            />
        ) : null}

        {tickets.length > 0 ? (
            <>
              <FiltroEstadoTicket valor={filtro} onCambiar={setFiltro} />
              {visibles.length === 0 ? (
                  <EstadoVacio mensaje="No hay tickets con ese estado" />
              ) : (
                  <ul className="flex flex-col gap-3">
                    {visibles.map((t) => (
                        <li key={t.ticketCode}>
                          <TarjetaTicket ticket={t} onCancelar={setACancelar} />
                        </li>
                    ))}
                  </ul>
              )}
            </>
        ) : null}

        {aCancelar ? (
            <ModalConfirmarCancelacion ticket={aCancelar} onCerrar={() => setACancelar(null)} />
        ) : null}
      </div>
  )
}