import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { Aviso } from '../../../componentes/Aviso'
import { Boton } from '../../../componentes/Boton'
import { Campo } from '../../../componentes/Campo'
import { ApiError } from '../../../lib/apiError'
import { aplicarErroresServidor } from '../../../lib/formularios'
import { fechaLocalISO } from '../../../lib/formato'
import { RUTAS } from '../../../lib/rutas'
import { useRegistrarUsuario } from '../../usuarios/hooks'
import { RegistroSchema, type RegisterUserRequest } from '../../usuarios/tipos'
import { CampoContrasena } from './CampoContrasena'
import { MedidorFortaleza } from './MedidorFortaleza'

const CAMPOS = ['username', 'email', 'firstName', 'lastName', 'birthDate', 'password'] as const

export function FormularioRegistro() {
    const navigate = useNavigate()
    const registrar = useRegistrarUsuario()
    const [aviso, setAviso] = useState<string | null>(null)
    const {
        register,
        handleSubmit,
        setError,
        control,
        formState: { errors },
    } = useForm<RegisterUserRequest>({
        resolver: zodResolver(RegistroSchema),
        defaultValues: {
            username: '',
            email: '',
            firstName: '',
            lastName: '',
            birthDate: '',
            password: '',
        },
    })
    const clave = useWatch({ control, name: 'password' })

    async function enviar(datos: RegisterUserRequest) {
        setAviso(null)
        try {
            await registrar.mutateAsync(datos)
            void navigate(RUTAS.login, { state: { registrado: true } })
        } catch (error: unknown) {
            if (error instanceof ApiError && error.status === 409) {
                setAviso('El usuario o correo ya está registrado')
                return
            }
            setAviso(aplicarErroresServidor<RegisterUserRequest>(error, setError, CAMPOS))
        }
    }

    return (
        <form onSubmit={handleSubmit(enviar)} noValidate className="flex flex-col gap-4">
            <Campo
                etiqueta="Nombre de usuario"
                autoComplete="username"
                error={errors.username?.message}
                {...register('username')}
            />
            <Campo
                etiqueta="Correo electrónico"
                type="email"
                autoComplete="email"
                error={errors.email?.message}
                {...register('email')}
            />
            <div className="grid gap-4 sm:grid-cols-2">
                <Campo
                    etiqueta="Nombres"
                    autoComplete="given-name"
                    error={errors.firstName?.message}
                    {...register('firstName')}
                />
                <Campo
                    etiqueta="Apellidos"
                    autoComplete="family-name"
                    error={errors.lastName?.message}
                    {...register('lastName')}
                />
            </div>
            <Campo
                etiqueta="Fecha de nacimiento"
                type="date"
                max={fechaLocalISO()}
                autoComplete="bday"
                error={errors.birthDate?.message}
                {...register('birthDate')}
            />
            <div className="flex flex-col gap-2">
                <CampoContrasena
                    etiqueta="Contraseña (mín. 12 caracteres)"
                    autoComplete="new-password"
                    ayuda="Entre 12 caracteres y 72 bytes."
                    error={errors.password?.message}
                    {...register('password')}
                />
                <MedidorFortaleza clave={clave} />
            </div>
            <div aria-live="polite">{aviso ? <Aviso tono="error">{aviso}</Aviso> : null}</div>
            <Boton type="submit" cargando={registrar.isPending} className="w-full">
                Crear cuenta
            </Boton>
            <p className="text-center text-xs text-slate-600 dark:text-slate-400">
                ¿Ya tienes cuenta?{' '}
                <Link to={RUTAS.login} className="font-semibold text-marca-600 dark:text-marca-500">
                    Inicia sesión
                </Link>
            </p>
        </form>
    )
}