import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { ArrowLeft, Send, Clock, Package } from 'lucide-react'
import { ordersApi } from '../../api/orders'
import StatusBadge from '../../components/ui/StatusBadge'
import StatusStepper from '../../components/ui/StatusStepper'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const statusOptions = [
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

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [newStatus, setNewStatus] = useState('')
  const [statusComment, setStatusComment] = useState('')
  const [messageText, setMessageText] = useState('')

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.getById(id!),
    select: (res: any) => res.data,
    enabled: !!id,
  })

  const statusMutation = useMutation({
    mutationFn: () => ordersApi.updateStatus(id!, { status: newStatus, comment: statusComment || undefined }),
    onSuccess: () => {
      toast.success('Статус обновлён')
      setNewStatus('')
      setStatusComment('')
      queryClient.invalidateQueries({ queryKey: ['order', id] })
    },
    onError: () => toast.error('Ошибка обновления статуса'),
  })

  const messageMutation = useMutation({
    mutationFn: () => ordersApi.addMessage(id!, messageText),
    onSuccess: () => {
      setMessageText('')
      toast.success('Сообщение отправлено')
      queryClient.invalidateQueries({ queryKey: ['order', id] })
    },
    onError: () => toast.error('Ошибка отправки сообщения'),
  })

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-8 w-48 animate-pulse rounded bg-primary/5" />
        <div className="h-40 animate-pulse rounded-xl bg-primary/5" />
        <div className="h-60 animate-pulse rounded-xl bg-primary/5" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Package className="mb-4 h-16 w-16 text-muted" />
        <h2 className="mb-2 text-xl font-semibold text-primary">Заказ не найден</h2>
        <Link to="/admin/orders" className="text-sm text-accent hover:text-accent-hover">
          Вернуться к заказам
        </Link>
      </div>
    )
  }

  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newStatus) return
    statusMutation.mutate()
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageText.trim()) return
    messageMutation.mutate()
  }

  const selectClass =
    'w-full rounded-lg border border-border px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30'

  return (
    <div className="flex flex-col gap-8">
      <Link
        to="/admin/orders"
        className="flex items-center gap-2 text-sm text-muted transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Назад к заказам
      </Link>

      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="mb-1 text-2xl font-bold text-primary">Заказ #{order.id.slice(0, 8)}</h1>
            <StatusBadge status={order.status} />
          </div>
        </div>
        <Card>
          <StatusStepper currentStatus={order.status} />
        </Card>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <Card>
          <h3 className="mb-4 text-lg font-semibold text-primary">Информация о заказе</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <span className="text-sm text-muted">Тип</span>
              <p className="font-medium text-primary">
                {order.type === 'CAR'
                  ? 'Автомобиль'
                  : order.type === 'PART'
                    ? 'Запчасть'
                    : 'Пользовательский'}
              </p>
            </div>
            {order.car && (
              <div>
                <span className="text-sm text-muted">Автомобиль</span>
                <p className="font-medium text-primary">
                  {order.car.brand} {order.car.model} ({order.car.year})
                </p>
              </div>
            )}
            {order.part && (
              <div>
                <span className="text-sm text-muted">Запчасть</span>
                <p className="font-medium text-primary">{order.part.name}</p>
              </div>
            )}
            {order.customDescription && (
              <div className="sm:col-span-2">
                <span className="text-sm text-muted">Описание</span>
                <p className="font-medium text-primary">{order.customDescription}</p>
              </div>
            )}
            {order.totalPrice != null && (
              <div>
                <span className="text-sm text-muted">Стоимость</span>
                <p className="text-lg font-bold text-accent">
                  {Number(order.totalPrice).toLocaleString('ru-RU')} ₽
                </p>
              </div>
            )}
            {order.deliveryAddress && (
              <div>
                <span className="text-sm text-muted">Адрес доставки</span>
                <p className="font-medium text-primary">{order.deliveryAddress}</p>
              </div>
            )}
          </div>

          <div className="mt-6 border-t border-border pt-6">
            <h4 className="mb-3 text-base font-semibold text-primary">Пользователь</h4>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <span className="text-sm text-muted">Имя</span>
                <p className="font-medium text-primary">
                  {order.user?.firstName ?? '—'} {order.user?.lastName ?? ''}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted">Email</span>
                <p className="font-medium text-primary">{order.user?.email ?? '—'}</p>
              </div>
              <div>
                <span className="text-sm text-muted">Телефон</span>
                <p className="font-medium text-primary">{order.user?.phone ?? '—'}</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <Card>
          <h3 className="mb-4 text-lg font-semibold text-primary">Изменить статус</h3>
          <form onSubmit={handleStatusSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1.5 block text-sm font-medium text-primary">Новый статус</label>
              <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className={selectClass}>
                <option value="">Выберите статус</option>
                {statusOptions.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="mb-1.5 block text-sm font-medium text-primary">Комментарий</label>
              <input
                type="text"
                value={statusComment}
                onChange={(e) => setStatusComment(e.target.value)}
                placeholder="Необязательно"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
            <Button type="submit" disabled={!newStatus} loading={statusMutation.isPending}>
              Изменить статус
            </Button>
          </form>
        </Card>
      </motion.div>

      {order.statusHistory?.length > 0 && (
        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <Card>
            <h3 className="mb-4 text-lg font-semibold text-primary">История статусов</h3>
            <div className="flex flex-col gap-3">
              {order.statusHistory.map((entry: any, i: number) => (
                <div
                  key={entry.id ?? i}
                  className="flex items-center gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <Clock className="h-4 w-4 text-muted" />
                  <div className="flex flex-1 items-center gap-3">
                    <StatusBadge status={entry.status} />
                    <span className="text-sm text-muted">
                      {new Date(entry.createdAt).toLocaleString('ru-RU')}
                    </span>
                  </div>
                  {entry.comment && (
                    <span className="text-sm text-primary">{entry.comment}</span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <Card>
          <h3 className="mb-4 text-lg font-semibold text-primary">Чат</h3>
          {order.messages?.length > 0 ? (
            <div className="mb-4 flex max-h-80 flex-col gap-3 overflow-y-auto">
              {order.messages.map((msg: any) => (
                <div
                  key={msg.id}
                  className={`flex flex-col rounded-lg p-3 ${
                    msg.sender?.role === 'ADMIN'
                      ? 'bg-primary/5 self-start'
                      : 'bg-accent/5 self-end'
                  }`}
                >
                  <span className="mb-1 text-xs font-medium text-muted">
                    {msg.sender?.firstName ?? 'Пользователь'} {msg.sender?.lastName ?? ''}
                    {msg.sender?.role === 'ADMIN' ? ' (менеджер)' : ''}
                  </span>
                  <p className="text-sm text-primary">{msg.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mb-4 text-sm text-muted">Сообщений пока нет</p>
          )}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Введите сообщение..."
              className="flex-1 rounded-lg border border-border px-3 py-2 text-sm text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
            <Button
              type="submit"
              size="md"
              loading={messageMutation.isPending}
              disabled={!messageText.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}
