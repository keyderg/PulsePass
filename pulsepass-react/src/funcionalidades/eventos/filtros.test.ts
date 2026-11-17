import { describe, expect, it } from 'vitest'
import { aParametros, filtrarEventos, leerFiltros } from './filtros'
import type { EventoTarjeta } from './tipos'

const base: EventoTarjeta = {
    eventCode: 'A', name: 'Noche de Jazz y Cultura', status: 'PUBLISHED',
    eventDate: '2026-11-27T20:00:00', venueName: 'X', categoria: 'CULTURE',
}
const otro: EventoTarjeta = { ...base, eventCode: 'B', name: 'Copa de Fútbol', categoria: 'SPORTS' }

describe('filtros', () => {
    it('leerFiltros valida la categoría y descarta valores inválidos', () => {
        expect(leerFiltros(new URLSearchParams('categoria=MUSIC&q=a')).categoria).toBe('MUSIC')
        expect(leerFiltros(new URLSearchParams('categoria=XXX')).categoria).toBe('')
    })
    it('aParametros omite los vacíos', () => {
        expect(aParametros({ q: '', categoria: 'MUSIC', artista: '' }).toString()).toBe('categoria=MUSIC')
    })
    it('filtra por texto sin distinguir mayúsculas ni tildes', () => {
        expect(filtrarEventos([base, otro], { q: 'futbol', categoria: '', artista: '' })).toEqual([otro])
    })
    it('filtra por categoría', () => {
        expect(filtrarEventos([base, otro], { q: '', categoria: 'CULTURE', artista: '' })).toEqual([base])
    })
})