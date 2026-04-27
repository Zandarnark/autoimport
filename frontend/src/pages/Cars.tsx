import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Car, SlidersHorizontal, X } from 'lucide-react'
import { carsApi } from '../api/cars'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
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

const bodyTypeOptions = [
  { value: 'SEDAN', label: 'Седан' },
  { value: 'HATCHBACK', label: 'Хэтчбек' },
  { value: 'WAGON', label: 'Универсал' },
  { value: 'SUV', label: 'Кроссовер / Внедорожник' },
  { value: 'MINIVAN', label: 'Минивэн' },
  { value: 'COUPE', label: 'Купе' },
  { value: 'PICKUP', label: 'Пикап' },
  { value: 'CONVERTIBLE', label: 'Кабриолет' },
]

const engineTypeOptions = [
  { value: 'PETROL', label: 'Бензин' },
  { value: 'DIESEL', label: 'Дизель' },
  { value: 'HYBRID', label: 'Гибрид' },
  { value: 'ELECTRIC', label: 'Электро' },
  { value: 'GAS', label: 'Газ' },
]

const countries = ['Япония', 'Корея', 'Германия', 'Китай', 'США', 'Великобритания']

export default function Cars() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    brand: '',
    yearMin: '',
    yearMax: '',
    bodyType: '',
    engineType: '',
    country: '',
    priceMin: '',
    priceMax: '',
  })

  const queryParams: Record<string, string | number> = { page, limit: 12 }
  if (search) queryParams.search = search
  if (filters.brand) queryParams.brand = filters.brand
  if (filters.yearMin) queryParams.minYear = filters.yearMin
  if (filters.yearMax) queryParams.maxYear = filters.yearMax
  if (filters.bodyType) queryParams.bodyType = filters.bodyType
  if (filters.engineType) queryParams.engineType = filters.engineType
  if (filters.country) queryParams.country = filters.country
  if (filters.priceMin) queryParams.minPrice = filters.priceMin
  if (filters.priceMax) queryParams.maxPrice = filters.priceMax

  const { data, isLoading } = useQuery({
    queryKey: ['cars', queryParams],
    queryFn: () => carsApi.getAll(queryParams),
    select: (res: any) => ({
      items: res.data?.items ?? res.data ?? [],
      total: res.data?.total ?? 0,
      totalPages: res.data?.totalPages ?? 1,
    }),
  })

  const cars = data?.items ?? []
  const totalPages = data?.totalPages ?? 1

  const updateFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }

  const clearFilters = () => {
    setFilters({
      brand: '',
      yearMin: '',
      yearMax: '',
      bodyType: '',
      engineType: '',
      country: '',
      priceMin: '',
      priceMax: '',
    })
    setSearch('')
    setPage(1)
  }

  const hasActiveFilters = Object.values(filters).some(Boolean) || search

  const filterContent = (
    <div className="flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-primary">Марка</label>
        <input
          type="text"
          value={filters.brand}
          onChange={(e) => updateFilter('brand', e.target.value)}
          placeholder="Toyota, BMW..."
          className="w-full rounded-lg border border-border px-3 py-2 text-sm text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-primary">Год выпуска</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={filters.yearMin}
            onChange={(e) => updateFilter('yearMin', e.target.value)}
            placeholder="От"
            className="w-full rounded-lg border border-border px-3 py-2 text-sm text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
          <input
            type="number"
            value={filters.yearMax}
            onChange={(e) => updateFilter('yearMax', e.target.value)}
            placeholder="До"
            className="w-full rounded-lg border border-border px-3 py-2 text-sm text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-primary">Тип кузова</label>
        <select
          value={filters.bodyType}
          onChange={(e) => updateFilter('bodyType', e.target.value)}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        >
          <option value="">Все</option>
          {bodyTypeOptions.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-primary">Двигатель</label>
        <select
          value={filters.engineType}
          onChange={(e) => updateFilter('engineType', e.target.value)}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        >
          <option value="">Все</option>
          {engineTypeOptions.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-primary">Страна</label>
        <select
          value={filters.country}
          onChange={(e) => updateFilter('country', e.target.value)}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        >
          <option value="">Все</option>
          {countries.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

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
          <SearchBar value={search} onChange={(v: string) => { setSearch(v); setPage(1) }} placeholder="Поиск по марке, модели..." />
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
                <div key={i} className="h-72 animate-pulse rounded-xl bg-primary/5" />
              ))}
            </div>
          ) : cars.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Car className="mb-4 h-16 w-16 text-muted" />
              <h3 className="mb-2 text-lg font-semibold text-primary">Автомобили не найдены</h3>
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
                {cars.map((car: any) => (
                  <motion.div key={car.id} variants={fadeUp}>
                    <Card className="flex flex-col overflow-hidden p-0">
                      <Link to={`/cars/${car.id}`}>
                        {car.images?.length > 0 ? (
                          <img
                            src={car.images[0]}
                            alt={`${car.brand} ${car.model}`}
                            className="h-48 w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-48 w-full items-center justify-center bg-primary/5">
                            <Car className="h-12 w-12 text-muted" />
                          </div>
                        )}
                        <div className="flex flex-col gap-1.5 p-4">
                          <h3 className="text-base font-semibold text-primary">
                            {car.brand} {car.model}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted">
                            <span>{car.year} г.</span>
                            {car.country && (
                              <>
                                <span>·</span>
                                <span>{car.country}</span>
                              </>
                            )}
                          </div>
                          <span className="mt-1 text-lg font-bold text-accent">
                            {Number(car.price).toLocaleString('ru-RU')} ₽
                          </span>
                        </div>
                      </Link>
                      <div className="border-t border-border px-4 py-3">
                        <Link to={`/cars/${car.id}`}>
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
