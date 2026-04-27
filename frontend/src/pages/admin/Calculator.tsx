import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Settings, Save, X, Pencil } from 'lucide-react'
import { calculatorApi } from '../../api/calculator'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

interface SettingsRow {
  id: string
  country: string
  dutyRate: number
  logisticsCost: number
  brokerFee: number
  commissionRate: number
}

export default function Calculator() {
  const queryClient = useQueryClient()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<SettingsRow>>({})

  const { data: settings, isLoading } = useQuery({
    queryKey: ['calculator-settings'],
    queryFn: () => calculatorApi.getSettings(),
    select: (res: any) => res.data?.items ?? res.data ?? [],
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      calculatorApi.updateSettings(id, data),
    onSuccess: () => {
      toast.success('Настройки обновлены')
      setEditingId(null)
      setEditValues({})
      queryClient.invalidateQueries({ queryKey: ['calculator-settings'] })
    },
    onError: () => toast.error('Ошибка обновления настроек'),
  })

  const startEdit = (row: SettingsRow) => {
    setEditingId(row.id)
    setEditValues({
      country: row.country,
      dutyRate: row.dutyRate,
      logisticsCost: row.logisticsCost,
      brokerFee: row.brokerFee,
      commissionRate: row.commissionRate,
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditValues({})
  }

  const saveEdit = () => {
    if (!editingId) return
    updateMutation.mutate({ id: editingId, data: editValues })
  }

  const inputClass =
    'w-full rounded-lg border border-border px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30'

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-8 w-64 animate-pulse rounded bg-primary/5" />
        <div className="h-72 animate-pulse rounded-xl bg-primary/5" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-primary">Настройки калькулятора</h1>

      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <Card className="p-0">
          <div className="overflow-x-auto">
            {(!settings || settings.length === 0) ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Settings className="mb-4 h-12 w-12 text-muted" />
                <p className="text-muted">Настройки не найдены</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface">
                    <th className="px-4 py-3 font-medium text-muted">Страна</th>
                    <th className="px-4 py-3 font-medium text-muted">Пошлина (%)</th>
                    <th className="px-4 py-3 font-medium text-muted">Логистика (₽)</th>
                    <th className="px-4 py-3 font-medium text-muted">Брокер (₽)</th>
                    <th className="px-4 py-3 font-medium text-muted">Комиссия (%)</th>
                    <th className="px-4 py-3 font-medium text-muted">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {settings.map((row: SettingsRow) => (
                    <tr key={row.id} className="border-b border-border last:border-0">
                      {editingId === row.id ? (
                        <>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={editValues.country ?? ''}
                              onChange={(e) => setEditValues((prev) => ({ ...prev, country: e.target.value }))}
                              className={inputClass}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              step="0.01"
                              value={editValues.dutyRate ?? 0}
                              onChange={(e) => setEditValues((prev) => ({ ...prev, dutyRate: Number(e.target.value) }))}
                              className={inputClass}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              step="0.01"
                              value={editValues.logisticsCost ?? 0}
                              onChange={(e) => setEditValues((prev) => ({ ...prev, logisticsCost: Number(e.target.value) }))}
                              className={inputClass}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              step="0.01"
                              value={editValues.brokerFee ?? 0}
                              onChange={(e) => setEditValues((prev) => ({ ...prev, brokerFee: Number(e.target.value) }))}
                              className={inputClass}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              step="0.01"
                              value={editValues.commissionRate ?? 0}
                              onChange={(e) => setEditValues((prev) => ({ ...prev, commissionRate: Number(e.target.value) }))}
                              className={inputClass}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={saveEdit}
                                loading={updateMutation.isPending}
                              >
                                <Save className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={cancelEdit}>
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3 font-medium text-primary">{row.country}</td>
                          <td className="px-4 py-3 text-primary">{row.dutyRate}%</td>
                          <td className="px-4 py-3 text-primary">
                            {Number(row.logisticsCost).toLocaleString('ru-RU')} ₽
                          </td>
                          <td className="px-4 py-3 text-primary">
                            {Number(row.brokerFee).toLocaleString('ru-RU')} ₽
                          </td>
                          <td className="px-4 py-3 text-primary">{row.commissionRate}%</td>
                          <td className="px-4 py-3">
                            <Button variant="outline" size="sm" onClick={() => startEdit(row)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
