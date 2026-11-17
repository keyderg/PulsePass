import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { rutas } from '../../Router'
import { contarPeticiones, renderizarRutas } from '../../test/Utils'

describe('artistas', () => {
    it('TEST-FE-ART-001: lista de artistas activos', async () => {
        renderizarRutas(rutas, { entradas: ['/artistas'] })
        expect(await screen.findByRole('link', { name: /Solar Beat/ })).toHaveAttribute('href', '/artistas/1')
        expect(screen.getByRole('link', { name: /Neon Waves/ })).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /Caribbean Sound/ })).toBeInTheDocument()
    })

    it('TEST-FE-ART-002: detalle de artista con eventos', async () => {
        renderizarRutas(rutas, { entradas: ['/artistas/1'] })
        expect(await screen.findByRole('heading', { name: 'Solar Beat' })).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Próximos eventos de Solar Beat' })).toBeInTheDocument()
        expect(await screen.findByRole('link', { name: /Caribbean Music Fest 2026/ })).toBeInTheDocument()
    })

    it('artista sin eventos → "Sin eventos próximos"', async () => {
        renderizarRutas(rutas, { entradas: ['/artistas/3'] })
        expect(await screen.findByText('Sin eventos próximos')).toBeInTheDocument()
    })

    it('TEST-FE-ART-003: id no numérico → 404 sin llamar a la API', async () => {
        const peticiones = contarPeticiones()
        renderizarRutas(rutas, { entradas: ['/artistas/abc'] })
        expect(await screen.findByText('No encontramos esta página.')).toBeInTheDocument()
        expect(peticiones.urls.filter((u) => u.includes('/api/artists'))).toHaveLength(0)
        peticiones.detener()
    })

    it('id numérico inexistente → 404 de la API → NoEncontrada', async () => {
        renderizarRutas(rutas, { entradas: ['/artistas/999'] })
        expect(await screen.findByText('No encontramos esta página.')).toBeInTheDocument()
    })
})