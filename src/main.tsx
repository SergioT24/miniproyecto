import { StrictMode } from "react"
import * as React from "react"
import * as ReactDOM from "react-dom"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { ThemeProvider } from "@/components/theme-provider"
import "./index.css"
import App from "./App"

// Auditoría de accesibilidad en desarrollo: reporta violaciones de WCAG en consola.
if (import.meta.env.DEV) {
    void import("@axe-core/react").then(({ default: reactAxe }) => {
        void reactAxe(React, ReactDOM, 1000)
    })
}

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ThemeProvider defaultTheme="system" storageKey="miniproyecto-theme">
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </ThemeProvider>
    </StrictMode>
)
