import { Link, useParams } from 'react-router'
import { Badge } from '../componentes/Badge'
import { CodigoTexto } from '../componentes/CodigoTexto'
import { Cargando } from '../componentes/Cargando'
import { EstadoError } from '../componentes/EstadoError'
import { IconoFlechaIzquierda } from '../componentes/Iconos'
import { Tarjeta } from '../componentes/Tarjeta'
import { useSede } from '../funcionalidades/sedes/hooks'
import { tieneEstado } from '../lib/apiError'
import { formatearNumero } from '../lib/formato'
import { mensajeDeError } from '../lib/mensajesError'
import { RUTAS } from '../lib/rutas'
import NoEncontrada from './NoEncontrada'

function Fila({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
      <div className="flex justify-between gap-4 py-3 text-sm">
        <dt className="text-slate-600 dark:text-slate-400">{etiqueta}</dt>
        <dd className="font-semibold">{children}</dd>
      </div>
  )
}

export default function DetalleSede() {
  const { code } = useParams()
  const consulta = useSede(code)

  if (tieneEstado(consulta.error, 404)) return <NoEncontrada />

  return (
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
        <Link
            to={RUTAS.sedes}
            className="flex w-fit items-center gap-1.5 text-sm font-medium text-marca-600 hover:underline dark:text-marca-500"
        >
          <IconoFlechaIzquierda className="size-4" />
          Sedes
        </Link>
        {consulta.isPending ? <Cargando /> : null}
        {consulta.isError ? (
            <EstadoError mensaje={mensajeDeError(consulta.error)} onReintentar={() => void consulta.refetch()} />
        ) : null}
        {consulta.data ? (
            <Tarjeta className="p-6">
              <div className="flex items-start justify-between gap-3">
                <h1 className="text-2xl font-bold">{consulta.data.name}</h1>
                <Badge tono={consulta.data.active ? 'exito' : 'peligro'}>
                  {consulta.data.active ? 'Activa' : 'Inactiva'}
                </Badge>
              </div>
              <dl className="mt-4 divide-y divide-slate-200 dark:divide-slate-800">
                <Fila etiqueta="Código">
                  <CodigoTexto>{consulta.data.code}</CodigoTexto>
                </Fila>
                <Fila etiqueta="Ciudad">{consulta.data.city}</Fila>
                {consulta.data.address ? <Fila etiqueta="Dirección">{consulta.data.address}</Fila> : null}
                <Fila etiqueta="Capacidad">{formatearNumero(consulta.data.capacity)} personas</Fila>
                <Fila etiqueta="Estado">{consulta.data.active ? 'Activa' : 'Inactiva'}</Fila>
              </dl>
            </Tarjeta>
        ) : null}
      </div>
  )
}