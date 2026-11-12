# Documento de Arquitectura e Integración Frontend: App Finanzas & Módulo Auth
**Fundación Huésped — Sistema de Gestión Financiera y Cash Flow**  
**Destinatarios:** Equipo de Frontend Auth / Sesión  
**Fecha:** Noviembre 2026  
**Estado:** Base consolidada en Fase 3 (Parámetros, Presupuesto, Movimientos, Cash Flow)

---

## 1. Propósito y Contexto

La aplicación web de Finanzas de Fundación Huésped en `miniproyecto` fue construida aislando intencionalmente la autenticación y el backend real para enfocarse en la lógica de negocio, experiencia de usuario, diseño accesible (WCAG 2.1 AA) y solidez de componentes.

En el código base actual, todas las operaciones de datos son provistas por servicios mock y un Mock Service Worker (MSW). Toda referencia pendiente de autenticación quedó marcada con etiquetas explícitas `// TODO(auth)`.

El objetivo de este documento es brindarle al equipo encargado del frontend de Autenticación (**Auth**) el contexto técnico completo de la arquitectura existente, definir los **puntos de encuentro e interfaces compartidas**, y establecer un contrato claro para que la integración se realice sin fricciones ni roturas de build.

---

## 2. Stack Tecnológico y Reglas del Código Base

Para asegurar consistencia visual y técnica, el módulo de Auth debe alinearse estrictamente al stack y convenciones del repositorio:

* **React 19** + **TypeScript** estricto (sin `any` ni `@ts-ignore`).
* **Vite 8** como bundler y entorno de ejecución.
* **React Router 7** con `createBrowserRouter` y navegación anidada con `<Outlet />`.
* **Tailwind CSS 4**: No hay archivo `tailwind.config.js`. Todas las variables y tokens de diseño residen en `src/index.css`. No se deben hardcodear colores ni tamaños fijos fuera de los tokens semánticos (`bg-background`, `text-foreground`, `bg-card`, `border-border`, `text-primary`, `text-muted-foreground`, etc.).
* **shadcn/UI con Base UI (estilo `base-nova`)**:
  > Este repositorio utiliza **Base UI**, **no Radix UI**. No se debe usar el prop `asChild` de Radix en botones ni links. En su lugar se utiliza el prop `render` nativo de Base UI:
  > ```tsx
  > // Correcto (Base UI)
  > <Button render={<Link to="/login" />}>Iniciar sesión</Button>
  > 
  > // Incorrecto (Radix)
  > <Button asChild><Link to="/login" /></Button>
  > ```
* **TanStack Query v5** para el estado del servidor. Los componentes no ejecutan llamadas `fetch` directas.
* **React Hook Form + Zod** para captura y validación de formularios.
* **Sonner** para toasts y avisos flotantes de feedback.
* **Lucide React** para iconografía del sistema.
* **Accesibilidad (a11y)**: Cumplimiento de WCAG 2.1 AA: foco visible, soporte integral de teclado, atributos `aria-*` y soporte de tema claro/oscuro.

---

## 3. Mapa de Arquitectura y Capas

La estructura del código fuente está organizada en capas bien delimitadas:

```text
src/
├── app/                  # Infraestructura de la App (providers, router, routes)
│   ├── providers.tsx     # Jerarquía global de context providers
│   ├── router.tsx        # createBrowserRouter, AppLayout y rutas
│   ├── route-meta.ts     # Fuente única de verdad de rutas, títulos y secciones
│   ├── routes.tsx        # Mapeo de rutas a elementos React
│   └── query-client.ts   # Instancia central de QueryClient
├── components/
│   ├── ui/               # Primitivas shadcn/Base UI (no contienen lógica de negocio)
│   └── app/              # Patrones compartidos (DataTable, PageHeader, FilterBar, etc.)
├── features/             # Módulos de dominio
│   ├── auth/             # <-- AQUÍ RESIDIRÁ EL MÓDULO DE AUTH
│   ├── parametros/       # Catálogos maestros y datos base
│   ├── presupuesto/      # Versiones, líneas y comparativas
│   ├── movimientos/      # Ingresos y egresos previstos y registrados
│   └── cashflow/         # Flujo de fondos diario, semanal y mensual
├── layouts/
│   └── AppLayout.tsx     # Shell principal (SidebarProvider + Sidebar + Navbar + Outlet)
├── lib/
│   ├── api/              # Cliente HTTP (apiClient), tipos y ApiError
│   ├── format/           # Formateadores con Intl y date-fns
│   └── money.ts          # Precisión decimal con decimal.js
└── test/
    ├── render.tsx        # Helper de render con providers para Vitest
    ├── setup.ts          # Setup de Vitest y MSW
    └── msw/              # Handlers y worker de MSW
```

---

## 4. Puntos Clave de Integración (Touchpoints)

El equipo de Auth debe interactuar e integrarse en **cinco puntos concretos**:

### Punto 1: Jerarquía de Providers (`src/app/providers.tsx`)

Actualmente, `providers.tsx` monta el Error Boundary, el ThemeProvider, el QueryClientProvider y el TooltipProvider:

```tsx
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AppErrorBoundary>
      <ThemeProvider defaultTheme="system" storageKey="miniproyecto-theme">
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            {/* AQUI DEBE ENVOLVER EL SessionProvider / AuthProvider */}
            {children}
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </AppErrorBoundary>
  )
}
```

Se recomienda colocar el `AuthProvider` **dentro** de `QueryClientProvider` para que los queries de autenticación (ej: `GET /api/auth/me`) puedan utilizar TanStack Query de forma natural.

---

### Punto 2: Cliente HTTP y Manejo de Sesión (`src/lib/api/client.ts`)

En `client.ts` está encapsulado el wrapper de `fetch`. Todos los módulos de la app consumen `apiClient.get()`, `apiClient.post()`, etc.

El fetch actual está configurado de la siguiente manera:

```ts
const response = await fetch(buildUrl(path, query), {
  ...init,
  method,
  headers: requestHeaders,
  body: requestBody,
  // TODO(auth): reemplazar por el fetch autenticado de la librería real.
  credentials: "include",
})
```

#### Requisitos para Auth:
1. **Estrategia de Credenciales**:
   * **Si se usan Cookies HttpOnly (Recomendado para SPA de finanzas)**: `credentials: "include"` ya está configurado y no requiere inyectar headers manualmente.
   * **Si se usan Tokens JWT en memoria / storage**: El cliente debe proveer un hook o función para setear el header `Authorization: Bearer <token>`.
2. **Interceptores de error 401 y 403**:
   * Si la API responde con status `401 Unauthorized`: la sesión expiró o es inválida. Debe notificarse al `AuthProvider` para limpiar el estado y redirigir al login preservando la URL actual (`redirectUrl`).
   * Si la API responde con `403 Forbidden`: el usuario carece de permisos para la operación solicitada.
   * La clase `ApiError` (`src/lib/api/errors.ts`) ya extrae automáticamente el `status`, el `code` y los `field_errors`.

---

### Punto 3: Registro de Rutas y Guardas (`src/app/route-meta.ts` y `src/app/router.tsx`)

La navegación de toda la app (sidebar, breadcrumbs, títulos de pestaña `document.title`) se rige a partir de `route-meta.ts`.

#### Estructura actual de una ruta:
```ts
export interface RouteMeta {
  path: string
  label: string
  title: string
  description: string
  icon: LucideIcon
  section: "Principal" | "Gestión" | "Administración" | "Desarrollo"
  devOnly?: boolean
  // TODO(auth): agregar permisos requeridos
  permission?: Permiso
  requiredRoles?: Rol[]
}
```

#### Guardas a implementar en `src/app/router.tsx`:
1. **Rutas Públicas**:
   * `/login` (Página de inicio de sesión)
   * `/recuperar-clave` (Opcional según requerimiento)
2. **Rutas Privadas Generales**:
   * Envueltas con `<RequireAuth>`: si no hay sesión activa, redirige a `/login` con `state: { from: location }`.
3. **Rutas Protegidas por Rol / Permiso**:
   * Envueltas con `<RequirePermission permission="...">`: si el usuario no cuenta con el permiso requerido, renderiza una página `<ForbiddenPage />` (403 accesible) dentro del layout de la aplicación, sin romper el sidebar ni la barra superior.

---

### Punto 4: Shell y Barra Lateral (`AppSidebar.tsx` y `Navbar.tsx`)

#### 1. Menú lateral reactivo a permisos (`AppSidebar.tsx`):
Actualmente el sidebar itera sobre las secciones y sus ítems:
```tsx
const items = routeMeta.filter(
  (route) => route.section === section && isRouteEnabled(route),
)
```
**Punto de integración:**
El filtro debe contemplar los permisos del usuario actual:
```tsx
const { can } = usePermissions()

const items = routeMeta.filter(
  (route) =>
    route.section === section &&
    isRouteEnabled(route) &&
    (!route.permission || can(route.permission)),
)
```
Si una sección entera se queda sin ítems visibles, la sección no se renderiza.

#### 2. Barra de navegación superior (`Navbar.tsx`):
En el costado derecho de la barra, junto al `ThemeToggle`, se integrará el componente `UserMenu`:
* Nombre del usuario logueado.
* Etiqueta de Rol (ej. "Administrador", "Tesorería").
* Menú desplegable (`DropdownMenu` de shadcn/Base UI) con:
  * Ver perfil.
  * Cambiar contraseña (si aplica).
  * Opción de "Cerrar sesión" con confirmación o toast de salida.

---

### Punto 5: Componentes Declarativos de Permisos en la UI

Para controlar la visibilidad o interacción de botones críticos dentro de las páginas (como *Crear movimiento*, *Cerrar versión de presupuesto*, *Eliminar parámetro*), el módulo de Auth debe exponer utilidades declarativas:

```tsx
// 1. Componente de renderizado condicional
<Can I="crear" a="movimientos">
  <Button onClick={openCreate}>
    <Plus aria-hidden="true" />
    Nuevo movimiento
  </Button>
</Can>

// 2. Variante con fallback
<PermissionGate 
  permission="presupuesto:cerrar" 
  fallback={<span className="text-xs text-muted-foreground">Solo aprobadores pueden cerrar versiones</span>}
>
  <Button onClick={cerrarVersion}>Cerrar versión</Button>
</PermissionGate>
```

---

## 5. Contrato de Tipos Propuesto para Auth (`src/features/auth/types.ts`)

Para que el modelo encaje limpiamente con las entidades de la Fundación Huésped, proponemos el siguiente esquema de tipos:

```ts
/** Roles soportados por el dominio */
export type Rol =
  | "administrador"
  | "editor"
  | "aprobador"
  | "consulta"
  | "tesoreria"

/** Catálogo normalizado de permisos */
export type Permiso =
  // Parámetros
  | "parametros:ver"
  | "parametros:editar"
  // Presupuesto
  | "presupuesto:ver"
  | "presupuesto:crear"
  | "presupuesto:aprobar"
  | "presupuesto:cerrar"
  // Movimientos
  | "movimientos:ver"
  | "movimientos:crear"
  | "movimientos:editar"
  | "movimientos:eliminar"
  // Cash Flow
  | "cashflow:ver"
  | "cashflow:exportar"
  // Administración y Auditoría
  | "usuarios:ver"
  | "usuarios:gestionar"
  | "auditoria:ver"

export interface SessionUser {
  id: string
  nombre: string
  email: string
  rol: Rol
  permisos: Permiso[]
  /**
   * Proyectos específicos a los que tiene acceso.
   * Si es vacío o ['*'], tiene acceso a todos los proyectos de la fundación.
   */
  proyectosAsignados: string[]
}

export interface SessionState {
  user: SessionUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: Error | null
}
```

---

## 6. Soporte para Desarrollo y Testing

La aplicación cuenta con una suite de tests automatizados muy estricta (Vitest + React Testing Library + axe-core). Para evitar que los tests rompan cuando se introduzca Auth:

1. **Helper de render en tests (`src/test/render.tsx`)**:
   El wrapper `renderWithProviders` debe incluir un mock por defecto de `SessionProvider` que entregue un usuario con permisos completos (`administrador`). Debe permitir sobreescribir el usuario para probar casos con permisos restringidos:
   ```tsx
   renderWithProviders(<PresupuestoPage />, {
     session: { user: fixtureEditorSinPermisoDeAprobar }
   })
   ```
2. **Selector de Roles en Modo Desarrollo (`/dev/session`)**:
   En entornos de desarrollo (`import.meta.env.DEV`), es sumamente útil contar con un conmutador rápido de rol en el navbar o en una ruta `/dev/session` persistido en `localStorage` (clave `dev-role`), para alternar entre "Administrador", "Editor", "Consulta" y "Tesorería" sin tener que re-loguearse en cada prueba.

---

## 7. Matriz de Responsabilidades y Pasos de Integración

| Tarea / Artefacto | Responsable | Entregable |
|---|---|---|
| **Pantallas de Login y Recuperación** | Equipo Auth | `src/features/auth/pages/LoginPage.tsx` |
| **Provider y Hooks de Sesión** | Equipo Auth | `SessionProvider`, `useSession`, `usePermissions` |
| **Componentes de Guardas** | Equipo Auth | `<RequireAuth>`, `<Can>`, `<ForbiddenPage />` |
| **Menú de Usuario (`UserMenu`)** | Equipo Auth | Componente para ubicar en la `Navbar` |
| **Conexión en `src/app/providers.tsx`** | Conjunto | Envolver la app con `SessionProvider` |
| **Protección en `src/app/router.tsx`** | Conjunto | Agregar rutas `/login` y envolver rutas privadas |
| **Filtrado dinámico de Sidebar** | Equipo App | Consumir `usePermissions` en `AppSidebar.tsx` |
| **Manejo de 401 en `client.ts`** | Equipo App / Auth | Hook o callback de expiración de sesión |

---

## 8. Recomendación para la Entrega

Se sugiere que el equipo de Auth entregue su código en una rama dedicada `feature/auth` conteniendo su feature completa bajo `src/features/auth/` con sus respectivos tests unitarios. 

Una vez validada la funcionalidad aislada del módulo, se coordinará una sesión breve de integración para conectar los puntos 1 a 4 detallados en la Sección 4 de este documento.
