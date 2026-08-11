import React, { useState } from 'react';
import { api } from '../services/api';

interface ICategoria {
  id: number;
  nome: string;
}

interface GerenciarCategoriasProps {
  categorias: ICategoria[];
  aoAtualizarCategorias: () => void;
}

export function GerenciarCategorias({ categorias, aoAtualizarCategorias }: GerenciarCategoriasProps) {
  const [nome, setNome] = useState('');
  const [categoriaEditando, setCategoriaEditando] = useState<ICategoria | null>(null);

  const iniciarEdicao = (categoria: ICategoria) => {
    setCategoriaEditando(categoria);
    setNome(categoria.nome);
  };

  const cancelarEdicao = () => {
    setCategoriaEditando(null);
    setNome('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('kamikase_token');

    try {
      const headers = { Authorization: `Bearer ${token}` };

      if (categoriaEditando) {
        await api.put(`/api/categorias/${categoriaEditando.id}`, { nome }, { headers });
        alert('Categoria atualizada com sucesso!');
      } else {
        await api.post('/api/categorias', { nome }, { headers });
        alert('Categoria cadastrada com sucesso!');
      }

      cancelarEdicao();
      aoAtualizarCategorias();
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar categoria.');
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl text-white shadow-lg mb-6">
      <h2 className="text-xl font-bold mb-4 text-slate-100">
        {categoriaEditando ? 'Editar Categoria' : 'Gerenciar Categorias'}
      </h2>

      {/* Input e Botão */}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Nome da categoria"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-400 outline-none focus:border-cyan-500 transition"
          required
        />
        <button
          type="submit"
          className="bg-cyan-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-cyan-500 transition whitespace-nowrap"
        >
          {categoriaEditando ? 'Atualizar' : 'Cadastrar'}
        </button>

        {categoriaEditando && (
          <button
            type="button"
            onClick={cancelarEdicao}
            className="bg-slate-600 text-slate-200 px-4 py-2 rounded-lg font-bold hover:bg-slate-500 transition"
          >
            Cancelar
          </button>
        )}
      </form>

      {/* Lista Amarela de Categorias */}
      <div className="divide-y divide-slate-700/50">
        {categorias.length === 0 ? (
          <p className="text-slate-400 text-sm py-2">Nenhuma categoria cadastrada.</p>
        ) : (
          categorias.map((cat) => (
            <div key={cat.id} className="flex justify-between items-center py-2">
              <span className="font-semibold text-amber-400">{cat.nome}</span>
              <button
                type="button"
                onClick={() => iniciarEdicao(cat)}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-bold transition"
              >
                Editar
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}