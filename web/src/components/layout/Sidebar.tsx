import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useAuth } from '../../hooks'
import { useThemeStore } from '../../store/themeStore'
import Logo from '../ui/Logo'
import {
  LayoutDashboard,
  Wallet,
  PiggyBank,
  Tags,
  Repeat,
  LogOut,
  Sun,
  Moon,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowLeftRight,
  TrendingDown,
  Target,
  Heart,
  BarChart3,
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Visão Geral' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transações' },
  { to: '/accounts', icon: Wallet, label: 'Contas' },
  { to: '/budgets', icon: PiggyBank, label: 'Orçamentos' },
  { to: '/categories', icon: Tags, label: 'Categorias' },
  { to: '/recurring', icon: Repeat, label: 'Recorrentes' },
  { to: '/savings-goals', icon: Target, label: 'Metas' },
  { to: '/debts', icon: TrendingDown, label: 'Dívidas' },
  { to: '/financial-health', icon: Heart, label: 'Saúde Financeira' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const user = useAuthStore((s) => s.user)
  const { logout } = useAuth()
  const { theme, toggle } = useThemeStore()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => {
    logout.mutate()
  }

  const sidebarContent = (
    <div className={`flex flex-col h-full ${collapsed ? 'w-16' : 'w-60'} transition-all duration-300`}>
      <div className={`flex items-center h-16 px-4 border-b shrink-0 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        <div className={`flex items-center gap-3 ${collapsed && 'hidden'}`}>
          <Logo className="w-8 h-8 shrink-0" />
          <span className="text-lg font-bold tracking-tight">Cash Flow</span>
        </div>
        {collapsed && <Logo className="w-8 h-8 shrink-0" />}
        <button
          onClick={onClose}
          className="lg:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'} ${collapsed ? 'justify-center px-0' : ''}`
            }
            onClick={onClose}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className={`border-t p-3 space-y-2 shrink-0 ${collapsed ? 'flex flex-col items-center' : ''}`}>
        {!collapsed && user && (
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-xl bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-sm font-bold text-brand-700 dark:text-brand-300 shrink-0">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
        )}

        <div className={`flex ${collapsed ? 'flex-col' : ''} gap-1`}>
          <button
            onClick={toggle}
            className={`sidebar-link sidebar-link-inactive ${collapsed ? 'justify-center px-0' : ''}`}
            title={theme === 'light' ? 'Modo escuro' : 'Modo claro'}
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            {!collapsed && <span>{theme === 'light' ? 'Modo escuro' : 'Modo claro'}</span>}
          </button>

          <button
            onClick={handleLogout}
            className={`sidebar-link text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50 ${collapsed ? 'justify-center px-0' : ''}`}
            title="Sair"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Sair</span>}
          </button>
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex sidebar-link sidebar-link-inactive justify-center"
          title={collapsed ? 'Expandir' : 'Recolher'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )

  return (
    <>
      <div className="hidden lg:flex h-screen sticky top-0 bg-white dark:bg-gray-900 border-r shrink-0 transition-all duration-300">
        {sidebarContent}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          <aside className="fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-900 shadow-2xl animate-slide-in">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}
