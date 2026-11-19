import clsx from 'clsx'
import { OPCIONES_FILTRO, type FiltroTicket } from '../filtros'

interface Props {
    valor: FiltroTicket
    onCambiar: (valor: FiltroTicket) => void
}

export function FiltroEstadoTicket({ valor, onCambiar }: Props) {
    return (
        <div role="group" aria-label="Filtrar por estado" className="flex flex-wrap gap-2">
            {OPCIONES_FILTRO.map((o) => (
                <button
                    key={o.valor}
                    type="button"
                    aria-pressed={valor === o.valor}
                    onClick={() => onCambiar(o.valor)}
                    className={clsx(
                        'min-h-11 rounded-full border px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-marca-600',
                        valor === o.valor
                            ? 'border-marca-600 bg-marca-600 text-white'
                            : 'border-slate-300 bg-white hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:hover:bg-slate-800',
                    )}
                >
                    {o.etiqueta}
                </button>
            ))}
        </div>
    )
}