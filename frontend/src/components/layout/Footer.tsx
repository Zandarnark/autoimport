import { Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <h3 className="mb-4 text-lg font-bold">О компании</h3>
          <p className="text-sm leading-relaxed text-white/70">
            AutoImport — надёжный партнёр по импорту автомобилей и запчастей из-за рубежа.
            Работаем с 2010 года, доставляем по всей России.
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-bold">Каталог</h3>
          <ul className="flex flex-col gap-2 text-sm text-white/70">
            <li><a href="/cars" className="hover:text-accent transition-colors">Автомобили</a></li>
            <li><a href="/parts" className="hover:text-accent transition-colors">Запчасти</a></li>
            <li><a href="/calculator" className="hover:text-accent transition-colors">Калькулятор</a></li>
            <li><a href="/news" className="hover:text-accent transition-colors">Новости</a></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-bold">Контакты</h3>
          <ul className="flex flex-col gap-3 text-sm text-white/70">
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0" />
              <a href="mailto:info@autoimport.ru" className="hover:text-accent transition-colors">
                info@autoimport.ru
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0" />
              <a href="tel:+78001234567" className="hover:text-accent transition-colors">
                +7 (800) 123-45-67
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
              <span>г. Туймазы, ул. Салавата Юлаева, д. 10</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-4 text-center text-sm text-white/50">
          © 2026 AutoImport. Все права защищены.
        </div>
      </div>
    </footer>
  )
}
