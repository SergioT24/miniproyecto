import { Routes, Route } from "react-router-dom"
import { AppLayout } from "./layouts/AppLayout"
import { HomePage } from "./pages/HomePage"
import { DataTablePage } from "./pages/DataTablePage"
import { EmptyPage } from "./pages/EmptyPage"
import { routes } from "./lib/nav"
import { ModalPage } from "./pages/ModalPage"
import { ToastPage } from "./pages/ToastPage"
import { FormPage } from "./pages/FormPage"
import { GridPage } from "./pages/GridPage"

export default function App() {
    return (
        <AppLayout>
            <Routes>
                <Route path={routes.home} element={<HomePage />} />
                <Route path={routes.bandeja} element={<EmptyPage />} />
                <Route path={routes.calendario} element={<EmptyPage />} />
                <Route path={routes.configuracion} element={<EmptyPage />} />
                <Route path={routes.form} element={<DataTablePage />} />
                <Route path={routes.emptyPage} element={<EmptyPage />} />
                <Route path={routes.modalConfirmacion} element={<ModalPage />} />
                <Route path={routes.toasts} element={<ToastPage />} />
                <Route path={routes.formulario} element={<FormPage />} />
                <Route path={routes.grillaAgregar} element={<GridPage />} />
                <Route path="*" element={<EmptyPage />} />
            </Routes>
        </AppLayout>
    )
}