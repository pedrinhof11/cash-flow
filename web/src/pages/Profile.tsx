import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useUpdateProfile, useUpdatePassword, useChangeEmail, useVerifyEmailChange, useSendPhoneCode, useConfirmPhone, useDevices, useUnregisterDevice } from '../hooks'
import { UserCircle, Shield, Mail, Smartphone, Bell, Monitor, Trash2, CheckCircle, XCircle } from 'lucide-react'

type Tab = 'personal' | 'security' | 'email' | 'phone' | 'notifications' | 'devices'

const tabs: { id: Tab; label: string; icon: typeof UserCircle }[] = [
  { id: 'personal', label: 'Dados Pessoais', icon: UserCircle },
  { id: 'security', label: 'Segurança', icon: Shield },
  { id: 'email', label: 'Alterar Email', icon: Mail },
  { id: 'phone', label: 'Telefone', icon: Smartphone },
  { id: 'devices', label: 'Dispositivos', icon: Monitor },
]

export default function Profile() {
  const user = useAuthStore((s) => s.user)
  const [activeTab, setActiveTab] = useState<Tab>('personal')

  if (!user) return null

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Perfil</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="card p-6">
        {activeTab === 'personal' && <PersonalInfoForm user={user} />}
        {activeTab === 'security' && <PasswordForm />}
        {activeTab === 'email' && <EmailForm />}
        {activeTab === 'phone' && <PhoneSection />}
        {activeTab === 'devices' && <DeviceList />}
      </div>
    </div>
  )
}

function PersonalInfoForm({ user }: { user: NonNullable<ReturnType<typeof useAuthStore.getState>['user']> }) {
  const [name, setName] = useState(user.name)
  const [phone, setPhone] = useState(user.phone || '')
  const { mutate: update, isPending } = useUpdateProfile()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    update({ name, phone: phone || null })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold mb-4">Dados Pessoais</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nome</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
        <input
          type="email"
          value={user.email}
          disabled
          className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2.5 text-gray-500 cursor-not-allowed"
        />
        <p className="text-xs text-gray-400 mt-1">Para alterar o email, use a aba "Alterar Email"</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Telefone</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="(11) 99999-9999"
          className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="bg-brand-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors"
      >
        {isPending ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  )
}

function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const { mutate: update, isPending } = useUpdatePassword()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (newPassword !== confirm) {
      setError('As senhas não coincidem')
      return
    }

    update(
      { current_password: currentPassword, new_password: newPassword, new_password_confirmation: confirm },
      {
        onSuccess: () => {
          setSuccess(true)
          setCurrentPassword('')
          setNewPassword('')
          setConfirm('')
        },
        onError: () => setError('Erro ao alterar senha. Verifique a senha atual.'),
      }
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold mb-4">Alterar Senha</h2>

      {error && <div className="bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 text-sm p-3 rounded-xl">{error}</div>}
      {success && <div className="bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400 text-sm p-3 rounded-xl">Senha alterada com sucesso.</div>}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Senha Atual</label>
        <input
          type="password"
          required
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nova Senha</label>
        <input
          type="password"
          required
          minLength={8}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirmar Nova Senha</label>
        <input
          type="password"
          required
          minLength={8}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="bg-brand-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors"
      >
        {isPending ? 'Alterando...' : 'Alterar Senha'}
      </button>
    </form>
  )
}

function EmailForm() {
  const [email, setEmail] = useState('')
  const [verifyToken, setVerifyToken] = useState('')
  const [step, setStep] = useState<'request' | 'verify'>('request')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const { mutate: requestChange, isPending: isRequesting } = useChangeEmail()
  const { mutate: verifyChange, isPending: isVerifying } = useVerifyEmailChange()

  const handleRequest = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    requestChange(
      { email },
      {
        onSuccess: () => {
          setStep('verify')
          setMessage('Enviamos um código de verificação para o novo email.')
        },
        onError: () => setError('Erro ao solicitar alteração de email.'),
      }
    )
  }

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    verifyChange(verifyToken, {
      onSuccess: () => {
        setMessage('Email alterado com sucesso!')
        setStep('request')
        setEmail('')
        setVerifyToken('')
      },
      onError: () => setError('Token inválido ou expirado.'),
    })
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold mb-4">Alterar Email</h2>

      {error && <div className="bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 text-sm p-3 rounded-xl">{error}</div>}
      {message && <div className="bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400 text-sm p-3 rounded-xl">{message}</div>}

      {step === 'request' ? (
        <form onSubmit={handleRequest} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Novo Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={isRequesting}
            className="bg-brand-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            {isRequesting ? 'Enviando...' : 'Solicitar Alteração'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Token de Verificação</label>
            <input
              type="text"
              required
              value={verifyToken}
              onChange={(e) => setVerifyToken(e.target.value)}
              placeholder="Cole o token recebido no email"
              className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={isVerifying}
            className="bg-brand-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            {isVerifying ? 'Verificando...' : 'Confirmar'}
          </button>
        </form>
      )}
    </div>
  )
}

function PhoneSection() {
  const user = useAuthStore((s) => s.user)
  const [code, setCode] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const { mutate: sendCode, isPending: isSending } = useSendPhoneCode()
  const { mutate: confirmCode, isPending: isConfirming } = useConfirmPhone()
  const verified = !!user?.phone_verified_at

  const handleSend = () => {
    setError('')
    setMessage('')
    sendCode(undefined, {
      onSuccess: () => setMessage('Código enviado para o telefone.'),
      onError: () => setError('Erro ao enviar código.'),
    })
  }

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    confirmCode(code, {
      onSuccess: () => {
        setMessage('Telefone verificado com sucesso!')
        setCode('')
      },
      onError: () => setError('Código inválido.'),
    })
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold mb-4">Verificação de Telefone</h2>

      <div className="flex items-center gap-2 mb-4">
        {verified ? (
          <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400 text-sm">
            <CheckCircle className="w-4 h-4" /> Telefone verificado
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-yellow-600 dark:text-yellow-400 text-sm">
            <XCircle className="w-4 h-4" /> Telefone não verificado
          </span>
        )}
      </div>

      {error && <div className="bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 text-sm p-3 rounded-xl">{error}</div>}
      {message && <div className="bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400 text-sm p-3 rounded-xl">{message}</div>}

      {!verified && (
        <>
          <button
            onClick={handleSend}
            disabled={isSending}
            className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-6 py-2.5 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {isSending ? 'Enviando...' : 'Enviar Código'}
          </button>

          <form onSubmit={handleConfirm} className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Código de Verificação</label>
              <input
                type="text"
                required
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="000000"
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={isConfirming || code.length !== 6}
              className="bg-brand-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors"
            >
              {isConfirming ? 'Verificando...' : 'Confirmar'}
            </button>
          </form>
        </>
      )}
    </div>
  )
}

function DeviceList() {
  const { data: devices, isLoading } = useDevices()
  const { mutate: unregister } = useUnregisterDevice()

  const platformIcon = (platform: string) => {
    switch (platform) {
      case 'ios': return '🍎'
      case 'android': return '🤖'
      default: return '💻'
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold mb-4">Dispositivos</h2>

      {isLoading ? (
        <p className="text-gray-500">Carregando...</p>
      ) : !devices || devices.length === 0 ? (
        <p className="text-gray-500">Nenhum dispositivo cadastrado.</p>
      ) : (
        <div className="space-y-3">
          {devices.map((device) => (
            <div
              key={device.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{platformIcon(device.platform)}</span>
                <div>
                  <p className="font-medium text-sm">{device.device_name || device.platform}</p>
                  <p className="text-xs text-gray-500">
                    {device.platform === 'web' ? 'Navegador' : device.platform === 'ios' ? 'iOS' : 'Android'}
                    {device.last_used_at && ` · Último acesso ${new Date(device.last_used_at).toLocaleDateString()}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => unregister(device.id)}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors"
                title="Remover dispositivo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
