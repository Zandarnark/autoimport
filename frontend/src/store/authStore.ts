import { create } from 'zustand'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string | null
  role: 'GUEST' | 'USER' | 'ADMIN'
}

export interface AuthStore {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setUser: (user: User) => void
  setToken: (token: string) => void
  login: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user))
    set({ user })
  },
  setToken: (token) => {
    localStorage.setItem('token', token)
    set({ token, isAuthenticated: true })
  },
  login: (user, token) => {
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('token', token)
    set({ user, token, isAuthenticated: true })
  },
  logout: () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    set({ user: null, token: null, isAuthenticated: false })
  },
}))
