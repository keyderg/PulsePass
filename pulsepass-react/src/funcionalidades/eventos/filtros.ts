import { EventCategorySchema, type EventCategory, type EventoTarjeta } from './tipos'

export interface FiltrosEventos {
    q: string
    categoria: EventCategory | ''
    artista: string
}

/** Los parámetros de URL son datos externos: se validan con zod. */
export function leerFiltros(params: URLSearchParams): FiltrosEventos {
    const cat = EventCategorySchema.safeParse(params.get('categoria'))
    return {
        q: params.get('q') ?? '',
        categoria: cat.success ? cat.data : '',
        artista: params.get('artista') ?? '',
    }
}

export function aParametros(f: FiltrosEventos): URLSearchParams {
    const p = new URLSearchParams()
    if (f.q) p.set('q', f.q)
    if (f.categoria) p.set('categoria', f.categoria)
    if (f.artista) p.set('artista', f.artista)
    return p
}

const normalizar = (s: string) =>
    s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()

export function filtrarEventos(lista: EventoTarjeta[], f: FiltrosEventos): EventoTarjeta[] {
    const q = normalizar(f.q)
    return lista.filter(
        (e) =>
            (q === '' || normalizar(e.name).includes(q)) &&
            (f.categoria === '' || e.categoria === f.categoria),
    )
}