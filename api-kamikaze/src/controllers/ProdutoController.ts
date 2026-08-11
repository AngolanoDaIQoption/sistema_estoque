import { Request, Response } from "express";
import { ProdutoModel } from "../models/ProdutoModel";

export class ProdutoController {
  static async cadastrar(req: Request, res: Response): Promise<void> {
    try {
      const { nome, preco, estoque, categoria_id, usuario } = req.body;

      if (
        !nome ||
        preco === undefined ||
        estoque === undefined ||
        !categoria_id
      ) {
        res
          .status(400)
          .json({ mensagem: "Preencha todos os campos obrigatórios." });
        return;
      }

      const id = await ProdutoModel.criar({
        nome,
        preco,
        estoque,
        categoria_id,
        usuario,
      });
      res.status(201).json({ mensagem: "Produto cadastrado com sucesso!", id });
    } catch (error) {
      console.log("ERRO NO BANCO:", error); // <-- Adicione esta linha!
      res.status(500).json({ mensagem: "Erro ao cadastrar produto." });
    }
  }

  static async listar(req: Request, res: Response): Promise<void> {
    try {
      const produtos = await ProdutoModel.listarTodos();
      res.status(200).json(produtos);
    } catch (error) {
      res.status(500).json({ mensagem: "Erro ao listar produtos." });
    }
  }

  static async atualizar(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { nome, preco, estoque, categoria_id } = req.body;

      const atualizado = await ProdutoModel.atualizar(Number(id), {
        nome,
        preco,
        estoque,
        categoria_id,
      });

      if (!atualizado) {
        res.status(404).json({ mensagem: "Produto não encontrado." });
        return;
      }

      res.status(200).json({ mensagem: "Produto atualizado com sucesso!" });
    } catch (error) {
      res.status(500).json({ mensagem: "Erro ao atualizar produto." });
    }
  }

  static async deletar(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deletado = await ProdutoModel.deletar(Number(id));

      if (!deletado) {
        res.status(404).json({ mensagem: "Produto não encontrado." });
        return;
      }

      res.status(200).json({ mensagem: "Produto removido com sucesso!" });
    } catch (error) {
      res.status(500).json({ mensagem: "Erro ao deletar produto." });
    }
  }
}
