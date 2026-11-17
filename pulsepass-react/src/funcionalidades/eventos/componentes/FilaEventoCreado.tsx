import { Link } from 'react-router'
import { BadgeEstadoEvento } from '../../../componentes/Badge'
import { clasesBoton } from '../../../componentes/Boton'
import { CodigoTexto } from '../../../componentes/CodigoTexto'
import { RUTAS } from '../../../lib/rutas'
import { useEvento } from '../hooks'

export function FilaEventoCreado({ eventCode }: { eventCode: string }) {
    const consulta = useEvento(eventCode)
    return (
        <li className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <span className="text-sm">
        <CodigoTexto>{eventCode}</CodigoTexto>
          {consulta.data ? <> · {consulta.data.name}</> : null}
      </span>
            <span className="flex items-center gap-3">
        {consulta.data ? <BadgeEstadoEvento estado={consulta.data.status} /> : null}
                <Link to={RUTAS.adminEvento(eventCode)} className={clasesBoton('secundario')}>
          Gestionar
        </Link>
      </span>
        </li>
    )
}