import { FormularioLogin } from '../funcionalidades/auth/componentes/FormularioLogin'
import { TarjetaAuth } from '../funcionalidades/auth/componentes/TarjetaAuth'

export default function Login() {
    return (
        <TarjetaAuth titulo="Inicia sesión">
            <FormularioLogin />
        </TarjetaAuth>
    )
}