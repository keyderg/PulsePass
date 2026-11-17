import { Link } from 'react-router'
import { Badge } from '../componentes/Badge'
import { Boton, clasesBoton } from '../componentes/Boton'
import { Cargando } from '../componentes/Cargando'
import { EstadoError } from '../componentes/EstadoError'
import { IconoTicket } from '../componentes/Iconos'
import { Tarjeta } from '../componentes/Tarjeta'
import { useAuth, useSalir } from '../funcionalidades/auth/hooks'
import { useUsuarioPorEmail } from '../funcionalidades/usuarios/hooks'
import { formatearFecha } from '../lib/formato'
import { mensajeDeError } from '../lib/mensajesError'
import { RUTAS } from '../lib/rutas'

export default function Cuenta() {
    const { sesion, tieneRol } = useAuth()
    const salir = useSalir()
    const identidad = sesion.estado === 'autenticado' ? sesion.usuario : null
    const consulta = useUsuarioPorEmail(identidad?.email)

    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold">Mi cuenta</h1>

            {consulta.isPending ? <Cargando /> : null}
            {consulta.isError ? (
                <EstadoError
                    mensaje={mensajeDeError(consulta.error)}
                    onReintentar={() => void consulta.refetch()}
                />
            ) : null}

            {consulta.data && identidad ? (
                <Tarjeta className="flex flex-wrap items-center gap-4 p-6">
          <span
              aria-hidden="true"
              className="flex size-14 items-center justify-center rounded-full bg-marca-50 text-xl font-bold text-marca-700 dark:bg-indigo-950 dark:text-indigo-300"
          >
            {consulta.data.firstName.charAt(0).toUpperCase()}
          </span>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold">
                            {consulta.data.firstName} {consulta.data.lastName}
                        </h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            @{consulta.data.username} · {consulta.data.email}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                            Nacimiento: {formatearFecha(consulta.data.birthDate)}
                        </p>
                    </div>
                    <div className="flex flex-col gap-1 text-xs">
                        <p className="flex items-center gap-2">
                            Rol:
                            {identidad.roles.map((r) => (
                                <Badge key={r} tono="marca">
                                    {r}
                                </Badge>
                            ))}
                        </p>
                        <p className="flex items-center gap-2">
                            Estado:
                            <Badge tono={consulta.data.active ? 'exito' : 'peligro'}>
                                {consulta.data.active ? 'Activa' : 'Inactiva'}
                            </Badge>
                        </p>
                    </div>
                </Tarjeta>
            ) : null}

            <div className="flex justify-between gap-3">
                {tieneRol('USER') ? (
                    <Link to={RUTAS.misTickets} className={clasesBoton('primario')}>
                        <IconoTicket className="size-4" />
                        Ver mis tickets
                    </Link>
                ) : (
                    <span />
                )}
                <Boton variante="secundario" onClick={() => void salir()}>
                    Cerrar sesión
                </Boton>
            </div>
        </div>
    )
}