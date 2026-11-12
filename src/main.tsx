import { StrictMode } from "react"
import * as React from "react"
import * as ReactDOM from "react-dom"
import { createRoot } from "react-dom/client"
import { RouterProvider } from "react-router-dom"
import { AppProviders } from "@/app/providers"
import { router } from "@/app/router"
import "./index.css"

// Auditoría de accesibilidad en desarrollo: reporta violaciones de WCAG en consola.
if (import.meta.env.DEV) {
  void import("@axe-core/react").then(({ default: reactAxe }) => {
    void reactAxe(React, ReactDOM, 1000)
  })
}

/** Arranca el mock service worker solo en desarrollo (se puede desactivar con la flag). */
async function enableMocking() {
  if (!import.meta.env.DEV || import.meta.env.VITE_ENABLE_MOCKS === "false") {
    return
  }

  try {
    const { worker } = await import("@/test/msw/browser")
    await worker.start({ onUnhandledRequest: "bypass" })
  } catch (error) {
    console.error("No se pudo iniciar el mock service worker", error)
  }
}

void enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </StrictMode>,
  )
})
