import api from './index'

export const carsApi = {
  getAll: (params?: Record<string, string | number>) => api.get('/cars', { params }),
  getById: (id: string) => api.get(`/cars/${id}`),
  create: (data: Record<string, unknown>) => api.post('/cars', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/cars/${id}`, data),
  delete: (id: string) => api.delete(`/cars/${id}`),
}
