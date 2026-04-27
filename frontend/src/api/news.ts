import api from './index'

export const newsApi = {
  getAll: (params?: Record<string, string | number>) => api.get('/news', { params }),
  getById: (id: string) => api.get(`/news/${id}`),
  create: (data: Record<string, unknown>) => api.post('/news', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/news/${id}`, data),
  delete: (id: string) => api.delete(`/news/${id}`),
}
