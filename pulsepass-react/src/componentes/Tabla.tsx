import type { ReactNode } from 'react'

export interface ColumnaTabla<T> {
    encabezado: string
    celda: (fila: T) => ReactNode
}

export interface TablaProps<T> {
    columnas: ColumnaTabla<T>[]
    filas: T[]
    /** Clave estable por fila (por ejemplo, su código). */
    clave: (fila: T) => string | number
    /** Descripción accesible de la tabla. */
    descripcion: string
}

export function Tabla<T>({ columnas, filas, clave, descripcion }: TablaProps<T>) {
    return (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-sm">
                <caption className="sr-only">{descripcion}</caption>
                <thead className="bg-slate-100 text-xs text-slate-600 uppercase dark:bg-slate-800 dark:text-slate-300">
                <tr>
                    {columnas.map((columna) => (
                        <th key={columna.encabezado} scope="col" className="px-4 py-3 font-semibold">
                            {columna.encabezado}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
                {filas.map((fila) => (
                    <tr key={clave(fila)}>
                        {columnas.map((columna) => (
                            <td key={columna.encabezado} className="px-4 py-3">
                                {columna.celda(fila)}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    )
}
