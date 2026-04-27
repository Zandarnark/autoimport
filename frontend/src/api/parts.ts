import api from './index'

export const partsApi = {
  getAll: (params?: Record<string, string | number>) => api.get('/parts', { params }),
  getById: (id: string) => api.get(`/parts/${id}`),
  create: (data: Record<string, unknown>) => api.post('/parts', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/parts/${id}`, data),
  delete: (id: string) => api.delete(`/parts/${id}`),
}
