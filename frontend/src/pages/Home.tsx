import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Car, ShieldCheck, Calculator, ArrowRight } from 'lucide-react'
import { carsApi } from '../api/cars'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
}

export default function Home() {
  const { data: carsData } = useQuery({
    queryKey: ['popular-cars'],
    queryFn: () => carsApi.getAll({ limit: 4 }),
    select: (res: any) => res.data?.items ?? res.data ?? [],
  })

  const popularCars = Array.isArray(carsData) ? carsData : []

  return (
    <div className="flex flex-col gap-20 pb-16">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 px-6 py-20 text-center text-white md:px-16 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(245,158,11,0.15),transparent_60%)]" />
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="relative z-10 mx-auto max-w-3xl"
        >
          <motion.h1
            variants={fadeUp}
            className="mb-6 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl"
          >
            <span className="bg-gradient-to-r from-white via-accent to-accent-hover bg-clip-text text-transparent">
              Автомобили и запчасти из-за границы
            </span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mb-10 text-lg text-white/70 md:text-xl"
          >
            Параллельный импорт автомобилей и автозапчастей с полным расчётом
            стоимости, гарантией качества и доставкой под ключ
          </motion.p>
          <motion.div
            variants={fadeUp}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Link to="/cars">
              <Button size="lg" variant="primary">
                Каталог авто
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/parts">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                Подобрать запчасть
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
        className="grid gap-6 md:grid-cols-3"
      >
        {[
          {
            icon: Car,
            title: 'Прямой импорт',
            desc: 'Работаем напрямую с поставщиками из Японии, Кореи, Европы и Китая без посредников',
          },
          {
            icon: ShieldCheck,
            title: 'Гарантия качества',
            desc: 'Проверяем каждое авто и запчасть перед отправкой, предоставляем гарантию',
          },
          {
            icon: Calculator,
            title: 'Полный расчёт',
            desc: 'Калькулятор полной стоимости с учётом пошлин, логистики и брокерских услуг',
          },
        ].map((item) => (
          <motion.div key={item.title} variants={fadeUp}>
            <Card className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10">
                <item.icon className="h-7 w-7 text-accent" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-primary">{item.title}</h3>
              <p className="text-sm text-muted">{item.desc}</p>
            </Card>
          </motion.div>
        ))}
      </motion.section>

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-primary">Популярные автомобили</h2>
          <Link
            to="/cars"
            className="flex items-center gap-1 text-sm font-medium text-accent transition-colors hover:text-accent-hover"
          >
            Все авто <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {popularCars.length > 0
            ? popularCars.map((car: any) => (
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
                      <div className="flex flex-col gap-2 p-4">
                        <h3 className="text-base font-semibold text-primary">
                          {car.brand} {car.model}
                        </h3>
                        <span className="text-sm text-muted">{car.year} г.</span>
                        <span className="text-lg font-bold text-accent">
                          {Number(car.price).toLocaleString('ru-RU')} ₽
                        </span>
                      </div>
                    </Link>
                  </Card>
                </motion.div>
              ))
            : Array.from({ length: 4 }).map((_, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <Card className="flex flex-col overflow-hidden p-0">
                    <div className="flex h-48 w-full items-center justify-center bg-primary/5">
                      <Car className="h-12 w-12 text-muted" />
                    </div>
                    <div className="flex flex-col gap-2 p-4">
                      <div className="h-5 w-3/4 animate-pulse rounded bg-primary/10" />
                      <div className="h-4 w-1/2 animate-pulse rounded bg-primary/10" />
                      <div className="h-6 w-2/3 animate-pulse rounded bg-primary/10" />
                    </div>
                  </Card>
                </motion.div>
              ))}
        </div>
      </motion.section>

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUp}
        className="rounded-2xl bg-gradient-to-r from-accent to-accent-hover px-8 py-12 text-center text-white md:py-16"
      >
        <h2 className="mb-4 text-2xl font-bold md:text-3xl">Не нашли нужное?</h2>
        <p className="mx-auto mb-8 max-w-xl text-white/80">
          Оставьте заявку, и мы подберём автомобиль или запчасть по вашим
          требованиям
        </p>
        <Link to="/request">
          <Button size="lg" variant="primary" className="bg-primary text-white hover:bg-primary-light">
            Оставить заявку
            <ArrowRight className="h-5 w-5" />
          </Button>
        </Link>
      </motion.section>
    </div>
  )
}
