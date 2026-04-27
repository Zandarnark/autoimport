import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod/v4'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Send } from 'lucide-react'
import toast from 'react-hot-toast'
import { ordersApi } from '../api/orders'
import { carsApi } from '../api/cars'
import { partsApi } from '../api/parts'
import { useAuthStore } from '../store/authStore'
import Button from '../components/ui/Button'

const requestSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  phone: z.string().min(10, 'Введите корректный номер телефона'),
  email: z.email('Введите корректный email'),
  description: z.string().min(10, 'Опишите ваш запрос подробнее (минимум 10 символов)'),
  type: z.enum(['car', 'part', 'custom']),
})

type RequestForm = z.infer<typeof requestSchema>

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function Request() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, isAuthenticated } = useAuthStore()
  const [submitting, setSubmitting] = useState(false)

  const itemType = searchParams.get('type') || 'custom'
  const itemId = searchParams.get('item')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RequestForm>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      name: isAuthenticated ? `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() : '',
      email: isAuthenticated ? user?.email ?? '' : '',
      phone: isAuthenticated ? user?.phone ?? '' : '',
      type: itemType === 'car' ? 'car' : itemType === 'part' ? 'part' : 'custom',
      description: '',
    },
  })

  useEffect(() => {
    const fetchItem = async () => {
      if (!itemId) return
      try {
        let itemData: any = null
        if (itemType === 'car') {
          const res = await carsApi.getById(itemId)
          itemData = res.data
          if (itemData) {
            reset({
              name: isAuthenticated ? `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() : '',
              email: isAuthenticated ? user?.email ?? '' : '',
              phone: isAuthenticated ? user?.phone ?? '' : '',
              type: 'car',
              description: `${itemData.brand} ${itemData.model}, ${itemData.year} г.\nТип кузова: ${itemData.bodyType}\nДвигатель: ${itemData.engineType}, ${itemData.engineVolume} л\nПробег: ${Number(itemData.mileage).toLocaleString('ru-RU')} км\nСтрана: ${itemData.country}\nЦена: ${Number(itemData.price).toLocaleString('ru-RU')} ₽\n\n${itemData.description || ''}`.trim(),
            })
          }
        } else if (itemType === 'part') {
          const res = await partsApi.getById(itemId)
          itemData = res.data
          if (itemData) {
            reset({
              name: isAuthenticated ? `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() : '',
              email: isAuthenticated ? user?.email ?? '' : '',
              phone: isAuthenticated ? user?.phone ?? '' : '',
              type: 'part',
              description: `${itemData.name}\nАртикул: ${itemData.article}\nБренд: ${itemData.brand}\nКатегория: ${itemData.category}\nСтрана: ${itemData.country}\nЦена: ${Number(itemData.price).toLocaleString('ru-RU')} ₽\n\n${itemData.description || ''}`.trim(),
            })
          }
        }
      } catch {
        // ignore — user can fill manually
      }
    }
    fetchItem()
  }, [itemId, itemType])

  const onSubmit = async (data: RequestForm) => {
    setSubmitting(true)
    try {
      await ordersApi.create({
        type: 'CUSTOM',
        customerName: data.name,
        customerPhone: data.phone,
        customerEmail: data.email,
        description: data.description,
        itemType: data.type,
      })
      toast.success('Заявка успешно отправлена')
      navigate('/profile/orders')
    } catch {
      toast.error('Ошибка отправки заявки')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary">Оставить заявку</h1>
          <p className="mt-1 text-sm text-muted">
            {itemId
              ? 'Данные товара автоматически заполнены. Дополните заявку при необходимости'
              : 'Не нашли нужное? Опишите ваш запрос, и мы вам поможем'}
          </p>
        </div>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="rounded-xl border border-border bg-card p-6"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-primary">Ваше имя</label>
            <input
              {...register('name')}
              className={`w-full rounded-lg border px-3 py-2 text-sm text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 ${
                errors.name ? 'border-danger focus:border-danger focus:ring-danger/30' : 'border-border'
              }`}
              placeholder="Иван Иванов"
            />
            {errors.name && <p className="mt-1 text-xs text-danger">{errors.name.message}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-primary">Телефон</label>
            <input
              {...register('phone')}
              className={`w-full rounded-lg border px-3 py-2 text-sm text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 ${
                errors.phone ? 'border-danger focus:border-danger focus:ring-danger/30' : 'border-border'
              }`}
              placeholder="+7 (999) 123-45-67"
            />
            {errors.phone && <p className="mt-1 text-xs text-danger">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-primary">Email</label>
            <input
              {...register('email')}
              type="email"
              className={`w-full rounded-lg border px-3 py-2 text-sm text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 ${
                errors.email ? 'border-danger focus:border-danger focus:ring-danger/30' : 'border-border'
              }`}
              placeholder="example@mail.ru"
            />
            {errors.email && <p className="mt-1 text-xs text-danger">{errors.email.message}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-primary">Тип заявки</label>
            <select
              {...register('type')}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              <option value="car">Автомобиль</option>
              <option value="part">Запчасть</option>
              <option value="custom">Другое</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-primary">Описание</label>
            <textarea
              {...register('description')}
              rows={6}
              className={`w-full resize-none rounded-lg border px-3 py-2 text-sm text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 ${
                errors.description ? 'border-danger focus:border-danger focus:ring-danger/30' : 'border-border'
              }`}
              placeholder="Опишите, что вы ищете: марка, модель, год, характеристики..."
            />
            {errors.description && <p className="mt-1 text-xs text-danger">{errors.description.message}</p>}
          </div>

          <Button
            type="submit"
            size="lg"
            variant="primary"
            className="w-full"
            loading={submitting}
          >
            <Send className="h-5 w-5" />
            Отправить заявку
          </Button>
        </form>
      </motion.div>
    </div>
  )
}
