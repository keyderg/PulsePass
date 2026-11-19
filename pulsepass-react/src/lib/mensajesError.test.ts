import { describe, expect, it } from 'vitest'
import { ApiError } from './apiError'
import { mensajeDeError, MENSAJES } from './mensajesError'

const err = (status: number, message = 'm', generico = false) =>
    new ApiError(status, message, {}, generico)

describe('mensajeDeError', () => {
    it('red → mensaje de conexión', () => {
        expect(mensajeDeError(new ApiError(0, 'x', {}, true))).toBe('No pudimos conectar con el servidor.')
    })
    it('400 → revisa los datos', () => expect(mensajeDeError(err(400))).toBe(MENSAJES.datosInvalidos))
    it('401 en login → credenciales inválidas', () => {
        expect(mensajeDeError(err(401), { login: true })).toBe('Credenciales inválidas')
    })
    it('401 fuera del login → sesión expirada', () => {
        expect(mensajeDeError(err(401))).toBe(MENSAJES.sesionExpirada)
    })
    it('403 → sin permisos', () => expect(mensajeDeError(err(403))).toBe(MENSAJES.sinPermisos))
    it('404 → genérico o el del contexto', () => {
        expect(mensajeDeError(err(404))).toBe(MENSAJES.noEncontrado)
        expect(mensajeDeError(err(404), { noEncontrado: 'Evento no disponible' })).toBe('Evento no disponible')
    })
    it('409 → muestra el message del backend como texto', () => {
        expect(mensajeDeError(err(409, 'Minimum age not met'))).toBe('Minimum age not met')
    })
    it('409 genérico → mensaje neutro', () => {
        expect(mensajeDeError(err(409, 'Error HTTP 409', true))).toBe(MENSAJES.reglaNegocio)
    })
    it('500 → error inesperado sin detalles', () => {
        expect(mensajeDeError(err(500, 'stacktrace secreto'))).toBe(MENSAJES.inesperado)
    })
    it('un error que no es ApiError → inesperado', () => {
        expect(mensajeDeError(new TypeError('x'))).toBe(MENSAJES.inesperado)
    })
})