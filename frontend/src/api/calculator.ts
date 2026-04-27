import api from './index'

export const calculatorApi = {
  getSettings: () => api.get('/calculator/settings'),
  calculate: (data: { country: string; price: number; type: string }) =>
    api.post('/calculator/calculate', data),
  updateSettings: (id: string, data: Record<string, unknown>) =>
    api.put(`/calculator/settings/${id}`, data),
}
