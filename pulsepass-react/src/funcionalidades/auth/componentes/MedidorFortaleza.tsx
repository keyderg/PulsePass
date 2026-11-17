import clsx from 'clsx'
import { calcularFortaleza } from '../fortaleza'

const TOTAL = 8

export function MedidorFortaleza({ clave }: { clave: string }) {
    const { segmentos, etiqueta } = calcularFortaleza(clave)
    return (
        <div>
            <div aria-hidden="true" className="flex gap-1">
                {Array.from({ length: TOTAL }, (_, i) => (
                    <span
                        key={i}
                        className={clsx(
                            'h-1 flex-1 rounded-full',
                            i < segmentos ? 'bg-marca-600' : 'bg-slate-200 dark:bg-slate-700',
                        )}
                    />
                ))}
            </div>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Fortaleza: {etiqueta}</p>
        </div>
    )
}