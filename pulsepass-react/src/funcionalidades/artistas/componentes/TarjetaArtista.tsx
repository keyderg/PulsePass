import { Link } from 'react-router'
import { RUTAS } from '../../../lib/rutas'
import type { ArtistResponse } from '../tipos'
import { AvatarArtista } from './AvatarArtista'

export function TarjetaArtista({ artista }: { artista: ArtistResponse }) {
  return (
    <Link
      to={RUTAS.artista(artista.id)}
      className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 dark:border-slate-800 dark:bg-slate-900"
    >
      <AvatarArtista id={artista.id} nombre={artista.stageName} tamano="md" />
      <span className="font-titulo font-semibold">{artista.stageName}</span>
      {artista.genre ? (
        <span className="text-xs text-slate-600 dark:text-slate-400">{artista.genre}</span>
      ) : null}
    </Link>
  )
}