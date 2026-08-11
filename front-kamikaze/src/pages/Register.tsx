import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../services/api'

export default function Register() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  const navigate = useNavigate()

  async function handleRegister(e: any) {
    e.preventDefault()
    setErro('')
    setSucesso('')

    try {
      // Envia os campos esperados pelo UsuarioController (nome, email, senha)
      await api.post('/api/usuarios/cadastrar', { nome, email, senha })
      
      setSucesso('Usuário cadastrado com sucesso! Redirecionando...')
      setTimeout(() => navigate('/'), 2000)
    } catch (err: any) {
      setErro('Erro ao cadastrar. Tente novamente!')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form onSubmit={handleRegister} className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">Criar Nova Conta</h2>

        {erro && <p className="mb-4 rounded bg-red-100 p-2 text-sm text-red-600 text-center">{erro}</p>}
        {sucesso && <p className="mb-4 rounded bg-green-100 p-2 text-sm text-green-600 text-center">{sucesso}</p>}

        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium text-gray-700">Nome</label>
          <input
            type="text"
            required
            className="w-full rounded border border-gray-300 p-2"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium text-gray-700">E-mail</label>
          <input
            type="email"
            required
            className="w-full rounded border border-gray-300 p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <label className="block mb-1 text-sm font-medium text-gray-700">Senha</label>
          <input
            type="password"
            required
            className="w-full rounded border border-gray-300 p-2"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </div>

        <button type="submit" className="w-full rounded bg-blue-600 p-2 font-bold text-white hover:bg-blue-700">
          Cadastrar
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          Já tem conta? <Link to="/" className="text-blue-600 underline">Fazer Login</Link>
        </p>
      </form>
    </div>
  )
}