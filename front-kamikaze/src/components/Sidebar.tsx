import { Link, useLocation, useNavigate } from "react-router-dom";

export function Sidebar() {
  const location = useLocation();
  const navegar = useNavigate();

  const usuarioLogado = JSON.parse(
    localStorage.getItem("kamikase_usuario") || "{}",
  );
  const ehADM = usuarioLogado?.perfil === "ADM";

  function Sair() {
    localStorage.removeItem("kamikase_token");
    localStorage.removeItem("kamikase_usuario");
    navegar("/");
  }

  const linkAtivo = (path: string) =>
    location.pathname === path
      ? "bg-cyan-600 text-white font-bold"
      : "text-slate-400 hover:bg-slate-800 hover:text-white";

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 min-h-screen flex flex-col justify-between p-4">
      <div>
        <div className="mb-8 px-2">
          <h1 className="text-xl font-black text-cyan-400 tracking-wider">
            KAMIKAZE
          </h1>
          <p className="text-xs text-slate-500">Gestão de Estoque</p>
        </div>

        <nav className="space-y-1">
          <Link
            to="/dashboard"
            className={`block px-4 py-2.5 rounded-lg transition text-sm ${linkAtivo(
              "/dashboard",
            )}`}
          >
            Produtos / Estoque
          </Link>

          <Link
            to="/pdv"
            className={`block px-4 py-2.5 rounded-lg transition text-sm ${linkAtivo(
              "/pdv",
            )}`}
          >
            Ponto de Venda (PDV)
          </Link>

          <Link
            to="/historico"
            className={`block px-4 py-2.5 rounded-lg transition text-sm ${linkAtivo(
              "/historico",
            )}`}
          >
            Histórico de Vendas
          </Link>

          {ehADM && (
            <>
              <div className="pt-4 pb-1 px-4 text-xs font-semibold text-slate-500 uppercase">
                Administrativo
              </div>

              <Link
                to="/categorias"
                className={`block px-4 py-2.5 rounded-lg transition text-sm ${linkAtivo(
                  "/categorias",
                )}`}
              >
                Gerenciar Categorias
              </Link>

              <Link
                to="/usuarios"
                className={`block px-4 py-2.5 rounded-lg transition text-sm ${linkAtivo(
                  "/usuarios",
                )}`}
              >
                Gerenciar Usuários
              </Link>
            </>
          )}
        </nav>
      </div>

      <div className="border-t border-slate-800 pt-4 px-2">
        <div className="mb-3">
          <p className="text-sm font-bold text-white">
            {usuarioLogado?.nome || "Usuário"}
          </p>
          <p className="text-xs text-slate-400">
            Perfil: {usuarioLogado?.perfil || "Comum"}
          </p>
        </div>
        <button
          onClick={Sair}
          className="w-full bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 text-rose-300 font-bold py-2 rounded-lg text-sm transition cursor-pointer"
        >
          Sair da Conta
        </button>
      </div>
    </aside>
  );
}
