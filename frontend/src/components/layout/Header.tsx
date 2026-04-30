import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Car, User, LogOut, Sun, Moon, ZoomIn } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'
import { useAccessibilityStore, ZOOM_LABEL } from '../../store/accessibilityStore'

const navLinks = [
  { to: '/cars', label: 'Автомобили' },
  { to: '/parts', label: 'Запчасти' },
  { to: '/calculator', label: 'Калькулятор' },
  { to: '/news', label: 'Новости' },
]

function UserAvatar({ user, size = 'sm' }: { user: any; size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm'
  if (user?.avatar) {
    return <img src={user.avatar} alt="" className={`${dim} rounded-full object-cover`} />
  }
  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`
  return (
    <div className={`${dim} flex shrink-0 items-center justify-center rounded-full bg-accent font-bold text-white`}>
      {initials || <User className="h-4 w-4" />}
    </div>
  )
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const { zoom, cycleZoom } = useAccessibilityStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Вы вышли из аккаунта')
    navigate('/')
  }

  const displayName = user?.nickname || `${user?.firstName} ${user?.lastName}`

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="gradient-text flex items-center gap-2 text-xl font-bold">
          <Car className="h-6 w-6" />
          AutoImport
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-muted hover:text-primary transition-colors font-medium"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-muted transition-colors hover:bg-primary/5 hover:text-accent"
            aria-label="Переключить тему"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button
            onClick={cycleZoom}
            className="rounded-lg p-2 text-muted transition-colors hover:bg-primary/5 hover:text-accent"
            aria-label={`Масштаб: ${ZOOM_LABEL[zoom]}`}
            title={`Масштаб: ${ZOOM_LABEL[zoom]}`}
          >
            <ZoomIn className="h-5 w-5" />
          </button>
          {isAuthenticated ? (
            <>
              {user?.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  className="rounded-lg bg-accent px-4 py-1.5 text-sm font-bold text-white transition-colors hover:bg-accent-hover"
                >
                  Админ-панель
                </Link>
              )}
              <Link
                to="/profile"
                className="flex items-center gap-2 text-sm font-medium text-primary hover:text-accent transition-colors"
              >
                <UserAvatar user={user} size="sm" />
                <span className="max-w-[120px] truncate">{displayName}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-surface"
              >
                <LogOut className="h-4 w-4" />
                Выход
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-primary hover:text-accent transition-colors"
              >
                Войти
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
              >
                Регистрация
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-muted transition-colors hover:text-accent"
            aria-label="Переключить тему"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button
            onClick={cycleZoom}
            className="rounded-lg p-2 text-muted transition-colors hover:text-accent"
            aria-label={`Масштаб: ${ZOOM_LABEL[zoom]}`}
            title={`Масштаб: ${ZOOM_LABEL[zoom]}`}
          >
            <ZoomIn className="h-5 w-5" />
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-primary"
            aria-label="Меню"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 z-50 flex h-full w-[min(20rem,85vw)] flex-col gap-4 border-l border-border bg-card p-6 shadow-2xl md:hidden"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="self-end text-muted hover:text-primary"
                aria-label="Закрыть"
              >
                <X className="h-6 w-6" />
              </button>

              {isAuthenticated && (
                <div className="flex items-center gap-3 rounded-lg bg-primary/5 px-3 py-2">
                  <UserAvatar user={user} size="md" />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-primary">{displayName}</p>
                    <p className="truncate text-xs text-muted">{user?.email}</p>
                  </div>
                </div>
              )}

              <nav className="flex flex-col gap-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className="text-lg font-medium text-primary hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <hr className="border-border" />

              {isAuthenticated ? (
                <div className="flex flex-col gap-3">
                  {user?.role === 'ADMIN' && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="rounded-lg bg-accent px-3 py-2 text-center font-bold text-white"
                    >
                      Админ-панель
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 font-medium text-primary"
                  >
                    <User className="h-5 w-5" />
                    Личный кабинет
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                      setMobileOpen(false)
                    }}
                    className="flex items-center gap-2 font-medium text-muted hover:text-primary"
                  >
                    <LogOut className="h-5 w-5" />
                    Выход
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="text-center font-medium text-primary"
                  >
                    Войти
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg bg-accent px-3 py-2 text-center font-medium text-white"
                  >
                    Регистрация
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
