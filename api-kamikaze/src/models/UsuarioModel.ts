import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { db } from '../config/database';

export interface IUsuario {
  id?: number;
  nome: string;
  email: string;
  senha?: string;
}

export class UsuarioModel {
  static async criar(usuario: IUsuario): Promise<number> {
    const query = 'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)';
    const [result] = await db.execute<ResultSetHeader>(query, [
      usuario.nome,
      usuario.email,
      usuario.senha || '' // Garante que nunca envia undefined para o MySQL
    ]);
    return result.insertId;
  }

  static async buscarPorEmail(email: string): Promise<IUsuario | null> {
    const query = 'SELECT * FROM usuarios WHERE email = ?';
    const [rows] = await db.execute<RowDataPacket[]>(query, [email]);
    if (rows.length === 0) return null;
    return rows[0] as IUsuario;
  }

  static async listarTodos(): Promise<IUsuario[]> {
    const query = 'SELECT id, nome, email FROM usuarios';
    const [rows] = await db.execute<RowDataPacket[]>(query);
    return rows as IUsuario[];
  }
}