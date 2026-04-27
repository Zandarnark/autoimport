import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Calculator as CalculatorIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { calculatorApi } from '../api/calculator'
import Button from '../components/ui/Button'

interface CalculationRow {
  label: string
  value: number
}

interface CalculationResult {
  items: CalculationRow[]
  total: number
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const rowVariant = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
}

export default function Calculator() {
  const [country, setCountry] = useState('')
  const [price, setPrice] = useState('')
  const [type, setType] = useState('car')
  const [result, setResult] = useState<CalculationResult | null>(null)

  const { data: settingsData } = useQuery({
    queryKey: ['calculator-settings'],
    queryFn: () => calculatorApi.getSettings(),
    select: (res: any) => res.data,
  })

  const settings: any[] = Array.isArray(settingsData) ? settingsData : []

  const calculateMutation = useMutation({
    mutationFn: () =>
      calculatorApi.calculate({
        country,
        price: parseFloat(price),
        type,
      }),
    onSuccess: (res: any) => {
      const data = res.data
      const items: CalculationRow[] = [
        { label: 'Стоимость товара', value: data.price },
        { label: 'Таможенная пошлина', value: data.duty },
        { label: 'Логистика', value: data.logisticsCost },
        { label: 'Брокерские услуги', value: data.brokerFee },
        { label: 'Комиссия сервиса', value: data.commission },
      ]
      setResult({ items, total: data.total })
      toast.success('Расчёт выполнен')
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Ошибка расчёта'
      toast.error(msg)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!country || !price || parseFloat(price) <= 0) {
      toast.error('Заполните все поля корректно')
      return
    }
    calculateMutation.mutate()
  }

  return (
    <div className="mx-auto max-w-3xl">
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
            <CalculatorIcon className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary">Калькулятор стоимости</h1>
            <p className="text-sm text-muted">Рассчитайте полную стоимость с учётом всех расходов</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="rounded-xl border border-border bg-card p-6"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-primary">Страна</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              <option value="">Выберите страну</option>
              {settings.map((s: any) => (
                <option key={s.id} value={s.country}>{s.country}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-primary">Стоимость товара, ₽</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Введите стоимость"
              min="0"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-primary">Тип</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setType('car')}
                className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                  type === 'car'
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-border text-muted hover:border-accent/50'
                }`}
              >
                Автомобиль
              </button>
              <button
                type="button"
                onClick={() => setType('part')}
                className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                  type === 'part'
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-border text-muted hover:border-accent/50'
                }`}
              >
                Запчасть
              </button>
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            variant="primary"
            className="w-full"
            loading={calculateMutation.isPending}
          >
            Рассчитать
          </Button>
        </form>
      </motion.div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="mt-6 rounded-xl border border-border bg-card p-6"
          >
            <h3 className="mb-4 text-lg font-semibold text-primary">Результат расчёта</h3>
            <div className="flex flex-col gap-3">
              {result.items.map((row, i) => (
                <motion.div
                  key={row.label}
                  initial="hidden"
                  animate="visible"
                  variants={rowVariant}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center justify-between border-b border-border pb-2 last:border-0 last:pb-0"
                >
                  <span className="text-sm text-muted">{row.label}</span>
                  <span className="text-sm font-medium text-primary">
                    {Number(row.value).toLocaleString('ru-RU')} ₽
                  </span>
                </motion.div>
              ))}

              <motion.div
                initial="hidden"
                animate="visible"
                variants={rowVariant}
                transition={{ delay: result.items.length * 0.1 + 0.1 }}
                className="mt-2 flex items-center justify-between rounded-lg bg-accent/10 px-4 py-3"
              >
                <span className="text-base font-semibold text-primary">Итого</span>
                <span className="text-xl font-bold text-accent">
                  {Number(result.total).toLocaleString('ru-RU')} ₽
                </span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
