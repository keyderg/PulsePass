import { screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { rutas } from '../../Router'
import { renderizarRutas, sembrarSesion } from '../../test/Utils'

describe('barra de compra fija en móvil (DES-07)', () => {
    it('USER: la barra es fija y visible solo en < md, y abre el modal de compra', async () => {
        sembrarSesion(['USER'])
        const { user } = renderizarRutas(rutas, { entradas: ['/eventos/CMF-2026'] })
        const barra = await screen.findByRole('group', { name: 'Barra de compra' })
        expect(barra).toHaveClass('fixed', 'bottom-0', 'md:hidden')

        const comprar = within(barra).getByRole('button', { name: 'Comprar' })
        await waitFor(() => expect(comprar).toBeEnabled())
        await user.click(comprar)
        expect(await screen.findByRole('dialog', { name: 'Confirmar compra' })).toBeInTheDocument()
    })

    it('anónimo: la barra lleva a /login', async () => {
        renderizarRutas(rutas, { entradas: ['/eventos/CMF-2026'] })
        const barra = await screen.findByRole('group', { name: 'Barra de compra' })
        expect(within(barra).getByRole('link', { name: 'Iniciar sesión' })).toHaveAttribute('href', '/login')
    })

    it('STAFF: no hay barra de compra', async () => {
        sembrarSesion(['STAFF'])
        renderizarRutas(rutas, { entradas: ['/eventos/CMF-2026'] })
        await screen.findByRole('heading', { name: 'Caribbean Music Fest 2026' })
        await screen.findByRole('button', { name: 'Andrea' })
        expect(screen.queryByRole('group', { name: 'Barra de compra' })).not.toBeInTheDocument()
    })
})
