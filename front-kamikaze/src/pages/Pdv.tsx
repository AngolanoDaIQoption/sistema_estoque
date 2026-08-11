import { useState, useEffect } from "react";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";

interface Produto {
  id: number;
  nome: string;
  preco: number;
  estoque: number;
}

interface ItemCarrinho {
  produto_id: number;
  nome: string;
  preco: number;
  quantidade: number;
}

export function Pdv() {
  const navegar = useNavigate();

  // Estados dos dados e formulários
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [nomeCliente, setNomeCliente] = useState("");
  const [produtoSelecionadoId, setProdutoSelecionadoId] = useState<number | "">(
    "",
  );
  const [quantidade, setQuantidade] = useState<number>(1);
  const [enviando, setEnviando] = useState(false);

  // 1. Carrega os produtos disponíveis para o dropdown de seleção
  async function carregarProdutos() {
    const token = localStorage.getItem("kamikase_token");
    if (!token) {
      navegar("/");
      return;
    }

    try {
      const resposta = await fetch("http://localhost:3000/api/produtos", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (resposta.status === 401 || resposta.status === 403) {
        localStorage.removeItem("kamikase_token");
        navegar("/");
        return;
      }

      if (resposta.ok) {
        const dados = await resposta.json();
        setProdutos(dados);
      }
    } catch (erro) {
      console.error("Erro ao carregar produtos:", erro);
    }
  }

  useEffect(() => {
    carregarProdutos();
  }, []);

  // 2. Adiciona um item ao carrinho local
  function adicionarAoCarrinho() {
    if (!produtoSelecionadoId) {
      alert("Selecione um produto.");
      return;
    }

    if (quantidade <= 0) {
      alert("A quantidade deve ser maior que zero.");
      return;
    }

    const prod = produtos.find((p) => p.id === Number(produtoSelecionadoId));
    if (!prod) return;

    // Trava simples no front (o back valida de verdade)
    if (quantidade > prod.estoque) {
      alert(
        `Quantidade indisponível em estoque. Estoque atual: ${prod.estoque}`,
      );
      return;
    }

    // Se já estiver no carrinho, apenas soma a quantidade
    const itemExistente = carrinho.find((item) => item.produto_id === prod.id);

    if (itemExistente) {
      if (itemExistente.quantidade + quantidade > prod.estoque) {
        alert("Quantidade total no carrinho excede o estoque disponível.");
        return;
      }

      setCarrinho(
        carrinho.map((item) =>
          item.produto_id === prod.id
            ? { ...item, quantidade: item.quantidade + quantidade }
            : item,
        ),
      );
    } else {
      setCarrinho([
        ...carrinho,
        {
          produto_id: prod.id,
          nome: prod.nome,
          preco: Number(prod.preco),
          quantidade: quantidade,
        },
      ]);
    }

    // Reseta seleção
    setProdutoSelecionadoId("");
    setQuantidade(1);
  }

  // 3. Remove um item do carrinho
  function removerDoCarrinho(produto_id: number) {
    setCarrinho(carrinho.filter((item) => item.produto_id !== produto_id));
  }

  // 4. Total estimado no Front-end
  const totalEstimado = carrinho.reduce(
    (acc, item) => acc + item.preco * item.quantidade,
    0,
  );

  // 5. Finalizar Venda (Envia pro Back-end)
  async function finalizarVenda() {
    if (!nomeCliente.trim()) {
      alert("Por favor, digite o nome do cliente.");
      return;
    }

    if (carrinho.length === 0) {
      alert("O carrinho está vazio.");
      return;
    }

    const token = localStorage.getItem("kamikase_token");
    setEnviando(true);

    try {
      const payload = {
        nome_cliente: nomeCliente,
        itens: carrinho.map((item) => ({
          produto_id: item.produto_id,
          quantidade: item.quantidade,
        })),
      };

      const resposta = await fetch("http://localhost:3000/api/vendas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        alert("✅ Venda finalizada com sucesso!");
        setCarrinho([]);
        setNomeCliente("");
        carregarProdutos(); // Recarrega produtos para atualizar o estoque na tela
      } else {
        alert(`❌ Erro: ${dados.erro || "Falha ao registrar venda."}`);
      }
    } catch (erro) {
      console.error("Erro na requisição:", erro);
      alert("Erro de comunicação com o servidor.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <Header />

      <div className="max-w-6xl mx-auto mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Lado Esquerdo: Formulário de Adição */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg md:col-span-1">
          <h2 className="text-xl font-bold mb-4 text-cyan-400">
            Ponto de Venda (PDV)
          </h2>

          {/* Campo Nome do Cliente */}
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1">
              Nome do Cliente
            </label>
            <input
              type="text"
              placeholder="Ex: João da Silva"
              value={nomeCliente}
              onChange={(e) => setNomeCliente(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <hr className="border-slate-700 my-4" />

          {/* Seleção de Produto */}
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1">
              Selecionar Produto
            </label>
            <select
              value={produtoSelecionadoId}
              onChange={(e) =>
                setProdutoSelecionadoId(Number(e.target.value) || "")
              }
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="">-- Escolha um produto --</option>
              {produtos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome} (Qtd: {p.estoque}) - R$ {Number(p.preco).toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          {/* Quantidade */}
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1">
              Quantidade
            </label>
            <input
              type="number"
              min="1"
              value={quantidade}
              onChange={(e) => setQuantidade(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            onClick={adicionarAoCarrinho}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 rounded-lg transition"
          >
            + Adicionar ao Carrinho
          </button>
        </div>

        {/* Lado Direito: Carrinho de Compras */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg md:col-span-2 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold mb-4 text-emerald-400">
              Carrinho de Compras
            </h2>

            {carrinho.length === 0 ? (
              <p className="text-slate-400 text-center py-12">
                Nenhum item adicionado ao carrinho.
              </p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-700 text-slate-300 uppercase text-xs">
                  <tr>
                    <th className="p-3">Produto</th>
                    <th className="p-3 text-center">Preço Un.</th>
                    <th className="p-3 text-center">Qtd</th>
                    <th className="p-3 text-right">Subtotal</th>
                    <th className="p-3 text-center">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {carrinho.map((item) => (
                    <tr key={item.produto_id}>
                      <td className="p-3 font-bold">{item.nome}</td>
                      <td className="p-3 text-center">
                        R$ {item.preco.toFixed(2)}
                      </td>
                      <td className="p-3 text-center">{item.quantidade}</td>
                      <td className="p-3 text-right">
                        R$ {(item.preco * item.quantidade).toFixed(2)}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => removerDoCarrinho(item.produto_id)}
                          className="text-red-400 hover:text-red-300 font-bold"
                        >
                          Remover
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Rodapé do Carrinho com Total e Finalizar */}
          <div className="mt-6 pt-4 border-t border-slate-700 flex justify-between items-center">
            <div>
              <span className="text-slate-400 block text-sm">Total Geral</span>
              <span className="text-2xl font-bold text-emerald-400">
                R$ {totalEstimado.toFixed(2)}
              </span>
            </div>

            <button
              onClick={finalizarVenda}
              disabled={enviando || carrinho.length === 0}
              className={`px-6 py-3 rounded-lg font-bold text-white transition ${
                enviando || carrinho.length === 0
                  ? "bg-slate-600 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-500"
              }`}
            >
              {enviando ? "Processando..." : "Finalizar Venda ➔"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
