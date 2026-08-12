import { useState, useEffect } from "react";

interface Categoria {
  id: number;
  nome: string;
}

export function GerenciarCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [nomeCategoria, setNomeCategoria] = useState("");

  // Estado para controlar se a aba está aberta ou fechada (começa fechada)
  const [estaAberto, setEstaAberto] = useState(false);

  // Estado para edição
  const [categoriaEditandoId, setCategoriaEditandoId] = useState<number | null>(
    null,
  );

  // Estado para feedback visual
  const [mensagem, setMensagem] = useState<{
    texto: string;
    tipo: "sucesso" | "erro";
  } | null>(null);

  function mostrarFeedback(texto: string, tipo: "sucesso" | "erro") {
    setMensagem({ texto, tipo });
    setTimeout(() => {
      setMensagem(null);
    }, 3000);
  }

  async function carregarCategorias() {
    try {
      const token = localStorage.getItem("kamikase_token");
      const resposta = await fetch("http://localhost:3000/api/categorias", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resposta.ok) {
        const dados = await resposta.json();
        setCategorias(dados);
      }
    } catch (erro) {
      console.error("Erro ao carregar categorias:", erro);
    }
  }

  useEffect(() => {
    carregarCategorias();
  }, []);

  function iniciarEdicao(cat: Categoria) {
    setCategoriaEditandoId(cat.id);
    setNomeCategoria(cat.nome);
  }

  function cancelarEdicao() {
    setCategoriaEditandoId(null);
    setNomeCategoria("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!nomeCategoria.trim()) {
      mostrarFeedback("Digite o nome da categoria.", "erro");
      return;
    }

    const token = localStorage.getItem("kamikase_token");
    const eEdicao = categoriaEditandoId !== null;

    const url = eEdicao
      ? `http://localhost:3000/api/categorias/${categoriaEditandoId}`
      : "http://localhost:3000/api/categorias";

    const metodo = eEdicao ? "PUT" : "POST";

    try {
      const resposta = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nome: nomeCategoria }),
      });

      if (resposta.ok) {
        mostrarFeedback(
          eEdicao ? "Categoria atualizada!" : "Categoria cadastrada!",
          "sucesso",
        );
        cancelarEdicao();
        carregarCategorias();
      } else {
        mostrarFeedback("Erro ao salvar categoria.", "erro");
      }
    } catch (erro) {
      mostrarFeedback("Erro de conexão com o servidor.", "erro");
    }
  }

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg mb-8 overflow-hidden transition-all">
      {/* Cabeçalho Clicável da Aba (Accordion) */}
      <button
        onClick={() => setEstaAberto(!estaAberto)}
        className="w-full p-4 text-left font-bold text-white flex justify-between items-center hover:bg-slate-750 transition cursor-pointer"
      >
        <span className="text-lg flex items-center gap-2">
          Gerenciar Categorias
          <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full font-normal">
            {categorias.length} cadastradas
          </span>
        </span>

        {/* Setinha apontando para baixo ou para cima */}
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

      {/* Conteúdo Expansível (Só aparece se estaAberto === true) */}
      {estaAberto && (
        <div className="p-6 border-t border-slate-700/60">
          {/* Alerta Visual Integrado */}
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

          {/* Formulário de Cadastro/Edição */}
          <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
            <input
              type="text"
              placeholder="Nome da categoria"
              value={nomeCategoria}
              onChange={(e) => setNomeCategoria(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
            />

            <button
              type="submit"
              className={`${
                categoriaEditandoId
                  ? "bg-cyan-500 hover:bg-cyan-400"
                  : "bg-cyan-500 hover:bg-cyan-400"
              } text-slate-900 font-bold px-6 py-2.5 rounded-lg transition`}
            >
              {categoriaEditandoId ? "Salvar" : "Cadastrar"}
            </button>

            {categoriaEditandoId && (
              <button
                type="button"
                onClick={cancelarEdicao}
                className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold px-4 py-2.5 rounded-lg transition"
              >
                Cancelar
              </button>
            )}
          </form>

          {/* Lista de Categorias */}
          <div className="space-y-2">
            {categorias.map((cat) => (
              <div
                key={cat.id}
                className="flex justify-between items-center p-2.5 rounded-lg hover:bg-slate-700/50 font-semibold"
              >
                <span className="text-white">
                  {cat.nome}
                </span>
                <button
                  onClick={() => iniciarEdicao(cat)}
                  className="text-cyan-400 text-sm hover:underline cursor-pointer"
                >
                  Editar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
