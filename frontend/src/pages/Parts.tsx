import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Package, SlidersHorizontal, X } from 'lucide-react'
import { partsApi } from '../api/parts'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import SearchBar from '../components/ui/SearchBar'
import Pagination from '../components/ui/Pagination'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const categoryOptions = [
  { value: 'ENGINE', label: 'Двигатель' },
  { value: 'TRANSMISSION', label: 'Трансмиссия' },
  { value: 'SUSPENSION', label: 'Подвеска' },
  { value: 'BRAKES', label: 'Тормозная система' },
  { value: 'ELECTRICS', label: 'Электрика' },
  { value: 'BODY', label: 'Кузов' },
  { value: 'INTERIOR', label: 'Салон' },
  { value: 'CONSUMABLES', label: 'Расходники' },
  { value: 'COOLING', label: 'Охлаждение' },
  { value: 'EXHAUST', label: 'Выхлопная система' },
  { value: 'STEERING', label: 'Рулевое управление' },
  { value: 'OTHER', label: 'Прочее' },
]

export default function Parts() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    category: '',
    brand: '',
    article: '',
    inStock: false,
    priceMin: '',
    priceMax: '',
  })

  const queryParams: Record<string, string | number | boolean> = { page, limit: 12 }
  if (search) queryParams.search = search
  if (filters.category) queryParams.category = filters.category
  if (filters.brand) queryParams.brand = filters.brand
  if (filters.article) queryParams.article = filters.article
  if (filters.inStock) queryParams.inStock = true
  if (filters.priceMin) queryParams.minPrice = filters.priceMin
  if (filters.priceMax) queryParams.maxPrice = filters.priceMax

  const { data, isLoading } = useQuery({
    queryKey: ['parts', queryParams],
    queryFn: () => partsApi.getAll(queryParams as Record<string, string | number>),
    select: (res: any) => ({
      items: res.data?.items ?? res.data ?? [],
      total: res.data?.total ?? 0,
      totalPages: res.data?.totalPages ?? 1,
    }),
  })

  const parts = data?.items ?? []
  const totalPages = data?.totalPages ?? 1

  const updateFilter = (key: string, value: string | boolean) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }

  const clearFilters = () => {
    setFilters({
      category: '',
      brand: '',
      article: '',
      inStock: false,
      priceMin: '',
      priceMax: '',
    })
    setSearch('')
    setPage(1)
  }

  const hasActiveFilters = Object.values(filters).some((v: string | boolean) => v === true || (typeof v === 'string' && v)) || search

  const filterContent = (
    <div className="flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-primary">Категория</label>
        <select
          value={filters.category}
          onChange={(e) => updateFilter('category', e.target.value)}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        >
          <option value="">Все</option>
          {categoryOptions.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-primary">Бренд</label>
        <input
          type="text"
          value={filters.brand}
          onChange={(e) => updateFilter('brand', e.target.value)}
          placeholder="Toyota, Bosch..."
          className="w-full rounded-lg border border-border px-3 py-2 text-sm text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-primary">Артикул</label>
        <input
          type="text"
          value={filters.article}
          onChange={(e) => updateFilter('article', e.target.value)}
          placeholder="Номер детали"
          className="w-full rounded-lg border border-border px-3 py-2 text-sm text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-primary">
        <input
          type="checkbox"
          checked={filters.inStock}
          onChange={(e) => updateFilter('inStock', e.target.checked)}
          className="h-4 w-4 rounded border-border accent-accent"
        />
        Только в наличии
      </label>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-primary">Цена, ₽</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={filters.priceMin}
            onChange={(e) => updateFilter('priceMin', e.target.value)}
            placeholder="От"
            className="w-full rounded-lg border border-border px-3 py-2 text-sm text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
          <input
            type="number"
            value={filters.priceMax}
            onChange={(e) => updateFilter('priceMax', e.target.value)}
            placeholder="До"
            className="w-full rounded-lg border border-border px-3 py-2 text-sm text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>
      </div>

      {hasActiveFilters && (
        <Button variant="outline" size="sm" onClick={clearFilters} className="w-full">
          <X className="h-4 w-4" />
          Сбросить фильтры
        </Button>
      )}
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <SearchBar value={search} onChange={(v: string) => { setSearch(v); setPage(1) }} placeholder="Поиск по названию, артикулу..." />
        </div>
        <Button
          variant="outline"
          size="md"
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Фильтры
        </Button>
      </div>

      <div className="flex gap-6">
        <aside className={`w-64 shrink-0 ${showFilters ? 'block' : 'hidden'} lg:block`}>
          <div className="sticky top-24 rounded-xl border border-border bg-card p-4">
            <h3 className="mb-4 text-base font-semibold text-primary">Фильтры</h3>
            {filterContent}
          </div>
        </aside>

        <div className="flex-1">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-60 animate-pulse rounded-xl bg-primary/5" />
              ))}
            </div>
          ) : parts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Package className="mb-4 h-16 w-16 text-muted" />
              <h3 className="mb-2 text-lg font-semibold text-primary">Запчасти не найдены</h3>
              <p className="text-sm text-muted">Попробуйте изменить параметры поиска</p>
            </div>
          ) : (
            <>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
              >
                {parts.map((part: any) => (
                  <motion.div key={part.id} variants={fadeUp}>
                    <Card className="flex flex-col overflow-hidden p-0">
                      <Link to={`/parts/${part.id}`} className="flex flex-1 flex-col gap-2 p-4">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-base font-semibold text-primary">{part.name}</h3>
                          {part.category && (
                            <Badge variant="default" className="shrink-0">{part.category}</Badge>
                          )}
                        </div>
                        {part.article && (
                          <span className="text-xs text-muted">Арт: {part.article}</span>
                        )}
                        <div className="mt-auto flex items-center justify-between pt-2">
                          <span className="text-lg font-bold text-accent">
                            {Number(part.price).toLocaleString('ru-RU')} ₽
                          </span>
                          {part.inStock ? (
                            <Badge variant="success">В наличии</Badge>
                          ) : (
                            <Badge variant="danger">Нет в наличии</Badge>
                          )}
                        </div>
                      </Link>
                      <div className="border-t border-border px-4 py-3">
                        <Link to={`/parts/${part.id}`}>
                          <Button variant="outline" size="sm" className="w-full">
                            Подробнее
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>

              <div className="mt-8">
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
