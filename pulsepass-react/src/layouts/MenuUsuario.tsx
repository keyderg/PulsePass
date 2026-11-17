import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { IconoChevronAbajo } from '../componentes/Iconos'
import { RUTAS } from '../lib/rutas'

interface MenuUsuarioProps {
  nombre: string
  mostrarTickets: boolean
  onSalir: () => void
}

const claseItem =
  'flex min-h-11 w-full items-center px-4 text-left text-sm hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-marca-600 dark:hover:bg-slate-800'

export function MenuUsuario({ nombre, mostrarTickets, onSalir }: MenuUsuarioProps) {
  const [abierto, setAbierto] = useState(false)
  const contenedor = useRef<HTMLDivElement>(null)
  const boton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!abierto) return
    function alPulsarFuera(e: MouseEvent) {
      if (e.target instanceof Node && !contenedor.current?.contains(e.target)) setAbierto(false)
    }
    function alTeclear(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setAbierto(false)
        boton.current?.focus()
      }
    }
    document.addEventListener('mousedown', alPulsarFuera)
    document.addEventListener('keydown', alTeclear)
    return () => {
      document.removeEventListener('mousedown', alPulsarFuera)
      document.removeEventListener('keydown', alTeclear)
    }
  }, [abierto])

  return (
    <div ref={contenedor} className="relative">
      <button
        ref={boton}
        type="button"
        aria-expanded={abierto}
        aria-controls="menu-usuario"
        onClick={() => setAbierto((v) => !v)}
        className="flex min-h-11 items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pr-3 pl-1.5 text-sm font-medium hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-marca-600 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
      >
        <span
          aria-hidden="true"
          className="flex size-7 items-center justify-center rounded-full bg-marca-50 text-xs font-bold text-marca-700 dark:bg-indigo-950 dark:text-indigo-300"
        >
          {nombre.charAt(0).toUpperCase()}
        </span>
        {nombre}
        <IconoChevronAbajo className="size-4" />
      </button>
      {abierto ? (
        <ul
          id="menu-usuario"
          className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900"
        >
          <li>
            <Link to={RUTAS.cuenta} onClick={() => setAbierto(false)} className={claseItem}>
              Mi cuenta
            </Link>
          </li>
          {mostrarTickets ? (
            <li>
              <Link to={RUTAS.misTickets} onClick={() => setAbierto(false)} className={claseItem}>
                Mis tickets
              </Link>
            </li>
          ) : null}
          <li>
            <button type="button" onClick={onSalir} className={claseItem}>
              Salir
            </button>
          </li>
        </ul>
      ) : null}
    </div>
  )
}