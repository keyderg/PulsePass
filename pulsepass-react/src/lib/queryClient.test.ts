import { QueryClient } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'
import { ApiError } from './apiError'
import { crearQueryClient, reintentarConsulta } from './queryClient'
import { claves, invalidaciones } from './queryKeys'

describe('reintentos', () => {
    it.each([400, 401, 403, 404, 409])('no reintenta %i', (status) => {
        expect(reintentarConsulta(0, new ApiError(status, 'x'))).toBe(false)
    })
    it('reintenta una vez ante error de red o 5xx', () => {
        expect(reintentarConsulta(0, new ApiError(0, 'red', {}, true))).toBe(true)
        expect(reintentarConsulta(0, new ApiError(500, 'x'))).toBe(true)
        expect(reintentarConsulta(1, new ApiError(500, 'x'))).toBe(false)
    })
    it('las mutaciones nunca se reintentan', () => {
        expect(crearQueryClient().getDefaultOptions().mutations?.retry).toBe(false)
    })
})

describe('invalidaciones (sección 14.2)', () => {
    it('comprar invalida tickets del usuario y el evento', async () => {
        const qc = new QueryClient()
        const spy = vi.spyOn(qc, 'invalidateQueries')
        await invalidaciones.comprarTicket(qc, 'a@x.co', 'CMF-2026')
        expect(spy).toHaveBeenCalledWith({ queryKey: claves.ticketsUsuario('a@x.co') })
        expect(spy).toHaveBeenCalledWith({ queryKey: claves.evento('CMF-2026') })
        expect(spy).toHaveBeenCalledTimes(2)
    })

    it('cancelar invalida 3 claves', async () => {
        const qc = new QueryClient()
        const spy = vi.spyOn(qc, 'invalidateQueries')
        await invalidaciones.cancelarTicket(qc, 'a@x.co', 'TKT-1', 'CMF-2026')
        expect(spy).toHaveBeenCalledTimes(3)
    })

    it('crear evento siembra la caché en lugar de invalidar', () => {
        const qc = new QueryClient()
        const evento = { eventCode: 'CMF-2026' } as Parameters<typeof invalidaciones.crearEvento>[1]
        invalidaciones.crearEvento(qc, evento)
        expect(qc.getQueryData(claves.evento('CMF-2026'))).toBe(evento)
    })
})