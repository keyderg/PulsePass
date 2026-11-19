import { z } from 'zod'

export const TICKET_TYPES = ['GENERAL', 'VIP', 'BACKSTAGE', 'STUDENT'] as const
export const TicketTypeSchema = z.enum(TICKET_TYPES)
export type TicketType = z.infer<typeof TicketTypeSchema>

export const TicketStatusSchema = z.enum(['RESERVED', 'PAID', 'CANCELLED', 'USED'])
export type TicketStatus = z.infer<typeof TicketStatusSchema>

export const TicketResponseSchema = z.object({
    id: z.number(),
    ticketCode: z.string(),
    type: TicketTypeSchema,
    price: z.number(),
    status: TicketStatusSchema,
    purchaseDate: z.string().nullish(),
    userEmail: z.string(),
    eventCode: z.string(),
    eventName: z.string(),
})
export type TicketResponse = z.infer<typeof TicketResponseSchema>
export const TicketListSchema = z.array(TicketResponseSchema)

/** Formulario de compra: solo el tipo. El email sale de la sesión, nunca de un campo (PRD 24.3). */
export const CompraSchema = z.object({
    type: z.enum(TICKET_TYPES, { error: 'Selecciona un tipo de entrada' }),
})
export type CompraForm = z.infer<typeof CompraSchema>

export const PurchaseTicketRequestSchema = z.object({
    userEmail: z.email(),
    eventCode: z.string().min(1),
    type: TicketTypeSchema,
})
export type PurchaseTicketRequest = z.infer<typeof PurchaseTicketRequestSchema>

export const ValidacionIngresoSchema = z.object({
    ticketCode: z.string().trim().min(1, 'Ingresa el código del ticket'),
})
export type ValidacionIngresoForm = z.infer<typeof ValidacionIngresoSchema>