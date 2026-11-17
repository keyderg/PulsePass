import { QueryClient } from '@tanstack/react-query'
import { ApiError } from './apiError'

/** 4xx → sin reintento; red o 5xx → 1 reintento (sección 14.3). */
export function reintentarConsulta(intentosFallidos: number, error: unknown): boolean {
    if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false
    return intentosFallidos < 1
}

export function crearQueryClient(): QueryClient {
    return new QueryClient({
        defaultOptions: {
            queries: { retry: reintentarConsulta, refetchOnWindowFocus: false },
            mutations: { retry: false }, // nunca reintentar: evita compras duplicadas
        },
    })
}

export const queryClient = crearQueryClient()