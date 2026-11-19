import { useTitular } from '../hooks'

export function NombreTitular({ email }: { email: string }) {
    return <>{useTitular(email)}</>
}