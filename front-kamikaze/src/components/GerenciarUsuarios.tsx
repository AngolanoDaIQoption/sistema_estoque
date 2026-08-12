import { useState, useEffect } from "react";

interface Usuario {
  id: number;
  nome: string;
  email: string;
}

export function GerenciarUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [estaAberto, setEstaAberto] = useState(false);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [usuarioEditandoId, setUsuarioEditandoId] = useState<number | null>(
    null,
  );

  const [usuarioParaExcluir, setUsuarioParaExcluir] = useState<Usuario | null>(
    null,
  );
  const [mensagem, setMensagem] = useState<{
    texto: string;
    tipo: "sucesso" | "erro";
  } | null>(null);

  function mostrarFeedback(texto: string, tipo: "sucesso" | "erro") {
    setMensagem({ texto, tipo });
    setTimeout(() => setMensagem(null), 5000);
  }

  async function carregarUsuarios() {
    try {
      const token = localStorage.getItem("kamikase_token");
      const resposta = await fetch("http://localhost:3000/api/usuarios", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resposta.ok) {
        const dados = await resposta.json();
        setUsuarios(dados);
      }
    } catch (erro) {
      console.error("Erro ao carregar usuarios:", erro);
    }
  }

  useEffect(() => {
    carregarUsuarios();
  }, []);

  function iniciarEdicao(u: Usuario) {
    setUsuarioEditandoId(u.id);
    setNome(u.nome);
    setEmail(u.email);
    setSenha("");
  }

  function limparFormulario() {
    setUsuarioEditandoId(null);
    setNome("");
    setEmail("");
    setSenha("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!nome || !email) {
      mostrarFeedback("Nome e E-mail sao obrigatorios.", "erro");
      return;
    }

    const token = localStorage.getItem("kamikase_token");
    const eEdicao = usuarioEditandoId !== null;

    const url = eEdicao
      ? `http://localhost:3000/api/usuarios/${usuarioEditandoId}`
      : "http://localhost:3000/api/usuarios";

    const metodo = eEdicao ? "PUT" : "POST";

    try {
      const resposta = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nome, email, senha }),
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        mostrarFeedback(
          eEdicao
            ? "Usuario atualizado com sucesso."
            : "Usuario cadastrado com sucesso.",
          "sucesso",
        );
        limparFormulario();
        carregarUsuarios();
      } else {
        mostrarFeedback(dados.erro || "Erro ao salvar usuario.", "erro");
      }
    } catch (erro) {
      mostrarFeedback("Erro de conexao com o servidor.", "erro");
    }
  }

  async function confirmarExclusao() {
    if (!usuarioParaExcluir) return;

    const idExcluir = usuarioParaExcluir.id;
    setUsuarioParaExcluir(null);

    try {
      const token = localStorage.getItem("kamikase_token");
      const resposta = await fetch(
        `http://localhost:3000/api/usuarios/${idExcluir}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const dados = await resposta.json();

      if (resposta.ok) {
        mostrarFeedback(
          dados.mensagem || "Usuario excluido com sucesso.",
          "sucesso",
        );
        carregarUsuarios();
      } else {
        mostrarFeedback(
          dados.erro || "Nao foi possivel excluir o usuario.",
          "erro",
        );
      }
    } catch (erro) {
      mostrarFeedback("Erro de conexao ao tentar excluir usuario.", "erro");
    }
  }

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg mb-8 overflow-hidden">
      <button
        onClick={() => setEstaAberto(!estaAberto)}
        className="w-full p-4 text-left font-bold text-white flex justify-between items-center hover:bg-slate-750 transition cursor-pointer"
      >
        <span className="text-lg flex items-center gap-2">
          Gerenciar Usuarios
          <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full font-normal">
            {usuarios.length} cadastrados
          </span>
        </span>
        <svg
          className={`w-5 h-5 text-cyan-400 transition-transform duration-200 ${
            estaAberto ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {estaAberto && (
        <div className="p-6 border-t border-slate-700/60">
          {mensagem && (
            <div
              className={`p-3 mb-4 rounded-lg text-sm font-semibold transition-all ${
                mensagem.tipo === "sucesso"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-red-500/20 text-red-400 border border-red-500/30"
              }`}
            >
              {mensagem.texto}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6"
          >
            <input
              type="text"
              placeholder="Nome completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
            />
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
            />
            <input
              type="password"
              placeholder={
                usuarioEditandoId ? "Nova senha (opcional)" : "Senha"
              }
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
            />

            <div className="md:col-span-3 flex gap-2 justify-end">
              {usuarioEditandoId && (
                <button
                  type="button"
                  onClick={limparFormulario}
                  className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold px-4 py-2 rounded-lg transition cursor-pointer"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                className={`${
                  usuarioEditandoId
                    ? "bg-amber-500 hover:bg-amber-400"
                    : "bg-cyan-500 hover:bg-cyan-400"
                } text-slate-900 font-bold px-6 py-2 rounded-lg transition cursor-pointer`}
              >
                {usuarioEditandoId
                  ? "Salvar Alteracoes"
                  : "+ Cadastrar Usuario"}
              </button>
            </div>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-700 text-slate-300 uppercase text-xs">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Nome</th>
                  <th className="p-3">E-mail</th>
                  <th className="p-3 text-center">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {usuarios.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-750/50">
                    <td className="p-3 font-bold text-cyan-400">#{u.id}</td>
                    <td className="p-3 font-semibold text-white">{u.nome}</td>
                    <td className="p-3 text-slate-300">{u.email}</td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-4">
                        <button
                          onClick={() => iniciarEdicao(u)}
                          className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setUsuarioParaExcluir(u)}
                          className="text-rose-500 hover:text-rose-400 font-semibold cursor-pointer"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {usuarioParaExcluir && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">
              Confirmar Exclusao
            </h3>
            <p className="text-slate-300 text-sm mb-6">
              Tem certeza que deseja excluir o usuario{" "}
              <strong className="text-cyan-400">
                {usuarioParaExcluir.nome}
              </strong>{" "}
              ({usuarioParaExcluir.email})?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setUsuarioParaExcluir(null)}
                className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold px-4 py-2 rounded-lg transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarExclusao}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2 rounded-lg transition cursor-pointer"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
