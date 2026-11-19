import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { Aviso } from '../../../componentes/Aviso'
import { Boton, clasesBoton } from '../../../componentes/Boton'
import { Campo } from '../../../componentes/Campo'
import { tieneEstado } from '../../../lib/apiError'
import { aplicarErroresServidor } from '../../../lib/formularios'
import { normalizarFechaHora } from '../../../lib/formato'
import { RUTAS } from '../../../lib/rutas'
import { useSedesActivas } from '../../sedes/hooks'
import { useCrearEvento } from '../hooks'
import { CrearEventoSchema, EVENT_CATEGORIES, type CreateEventRequest } from '../tipos'
import { CampoArea, CampoSelect } from './CamposFormulario'

const CAMPOS = [
    'eventCode',
    'name',
    'description',
    'category',
    'eventDate',
    'minimumAge',
    'venueCode',
] as const
const MAX_DESCRIPCION = 1000

export function FormularioCrearEvento() {
    const navigate = useNavigate()
    const crear = useCrearEvento()
    const sedes = useSedesActivas()
    const [aviso, setAviso] = useState<string | null>(null)
    const {
        register,
        handleSubmit,
        setError,
        control,
        formState: { errors },
    } = useForm<CreateEventRequest>({
        resolver: zodResolver(CrearEventoSchema),
        defaultValues: { eventCode: '', name: '', description: '', venueCode: '' },
    })
    const descripcion = useWatch({ control, name: 'description' }) ?? ''

    async function enviar(datos: CreateEventRequest) {
        setAviso(null)
        try {
            const evento = await crear.mutateAsync({
                ...datos,
                description: datos.description?.trim() ? datos.description : undefined,
                eventDate: normalizarFechaHora(datos.eventDate),
            })
            void navigate(RUTAS.adminEvento(evento.eventCode), { state: { creado: true } })
        } catch (error: unknown) {
            if (tieneEstado(error, 403)) {
                void navigate(RUTAS.sinPermisos)
                return
            }
            setAviso(aplicarErroresServidor<CreateEventRequest>(error, setError, CAMPOS))
        }
    }

    return (
        <form onSubmit={(e) => void handleSubmit(enviar)(e)} noValidate className="flex flex-col gap-4">
            <div aria-live="polite">{aviso ? <Aviso tono="error">{aviso}</Aviso> : null}</div>
            {sedes.isError ? (
                <Aviso tono="error">No pudimos cargar las sedes. Recarga la página para reintentar.</Aviso>
            ) : null}

            <Campo
                etiqueta="Código del evento"
                autoComplete="off"
                error={errors.eventCode?.message}
                {...register('eventCode')}
            />
            <Campo
                etiqueta="Nombre"
                autoComplete="off"
                error={errors.name?.message}
                {...register('name')}
            />
            <CampoArea
                etiqueta="Descripción"
                error={errors.description?.message}
                contador={`${descripcion.length}/${MAX_DESCRIPCION}`}
                {...register('description')}
            />
            <div className="grid gap-4 sm:grid-cols-2">
                <CampoSelect etiqueta="Categoría" error={errors.category?.message} {...register('category')}>
                    <option value="">Selecciona una categoría</option>
                    {EVENT_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                            {c}
                        </option>
                    ))}
                </CampoSelect>
                <Campo
                    etiqueta="Edad mínima"
                    type="number"
                    min={0}
                    step={1}
                    inputMode="numeric"
                    error={errors.minimumAge?.message}
                    {...register('minimumAge', { valueAsNumber: true })}
                />
            </div>
            <Campo
                etiqueta="Fecha y hora"
                type="datetime-local"
                error={errors.eventDate?.message}
                {...register('eventDate')}
            />
            <CampoSelect etiqueta="Sede" error={errors.venueCode?.message} {...register('venueCode')}>
                <option value="">Selecciona una sede</option>
                {(sedes.data ?? []).map((s) => (
                    <option key={s.code} value={s.code}>
                        {s.name} ({s.code})
                    </option>
                ))}
            </CampoSelect>

            <div className="flex justify-end gap-3">
                <Link to={RUTAS.adminEventos} className={clasesBoton('secundario')}>
                    Cancelar
                </Link>
                <Boton type="submit" cargando={crear.isPending}>
                    Crear evento
                </Boton>
            </div>
        </form>
    )
}