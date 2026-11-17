# PulsePass Web (Fase 5 — Frontend)

SPA React 19 + TypeScript + Tailwind v4 que consume la API REST de PulsePass (`http://localhost:8080`, proxy `/api`).

## Instalación

```bash
npm install react react-dom react-router @tanstack/react-query react-hook-form @hookform/resolvers zod clsx
npm install -D vite @vitejs/plugin-react tailwindcss @tailwindcss/vite typescript \
  @types/react @types/react-dom @types/node \
  eslint @eslint/js typescript-eslint eslint-plugin-react-hooks eslint-plugin-react-refresh globals \
  prettier prettier-plugin-tailwindcss \
  vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom msw
```

## Scripts

| Comando         | Qué hace                         |
| --------------- | -------------------------------- |
| `npm run dev`   | Servidor de desarrollo (Vite)    |
| `npm run build` | `tsc --noEmit` + build de Vite   |
| `npm run lint`  | ESLint                           |
| `npm test`      | Vitest (una pasada)              |

Copia las imágenes de diseño a `docs/diseno/`.
