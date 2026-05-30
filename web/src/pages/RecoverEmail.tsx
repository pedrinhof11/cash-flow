import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useRecoverEmail } from '../hooks'
import { useThemeStore } from '../store/themeStore'
import { Sun, Moon, ArrowLeft } from 'lucide-react'
import Logo from '../components/ui/Logo'

export default function RecoverEmail() {
  const [phone, setPhone] = useState('')
  const [maskedEmail, setMaskedEmail] = useState('')
  const [error, setError] = useState('')
  const { mutate: recover, isPending } = useRecoverEmail()
  const { theme, toggle } = useThemeStore()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMaskedEmail('')
    recover(phone, {
      onSuccess: (email) => setMaskedEmail(email),
      onError: () => setError('Telefone não encontrado.'),
    })
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Recuperar Email</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1.5">Informe seu telefone para recuperar o email</p>
        </div>

        <div className="card p-6">
          {maskedEmail ? (
            <div className="text-center space-y-4">
              <p className="text-gray-700 dark:text-gray-300">O email cadastrado é:</p>
              <p className="text-xl font-bold text-brand-600 dark:text-brand-400">{maskedEmail}</p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-brand-600 dark:text-brand-400 font-medium hover:underline"
              >
                <ArrowLeft className="w-4 h-4" /> Fazer login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 text-sm p-3 rounded-xl">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Telefone
                </label>
                <input
                  id="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="(11) 99999-9999"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-brand-600 text-white py-2.5 rounded-xl font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isPending ? 'Buscando...' : 'Recuperar Email'}
              </button>

              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                <Link to="/login" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">
                  Voltar ao login
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
