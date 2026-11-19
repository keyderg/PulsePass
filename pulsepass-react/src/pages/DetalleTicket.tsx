import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { BadgeEstadoTicket } from '../componentes/Badge'
import { Boton } from '../componentes/Boton'
import { Cargando } from '../componentes/Cargando'
import { CodigoTexto } from '../componentes/CodigoTexto'
import { EstadoError } from '../componentes/EstadoError'
import { IconoFlechaIzquierda } from '../componentes/Iconos'
import { PrecioCOP } from '../componentes/PrecioCOP'
import { Tarjeta } from '../componentes/Tarjeta'
import { FilaDato } from '../funcionalidades/tickets/componentes/FilaDato'
import { ModalConfirmarCancelacion } from '../funcionalidades/tickets/componentes/ModalConfirmarCancelacion'
import { NombreTitular } from '../funcionalidades/tickets/componentes/NombreTitular'
import { useTicket } from '../funcionalidades/tickets/hooks'
import { tieneEstado } from '../lib/apiError'
import { formatearFechaHora } from '../lib/formato'
import { mensajeDeError } from '../lib/mensajesError'
import { RUTAS } from '../lib/rutas'

const volver =
    'flex w-fit items-center gap-1.5 text-sm font-medium text-marca-600 hover:underline dark:text-marca-500'

export default function DetalleTicket() {
  const { ticketCode } = useParams()
  const consulta = useTicket(ticketCode)
  const [cancelando, setCancelando] = useState(false)
  const [copiado, setCopiado] = useState(false)

  const enlaceVolver = (
      <Link to={RUTAS.misTickets} className={volver}>
        <IconoFlechaIzquierda className="size-4" />
        Mis tickets
      </Link>
  )

  // 403/404 se presentan igual: no se revela si el ticket existe.
  if (tieneEstado(consulta.error, 403, 404)) {
    return (
        <div className="flex max-w-2xl flex-col gap-4">
          {enlaceVolver}
          <Tarjeta className="py-10 text-center">
            <h1 className="text-2xl font-bold">Ticket no disponible</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Este ticket no existe o no te pertenece.
            </p>
          </Tarjeta>
        </div>
    )
  }

  async function copiar(codigo: string) {
    try {
      await navigator.clipboard.writeText(codigo)
      setCopiado(true)
    } catch {
      setCopiado(false)
    }
  }

  const ticket = consulta.data

  return (
      <div className="flex max-w-2xl flex-col gap-4">
        {enlaceVolver}
        {consulta.isPending ? <Cargando /> : null}
        {consulta.isError ? (
            <EstadoError
                mensaje={mensajeDeError(consulta.error)}
                onReintentar={() => void consulta.refetch()}
            />
        ) : null}
        {ticket ? (
            <>
              <Tarjeta>
                <div className="mb-2 flex items-start justify-between gap-3">
                  <h1 className="font-titulo text-2xl font-bold">{ticket.eventName}</h1>
                  <BadgeEstadoTicket estado={ticket.status} />
                </div>
                <dl>
                  <FilaDato etiqueta="Código">
                <span className="inline-flex items-center gap-2">
                  <CodigoTexto>{ticket.ticketCode}</CodigoTexto>
                  <Boton variante="secundario" className="min-h-9 px-3" onClick={() => void copiar(ticket.ticketCode)}>
                    {copiado ? 'Copiado' : 'Copiar'}
                  </Boton>
                </span>
                  </FilaDato>
                  <FilaDato etiqueta="Tipo">{ticket.type}</FilaDato>
                  <FilaDato etiqueta="Precio">
                    <PrecioCOP valor={ticket.price} />
                  </FilaDato>
                  {ticket.purchaseDate ? (
                      <FilaDato etiqueta="Comprado el">{formatearFechaHora(ticket.purchaseDate)}</FilaDato>
                  ) : null}
                  <FilaDato etiqueta="Titular">
                    <NombreTitular email={ticket.userEmail} />
                  </FilaDato>
                </dl>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                  Presenta este código en el ingreso.
                </p>
              </Tarjeta>
              {ticket.status === 'PAID' ? (
                  <div className="flex justify-end">
                    <Boton variante="peligro" onClick={() => setCancelando(true)}>
                      Cancelar ticket
                    </Boton>
                  </div>
              ) : null}
              {cancelando ? (
                  <ModalConfirmarCancelacion ticket={ticket} onCerrar={() => setCancelando(false)} />
              ) : null}
            </>
        ) : null}
      </div>
  )
}