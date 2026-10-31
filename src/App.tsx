import { Routes, Route } from "react-router-dom"
import { AppLayout } from "./layouts/AppLayout"
import { HomePage } from "./pages/HomePage"
import { EmptyPage } from "./pages/EmptyPage"
import { routes } from "./lib/nav"
import { ModalPage } from "./pages/ModalPage"
import { ToastPage } from "./pages/ToastPage"

export default function App() {
    return (
        <AppLayout>
            <Routes>
                <Route path={routes.home} element={<HomePage />} />
                <Route path={routes.bandeja} element={<EmptyPage />} />
                <Route path={routes.calendario} element={<EmptyPage />} />
                <Route path={routes.configuracion} element={<EmptyPage />} />
                <Route path={routes.emptyPage} element={<EmptyPage />} />
                <Route path={routes.modalConfirmacion} element={<ModalPage />} />
                <Route path={routes.toasts} element={<ToastPage />} />
                <Route path="*" element={<EmptyPage />} />
            </Routes>
        </AppLayout>
    )
}
