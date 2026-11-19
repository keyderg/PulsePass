import { Link } from 'react-router'
import { Badge } from '../../../componentes/Badge'
import { IconoPin } from '../../../componentes/Iconos'
import { formatearNumero } from '../../../lib/formato'
import { RUTAS } from '../../../lib/rutas'
import type { VenueResponse } from '../tipos'

export function TarjetaSede({ sede }: { sede: VenueResponse }) {
    return (
        <Link
            to={RUTAS.sede(sede.code)}
            className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 dark:border-slate-800 dark:bg-slate-900"
        >
      <span className="flex items-start justify-between gap-2">
        <span className="font-titulo font-semibold">{sede.name}</span>
        <Badge tono={sede.active ? 'exito' : 'peligro'}>{sede.active ? 'Activa' : 'Inactiva'}</Badge>
      </span>
            <span className="flex items-center gap-1.5 text-xs text-marca-700 dark:text-marca-500">
        <IconoPin className="size-3.5" />
                {sede.city} · Cap. {formatearNumero(sede.capacity)}
      </span>
        </Link>
    )
}