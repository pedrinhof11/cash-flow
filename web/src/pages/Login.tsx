import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks'
import { useThemeStore } from '../store/themeStore'
import { Sun, Moon } from 'lucide-react'
import Logo from '../components/ui/Logo'
import PasswordInput from '../components/ui/PasswordInput'

export default function Login() {
  const { login } = useAuth()
  const { theme, toggle } = useThemeStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await login.mutateAsync({ email, password })
    } catch {
      setError('E-mail ou senha inválidos')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <button
        onClick={toggle}
        className="fixed top-4 right-4 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
      </button>

      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-100 dark:bg-brand-950 mb-5">
            <Logo className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Cash Flow</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1.5">Acesse sua conta</p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 text-sm p-3 rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                E-mail
              </label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:placeholder-gray-500"
                placeholder="voce@exemplo.com"
              />
            </div>

            <PasswordInput
              id="login-password"
              label="Senha"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            <button
              type="submit"
              disabled={login.isPending}
              className="w-full bg-brand-600 text-white py-2.5 rounded-xl font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {login.isPending ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="flex justify-between text-sm mt-4">
            <Link to="/forgot-password" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">
              Esqueci minha senha
            </Link>
            <Link to="/recover-email" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">
              Esqueci meu email
            </Link>
          </div>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Não tem uma conta?{' '}
            <Link to="/register" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
