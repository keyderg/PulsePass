import type { ReactNode } from 'react'
import clsx from 'clsx'

export type TonoBadge = 'borrador' | 'exito' | 'aviso' | 'peligro' | 'finalizado' | 'info' | 'marca'
const tonos: Record<TonoBadge, string> = {
    borrador: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
    exito: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    aviso: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    peligro: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
    finalizado: 'bg-slate-300 text-slate-800 dark:bg-slate-600 dark:text-slate-100',
    info: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
    marca: 'bg-marca-50 text-marca-700 dark:bg-indigo-950 dark:text-indigo-300',
}

// Valores del dominio (uniones literales, sin enum de TS).
export type EstadoEvento = 'DRAFT' | 'PUBLISHED' | 'SOLD_OUT' | 'CANCELLED' | 'FINISHED'
export type EstadoTicket = 'RESERVED' | 'PAID' | 'USED' | 'CANCELLED'


export const tonoEstadoEvento: Record<EstadoEvento, TonoBadge> = {
    DRAFT: 'borrador',
    PUBLISHED: 'exito',
    SOLD_OUT: 'aviso',
    CANCELLED: 'peligro',
    FINISHED: 'finalizado',
}

export const tonoEstadoTicket: Record<EstadoTicket, TonoBadge> = {
    RESERVED: 'info',
    PAID: 'exito',
    USED: 'finalizado',
    CANCELLED: 'peligro',
}

export interface BadgeProps {
    tono: TonoBadge
    children: ReactNode
    className?: string
}

export function Badge({ tono, children, className }: BadgeProps) {
    return (
        <span
            className={clsx(
                'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide',
                tonos[tono],
                className,
            )}
        >
      {children}
    </span>
    )
}

export function BadgeEstadoEvento({ estado }: { estado: EstadoEvento }) {
    return <Badge tono={tonoEstadoEvento[estado]}>{estado}</Badge>
}

export function BadgeEstadoTicket({ estado }: { estado: EstadoTicket }) {
    return <Badge tono={tonoEstadoTicket[estado]}>{estado}</Badge>
}
