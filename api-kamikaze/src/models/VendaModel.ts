import { db } from '../config/database';

export interface ItemVendaComPreco {
  produto_id: number;
  quantidade: number;
  preco_unitario: number;
}

export class VendaModel {
  // Transação SQL para registrar a venda, congelar o preço e dar baixa no estoque
  static async criarVenda(
    usuario_id: number,
    nome_cliente: string,
    valor_total: number,
    itens: ItemVendaComPreco[]
  ) {
    const connection = await db.getConnection();

    try {
      // 1. Inicia a transação SQL
      await connection.beginTransaction();

      // 2. Insere o cabeçalho na tabela 'vendas'
      const [resultVenda]: any = await connection.execute(
        'INSERT INTO vendas (usuario_id, nome_cliente, valor_total) VALUES (?, ?, ?)',
        [usuario_id, nome_cliente, valor_total]
      );

      const vendaId = resultVenda.insertId;

      // 3. Loop para salvar os itens e subtrair o estoque
      for (const item of itens) {
        // Registra o item com o preço congelado do momento
        await connection.execute(
          'INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)',
          [vendaId, item.produto_id, item.quantidade, item.preco_unitario]
        );

        // Baixa automática no estoque
        await connection.execute(
          'UPDATE produtos SET estoque = estoque - ? WHERE id = ?',
          [item.quantidade, item.produto_id]
        );
      }

      // 4. Se tudo rodou sem erros, confirma as alterações no banco
      await connection.commit();
      return { success: true, vendaId };

    } catch (erro) {
      // 5. Se der qualquer falha, desfaz absolutamente tudo
      await connection.rollback();
      throw erro;
    } finally {
      connection.release();
    }
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
}