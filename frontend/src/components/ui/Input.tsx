import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export default function Input({
  label,
  error,
  className = '',
  ...rest
}: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-primary">
          {label}
        </label>
      )}
      <input
        className={`w-full rounded-lg border border-border px-3 py-2 text-sm text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 ${error ? 'border-danger focus:border-danger focus:ring-danger/30' : ''} ${className}`}
        {...rest}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}
