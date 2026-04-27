import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Package, Users, DollarSign, TrendingUp, Car, Wrench, Newspaper, Calculator } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ordersApi } from '../../api/orders'
import { usersApi } from '../../api/users'
import Card from '../../components/ui/Card'
import StatusBadge from '../../components/ui/StatusBadge'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const statusLabels: Record<string, string> = {
  NEW: 'Новая',
  PROCESSING: 'В обработке',
  APPROVED: 'Согласовано',
  PAID: 'Оплачено',
  DELIVERING: 'В доставке',
  RECEIVED: 'Получено',
  COMPLETED: 'Завершено',
  REJECTED: 'Отклонено',
  NEEDS_INFO: 'Нужна инфо',
}

const adminMenu = [
  { to: '/admin/cars', label: 'Автомобили', icon: Car, desc: 'CRUD каталог автомобилей' },
  { to: '/admin/parts', label: 'Запчасти', icon: Wrench, desc: 'CRUD каталог запчастей' },
  { to: '/admin/orders', label: 'Заявки', icon: Package, desc: 'Управление заявками' },
  { to: '/admin/users', label: 'Пользователи', icon: Users, desc: 'Управление ролями' },
  { to: '/admin/news', label: 'Новости', icon: Newspaper, desc: 'Управление новостями' },
  { to: '/admin/calculator', label: 'Калькулятор', icon: Calculator, desc: 'Настройки тарифов' },
]

export default function Dashboard() {
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => ordersApi.getAll({ limit: 1000 }),
    select: (res: any) => res.data?.items ?? res.data ?? [],
  })

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => usersApi.getAll({ limit: 1000 }),
    select: (res: any) => res.data?.items ?? res.data ?? [],
  })

  const orders: any[] = ordersData ?? []
  const users: any[] = usersData ?? []

  const totalOrders = orders.length
  const newOrders = orders.filter((o: any) => o.status === 'NEW').length
  const totalUsers = users.length
  const totalRevenue = orders
    .filter((o: any) => o.status === 'PAID' || o.status === 'COMPLETED')
    .reduce((sum: number, o: any) => sum + (Number(o.totalPrice) || 0), 0)

  const statusCounts: Record<string, number> = {}
  orders.forEach((o: any) => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1
  })
  const chartData = Object.entries(statusCounts).map(([status, count]) => ({
    status: statusLabels[status] || status,
    count,
  }))

  const recentOrders = [...orders]
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const stats = [
    { label: 'Всего заказов', value: totalOrders, icon: Package, color: 'bg-accent/10 text-accent' },
    { label: 'Новые заказы', value: newOrders, icon: TrendingUp, color: 'bg-success/10 text-success' },
    { label: 'Пользователи', value: totalUsers, icon: Users, color: 'bg-primary/10 text-primary' },
    {
      label: 'Выручка',
      value: `${totalRevenue.toLocaleString('ru-RU')} ₽`,
      icon: DollarSign,
      color: 'bg-accent/10 text-accent',
    },
  ]

  if (ordersLoading || usersLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-8 w-64 animate-pulse rounded bg-primary/5" />
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-primary/5" />
          ))}
        </div>
        <div className="h-72 animate-pulse rounded-xl bg-primary/5" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-primary">Панель администратора</h1>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {adminMenu.map((item) => (
          <motion.div key={item.to} variants={fadeUp}>
            <Link to={item.to}>
              <Card className="flex items-center gap-4 transition-shadow hover:shadow-lg">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent/10">
                  <item.icon className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-primary">{item.label}</p>
                  <p className="text-xs text-muted">{item.desc}</p>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
        className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4"
      >
        {stats.map((stat) => (
          <motion.div key={stat.label} variants={fadeUp}>
            <Card>
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted">{stat.label}</p>
                  <p className="text-xl font-bold text-primary">{stat.value}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <Card>
          <h3 className="mb-4 text-lg font-semibold text-primary">Заказы по статусам</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="status" tick={{ fontSize: 12, fill: '#94A3B8' }} />
                <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #334155',
                    background: '#1E293B',
                    color: '#E2E8F0',
                  }}
                />
                <Bar dataKey="count" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <Card>
          <h3 className="mb-4 text-lg font-semibold text-primary">Последние заказы</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 font-medium text-muted">ID</th>
                  <th className="pb-3 font-medium text-muted">Пользователь</th>
                  <th className="pb-3 font-medium text-muted">Тип</th>
                  <th className="pb-3 font-medium text-muted">Статус</th>
                  <th className="pb-3 font-medium text-muted">Сумма</th>
                  <th className="pb-3 font-medium text-muted">Дата</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order: any) => (
                  <tr key={order.id} className="border-b border-border last:border-0">
                    <td className="py-3 font-medium text-primary">{order.id.slice(0, 8)}</td>
                    <td className="py-3 text-primary">
                      {order.user?.firstName ?? '—'} {order.user?.lastName ?? ''}
                    </td>
                    <td className="py-3 text-primary">
                      {order.type === 'CAR' ? 'Авто' : order.type === 'PART' ? 'Запчасть' : 'Прочее'}
                    </td>
                    <td className="py-3"><StatusBadge status={order.status} /></td>
                    <td className="py-3 font-medium text-primary">
                      {order.totalPrice != null ? `${Number(order.totalPrice).toLocaleString('ru-RU')} ₽` : '—'}
                    </td>
                    <td className="py-3 text-muted">
                      {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
