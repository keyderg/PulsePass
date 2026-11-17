import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { borrarCredencial } from '../funcionalidades/auth/almacen'
import { restablecerSesionHttp } from '../lib/http'
import { server } from './mocks/server'

beforeAll(() => server.listen())

afterEach(() => {
    cleanup()
    server.resetHandlers()
    restablecerSesionHttp()
    borrarCredencial()
    sessionStorage.clear()
})

afterAll(() => server.close())