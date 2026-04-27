import Badge from './Badge'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger'

type OrderStatus =
  | 'NEW'
  | 'PROCESSING'
  | 'APPROVED'
  | 'PAID'
  | 'DELIVERING'
  | 'RECEIVED'
  | 'COMPLETED'
  | 'REJECTED'
  | 'NEEDS_INFO'

const statusMap: Record<OrderStatus, { variant: BadgeVariant; label: string }> = {
  NEW: { variant: 'warning', label: 'Новая' },
  PROCESSING: { variant: 'default', label: 'В обработке' },
  APPROVED: { variant: 'default', label: 'Согласовано' },
  PAID: { variant: 'success', label: 'Оплачено' },
  DELIVERING: { variant: 'default', label: 'В доставке' },
  RECEIVED: { variant: 'success', label: 'Получено' },
  COMPLETED: { variant: 'success', label: 'Завершено' },
  REJECTED: { variant: 'danger', label: 'Отклонено' },
  NEEDS_INFO: { variant: 'warning', label: 'Нужна информация' },
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const entry = statusMap[status as OrderStatus]
  if (!entry) return null

  return (
    <Badge variant={entry.variant} className={className}>
      {entry.label}
    </Badge>
  )
}
