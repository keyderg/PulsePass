import { useState } from 'react'
import { Campo, type CampoProps } from '../../../componentes/Campo'
import { IconoOjo, IconoOjoOculto } from '../../../componentes/Iconos'

export function CampoContrasena(props: Omit<CampoProps, 'type' | 'accion'>) {
  const [visible, setVisible] = useState(false)
  return (
    <Campo
      {...props}
      type={visible ? 'text' : 'password'}
      accion={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-pressed={visible}
          className="flex size-9 items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-marca-600 dark:hover:text-slate-100"
        >
          {visible ? <IconoOjoOculto /> : <IconoOjo />}
        </button>
      }
    />
  )
}