import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Badge, BadgeEstadoEvento, BadgeEstadoTicket } from './Badge'
import { Cargando } from './Cargando'
import { CodigoTexto } from './CodigoTexto'
import { EstadoError } from './EstadoError'
import { EstadoVacio } from './EstadoVacio'
import { IconoMusica } from './Iconos'
import { PrecioCOP } from './PrecioCOP'
import { Tabla } from './Tabla'
import { Tarjeta } from './Tarjeta'

describe('Badge', () => {
    it('muestra el estado del evento con su tono', () => {
        render(<BadgeEstadoEvento estado="PUBLISHED" />)
        expect(screen.getByText('PUBLISHED')).toHaveClass('bg-emerald-100', 'text-emerald-800')
    })

    it('muestra el estado del ticket con su tono', () => {
        render(<BadgeEstadoTicket estado="CANCELLED" />)
        expect(screen.getByText('CANCELLED')).toHaveClass('bg-red-100', 'text-red-800')
    })

    it('acepta un tono libre', () => {
        render(<Badge tono="aviso">SOLD_OUT</Badge>)
        expect(screen.getByText('SOLD_OUT')).toHaveClass('bg-amber-100')
    })
})

describe('Tarjeta, CodigoTexto y PrecioCOP', () => {
    it('Tarjeta renderiza hijos y mezcla className al final', () => {
        render(<Tarjeta className="p-0">contenido</Tarjeta>)
        expect(screen.getByText('contenido')).toBeInTheDocument()
    })

    it('CodigoTexto usa fuente monoespaciada', () => {
        render(<CodigoTexto>CMF-2026</CodigoTexto>)
        expect(screen.getByText('CMF-2026')).toHaveClass('font-mono')
    })

    it('PrecioCOP formatea en pesos colombianos', () => {
        render(<PrecioCOP valor={250000} />)
        expect(screen.getByText(/250\.000/)).toHaveTextContent('$')
    })
})

describe('Iconos', () => {
    it('son decorativos por defecto (aria-hidden)', () => {
        const { container } = render(<IconoMusica />)
        expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    })

    it('con título son informativos', () => {
        render(<IconoMusica titulo="Música" />)
        expect(screen.getByRole('img', { name: 'Música' })).toBeInTheDocument()
    })
})

describe('Estados de interfaz', () => {
    it('Cargando expone aria-busy', () => {
        render(<Cargando />)
        expect(screen.getByRole('status', { name: 'Cargando' })).toHaveAttribute('aria-busy', 'true')
    })

    it('EstadoVacio muestra mensaje y acción', () => {
        render(
            <EstadoVacio
                mensaje="Aún no hay eventos publicados"
        accion={<button>Ver artistas</button>}
        />,
    )
        expect(screen.getByText('Aún no hay eventos publicados')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Ver artistas' })).toBeInTheDocument()
    })

        it('EstadoError muestra alerta y reintenta', async () => {
            const onReintentar = vi.fn()
            render(
                <EstadoError mensaje="No pudimos conectar con el servidor." onReintentar={onReintentar} />,
        )
            expect(screen.getByRole('alert')).toHaveTextContent('No pudimos conectar con el servidor.')
            await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
            expect(onReintentar).toHaveBeenCalledOnce()
        })

        it('EstadoError sin onReintentar no muestra el botón', () => {
            render(<EstadoError mensaje="Falló" />)
            expect(screen.queryByRole('button', { name: 'Reintentar' })).not.toBeInTheDocument()
        })
    })

    describe('Tabla', () => {
        interface Fila {
            codigo: string
            evento: string
        }
        const filas: Fila[] = [
            { codigo: 'TKT-1', evento: 'Fest' },
            { codigo: 'TKT-2', evento: 'Cumbre' },
        ]

        it('renderiza encabezados y filas con celdas personalizadas', () => {
            render(
                <Tabla
                    descripcion="Tickets"
            filas={filas}
            clave={(f) => f.codigo}
            columnas={[
                    { encabezado: 'Código', celda: (f) => f.codigo },
            { encabezado: 'Evento', celda: (f) => <strong>{f.evento}</strong> },
            ]}
            />,
        )
            expect(screen.getByRole('table', { name: 'Tickets' })).toBeInTheDocument()
            expect(screen.getByRole('columnheader', { name: 'Evento' })).toBeInTheDocument()
            expect(screen.getAllByRole('row')).toHaveLength(3)
            expect(screen.getByRole('cell', { name: 'Cumbre' })).toBeInTheDocument()
        })
        })
