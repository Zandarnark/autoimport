import { useState, useEffect, useCallback } from 'react'
import { Search } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Поиск...',
}: SearchBarProps) {
  const [local, setLocal] = useState(value)

  useEffect(() => {
    setLocal(value)
  }, [value])

  const debouncedUpdate = useCallback(
    (() => {
      let timer: ReturnType<typeof setTimeout>
      return (val: string) => {
        clearTimeout(timer)
        timer = setTimeout(() => onChange(val), 300)
      }
    })(),
    [onChange]
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setLocal(val)
    debouncedUpdate(val)
  }

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input
        type="text"
        value={local}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border py-2 pl-10 pr-4 text-sm text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
      />
    </div>
  )
}
