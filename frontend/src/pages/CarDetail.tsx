import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Car, Heart, ShoppingCart, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination as SwiperPagination } from 'swiper/modules'
import 'swiper/css/bundle'
import { carsApi } from '../api/cars'
import { partsApi } from '../api/parts'
import { favoritesApi } from '../api/favorites'
import { useAuthStore } from '../store/authStore'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function CarDetail() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuthStore()

  const { data: car, isLoading } = useQuery({
    queryKey: ['car', id],
    queryFn: () => carsApi.getById(id!),
    select: (res: any) => res.data,
    enabled: !!id,
  })

  const { data: relatedParts } = useQuery({
    queryKey: ['related-parts', car?.brand],
    queryFn: () => partsApi.getAll({ brand: car.brand, limit: 4 }),
    select: (res: any) => res.data?.items ?? res.data ?? [],
    enabled: !!car?.brand,
  })

  const { data: favoritesData } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoritesApi.getAll(),
    select: (res: any) => res.data?.items ?? res.data ?? [],
    enabled: isAuthenticated,
  })

  const favorites: any[] = Array.isArray(favoritesData) ? favoritesData : []
  const existingFav = favorites.find((f: any) => f.itemType === 'car' && f.carId === id)
  const isFavorite = !!existingFav

  const toggleFavoriteMutation = useMutation({
    mutationFn: () => {
      if (isFavorite && existingFav) {
        return favoritesApi.remove(existingFav.id)
      }
      return favoritesApi.add({ itemType: 'car', carId: id })
    },
    onSuccess: () => {
      toast.success(isFavorite ? 'Удалено из избранного' : 'Добавлено в избранное')
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
    },
    onError: () => toast.error('Ошибка'),
  })

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-96 animate-pulse rounded-xl bg-primary/5" />
        <div className="h-10 w-1/2 animate-pulse rounded bg-primary/5" />
        <div className="h-6 w-1/3 animate-pulse rounded bg-primary/5" />
      </div>
    )
  }

  if (!car) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Car className="mb-4 h-16 w-16 text-muted" />
        <h2 className="mb-2 text-xl font-semibold text-primary">Автомобиль не найден</h2>
        <Link to="/cars" className="text-sm text-accent hover:text-accent-hover">
          Вернуться в каталог
        </Link>
      </div>
    )
  }

  const characteristics = [
    { label: 'Тип кузова', value: car.bodyType },
    { label: 'Двигатель', value: car.engineType },
    { label: 'Объём двигателя', value: car.engineVolume ? `${car.engineVolume} л` : null },
    { label: 'Пробег', value: car.mileage ? `${Number(car.mileage).toLocaleString('ru-RU')} км` : null },
    { label: 'Страна', value: car.country },
  ].filter((c) => c.value)

  const parts = Array.isArray(relatedParts) ? relatedParts : []

  return (
    <div className="flex min-w-0 flex-col gap-8 overflow-hidden">
      <nav className="flex min-w-0 items-center gap-2 text-sm text-muted">
        <Link to="/cars" className="transition-colors hover:text-primary">Каталог</Link>
        <ChevronRight className="h-4 w-4 shrink-0" />
        <span className="min-w-0 truncate text-primary">{car.brand} {car.model}</span>
      </nav>

      <div className="grid min-w-0 gap-6 lg:grid-cols-2 lg:gap-8">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="min-w-0">
          {car.images?.length > 0 ? (
            <Swiper
              modules={[Navigation, SwiperPagination]}
              navigation
              pagination={{ clickable: true }}
              className="rounded-xl"
              style={{ width: '100%' }}
            >
              {car.images.map((img: string, i: number) => (
                <SwiperSlide key={i}>
                  <img
                    src={img}
                    alt={`${car.brand} ${car.model} ${i + 1}`}
                    className="h-64 w-full rounded-xl object-cover sm:h-[400px]"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
             <div className="flex h-64 items-center justify-center rounded-xl bg-primary/5 sm:h-[400px]">
              <Car className="h-20 w-20 text-muted" />
            </div>
          )}
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="flex min-w-0 flex-col gap-6"
        >
          <div className="min-w-0">
            <h1 className="mb-2 break-words text-2xl font-bold text-primary sm:text-3xl">
              {car.brand} {car.model}
            </h1>
            <span className="text-lg text-muted">{car.year} г.</span>
          </div>

          <div className="min-w-0 rounded-xl border border-border bg-card p-4">
            <h3 className="mb-3 text-sm font-semibold text-primary">Характеристики</h3>
            <dl className="divide-y divide-border text-sm">
              {characteristics.map((c) => (
                <div key={c.label} className="grid gap-1 py-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:gap-4">
                  <dt className="text-muted">{c.label}</dt>
                  <dd className="min-w-0 break-words font-medium text-primary sm:text-right">{c.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="min-w-0 rounded-xl border border-border bg-card p-4">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <span className="text-sm text-muted">Цена</span>
                <p className="break-words text-2xl font-bold text-accent sm:text-3xl">
                  {Number(car.price).toLocaleString('ru-RU')} ₽
                </p>
              </div>
              {car.country && (
                <Badge variant="default">{car.country}</Badge>
              )}
            </div>
            <div className="flex flex-col gap-3 min-[380px]:flex-row">
              <Link to={`/request?type=car&item=${id}`} className="flex-1">
                <Button size="lg" variant="primary" className="w-full">
                  <ShoppingCart className="h-5 w-5" />
                  Оформить заявку
                </Button>
              </Link>
                {isAuthenticated && (
                  <Button
                    size="lg"
                    variant={isFavorite ? 'danger' : 'outline'}
                    onClick={() => toggleFavoriteMutation.mutate()}
                    loading={toggleFavoriteMutation.isPending}
                  >
                    <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                  </Button>
                )}
            </div>
          </div>
        </motion.div>
      </div>

      {car.description && (
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="min-w-0 rounded-xl border border-border bg-card p-4 sm:p-6"
        >
          <h3 className="mb-3 text-lg font-semibold text-primary">Описание</h3>
          <p className="whitespace-pre-line text-sm leading-relaxed text-muted">
            {car.description}
          </p>
        </motion.div>
      )}

      {parts.length > 0 && (
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
        >
          <h3 className="mb-4 text-lg font-semibold text-primary">Запчасти для {car.brand}</h3>
          <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {parts.map((part: any) => (
              <Link key={part.id} to={`/parts/${part.id}`}>
                <Card className="flex flex-col gap-2">
                  <h4 className="text-sm font-semibold text-primary">{part.name}</h4>
                  {part.article && (
                    <span className="text-xs text-muted">Арт: {part.article}</span>
                  )}
                  <span className="text-base font-bold text-accent">
                    {Number(part.price).toLocaleString('ru-RU')} ₽
                  </span>
                </Card>
              </Link>
            ))}
          </div>
        </motion.section>
      )}
    </div>
  )
}
