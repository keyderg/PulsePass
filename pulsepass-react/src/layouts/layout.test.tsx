import { screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import ErrorPagina from '../pages/ErrorPagina'
import { rutas } from '../Router'
import { renderizarRutas, sembrarSesion } from '../test/Utils'

describe('transversales', () => {
    it('TEST-FE-GEN-001 / AC-FE-020: ruta inexistente → 404', async () => {
        renderizarRutas(rutas, { entradas: ['/ruta-que-no-existe'] })
        expect(await screen.findByText('No encontramos esta página.')).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: '404' })).toBeInTheDocument()
    })

    it('TEST-FE-GEN-002: errorElement muestra mensaje seguro (sin stack)', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined)
        function Roto(): never {
            throw new Error('stack secreto en /src/interno.ts:42')
        }
        renderizarRutas([{ path: '/', element: <Roto />, errorElement: <ErrorPagina /> }])

        expect(await screen.findByRole('heading', { name: '¡Ups! Algo salió mal.' })).toBeInTheDocument()
        expect(screen.getByText('Ocurrió un error inesperado. Inténtalo más tarde.')).toBeInTheDocument()
        expect(screen.queryByText(/stack secreto/)).not.toBeInTheDocument()
        expect(screen.queryByText(/interno\.ts/)).not.toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'Volver al inicio' })).toBeInTheDocument()
    })

    describe('TEST-FE-GEN-003: navbar muestra enlaces según rol', () => {
        const principal = () => screen.getByRole('navigation', { name: 'Principal' }) // existe desde el primer render

        it('anónimo', async () => {
            renderizarRutas(rutas)
            expect(await screen.findByRole('link', { name: 'Registrarse' })).toBeInTheDocument()
            expect(screen.getByRole('link', { name: 'Ingresar' })).toBeInTheDocument()
            expect(within(principal()).getByRole('link', { name: 'Eventos' })).toBeInTheDocument()
            expect(within(principal()).queryByRole('link', { name: 'Mis tickets' })).toBeNull()
        })

        it('USER', async () => {
            sembrarSesion(['USER'])
            renderizarRutas(rutas)
            expect(await screen.findByRole('button', { name: 'Andrea' })).toBeInTheDocument()
            expect(await within(principal()).findByRole('link', { name: 'Mis tickets' })).toBeInTheDocument()
            expect(within(principal()).queryByRole('link', { name: 'Validar ingreso' })).toBeNull()
            expect(within(principal()).queryByRole('link', { name: 'Administrar eventos' })).toBeNull()
            expect(screen.queryByRole('link', { name: 'Registrarse' })).toBeNull()
        })

        it('STAFF', async () => {
            sembrarSesion(['STAFF'])
            renderizarRutas(rutas)
            expect(await screen.findByRole('button', { name: 'Andrea' })).toBeInTheDocument()
            expect(await within(principal()).findByRole('link', { name: 'Validar ingreso' })).toBeInTheDocument()
            expect(within(principal()).queryByRole('link', { name: 'Mis tickets' })).toBeNull()
            expect(within(principal()).queryByRole('link', { name: 'Administrar eventos' })).toBeNull()
        })

        it('ADMIN', async () => {
            sembrarSesion(['ADMIN'])
            renderizarRutas(rutas)
            expect(await screen.findByRole('button', { name: 'Andrea' })).toBeInTheDocument()
            expect(await within(principal()).findByRole('link', { name: 'Validar ingreso' })).toBeInTheDocument()
            expect(
                await within(principal()).findByRole('link', { name: 'Administrar eventos' }),
            ).toBeInTheDocument()
        })
    })

    it('TEST-FE-GEN-004: el menú móvil abre y cierra con teclado', async () => {
        const { user } = renderizarRutas(rutas)
        const boton = await screen.findByRole('button', { name: 'Abrir menú' })
        expect(boton).toHaveAttribute('aria-expanded', 'false')
        expect(screen.queryByRole('navigation', { name: 'Menú móvil' })).not.toBeInTheDocument()

        boton.focus()
        await user.keyboard('{Enter}')
        expect(boton).toHaveAttribute('aria-expanded', 'true')
        const movil = screen.getByRole('navigation', { name: 'Menú móvil' })
        expect(within(movil).getByRole('link', { name: 'Sedes' })).toBeInTheDocument()
        expect(within(movil).getByRole('link', { name: 'Registrarse' })).toBeInTheDocument()

        await user.keyboard('{Escape}')
        expect(screen.queryByRole('navigation', { name: 'Menú móvil' })).not.toBeInTheDocument()
        expect(boton).toHaveAttribute('aria-expanded', 'false')
        expect(boton).toHaveFocus()
    })

    it('incluye el enlace "Saltar al contenido" y el <main id="contenido">', async () => {
        renderizarRutas(rutas)
        expect(await screen.findByRole('link', { name: 'Saltar al contenido' })).toHaveAttribute(
            'href',
            '#contenido',
        )
        expect(screen.getByRole('main')).toHaveAttribute('id', 'contenido')
    })
})