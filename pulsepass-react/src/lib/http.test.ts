import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import {
    AuthenticatedUserResponseSchema,
} from '../funcionalidades/auth/tipos'
import { server } from '../test/mocks/server'
import { ApiError } from './apiError'
import { configurarSesionHttp, solicitar } from './http'

const llamarMe = () => solicitar('/auth/me', { esquema: AuthenticatedUserResponseSchema })

describe('http', () => {
    it('TEST-FE-LIB-001: añade Authorization Bearer cuando hay sesión (y el token no va en la URL)', async () => {
        let autorizacion: string | null = null
        let url = ''
        server.use(
            http.get('*/api/auth/me', ({ request }) => {
                autorizacion = request.headers.get('authorization')
                url = request.url
                return HttpResponse.json({ id: 1, username: 'andrea', roles: ['USER'] })
            }),
        )
        configurarSesionHttp({ obtenerToken: () => 'abc.def.ghi', alSesionExpirada: () => undefined })

        await llamarMe()

        expect(autorizacion).toBe('Bearer abc.def.ghi')
        expect(url).not.toContain('abc.def.ghi')
    })

    it('sin sesión no envía Authorization', async () => {
        let autorizacion: string | null = 'pendiente'
        server.use(
            http.get('*/api/auth/me', ({ request }) => {
                autorizacion = request.headers.get('authorization')
                return HttpResponse.json({ id: 1, username: 'andrea', roles: ['USER'] })
            }),
        )
        await llamarMe()
        expect(autorizacion).toBeNull()
    })

    it('TEST-FE-LIB-002: ErrorResponse válido → ApiError con status, message y details', async () => {
        server.use(
            http.get('*/api/auth/me', () =>
                HttpResponse.json(
                    { timestamp: 't', status: 400, error: 'Bad Request', message: 'Validation failed', details: { email: 'Email must be valid' } },
                    { status: 400 },
                ),
            ),
        )
        const error = await llamarMe().catch((e: unknown) => e)
        expect(error).toBeInstanceOf(ApiError)
        expect(error).toMatchObject({
            status: 400,
            message: 'Validation failed',
            details: { email: 'Email must be valid' },
            generico: false,
        })
    })

    it('TEST-FE-LIB-003: cuerpo de error inválido → ApiError genérico', async () => {
        server.use(
            http.get('*/api/auth/me', () => HttpResponse.json({ cualquier: 'cosa' }, { status: 409 })),
        )
        const error = await llamarMe().catch((e: unknown) => e)
        expect(error).toBeInstanceOf(ApiError)
        expect(error).toMatchObject({ status: 409, generico: true, details: {} })
    })

    it('TEST-FE-LIB-003b: cuerpo que no es JSON → ApiError genérico', async () => {
        server.use(http.get('*/api/auth/me', () => new HttpResponse('<html>boom</html>', { status: 500 })))
        await expect(llamarMe()).rejects.toMatchObject({ status: 500, generico: true })
    })

    it('TEST-FE-LIB-004: 401 con token dispara el cierre de sesión', async () => {
        const alSesionExpirada = vi.fn()
        configurarSesionHttp({ obtenerToken: () => 'vencido', alSesionExpirada })
        server.use(
            http.get('*/api/auth/me', () =>
                HttpResponse.json(
                    { timestamp: 't', status: 401, error: 'Unauthorized', message: 'Authentication required', details: {} },
                    { status: 401 },
                ),
            ),
        )
        await expect(llamarMe()).rejects.toMatchObject({ status: 401 })
        expect(alSesionExpirada).toHaveBeenCalledOnce()
    })

    it('401 sin token (p. ej. login incorrecto) no dispara el cierre de sesión', async () => {
        const alSesionExpirada = vi.fn()
        configurarSesionHttp({ obtenerToken: () => null, alSesionExpirada })
        await expect(llamarMe()).rejects.toMatchObject({ status: 401 })
        expect(alSesionExpirada).not.toHaveBeenCalled()
    })

    it('fallo de red → ApiError status 0', async () => {
        server.use(http.get('*/api/auth/me', () => HttpResponse.error()))
        const error = await llamarMe().catch((e: unknown) => e)
        expect(error).toBeInstanceOf(ApiError)
        expect(error).toMatchObject({ status: 0, esRed: true })
    })

    it('respuesta exitosa que no cumple el esquema → ApiError genérico', async () => {
        server.use(http.get('*/api/auth/me', () => HttpResponse.json({ id: 'no-es-numero' })))
        await expect(llamarMe()).rejects.toMatchObject({ status: 500, generico: true })
    })

    it('codifica parámetros de consulta (el "+" de un correo no se pierde)', async () => {
        let recibido: string | null = null
        server.use(
            http.get('*/api/users/by-email', ({ request }) => {
                recibido = new URL(request.url).searchParams.get('email')
                return HttpResponse.json({ ok: true })
            }),
        )
        const { z } = await import('zod')
        await solicitar('/users/by-email', {
            esquema: z.object({ ok: z.boolean() }),
            parametros: { email: 'a+b@pulsepass.test' },
        })
        expect(recibido).toBe('a+b@pulsepass.test')
    })
})