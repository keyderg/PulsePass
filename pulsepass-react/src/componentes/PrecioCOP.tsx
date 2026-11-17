import { formatearCOP } from '../lib/formato'

export interface PrecioCOPProps {
    valor: number
    className?: string
}

export function PrecioCOP({ valor, className }: PrecioCOPProps) {
    return <span className={className}>{formatearCOP(valor)}</span>
}
