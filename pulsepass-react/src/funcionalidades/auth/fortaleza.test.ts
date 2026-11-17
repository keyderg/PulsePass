import { describe, expect, it } from 'vitest'
import { calcularFortaleza } from './fortaleza'

describe('calcularFortaleza', () => {
    it('vacía → 0 segmentos', () => {
        expect(calcularFortaleza('')).toEqual({ segmentos: 0, etiqueta: 'baja' })
    })
    it('corta y de un solo tipo → baja', () => {
        expect(calcularFortaleza('abcdef').etiqueta).toBe('baja')
    })
    it('larga con variedad → alta', () => {
        expect(calcularFortaleza('Clave-Segura-123')).toEqual({ segmentos: 8, etiqueta: 'alta' })
    })
})