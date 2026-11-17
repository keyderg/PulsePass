import type { ReactNode } from 'react'

export function FilaDato({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
    return (
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 py-2.5 text-sm last:border-b-0 dark:border-slate-800">
            <dt className="text-slate-600 dark:text-slate-400">{etiqueta}</dt>
            <dd className="text-right font-medium">{children}</dd>
        </div>
    )
}