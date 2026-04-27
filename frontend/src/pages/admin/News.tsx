import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, Newspaper } from 'lucide-react'
import { newsApi } from '../../api/news'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Pagination from '../../components/ui/Pagination'

const schema = z.object({
  title: z.string().min(1, 'Введите заголовок'),
  content: z.string().min(1, 'Введите содержание'),
})

type FormData = z.infer<typeof schema>

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function News() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', content: '' },
  })

  const { data, isLoading } = useQuery({
    queryKey: ['admin-news', page],
    queryFn: () => newsApi.getAll({ page, limit: 10 }),
    select: (res: any) => ({
      items: res.data?.items ?? res.data ?? [],
      totalPages: res.data?.totalPages ?? 1,
    }),
  })

  const { data: _editNewsData } = useQuery({
    queryKey: ['news', editingId],
    queryFn: () => newsApi.getById(editingId!),
    select: (res: any) => res.data,
    enabled: !!editingId,
  })

  const news = data?.items ?? []
  const totalPages = data?.totalPages ?? 1

  const createMutation = useMutation({
    mutationFn: (data: FormData & { image?: File }) => {
      const payload: Record<string, unknown> = { title: data.title, content: data.content }
      if (data.image) payload.image = data.image
      return newsApi.create(payload)
    },
    onSuccess: () => {
      toast.success('Новость создана')
      setModalOpen(false)
      reset()
      setImageFile(null)
      queryClient.invalidateQueries({ queryKey: ['admin-news'] })
    },
    onError: () => toast.error('Ошибка создания'),
  })

  const updateMutation = useMutation({
    mutationFn: (data: FormData & { image?: File }) => {
      const payload: Record<string, unknown> = { title: data.title, content: data.content }
      if (data.image) payload.image = data.image
      return newsApi.update(editingId!, payload)
    },
    onSuccess: () => {
      toast.success('Новость обновлена')
      setModalOpen(false)
      setEditingId(null)
      reset()
      setImageFile(null)
      queryClient.invalidateQueries({ queryKey: ['admin-news'] })
    },
    onError: () => toast.error('Ошибка обновления'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => newsApi.delete(id),
    onSuccess: () => {
      toast.success('Новость удалена')
      setDeleteId(null)
      queryClient.invalidateQueries({ queryKey: ['admin-news'] })
    },
    onError: () => toast.error('Ошибка удаления'),
  })

  const openCreate = () => {
    setEditingId(null)
    reset({ title: '', content: '' })
    setImageFile(null)
    setModalOpen(true)
  }

  const openEdit = (item: any) => {
    setEditingId(item.id)
    reset({ title: item.title ?? '', content: item.content ?? '' })
    setImageFile(null)
    setModalOpen(true)
  }

  const onSubmit = (data: FormData) => {
    const payload = { ...data, image: imageFile ?? undefined }
    if (editingId) updateMutation.mutate(payload)
    else createMutation.mutate(payload)
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Новости</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Добавить
        </Button>
      </div>

      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          {isLoading ? (
            <div className="p-8 text-center text-muted">Загрузка...</div>
          ) : news.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Newspaper className="mb-4 h-12 w-12 text-muted" />
              <p className="text-muted">Новости не найдены</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="px-4 py-3 font-medium text-muted">Заголовок</th>
                  <th className="px-4 py-3 font-medium text-muted">Автор</th>
                  <th className="px-4 py-3 font-medium text-muted">Дата</th>
                  <th className="px-4 py-3 font-medium text-muted">Действия</th>
                </tr>
              </thead>
              <tbody>
                {news.map((item: any) => (
                  <tr key={item.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-primary">{item.title}</td>
                    <td className="px-4 py-3 text-muted">
                      {item.author?.firstName ?? '—'} {item.author?.lastName ?? ''}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {new Date(item.createdAt).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEdit(item)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => setDeleteId(item.id)}>
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

      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingId(null) }}
        title={editingId ? 'Редактирование новости' : 'Новая новость'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="Заголовок" error={errors.title?.message} {...register('title')} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-primary">Содержание</label>
            <textarea
              {...register('content')}
              rows={5}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
              placeholder="Текст новости..."
            />
            {errors.content && <p className="text-xs text-danger">{errors.content.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-primary">Изображение</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) setImageFile(file)
              }}
              className="text-sm text-muted file:mr-4 file:rounded-lg file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-accent-hover"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => { setModalOpen(false); setEditingId(null) }}
            >
              Отмена
            </Button>
            <Button type="submit" loading={isPending}>
              {editingId ? 'Сохранить' : 'Создать'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Удаление новости">
        <p className="mb-4 text-sm text-muted">Вы уверены, что хотите удалить эту новость?</p>
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
