import { Request, Response } from "express";
import { CategoriaModel } from "../models/CategoriaModel";

export class CategoriaController {
  // Cadastrar nova categoria
  static async cadastrar(req: Request, res: Response): Promise<void> {
    try {
      const { nome } = req.body;

      if (!nome) {
        res.status(400).json({ mensagem: "O campo 'nome' é obrigatório." });
        return;
      }

      const id = await CategoriaModel.criar({ nome });
      res.status(201).json({ mensagem: "Categoria criada com sucesso!", id });
    } catch (error) {
      res
        .status(500)
        .json({ mensagem: "Erro interno no servidor ao cadastrar categoria." });
    }
  }

  // Listar todas as categorias
  static async listar(req: Request, res: Response): Promise<void> {
    try {
      const categorias = await CategoriaModel.listarTodas();
      res.status(200).json(categorias);
    } catch (error) {
      res
        .status(500)
        .json({ mensagem: "Erro interno no servidor ao listar categorias." });
    }
  }

  // 2. Editar Categoria
  static async atualizar(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { nome } = req.body;

      if (!nome || nome.trim() === "") {
        res
          .status(400)
          .json({ mensagem: "O nome da categoria é obrigatório." });
        return;
      }

      await CategoriaModel.atualizar(Number(id), nome);
      res.status(200).json({ mensagem: "Categoria atualizada com sucesso!" });
    } catch (error) {
      console.error("ERRO AO ATUALIZAR CATEGORIA:", error);
      res.status(500).json({ mensagem: "Erro ao atualizar categoria." });
    }
  }
}
