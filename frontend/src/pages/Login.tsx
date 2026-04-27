import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { LogIn } from 'lucide-react'
import { authApi } from '../api/auth'
import { useAuthStore, type AuthStore } from '../store/authStore'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

const schema = z.object({
  email: z.string().min(1, 'Введите email').email('Некорректный email'),
  password: z.string().min(1, 'Введите пароль'),
})

type FormData = z.infer<typeof schema>

export default function Login() {
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
      const res = await authApi.login(data)
      const { user, token } = res.data
      login(user, token)
      toast.success('Вход выполнен')
      navigate('/')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Ошибка входа')
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
            <LogIn className="h-5 w-5 text-accent" />
          </div>
          <h1 className="text-xl font-bold text-primary">Вход</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
            placeholder="Введите пароль"
            error={errors.password?.message}
            {...register('password')}
          />
          <Button type="submit" size="lg" className="w-full" loading={loading}>
            Войти
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Нет аккаунта?{' '}
          <Link to="/register" className="font-medium text-accent hover:text-accent-hover">
            Зарегистрироваться
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
