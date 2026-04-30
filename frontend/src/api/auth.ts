import api from './index'

export const authApi = {
  register: (data: { email: string; password: string; firstName: string; lastName: string; nickname?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateMe: (data: { firstName?: string; lastName?: string; nickname?: string; phone?: string }) =>
    api.put('/auth/me', data),
  uploadAvatar: (file: File) => {
    const formData = new FormData()
    formData.append('image', file)
    return api.post('/upload/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  setAvatar: (avatar: string) =>
    api.put('/auth/me/avatar', { avatar }),
}
