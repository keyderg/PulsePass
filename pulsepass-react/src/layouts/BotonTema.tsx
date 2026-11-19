import { IconoLuna, IconoSol } from '../componentes/Iconos'

interface BotonTemaProps {
    oscuro: boolean
    onAlternar: () => void
}

/** Alterna el modo oscuro. El estado vive en Navbar para que las dos copias (escritorio/móvil) no se desincronicen. */
export function BotonTema({ oscuro, onAlternar }: BotonTemaProps) {
    return (
        <button
            type="button"
            aria-label="Modo oscuro"
            aria-pressed={oscuro}
            onClick={onAlternar}
            className="flex size-11 items-center justify-center rounded-lg hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-marca-600 dark:hover:bg-slate-800"
        >
            {oscuro ? <IconoSol /> : <IconoLuna />}
        </button>
    )
}
