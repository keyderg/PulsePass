import { describe, expect, it } from 'vitest'
import { esFechaISOValida, fechaLocalISO, formatearCOP } from './formato'

describe('formato', () => {
    it('TEST-FE-LIB-005: formatea 250000 como COP', () => {
        expect(formatearCOP(250000)).toMatch(/^\$\s250\.000$/)
    })

    it('fechaLocalISO usa la fecha inyectada', () => {
        expect(fechaLocalISO(new Date(2026, 10, 16))).toBe('2026-11-16')
    })

    it('esFechaISOValida rechaza formatos y fechas imposibles', () => {
        expect(esFechaISOValida('1998-04-10')).toBe(true)
        expect(esFechaISOValida('2026-02-31')).toBe(false)
        expect(esFechaISOValida('10/04/1998')).toBe(false)
    })
})