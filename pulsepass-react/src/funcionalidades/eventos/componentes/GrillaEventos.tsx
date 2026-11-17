import type { EventoTarjeta } from '../tipos'
import { TarjetaEvento } from './TarjetaEvento'

export function GrillaEventos({ eventos }: { eventos: EventoTarjeta[] }) {
    return (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {eventos.map((e) => (
                <li key={e.eventCode}>
                    <TarjetaEvento evento={e} />
                </li>
            ))}
        </ul>
    )
}