import { Link, useNavigate } from 'react-router'
import { Aviso } from '../componentes/Aviso'
import { clasesBoton } from '../componentes/Boton'
import { ContenedorEstrecho } from '../componentes/ContenedorEstrecho'
import { BuscadorEventoPorCodigo } from '../funcionalidades/eventos/componentes/BuscadorEventoPorCodigo'
import { FilaEventoCreado } from '../funcionalidades/eventos/componentes/FilaEventoCreado'
import { useEventosCreados } from '../funcionalidades/eventos/hooks'
import { RUTAS } from '../lib/rutas'

export default function AdminEventos() {
    const navigate = useNavigate()
    const creados = useEventosCreados()

    return (
        <ContenedorEstrecho className="gap-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-3xl font-bold">Administración de eventos</h1>
                <Link to={RUTAS.adminNuevoEvento} className={clasesBoton('primario')}>
                    + Nuevo evento
                </Link>
            </div>

            <BuscadorEventoPorCodigo
                etiqueta="Buscar evento por código"
                textoBoton="Abrir"
                onBuscar={(codigo) => void navigate(RUTAS.adminEvento(codigo))}
            />

            <section aria-labelledby="titulo-creados" className="flex flex-col gap-3">
                <h2 id="titulo-creados" className="text-lg font-bold">
                    Creados en esta sesión
                </h2>
                {creados.data.length === 0 ? (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Aún no has creado eventos en esta sesión.
                    </p>
                ) : (
                    <ul className="flex flex-col gap-3">
                        {creados.data.map((c) => (
                            <FilaEventoCreado key={c} eventCode={c} />
                        ))}
                    </ul>
                )}
            </section>

            <Aviso tono="info">Nota: la API no ofrece un listado completo de eventos (GAP-01).</Aviso>
        </ContenedorEstrecho>
    )
}