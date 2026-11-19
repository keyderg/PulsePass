import { z } from 'zod'

export const RolSchema = z.enum(['USER', 'STAFF', 'ADMIN'])
export type Rol = z.infer<typeof RolSchema>

export const LoginSchema = z.object({
    identifier: z.string().trim().min(1, 'Ingresa tu usuario o correo').max(150, 'Máximo 150 caracteres'),
    password: z.string().min(1, 'Ingresa tu contraseña').max(128, 'Máximo 128 caracteres'),
})
export type LoginRequest = z.infer<typeof LoginSchema>

export const AuthResponseSchema = z.object({
    accessToken: z.string().min(1),
    tokenType: z.literal('Bearer'),
    expiresIn: z.number(),
})
export type AuthResponse = z.infer<typeof AuthResponseSchema>

/** GET /api/auth/me: la API real NO devuelve el correo (solo id, username y roles). */
export const AuthenticatedUserResponseSchema = z.object({
    id: z.number(),
    username: z.string(),
    roles: z.array(RolSchema),
})
export type AuthenticatedUserResponse = z.infer<typeof AuthenticatedUserResponseSchema>

/** Identidad de la sesión: /auth/me (id, username, roles) + perfil por username (email, nombre). */
export const UsuarioAutenticadoSchema = z.object({
    id: z.number(),
    username: z.string(),
    email: z.string(),
    nombre: z.string(),
    roles: z.array(RolSchema),
})
export type UsuarioAutenticado = z.infer<typeof UsuarioAutenticadoSchema>

export type Sesion =
    | { estado: 'cargando' }
    | { estado: 'anonimo'; motivo: 'expirada' | null }
    | { estado: 'autenticado'; token: string; expiraEn: number; usuario: UsuarioAutenticado }