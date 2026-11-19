import { z } from 'zod'
import { ArtistResponseSchema } from '../artistas/tipos'

export const EVENT_CATEGORIES = [
    'MUSIC',
    'SPORTS',
    'TECHNOLOGY',
    'EDUCATION',
    'CULTURE',
    'ENTERTAINMENT',
] as const
export const EventCategorySchema = z.enum(EVENT_CATEGORIES)
export type EventCategory = z.infer<typeof EventCategorySchema>

export const EventStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'SOLD_OUT', 'CANCELLED', 'FINISHED'])
export type EventStatus = z.infer<typeof EventStatusSchema>

export const EventResponseSchema = z.object({
    id: z.number(),
    eventCode: z.string(),
    name: z.string(),
    description: z.string().nullish(),
    category: EventCategorySchema,
    status: EventStatusSchema,
    eventDate: z.string(), // LocalDateTime ISO sin zona, p. ej. "2026-12-12T20:00:00"
    minimumAge: z.number().nullish(),
    venueCode: z.string(),
    venueName: z.string(),
    artists: z.array(ArtistResponseSchema),
})
export type EventResponse = z.infer<typeof EventResponseSchema>

// La API real no incluye category ni ciudad en el resumen (ver nota GAP en la Parte 4).
export const EventSummaryResponseSchema = z.object({
    eventCode: z.string(),
    name: z.string(),
    status: EventStatusSchema,
    eventDate: z.string(),
    venueName: z.string(),
})
export type EventSummaryResponse = z.infer<typeof EventSummaryResponseSchema>
export const EventSummaryListSchema = z.array(EventSummaryResponseSchema)

export const CrearEventoSchema = z.object({
    eventCode: z.string().trim().min(1, 'Ingresa el código del evento'),
    name: z.string().trim().min(1, 'Ingresa el nombre del evento'),
    description: z.string().max(1000, 'La descripción admite máximo 1000 caracteres').optional(),    category: z.enum(EVENT_CATEGORIES, { error: 'Selecciona una categoría' }),
    eventDate: z.string().min(1, 'Selecciona la fecha y hora del evento'),
    minimumAge: z
        .number({ error: 'Ingresa la edad mínima' })
        .int('La edad mínima debe ser un número entero')
        .min(0, 'La edad mínima no puede ser negativa'),
    venueCode: z.string().trim().min(1, 'Selecciona una sede'),
})
/** CreateEventRequest. Si description va vacía, envíala como undefined. */
export type CreateEventRequest = z.infer<typeof CrearEventoSchema>

/** Vista compuesta para tarjetas: resumen + categoría (detalle) + ciudad (sedes activas). */
export const EventoTarjetaSchema = EventSummaryResponseSchema.extend({
    ciudad: z.string().optional(),
    categoria: EventCategorySchema.optional(),
})
export type EventoTarjeta = z.infer<typeof EventoTarjetaSchema>

/** Búsqueda por código de evento (formularios de ADMIN y STAFF). */
export const BuscarEventoSchema = z.object({
    codigo: z.string().trim().min(1, 'Ingresa el código del evento').max(50, 'Máximo 50 caracteres'),
})
export type BuscarEventoForm = z.infer<typeof BuscarEventoSchema>
