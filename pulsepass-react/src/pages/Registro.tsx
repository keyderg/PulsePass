import { FormularioRegistro } from '../funcionalidades/auth/componentes/FormularioRegistro'
import { TarjetaAuth } from '../funcionalidades/auth/componentes/TarjetaAuth'

export default function Registro() {
    return (
        <TarjetaAuth titulo="Crea tu cuenta" ancho="lg">
            <FormularioRegistro />
        </TarjetaAuth>
    )
}