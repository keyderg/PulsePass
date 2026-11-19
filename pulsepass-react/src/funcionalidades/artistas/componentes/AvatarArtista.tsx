import clsx from 'clsx'

const colores = [
    'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
    'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
    'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300',
]

const tamanos = {
    sm: 'size-10 text-sm',
    md: 'size-16 text-xl',
    xl: 'size-28 text-4xl',
} as const

function iniciales(nombre: string): string {
    const [a, b] = nombre.trim().split(/\s+/)
    return `${a?.charAt(0) ?? ''}${b?.charAt(0) ?? ''}`.toUpperCase()
}

interface AvatarArtistaProps {
    id: number
    nombre: string
    tamano?: keyof typeof tamanos
}

export function AvatarArtista({ id, nombre, tamano = 'sm' }: AvatarArtistaProps) {
    return (
        <span
            aria-hidden="true"
            className={clsx(
                'flex shrink-0 items-center justify-center rounded-full font-bold',
                tamanos[tamano],
                colores[id % colores.length] ?? '',
            )}
        >
      {iniciales(nombre)}
    </span>
    )
}