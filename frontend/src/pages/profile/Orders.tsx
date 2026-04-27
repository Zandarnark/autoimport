import { useQuery } from '@tanstack/react-query'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, Package, Settings, ShoppingBag } from 'lucide-react'
import { ordersApi } from '../../api/orders'
import Card from '../../components/ui/Card'
import StatusBadge from '../../components/ui/StatusBadge'

const menuItems = [
  { to: '/profile', label: 'Профиль', icon: Settings },
  { to: '/profile/orders', label: 'Мои заявки', icon: Package },
  { to: '/profile/favorites', label: 'Избранное', icon: Heart },
]

export default function Orders() {
  const location = useLocation()

  const { data, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => ordersApi.getAll({ limit: 100 }),
    select: (res: any) => res.data?.items ?? res.data ?? [],
  })

  const orders: any[] = data ?? []

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
        <h1 className="mb-6 text-2xl font-bold text-primary">Мои заявки</h1>

        {isLoading ? (
          <div className="py-8 text-center text-muted">Загрузка...</div>
        ) : orders.length === 0 ? (
          <Card className="flex flex-col items-center py-16 text-center">
            <ShoppingBag className="mb-4 h-12 w-12 text-muted" />
            <p className="mb-2 text-lg font-semibold text-primary">Заявок пока нет</p>
            <p className="text-sm text-muted">Оформите заявку из каталога автомобилей или запчастей</p>
          </Card>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
            className="flex flex-col gap-3"
          >
            {orders.map((order: any) => (
              <motion.div
                key={order.id}
                variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              >
                <Link to={`/profile/orders/${order.id}`}>
                  <Card className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-primary">
                        {order.type === 'CAR' ? 'Автомобиль' : order.type === 'PART' ? 'Запчасть' : 'Произвольная заявка'}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {order.totalPrice != null && (
                        <span className="text-sm font-medium text-accent">
                          {Number(order.totalPrice).toLocaleString('ru-RU')} ₽
                        </span>
                      )}
                      <StatusBadge status={order.status} />
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
