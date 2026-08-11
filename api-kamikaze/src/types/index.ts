// Mapeamos exatamente as colunas que criamos no MySQL!

export interface IUsuario {
    id?: number; // O ponto de interrogação diz que o ID é opcional na hora de criar, pois o banco gera sozinho
    nome: string;
    email: string;
    senha?: string; // A senha não deve ficar sendo devolvida nas consultas
}

export interface ICategoria {
    id?: number;
    nome: string;
}

export interface IProduto {
    id?: number;
    nome: string;
    preco: number;
    estoque: number;
    categoria_id: number;
    usuario_id: number;
}