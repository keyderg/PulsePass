import type { ComponentType } from 'react'
import {
    IconoBalon,
    IconoBirrete,
    IconoCalendario,
    IconoEstrella,
    IconoInstitucion,
    IconoMonitor,
    IconoMusica,
    type IconoProps,
} from '../../componentes/Iconos'
import type { EventCategory } from './tipos'

export interface EstiloCategoria {
    fondo: string
    texto: string
    icono: ComponentType<IconoProps>
}

export const CATEGORIAS: Record<EventCategory, EstiloCategoria> = {
    MUSIC: {
        fondo: 'bg-indigo-100 dark:bg-indigo-950',
        texto: 'text-indigo-800 dark:text-indigo-300',
        icono: IconoMusica,
    },
    TECHNOLOGY: {
        fondo: 'bg-sky-100 dark:bg-sky-950',
        texto: 'text-sky-800 dark:text-sky-300',
        icono: IconoMonitor,
    },
    SPORTS: {
        fondo: 'bg-emerald-100 dark:bg-emerald-950',
        texto: 'text-emerald-800 dark:text-emerald-300',
        icono: IconoBalon,
    },
    CULTURE: {
        fondo: 'bg-rose-100 dark:bg-rose-950',
        texto: 'text-rose-800 dark:text-rose-300',
        icono: IconoInstitucion,
    },
    EDUCATION: {
        fondo: 'bg-amber-100 dark:bg-amber-950',
        texto: 'text-amber-800 dark:text-amber-300',
        icono: IconoBirrete,
    },
    ENTERTAINMENT: {
        fondo: 'bg-violet-100 dark:bg-violet-950',
        texto: 'text-violet-800 dark:text-violet-300',
        icono: IconoEstrella,
    },
}

/** Mientras llega el detalle (categoría desconocida). */
export const SIN_CATEGORIA: EstiloCategoria = {
    fondo: 'bg-slate-100 dark:bg-slate-800',
    texto: 'text-slate-600 dark:text-slate-300',
    icono: IconoCalendario,
}