import { z } from 'zod'

export const ArtistResponseSchema = z.object({
    id: z.number(),
    stageName: z.string(),
    country: z.string().nullish(),
    genre: z.string().nullish(),
    active: z.boolean(),
})
export type ArtistResponse = z.infer<typeof ArtistResponseSchema>

export const ArtistListSchema = z.array(ArtistResponseSchema)