import api from './index'

export const usersApi = {
  getAll: (params?: Record<string, string | number>) => api.get('/users', { params }),
  changeRole: (id: string, role: string) => api.put(`/users/${id}/role`, { role }),
  toggleBlock: (id: string) => api.put(`/users/${id}/block`),
}
