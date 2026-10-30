# Fundación Huésped · Finanzas

Miniproyecto de la Práctica Profesional Supervisada. Tablero de finanzas construido con React, TypeScript y Vite.

## Stack

- **React 19** + **TypeScript**
- **Vite 8**
- **Tailwind CSS 4** + **shadcn/ui** (Base UI)
- **React Router 7**
- **Lucide** para iconografía

Requiere **Node.js 22 o superior** (lo exige el paquete `cn`).

## Scripts

```bash
npm install     # instalar dependencias
npm run dev     # servidor de desarrollo
npm run build   # chequeo de tipos + build de producción
npm run lint    # ESLint
npm run preview # previsualizar el build
```

## Estructura

```text
src/
├── components/
│   ├── ui/              # componentes base de shadcn (Button, Sidebar, etc.)
│   ├── AppSidebar.tsx   # navegación lateral
│   ├── Navbar.tsx       # barra superior
│   ├── ThemeToggle.tsx  # selector de tema
│   └── theme-provider.tsx
├── hooks/
│   └── use-mobile.ts
├── layouts/
│   └── AppLayout.tsx    # layout general con sidebar + navbar
├── lib/
│   ├── nav.ts           # fuente única de rutas y navegación
│   └── utils.ts         # helper cn()
├── pages/
│   ├── HomePage.tsx
│   └── EmptyPage.tsx    # placeholder para secciones pendientes
├── App.tsx              # definición de rutas
├── main.tsx             # entry point (providers + router)
└── index.css            # tema Tailwind y variables de diseño
```

## Convenciones

- Las rutas y los ítems de navegación se agregan en `src/lib/nav.ts`; no hardcodear rutas en los componentes.
- El tema (claro / oscuro / sistema) se guarda en `localStorage` bajo la clave `miniproyecto-theme`.
- Los componentes de `src/components/ui` son generados por shadcn. Se pueden regenerar con el CLI usando `components.json`.
