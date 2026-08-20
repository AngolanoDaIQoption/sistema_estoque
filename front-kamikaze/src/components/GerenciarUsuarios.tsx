import { useState, useEffect } from "react";

interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: string;
}

export function GerenciarUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [usuarioEditandoId, setUsuarioEditandoId] = useState<number | null>(
    null,
  );

  const usuarioLogado = JSON.parse(
    localStorage.getItem("kamikase_usuario") || "{}",
  );
  const ehADM = usuarioLogado?.perfil === "ADM";

  async function carregarUsuarios() {
    const token = localStorage.getItem("kamikase_token");
    try {
      const resposta = await fetch("http://localhost:3000/api/usuarios", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resposta.ok) {
        const dados = await resposta.json();
        setUsuarios(dados);
      }
    } catch (erro) {
      console.error("Erro ao carregar usuários:", erro);
    }
  }

  useEffect(() => {
    carregarUsuarios();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim() || !email.trim()) {
      return alert("Preencha nome e e-mail.");
    }

    const token = localStorage.getItem("kamikase_token");
    const url = usuarioEditandoId
      ? `http://localhost:3000/api/usuarios/${usuarioEditandoId}`
      : "http://localhost:3000/api/usuarios";

    const method = usuarioEditandoId ? "PUT" : "POST";

    try {
      const resposta = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nome, email, senha }),
      });

      if (resposta.ok) {
        limparFormulario();
        carregarUsuarios();
      } else {
        const dados = await resposta.json();
        alert(`Erro: ${dados.erro || "Operação falhou."}`);
      }
    } catch (erro) {
      alert("Erro de comunicação com o servidor.");
    }
  }

  function iniciarEdicao(usuario: Usuario) {
    setUsuarioEditandoId(usuario.id);
    setNome(usuario.nome);
    setEmail(usuario.email);
    setSenha("");
  }

  function limparFormulario() {
    setUsuarioEditandoId(null);
    setNome("");
    setEmail("");
    setSenha("");
  }

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Gerenciar Usuários</h2>
          <p className="text-sm text-slate-400">
            Controle os acessos de administradores e operadores
          </p>
        </div>
        <span className="bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-xs font-semibold">
          {usuarios.length} cadastrados
        </span>
      </div>

      {/* Formulário de Cadastro/Edição */}
      {ehADM ? (
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
            placeholder={usuarioEditandoId ? "Nova senha (opcional)" : "Senha"}
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
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold px-6 py-2 rounded-lg transition cursor-pointer"
            >
              {usuarioEditandoId ? "Salvar Alterações" : "+ Cadastrar Usuário"}
            </button>
          </div>
        </form>
      ) : (
        <div className="p-4 mb-6 bg-slate-900/50 border border-slate-700/50 rounded-lg text-slate-400 text-sm">
          Apenas administradores têm permissão para cadastrar ou editar
          usuários.
        </div>
      )}

      {/* Listagem */}
      <div className="divide-y divide-slate-700">
        {usuarios.map((u) => (
          <div key={u.id} className="py-3 flex justify-between items-center">
            <div>
              <span className="font-semibold text-slate-200 block">
                {u.nome}
              </span>
              <span className="text-xs text-slate-400">{u.email}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="bg-slate-700 text-cyan-300 text-xs px-2.5 py-1 rounded-md font-bold">
                {u.perfil}
              </span>
              {ehADM && (
                <button
                  onClick={() => iniciarEdicao(u)}
                  className="text-cyan-400 hover:text-cyan-300 text-sm font-bold cursor-pointer"
                >
                  Editar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
