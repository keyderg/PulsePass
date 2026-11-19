export interface Fortaleza {
    segmentos: number // 0..8
    etiqueta: 'baja' | 'media' | 'alta'
}

export function calcularFortaleza(clave: string): Fortaleza {
    const largo = Math.min(Math.floor(clave.length / 3), 4)
    const variedad = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(clave)).length
    const segmentos = clave.length === 0 ? 0 : largo + variedad
    const etiqueta = segmentos <= 3 ? 'baja' : segmentos <= 6 ? 'media' : 'alta'
    return { segmentos, etiqueta }
}