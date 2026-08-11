import { db } from "../config/database";
import { ResultSetHeader, RowDataPacket } from "mysql2";

export interface ICategoria {
  id?: number;
  nome: string;
}

export class CategoriaModel {
  static async criar(categoria: ICategoria): Promise<number> {
    const query = "INSERT INTO categorias (nome) VALUES (?)";
    const [result] = await db.execute<ResultSetHeader>(query, [categoria.nome]);
    return result.insertId;
  }

  static async listarTodas(): Promise<ICategoria[]> {
    const query = "SELECT * FROM categorias";
    const [rows] = await db.execute<RowDataPacket[]>(query);
    return rows as ICategoria[];
  }
  // Adicione este método dentro do CategoriaModel:
  static async atualizar(id: number, nome: string): Promise<void> {
    const query = "UPDATE categorias SET nome = ? WHERE id = ?";
    await db.query(query, [nome, id]); // ou o seu objeto/pool de conexão com o banco
  }
}
