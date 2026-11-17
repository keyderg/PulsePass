import type { ComponentType } from 'react'
import { createBrowserRouter, type RouteObject } from 'react-router'
import Layout from './layouts/Layout'
import RutaPorRol from './layouts/RutaPorRol'
import RutaProtegida from './layouts/RutaProtegida'
import SoloAnonimo from './layouts/SoloAnonimo'
import ErrorPagina from './pages/ErrorPagina'
import Inicio from './pages/Inicio'
import { PATRONES } from './lib/rutas'

type Carga = () => Promise<{ default: ComponentType }>

function perezosa(cargar: Carga): Pick<RouteObject, 'lazy'> {
    return { lazy: async () => ({ Component: (await cargar()).default }) }
}

export const rutas: RouteObject[] = [
    {
        path: '/',
        element: <Layout />,
        errorElement: <ErrorPagina />,
        children: [
            { index: true, element: <Inicio /> },
            { path: PATRONES.eventos, ...perezosa(() => import('./pages/CatalogoEventos')) },
            { path: PATRONES.evento, ...perezosa(() => import('./pages/DetalleEvento')) },
            { path: PATRONES.artistas, ...perezosa(() => import('./pages/ListaArtistas')) },
            { path: PATRONES.artista, ...perezosa(() => import('./pages/DetalleArtista')) },
            { path: PATRONES.sedes, ...perezosa(() => import('./pages/ListaSedes')) },
            { path: PATRONES.sede, ...perezosa(() => import('./pages/DetalleSede')) },
            {
                element: <SoloAnonimo />,
                children: [
                    { path: PATRONES.login, ...perezosa(() => import('./pages/Login')) },
                    { path: PATRONES.registro, ...perezosa(() => import('./pages/Registro')) },
                ],
            },
            {
                element: <RutaProtegida />,
                children: [
                    { path: PATRONES.cuenta, ...perezosa(() => import('./pages/Cuenta')) },
                    {
                        element: <RutaPorRol roles={['USER']} />,
                        children: [
                            { path: PATRONES.misTickets, ...perezosa(() => import('./pages/MisTickets')) },
                            { path: PATRONES.ticket, ...perezosa(() => import('./pages/DetalleTicket')) },
                            {
                                path: PATRONES.confirmacionCompra,
                                ...perezosa(() => import('./pages/ConfirmacionCompra')),
                            },
                        ],
                    },
                    {
                        element: <RutaPorRol roles={['STAFF', 'ADMIN']} />,
                        children: [
                            { path: PATRONES.validacion, ...perezosa(() => import('./pages/ValidacionIngreso')) },
                            {
                                path: PATRONES.ticketsPagados,
                                ...perezosa(() => import('./pages/TicketsPagadosEvento')),
                            },
                        ],
                    },
                    {
                        element: <RutaPorRol roles={['ADMIN']} />,
                        children: [
                            { path: PATRONES.adminEventos, ...perezosa(() => import('./pages/AdminEventos')) },
                            {
                                path: PATRONES.adminNuevoEvento,
                                ...perezosa(() => import('./pages/AdminCrearEvento')),
                            },
                            {
                                path: PATRONES.adminEvento,
                                ...perezosa(() => import('./pages/AdminGestionEvento')),
                            },
                        ],
                    },
                ],
            },
            { path: PATRONES.sinPermisos, ...perezosa(() => import('./pages/SinPermisos')) },
            { path: '*', ...perezosa(() => import('./pages/NoEncontrada')) },
        ],
    },
]

export const crearRouter = () => createBrowserRouter(rutas)