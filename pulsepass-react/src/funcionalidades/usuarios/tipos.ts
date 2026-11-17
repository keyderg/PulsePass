import { z } from 'zod'
import { esFechaISOValida, fechaLocalISO } from '../../lib/formato'

export const UserResponseSchema = z.object({
    id: z.number(),
    username: z.string(),
    email: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    birthDate: z.string(), // LocalDate "YYYY-MM-DD"
    active: z.boolean(),
})
export type UserResponse = z.infer<typeof UserResponseSchema>

/** `obtenerHoy` se inyecta para que las pruebas no dependan del reloj del sistema. */
export function crearRegistroSchema(obtenerHoy: () => string = () => fechaLocalISO()) {
    return z.object({
        username: z.string().trim().min(1, 'Ingresa un nombre de usuario').max(50, 'Máximo 50 caracteres'),
        email: z.email('Ingresa un correo válido').max(150, 'Máximo 150 caracteres'),
        firstName: z.string().trim().min(1, 'Ingresa tu nombre').max(100, 'Máximo 100 caracteres'),
        lastName: z.string().trim().min(1, 'Ingresa tu apellido').max(100, 'Máximo 100 caracteres'),
        birthDate: z
            .string()
            .min(1, 'Ingresa tu fecha de nacimiento')
            .refine(esFechaISOValida, 'Ingresa una fecha válida')
            .refine((v) => v <= obtenerHoy(), 'La fecha no puede ser futura'),
        password: z
            .string()
            .min(12, 'La contraseña debe tener al menos 12 caracteres')
            .refine((p) => new TextEncoder().encode(p).length <= 72, 'La contraseña no puede superar 72 bytes'),
    })
}
export const RegistroSchema = crearRegistroSchema()
/** RegisterUserRequest (POST /api/users). */
export type RegisterUserRequest = z.infer<typeof RegistroSchema>