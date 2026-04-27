import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Package, Heart, ShoppingCart, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { partsApi } from '../api/parts'
import { favoritesApi } from '../api/favorites'
import { useAuthStore } from '../store/authStore'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function PartDetail() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuthStore()

  const { data: part, isLoading } = useQuery({
    queryKey: ['part', id],
    queryFn: () => partsApi.getById(id!),
    select: (res: any) => res.data,
    enabled: !!id,
  })

  const { data: favoritesData } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoritesApi.getAll(),
    select: (res: any) => res.data?.items ?? res.data ?? [],
    enabled: isAuthenticated,
  })

  const favorites: any[] = Array.isArray(favoritesData) ? favoritesData : []
  const existingFav = favorites.find((f: any) => f.itemType === 'part' && f.partId === id)
  const isFavorite = !!existingFav

  const toggleFavoriteMutation = useMutation({
    mutationFn: () => {
      if (isFavorite && existingFav) {
        return favoritesApi.remove(existingFav.id)
      }
      return favoritesApi.add({ itemType: 'part', partId: id })
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
        <div className="h-72 animate-pulse rounded-xl bg-primary/5" />
        <div className="h-10 w-1/2 animate-pulse rounded bg-primary/5" />
        <div className="h-6 w-1/3 animate-pulse rounded bg-primary/5" />
      </div>
    )
  }

  if (!part) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Package className="mb-4 h-16 w-16 text-muted" />
        <h2 className="mb-2 text-xl font-semibold text-primary">Запчасть не найдена</h2>
        <Link to="/parts" className="text-sm text-accent hover:text-accent-hover">
          Вернуться в каталог
        </Link>
      </div>
    )
  }

  const compatibilityList = Array.isArray(part.compatibility) ? part.compatibility : []

  return (
    <div className="flex flex-col gap-8">
      <nav className="flex items-center gap-2 text-sm text-muted">
        <Link to="/parts" className="transition-colors hover:text-primary">Запчасти</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-primary">{part.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          {part.images?.length > 0 ? (
            <img
              src={part.images[0]}
              alt={part.name}
              className="h-[400px] w-full rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-[400px] items-center justify-center rounded-xl bg-primary/5">
              <Package className="h-20 w-20 text-muted" />
            </div>
          )}
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="flex flex-col gap-6"
        >
          <div>
            <h1 className="mb-2 text-3xl font-bold text-primary">{part.name}</h1>
            <div className="flex flex-wrap items-center gap-2">
              {part.category && <Badge variant="default">{part.category}</Badge>}
              {part.article && (
                <span className="text-sm text-muted">Арт: {part.article}</span>
              )}
            </div>
          </div>

          {compatibilityList.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="mb-3 text-sm font-semibold text-primary">Совместимость</h3>
              <div className="flex flex-wrap gap-2">
                {compatibilityList.map((item: string, i: number) => (
                  <Badge key={i} variant="default" className="bg-primary/10 text-primary">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <span className="text-sm text-muted">Цена</span>
                <p className="text-3xl font-bold text-accent">
                  {Number(part.price).toLocaleString('ru-RU')} ₽
                </p>
              </div>
              {part.inStock ? (
                <Badge variant="success">В наличии</Badge>
              ) : (
                <Badge variant="danger">Нет в наличии</Badge>
              )}
            </div>
            <div className="flex gap-3">
              <Link to={`/request?type=part&item=${id}`} className="flex-1">
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

      {part.description && (
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="mb-3 text-lg font-semibold text-primary">Описание</h3>
          <p className="whitespace-pre-line text-sm leading-relaxed text-muted">
            {part.description}
          </p>
        </motion.div>
      )}
    </div>
  )
}
