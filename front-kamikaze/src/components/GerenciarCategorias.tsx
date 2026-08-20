import { useState, useEffect } from "react";

interface Categoria {
  id: number;
  nome: string;
}

export function GerenciarCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [nomeCategoria, setNomeCategoria] = useState("");
  const [categoriaEditandoId, setCategoriaEditandoId] = useState<number | null>(null);

  async function carregarCategorias() {
    const token = localStorage.getItem("kamikase_token");
    try {
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nomeCategoria.trim()) return alert("Digite o nome da categoria.");

    const token = localStorage.getItem("kamikase_token");
    const url = categoriaEditandoId
      ? `http://localhost:3000/api/categorias/${categoriaEditandoId}`
      : "http://localhost:3000/api/categorias";

    const method = categoriaEditandoId ? "PUT" : "POST";

    try {
      const resposta = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nome: nomeCategoria }),
      });

      if (resposta.ok) {
        limparFormulario();
        carregarCategorias();
      } else {
        const dados = await resposta.json();
        alert(`Erro: ${dados.erro || "Operação falhou."}`);
      }
    } catch (erro) {
      alert("Erro de comunicação com o servidor.");
    }
  }

  function iniciarEdicao(categoria: Categoria) {
    setCategoriaEditandoId(categoria.id);
    setNomeCategoria(categoria.nome);
  }

  function limparFormulario() {
    setCategoriaEditandoId(null);
    setNomeCategoria("");
  }

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Gerenciar Categorias</h2>
          <p className="text-sm text-slate-400">
            Cadastre ou edite as categorias de produtos
          </p>
        </div>
        <span className="bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-xs font-semibold">
          {categorias.length} cadastradas
        </span>
      </div>

      {/* Formulário de Cadastro/Edição */}
      <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Nome da categoria"
          value={nomeCategoria}
          onChange={(e) => setNomeCategoria(e.target.value)}
          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
        />
        {categoriaEditandoId && (
          <button
            type="button"
            onClick={limparFormulario}
            className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2.5 rounded-lg transition cursor-pointer"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold px-6 py-2.5 rounded-lg transition cursor-pointer"
        >
          {categoriaEditandoId ? "Salvar" : "Cadastrar"}
        </button>
      </form>

      {/* Listagem */}
      <div className="divide-y divide-slate-700">
        {categorias.map((cat) => (
          <div key={cat.id} className="py-3 flex justify-between items-center">
            <span className="font-semibold text-slate-200">{cat.nome}</span>
            <button
              onClick={() => iniciarEdicao(cat)}
              className="text-cyan-400 hover:text-cyan-300 text-sm font-bold cursor-pointer"
            >
              Editar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}