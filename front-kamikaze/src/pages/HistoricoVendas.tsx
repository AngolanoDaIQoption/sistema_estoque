import { useState, useEffect } from "react";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";

interface Venda {
  id: number;
  nome_cliente: string;
  nome_vendedor: string;
  valor_total: number;
  data_venda: string;
}

export function HistoricoVendas() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [carregando, setCarregando] = useState(true);
  const navegar = useNavigate();

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

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <Header />

      <div className="max-w-6xl mx-auto mt-6 bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-cyan-400">📊 Histórico de Vendas</h2>

        {carregando ? (
          <p className="text-slate-400 text-center py-8">Carregando histórico...</p>
        ) : vendas.length === 0 ? (
          <p className="text-slate-400 text-center py-8">Nenhuma venda registrada até o momento.</p>
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
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {vendas.map((venda) => (
                  <tr key={venda.id} className="hover:bg-slate-750">
                    <td className="p-3 font-bold text-cyan-400">#{venda.id}</td>
                    <td className="p-3 font-semibold">{venda.nome_cliente}</td>
                    <td className="p-3 text-slate-300">{venda.nome_vendedor || "N/A"}</td>
                    <td className="p-3 text-slate-400">
                      {new Date(venda.data_venda).toLocaleString("pt-BR")}
                    </td>
                    <td className="p-3 text-right font-bold text-emerald-400">
                      R$ {Number(venda.valor_total).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}