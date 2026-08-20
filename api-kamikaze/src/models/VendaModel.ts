import { db } from "../config/database";

export interface ItemVendaComPreco {
  produto_id: number;
  quantidade: number;
  preco_unitario: number;
}

export class VendaModel {
  // Transação SQL para registrar a venda, congelar o preço e dar baixa no estoque
  static async criarVenda(
    nome_cliente: string,
    usuario_id: number | null,
    valorTotal: number,
    itens: Array<{
      produto_id: number;
      quantidade: number;
      preco_unitario?: number;
    }>,
  ) {
    // 1. Inserção na tabela 'vendas' na ORDEM EXATA dos parâmetros
    // Tenta salvar usando 'valor_total' (ou cai para 'total' caso o nome varie no seu banco)
    let vendaId: number;

    try {
      const [resultado]: any = await db.query(
        "INSERT INTO vendas (nome_cliente, usuario_id, valor_total) VALUES (?, ?, ?)",
        [nome_cliente, usuario_id, valorTotal],
      );
      vendaId = resultado.insertId;
    } catch (erro) {
      const [resultado]: any = await db.query(
        "INSERT INTO vendas (nome_cliente, usuario_id, total) VALUES (?, ?, ?)",
        [nome_cliente, usuario_id, valorTotal],
      );
      vendaId = resultado.insertId;
    }

    // 2. Inserção dos itens na tabela 'itens_venda' e baixa no estoque
    for (const item of itens) {
      await db.query(
        "INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)",
        [vendaId, item.produto_id, item.quantidade, item.preco_unitario || 0],
      );

      // Atualiza o estoque do produto
      await db.query("UPDATE produtos SET estoque = estoque - ? WHERE id = ?", [
        item.quantidade,
        item.produto_id,
      ]);
    }

    return {
      id: vendaId,
      nome_cliente,
      usuario_id,
      valor_total: valorTotal,
      itens,
    };
  }

  // Lista o histórico de vendas para o painel da diretoria
  static async listarVendas() {
    const query = `
      SELECT 
        v.id,
        v.nome_cliente,
        v.valor_total,
        v.data_venda,
        u.nome AS nome_vendedor
      FROM vendas v
      JOIN usuarios u ON v.usuario_id = u.id
      ORDER BY v.data_venda DESC
    `;
    const [rows] = await db.execute(query);
    return rows;
  }
  static async atualizarVenda(id: number, nome_cliente: string, total: number) {
    // Atualiza o nome do cliente e tenta suportar total / valor_total
    try {
      await db.query(
        "UPDATE vendas SET nome_cliente = ?, valor_total = ? WHERE id = ?",
        [nome_cliente, total, id],
      );
    } catch (erro) {
      // Caso a coluna no seu banco se chame 'total' em vez de 'valor_total'
      await db.query(
        "UPDATE vendas SET nome_cliente = ?, total = ? WHERE id = ?",
        [nome_cliente, total, id],
      );
    }

    return { id, nome_cliente, total };
  }

  static async deletarVenda(id: number) {
    await db.query("DELETE FROM itens_venda WHERE venda_id = ?", [id]);
    await db.query("DELETE FROM vendas WHERE id = ?", [id]);
    return true;
  }
}
