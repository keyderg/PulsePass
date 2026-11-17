import { useState } from 'react'
import clsx from 'clsx'
import { Link, useLocation } from 'react-router'
import { Boton, clasesBoton } from '../../../componentes/Boton'
import { Tarjeta } from '../../../componentes/Tarjeta'
import { RUTAS } from '../../../lib/rutas'
import { useAuth } from '../../auth/hooks'
import { TICKET_TYPES, type TicketType } from '../../tickets/tipos'
import type { EventResponse, EventStatus } from '../tipos'

const MOTIVOS: Record<Exclude<EventStatus, 'PUBLISHED'>, string> = {
    DRAFT: 'El evento aún no está disponible para la venta.',
    SOLD_OUT: 'Entradas agotadas.',
    CANCELLED: 'El evento fue cancelado.',
    FINISHED: 'El evento ya finalizó.',
}

interface PanelCompraProps {
    evento: EventResponse
    onComprar?: (tipo: TicketType) => void
}

export function PanelCompra({ evento, onComprar }: PanelCompraProps) {
    const { sesion } = useAuth()
    const location = useLocation()
    const [tipo, setTipo] = useState<TicketType>('GENERAL')

    // STAFF/ADMIN no compran desde la UI (la API autoriza la compra a USER).
    if (sesion.estado === 'autenticado' && !sesion.usuario.roles.includes('USER')) return null

    const motivo = evento.status === 'PUBLISHED' ? null : MOTIVOS[evento.status]
    const idMotivo = 'motivo-compra'

    return (
        <Tarjeta className="flex flex-col gap-3">
            <h2 className="text-base font-semibold">Entradas</h2>
            <fieldset className="flex flex-col gap-2">
                <legend className="mb-1 text-xs text-slate-600 dark:text-slate-400">Tipo de entrada</legend>
                {TICKET_TYPES.map((t) => (
                    <label
                        key={t}
                        className={clsx(
                            'flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-3 text-sm font-medium',
                            tipo === t
                                ? 'border-marca-600 bg-marca-50 dark:border-marca-500 dark:bg-indigo-950'
                                : 'border-slate-200 dark:border-slate-700',
                        )}
                    >
                        <input
                            type="radio"
                            name="tipo-entrada"
                            value={t}
                            checked={tipo === t}
                            onChange={() => setTipo(t)}
                            className="size-4 accent-marca-600"
                        />
                        {t}
                    </label>
                ))}
            </fieldset>

            {motivo ? (
                <>
                    <Boton disabled aria-describedby={idMotivo} className="w-full">
                        Comprar entrada
                    </Boton>
                    <p id={idMotivo} className="text-xs text-slate-600 dark:text-slate-400">
                        {motivo}
                    </p>
                </>
            ) : sesion.estado === 'anonimo' ? (
                <Link
                    to={RUTAS.login}
                    state={{ desde: location.pathname }}
                    className={clasesBoton('primario', 'w-full')}
                >
                    Inicia sesión para comprar
                </Link>
            ) : (
                <Boton
                    disabled={sesion.estado !== 'autenticado'}
                    onClick={() => onComprar?.(tipo)}
                    className="w-full"
                >
                    Comprar entrada
                </Boton>
            )}
            <p className="text-xs text-slate-600 dark:text-slate-400">
                El precio lo define el sistema al confirmar.
            </p>
        </Tarjeta>
    )
}