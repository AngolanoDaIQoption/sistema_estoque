import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

interface PrivateRouteProps {
  children: ReactNode
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  // Verifica se existe um token salvo no localStorage
  const token = localStorage.getItem('kamikase_token')

  // Se NÃO tiver token, chuta o usuário de volta para a tela de Login
  if (!token) {
    return <Navigate to="/" replace />
  }

  // Se tiver token, libera a passagem para o componente filho (ex: Dashboard)
  return <>{children}</>
}