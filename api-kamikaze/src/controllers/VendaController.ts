import { Request, Response } from 'express';
import { VendaModel, ItemVendaComPreco } from '../models/VendaModel';
import { db } from '../config/database';

export class VendaController {
  static async registrar(req: Request, res: Response) {
    try {
      const { nome_cliente, itens } = req.body;
      
      // Pega o ID do usuário autenticado no token JWT
      const usuario_id = (req as any).usuarioId || (req as any).user?.id;

      if (!nome_cliente || !itens || !Array.isArray(itens) || itens.length === 0) {
        return res.status(400).json({ erro: 'Informe o nome do cliente e pelo menos um item.' });
      }

      let valorTotalCalculado = 0;
      const itensProcessados: ItemVendaComPreco[] = [];

      // Processa e valida cada item do carrinho
      for (const item of itens) {
        const [rows]: any = await db.execute(
          'SELECT id, preco, estoque FROM produtos WHERE id = ?',
          [item.produto_id]
        );

        if (rows.length === 0) {
          return res.status(404).json({ erro: `Produto ID ${item.produto_id} não encontrado.` });
        }

        const produtoDoBanco = rows[0];

        // Regra de Negócio: Trava do Estoque
        if (produtoDoBanco.estoque < item.quantidade) {
          return res.status(400).json({
            erro: `Estoque insuficiente para o produto ID ${item.produto_id}. Disponível: ${produtoDoBanco.estoque}`
          });
        }

        // Regra de Negócio: Cálculo de Preço Seguro no Back-end
        const precoUnitario = Number(produtoDoBanco.preco);
        valorTotalCalculado += precoUnitario * item.quantidade;

        itensProcessados.push({
          produto_id: item.produto_id,
          quantidade: item.quantidade,
          preco_unitario: precoUnitario
        });
      }

      // Chama a transação no Model
      const resultado = await VendaModel.criarVenda(
        usuario_id,
        nome_cliente,
        valorTotalCalculado,
        itensProcessados
      );

      return res.status(201).json({
        mensagem: 'Venda realizada com sucesso!',
        vendaId: resultado.vendaId,
        valor_total: valorTotalCalculado
      });

    } catch (erro) {
      console.error('Erro ao registrar venda:', erro);
      return res.status(500).json({ erro: 'Erro interno ao processar a venda.' });
    }
  }

  static async listar(req: Request, res: Response) {
    try {
      const vendas = await VendaModel.listarVendas();
      return res.json(vendas);
    } catch (erro) {
      console.error('Erro ao listar vendas:', erro);
      return res.status(500).json({ erro: 'Erro ao buscar histórico de vendas.' });
    }
  }
}