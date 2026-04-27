import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const getPages = (): (number | string)[] => {
    const pages: (number | string)[] = []
    const delta = 2

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= page - delta && i <= page + delta)
      ) {
        pages.push(i)
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...')
      }
    }

    return pages
  }

  return (
    <div className="flex items-center justify-center gap-1">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Предыдущая"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {getPages().map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="flex h-9 w-9 items-center justify-center text-sm text-muted">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
              p === page
                ? 'bg-accent text-white'
                : 'border border-border text-muted hover:bg-surface'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Следующая"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}
