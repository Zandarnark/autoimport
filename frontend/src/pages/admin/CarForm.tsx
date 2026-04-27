import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'
import { carsApi } from '../../api/cars'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

const schema = z.object({
  brand: z.string().min(1, 'Введите марку'),
  model: z.string().min(1, 'Введите модель'),
  year: z.coerce.number().min(1990).max(2030),
  bodyType: z.string().min(1, 'Выберите тип кузова'),
  engineType: z.string().min(1, 'Выберите тип двигателя'),
  engineVolume: z.coerce.number().min(0.1),
  mileage: z.coerce.number().min(0),
  country: z.string().min(1, 'Введите страну'),
  price: z.coerce.number().min(1),
  description: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const bodyTypeOptions = [
  { value: 'SEDAN', label: 'Седан' },
  { value: 'HATCHBACK', label: 'Хэтчбек' },
  { value: 'WAGON', label: 'Универсал' },
  { value: 'SUV', label: 'Кроссовер / Внедорожник' },
  { value: 'MINIVAN', label: 'Минивэн' },
  { value: 'COUPE', label: 'Купе' },
  { value: 'PICKUP', label: 'Пикап' },
  { value: 'CONVERTIBLE', label: 'Кабриолет' },
]

const engineTypeOptions = [
  { value: 'PETROL', label: 'Бензин' },
  { value: 'DIESEL', label: 'Дизель' },
  { value: 'HYBRID', label: 'Гибрид' },
  { value: 'ELECTRIC', label: 'Электро' },
  { value: 'GAS', label: 'Газ' },
]

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }

export default function CarForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEdit = !!id
  const [imagesInput, setImagesInput] = useState('')

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      brand: '', model: '', year: 2024, bodyType: '', engineType: '',
      engineVolume: 2.0, mileage: 0, country: '', price: 0, description: '',
    },
  })

  const { data: car, isLoading: carLoading } = useQuery({
    queryKey: ['car', id],
    queryFn: () => carsApi.getById(id!),
    select: (res: any) => res.data,
    enabled: isEdit,
  })

  useEffect(() => {
    if (car) {
      reset({
        brand: car.brand ?? '', model: car.model ?? '', year: car.year ?? 2024,
        bodyType: car.bodyType ?? '', engineType: car.engineType ?? '',
        engineVolume: car.engineVolume ?? 2.0, mileage: car.mileage ?? 0,
        country: car.country ?? '', price: car.price ?? 0, description: car.description ?? '',
      })
      if (car.images?.length > 0) {
        setImagesInput(car.images.join('\n'))
      }
    }
  }, [car, reset])

  const mutationFn = (data: FormData) => {
    const images = imagesInput.split('\n').map((s: string) => s.trim()).filter(Boolean)
    const payload = { ...data, images }
    return isEdit ? carsApi.update(id!, payload) : carsApi.create(payload)
  }

  const mutation = useMutation({
    mutationFn,
    onSuccess: () => {
      toast.success(isEdit ? 'Автомобиль обновлён' : 'Автомобиль создан')
      queryClient.invalidateQueries({ queryKey: ['admin-cars'] })
      navigate('/admin/cars')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Ошибка сохранения')
    },
  })

  const isLoading = carLoading && isEdit
  const selectClass = 'w-full rounded-lg border border-border px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30'

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-8 w-48 animate-pulse rounded bg-primary/5" />
        <div className="h-96 animate-pulse rounded-xl bg-primary/5" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <button onClick={() => navigate('/admin/cars')} className="flex items-center gap-2 text-sm text-muted transition-colors hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Назад к списку
      </button>

      <h1 className="text-2xl font-bold text-primary">
        {isEdit ? 'Редактирование автомобиля' : 'Новый автомобиль'}
      </h1>

      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="grid gap-6 sm:grid-cols-2">
          <Input label="Марка" error={errors.brand?.message} {...register('brand')} />
          <Input label="Модель" error={errors.model?.message} {...register('model')} />
          <Input label="Год" type="number" error={errors.year?.message} {...register('year')} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-primary">Тип кузова</label>
            <select className={selectClass} {...register('bodyType')}>
              <option value="">Выберите</option>
              {bodyTypeOptions.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            {errors.bodyType && <p className="text-xs text-danger">{errors.bodyType.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-primary">Тип двигателя</label>
            <select className={selectClass} {...register('engineType')}>
              <option value="">Выберите</option>
              {engineTypeOptions.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            {errors.engineType && <p className="text-xs text-danger">{errors.engineType.message}</p>}
          </div>
          <Input label="Объём двигателя (л)" type="number" step="0.1" error={errors.engineVolume?.message} {...register('engineVolume')} />
          <Input label="Пробег (км)" type="number" error={errors.mileage?.message} {...register('mileage')} />
          <Input label="Страна" error={errors.country?.message} {...register('country')} />
          <Input label="Цена (₽)" type="number" error={errors.price?.message} {...register('price')} />
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-sm font-medium text-primary">Описание</label>
            <textarea {...register('description')} rows={4} className="w-full rounded-lg border border-border px-3 py-2 text-sm text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30" placeholder="Описание автомобиля..." />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-sm font-medium text-primary">URL изображений (по одному на строку)</label>
            <textarea
              value={imagesInput}
              onChange={(e) => setImagesInput(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
              placeholder={"https://example.com/car1.jpg\nhttps://example.com/car2.jpg"}
            />
          </div>
          <div className="flex gap-3 sm:col-span-2">
            <Button type="submit" loading={mutation.isPending}>{isEdit ? 'Сохранить' : 'Создать'}</Button>
            <Button variant="outline" type="button" onClick={() => navigate('/admin/cars')}>Отмена</Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
