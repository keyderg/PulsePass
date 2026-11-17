export function PaginaPendiente({ titulo, parte }: { titulo: string; parte: number }) {
    return (
        <div>
            <h1 className="text-3xl font-bold">{titulo}</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Pendiente de implementar (Parte {parte}).
            </p>
        </div>
    )
}