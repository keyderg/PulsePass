import { Cargando } from '../componentes/Cargando'
import { EstadoError } from '../componentes/EstadoError'
import { EstadoVacio } from '../componentes/EstadoVacio'
import { TarjetaArtista } from '../funcionalidades/artistas/componentes/TarjetaArtista'
import { useArtistasActivos } from '../funcionalidades/artistas/hooks'
import { mensajeDeError } from '../lib/mensajesError'

export default function ListaArtistas() {
  const consulta = useArtistasActivos()
  return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold">Artistas</h1>
        {consulta.isPending ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Cargando />
              <Cargando className="max-sm:hidden" />
              <Cargando className="max-lg:hidden" />
            </div>
        ) : consulta.isError ? (
            <EstadoError mensaje={mensajeDeError(consulta.error)} onReintentar={() => void consulta.refetch()} />
        ) : consulta.data.length === 0 ? (
            <EstadoVacio mensaje="Aún no hay artistas activos" />
        ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {consulta.data.map((a) => (
                  <li key={a.id}>
                    <TarjetaArtista artista={a} />
                  </li>
              ))}
            </ul>
        )}
      </div>
  )
}