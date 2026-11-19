import { useEffect, useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { Aviso } from '../componentes/Aviso'
import { BadgeEstadoTicket } from '../componentes/Badge'
import { Boton } from '../componentes/Boton'
import { Campo } from '../componentes/Campo'
import { Cargando } from '../componentes/Cargando'
import { IconoBuscar } from '../componentes/Iconos'
import { Tarjeta } from '../componentes/Tarjeta'
import { NombreTitular } from '../funcionalidades/tickets/componentes/NombreTitular'
import { useBuscarTicket, useUsarTicket } from '../funcionalidades/tickets/hooks'
import { ValidacionIngresoSchema, type ValidacionIngresoForm } from '../funcionalidades/tickets/tipos'
import { tieneEstado } from '../lib/apiError'
import { mensajeDeError } from '../lib/mensajesError'
import { RUTAS } from '../lib/rutas'

function mensajeStaff(error: unknown): string {
  if (tieneEstado(error, 404)) return 'Ticket no encontrado'
  if (tieneEstado(error, 403)) return 'Sin permisos'
  return mensajeDeError(error)
}

export default function ValidacionIngreso() {
  const [codigo, setCodigo] = useState('')
  const buscar = useBuscarTicket(codigo)
  const usar = useUsarTicket()
  const inputRef = useRef<HTMLInputElement>(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ValidacionIngresoForm>({
    resolver: zodResolver(ValidacionIngresoSchema),
    defaultValues: { ticketCode: '' },
  })
  const { ref: refRegistro, ...campo } = register('ticketCode')

  // Foco automático en el campo al abrir la pantalla (uso en puerta).
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function alBuscar(datos: ValidacionIngresoForm) {
    usar.reset()
    if (datos.ticketCode === codigo) void buscar.refetch()
    else setCodigo(datos.ticketCode)
  }

  function marcarUsado(ticketCode: string) {
    usar.mutate(ticketCode, {
      onSuccess: () => {
        reset({ ticketCode: '' })
        inputRef.current?.focus()
      },
      onError: (e) => {
        // Si ya estaba usado, se vuelve a pedir para mostrar su estado real.
        if (tieneEstado(e, 409)) void buscar.refetch()
      },
    })
  }

  const ticket = usar.data ?? buscar.data

  return (
      <div className="flex max-w-2xl flex-col gap-5">
        <h1 className="text-3xl font-bold">Validación de ingreso</h1>

        <form
            onSubmit={(e) => void handleSubmit(alBuscar)(e)}
            noValidate
            className="flex items-start gap-3"
        >
          <Campo
              etiqueta="Código de ticket"
              autoComplete="off"
              error={errors.ticketCode?.message}
              className="flex-1"
              {...campo}
              ref={(el) => {
                refRegistro(el)
                inputRef.current = el
              }}
          />
          <Boton type="submit" className="mt-6" cargando={buscar.isFetching && !buscar.data}>
            <IconoBuscar />
            Buscar
          </Boton>
        </form>

        {buscar.isFetching && !ticket ? <Cargando /> : null}
        {buscar.isError ? <Aviso tono="error">{mensajeStaff(buscar.error)}</Aviso> : null}

        {ticket ? (
            <Tarjeta className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-titulo text-xl font-bold">{ticket.eventName}</h2>
                <BadgeEstadoTicket estado={ticket.status} />
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                {ticket.type} · Titular: <NombreTitular email={ticket.userEmail} />
              </p>
              {ticket.status === 'PAID' ? (
                  <Boton
                      className="min-h-14 w-full text-base"
                      cargando={usar.isPending}
                      onClick={() => marcarUsado(ticket.ticketCode)}
                  >
                    Marcar como usado
                  </Boton>
              ) : null}
              <Link
                  to={RUTAS.ticketsPagados(ticket.eventCode)}
                  className="w-fit text-sm font-medium text-marca-600 hover:underline dark:text-marca-500"
              >
                Ver tickets pagados del evento
              </Link>
            </Tarjeta>
        ) : null}

        {usar.isSuccess ? (
            <Aviso tono="exito" className="text-base font-bold">
              Ingreso registrado.
            </Aviso>
        ) : null}
        {usar.isError ? (
            <Aviso tono={tieneEstado(usar.error, 409) ? 'advertencia' : 'error'} className="text-base font-bold">
              {mensajeStaff(usar.error)}
            </Aviso>
        ) : null}
      </div>
  )
}