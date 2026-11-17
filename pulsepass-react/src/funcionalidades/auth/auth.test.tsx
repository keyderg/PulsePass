import { screen } from '@testing-library/react'
import type { UserEvent } from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { CLAVE_ANDREA, TOKEN_ANDREA } from '../../test/mocks/datos'
import { contarPeticiones, renderizarRutas } from '../../test/Utils'
import { rutas } from '../../Router'
import { CLAVE_SESION } from './almacen'

describe('Login', () => {
    it('TEST-FE-AUTH-001: login válido → sesión autenticada y redirección a "desde"', async () => {
        const { user, router } = renderizarRutas(rutas, {
            entradas: [{ pathname: '/login', state: { desde: '/cuenta' } }],
        })
        await user.type(await screen.findByLabelText('Usuario o correo'), 'andrea')
        await user.type(screen.getByLabelText('Contraseña'), CLAVE_ANDREA)
        await user.click(screen.getByRole('button', { name: 'Ingresar' }))

        expect(await screen.findByRole('heading', { name: 'Mi cuenta' })).toBeInTheDocument()
        expect(router.state.location.pathname).toBe('/cuenta')
        expect(await screen.findByRole('button', { name: 'Andrea' })).toBeInTheDocument()
        // AC-FE-009: el token solo está en sessionStorage/memoria.
        expect(sessionStorage.getItem(CLAVE_SESION)).toContain(TOKEN_ANDREA)
        expect(localStorage.length).toBe(0)
    })

    it('TEST-FE-AUTH-002: login 401 → "Credenciales inválidas"', async () => {
        const { user } = renderizarRutas(rutas, { entradas: ['/login'] })
        await user.type(await screen.findByLabelText('Usuario o correo'), 'andrea')
        await user.type(screen.getByLabelText('Contraseña'), 'clave-incorrecta-1')
        await user.click(screen.getByRole('button', { name: 'Ingresar' }))

        expect(await screen.findByRole('alert')).toHaveTextContent('Credenciales inválidas')
        expect(sessionStorage.getItem(CLAVE_SESION)).toBeNull()
    })

    it('TEST-FE-AUTH-003: login sin campos → errores y 0 peticiones', async () => {
        const { user } = renderizarRutas(rutas, { entradas: ['/login'] })
        const peticiones = contarPeticiones()
        await user.click(await screen.findByRole('button', { name: 'Ingresar' }))

        expect(await screen.findByText('Ingresa tu usuario o correo')).toBeInTheDocument()
        expect(screen.getByText('Ingresa tu contraseña')).toBeInTheDocument()
        expect(peticiones.urls).toHaveLength(0)
        peticiones.detener()
    })

    it('muestra el aviso de sesión expirada cuando llega state.motivo', async () => {
        renderizarRutas(rutas, {
            entradas: [{ pathname: '/login', state: { motivo: 'expirada' } }],
        })
        expect(await screen.findByText('Tu sesión expiró. Inicia sesión de nuevo.')).toBeInTheDocument()
    })
})

async function completarRegistro(
    user: UserEvent,
    valores: { email?: string; password?: string } = {},
) {
    await user.type(await screen.findByLabelText('Nombre de usuario'), 'nueva')
    await user.type(screen.getByLabelText('Correo electrónico'), valores.email ?? 'nueva@pulsepass.test')
    await user.type(screen.getByLabelText('Nombres'), 'Nueva')
    await user.type(screen.getByLabelText('Apellidos'), 'Persona')
    await user.type(screen.getByLabelText('Fecha de nacimiento'), '1998-04-10')
    await user.type(screen.getByLabelText(/^Contraseña/), valores.password ?? CLAVE_ANDREA)
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))
}

describe('Registro', () => {
    it('TEST-FE-AUTH-004 / AC-FE-005: contraseña corta → error y 0 peticiones', async () => {
        const { user } = renderizarRutas(rutas, { entradas: ['/registro'] })
        const peticiones = contarPeticiones()
        await completarRegistro(user, { password: 'corta-11-ch' }) // 11 caracteres

        expect(
            await screen.findByText('La contraseña debe tener al menos 12 caracteres'),
        ).toBeInTheDocument()
        expect(peticiones.urls).toHaveLength(0)
        peticiones.detener()
    })

    it('TEST-FE-AUTH-005 / AC-FE-006: registro 201 → redirección a /login con aviso', async () => {
        const { user, router } = renderizarRutas(rutas, { entradas: ['/registro'] })
        await completarRegistro(user)

        expect(await screen.findByRole('heading', { name: 'Inicia sesión' })).toBeInTheDocument()
        expect(router.state.location.pathname).toBe('/login')
        expect(screen.getByText('Cuenta creada, inicia sesión.')).toBeInTheDocument()
    })

    it('TEST-FE-AUTH-006 / AC-FE-007: registro 409 → mensaje genérico sin detalles internos', async () => {
        const { user } = renderizarRutas(rutas, { entradas: ['/registro'] })
        await completarRegistro(user, { email: 'andrea@pulsepass.test' })

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'El usuario o correo ya está registrado',
        )
        expect(screen.queryByText(/Email already registered/)).not.toBeInTheDocument()
    })
})