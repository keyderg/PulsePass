import { Cargando } from '../componentes/Cargando'
import { EstadoError } from '../componentes/EstadoError'
import { EstadoVacio } from '../componentes/EstadoVacio'
import { TarjetaSede } from '../funcionalidades/sedes/componentes/TarjetaSede'
import { useSedesActivas } from '../funcionalidades/sedes/hooks'
import { mensajeDeError } from '../lib/mensajesError'

export default function ListaSedes() {
  const consulta = useSedesActivas()
  return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold">Sedes</h1>
        {consulta.isPending ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Cargando />
              <Cargando className="max-sm:hidden" />
            </div>
        ) : consulta.isError ? (
            <EstadoError mensaje={mensajeDeError(consulta.error)} onReintentar={() => void consulta.refetch()} />
        ) : consulta.data.length === 0 ? (
            <EstadoVacio mensaje="Aún no hay sedes activas" />
        ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {consulta.data.map((s) => (
                  <li key={s.id}>
                    <TarjetaSede sede={s} />
                  </li>
              ))}
            </ul>
        )}
      </div>
  )
}