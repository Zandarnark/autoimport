import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Package } from 'lucide-react'
import { ordersApi } from '../../api/orders'
import StatusBadge from '../../components/ui/StatusBadge'
import Pagination from '../../components/ui/Pagination'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const statuses = [
  { value: '', label: 'Все статусы' },
  { value: 'NEW', label: 'Новая' },
  { value: 'PROCESSING', label: 'В обработке' },
  { value: 'APPROVED', label: 'Согласовано' },
  { value: 'PAID', label: 'Оплачено' },
  { value: 'DELIVERING', label: 'В доставке' },
  { value: 'RECEIVED', label: 'Получено' },
  { value: 'COMPLETED', label: 'Завершено' },
  { value: 'REJECTED', label: 'Отклонено' },
  { value: 'NEEDS_INFO', label: 'Нужна информация' },
]

export default function Orders() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')

  const queryParams: Record<string, string | number> = { page, limit: 10 }
  if (statusFilter) queryParams.status = statusFilter

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', queryParams],
    queryFn: () => ordersApi.getAll(queryParams),
    select: (res: any) => ({
      items: res.data?.items ?? res.data ?? [],
      totalPages: res.data?.totalPages ?? 1,
    }),
  })

  const orders = data?.items ?? []
  const totalPages = data?.totalPages ?? 1

  const selectClass =
    'rounded-lg border border-border px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30'

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Заказы</h1>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className={selectClass}
        >
          {statuses.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          {isLoading ? (
            <div className="p-8 text-center text-muted">Загрузка...</div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Package className="mb-4 h-12 w-12 text-muted" />
              <p className="text-muted">Заказы не найдены</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="px-4 py-3 font-medium text-muted">ID</th>
                  <th className="px-4 py-3 font-medium text-muted">Пользователь</th>
                  <th className="px-4 py-3 font-medium text-muted">Тип</th>
                  <th className="px-4 py-3 font-medium text-muted">Статус</th>
                  <th className="px-4 py-3 font-medium text-muted">Сумма</th>
                  <th className="px-4 py-3 font-medium text-muted">Дата</th>
                  <th className="px-4 py-3 font-medium text-muted">Действия</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order: any) => (
                  <tr key={order.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-primary">{order.id.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-primary">
                      {order.user?.firstName ?? '—'} {order.user?.lastName ?? ''}
                    </td>
                    <td className="px-4 py-3 text-primary">
                      {order.type === 'CAR' ? 'Авто' : order.type === 'PART' ? 'Запчасть' : 'Прочее'}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                    <td className="px-4 py-3 font-medium text-primary">
                      {order.totalPrice != null
                        ? `${Number(order.totalPrice).toLocaleString('ru-RU')} ₽`
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => navigate(`/admin/orders/${order.id}`)}
                        className="text-sm font-medium text-accent transition-colors hover:text-accent-hover"
                      >
                        Открыть
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
