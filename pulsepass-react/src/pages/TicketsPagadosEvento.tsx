import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Aviso } from '../componentes/Aviso'
import { BadgeEstadoTicket } from '../componentes/Badge'
import { Boton } from '../componentes/Boton'
import { Campo } from '../componentes/Campo'
import { Cargando } from '../componentes/Cargando'
import { CodigoTexto } from '../componentes/CodigoTexto'
import { EstadoError } from '../componentes/EstadoError'
import { EstadoVacio } from '../componentes/EstadoVacio'
import { PrecioCOP } from '../componentes/PrecioCOP'
import { Tabla } from '../componentes/Tabla'
import { Tarjeta } from '../componentes/Tarjeta'
import { NombreTitular } from '../funcionalidades/tickets/componentes/NombreTitular'
import { useTicketsPagadosPorEvento, useUsarTicket } from '../funcionalidades/tickets/hooks'
import type { TicketResponse } from '../funcionalidades/tickets/tipos'
import { tieneEstado } from '../lib/apiError'
import { mensajeDeError } from '../lib/mensajesError'
import { RUTAS } from '../lib/rutas'

export default function TicketsPagadosEvento() {
  const { eventCode = '' } = useParams()
  const navigate = useNavigate()
  const [entrada, setEntrada] = useState(eventCode)
  const consulta = useTicketsPagadosPorEvento(eventCode)
  const usar = useUsarTicket()

  function ir(e: React.SyntheticEvent) {
    e.preventDefault()
    const limpio = entrada.trim()
    if (limpio) void navigate(RUTAS.ticketsPagados(limpio))
  }

  const tickets = consulta.data ?? []
  const accion = (t: TicketResponse) => (
      <Boton
          className="min-h-9 w-full md:w-auto"
          disabled={usar.isPending}
          onClick={() => usar.mutate(t.ticketCode)}
      >
        Usar
      </Boton>
  )

  return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="text-3xl font-bold">Tickets pagados · {eventCode}</h1>
          <form onSubmit={ir} className="flex items-end gap-2">
            <Campo
                etiqueta="Evento"
                value={entrada}
                onChange={(e) => setEntrada(e.target.value)}
                autoComplete="off"
            />
            <Boton type="submit" variante="secundario">
              Ir
            </Boton>
          </form>
        </div>

        {usar.isSuccess ? (
            <Aviso tono="exito" onCerrar={() => usar.reset()} autoCierreMs={4000}>
              Ingreso registrado: {usar.data.ticketCode}
            </Aviso>
        ) : null}
        {usar.isError ? (
            <Aviso tono={tieneEstado(usar.error, 409) ? 'advertencia' : 'error'} onCerrar={() => usar.reset()}>
              {mensajeDeError(usar.error, { noEncontrado: 'Ticket no encontrado' })}
            </Aviso>
        ) : null}

        {consulta.isPending ? <Cargando /> : null}
        {tieneEstado(consulta.error, 404) ? (
            <EstadoVacio mensaje="Evento no encontrado" />
        ) : consulta.isError ? (
            <EstadoError
                mensaje={mensajeDeError(consulta.error)}
                onReintentar={() => void consulta.refetch()}
            />
        ) : null}

        {consulta.data && tickets.length === 0 ? <EstadoVacio mensaje="No hay tickets pagados" /> : null}

        {tickets.length > 0 ? (
            <>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total: {tickets.length}</p>

              <div className="hidden md:block">
                <Tabla
                    descripcion="Tickets pagados del evento"
                    filas={tickets}
                    clave={(t) => t.ticketCode}
                    columnas={[
                      { encabezado: 'Código', celda: (t) => <CodigoTexto>{t.ticketCode}</CodigoTexto> },
                      { encabezado: 'Tipo', celda: (t) => t.type },
                      { encabezado: 'Titular', celda: (t) => <NombreTitular email={t.userEmail} /> },
                      { encabezado: 'Precio', celda: (t) => <PrecioCOP valor={t.price} /> },
                      { encabezado: 'Estado', celda: (t) => <BadgeEstadoTicket estado={t.status} /> },
                      { encabezado: 'Acción', celda: accion },
                    ]}
                />
              </div>

              <ul className="flex flex-col gap-3 md:hidden">
                {tickets.map((t) => (
                    <li key={t.ticketCode}>
                      <Tarjeta className="flex flex-col gap-2 p-4">
                        <div className="flex items-center justify-between">
                          <CodigoTexto className="font-bold">{t.ticketCode}</CodigoTexto>
                          <BadgeEstadoTicket estado={t.status} />
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {t.type} · <NombreTitular email={t.userEmail} /> · <PrecioCOP valor={t.price} />
                        </p>
                        {accion(t)}
                      </Tarjeta>
                    </li>
                ))}
              </ul>
            </>
        ) : null}
      </div>
  )
}