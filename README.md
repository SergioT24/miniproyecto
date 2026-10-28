# 🚀 Miniproyecto — Equipo Frontend 🎨

<p align="center">
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38BDF8?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/Shadcn_UI-000000?style=for-the-badge&logo=shadcnui&logoColor=white" />
  <img src="https://img.shields.io/badge/Turbo-EF4444?style=for-the-badge&logo=turborepo&logoColor=white" />
</p>

---

## ⚡ Guía Rápida para Configurar el Proyecto en tu PC

Sigue estos simples pasos en la terminal integrada de **Visual Studio Code** (`Ctrl + Ñ`) para poner a andar el entorno de trabajo localmente.

> 📌 **Importante:** El frontend vive en `frontend/vite-miniproject` (un monorepo con Turborepo). Todos los comandos de npm se ejecutan **dentro de esa carpeta**, no en la raíz del repositorio.

### 📋 Requisitos previos

- [Node.js](https://nodejs.org/) **22.13 o superior** (versión LTS)
- npm (se instala junto con Node.js)

---

### 📥 Paso 1: Clonar el repositorio

Abre tu terminal y clona el proyecto oficial a tu computadora:

```bash
git clone https://github.com/SergioT24/miniproyecto.git
cd miniproyecto/frontend/vite-miniproject
```

### 📦 Paso 2: Instalar las dependencias

Desde la carpeta del monorepo, descarga todos los paquetes del equipo:

```bash
npm install
```

### 🚀 Paso 3: ¡Levantar el servidor de desarrollo local!

Ejecuta el comando para arrancar la aplicación con Turborepo:

```bash
npm run dev
```

Abre el enlace que te devuelva la terminal (normalmente **http://localhost:5173**) en tu navegador web para ver el proyecto corriendo en tiempo real. ✨

---

### 💡 ¿Cómo agregar nuevos componentes de Shadcn?

Si durante la maquetación necesitás incorporar un nuevo componente de Shadcn UI (botones, modales, tablas, etc.), ejecutalo dentro de la carpeta de la app web:

```bash
cd apps/web
npx shadcn@latest add button
```

(Ejemplo: `npx shadcn@latest add button` — reemplazá `button` por el componente que necesites).

Esto coloca el componente en `packages/ui/src/components`, listo para importarlo desde cualquier app como:

```tsx
import { Button } from "@workspace/ui/components/button";
```

---

### 📁 Estructura del proyecto

```
miniproyecto/
├── README.md
├── requirements.txt       # Backend (Flask) — próximamente
└── frontend/
    └── vite-miniproject/  # Monorepo con Turborepo
        ├── apps/
        │   └── web/       # Aplicación React (Vite)
        └── packages/
            └── ui/        # Componentes compartidos (shadcn/ui + Tailwind)
```

---

### 🚨 Reglas de Oro para el Equipo

> [!CAUTION]
> **NUNCA SUBAS** `node_modules/`, `.turbo/` ni `dist/`: Git ya se encarga de ignorarlas.

> [!IMPORTANT]
> **SINCRONIZÁ TUS PAQUETES:** Si instalás librerías nuevas o componentes de Shadcn, acordate de hacer commit y push de los archivos `package.json` y `package-lock.json` para que el resto del equipo pueda obtenerlos con un simple `npm install`.
