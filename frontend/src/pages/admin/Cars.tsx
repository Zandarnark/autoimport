import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, Car } from 'lucide-react'
import { carsApi } from '../../api/cars'
import Button from '../../components/ui/Button'
import Pagination from '../../components/ui/Pagination'
import Modal from '../../components/ui/Modal'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function Cars() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-cars', page],
    queryFn: () => carsApi.getAll({ page, limit: 10 }),
    select: (res: any) => ({
      items: res.data?.items ?? res.data ?? [],
      totalPages: res.data?.totalPages ?? 1,
    }),
  })

  const cars = data?.items ?? []
  const totalPages = data?.totalPages ?? 1

  const deleteMutation = useMutation({
    mutationFn: (id: string) => carsApi.delete(id),
    onSuccess: () => {
      toast.success('Автомобиль удалён')
      setDeleteId(null)
      queryClient.invalidateQueries({ queryKey: ['admin-cars'] })
    },
    onError: () => toast.error('Ошибка удаления'),
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Автомобили</h1>
        <Button onClick={() => navigate('/admin/cars/new')}>
          <Plus className="h-4 w-4" />
          Добавить
        </Button>
      </div>

      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          {isLoading ? (
            <div className="p-8 text-center text-muted">Загрузка...</div>
          ) : cars.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Car className="mb-4 h-12 w-12 text-muted" />
              <p className="text-muted">Автомобили не найдены</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="px-4 py-3 font-medium text-muted">Марка</th>
                  <th className="px-4 py-3 font-medium text-muted">Модель</th>
                  <th className="px-4 py-3 font-medium text-muted">Год</th>
                  <th className="px-4 py-3 font-medium text-muted">Цена</th>
                  <th className="px-4 py-3 font-medium text-muted">Страна</th>
                  <th className="px-4 py-3 font-medium text-muted">Действия</th>
                </tr>
              </thead>
              <tbody>
                {cars.map((car: any) => (
                  <tr key={car.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-primary">{car.brand}</td>
                    <td className="px-4 py-3 text-primary">{car.model}</td>
                    <td className="px-4 py-3 text-primary">{car.year}</td>
                    <td className="px-4 py-3 font-medium text-accent">
                      {Number(car.price).toLocaleString('ru-RU')} ₽
                    </td>
                    <td className="px-4 py-3 text-muted">{car.country || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/admin/cars/${car.id}/edit`)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => setDeleteId(car.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Удаление автомобиля">
        <p className="mb-4 text-sm text-muted">Вы уверены, что хотите удалить этот автомобиль?</p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteId(null)}>Отмена</Button>
          <Button
            variant="danger"
            loading={deleteMutation.isPending}
            onClick={() => deleteId && deleteMutation.mutate(deleteId)}
          >
            Удалить
          </Button>
        </div>
      </Modal>
    </div>
  )
}
