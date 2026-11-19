import { useEffect, useId, useRef } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { IconoCerrar } from './Iconos'

export interface ModalProps {
    abierto: boolean
    titulo: string
    onCerrar: () => void
    children: ReactNode
}

const FOCALIZABLES =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function Modal({ abierto, titulo, onCerrar, children }: ModalProps) {
    const idTitulo = useId()
    const panelRef = useRef<HTMLDivElement>(null)

    // Al abrir: enfoca el panel y, al cerrar, devuelve el foco al elemento que lo abrió.
    useEffect(() => {
        if (!abierto) return
        const previo = document.activeElement
        panelRef.current?.focus()
        return () => {
            if (previo instanceof HTMLElement) previo.focus()
        }
    }, [abierto])

    if (!abierto) return null

    function alTeclear(e: KeyboardEvent<HTMLDivElement>) {
        if (e.key === 'Escape') {
            e.stopPropagation()
            onCerrar()
            return
        }
        if (e.key !== 'Tab' || !panelRef.current) return
        const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCALIZABLES))
        const primero = items[0]
        const ultimo = items[items.length - 1]
        if (!primero || !ultimo) {
            e.preventDefault()
            return
        }
        if (
            e.shiftKey &&
            (document.activeElement === primero || document.activeElement === panelRef.current)
        ) {
            e.preventDefault()
            ultimo.focus()
        } else if (!e.shiftKey && document.activeElement === ultimo) {
            e.preventDefault()
            primero.focus()
        }
    }

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onCerrar()
            }}
        >
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={idTitulo}
                tabIndex={-1}
                onKeyDown={alTeclear}
                className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl focus:outline-none dark:bg-slate-900"
            >
                <div className="mb-4 flex items-start justify-between gap-4">
                    <h2 id={idTitulo} className="text-lg font-bold">
                        {titulo}
                    </h2>
                    <button
                        type="button"
                        onClick={onCerrar}
                        aria-label="Cerrar"
                        className="-m-2 flex size-11 items-center justify-center rounded-lg hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-marca-600 dark:hover:bg-slate-800"
                    >
                        <IconoCerrar />
                    </button>
                </div>
                {children}
            </div>
        </div>,
        document.body,
    )
}
