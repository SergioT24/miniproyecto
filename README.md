# Fundación Huésped · Finanzas

Miniproyecto de la Práctica Profesional Supervisada. Aplicación de finanzas construida con React,
TypeScript y Vite, con datos mock y sin backend real.

## Stack

- **React 19** + **TypeScript** estricto
- **Vite 8**
- **Tailwind CSS 4** + **shadcn/ui** (Base UI, estilo `base-nova`)
- **React Router 7**
- **TanStack Query** para estado de servidor y **TanStack Table** para tablas
- **React Hook Form + Zod** para formularios
- **Recharts** para gráficos
- **MSW** como mock service worker
- **Vitest + Testing Library** para tests
- **Lucide** para iconografía

Requiere **Node.js 22 o superior** (lo exige el paquete `cn`).

## Alcance

La autenticación, la sesión y los permisos están **fuera de alcance**. No hay login, tokens ni
selector de rol. La app consume datos mock mediante MSW y las acciones quedan registradas en el mock
de auditoría como “Sistema”.

## Puesta en marcha

```bash
npm install
cp .env.example .env
npm run dev
```

Variables de entorno:

| Variable                | Default | Descripción                                         |
| ----------------------- | ------- | --------------------------------------------------- |
| `VITE_API_URL`          | `/api`  | Prefijo de la API. En desarrollo lo intercepta MSW. |
| `VITE_ENABLE_MOCKS`     | `true`  | Activa el mock service worker en desarrollo.        |
| `VITE_ENABLE_SCENARIOS` | `false` | Habilita módulos experimentales, como escenarios.   |

## Scripts

```bash
npm install          # instalar dependencias
npm run dev          # servidor de desarrollo
npm run build        # chequeo de tipos + build de producción
npm run lint         # ESLint
npm run preview      # previsualizar el build
npm run typecheck    # tsc -b
npm test             # tests (Vitest, una corrida)
npm run test:watch   # tests en modo watch
npm run ci           # lint + typecheck + test + build
```

Para formatear solo los archivos que tocaste:

```bash
npm run format -- src/app/router.tsx src/pages/NotFoundPage.tsx
```

`npm run format` no se ejecuta sobre todo el repo de forma automática.

## Estructura

```text
src/
├── app/
│   ├── providers.tsx      # tema, TanStack Query, tooltips y error boundary
│   ├── query-client.ts    # configuración global de TanStack Query
│   ├── router.tsx         # createBrowserRouter + layout + 404
│   ├── route-meta.ts      # fuente única de rutas, títulos y navegación
│   ├── routes.tsx         # metadata + elemento de cada página
│   └── error-boundary.tsx # error de render y error de ruta
├── components/
│   ├── ui/                # primitivas shadcn/Base UI (no renombrar)
│   ├── app/               # patrones de App (se completa en la Fase 1)
│   ├── AppSidebar.tsx     # navegación lateral
│   ├── Navbar.tsx         # barra superior con breadcrumb y tema
│   └── ThemeToggle.tsx
├── features/              # módulos de dominio (se agregan por fase)
├── hooks/
│   └── use-route-announcer.ts
├── layouts/
│   └── AppLayout.tsx      # shell con sidebar, navbar y <Outlet />
├── lib/
│   └── utils.ts           # helper cn()
├── pages/
│   ├── ModulePlaceholderPage.tsx
│   ├── NotFoundPage.tsx
│   └── UiGalleryPage.tsx
├── test/
│   ├── a11y.ts            # helper de axe
│   ├── render.tsx         # render con providers
│   ├── setup.ts           # polyfills + MSW
│   └── msw/               # handlers, server y worker
├── main.tsx               # entry point
└── index.css              # tema Tailwind y variables de diseño
```

## Rutas y navegación

`src/app/route-meta.ts` es la fuente única de verdad de la navegación: ruta, label, título,
descripción, ícono y sección. De ahí salen el sidebar, el breadcrumb, el `document.title` y el
registro del router en `src/app/routes.tsx`.

Para agregar una página:

1. Sumá la metadata en `src/app/route-meta.ts`.
2. Agregá su elemento en `src/app/routes.tsx`.
3. Si corresponde, creá la página en `src/pages` o en `src/features/<feature>`.

## Galería de componentes

La galería está en `/dev/ui` y solo se registra en desarrollo (`import.meta.env.DEV`). No aparece en
el navbar de producto; en desarrollo se muestra como sección “Desarrollo” del sidebar.

## Mock service worker

`src/test/msw` contiene los handlers y el worker. En desarrollo MSW arranca automáticamente si
`VITE_ENABLE_MOCKS=true`; en tests el server de MSW se inicia en `src/test/setup.ts`.

Los datos viven en memoria y se reinician al recargar. Todo endpoint o fixture sin contrato de
backend queda marcado con `TODO(api)`.

## Accesibilidad y tema

- Objetivo WCAG 2.1 AA: labels, foco visible, navegación por teclado, `aria-*`, contraste y modo
  oscuro.
- El tema (claro / oscuro / sistema) se guarda en `localStorage` bajo `miniproyecto-theme`.
- `@axe-core/react` reporta violaciones en consola durante el desarrollo.
- Los tests de componentes usan `axe` a través de `src/test/a11y.ts`.

## CI

`.github/workflows/ci.yml` ejecuta `npm ci` y `npm run ci` (lint, typecheck, tests y build) en cada
push a `main` y en cada pull request.
