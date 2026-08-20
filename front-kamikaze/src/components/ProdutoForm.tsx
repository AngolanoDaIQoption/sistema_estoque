import { useState, useEffect, type SyntheticEvent } from "react";

interface Categoria {
  id: number;
  nome: string;
}

interface Produto {
  id: number;
  nome: string;
  preco: number;
  estoque: number;
  categoria_id: number;
}

interface ProdutoFormProps {
  categorias: Categoria[];
  aoSalvar: (produto: Produto) => void;
  aoCancelar: () => void;
  produtoEditando?: Produto | null;
}

export function ProdutoForm({
  categorias,
  aoSalvar,
  aoCancelar,
  produtoEditando,
}: ProdutoFormProps) {
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [estoque, setEstoque] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [carregando, setCarregando] = useState(false);

  // Recupera as permissões do usuário logado
  const usuarioLogado = JSON.parse(
    localStorage.getItem("kamikase_usuario") || "{}",
  );
  const ehADM = usuarioLogado?.perfil === "ADM";

  // Preenche os campos automaticamente se estiver em Modo Edição
  useEffect(() => {
    if (produtoEditando) {
      setNome(produtoEditando.nome || "");
      setPreco(
        produtoEditando.preco !== undefined
          ? produtoEditando.preco.toString()
          : "0",
      );
      setEstoque(
        produtoEditando.estoque !== undefined
          ? produtoEditando.estoque.toString()
          : "0",
      );
      setCategoriaId(
        produtoEditando.categoria_id
          ? produtoEditando.categoria_id.toString()
          : "",
      );
    } else {
      setNome("");
      setPreco("");
      setEstoque("");
      setCategoriaId("");
    }
  }, [produtoEditando]);

  async function handleSubmit(e: SyntheticEvent) {
    e.preventDefault();
    setCarregando(true);

    const token = localStorage.getItem("kamikase_token");

    const url = produtoEditando
      ? `http://localhost:3000/api/produtos/${produtoEditando.id}`
      : "http://localhost:3000/api/produtos";

    const metodo = produtoEditando ? "PUT" : "POST";

    try {
      const resposta = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nome,
          preco: parseFloat(preco),
          estoque: parseInt(estoque),
          categoria_id: parseInt(categoriaId),
        }),
      });

      if (resposta.ok) {
        const dadosRetornados = await resposta.json();

        // Garante que o ID venha da API ou da edição
        const idFinal =
          produtoEditando?.id ||
          dadosRetornados.id ||
          dadosRetornados.insertId ||
          Date.now();

        // Monta o objeto garantindo que NENHUM campo fique undefined
        const produtoFormatado: Produto = {
          id: idFinal,
          nome: nome,
          preco: parseFloat(preco),
          estoque: parseInt(estoque),
          categoria_id: parseInt(categoriaId),
        };

        aoSalvar(produtoFormatado);
      } else {
        alert("Erro ao salvar produto.");
      }
    } catch (erro) {
      console.error("Erro de rede:", erro);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 bg-slate-800 rounded-xl border border-slate-700 mb-6 text-white space-y-4"
    >
      <h3 className="text-xl font-bold">
        {produtoEditando ? "Editar Produto" : "Novo Produto"}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">Nome do Produto</label>
          <input
            type="text"
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Categoria</label>
          <select
            required
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
          >
            <option value="">Selecione uma categoria...</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Preço (R$)</label>
          <input
            type="number"
            step="0.01"
            required
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Quantidade em Estoque</label>
          <input
            type="number"
            required
            value={estoque}
            onChange={(e) => setEstoque(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={aoCancelar}
          disabled={carregando}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm font-bold"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={carregando}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded text-sm font-bold"
        >
          {carregando
            ? "Processando..."
            : produtoEditando
              ? "Salvar Alterações"
              : "Confirmar Cadastro"}
        </button>
      </div>
    </form>
  );
}
