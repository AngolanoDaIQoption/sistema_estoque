import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'chave_secreta_super_segura';

export interface TokenPayload {
  id: number;
  email?: string;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ mensagem: 'Token de autenticação não fornecido.' });
    return;
  }

  // O formato do cabeçalho é: "Bearer <TOKEN>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    res.status(401).json({ mensagem: 'Erro no formato do Token.' });
    return;
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as TokenPayload;
    // Anexa o ID do usuário verificado dentro da requisição
    (req as any).usuarioId = decoded.id;
    
    return next(); // Token válido, pode seguir para a controller!
  } catch (err) {
    res.status(401).json({ mensagem: 'Token inválido ou expirado.' });
    return;
  }
}