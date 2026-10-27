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

---

### 📥 Paso 1: Clonar el repositorio
Abre tu terminal y clona el proyecto oficial a tu computadora:

```bash
git clone [https://github.com/SergioT24/miniproyecto.git](https://github.com/SergioT24/miniproyecto.git)
cd miniproyecto

📦 Paso 2: Instalar las dependencias
Desde la carpeta raíz del proyecto (miniproyecto), descarga todos los paquetes del equipo:

Bash
npm install
🚀 Paso 3: ¡Levantar el servidor de desarrollo local!
Ejecuta el comando para arrancar la aplicación con Turborepo:

Bash
npm run dev
Abre el enlace que te devuelva la terminal (normalmente http://localhost:5173 o http://localhost:3000) en tu navegador web para ver el proyecto corriendo en tiempo real. ✨

💡 ¿Cómo agregar nuevos componentes de Shadcn?
Si durante la maquetación necesitas incorporar un nuevo componente de Shadcn UI (botones, modales, tablas, etc.), ejecútalo dentro de la app web:

Bash
npx shadcn@latest add [nombre-del-componente]
(Ejemplo: npx shadcn@latest add button)

🚨 Reglas de Oro para el Equipo
[!CAUTION]

NUNCA SUBAS node_modules/, .turbo/ ni dist/: Git ya se encarga de ignorarlas.

SINCRONIZA TUS PAQUETES: Si instalas librerías nuevas o componentes de Shadcn, recuerda hacer commit y push de los archivos package.json y package-lock.json para que el resto del equipo pueda obtenerlos con un simple npm install.