import api from './index'

export const ordersApi = {
  getAll: (params?: Record<string, string | number>) => api.get('/orders', { params }),
  getById: (id: string) => api.get(`/orders/${id}`),
  create: (data: Record<string, unknown>) => api.post('/orders', data),
  updateStatus: (id: string, data: { status: string; comment?: string }) =>
    api.put(`/orders/${id}/status`, data),
  addMessage: (id: string, text: string) => api.post(`/orders/${id}/messages`, { text }),
  addReview: (id: string, data: { rating: number; text: string }) =>
    api.post(`/orders/${id}/review`, data),
}
