import { Link, useParams } from 'react-router'
import { Cargando } from '../componentes/Cargando'
import { EstadoError } from '../componentes/EstadoError'
import { IconoFlechaIzquierda } from '../componentes/Iconos'
import { Tarjeta } from '../componentes/Tarjeta'
import { CabeceraEvento } from '../funcionalidades/eventos/componentes/CabeceraEvento'
import { PanelCompra } from '../funcionalidades/eventos/componentes/PanelCompra'
import { useEvento } from '../funcionalidades/eventos/hooks'
import { useSede } from '../funcionalidades/sedes/hooks'
import { tieneEstado } from '../lib/apiError'
import { mensajeDeError } from '../lib/mensajesError'
import { RUTAS } from '../lib/rutas'

const volver = 'flex w-fit items-center gap-1.5 text-sm font-medium text-marca-600 hover:underline dark:text-marca-500'

export default function DetalleEvento() {
  const { eventCode } = useParams()
  const consulta = useEvento(eventCode)
  const sede = useSede(consulta.data?.venueCode)

  const enlaceVolver = (
      <Link to={RUTAS.eventos} className={volver}>
        <IconoFlechaIzquierda className="size-4" />
        Volver a la cartelera
      </Link>
  )

  // GAP-02: 404/403 (borrador o inexistente) se presenta igual, sin datos del evento.
  if (tieneEstado(consulta.error, 404, 403)) {
    return (
        <div className="flex flex-col gap-4">
          {enlaceVolver}
          <Tarjeta className="py-10 text-center">
            <h1 className="text-2xl font-bold">Evento no disponible</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Este evento no existe o todavía no está publicado.
            </p>
          </Tarjeta>
        </div>
    )
  }

  return (
      <div className="flex flex-col gap-4">
        {enlaceVolver}
        {consulta.isPending ? <Cargando className="max-w-3xl" /> : null}
        {consulta.isError ? (
            <EstadoError mensaje={mensajeDeError(consulta.error)} onReintentar={() => void consulta.refetch()} />
        ) : null}
        {consulta.data ? (
            <div className="grid items-start gap-6 lg:grid-cols-3">
              <Tarjeta className="overflow-hidden p-0 lg:col-span-2">
                <CabeceraEvento evento={consulta.data} sede={sede.data} />
              </Tarjeta>
              <PanelCompra evento={consulta.data} />
            </div>
        ) : null}
      </div>
  )
}