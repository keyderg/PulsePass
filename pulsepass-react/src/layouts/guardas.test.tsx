import { screen } from '@testing-library/react'
import { useLocation, type RouteObject } from 'react-router'
import { describe, expect, it } from 'vitest'
import { claves } from '../lib/queryKeys'
import { obtenerTokenActual } from '../funcionalidades/auth/almacen'
import { CLAVE_SESION } from '../funcionalidades/auth/almacen'
import { rutas } from '../Router'
import {
    AHORA_FIJO,
    contarPeticiones,
    renderizarRutas,
    sembrarSesion,
} from '../test/Utils'
import RutaPorRol from './RutaPorRol'
import RutaProtegida from './RutaProtegida'

function Ubicacion() {
    const l = useLocation()
    return <pre>{JSON.stringify({ pathname: l.pathname, state: l.state })}</pre>
}

const rutasAdmin: RouteObject[] = [
    {
        element: <RutaProtegida />,
        children: [
            {
                element: <RutaPorRol roles={['ADMIN']} />,
                children: [{ path: '/admin/eventos', element: <p>Panel admin</p> }],
            },
        ],
    },
    { path: '/login', element: <Ubicacion /> },
    { path: '/403', element: <p>Página 403</p> },
]

describe('guardas', () => {
    it('TEST-FE-AUTH-007: RutaProtegida: anónimo → /login con state.desde', async () => {
        renderizarRutas(rutasAdmin, { entradas: ['/admin/eventos'] })
        expect(await screen.findByText(/"pathname":"\/login"/)).toBeInTheDocument()
        expect(screen.getByText(/"desde":"\/admin\/eventos"/)).toBeInTheDocument()
    })

    it('TEST-FE-AUTH-008 / AC-FE-015: RutaPorRol: USER en /admin → /403', async () => {
        sembrarSesion(['USER'])
        renderizarRutas(rutasAdmin, { entradas: ['/admin/eventos'] })
        expect(await screen.findByText('Página 403')).toBeInTheDocument()
        expect(screen.queryByText('Panel admin')).not.toBeInTheDocument()
    })

    it('TEST-FE-AUTH-009: RutaPorRol: ADMIN en /admin → renderiza', async () => {
        sembrarSesion(['ADMIN'])
        renderizarRutas(rutasAdmin, { entradas: ['/admin/eventos'] })
        expect(await screen.findByText('Panel admin')).toBeInTheDocument()
    })

    it('STAFF tampoco entra a /admin', async () => {
        sembrarSesion(['STAFF'])
        renderizarRutas(rutasAdmin, { entradas: ['/admin/eventos'] })
        expect(await screen.findByText('Página 403')).toBeInTheDocument()
    })
})

describe('sesión', () => {
    it('TEST-FE-AUTH-010: cerrar sesión limpia token y caché', async () => {
        sembrarSesion(['USER'])
        const { user, queryClient, router } = renderizarRutas(rutas, { entradas: ['/cuenta'] })
        expect(await screen.findByRole('heading', { name: 'Mi cuenta' })).toBeInTheDocument()
        expect(queryClient.getQueryData(claves.usuario('andrea@pulsepass.test'))).toBeDefined()

        await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }))

        expect(
            await screen.findByRole('heading', { name: 'Descubre los mejores eventos' }),
        ).toBeInTheDocument()
        expect(router.state.location.pathname).toBe('/')
        expect(sessionStorage.getItem(CLAVE_SESION)).toBeNull()
        expect(obtenerTokenActual()).toBeNull()
        expect(queryClient.getQueryData(claves.usuario('andrea@pulsepass.test'))).toBeUndefined()
        expect(queryClient.getQueryData(claves.sesion())).toBeUndefined()
        // Tras salir, una ruta protegida redirige a /login.
        await router.navigate('/cuenta')
        expect(await screen.findByRole('heading', { name: 'Inicia sesión' })).toBeInTheDocument()
    })

    it('TEST-FE-AUTH-011 / AC-FE-019: token expirado al restaurar → anónimo, sin peticiones', async () => {
        sembrarSesion(['USER'], { expiraEn: AHORA_FIJO - 1000 })
        const peticiones = contarPeticiones()
        renderizarRutas(rutas, { entradas: ['/cuenta'] })

        expect(await screen.findByRole('heading', { name: 'Inicia sesión' })).toBeInTheDocument()
        expect(sessionStorage.getItem(CLAVE_SESION)).toBeNull()
        expect(peticiones.urls).toHaveLength(0)
        peticiones.detener()
    })

    it('una sesión vigente se restaura al recargar (FR-FE-AUTH-004)', async () => {
        sembrarSesion(['USER'])
        renderizarRutas(rutas, { entradas: ['/cuenta'] })
        expect(await screen.findByRole('heading', { name: 'Mi cuenta' })).toBeInTheDocument()
        expect(await screen.findByText('Andrea Pérez')).toBeInTheDocument()
    })
})