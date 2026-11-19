import { Link } from 'react-router'
import { clasesBoton } from '../componentes/Boton'
import { Cargando } from '../componentes/Cargando'
import { EstadoError } from '../componentes/EstadoError'
import { EstadoVacio } from '../componentes/EstadoVacio'
import { AvatarArtista } from '../funcionalidades/artistas/componentes/AvatarArtista'
import { useArtistasActivos } from '../funcionalidades/artistas/hooks'
import { GrillaEventos } from '../funcionalidades/eventos/componentes/GrillaEventos'
import { HeroInicio } from '../funcionalidades/eventos/componentes/HeroInicio'
import { useEventosConDetalle, useEventosPublicados } from '../funcionalidades/eventos/hooks'
import { mensajeDeError } from '../lib/mensajesError'
import { RUTAS } from '../lib/rutas'

const verTodos = 'text-sm font-semibold text-marca-600 hover:underline dark:text-marca-500'

export default function Inicio() {
  const publicados = useEventosPublicados()
  const proximos = useEventosConDetalle(publicados.data?.slice(0, 3))
  const artistas = useArtistasActivos()

  return (
      <div className="flex flex-col gap-10">
        <HeroInicio />

        <section aria-labelledby="titulo-proximos" className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between">
            <h2 id="titulo-proximos" className="text-xl font-bold">
              Próximos eventos
            </h2>
            <Link to={RUTAS.eventos} className={verTodos}>
              Ver todos →
            </Link>
          </div>
          {publicados.isPending ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <Cargando />
                <Cargando className="max-sm:hidden" />
                <Cargando className="max-lg:hidden" />
              </div>
          ) : publicados.isError ? (
              <EstadoError
                  mensaje={mensajeDeError(publicados.error)}
                  onReintentar={() => void publicados.refetch()}
              />
          ) : proximos.length === 0 ? (
              <EstadoVacio
                  mensaje="Aún no hay eventos publicados"
                  accion={
                    <Link to={RUTAS.artistas} className={clasesBoton('secundario')}>
                      Ver artistas
                    </Link>
                  }
              />
          ) : (
              <GrillaEventos eventos={proximos} />
          )}
        </section>

        <section aria-labelledby="titulo-artistas" className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between">
            <h2 id="titulo-artistas" className="text-xl font-bold">
              Artistas destacados
            </h2>
            <Link to={RUTAS.artistas} className={verTodos}>
              Ver todos →
            </Link>
          </div>
          {artistas.isPending ? (
              <div aria-busy="true" className="h-10 w-48 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
          ) : artistas.isError ? (
              <EstadoError
                  mensaje={mensajeDeError(artistas.error)}
                  onReintentar={() => void artistas.refetch()}
              />
          ) : (
              <ul className="flex flex-wrap gap-x-6 gap-y-3">
                {artistas.data.slice(0, 6).map((a) => (
                    <li key={a.id}>
                      <Link to={RUTAS.artista(a.id)} className="flex items-center gap-3 text-sm font-semibold">
                        <AvatarArtista id={a.id} nombre={a.stageName} />
                        {a.stageName}
                      </Link>
                    </li>
                ))}
              </ul>
          )}
        </section>
      </div>
  )
}