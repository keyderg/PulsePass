const formateadorCOP = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
})

export function formatearCOP(valor: number): string {
    return formateadorCOP.format(valor)
}

/** Fecha local en formato YYYY-MM-DD. El reloj se inyecta para que las pruebas sean deterministas. */
export function fechaLocalISO(fecha: Date = new Date()): string {
    const a = fecha.getFullYear()
    const m = String(fecha.getMonth() + 1).padStart(2, '0')
    const d = String(fecha.getDate()).padStart(2, '0')
    return `${a}-${m}-${d}`
}

/** true si el texto es una fecha YYYY-MM-DD real (rechaza 2026-02-31). */
export function esFechaISOValida(texto: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false
    const f = new Date(`${texto}T00:00:00Z`)
    return !Number.isNaN(f.getTime()) && f.toISOString().slice(0, 10) === texto
}

const formateadorFecha = new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
})

/** "1998-04-10" → "10/04/1998". */
export function formatearFecha(iso: string): string {
    return formateadorFecha.format(new Date(`${iso}T00:00:00Z`))
}

const fechaCorta = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
const horaCorta = new Intl.DateTimeFormat('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false })
const numeroCO = new Intl.NumberFormat('es-CO', { useGrouping: 'always' })

/** LocalDateTime sin zona ("2026-12-12T20:00:00") → hora local tal cual: "12 dic 2026". */
export function formatearFechaCorta(iso: string): string {
    return fechaCorta.format(new Date(iso))
}

export function formatearFechaHora(iso: string): string {
    const f = new Date(iso)
    return `${fechaCorta.format(f)} · ${horaCorta.format(f)}`
}

export function formatearNumero(n: number): string {
    return numeroCO.format(n)
}

/** <input type="datetime-local"> entrega "2026-12-12T20:00"; el backend recibe LocalDateTime con segundos. */
export function normalizarFechaHora(valor: string): string {
    return valor.length === 16 ? `${valor}:00` : valor
}