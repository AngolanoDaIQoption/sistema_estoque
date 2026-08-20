import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";

interface Venda {
  id: number;
  nome_cliente: string;
  vendedor?: string;
  nome_vendedor?: string;
  total?: number;
  valor_total?: number;
  data_venda: string;
}

export function HistoricoVendas() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [carregando, setCarregando] = useState(true);
  const navegar = useNavigate();

  // Estados para o Modal de Edição
  const [vendaEmEdicao, setVendaEmEdicao] = useState<Venda | null>(null);
  const [novoNomeCliente, setNovoNomeCliente] = useState("");
  const [novoValorTotal, setNovoValorTotal] = useState<number | "">("");
  const [salvando, setSalvando] = useState(false);

  const usuarioLogado = JSON.parse(
    localStorage.getItem("kamikase_usuario") || "{}",
  );
  const ehADM = usuarioLogado?.perfil === "ADM";

  async function carregarHistorico() {
    const token = localStorage.getItem("kamikase_token");
    if (!token) {
      navegar("/");
      return;
    }

    try {
      const resposta = await fetch("http://localhost:3000/api/vendas", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (resposta.status === 401 || resposta.status === 403) {
        localStorage.removeItem("kamikase_token");
        navegar("/");
        return;
      }

      if (resposta.ok) {
        const dados = await resposta.json();
        setVendas(dados);
      }
    } catch (erro) {
      console.error("Erro ao buscar histórico:", erro);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarHistorico();
  }, []);

  // Excluir Venda (Restrito ao ADM)
  async function deletarVenda(id: number) {
    const token = localStorage.getItem("kamikase_token");

    try {
      const resposta = await fetch(`http://localhost:3000/api/vendas/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (resposta.ok) {
        setVendas(vendas.filter((v) => v.id !== id));
      } else {
        const dados = await resposta.json();
        alert(`Erro: ${dados.erro || "Falha ao excluir a venda."}`);
      }
    } catch (erro) {
      alert("Falha de comunicação com o servidor.");
    }
  }

  // Abre o Modal de Edição
  function abrirModalEdicao(venda: Venda) {
    const valorAtual = Number(venda.total ?? venda.valor_total ?? 0);
    setVendaEmEdicao(venda);
    setNovoNomeCliente(venda.nome_cliente);
    setNovoValorTotal(valorAtual);
  }

  // Salva as alterações via API
  async function salvarEdicaoVenda(e: React.FormEvent) {
    e.preventDefault();
    if (!vendaEmEdicao) return;

    if (
      !novoNomeCliente.trim() ||
      novoValorTotal === "" ||
      Number(novoValorTotal) < 0
    ) {
      alert("Preencha todos os campos corretamente.");
      return;
    }

    const token = localStorage.getItem("kamikase_token");
    setSalvando(true);

    try {
      const resposta = await fetch(
        `http://localhost:3000/api/vendas/${vendaEmEdicao.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nome_cliente: novoNomeCliente,
            total: Number(novoValorTotal),
          }),
        },
      );

      if (resposta.ok) {
        setVendas(
          vendas.map((v) =>
            v.id === vendaEmEdicao.id
              ? {
                  ...v,
                  nome_cliente: novoNomeCliente,
                  total: Number(novoValorTotal),
                  valor_total: Number(novoValorTotal),
                }
              : v,
          ),
        );
        setVendaEmEdicao(null);
      } else {
        const dados = await resposta.json();
        alert(`Erro: ${dados.erro || "Falha ao atualizar a venda."}`);
      }
    } catch (erro) {
      alert("Falha de comunicação com o servidor.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Histórico de Vendas</h1>
              <p className="text-sm text-slate-400">
                Registro geral de operações realizadas
              </p>
            </div>
          </div>

          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
            {carregando ? (
              <p className="text-slate-400 text-center py-8">
                Carregando histórico...
              </p>
            ) : vendas.length === 0 ? (
              <p className="text-slate-400 text-center py-8">
                Nenhuma venda registrada até o momento.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-700 text-slate-300 uppercase text-xs">
                    <tr>
                      <th className="p-3">ID Venda</th>
                      <th className="p-3">Cliente</th>
                      <th className="p-3">Vendedor</th>
                      <th className="p-3">Data/Hora</th>
                      <th className="p-3 text-right">Valor Total</th>
                      <th className="p-3 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {vendas.map((venda) => {
                      const valorFinal = Number(
                        venda.total ?? venda.valor_total ?? 0,
                      );
                      const nomeVendedor =
                        venda.vendedor || venda.nome_vendedor || "Sistema";

                      return (
                        <tr
                          key={venda.id}
                          className="hover:bg-slate-700/50 transition"
                        >
                          <td className="p-3 font-mono font-bold text-cyan-400">
                            #{venda.id}
                          </td>
                          <td className="p-3 font-semibold">
                            {venda.nome_cliente}
                          </td>
                          <td className="p-3 text-slate-300">{nomeVendedor}</td>
                          <td className="p-3 text-slate-400">
                            {new Date(venda.data_venda).toLocaleString("pt-BR")}
                          </td>
                          <td className="p-3 text-right font-bold text-emerald-400">
                            R$ {valorFinal.toFixed(2)}
                          </td>
                          <td className="p-3 text-center">
                            {ehADM ? (
                              <div className="flex justify-center gap-3">
                                <button
                                  onClick={() => abrirModalEdicao(venda)}
                                  className="text-cyan-400 hover:text-cyan-300 font-bold cursor-pointer"
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={() => deletarVenda(venda.id)}
                                  className="text-rose-500 hover:text-rose-400 font-bold cursor-pointer"
                                >
                                  Excluir
                                </button>
                              </div>
                            ) : (
                              <span className="text-slate-500 text-xs font-semibold">
                                Sem permissão
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal de Edição de Venda */}
      {vendaEmEdicao && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-cyan-400 mb-4">
              Editar Venda #{vendaEmEdicao.id}
            </h3>

            <form onSubmit={salvarEdicaoVenda} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Nome do Cliente
                </label>
                <input
                  type="text"
                  value={novoNomeCliente}
                  onChange={(e) => setNovoNomeCliente(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                  Valor Total (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={novoValorTotal}
                  onChange={(e) =>
                    setNovoValorTotal(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setVendaEmEdicao(null)}
                  className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-lg font-semibold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold px-5 py-2 rounded-lg transition cursor-pointer"
                >
                  {salvando ? "Salvando..." : "Salvar Alterações"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
