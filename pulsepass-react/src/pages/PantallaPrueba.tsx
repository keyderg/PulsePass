import { useState } from 'react'
import type { ReactNode } from 'react'
import clsx from 'clsx'
import { Aviso } from '../componentes/Aviso'
import {
    Badge,
    BadgeEstadoEvento,
    BadgeEstadoTicket,
    type EstadoEvento,
    type EstadoTicket,
} from '../componentes/Badge'
import { Boton } from '../componentes/Boton'
import { Campo } from '../componentes/Campo'
import { Cargando } from '../componentes/Cargando'
import { CodigoTexto } from '../componentes/CodigoTexto'
import { EstadoError } from '../componentes/EstadoError'
import { EstadoVacio } from '../componentes/EstadoVacio'
import { IconoLuna, IconoSol } from '../componentes/Iconos'
import { Modal } from '../componentes/Modal'
import { PrecioCOP } from '../componentes/PrecioCOP'
import { Selector } from '../componentes/Selector'
import { Tabla } from '../componentes/Tabla'
import { Tarjeta } from '../componentes/Tarjeta'

const colores = [
    { nombre: 'marca-50', hex: '#eef2ff', clase: 'bg-marca-50' },
    { nombre: 'marca-500', hex: '#6366f1', clase: 'bg-marca-500' },
    { nombre: 'marca-600', hex: '#4f46e5', clase: 'bg-marca-600' },
    { nombre: 'marca-700', hex: '#4338ca', clase: 'bg-marca-700' },
    { nombre: 'acento-500', hex: '#f43f5e', clase: 'bg-acento-500' },
    { nombre: 'slate-50', hex: '#f8fafc', clase: 'bg-slate-50 border border-slate-200' },
    { nombre: 'slate-900', hex: '#0f172a', clase: 'bg-slate-900' },
] as const

const estadosEvento: EstadoEvento[] = ['DRAFT', 'PUBLISHED', 'SOLD_OUT', 'CANCELLED', 'FINISHED']
const estadosTicket: EstadoTicket[] = ['RESERVED', 'PAID', 'USED', 'CANCELLED']

interface FilaDemo {
    codigo: string
    evento: string
    estado: EstadoTicket
    precio: number
}
const filasDemo: FilaDemo[] = [
    { codigo: 'TKT-8F2A1C', evento: 'Caribbean Music Fest 2026', estado: 'PAID', precio: 250000 },
    { codigo: 'TKT-1B77D0', evento: 'Cumbre Tech Caribe 2027', estado: 'USED', precio: 180000 },
]

function Seccion({ titulo, children }: { titulo: string; children: ReactNode }) {
    return (
        <Tarjeta>
            <h2 className="mb-3 text-base font-semibold">{titulo}</h2>
            {children}
        </Tarjeta>
    )
}

export default function PantallaPrueba() {
    const [oscuro, setOscuro] = useState(() => document.documentElement.classList.contains('dark'))
    const [modalAbierto, setModalAbierto] = useState(false)
    const [avisoVisible, setAvisoVisible] = useState(true)

    function alternarTema() {
        const siguiente = !oscuro
        document.documentElement.classList.toggle('dark', siguiente)
        setOscuro(siguiente)
    }

    return (
        <main className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8">
            <div className="flex items-center justify-between gap-4">
                <h1 className="text-3xl font-bold">Sistema visual</h1>
                <Boton variante="secundario" onClick={alternarTema} aria-pressed={oscuro}>
                    {oscuro ? <IconoSol /> : <IconoLuna />}
                    {oscuro ? 'Modo claro' : 'Modo oscuro'}
                </Boton>
            </div>

            <Seccion titulo="Color">
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                    {colores.map((c) => (
                        <li key={c.nombre}>
                            <div className={clsx('h-10 rounded-lg', c.clase)} />
                            <p className="mt-1 text-xs font-semibold">{c.nombre}</p>
                            <CodigoTexto className="text-xs text-slate-600 dark:text-slate-400">
                                {c.hex}
                            </CodigoTexto>
                        </li>
                    ))}
                </ul>
            </Seccion>

            <Seccion titulo="Tipografía">
                <p className="font-titulo text-4xl font-bold">Poppins — títulos</p>
                <p className="mt-2 text-sm">
                    Inter — cuerpo de texto, formularios y tablas. Fechas es-CO y precios{' '}
                    <PrecioCOP valor={250000} className="font-bold" /> (PrecioCOP).
                </p>
            </Seccion>

            <Seccion titulo="Botones">
                <div className="flex flex-wrap items-center gap-3">
                    <Boton>Primario</Boton>
                    <Boton variante="secundario">Secundario</Boton>
                    <Boton variante="peligro">Peligro</Boton>
                    <Boton variante="fantasma">Fantasma</Boton>
                    <Boton cargando>Comprar</Boton>
                </div>
            </Seccion>

            <Seccion titulo="Badges de estado">
                <div className="flex flex-wrap gap-2">
                    {estadosEvento.map((e) => (
                        <BadgeEstadoEvento key={e} estado={e} />
                    ))}
                    {estadosTicket.map((e) => (
                        <BadgeEstadoTicket key={`t-${e}`} estado={e} />
                    ))}
                    <Badge tono="info">Tono libre</Badge>
                </div>
            </Seccion>

            <Seccion titulo="Campos">
                <div className="grid gap-4 sm:grid-cols-2">
                    <Campo etiqueta="Campo normal" defaultValue="Texto" ayuda="Texto de ayuda" />
                    <Campo etiqueta="Campo con error" error="Este campo es obligatorio" />
                    <Selector etiqueta="Categoría" defaultValue="">
                        <option value="">Todas</option>
                        <option value="MUSIC">MUSIC</option>
                        <option value="TECHNOLOGY">TECHNOLOGY</option>
                    </Selector>
                </div>
            </Seccion>

            <Seccion titulo="Estados de interfaz">
                <div className="grid gap-4 md:grid-cols-3">
                    <Cargando />
                    <EstadoVacio
                        mensaje="Aún no hay eventos publicados"
                        accion={<Boton variante="secundario">Ver artistas</Boton>}
                    />
                    <EstadoError
                        mensaje="No pudimos conectar con el servidor."
                        onReintentar={() => undefined}
                    />
                </div>
            </Seccion>

            <Seccion titulo="Avisos (toast) de mutaciones">
                <div className="grid gap-3 md:grid-cols-2">
                    {avisoVisible ? (
                        <Aviso tono="exito" onCerrar={() => setAvisoVisible(false)} autoCierreMs={4000}>
                            Cuenta creada, inicia sesión.
                        </Aviso>
                    ) : (
                        <Boton variante="fantasma" onClick={() => setAvisoVisible(true)}>
                            Mostrar aviso de éxito
                        </Boton>
                    )}
                    <Aviso tono="error">El ticket no puede cancelarse en su estado actual.</Aviso>
                    <Aviso tono="info">Tu sesión expiró. Inicia sesión de nuevo.</Aviso>
                    <Aviso tono="advertencia">El ticket ya fue utilizado.</Aviso>
                </div>
            </Seccion>

            <Seccion titulo="Tabla y modal">
                <Tabla
                    descripcion="Tickets de ejemplo"
                    filas={filasDemo}
                    clave={(f) => f.codigo}
                    columnas={[
                        { encabezado: 'Código', celda: (f) => <CodigoTexto>{f.codigo}</CodigoTexto> },
                        { encabezado: 'Evento', celda: (f) => f.evento },
                        { encabezado: 'Estado', celda: (f) => <BadgeEstadoTicket estado={f.estado} /> },
                        { encabezado: 'Precio', celda: (f) => <PrecioCOP valor={f.precio} /> },
                    ]}
                />
                <Boton className="mt-4" variante="peligro" onClick={() => setModalAbierto(true)}>
                    Abrir modal
                </Boton>
                <Modal
                    abierto={modalAbierto}
                    titulo="Cancelar ticket"
                    onCerrar={() => setModalAbierto(false)}
                >
                    <Aviso tono="error" className="mb-4">
                        El ticket no puede cancelarse en su estado actual.
                    </Aviso>
                    <div className="flex justify-end gap-3">
                        <Boton variante="secundario" onClick={() => setModalAbierto(false)}>
                            Volver
                        </Boton>
                        <Boton variante="peligro">Confirmar</Boton>
                    </div>
                </Modal>
            </Seccion>
        </main>
    )
}
