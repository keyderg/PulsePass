import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router'
import { Aviso } from '../../../componentes/Aviso'
import { Boton } from '../../../componentes/Boton'
import { Campo } from '../../../componentes/Campo'
import { aplicarErroresServidor } from '../../../lib/formularios'
import { leerEstadoNavegacion } from '../../../lib/navegacion'
import { RUTAS } from '../../../lib/rutas'
import { useAuth } from '../hooks'
import { LoginSchema, type LoginRequest } from '../tipos'
import { CampoContrasena } from './CampoContrasena'

const CAMPOS = ['identifier', 'password'] as const

export function FormularioLogin() {
    const { iniciarSesion } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const estado = leerEstadoNavegacion(location.state)
    const [aviso, setAviso] = useState<string | null>(null)
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<LoginRequest>({
        resolver: zodResolver(LoginSchema),
        defaultValues: { identifier: '', password: '' },
    })

    async function enviar(datos: LoginRequest) {
        setAviso(null)
        try {
            await iniciarSesion(datos.identifier, datos.password)
            void navigate(estado.desde ?? RUTAS.inicio, { replace: true })
        } catch (error: unknown) {
            const mensaje = aplicarErroresServidor<LoginRequest>(error, setError, CAMPOS, { login: true })
            setAviso(mensaje && !mensaje.endsWith('.') ? `${mensaje}.` : mensaje)
        }
    }

    return (
        <form onSubmit={handleSubmit(enviar)} noValidate className="flex flex-col gap-4">
            {estado.registrado ? <Aviso tono="exito">Cuenta creada, inicia sesión.</Aviso> : null}
            {estado.motivo === 'expirada' ? (
                <Aviso tono="info">Tu sesión expiró. Inicia sesión de nuevo.</Aviso>
            ) : null}
            <Campo
                etiqueta="Usuario o correo"
                autoComplete="username"
                error={errors.identifier?.message}
                {...register('identifier')}
            />
            <CampoContrasena
                etiqueta="Contraseña"
                autoComplete="current-password"
                error={errors.password?.message}
                {...register('password')}
            />
            <div aria-live="polite">{aviso ? <Aviso tono="error">{aviso}</Aviso> : null}</div>
            <Boton type="submit" cargando={isSubmitting} className="w-full">
                Ingresar
            </Boton>
            <p className="text-center text-xs text-slate-600 dark:text-slate-400">
                ¿No tienes cuenta?{' '}
                <Link to={RUTAS.registro} className="font-semibold text-marca-600 dark:text-marca-500">
                    Regístrate
                </Link>
            </p>
        </form>
    )
}