import { motion } from 'framer-motion'

type StepStatus = 'NEW' | 'PROCESSING' | 'APPROVED' | 'PAID' | 'DELIVERING' | 'RECEIVED' | 'COMPLETED'

const steps: { key: StepStatus; label: string }[] = [
  { key: 'NEW', label: 'Новая' },
  { key: 'PROCESSING', label: 'В обработке' },
  { key: 'APPROVED', label: 'Согласовано' },
  { key: 'PAID', label: 'Оплачено' },
  { key: 'DELIVERING', label: 'В доставке' },
  { key: 'RECEIVED', label: 'Получено' },
  { key: 'COMPLETED', label: 'Завершено' },
]

interface StatusStepperProps {
  currentStatus: string
}

export default function StatusStepper({ currentStatus }: StatusStepperProps) {
  const currentIndex = steps.findIndex((s) => s.key === currentStatus)
  const activeIndex = currentIndex === -1 ? 0 : currentIndex

  const progressPercent =
    activeIndex <= 0 ? 0 : (activeIndex / (steps.length - 1)) * 100

  return (
    <div className="w-full">
      <div className="relative flex justify-between">
        <div className="absolute top-3 left-0 right-0 h-0.5 bg-border">
          <motion.div
            className="h-full bg-accent"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        </div>

        {steps.map((step, index) => {
          const isCompleted = index < activeIndex
          const isCurrent = index === activeIndex

          return (
            <div
              key={step.key}
              className="relative z-10 flex flex-col items-center"
            >
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                  isCompleted
                    ? 'bg-accent text-white'
                    : isCurrent
                      ? 'border-2 border-accent bg-accent text-white'
                      : 'border-2 border-border bg-card text-muted'
                }`}
              >
                {isCompleted ? '✓' : index + 1}
              </div>
              <span
                className={`mt-2 text-xs font-medium ${
                  isCurrent ? 'text-accent' : isCompleted ? 'text-primary' : 'text-muted'
                }`}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
