import { create } from 'zustand'

interface ThemeStore {
  theme: 'light' | 'dark'
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark') => void
}

const getInitialTheme = (): 'light' | 'dark' => {
  const saved = localStorage.getItem('theme') as 'light' | 'dark' | null
  if (saved) return saved
  return 'dark'
}

const applyTheme = (theme: 'light' | 'dark') => {
  document.documentElement.setAttribute('data-theme', theme)
  if (theme === 'dark') {
    document.body.classList.add('dark')
  } else {
    document.body.classList.remove('dark')
  }
}

applyTheme(getInitialTheme())

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: getInitialTheme(),
  toggleTheme: () => {
    set((state) => {
      const next = state.theme === 'light' ? 'dark' : 'light'
      localStorage.setItem('theme', next)
      applyTheme(next)
      return { theme: next }
    })
  },
  setTheme: (theme) => {
    localStorage.setItem('theme', theme)
    applyTheme(theme)
    set({ theme })
  },
}))
