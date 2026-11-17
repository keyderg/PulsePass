import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { rutas } from '../../Router'
import { renderizarRutas } from '../../test/Utils'

describe('sedes', () => {
    it('TEST-FE-VEN-001: lista y detalle de sede; 404 de sede', async () => {
        const { user, unmount } = renderizarRutas(rutas, { entradas: ['/sedes'] })
        const tarjeta = await screen.findByRole('link', { name: /Marina Convention Center/ })
        expect(tarjeta).toHaveTextContent('Santa Marta · Cap. 3')

        await user.click(tarjeta)
        expect(await screen.findByRole('heading', { name: 'Marina Convention Center' })).toBeInTheDocument()
        expect(screen.getByText('VEN-SMR-01')).toBeInTheDocument()
        expect(screen.getByText('3 personas')).toBeInTheDocument()
        unmount()

        renderizarRutas(rutas, { entradas: ['/sedes/NO-EXISTE'] })
        expect(await screen.findByText('No encontramos esta página.')).toBeInTheDocument()
    })
})