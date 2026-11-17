import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import PantallaPrueba from './PantallaPrueba'

describe('PantallaPrueba', () => {
    it('muestra el sistema visual y abre el modal de ejemplo', async () => {
        render(<PantallaPrueba />)
        expect(screen.getByRole('heading', { level: 1, name: 'Sistema visual' })).toBeInTheDocument()
        await userEvent.click(screen.getByRole('button', { name: 'Abrir modal' }))
        expect(screen.getByRole('dialog', { name: 'Cancelar ticket' })).toBeInTheDocument()
    })

    it('alterna el modo oscuro', async () => {
        render(<PantallaPrueba />)
        await userEvent.click(screen.getByRole('button', { name: /modo oscuro/i }))
        expect(document.documentElement).toHaveClass('dark')
        await userEvent.click(screen.getByRole('button', { name: /modo claro/i }))
        expect(document.documentElement).not.toHaveClass('dark')
    })
})
