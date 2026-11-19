import type { UseFormSetError } from 'react-hook-form'
import { describe, expect, it, vi } from 'vitest'
import { ApiError } from './apiError'
import { aplicarErroresServidor } from './formularios'

interface Demo {
    email: string
    password: string
}
const campos = ['email', 'password'] as const

describe('aplicarErroresServidor', () => {
    it('400 con details: asigna a campos homónimos y lo demás va al aviso general', () => {
        const setError = vi.fn<UseFormSetError<Demo>>()
        const error = new ApiError(400, 'Validation failed', {
            email: 'Email must be valid',
            otro: 'Algo más',
        })
        const general = aplicarErroresServidor<Demo>(error, setError, campos)
        expect(setError).toHaveBeenCalledWith('email', { type: 'server', message: 'Email must be valid' })
        expect(general).toBe('otro: Algo más')
    })

    it('400 con todos los details en campos: no hay aviso general', () => {
        const setError = vi.fn<UseFormSetError<Demo>>()
        const general = aplicarErroresServidor<Demo>(
            new ApiError(400, 'v', { password: 'Too short' }),
            setError,
            campos,
        )
        expect(general).toBeNull()
    })

    it('400 sin details → aviso general', () => {
        const setError = vi.fn<UseFormSetError<Demo>>()
        const general = aplicarErroresServidor<Demo>(new ApiError(400, 'Malformed JSON'), setError, campos)
        expect(setError).not.toHaveBeenCalled()
        expect(general).toBe('Revisa los datos ingresados.')
    })

    it('409 → aviso general con el mensaje del backend', () => {
        const setError = vi.fn<UseFormSetError<Demo>>()
        const general = aplicarErroresServidor<Demo>(new ApiError(409, 'Email already registered'), setError, campos)
        expect(general).toBe('Email already registered')
    })
})