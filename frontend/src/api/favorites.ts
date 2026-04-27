import api from './index'

export const favoritesApi = {
  getAll: () => api.get('/favorites'),
  add: (data: { itemType: string; carId?: string; partId?: string }) =>
    api.post('/favorites', data),
  remove: (id: string) => api.delete(`/favorites/${id}`),
}
