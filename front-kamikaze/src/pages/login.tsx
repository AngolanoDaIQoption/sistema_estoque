import { useState, type SyntheticEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e: SyntheticEvent) {
    e.preventDefault();
    setError("");

    try {
      // Faz o POST para a rota de login da API
      const response = await api.post("api/usuarios/login", {
        email,
        senha: password,
      });

      // Salva o token retornado pela API no navegador
      localStorage.setItem("kamikase_token", response.data.token);

      // Redireciona para o Dashboard logado
      navigate("/dashboard");
    } catch (err) {
      setError("E-mail ou senha inválidos!");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg bg-white p-6 shadow-md"
      >
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
          Login - Sistema Estoque
        </h2>

        {error && (
          <div className="mb-4 rounded bg-red-100 p-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            E-mail
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border px-3 py-2 outline-none focus:border-blue-500"
            required
          />
        </div>

        <div className="mb-6">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Senha
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border px-3 py-2 outline-none focus:border-blue-500"
            required
          />
        </div>

        <div style={{ marginTop: "16px", textAlign: "center" }}>
          <p>Ainda não tem uma conta?</p>
          <Link to="/cadastrar">Cadastre-se aqui</Link>
        </div>

        <button
          type="submit"
          className="w-full rounded bg-blue-600 py-2 font-semibold text-white hover:bg-blue-700 transition"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
