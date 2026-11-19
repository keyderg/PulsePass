import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Aviso } from './Aviso'
import { Modal } from './Modal'

describe('Modal', () => {
    it('no renderiza nada cuando está cerrado', () => {
        render(
            <Modal abierto={false} titulo="Cancelar ticket" onCerrar={() => undefined}>
                contenido
            </Modal>,
        )
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('abierto: tiene role=dialog, aria-modal y está nombrado por su título', () => {
        render(
            <Modal abierto titulo="Cancelar ticket" onCerrar={() => undefined}>
                contenido
            </Modal>,
        )
        const dialogo = screen.getByRole('dialog', { name: 'Cancelar ticket' })
        expect(dialogo).toHaveAttribute('aria-modal', 'true')
        expect(dialogo).toHaveFocus()
    })

    it('cierra con Escape', async () => {
        const onCerrar = vi.fn()
        render(
            <Modal abierto titulo="Título" onCerrar={onCerrar}>
                <button>Acción</button>
            </Modal>,
        )
        await userEvent.keyboard('{Escape}')
        expect(onCerrar).toHaveBeenCalledOnce()
    })

    it('cierra con el botón Cerrar', async () => {
        const onCerrar = vi.fn()
        render(
            <Modal abierto titulo="Título" onCerrar={onCerrar}>
                contenido
            </Modal>,
        )
        await userEvent.click(screen.getByRole('button', { name: 'Cerrar' }))
        expect(onCerrar).toHaveBeenCalledOnce()
    })

    it('atrapa el foco con Tab', async () => {
        render(
            <Modal abierto titulo="Título" onCerrar={() => undefined}>
                <button>Última</button>
            </Modal>,
        )
        const ultima = screen.getByRole('button', { name: 'Última' })
        ultima.focus()
        await userEvent.tab()
        expect(screen.getByRole('button', { name: 'Cerrar' })).toHaveFocus()
    })

    it('devuelve el foco al elemento que lo abrió', async () => {
        const { rerender } = render(
            <>
                <button>Abrir</button>
                <Modal abierto={false} titulo="T" onCerrar={() => undefined}>
                    x
                </Modal>
            </>,
        )
        const abrir = screen.getByRole('button', { name: 'Abrir' })
        abrir.focus()
        rerender(
            <>
                <button>Abrir</button>
                <Modal abierto titulo="T" onCerrar={() => undefined}>
                    x
                </Modal>
            </>,
        )
        rerender(
            <>
                <button>Abrir</button>
                <Modal abierto={false} titulo="T" onCerrar={() => undefined}>
                    x
                </Modal>
            </>,
        )
        expect(screen.getByRole('button', { name: 'Abrir' })).toHaveFocus()
    })
})

describe('Aviso', () => {
    afterEach(() => {
        vi.useRealTimers()
    })

    it('error usa role="alert"', () => {
        render(<Aviso tono="error">El ticket ya fue utilizado</Aviso>)
        expect(screen.getByRole('alert')).toHaveTextContent('El ticket ya fue utilizado')
    })

    it('éxito, info y advertencia usan role="status" con aria-live="polite"', () => {
        render(
            <>
                <Aviso tono="exito">Cuenta creada</Aviso>
                <Aviso tono="info">Sesión expirada</Aviso>
                <Aviso tono="advertencia">Aviso</Aviso>
            </>,
        )
        const avisos = screen.getAllByRole('status')
        expect(avisos).toHaveLength(3)
        avisos.forEach((a) => expect(a).toHaveAttribute('aria-live', 'polite'))
    })

    it('el botón cerrar llama a onCerrar', async () => {
        const onCerrar = vi.fn()
        render(
            <Aviso tono="exito" onCerrar={onCerrar}>
                Hecho
            </Aviso>,
        )
        await userEvent.click(screen.getByRole('button', { name: 'Cerrar aviso' }))
        expect(onCerrar).toHaveBeenCalledOnce()
    })

    it('autoCierreMs cierra a los 4 s (reloj simulado)', () => {
        vi.useFakeTimers()
        const onCerrar = vi.fn()
        render(
            <Aviso tono="exito" onCerrar={onCerrar} autoCierreMs={4000}>
                Hecho
            </Aviso>,
        )
        act(() => {
            vi.advanceTimersByTime(3999)
        })
        expect(onCerrar).not.toHaveBeenCalled()
        act(() => {
            vi.advanceTimersByTime(1)
        })
        expect(onCerrar).toHaveBeenCalledOnce()
    })
})
