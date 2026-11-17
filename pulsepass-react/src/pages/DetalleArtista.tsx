import { Link, useParams } from 'react-router'
import { Badge } from '../componentes/Badge'
import { Cargando } from '../componentes/Cargando'
import { EstadoError } from '../componentes/EstadoError'
import { EstadoVacio } from '../componentes/EstadoVacio'
import { IconoFlechaIzquierda } from '../componentes/Iconos'
import { Tarjeta } from '../componentes/Tarjeta'
import { AvatarArtista } from '../funcionalidades/artistas/componentes/AvatarArtista'
import { useArtista } from '../funcionalidades/artistas/hooks'
import { GrillaEventos } from '../funcionalidades/eventos/componentes/GrillaEventos'
import { useEventosConDetalle, useEventosPorArtista } from '../funcionalidades/eventos/hooks'
import { tieneEstado } from '../lib/apiError'
import { mensajeDeError } from '../lib/mensajesError'
import { leerIdNumerico } from '../lib/navegacion'
import { RUTAS } from '../lib/rutas'
import NoEncontrada from './NoEncontrada'

export default function DetalleArtista() {
  const { id: idTexto } = useParams()
  const id = leerIdNumerico(idTexto)
  const artista = useArtista(id ?? undefined) // id inválido → sin petición
  const eventos = useEventosPorArtista(artista.data?.stageName)
  const tarjetas = useEventosConDetalle(eventos.data)

  if (id === null || tieneEstado(artista.error, 404)) return <NoEncontrada />

  return (
      <div className="flex flex-col gap-6">
        <Link
            to={RUTAS.artistas}
            className="flex w-fit items-center gap-1.5 text-sm font-medium text-marca-600 hover:underline dark:text-marca-500"
        >
          <IconoFlechaIzquierda className="size-4" />
          Artistas
        </Link>

        {artista.isPending ? <Cargando className="max-w-md" /> : null}
        {artista.isError ? (
            <EstadoError mensaje={mensajeDeError(artista.error)} onReintentar={() => void artista.refetch()} />
        ) : null}

        {artista.data ? (
            <>
              <Tarjeta className="flex items-center gap-6 p-6">
                <AvatarArtista id={artista.data.id} nombre={artista.data.stageName} tamano="xl" />
                <div className="flex flex-col gap-2">
                  <h1 className="text-3xl font-bold">{artista.data.stageName}</h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Nombre artístico
                    {artista.data.genre ? ` · ${artista.data.genre}` : ''}
                    {artista.data.country ? ` · ${artista.data.country}` : ''}
                  </p>
                  <div>
                    <Badge tono={artista.data.active ? 'exito' : 'peligro'}>
                      {artista.data.active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </div>
              </Tarjeta>

              <h2 className="text-xl font-bold">Próximos eventos de {artista.data.stageName}</h2>
              {eventos.isPending ? (
                  <Cargando className="max-w-xs" />
              ) : eventos.isError ? (
                  <EstadoError mensaje={mensajeDeError(eventos.error)} onReintentar={() => void eventos.refetch()} />
              ) : tarjetas.length === 0 ? (
                  <EstadoVacio mensaje="Sin eventos próximos" />
              ) : (
                  <GrillaEventos eventos={tarjetas} />
              )}
            </>
        ) : null}
      </div>
  )
}