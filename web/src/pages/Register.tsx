import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks'
import { useThemeStore } from '../store/themeStore'
import { Sun, Moon } from 'lucide-react'
import Logo from '../components/ui/Logo'
import PasswordInput from '../components/ui/PasswordInput'

export default function Register() {
  const { register } = useAuth()
  const { theme, toggle } = useThemeStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('As senhas não coincidem')
      return
    }
    try {
      await register.mutateAsync({ name, email, password, password_confirmation: confirm })
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar conta')
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
          <p className="text-gray-500 dark:text-gray-400 mt-1.5">Crie sua conta</p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 text-sm p-3 rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="reg-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Nome
              </label>
              <input
                id="reg-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:placeholder-gray-500"
                placeholder="João Silva"
              />
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                E-mail
              </label>
              <input
                id="reg-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:placeholder-gray-500"
                placeholder="voce@exemplo.com"
              />
            </div>

            <PasswordInput
              id="reg-password"
              label="Senha"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              minLength={8}
            />

            <PasswordInput
              id="reg-confirm"
              label="Confirmar Senha"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              minLength={8}
            />

            <button
              type="submit"
              disabled={register.isPending}
              className="w-full bg-brand-600 text-white py-2.5 rounded-xl font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {register.isPending ? 'Criando conta...' : 'Cadastrar'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
