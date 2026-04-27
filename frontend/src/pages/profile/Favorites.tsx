import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Heart, Car, Package, Trash2, Settings } from 'lucide-react'
import { favoritesApi } from '../../api/favorites'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

const menuItems = [
  { to: '/profile', label: 'Профиль', icon: Settings },
  { to: '/profile/orders', label: 'Мои заявки', icon: Package },
  { to: '/profile/favorites', label: 'Избранное', icon: Heart },
]

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

export default function Favorites() {
  const queryClient = useQueryClient()
  const location = useLocation()

  const { data, isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoritesApi.getAll(),
    select: (res: any) => res.data?.items ?? res.data ?? [],
  })

  const favorites = Array.isArray(data) ? data : []

  const removeMutation = useMutation({
    mutationFn: (favId: string) => favoritesApi.remove(favId),
    onSuccess: () => {
      toast.success('Удалено из избранного')
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
    },
    onError: () => toast.error('Ошибка удаления'),
  })

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
        <h1 className="mb-6 text-2xl font-bold text-primary">Избранное</h1>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-56 animate-pulse rounded-xl bg-primary/5" />
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Heart className="mb-4 h-16 w-16 text-muted" />
            <h3 className="mb-2 text-lg font-semibold text-primary">Избранное пусто</h3>
            <p className="mb-6 text-sm text-muted">
              Добавляйте автомобили и запчасти в избранное
            </p>
            <div className="flex gap-3">
              <Link to="/cars">
                <Button variant="primary">Автомобили</Button>
              </Link>
              <Link to="/parts">
                <Button variant="outline">Запчасти</Button>
              </Link>
            </div>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {favorites.map((fav: any) => {
              const isCar = fav.itemType === 'car'
              const item = fav.car || fav.part
              const detailPath = isCar ? `/cars/${item?.id}` : `/parts/${item?.id}`

              return (
                <motion.div key={fav.id} variants={fadeUp}>
                  <Card className="flex h-full flex-col overflow-hidden p-0">
                    {item ? (
                      <Link to={detailPath} className="flex flex-1 flex-col">
                        {item.images?.length > 0 ? (
                          <img
                            src={item.images[0]}
                            alt={isCar ? `${item.brand} ${item.model}` : item.name}
                            className="h-44 w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-44 w-full items-center justify-center bg-primary/5">
                            {isCar ? (
                              <Car className="h-10 w-10 text-muted" />
                            ) : (
                              <Package className="h-10 w-10 text-muted" />
                            )}
                          </div>
                        )}
                        <div className="flex flex-1 flex-col gap-1.5 p-4">
                          <h3 className="text-base font-semibold text-primary">
                            {isCar
                              ? `${item.brand} ${item.model}`
                              : item.name}
                          </h3>
                          {isCar && (
                            <span className="text-sm text-muted">
                              {item.year} г.
                            </span>
                          )}
                          <span className="mt-auto text-lg font-bold text-accent">
                            {Number(item.price).toLocaleString('ru-RU')} ₽
                          </span>
                        </div>
                      </Link>
                    ) : (
                      <div className="flex flex-1 flex-col items-center justify-center p-4">
                        <span className="text-sm text-muted">Элемент удалён</span>
                      </div>
                    )}
                    <div className="border-t border-border px-4 py-3">
                      <Button
                        variant="danger"
                        size="sm"
                        className="w-full"
                        onClick={() => removeMutation.mutate(fav.id)}
                        loading={removeMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                        Удалить
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </div>
    </div>
  )
}
