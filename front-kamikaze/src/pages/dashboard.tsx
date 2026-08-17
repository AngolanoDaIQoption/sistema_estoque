import { useState, useEffect } from "react";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import { ProdutoForm } from "../components/ProdutoForm";
import { GerenciarCategorias } from "../components/GerenciarCategorias";
import { GerenciarUsuarios } from "../components/GerenciarUsuarios";

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

export function Dashboard() {
  const navegar = useNavigate();

  // Estados de dados e controle
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [produtoEmEdicao, setProdutoEmEdicao] = useState<Produto | null>(null);

  // 1. Ejetor automático para token vencido
  function lidarComErroDeAutenticacao(status: number) {
    if (status === 401 || status === 403) {
      alert(
        "Sua sessão expirou por segurança. Por favor, faça login novamente.",
      );
      localStorage.removeItem("kamikase_token");
      localStorage.removeItem("kamikase_usuario");
      navegar("/");
      return true;
    }
    return false;
  }

  // 2. Busca de dados inicial
  async function carregarDadosDoEstoque() {
    const token = localStorage.getItem("kamikase_token");
    if (!token) {
      navegar("/");
      return;
    }

    try {
      const respostaProdutos = await fetch(
        "http://localhost:3000/api/produtos",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const respostaCategorias = await fetch(
        "http://localhost:3000/api/categorias",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (lidarComErroDeAutenticacao(respostaProdutos.status)) return;
      if (lidarComErroDeAutenticacao(respostaCategorias.status)) return;

      if (respostaProdutos.ok && respostaCategorias.ok) {
        const dadosProdutos = await respostaProdutos.json();
        const dadosCategorias = await respostaCategorias.json();
        setProdutos(dadosProdutos);
        setCategorias(dadosCategorias);
      }
    } catch (erro) {
      console.error("Erro de rede:", erro);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDadosDoEstoque();
  }, []);

  // 3. Função de exclusão de produto
  async function deletarProduto(id: number, nomeProduto: string) {
    const confirmacao = window.confirm(
      `ATENÇÃO: Tem certeza que deseja excluir o produto "${nomeProduto}"? Esta ação não pode ser desfeita.`,
    );
    if (!confirmacao) return;

    const token = localStorage.getItem("kamikase_token");

    try {
      const resposta = await fetch(`http://localhost:3000/api/produtos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (lidarComErroDeAutenticacao(resposta.status)) return;

      if (resposta.ok) {
        setProdutos(produtos.filter((p) => p.id !== id));
        alert("Produto excluído com sucesso.");
      } else {
        alert("Erro ao excluir o produto.");
      }
    } catch (erro) {
      alert("Falha de comunicação com o servidor.");
    }
  }

  // 4. Salvar Produto (Modo Cadastro / Modo Edição)
  function salvarProdutoNaTela(produtoSalvo: Produto) {
    if (produtoEmEdicao) {
      setProdutos(
        produtos.map((p) => (p.id === produtoSalvo.id ? produtoSalvo : p)),
      );
    } else {
      setProdutos([...produtos, produtoSalvo]);
    }
    setProdutoEmEdicao(null);
    setMostrarFormulario(false);
  }

  function iniciarEdicao(produto: Produto) {
    setProdutoEmEdicao(produto);
    setMostrarFormulario(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Estado de Carregamento
  if (carregando) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <p className="text-xl">Comunicando com a Base de Dados...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <Header />

      <div className="max-w-6xl mx-auto mt-6">
        {/* 1. Accordion de Gerenciar Categorias */}
        <GerenciarCategorias />

        {/* 2. Accordion de Gerenciar Usuários */}
        <GerenciarUsuarios />

        {/* 2. Cabeçalho do Painel de Controle */}
        <div className="flex justify-between items-center my-6">
          <div>
            <h1 className="text-2xl font-bold">Painel de Controle</h1>
            <p className="text-sm text-slate-400">
              Gerenciamento Operacional de Estoque
            </p>
          </div>
          <button
            onClick={() => {
              setProdutoEmEdicao(null);
              setMostrarFormulario(!mostrarFormulario);
            }}
            className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-bold transition"
          >
            {mostrarFormulario ? "Fechar Formulário" : "+ Novo Produto"}
          </button>
        </div>

        {/* 3. Formulário de Novo/Editar Produto */}
        {mostrarFormulario && (
          <div className="mb-6">
            <ProdutoForm
              categorias={categorias}
              aoCancelar={() => {
                setMostrarFormulario(false);
                setProdutoEmEdicao(null);
              }}
              aoSalvar={salvarProdutoNaTela}
              produtoEditando={produtoEmEdicao}
            />
          </div>
        )}

        {/* 4. Tabela de Produtos Única com Categoria */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-700 text-slate-300 uppercase text-xs">
              <tr>
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Nome do Produto</th>
                <th className="px-6 py-3 text-center">Categoria</th>
                <th className="px-6 py-3 text-right">Preço</th>
                <th className="px-6 py-3 text-center">Estoque</th>
                <th className="px-6 py-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {produtos.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-slate-400"
                  >
                    Nenhum produto cadastrado no banco.
                  </td>
                </tr>
              ) : (
                produtos.map((produto) => {
                  const nomeCat =
                    categorias.find((c) => c.id === produto.categoria_id)
                      ?.nome || "Sem Categoria";

                  return (
                    <tr
                      key={produto.id}
                      className="hover:bg-slate-700/50 transition"
                    >
                      <td className="px-6 py-4 font-mono">{produto.id}</td>
                      <td className="px-6 py-4 font-bold">{produto.nome}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-cyan-950 text-cyan-300 border border-cyan-800 px-2.5 py-1 rounded-md text-xs font-semibold inline-block">
                          {nomeCat}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        R$ {Number(produto.preco).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${
                            produto.estoque < 5
                              ? "bg-red-900/50 text-red-400"
                              : "bg-emerald-900/50 text-emerald-400"
                          }`}
                        >
                          {produto.estoque} un
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center space-x-3">
                        <button
                          onClick={() => iniciarEdicao(produto)}
                          className="text-cyan-400 hover:text-cyan-300 font-bold"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() =>
                            deletarProduto(produto.id, produto.nome)
                          }
                          className="text-red-400 hover:text-red-300 font-bold"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
