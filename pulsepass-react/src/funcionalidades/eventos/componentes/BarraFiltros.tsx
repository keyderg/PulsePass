import { useId, useState } from 'react'
import { Boton } from '../../../componentes/Boton'
import { claseBordeNormal, claseControl } from '../../../componentes/Campo'
import { IconoBuscar } from '../../../componentes/Iconos'
import { Selector } from '../../../componentes/Selector'
import type { ArtistResponse } from '../../artistas/tipos'
import type { FiltrosEventos } from '../filtros'
import { EVENT_CATEGORIES } from '../tipos'
import clsx from 'clsx'

interface BarraFiltrosProps {
    filtros: FiltrosEventos
    artistas: ArtistResponse[]
    onCambiar: (parcial: Partial<FiltrosEventos>) => void
    onLimpiar: () => void
}

export function BarraFiltros({ filtros, artistas, onCambiar, onLimpiar }: BarraFiltrosProps) {
    const idBusqueda = useId()
    // Texto local para que escribir no dependa de la navegación (la URL se actualiza con replace).
    const [texto, setTexto] = useState(filtros.q)

    return (
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_14rem_14rem_auto] md:items-end">
            <div className="flex flex-col gap-1">
                <label htmlFor={idBusqueda} className="text-sm font-medium">
                    Buscar por nombre
                </label>
                <div className="relative">
                    <IconoBuscar className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-500" />
                    <input
                        id={idBusqueda}
                        type="search"
                        value={texto}
                        placeholder="Buscar por nombre…"
                        onChange={(e) => {
                            setTexto(e.target.value)
                            onCambiar({ q: e.target.value })
                        }}
                        className={clsx(claseControl, claseBordeNormal, 'pl-9')}
                    />
                </div>
            </div>
            <Selector
                etiqueta="Categoría"
                value={filtros.categoria}
                onChange={(e) => {
                    const v = e.target.value
                    onCambiar({ categoria: EVENT_CATEGORIES.find((c) => c === v) ?? '' })
                }}
            >
                <option value="">Todas</option>
                {EVENT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                        {c}
                    </option>
                ))}
            </Selector>
            <Selector
                etiqueta="Artista"
                value={filtros.artista}
                onChange={(e) => onCambiar({ artista: e.target.value })}
            >
                <option value="">Todos</option>
                {artistas.map((a) => (
                    <option key={a.id} value={a.stageName}>
                        {a.stageName}
                    </option>
                ))}
            </Selector>
            <Boton
                variante="secundario"
                onClick={() => {
                    setTexto('')
                    onLimpiar()
                }}
            >
                Limpiar
            </Boton>
        </div>
    )
}