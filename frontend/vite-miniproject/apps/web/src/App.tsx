import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AppLayout } from "./components/AppLayout"
import { HomePage } from "./pages/HomePage"
import { EmptyPage } from "./pages/EmptyPage"
import { routes } from "./lib/nav"

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path={routes.home} element={<HomePage />} />
          <Route path={routes.bandeja} element={<EmptyPage />} />
          <Route path={routes.calendario} element={<EmptyPage />} />
          <Route path={routes.configuracion} element={<EmptyPage />} />
          <Route path={routes.emptyPage} element={<EmptyPage />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  )
}
