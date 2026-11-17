import { useState } from 'react'
import { Aviso } from '../../../componentes/Aviso'
import { Boton } from '../../../componentes/Boton'
import { mensajeDeError } from '../../../lib/mensajesError'
import { AvatarArtista } from '../../artistas/componentes/AvatarArtista'
import { useArtistasActivos } from '../../artistas/hooks'
import { useAsociarArtista } from '../hooks'
import type { EventResponse } from '../tipos'
import { CampoSelect } from './CamposFormulario'

export function AsociarArtista({ evento }: { evento: EventResponse }) {
    const artistas = useArtistasActivos()
    const asociar = useAsociarArtista()
    const [elegido, setElegido] = useState('')

    const asociados = new Set(evento.artists.map((a) => a.id))
    const disponibles = (artistas.data ?? []).filter((a) => !asociados.has(a.id))
    const seleccionado = disponibles.find((a) => String(a.id) === elegido) ?? disponibles[0]

    return (
        <div className="flex flex-col gap-3">
            {evento.artists.length === 0 ? (
                <p className="text-sm text-slate-600 dark:text-slate-400">Aún no hay artistas asociados.</p>
            ) : (
                <ul aria-label="Artistas asociados" className="flex flex-col gap-2">
                    {evento.artists.map((a) => (
                        <li key={a.id} className="flex items-center gap-3 text-sm font-medium">
                            <AvatarArtista id={a.id} nombre={a.stageName} />
                            {a.stageName}
                        </li>
                    ))}
                </ul>
            )}

            {artistas.isError ? (
                <Aviso tono="error">{mensajeDeError(artistas.error)}</Aviso>
            ) : disponibles.length === 0 && artistas.data ? (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    No hay más artistas activos para asociar.
                </p>
            ) : (
                <div className="flex items-end gap-3">
                    <div className="flex-1">
                        <CampoSelect
                            etiqueta="Agregar artista"
                            value={seleccionado ? String(seleccionado.id) : ''}
                            onChange={(e) => setElegido(e.target.value)}
                        >
                            {disponibles.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.stageName}
                                </option>
                            ))}
                        </CampoSelect>
                    </div>
                    <Boton
                        variante="secundario"
                        disabled={!seleccionado}
                        cargando={asociar.isPending}
                        onClick={() => {
                            if (seleccionado) asociar.mutate({ eventCode: evento.eventCode, artista: seleccionado })
                        }}
                    >
                        + Asociar
                    </Boton>
                </div>
            )}

            <div aria-live="polite">
                {asociar.isError ? (
                    <Aviso tono="error">
                        {mensajeDeError(asociar.error, { noEncontrado: 'Evento o artista no encontrado' })}
                    </Aviso>
                ) : null}
            </div>
        </div>
    )
}