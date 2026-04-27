import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, Wrench } from 'lucide-react'
import { partsApi } from '../../api/parts'
import Button from '../../components/ui/Button'
import Pagination from '../../components/ui/Pagination'
import Modal from '../../components/ui/Modal'
import Badge from '../../components/ui/Badge'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function Parts() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-parts', page],
    queryFn: () => partsApi.getAll({ page, limit: 10 }),
    select: (res: any) => ({
      items: res.data?.items ?? res.data ?? [],
      totalPages: res.data?.totalPages ?? 1,
    }),
  })

  const parts = data?.items ?? []
  const totalPages = data?.totalPages ?? 1

  const deleteMutation = useMutation({
    mutationFn: (id: string) => partsApi.delete(id),
    onSuccess: () => {
      toast.success('Запчасть удалена')
      setDeleteId(null)
      queryClient.invalidateQueries({ queryKey: ['admin-parts'] })
    },
    onError: () => toast.error('Ошибка удаления'),
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Запчасти</h1>
        <Button onClick={() => navigate('/admin/parts/new')}>
          <Plus className="h-4 w-4" />
          Добавить
        </Button>
      </div>

      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          {isLoading ? (
            <div className="p-8 text-center text-muted">Загрузка...</div>
          ) : parts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Wrench className="mb-4 h-12 w-12 text-muted" />
              <p className="text-muted">Запчасти не найдены</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="px-4 py-3 font-medium text-muted">Название</th>
                  <th className="px-4 py-3 font-medium text-muted">Категория</th>
                  <th className="px-4 py-3 font-medium text-muted">Бренд</th>
                  <th className="px-4 py-3 font-medium text-muted">Артикул</th>
                  <th className="px-4 py-3 font-medium text-muted">Цена</th>
                  <th className="px-4 py-3 font-medium text-muted">В наличии</th>
                  <th className="px-4 py-3 font-medium text-muted">Действия</th>
                </tr>
              </thead>
              <tbody>
                {parts.map((part: any) => (
                  <tr key={part.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-primary">{part.name}</td>
                    <td className="px-4 py-3 text-primary">{part.category || '—'}</td>
                    <td className="px-4 py-3 text-primary">{part.brand || '—'}</td>
                    <td className="px-4 py-3 text-muted font-mono text-xs">{part.article || '—'}</td>
                    <td className="px-4 py-3 font-medium text-accent">
                      {Number(part.price).toLocaleString('ru-RU')} ₽
                    </td>
                    <td className="px-4 py-3">
                      {part.inStock ? (
                        <Badge variant="success">Да</Badge>
                      ) : (
                        <Badge variant="danger">Нет</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/admin/parts/${part.id}/edit`)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => setDeleteId(part.id)}>
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

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Удаление запчасти">
        <p className="mb-4 text-sm text-muted">Вы уверены, что хотите удалить эту запчасть?</p>
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
