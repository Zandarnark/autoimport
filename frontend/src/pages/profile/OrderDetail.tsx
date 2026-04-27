import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  ArrowLeft,
  Send,
  Star,
  CreditCard,
  Package,
  Clock,
  MapPin,
} from 'lucide-react'
import { ordersApi } from '../../api/orders'
import StatusStepper from '../../components/ui/StatusStepper'
import StatusBadge from '../../components/ui/StatusBadge'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Card from '../../components/ui/Card'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.getById(id!),
    select: (res: any) => res.data,
    enabled: !!id,
  })

  const [messageText, setMessageText] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewText, setReviewText] = useState('')
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [paid, setPaid] = useState(false)

  const messageMutation = useMutation({
    mutationFn: () => ordersApi.addMessage(id!, messageText),
    onSuccess: () => {
      setMessageText('')
      toast.success('Сообщение отправлено')
      queryClient.invalidateQueries({ queryKey: ['order', id] })
    },
    onError: () => toast.error('Ошибка отправки сообщения'),
  })

  const reviewMutation = useMutation({
    mutationFn: () => ordersApi.addReview(id!, { rating: reviewRating, text: reviewText }),
    onSuccess: () => {
      setReviewText('')
      setReviewRating(5)
      toast.success('Отзыв добавлен')
      queryClient.invalidateQueries({ queryKey: ['order', id] })
    },
    onError: () => toast.error('Ошибка добавления отзыва'),
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
        <Link to="/profile/orders" className="text-sm text-accent hover:text-accent-hover">
          Вернуться к заказам
        </Link>
      </div>
    )
  }

  const displayStatus = paid && order.status === 'APPROVED' ? 'PAID' : order.status

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageText.trim()) return
    messageMutation.mutate()
  }

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault()
    reviewMutation.mutate()
  }

  const handleFakePayment = () => {
    setPaid(true)
    setPaymentModalOpen(false)
    toast.success('Оплата прошла успешно (тестовый режим)')
  }

  return (
    <div className="flex flex-col gap-8">
      <Link
        to="/profile/orders"
        className="flex items-center gap-2 text-sm text-muted transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Назад к заказам
      </Link>

      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="mb-1 text-2xl font-bold text-primary">
              Заказ #{order.id.slice(0, 8)}
            </h1>
            <StatusBadge status={displayStatus} />
          </div>
          {order.status === 'APPROVED' && !paid && (
            <Button variant="primary" onClick={() => setPaymentModalOpen(true)}>
              <CreditCard className="h-4 w-4" />
              Оплатить
            </Button>
          )}
        </div>

        <Card className="mb-6">
          <StatusStepper currentStatus={displayStatus} />
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
                <p className="flex items-center gap-1.5 font-medium text-primary">
                  <MapPin className="h-4 w-4 text-muted" />
                  {order.deliveryAddress}
                </p>
              </div>
            )}
          </div>
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
                    {msg.sender?.firstName ?? 'Пользователь'}{' '}
                    {msg.sender?.lastName ?? ''}
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

      {order.status === 'COMPLETED' && !order.review && (
        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <Card>
            <h3 className="mb-4 text-lg font-semibold text-primary">Оставить отзыв</h3>
            <form onSubmit={handleSubmitReview} className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-primary">
                  Оценка
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-7 w-7 ${
                          star <= reviewRating
                            ? 'fill-accent text-accent'
                            : 'text-border'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-primary">
                  Комментарий
                </label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Поделитесь впечатлениями..."
                  rows={3}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>
              <Button
                type="submit"
                loading={reviewMutation.isPending}
                disabled={!reviewText.trim()}
              >
                Отправить отзыв
              </Button>
            </form>
          </Card>
        </motion.div>
      )}

      {order.review && (
        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <Card>
            <h3 className="mb-4 text-lg font-semibold text-primary">Отзыв</h3>
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= order.review.rating
                      ? 'fill-accent text-accent'
                      : 'text-border'
                  }`}
                />
              ))}
            </div>
            {order.review.text && (
              <p className="text-sm text-primary">{order.review.text}</p>
            )}
          </Card>
        </motion.div>
      )}

      <Modal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title="Оплата"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleFakePayment()
          }}
          className="flex flex-col gap-4"
        >
          <Input
            label="Номер карты"
            placeholder="0000 0000 0000 0000"
            maxLength={19}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Срок действия" placeholder="MM/YY" maxLength={5} />
            <Input label="CVV" placeholder="000" maxLength={3} type="password" />
          </div>
          <div className="rounded-lg bg-accent/10 px-3 py-2 text-center text-xs text-muted">
            Демо-режим. Реальная оплата не производится.
          </div>
          <Button type="submit" size="lg" className="w-full">
            <CreditCard className="h-4 w-4" />
            Оплатить
          </Button>
        </form>
      </Modal>
    </div>
  )
}
