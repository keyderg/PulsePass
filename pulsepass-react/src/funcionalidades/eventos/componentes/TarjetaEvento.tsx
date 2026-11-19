import clsx from 'clsx'
import { Link } from 'react-router'
import { BadgeEstadoEvento } from '../../../componentes/Badge'
import { IconoCalendario, IconoPin } from '../../../componentes/Iconos'
import { formatearFechaCorta } from '../../../lib/formato'
import { RUTAS } from '../../../lib/rutas'
import { CATEGORIAS, SIN_CATEGORIA } from '../categorias'
import type { EventoTarjeta } from '../tipos'

export function TarjetaEvento({ evento }: { evento: EventoTarjeta }) {
    const estilo = evento.categoria ? CATEGORIAS[evento.categoria] : SIN_CATEGORIA
    const Icono = estilo.icono
    return (
        <Link
            to={RUTAS.evento(evento.eventCode)}
            className="block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 dark:border-slate-800 dark:bg-slate-900"
        >
            <div className={clsx('flex h-28 items-center justify-center sm:h-32', estilo.fondo, estilo.texto)}>
                <Icono className="size-9" />
            </div>
            <div className="flex flex-col gap-1.5 p-4">
                <p className={clsx('min-h-4 text-[11px] font-bold tracking-wide', estilo.texto)}>
                    {evento.categoria ?? ''}
                </p>
                <h3 className="font-titulo text-base font-semibold">{evento.name}</h3>
                <p className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <IconoCalendario className="size-3.5" />
                    {formatearFechaCorta(evento.eventDate)}
                </p>
                <p className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <IconoPin className="size-3.5" />
                    {evento.ciudad ?? evento.venueName}
                </p>
                <div className="mt-1">
                    <BadgeEstadoEvento estado={evento.status} />
                </div>
            </div>
        </Link>
    )
}