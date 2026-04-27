import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GitCompare, X, Trash2 } from 'lucide-react'
import { useCompareStore, type CompareItem } from '../store/compareStore'
import Button from '../components/ui/Button'

const characteristics: { key: keyof CompareItem; label: string }[] = [
  { key: 'brand', label: 'Марка' },
  { key: 'model', label: 'Модель' },
  { key: 'year', label: 'Год' },
  { key: 'bodyType', label: 'Тип кузова' },
  { key: 'engineType', label: 'Двигатель' },
  { key: 'engineVolume', label: 'Объём двигателя, л' },
  { key: 'mileage', label: 'Пробег, км' },
  { key: 'country', label: 'Страна' },
  { key: 'price', label: 'Цена, ₽' },
]

export default function Compare() {
  const { items, removeItem, clear } = useCompareStore()

  const minPrice = items.length > 0 ? Math.min(...items.map((i) => i.price)) : 0

  if (items.length === 0) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <GitCompare className="mb-4 h-16 w-16 text-muted" />
        <h2 className="mb-2 text-xl font-semibold text-primary">Нет автомобилей для сравнения</h2>
        <p className="mb-6 text-sm text-muted">
          Добавьте автомобили из каталога для сравнения характеристик
        </p>
        <Link to="/cars">
          <Button variant="primary">Перейти в каталог</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
            <GitCompare className="h-5 w-5 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-primary">Сравнение</h1>
        </div>
        <Button variant="danger" size="sm" onClick={clear}>
          <Trash2 className="h-4 w-4" />
          Очистить
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-x-auto rounded-xl border border-border bg-card"
      >
        <table className="w-full min-w-[500px] text-sm">
          <thead>
            <tr className="border-b border-border bg-primary/5">
              <th className="px-4 py-3 text-left font-medium text-muted">Характеристика</th>
              {items.map((item) => (
                <th key={item.id} className="px-4 py-3 text-center font-medium text-primary">
                  <div className="flex flex-col items-center gap-2">
                    <span>
                      {item.brand} {item.model}
                    </span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="rounded p-1 text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {characteristics.map((char, i) => (
              <tr
                key={char.key}
                className={i % 2 === 0 ? 'bg-surface/50' : ''}
              >
                <td className="px-4 py-3 font-medium text-muted">{char.label}</td>
                {items.map((item) => {
                  const value = item[char.key]
                  const isLowestPrice = char.key === 'price' && value === minPrice && items.length > 1
                  return (
                    <td
                      key={item.id}
                      className={`px-4 py-3 text-center ${
                        isLowestPrice
                          ? 'font-semibold text-success'
                          : 'text-primary'
                      }`}
                    >
                      {char.key === 'price'
                        ? `${Number(value).toLocaleString('ru-RU')}`
                        : char.key === 'mileage'
                          ? `${Number(value).toLocaleString('ru-RU')}`
                          : char.key === 'engineVolume'
                            ? `${value}`
                            : String(value)}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  )
}
