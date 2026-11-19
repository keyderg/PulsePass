import { z } from 'zod'

export const VenueResponseSchema = z.object({
    id: z.number(),
    code: z.string(),
    name: z.string(),
    city: z.string(),
    address: z.string().nullish(),
    capacity: z.number(),
    active: z.boolean(),
})
export type VenueResponse = z.infer<typeof VenueResponseSchema>

export const VenueListSchema = z.array(VenueResponseSchema)