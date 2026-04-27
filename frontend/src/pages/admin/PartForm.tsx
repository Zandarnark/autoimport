import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'
import { partsApi } from '../../api/parts'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

const schema = z.object({
  name: z.string().min(1, 'Введите название'),
  category: z.string().min(1, 'Выберите категорию'),
  brand: z.string().min(1, 'Введите бренд'),
  article: z.string().min(1, 'Введите артикул'),
  compatibility: z.string().optional(),
  country: z.string().min(1, 'Введите страну'),
  price: z.coerce.number().min(1, 'Введите цену'),
  inStock: z.boolean().optional(),
  description: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const categoryOptions = [
  { value: 'ENGINE', label: 'Двигатель' },
  { value: 'TRANSMISSION', label: 'Трансмиссия' },
  { value: 'SUSPENSION', label: 'Подвеска' },
  { value: 'BRAKES', label: 'Тормозная система' },
  { value: 'ELECTRICS', label: 'Электрика' },
  { value: 'BODY', label: 'Кузов' },
  { value: 'INTERIOR', label: 'Салон' },
  { value: 'CONSUMABLES', label: 'Расходники' },
  { value: 'COOLING', label: 'Охлаждение' },
  { value: 'EXHAUST', label: 'Выхлопная система' },
  { value: 'STEERING', label: 'Рулевое управление' },
  { value: 'OTHER', label: 'Прочее' },
]

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }

export default function PartForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEdit = !!id
  const [imagesInput, setImagesInput] = useState('')

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: '', category: '', brand: '', article: '', compatibility: '',
      country: '', price: 0, inStock: true, description: '',
    },
  })

  const inStockValue = watch('inStock')

  const { data: part, isLoading: partLoading } = useQuery({
    queryKey: ['part', id],
    queryFn: () => partsApi.getById(id!),
    select: (res: any) => res.data,
    enabled: isEdit,
  })

  useEffect(() => {
    if (part) {
      reset({
        name: part.name ?? '', category: part.category ?? '', brand: part.brand ?? '',
        article: part.article ?? '',
        compatibility: Array.isArray(part.compatibility) ? part.compatibility.join(', ') : (part.compatibility ?? ''),
        country: part.country ?? '', price: part.price ?? 0, inStock: part.inStock ?? true,
        description: part.description ?? '',
      })
      if (part.images?.length > 0) {
        setImagesInput(part.images.join('\n'))
      }
    }
  }, [part, reset])

  const mutationFn = (data: FormData) => {
    const images = imagesInput.split('\n').map((s: string) => s.trim()).filter(Boolean)
    const payload = {
      ...data,
      compatibility: data.compatibility ? data.compatibility.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      images,
    }
    return isEdit ? partsApi.update(id!, payload) : partsApi.create(payload)
  }

  const mutation = useMutation({
    mutationFn,
    onSuccess: () => {
      toast.success(isEdit ? 'Запчасть обновлена' : 'Запчасть создана')
      queryClient.invalidateQueries({ queryKey: ['admin-parts'] })
      navigate('/admin/parts')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Ошибка сохранения')
    },
  })

  const isLoading = partLoading && isEdit
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
      <button onClick={() => navigate('/admin/parts')} className="flex items-center gap-2 text-sm text-muted transition-colors hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Назад к списку
      </button>

      <h1 className="text-2xl font-bold text-primary">
        {isEdit ? 'Редактирование запчасти' : 'Новая запчасть'}
      </h1>

      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="grid gap-6 sm:grid-cols-2">
          <Input label="Название" error={errors.name?.message} {...register('name')} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-primary">Категория</label>
            <select className={selectClass} {...register('category')}>
              <option value="">Выберите</option>
              {categoryOptions.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            {errors.category && <p className="text-xs text-danger">{errors.category.message}</p>}
          </div>
          <Input label="Бренд" error={errors.brand?.message} {...register('brand')} />
          <Input label="Артикул" error={errors.article?.message} {...register('article')} />
          <Input label="Совместимость (через запятую)" placeholder="Toyota Camry, Honda Accord" error={errors.compatibility?.message} {...register('compatibility')} />
          <Input label="Страна" error={errors.country?.message} {...register('country')} />
          <Input label="Цена (₽)" type="number" error={errors.price?.message} {...register('price')} />
          <div className="flex items-center gap-3">
            <input type="checkbox" id="inStock" checked={!!inStockValue} onChange={(e) => setValue('inStock', e.target.checked)} className="h-4 w-4 rounded border-border accent-accent" />
            <label htmlFor="inStock" className="text-sm font-medium text-primary">В наличии</label>
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-sm font-medium text-primary">Описание</label>
            <textarea {...register('description')} rows={4} className="w-full rounded-lg border border-border px-3 py-2 text-sm text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30" placeholder="Описание запчасти..." />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-sm font-medium text-primary">URL изображений (по одному на строку)</label>
            <textarea
              value={imagesInput}
              onChange={(e) => setImagesInput(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
              placeholder={"https://example.com/part1.jpg\nhttps://example.com/part2.jpg"}
            />
          </div>
          <div className="flex gap-3 sm:col-span-2">
            <Button type="submit" loading={mutation.isPending}>{isEdit ? 'Сохранить' : 'Создать'}</Button>
            <Button variant="outline" type="button" onClick={() => navigate('/admin/parts')}>Отмена</Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
