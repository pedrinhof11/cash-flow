import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useResetPassword } from '../hooks'
import { useThemeStore } from '../store/themeStore'
import { Sun, Moon, ArrowLeft } from 'lucide-react'
import Logo from '../components/ui/Logo'
import PasswordInput from '../components/ui/PasswordInput'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''
  const emailParam = searchParams.get('email') || ''

  const [email, setEmail] = useState(emailParam)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const { mutate: reset, isPending } = useResetPassword()
  const { theme, toggle } = useThemeStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('As senhas não coincidem')
      return
    }
    reset(
      { email, token, password, password_confirmation: confirm },
      {
        onSuccess: () => setSuccess(true),
        onError: () => setError('Token inválido ou expirado. Solicite um novo link.'),
      }
    )
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="card p-6 text-center">
          <p className="text-red-600 mb-4">Link de redefinição inválido.</p>
          <Link to="/forgot-password" className="text-brand-600 font-medium hover:underline">
            Solicitar novo link
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <button onClick={toggle} className="fixed top-4 right-4 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
        {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
      </button>

      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-100 dark:bg-brand-950 mb-5">
            <Logo className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Redefinir Senha</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1.5">Escolha uma nova senha para sua conta</p>
        </div>

        <div className="card p-6">
          {success ? (
            <div className="text-center space-y-4">
              <p className="text-green-600 dark:text-green-400 font-medium">Senha redefinida com sucesso!</p>
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-2 text-brand-600 dark:text-brand-400 font-medium hover:underline"
              >
                <ArrowLeft className="w-4 h-4" /> Fazer login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 text-sm p-3 rounded-xl">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  E-mail
                </label>
                <input
                  id="reset-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>

              <PasswordInput
                id="reset-password"
                label="Nova Senha"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                minLength={8}
              />

              <PasswordInput
                id="reset-confirm"
                label="Confirmar Nova Senha"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                minLength={8}
              />

              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-brand-600 text-white py-2.5 rounded-xl font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isPending ? 'Redefinindo...' : 'Redefinir Senha'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
