import { Link } from 'react-router'
import { ContenedorEstrecho } from '../componentes/ContenedorEstrecho'
import { IconoFlechaIzquierda } from '../componentes/Iconos'
import { Tarjeta } from '../componentes/Tarjeta'
import { FormularioCrearEvento } from '../funcionalidades/eventos/componentes/FormularioCrearEvento'
import { RUTAS } from '../lib/rutas'

export default function AdminCrearEvento() {
  return (
      <ContenedorEstrecho className="gap-5">
        <Link
            to={RUTAS.adminEventos}
            className="flex w-fit items-center gap-1.5 text-sm font-medium text-marca-600 hover:underline dark:text-marca-500"
        >
          <IconoFlechaIzquierda className="size-4" />
          Eventos
        </Link>
        <h1 className="text-3xl font-bold">Nuevo evento</h1>
        <Tarjeta className="p-6">
          <FormularioCrearEvento />
        </Tarjeta>
      </ContenedorEstrecho>
  )
}