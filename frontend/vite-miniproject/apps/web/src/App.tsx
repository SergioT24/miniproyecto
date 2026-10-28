import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { HomePage } from "./pages/HomePage";
import { EmptyPage } from "./pages/EmptyPage";

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/emptypage" element={<EmptyPage />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}