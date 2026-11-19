import { Link, useSearchParams } from 'react-router'
import { Cargando } from '../componentes/Cargando'
import { EstadoError } from '../componentes/EstadoError'
import { EstadoVacio } from '../componentes/EstadoVacio'
import { useArtistaPorNombre, useArtistasActivos } from '../funcionalidades/artistas/hooks'
import { BarraFiltros } from '../funcionalidades/eventos/componentes/BarraFiltros'
import { GrillaEventos } from '../funcionalidades/eventos/componentes/GrillaEventos'
import { aParametros, filtrarEventos, leerFiltros, type FiltrosEventos } from '../funcionalidades/eventos/filtros'
import {
  useEventosConDetalle,
  useEventosPorArtista,
  useEventosPublicados,
} from '../funcionalidades/eventos/hooks'
import { mensajeDeError } from '../lib/mensajesError'
import { RUTAS } from '../lib/rutas'

export default function CatalogoEventos() {
  const [params, setParams] = useSearchParams()
  const filtros = leerFiltros(params)
  const artistas = useArtistasActivos()
  const artistaFiltrado = useArtistaPorNombre(filtros.artista || undefined) // op. 10
  const publicados = useEventosPublicados()
  const porArtista = useEventosPorArtista(filtros.artista || undefined)
  const origen = filtros.artista ? porArtista : publicados
  const eventos = useEventosConDetalle(origen.data)
  const visibles = filtrarEventos(eventos, filtros)
  const hayFiltros = Boolean(filtros.q || filtros.categoria || filtros.artista)

  function cambiar(parcial: Partial<FiltrosEventos>) {
    setParams(aParametros({ ...filtros, ...parcial }), { replace: true })
  }

  return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold">Cartelera</h1>
        <BarraFiltros
            filtros={filtros}
            artistas={artistas.data ?? []}
            onCambiar={cambiar}
            onLimpiar={() => setParams(new URLSearchParams(), { replace: true })}
        />

        {artistaFiltrado.data ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Mostrando eventos de{' '}
              <Link
                  to={RUTAS.artista(artistaFiltrado.data.id)}
                  className="font-medium text-marca-600 hover:underline dark:text-marca-500"
              >
                {artistaFiltrado.data.stageName}
              </Link>
            </p>
        ) : null}

        {origen.isPending ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Cargando />
              <Cargando className="max-sm:hidden" />
              <Cargando className="max-lg:hidden" />
            </div>
        ) : origen.isError ? (
            <EstadoError mensaje={mensajeDeError(origen.error)} onReintentar={() => void origen.refetch()} />
        ) : (
            <>
              <p aria-live="polite" className="text-xs text-slate-600 dark:text-slate-400">
                {visibles.length} {visibles.length === 1 ? 'evento' : 'eventos'}
              </p>
              {visibles.length === 0 ? (
                  <EstadoVacio
                      mensaje={hayFiltros ? 'Sin resultados para tu búsqueda' : 'Aún no hay eventos publicados'}
                  />
              ) : (
                  <GrillaEventos eventos={visibles} />
              )}
            </>
        )}
      </div>
  )
}