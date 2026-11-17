import { describe, expect, it } from 'vitest'
import { crearRegistroSchema } from './tipos'

const schema = crearRegistroSchema(() => '2026-11-16')
const valido = {
    username: 'andrea',
    email: 'andrea@pulsepass.test',
    firstName: 'Andrea',
    lastName: 'Pérez',
    birthDate: '1998-04-10',
    password: 'Clave-Segura-123',
}

describe('RegistroSchema', () => {
    it('acepta datos válidos', () => {
        expect(schema.safeParse(valido).success).toBe(true)
    })

    it('exige campos obligatorios', () => {
        const r = schema.safeParse({ ...valido, username: '', firstName: '' })
        expect(r.success).toBe(false)
        const campos = r.error?.issues.map((i) => i.path[0])
        expect(campos).toContain('username')
        expect(campos).toContain('firstName')
    })

    it('rechaza correo con formato inválido', () => {
        expect(schema.safeParse({ ...valido, email: 'no-es-correo' }).success).toBe(false)
    })

    it('rechaza fecha futura y fecha imposible', () => {
        expect(schema.safeParse({ ...valido, birthDate: '2026-11-17' }).success).toBe(false)
        expect(schema.safeParse({ ...valido, birthDate: '2026-02-31' }).success).toBe(false)
        expect(schema.safeParse({ ...valido, birthDate: '2026-11-16' }).success).toBe(true)
    })

    it('exige contraseña de al menos 12 caracteres', () => {
        expect(schema.safeParse({ ...valido, password: 'corta' }).success).toBe(false)
    })

    it('rechaza contraseñas de más de 72 bytes UTF-8 aunque tengan pocos caracteres', () => {
        expect(schema.safeParse({ ...valido, password: 'ñ'.repeat(37) }).success).toBe(false) // 74 bytes
        expect(schema.safeParse({ ...valido, password: 'ñ'.repeat(36) }).success).toBe(true) // 72 bytes
    })
})