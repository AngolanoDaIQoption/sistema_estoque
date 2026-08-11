import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import { Dashboard } from "./pages/dashboard";
import PrivateRoute from "./components/PrivateRoute";
import Register from "./pages/Register";
import { Pdv } from "./pages/Pdv";
import { HistoricoVendas } from "./pages/HistoricoVendas";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota pública */}
        <Route path="/" element={<Login />} />
        <Route path="/cadastrar" element={<Register />} />
        <Route
          path="/pdv"
          element={
            <PrivateRoute>
              <Pdv />
            </PrivateRoute>
          }
        />
        <Route
          path="/historico"
          element={
            <PrivateRoute>
              <HistoricoVendas />
            </PrivateRoute>
          }
        />
        {/* Rota protegida */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
