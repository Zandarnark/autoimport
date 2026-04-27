import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowLeft, CalendarDays, User, Newspaper } from 'lucide-react'
import { newsApi } from '../api/news'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function NewsDetail() {
  const { id } = useParams<{ id: string }>()

  const { data: article, isLoading } = useQuery({
    queryKey: ['news', id],
    queryFn: () => newsApi.getById(id!),
    select: (res: any) => res.data,
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-8 w-48 animate-pulse rounded bg-primary/5" />
        <div className="h-64 animate-pulse rounded-xl bg-primary/5" />
        <div className="h-10 w-3/4 animate-pulse rounded bg-primary/5" />
        <div className="h-40 w-full animate-pulse rounded bg-primary/5" />
      </div>
    )
  }

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Newspaper className="mb-4 h-16 w-16 text-muted" />
        <h2 className="mb-2 text-xl font-semibold text-primary">Статья не найдена</h2>
        <Link to="/news" className="text-sm text-accent hover:text-accent-hover">
          Вернуться к новостям
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/news"
        className="flex items-center gap-2 text-sm text-muted transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Назад к новостям
      </Link>

      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        {article.image && (
          <img
            src={article.image}
            alt={article.title}
            className="mb-6 h-[400px] w-full rounded-xl object-cover"
          />
        )}

        <h1 className="mb-4 text-3xl font-bold text-primary">{article.title}</h1>

        <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-muted">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4" />
            <span>{new Date(article.createdAt).toLocaleDateString('ru-RU')}</span>
          </div>
          {article.author && (
            <div className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              <span>
                {article.author.firstName} {article.author.lastName}
              </span>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <p className="whitespace-pre-line text-sm leading-relaxed text-primary">
            {article.content}
          </p>
        </div>
      </motion.div>
    </div>
  )
}
