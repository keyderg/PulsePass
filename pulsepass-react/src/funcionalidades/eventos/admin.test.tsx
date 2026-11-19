import { act, fireEvent, screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { claves } from '../../lib/queryKeys'
import { rutas } from '../../Router'
import { artistas, errorApi, evento } from '../../test/mocks/datos'
import { server } from '../../test/mocks/server'
import { renderizarRutas, sembrarSesion } from '../../test/Utils'
import type { EventStatus } from './tipos'

type Usuario = ReturnType<typeof renderizarRutas>['user']

const borrador = { ...evento, status: 'DRAFT' as const }

async function completarFormulario(user: Usuario, codigo: string) {
    await user.type(await screen.findByLabelText('Código del evento'), codigo)
    await user.type(screen.getByLabelText('Nombre'), 'Festival Nuevo')
    await user.type(screen.getByLabelText('Descripción'), 'Una descripción corta.')
    await user.selectOptions(screen.getByLabelText('Categoría'), 'MUSIC')
    await user.type(screen.getByLabelText('Edad mínima'), '18')
    fireEvent.change(screen.getByLabelText('Fecha y hora'), { target: { value: '2026-12-12T20:00' } })
    await screen.findByRole('option', { name: /Marina Convention Center/ })
    await user.selectOptions(screen.getByLabelText('Sede'), 'VEN-SMR-01')
}

describe('crear evento', () => {
    it('TEST-FE-ADM-001 / AC-FE-017: campos vacíos → errores por campo y 0 peticiones', async () => {
        let llamadas = 0
        server.use(
            http.post('*/api/events', () => {
                llamadas += 1
                return HttpResponse.json({})
            }),
        )
        sembrarSesion(['ADMIN'])
        const { user } = renderizarRutas(rutas, { entradas: ['/admin/eventos/nuevo'] })
        await user.click(await screen.findByRole('button', { name: 'Crear evento' }))

        expect(await screen.findByText('Ingresa el código del evento')).toBeInTheDocument()
        expect(screen.getByText('Ingresa el nombre del evento')).toBeInTheDocument()
        expect(screen.getByText('Selecciona una categoría', { selector: 'p' })).toBeInTheDocument()
        expect(screen.getByText('Ingresa la edad mínima')).toBeInTheDocument()
        expect(screen.getByText('Selecciona la fecha y hora del evento')).toBeInTheDocument()
        expect(screen.getByText('Selecciona una sede', { selector: 'p' })).toBeInTheDocument()
        expect(llamadas).toBe(0)
    })

    it('TEST-FE-ADM-002: 201 → navega a la gestión del evento nuevo', async () => {
        server.use(
            http.get('*/api/events/:code', ({ params }) =>
                HttpResponse.json({ ...borrador, eventCode: String(params.code), name: 'Festival Nuevo' }),
            ),
        )
        sembrarSesion(['ADMIN'])
        const { user, router } = renderizarRutas(rutas, { entradas: ['/admin/eventos/nuevo'] })
        await completarFormulario(user, 'FN-2026')
        await user.click(screen.getByRole('button', { name: 'Crear evento' }))

        await waitFor(() => expect(router.state.location.pathname).toBe('/admin/eventos/FN-2026'))
        expect(await screen.findByRole('heading', { name: 'Festival Nuevo' })).toBeInTheDocument()
        expect(screen.getByText('Evento creado como borrador.')).toBeInTheDocument()
    })

    it('TEST-FE-ADM-003: 400 con details → errores en los campos', async () => {
        server.use(
            http.post('*/api/events', () =>
                errorApi(400, 'Bad Request', 'Validation failed', {
                    eventCode: 'Event code is required',
                    name: 'Name is required',
                }),
            ),
        )
        sembrarSesion(['ADMIN'])
        const { user, router } = renderizarRutas(rutas, { entradas: ['/admin/eventos/nuevo'] })
        await completarFormulario(user, 'FN-2026')
        await user.click(screen.getByRole('button', { name: 'Crear evento' }))

        expect(await screen.findByText('Event code is required')).toBeInTheDocument()
        expect(screen.getByText('Name is required')).toBeInTheDocument()
        expect(router.state.location.pathname).toBe('/admin/eventos/nuevo')
    })

    it('409 (código duplicado) → aviso general arriba del formulario', async () => {
        server.use(
            http.post('*/api/events', () => errorApi(409, 'Conflict', 'Ya existe un evento con ese código')),
        )
        sembrarSesion(['ADMIN'])
        const { user } = renderizarRutas(rutas, { entradas: ['/admin/eventos/nuevo'] })
        await completarFormulario(user, 'CMF-2026')
        await user.click(screen.getByRole('button', { name: 'Crear evento' }))

        expect(await screen.findByRole('alert')).toHaveTextContent('Ya existe un evento con ese código')
    })
})

describe('gestionar evento', () => {
    it('TEST-FE-ADM-004 / AC-FE-018: publicar → badge PUBLISHED', async () => {
        let estado: EventStatus = 'DRAFT'
        server.use(
            http.get('*/api/events/:code', () => HttpResponse.json({ ...evento, status: estado })),
            http.patch('*/api/events/:code/publish', () => {
                estado = 'PUBLISHED'
                return HttpResponse.json({ ...evento, status: 'PUBLISHED' })
            }),
        )
        sembrarSesion(['ADMIN'])
        const { user } = renderizarRutas(rutas, { entradas: ['/admin/eventos/CMF-2026'] })
        expect(await screen.findByText('DRAFT')).toBeInTheDocument()

        await user.click(screen.getByRole('button', { name: 'Publicar evento' }))
        const dialogo = await screen.findByRole('dialog', { name: 'Publicar evento' })
        await user.click(within(dialogo).getByRole('button', { name: 'Publicar' }))

        expect(await screen.findByText('PUBLISHED')).toBeInTheDocument()
        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
        expect(screen.getByRole('button', { name: 'Publicar evento' })).toBeDisabled()
    })

    it('TEST-FE-ADM-005: publicar → 409 visible y el modal sigue abierto', async () => {
        server.use(
            http.get('*/api/events/:code', () => HttpResponse.json(borrador)),
            http.patch('*/api/events/:code/publish', () =>
                errorApi(409, 'Conflict', 'La fecha del evento ya pasó'),
            ),
        )
        sembrarSesion(['ADMIN'])
        const { user } = renderizarRutas(rutas, { entradas: ['/admin/eventos/CMF-2026'] })
        await user.click(await screen.findByRole('button', { name: 'Publicar evento' }))
        const dialogo = await screen.findByRole('dialog', { name: 'Publicar evento' })
        await user.click(within(dialogo).getByRole('button', { name: 'Publicar' }))

        expect(await within(dialogo).findByRole('alert')).toHaveTextContent('La fecha del evento ya pasó')
        expect(screen.getByRole('dialog', { name: 'Publicar evento' })).toBeInTheDocument()
    })

    it('TEST-FE-ADM-006a: asociar artista → aparece en la lista', async () => {
        const asociados = [...evento.artists]
        server.use(
            http.get('*/api/events/:code', () => HttpResponse.json({ ...borrador, artists: asociados })),
            http.post('*/api/events/:code/artists/:artistId', () => {
                const nuevo = artistas.find((a) => a.id === 3)
                if (nuevo) asociados.push(nuevo)
                return HttpResponse.json({ ...borrador, artists: asociados })
            }),
        )
        sembrarSesion(['ADMIN'])
        const { user } = renderizarRutas(rutas, { entradas: ['/admin/eventos/CMF-2026'] })
        const lista = await screen.findByRole('list', { name: 'Artistas asociados' })
        expect(within(lista).queryByText('Caribbean Sound')).not.toBeInTheDocument()

        // Solar Beat y Neon Waves ya están asociados: solo queda Caribbean Sound.
        const selector = await screen.findByLabelText('Agregar artista')
        expect(within(selector).queryByRole('option', { name: 'Solar Beat' })).not.toBeInTheDocument()
        await user.click(screen.getByRole('button', { name: '+ Asociar' }))

        expect(
            await within(screen.getByRole('list', { name: 'Artistas asociados' })).findByText('Caribbean Sound'),
        ).toBeInTheDocument()
    })

    it('TEST-FE-ADM-006b: asociar duplicado → 409 visible', async () => {
        server.use(
            http.get('*/api/events/:code', () => HttpResponse.json(borrador)),
            http.post('*/api/events/:code/artists/:artistId', () =>
                errorApi(409, 'Conflict', 'El artista ya está asociado al evento'),
            ),
        )
        sembrarSesion(['ADMIN'])
        const { user } = renderizarRutas(rutas, { entradas: ['/admin/eventos/CMF-2026'] })
        await screen.findByLabelText('Agregar artista')
        await user.click(screen.getByRole('button', { name: '+ Asociar' }))

        expect(await screen.findByRole('alert')).toHaveTextContent('El artista ya está asociado al evento')
    })
})

describe('buscar evento', () => {
    it('abrir por código navega a la gestión', async () => {
        sembrarSesion(['ADMIN'])
        const { user, router } = renderizarRutas(rutas, { entradas: ['/admin/eventos'] })
        await user.type(await screen.findByLabelText('Buscar evento por código'), 'CMF-2026')
        await user.click(screen.getByRole('button', { name: 'Abrir' }))
        await waitFor(() => expect(router.state.location.pathname).toBe('/admin/eventos/CMF-2026'))
    })

    it('código vacío → error y sin navegar', async () => {
        sembrarSesion(['ADMIN'])
        const { user, router } = renderizarRutas(rutas, { entradas: ['/admin/eventos'] })
        await user.click(await screen.findByRole('button', { name: 'Abrir' }))
        expect(await screen.findByText('Ingresa el código del evento')).toBeInTheDocument()
        expect(router.state.location.pathname).toBe('/admin/eventos')
    })

    it('GAP-01: muestra los eventos creados en esta sesión', async () => {
        server.use(http.get('*/api/events/:code', () => HttpResponse.json(borrador)))
        sembrarSesion(['ADMIN'])
        const { queryClient } = renderizarRutas(rutas, { entradas: ['/admin/eventos'] })
        expect(await screen.findByText('Aún no has creado eventos en esta sesión.')).toBeInTheDocument()

        await act(async () => {
            queryClient.setQueryData(claves.eventosCreados(), ['CMF-2026'])
        })
        expect(await screen.findByText('Caribbean Music Fest 2026', { exact: false })).toBeInTheDocument()
        expect(await screen.findByText('DRAFT')).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'Gestionar' })).toHaveAttribute('href', '/admin/eventos/CMF-2026')
    })

    it('USER no entra a /admin/eventos → /403', async () => {
        sembrarSesion(['USER'])
        renderizarRutas(rutas, { entradas: ['/admin/eventos'] })
        expect(await screen.findByRole('heading', { name: '403' })).toBeInTheDocument()
    })
})