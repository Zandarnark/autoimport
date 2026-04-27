import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { User, Heart, Package, Settings } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { authApi } from '../../api/auth'
import { useAuthStore } from '../../store/authStore'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'

const schema = z.object({
  firstName: z.string().min(1, 'Введите имя'),
  lastName: z.string().min(1, 'Введите фамилию'),
  phone: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const menuItems = [
  { to: '/profile', label: 'Профиль', icon: Settings },
  { to: '/profile/orders', label: 'Мои заявки', icon: Package },
  { to: '/profile/favorites', label: 'Избранное', icon: Heart },
]

export default function Profile() {
  const { user, setUser } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const location = useLocation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      phone: user?.phone ?? '',
    },
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await authApi.updateMe(data)
      const updatedUser = res.data
      setUser(updatedUser)
      toast.success('Профиль обновлён')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Ошибка обновления профиля')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <aside className="flex gap-2 lg:w-56 lg:flex-col lg:gap-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.to
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-accent/10 text-accent'
                  : 'text-muted hover:bg-primary/5 hover:text-primary'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </aside>

      <div className="flex-1">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
            <User className="h-5 w-5 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-primary">Профиль</h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card>
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-white">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div>
                <p className="font-semibold text-primary">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-sm text-muted">{user?.email}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Имя"
                  placeholder="Иван"
                  error={errors.firstName?.message}
                  {...register('firstName')}
                />
                <Input
                  label="Фамилия"
                  placeholder="Иванов"
                  error={errors.lastName?.message}
                  {...register('lastName')}
                />
              </div>
              <Input
                label="Телефон"
                placeholder="+7 (999) 123-45-67"
                error={errors.phone?.message}
                {...register('phone')}
              />
              <Button type="submit" loading={loading} className="self-start">
                Сохранить изменения
              </Button>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
