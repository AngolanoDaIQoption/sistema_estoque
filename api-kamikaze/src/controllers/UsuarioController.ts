import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { UsuarioModel } from "../models/UsuarioModel";
import jwt from "jsonwebtoken";

export class UsuarioController {
  // 1. Login
  static async login(req: Request, res: Response) {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res
          .status(400)
          .json({ erro: "E-mail e senha são obrigatórios!" });
      }

      // 1. Busca o usuário pelo e-mail
      const usuario = await UsuarioModel.buscarPorEmail(email);
      if (!usuario) {
        return res.status(401).json({ erro: "E-mail ou senha inválidos!" });
      }

      // 2. Compara a senha informada com o hash salvo no banco
      const senhaValida = await bcrypt.compare(senha, usuario.senha || "");
      if (!senhaValida) {
        return res.status(401).json({ erro: "E-mail ou senha inválidos!" });
      }

      // 3. Gera o token JWT (use a chave secreta da sua aplicação/env)
      const secretKey = process.env.JWT_SECRET || "sua_chave_secreta_aqui";
      const token = jwt.sign(
        { id: usuario.id, email: usuario.email, nome: usuario.nome },
        secretKey,
        { expiresIn: "1d" },
      );

      // 4. Retorna os dados básicos e o token
      res.json({
        mensagem: "Login realizado com sucesso!",
        token,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
        },
      });
    } catch (erro) {
      console.error(erro);
      res.status(500).json({ erro: "Erro interno ao realizar login." });
    }
  }

  // 2. Listar todos
  static async listar(req: Request, res: Response) {
    try {
      const usuarios = await UsuarioModel.listarTodos(); // <--- Ajustado aqui!
      res.json(usuarios);
    } catch (erro) {
      res.status(500).json({ erro: "Erro ao buscar usuários." });
    }
  }

  // 3. Cadastrar novo
  static async cadastrar(req: Request, res: Response) {
    try {
      const { nome, email, senha } = req.body;

      if (!nome || !email || !senha) {
        return res.status(400).json({ erro: "Preencha todos os campos!" });
      }

      const senhaHash = await bcrypt.hash(senha, 10);

      await UsuarioModel.criar({ nome, email, senha: senhaHash });
      res.status(201).json({ mensagem: "Usuário cadastrado com sucesso!" });
    } catch (erro) {
      res.status(500).json({ erro: "Erro ao cadastrar usuário." });
    }
  }

  // 4. Atualizar
  static async atualizar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { nome, email, senha } = req.body;

      let senhaHash;
      if (senha) {
        senhaHash = await bcrypt.hash(senha, 10);
      }

      await UsuarioModel.atualizar(Number(id), {
        nome,
        email,
        senha: senhaHash,
      });
      res.json({ mensagem: "Usuário atualizado com sucesso!" });
    } catch (erro) {
      res.status(500).json({ erro: "Erro ao atualizar usuário." });
    }
  }

  // 5. Excluir
  static async excluir(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await UsuarioModel.deletar(Number(id));
      return res
        .status(200)
        .json({ mensagem: "Usuario removido com sucesso." });
    } catch (erro: any) {
      if (erro.code === "ER_ROW_IS_REFERENCED_2" || erro.errno === 1451) {
        return res.status(400).json({
          erro: "Nao e possivel excluir este usuario pois ele possui vendas registradas.",
        });
      }
      return res.status(500).json({ erro: "Erro interno ao deletar usuario." });
    }
  }
}
