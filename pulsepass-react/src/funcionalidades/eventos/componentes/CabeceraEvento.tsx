import clsx from 'clsx'
import { Link } from 'react-router'
import { BadgeEstadoEvento } from '../../../componentes/Badge'
import { IconoCalendario, IconoInstitucion, IconoUsuario } from '../../../componentes/Iconos'
import { formatearFechaHora, formatearNumero } from '../../../lib/formato'
import { RUTAS } from '../../../lib/rutas'
import { AvatarArtista } from '../../artistas/componentes/AvatarArtista'
import type { VenueResponse } from '../../sedes/tipos'
import { CATEGORIAS } from '../categorias'
import type { EventResponse } from '../tipos'

interface CabeceraEventoProps {
    evento: EventResponse
    sede: VenueResponse | undefined
}

export function CabeceraEvento({ evento, sede }: CabeceraEventoProps) {
    const estilo = CATEGORIAS[evento.category]
    const Icono = estilo.icono
    return (
        <>
            <div className={clsx('flex h-40 items-center justify-center sm:h-60', estilo.fondo, estilo.texto)}>
                <Icono className="size-14 sm:size-20" />
            </div>
            <div className="flex flex-col gap-3 p-5 sm:p-6">
                <p className="flex items-center gap-2">
          <span className={clsx('text-[11px] font-bold tracking-wide', estilo.texto)}>
            {evento.category}
          </span>
                    <BadgeEstadoEvento estado={evento.status} />
                </p>
                <h1 className="text-3xl font-bold">{evento.name}</h1>
                <p className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-slate-600 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <IconoCalendario className="size-4" />
              {formatearFechaHora(evento.eventDate)}
          </span>
                    {evento.minimumAge != null ? (
                        <span className="flex items-center gap-1.5">
              <IconoUsuario className="size-4" />
              Edad mínima: {evento.minimumAge}
            </span>
                    ) : null}
                </p>
                {evento.description ? <p className="text-sm">{evento.description}</p> : null}

                <h2 className="mt-2 text-base font-semibold">Artistas</h2>
                {evento.artists.length === 0 ? (
                    <p className="text-sm text-slate-600 dark:text-slate-400">Aún no hay artistas asociados.</p>
                ) : (
                    <ul className="flex flex-wrap gap-4">
                        {evento.artists.map((a) => (
                            <li key={a.id}>
                                <Link to={RUTAS.artista(a.id)} className="flex items-center gap-2 text-sm">
                                    <AvatarArtista id={a.id} nombre={a.stageName} />
                                    <span className="max-sm:sr-only">{a.stageName}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}

                <h2 className="mt-2 text-base font-semibold">Sede</h2>
                <Link
                    to={RUTAS.sede(evento.venueCode)}
                    className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                    <IconoInstitucion className="size-5 text-marca-600 dark:text-marca-500" />
                    <span className="flex flex-col">
            <span className="text-sm font-semibold">{evento.venueName}</span>
                        {sede ? (
                            <span className="text-xs text-slate-600 dark:text-slate-400">
                {sede.city} · Capacidad {formatearNumero(sede.capacity)}
              </span>
                        ) : null}
          </span>
                </Link>
            </div>
        </>
    )
}