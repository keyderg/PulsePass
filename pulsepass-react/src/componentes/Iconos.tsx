import type { ComponentProps, ReactNode } from 'react'
import clsx from 'clsx'

export interface IconoProps extends Omit<ComponentProps<'svg'>, 'children'> {
    /** Si se indica, el ícono es informativo (role="img"); si no, es decorativo (aria-hidden). */
    titulo?: string
}

interface BaseProps extends IconoProps {
    children: ReactNode
}

function Base({ titulo, className, children, ...resto }: BaseProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={clsx('size-5 shrink-0', className)}
            role={titulo ? 'img' : undefined}
            aria-hidden={titulo ? undefined : true}
            focusable="false"
            {...resto}
        >
            {titulo ? <title>{titulo}</title> : null}
            {children}
        </svg>
    )
}

export function IconoMusica(props: IconoProps) {
    return (
        <Base {...props}>
            <path d="M9 18V6l10-2v12" />
            <circle cx="6.5" cy="18" r="2.5" />
            <circle cx="16.5" cy="16" r="2.5" />
        </Base>
    )
}

export function IconoMonitor(props: IconoProps) {
    return (
        <Base {...props}>
            <rect x="3" y="4" width="18" height="12" rx="2" />
            <path d="M8 20h8M12 16v4" />
        </Base>
    )
}

export function IconoBalon(props: IconoProps) {
    return (
        <Base {...props}>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 3v18M3 12h18" />
        </Base>
    )
}

export function IconoInstitucion(props: IconoProps) {
    return (
        <Base {...props}>
            <path d="M3 21h18M5 21V10M19 21V10M9 21V10M15 21V10M3 10l9-6 9 6" />
        </Base>
    )
}

export function IconoBirrete(props: IconoProps) {
    return (
        <Base {...props}>
            <path d="M2 9l10-5 10 5-10 5-10-5z" />
            <path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5M22 9v6" />
        </Base>
    )
}

export function IconoEstrella(props: IconoProps) {
    return (
        <Base {...props}>
            <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3z" />
        </Base>
    )
}

export function IconoCalendario(props: IconoProps) {
    return (
        <Base {...props}>
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 10h18M8 3v4M16 3v4" />
        </Base>
    )
}

export function IconoPin(props: IconoProps) {
    return (
        <Base {...props}>
            <path d="M12 21s7-6.2 7-11.5a7 7 0 10-14 0C5 14.8 12 21 12 21z" />
            <circle cx="12" cy="9.5" r="2.5" />
        </Base>
    )
}

export function IconoBuscar(props: IconoProps) {
    return (
        <Base {...props}>
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
        </Base>
    )
}

export function IconoFlechaIzquierda(props: IconoProps) {
    return (
        <Base {...props}>
            <path d="M19 12H5M11 6l-6 6 6 6" />
        </Base>
    )
}

export function IconoChevronAbajo(props: IconoProps) {
    return (
        <Base {...props}>
            <path d="M6 9l6 6 6-6" />
        </Base>
    )
}

export function IconoAlerta(props: IconoProps) {
    return (
        <Base {...props}>
            <path d="M12 3l10 18H2L12 3z" />
            <path d="M12 10v5M12 18v.01" />
        </Base>
    )
}

export function IconoCheck(props: IconoProps) {
    return (
        <Base {...props}>
            <path d="M5 12.5l4.5 4.5L19 7.5" />
        </Base>
    )
}

export function IconoRayo(props: IconoProps) {
    return (
        <Base {...props}>
            <path d="M13 3L5 14h6l-1 7 8-11h-6l1-7z" />
        </Base>
    )
}

export function IconoBandeja(props: IconoProps) {
    return (
        <Base {...props}>
            <path d="M3 13l3-8h12l3 8v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z" />
            <path d="M3 13h5l1 3h6l1-3h5" />
        </Base>
    )
}

export function IconoUsuario(props: IconoProps) {
    return (
        <Base {...props}>
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
        </Base>
    )
}

export function IconoCerrar(props: IconoProps) {
    return (
        <Base {...props}>
            <path d="M6 6l12 12M18 6L6 18" />
        </Base>
    )
}

export function IconoMenu(props: IconoProps) {
    return (
        <Base {...props}>
            <path d="M4 6h16M4 12h16M4 18h16" />
        </Base>
    )
}

export function IconoLuna(props: IconoProps) {
    return (
        <Base {...props}>
            <path d="M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z" />
        </Base>
    )
}

export function IconoSol(props: IconoProps) {
    return (
        <Base {...props}>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </Base>
    )
}

export function IconoOjo(props: IconoProps) {
    return (
        <Base {...props}>
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
            <circle cx="12" cy="12" r="3" />
        </Base>
    )
}

export function IconoOjoOculto(props: IconoProps) {
    return (
        <Base {...props}>
            <path d="M3 3l18 18" />
            <path d="M10.6 6.1A9.8 9.8 0 0112 5c6.5 0 10 7 10 7a17 17 0 01-3.2 4M6.5 6.9A17 17 0 002 12s3.5 7 10 7a9.7 9.7 0 004-.9" />
        </Base>
    )
}

export function IconoTicket(props: IconoProps) {
    return (
        <Base {...props}>
            <path d="M3 8a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 000 4v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a2 2 0 000-4V8z" />
            <path d="M13 6v12" />
        </Base>
    )
}