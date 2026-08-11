import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UsuarioModel } from "../models/UsuarioModel";
import bcrypt from "bcrypt";

const SECRET_KEY = process.env.JWT_SECRET || "chave_secreta_super_segura";

export class UsuarioController {
  // 1. Cadastrar Usuário
  static async cadastrar(req: Request, res: Response): Promise<void> {
    try {
      const { nome, email, senha } = req.body;

      if (!nome || !email || !senha) {
        res
          .status(400)
          .json({ mensagem: "Preencha todos os campos (nome, email, senha)." });
        return;
      }

      // Gera o hash da senha usando bcrypt (10 rounds)
      const saltRounds = 10;
      const senhaHash = await bcrypt.hash(senha, saltRounds);

      // Passa a senhaHash para o Model no lugar da senha limpa
      const id = await UsuarioModel.criar({ nome, email, senha: senhaHash });

      res.status(201).json({ mensagem: "Usuário cadastrado com sucesso!", id });
    } catch (error) {
      console.log("ERRO NO CADASTRO DE USUÁRIO:", error);
      res.status(500).json({ mensagem: "Erro ao cadastrar usuário." });
    }
  }

  // 2. Login de Usuário (Gera o Token JWT para a aba 'Auth')
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        res.status(400).json({ mensagem: "Preencha e-mail e senha." });
        return;
      }

      // Busca o usuário pelo e-mail
      const usuario = await UsuarioModel.buscarPorEmail(email);

      // Se o usuário não existir, já bloqueia aqui
      if (!usuario) {
        res.status(401).json({ mensagem: "E-mail ou senha inválidos." });
        return;
      }

      // Compara a senha digitada com a hash salva no banco
      const senhaValida = await bcrypt.compare(senha, usuario.senha!);

      if (!senhaValida) {
        res.status(401).json({ mensagem: "E-mail ou senha inválidos." });
        return;
      }

      // Gera o Token JWT válido por 1 dia (24h)
      const token = jwt.sign(
        { id: usuario.id, email: usuario.email },
        SECRET_KEY,
        { expiresIn: "1d" },
      );

      res.status(200).json({
        mensagem: "Login realizado com sucesso!",
        token,
        usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
      });
    } catch (error) {
      console.log("ERRO NO LOGIN:", error);
      res.status(500).json({ mensagem: "Erro ao realizar login." });
    }
  }

  // 3. Listar Usuários
  static async listar(req: Request, res: Response): Promise<void> {
    try {
      const usuarios = await UsuarioModel.listarTodos();
      res.status(200).json(usuarios);
    } catch (error) {
      console.log("ERRO AO LISTAR USUÁRIOS:", error);
      res.status(500).json({ mensagem: "Erro ao listar usuários." });
    }
  }
}
