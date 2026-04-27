import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Newspaper, CalendarDays } from 'lucide-react'
import { newsApi } from '../api/news'
import Card from '../components/ui/Card'
import Pagination from '../components/ui/Pagination'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

export default function News() {
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['news', page],
    queryFn: () => newsApi.getAll({ page, limit: 9 }),
    select: (res: any) => ({
      items: res.data?.items ?? res.data ?? [],
      totalPages: res.data?.totalPages ?? 1,
    }),
  })

  const news = data?.items ?? []
  const totalPages = data?.totalPages ?? 1

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
          <Newspaper className="h-5 w-5 text-accent" />
        </div>
        <h1 className="text-2xl font-bold text-primary">Новости</h1>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-xl bg-primary/5" />
          ))}
        </div>
      ) : news.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Newspaper className="mb-4 h-16 w-16 text-muted" />
          <h3 className="mb-2 text-lg font-semibold text-primary">Новостей пока нет</h3>
          <p className="text-sm text-muted">Следите за обновлениями</p>
        </div>
      ) : (
        <>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {news.map((item: any) => (
              <motion.div key={item.id} variants={fadeUp}>
                <Link to={`/news/${item.id}`}>
                  <Card className="flex h-full flex-col overflow-hidden p-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-48 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-48 w-full items-center justify-center bg-primary/5">
                        <Newspaper className="h-10 w-10 text-muted" />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col gap-2 p-4">
                      <div className="flex items-center gap-2 text-xs text-muted">
                        <CalendarDays className="h-3.5 w-3.5" />
                        <span>
                          {new Date(item.createdAt).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-primary line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="mt-auto text-sm text-muted line-clamp-3">
                        {item.content}
                      </p>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}
