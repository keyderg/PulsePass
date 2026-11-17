import { Outlet } from 'react-router'
import { MarcoPagina } from './MarcoPagina'

export default function Layout() {
    return (
        <MarcoPagina>
            <Outlet />
        </MarcoPagina>
    )
}