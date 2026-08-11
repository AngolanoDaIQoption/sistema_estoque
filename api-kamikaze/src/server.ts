import 'dotenv/config';
import express from "express";
import cors from "cors";
import UserRouter from './routes/usuarioRoutes';
import categoriaRoutes from './routes/categoriaRoutes';
import produtoRoutes from './routes/produtoRoutes';     
import vendaRoutes from './routes/vendaRoutes';

const app = express();

// Configurações Globais
app.use(express.json()); // Ensina o servidor a entender dados em formato JSON
app.use(cors()); // Libera o acesso para o nosso Front-end (React) no futuro
app.use("/api/usuarios", UserRouter); // Todas as rotas de usuário começam com /api/usuarios
app.use('/api/categorias', categoriaRoutes); // <-- Registrar
app.use('/api/produtos', produtoRoutes);     // <-- Registrar
app.use('/api/vendas', vendaRoutes);         // <-- Registrar

// Rota de Teste de Vida
app.get("/api/status", (req, res) => {
  res
    .status(200)
    .json({ mensagem: "Motor Back-end Kamikaze operando com sucesso!" });
});

// Simulando uma criação bem-sucedida (ex: novo usuário ou produto cadastrado)
app.get("/api/created-201", (req, res) => {
  res.status(201).json({
    status: "Created",
    mensagem: "Missão cumprida! Recurso criado com sucesso no banco de dados.",
  });
});

// --- SIMULADOR DE CAOS KAMIKASE (ERROS) ---

// 400 (Bad Request): O Front-end mandou dados faltando (Ex: Tentou cadastrar um produto sem preço)
app.get("/api/erro-400", (req, res) => {
  res.status(400).json({
    erro: "Bad Request",
    mensagem:
      "Dados incompletos! Você tentou cadastrar um produto sem definir o preço.",
  });
});

// 401 (Unauthorized): O usuário tentou entrar no sistema, mas errou a senha. Acesso negado.
app.get("/api/erro-401", (req, res) => {
  res.status(401).json({
    erro: "Unauthorized",
    mensagem:
      "Acesso negado! Você tentou entrar no sistema, mas errou a senha.",
  });
});

// 404 (Not Found): O clássico da internet. O usuário tentou acessar uma rota ou produto que simplesmente não existe no nosso banco.
app.get("/api/erro-404", (req, res) => {
  res.status(404).json({
    erro: "Not Found",
    mensagem:
      "Ops! Você tentou acessar uma rota ou um produto que simplesmente não existe no nosso banco de dados.",
  });
});

// 500 (Internal Server Error): O Front-end mandou tudo certo, mas o nosso código Back-end quebrou (uma variável estourou, o banco de dados caiu, etc). É aqui que o desenvolvedor Back-end perde o sono.
app.get("/api/erro-500", (req, res) => {
  res.status(500).json({
    erro: "Internal Server Error",
    mensagem:
      "O pior cenário aconteceu! O código Back-end quebrou (uma variável estourou ou o banco caiu). Hora do desenvolvedor perder o sono.",
  });
});


// Ignição do Motor
const PORTA = 3000;
app.listen(PORTA, () => {
  console.log(`🚀 Servidor escutando na porta ${PORTA}...`);
});
