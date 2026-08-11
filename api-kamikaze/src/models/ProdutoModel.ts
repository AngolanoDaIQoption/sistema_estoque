import { db } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface IProduto {
  id?: number;
  nome: string;
  preco: number;
  estoque: number;
  categoria_id: number;
  usuario?: number;
}

export class ProdutoModel {
  static async criar(produto: IProduto): Promise<number> {
    const query = 'INSERT INTO produtos (nome, preco, estoque, categoria_id, usuario_id) VALUES (?, ?, ?, ?, ?)';
    const [result] = await db.execute(query, [
      produto.nome,
      produto.preco,
      produto.estoque,
      produto.categoria_id,
      produto.usuario || 1 // Envia o ID do usuário enviado ou faz o fallback para o ID 1
    ]);
    const header = result as ResultSetHeader;
    return header.insertId;
  }

  static async listarTodos(): Promise<IProduto[]> {
    const query = 'SELECT * FROM produtos';
    const [rows] = await db.execute<RowDataPacket[]>(query);
    return rows as IProduto[];
  }

  static async atualizar(id: number, produto: Partial<IProduto>): Promise<boolean> {
    const query = 'UPDATE produtos SET nome = ?, preco = ?, estoque = ?, categoria_id = ? WHERE id = ?';
    const [result] = await db.execute(query, [
      produto.nome ?? null,
      produto.preco ?? null,
      produto.estoque ?? null,
      produto.categoria_id ?? null,
      id
    ]);
    const header = result as ResultSetHeader;
    return header.affectedRows > 0;
  }

  static async deletar(id: number): Promise<boolean> {
    const query = 'DELETE FROM produtos WHERE id = ?';
    const [result] = await db.execute(query, [id]);
    const header = result as ResultSetHeader;
    return header.affectedRows > 0;
  }
}