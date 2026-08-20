import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const secretKey = process.env.JWT_SECRET || "sua_chave_secreta_aqui";

// Middleware para verificar se o usuário está logado
export default function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ erro: "Token de autenticação não fornecido." });
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2) {
    return res.status(401).json({ erro: "Erro no formato do token." });
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ erro: "Token malformatado." });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    
    // Injeta os dados decodificados (incluindo perfil) na requisição
    (req as any).usuario = decoded;
    (req as any).user = decoded;

    return next();
  } catch (err) {
    return res.status(401).json({ erro: "Token inválido ou expirado." });
  }
}

// Middleware restrito para Administradores
export function restrigirParaADM(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const usuario = (req as any).usuario || (req as any).user;

  // Imprime no terminal da API para você confirmar o que o token carregou
  console.log("Usuário autenticado no middleware:", usuario);

  if (!usuario || (usuario.perfil !== "ADM" && usuario.perfil !== "adm")) {
    return res.status(403).json({
      erro: "Acao nao permitida. Apenas administradores possuem este privilegio.",
    });
  }

  return next();
}