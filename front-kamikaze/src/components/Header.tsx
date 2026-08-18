import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  function handleLogout() {
    // Apaga o token salvo no navegador
    localStorage.removeItem("kamikase_token");
    // Manda o usuário de volta para o Login
    navigate("/");
  }

  return (
    <header className="flex items-center justify-between bg-blue-600 px-8 py-4 text-white shadow-md">
      <h1 className="text-xl font-bold">Sistema de Estoque - Kamikase</h1>

      <div className="flex gap-3">
        {/* Botão para ir para a Dashboard */}
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg font-semibold transition"
        >
          Dashboard
        </button>
        <button
          onClick={() => navigate("/historico")}
          className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-semibold transition text-white"
        >
         Histórico
        </button>
        {/* Botão para ir ao PDV */}
        <button
          onClick={() => navigate("/pdv")}
          className="bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-lg font-semibold transition"
        >
          Realizar Venda (PDV)
        </button>

        {/* Botão de Sair */}
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-semibold transition"
        >
          Sair
        </button>
      </div>
    </header>
  );
}