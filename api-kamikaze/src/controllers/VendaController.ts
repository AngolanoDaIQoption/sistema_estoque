import { Request, Response } from "express";
import { VendaModel, ItemVendaComPreco } from "../models/VendaModel";
import { db } from "../config/database";

export class VendaController {
  static async registrar(req: Request, res: Response) {
    try {
      const { nome_cliente, itens, descontoPorcentagem = 0 } = req.body;

      // 1. Pega o usuário logado via middleware
      const usuarioLogado = (req as any).usuario || (req as any).user;

      // 2. Trava de Segurança: Apenas ADM pode aplicar desconto superior a 15%
      if (usuarioLogado?.perfil !== "ADM" && Number(descontoPorcentagem) > 15) {
        return res.status(403).json({
          erro: "Acesso negado: Apenas administradores podem conceder descontos superiores a 15%.",
        });
      }

      // 3. Validação dos dados recebidos
      if (
        !nome_cliente ||
        !itens ||
        !Array.isArray(itens) ||
        itens.length === 0
      ) {
        return res.status(400).json({
          erro: "Informe o nome do cliente e pelo menos um item na venda.",
        });
      }

      let valorTotalCalculado = 0;
      const itensProcessados: ItemVendaComPreco[] = [];

      // 4. Inicia a validação de estoque e preços dos produtos
      for (const item of itens) {
        const [produtos]: any = await db.query(
          "SELECT id, nome, preco, estoque FROM produtos WHERE id = ?",
          [item.produto_id],
        );

        if (produtos.length === 0) {
          return res.status(404).json({
            erro: `Produto de ID ${item.produto_id} não encontrado.`,
          });
        }

        const produto = produtos[0];

        if (produto.estoque < item.quantidade) {
          return res.status(400).json({
            erro: `Estoque insuficiente para o produto "${produto.nome}". Disponível: ${produto.estoque}, Solicitado: ${item.quantidade}`,
          });
        }

        const precoUnitario = Number(produto.preco);
        valorTotalCalculado += precoUnitario * item.quantidade;

        itensProcessados.push({
          produto_id: item.produto_id,
          quantidade: item.quantidade,
          preco_unitario: precoUnitario,
        });
      }

      // 5. Aplica o desconto ao valor total
      const valorDesconto =
        (valorTotalCalculado * Number(descontoPorcentagem)) / 100;
      const valorComDesconto = valorTotalCalculado - valorDesconto;

      // 6. Envia exatamente 4 argumentos para a VendaModel
      const usuario_id = usuarioLogado?.id || null;

      const novaVenda = await VendaModel.criarVenda(
        nome_cliente,
        usuario_id,
        valorComDesconto,
        itensProcessados,
      );

      return res.status(201).json({
        mensagem: "Venda realizada com sucesso!",
        venda: novaVenda,
      });
    } catch (erro: any) {
      console.error("Erro interno ao processar venda:", erro);
      return res.status(500).json({
        erro: erro.message || "Erro interno no servidor ao processar a venda.",
      });
    }
  }

  // Adicione este método dentro da classe VendaController:
  static async listar(req: Request, res: Response) {
    try {
      const vendas = await VendaModel.listarVendas();
      return res.json(vendas);
    } catch (erro: any) {
      console.error("Erro ao listar vendas:", erro);
      return res.status(500).json({
        erro: "Erro interno ao carregar o histórico de vendas.",
      });
    }
  }
  static async atualizar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { nome_cliente, total } = req.body;

      const vendaAtualizada = await VendaModel.atualizarVenda(
        Number(id),
        nome_cliente,
        Number(total),
      );

      return res.json({
        mensagem: "Venda atualizada com sucesso!",
        venda: vendaAtualizada,
      });
    } catch (erro: any) {
      console.error("Erro ao atualizar venda:", erro);
      return res.status(500).json({ erro: "Erro ao atualizar a venda." });
    }
  }

  static async excluir(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await VendaModel.deletarVenda(Number(id));

      return res.json({ mensagem: "Venda excluída com sucesso do histórico." });
    } catch (erro: any) {
      console.error("Erro ao excluir venda:", erro);
      return res.status(500).json({ erro: "Erro ao excluir a venda." });
    }
  }
} // Fechamento da classe VendaController na ultima linha
