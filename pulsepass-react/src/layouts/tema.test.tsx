import { screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { CLAVE_TEMA, leerTemaGuardado } from '../lib/tema'
import { rutas } from '../Router'
import { renderizarRutas } from '../test/Utils'

afterEach(() => document.documentElement.classList.remove('dark'))

describe('modo oscuro (FR-FE-GEN-004)', () => {
    it('el botón alterna la clase dark en <html>, aria-pressed y guarda la preferencia', async () => {
        const { user } = renderizarRutas(rutas, { entradas: ['/403'] })
        const [boton] = await screen.findAllByRole('button', { name: 'Modo oscuro' })
        expect(boton).toHaveAttribute('aria-pressed', 'false')
        expect(document.documentElement).not.toHaveClass('dark')

        await user.click(boton!)
        expect(document.documentElement).toHaveClass('dark')
        expect(boton).toHaveAttribute('aria-pressed', 'true')
        expect(sessionStorage.getItem(CLAVE_TEMA)).toBe('oscuro')

        await user.click(boton!)
        expect(document.documentElement).not.toHaveClass('dark')
        expect(boton).toHaveAttribute('aria-pressed', 'false')
    })

    it('leerTemaGuardado descarta valores que no sean "claro" u "oscuro"', () => {
        sessionStorage.setItem(CLAVE_TEMA, 'rojo')
        expect(leerTemaGuardado()).toBeNull()
        sessionStorage.setItem(CLAVE_TEMA, 'oscuro')
        expect(leerTemaGuardado()).toBe('oscuro')
    })
})
