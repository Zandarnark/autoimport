import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { UserPlus } from 'lucide-react'
import { authApi } from '../api/auth'
import { useAuthStore, type AuthStore } from '../store/authStore'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

const schema = z
  .object({
    firstName: z.string().min(1, 'Введите имя'),
    lastName: z.string().min(1, 'Введите фамилию'),
    email: z.string().min(1, 'Введите email').email('Некорректный email'),
    password: z.string().min(6, 'Минимум 6 символов'),
    confirmPassword: z.string().min(1, 'Подтвердите пароль'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

export default function Register() {
  const navigate = useNavigate()
  const login = useAuthStore((s: AuthStore) => s.login)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      await authApi.register({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      })
      const loginRes = await authApi.login({
        email: data.email,
        password: data.password,
      })
      const { user, token } = loginRes.data
      login(user, token)
      toast.success('Регистрация успешна')
      navigate('/')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Ошибка регистрации')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-md"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
            <UserPlus className="h-5 w-5 text-accent" />
          </div>
          <h1 className="text-xl font-bold text-primary">Регистрация</h1>
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
            label="Email"
            type="email"
            placeholder="email@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Пароль"
            type="password"
            placeholder="Минимум 6 символов"
            error={errors.password?.message}
            {...register('password')}
          />
          <Input
            label="Подтверждение пароля"
            type="password"
            placeholder="Повторите пароль"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <Button type="submit" size="lg" className="w-full" loading={loading}>
            Зарегистрироваться
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="font-medium text-accent hover:text-accent-hover">
            Войти
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
