import { useState } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import { Aviso } from '../componentes/Aviso'
import { BadgeEstadoEvento } from '../componentes/Badge'
import { Boton } from '../componentes/Boton'
import { Cargando } from '../componentes/Cargando'
import { CodigoTexto } from '../componentes/CodigoTexto'
import { ContenedorEstrecho } from '../componentes/ContenedorEstrecho'
import { EstadoError } from '../componentes/EstadoError'
import { IconoFlechaIzquierda } from '../componentes/Iconos'
import { Tarjeta } from '../componentes/Tarjeta'
import { AsociarArtista } from '../funcionalidades/eventos/componentes/AsociarArtista'
import { ModalPublicarEvento } from '../funcionalidades/eventos/componentes/ModalPublicarEvento'
import { useEvento } from '../funcionalidades/eventos/hooks'
import { tieneEstado } from '../lib/apiError'
import { formatearFechaHora } from '../lib/formato'
import { mensajeDeError } from '../lib/mensajesError'
import { leerEstadoNavegacion } from '../lib/navegacion'
import { RUTAS } from '../lib/rutas'

const volver =
    'flex w-fit items-center gap-1.5 text-sm font-medium text-marca-600 hover:underline dark:text-marca-500'

export default function AdminGestionEvento() {
  const { eventCode } = useParams()
  const location = useLocation()
  const consulta = useEvento(eventCode)
  const [publicando, setPublicando] = useState(false)
  const recienCreado = leerEstadoNavegacion(location.state).creado === true

  const enlaceVolver = (
      <Link to={RUTAS.adminEventos} className={volver}>
        <IconoFlechaIzquierda className="size-4" />
        Eventos
      </Link>
  )

  if (tieneEstado(consulta.error, 404)) {
    return (
        <ContenedorEstrecho>
          {enlaceVolver}
          <Tarjeta className="py-10 text-center">
            <h1 className="text-2xl font-bold">Evento no encontrado</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Verifica el código e inténtalo de nuevo.
            </p>
          </Tarjeta>
        </ContenedorEstrecho>
    )
  }

  const evento = consulta.data

  return (
      <ContenedorEstrecho>
        {enlaceVolver}
        {consulta.isPending ? <Cargando /> : null}
        {consulta.isError ? (
            <EstadoError
                mensaje={mensajeDeError(consulta.error)}
                onReintentar={() => void consulta.refetch()}
            />
        ) : null}

        {evento ? (
            <>
              {recienCreado ? <Aviso tono="exito">Evento creado como borrador.</Aviso> : null}

              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-3xl font-bold">{evento.name}</h1>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                    <CodigoTexto>{evento.eventCode}</CodigoTexto> · {evento.category} ·{' '}
                    {formatearFechaHora(evento.eventDate)}
                    {evento.minimumAge != null ? ` · Mín. ${evento.minimumAge}` : ''} · {evento.venueName}
                  </p>
                </div>
                <BadgeEstadoEvento estado={evento.status} />
              </div>

              <Tarjeta className="flex flex-col gap-3">
                <h2 className="text-lg font-bold">Publicación</h2>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    El evento es visible al público una vez publicado.
                  </p>
                  <Boton disabled={evento.status !== 'DRAFT'} onClick={() => setPublicando(true)}>
                    Publicar evento
                  </Boton>
                </div>
              </Tarjeta>

              <Tarjeta className="flex flex-col gap-3">
                <h2 className="text-lg font-bold">Artistas asociados</h2>
                <AsociarArtista evento={evento} />
              </Tarjeta>

              <Link
                  to={RUTAS.ticketsPagados(evento.eventCode)}
                  className="w-fit text-sm font-medium text-marca-600 hover:underline dark:text-marca-500"
              >
                Tickets pagados →
              </Link>

              {publicando ? (
                  <ModalPublicarEvento evento={evento} onCerrar={() => setPublicando(false)} />
              ) : null}
            </>
        ) : null}
      </ContenedorEstrecho>
  )
}