import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Shield, ShieldOff, Users as UsersIcon } from 'lucide-react'
import { usersApi } from '../../api/users'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Pagination from '../../components/ui/Pagination'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const roleOptions = [
  { value: 'USER', label: 'Пользователь' },
  { value: 'ADMIN', label: 'Администратор' },
]

export default function Users() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [roleChanges, setRoleChanges] = useState<Record<string, string>>({})

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page],
    queryFn: () => usersApi.getAll({ page, limit: 10 }),
    select: (res: any) => ({
      items: res.data?.items ?? res.data ?? [],
      totalPages: res.data?.totalPages ?? 1,
    }),
  })

  const users = data?.items ?? []
  const totalPages = data?.totalPages ?? 1

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => usersApi.changeRole(id, role),
    onSuccess: () => {
      toast.success('Роль изменена')
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: () => toast.error('Ошибка изменения роли'),
  })

  const blockMutation = useMutation({
    mutationFn: (id: string) => usersApi.toggleBlock(id),
    onSuccess: () => {
      toast.success('Статус изменён')
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: () => toast.error('Ошибка изменения статуса'),
  })

  const selectClass =
    'rounded-lg border border-border px-2 py-1.5 text-sm text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30'

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-primary">Пользователи</h1>

      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          {isLoading ? (
            <div className="p-8 text-center text-muted">Загрузка...</div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <UsersIcon className="mb-4 h-12 w-12 text-muted" />
              <p className="text-muted">Пользователи не найдены</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="px-4 py-3 font-medium text-muted">Email</th>
                  <th className="px-4 py-3 font-medium text-muted">Имя</th>
                  <th className="px-4 py-3 font-medium text-muted">Роль</th>
                  <th className="px-4 py-3 font-medium text-muted">Статус</th>
                  <th className="px-4 py-3 font-medium text-muted">Действия</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: any) => (
                  <tr key={user.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-primary">{user.email}</td>
                    <td className="px-4 py-3 text-primary">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={roleChanges[user.id] ?? user.role}
                        onChange={(e) => {
                          setRoleChanges((prev) => ({ ...prev, [user.id]: e.target.value }))
                          roleMutation.mutate({ id: user.id, role: e.target.value })
                        }}
                        className={selectClass}
                        disabled={roleMutation.isPending}
                      >
                        {roleOptions.map((r) => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {user.blocked ? (
                        <Badge variant="danger">Заблокирован</Badge>
                      ) : (
                        <Badge variant="success">Активен</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant={user.blocked ? 'primary' : 'danger'}
                        size="sm"
                        onClick={() => blockMutation.mutate(user.id)}
                        loading={blockMutation.isPending}
                      >
                        {user.blocked ? (
                          <>
                            <Shield className="h-3.5 w-3.5" />
                            Разблокировать
                          </>
                        ) : (
                          <>
                            <ShieldOff className="h-3.5 w-3.5" />
                            Заблокировать
                          </>
                        )}
                      </Button>
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
