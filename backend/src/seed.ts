import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Seeding database...');

    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const userPasswordHash = await bcrypt.hash('test1234', 10);

    const admin = await prisma.user.upsert({
      where: { email: 'admin@autoimport.ru' },
      update: {},
      create: {
        email: 'admin@autoimport.ru',
        passwordHash: adminPasswordHash,
        firstName: 'Админ',
        lastName: 'Системы',
        role: 'ADMIN',
      },
    });

    const user = await prisma.user.upsert({
      where: { email: 'user@test.ru' },
      update: {},
      create: {
        email: 'user@test.ru',
        passwordHash: userPasswordHash,
        firstName: 'Иван',
        lastName: 'Петров',
        role: 'USER',
      },
    });

    console.log('Users created:', { admin: admin.email, user: user.email });

    const cars = await Promise.all([
      prisma.car.create({
        data: {
          brand: 'Toyota',
          model: 'Camry',
          year: 2023,
          bodyType: 'SEDAN',
          engineType: 'PETROL',
          engineVolume: 2.5,
          mileage: 15000,
          country: 'Япония',
          price: 35000,
          images: [],
          description: 'Toyota Camry 2023 года — надёжный и комфортный седан бизнес-класса. Просторный салон, экономичный двигатель 2.5 л, богатая комплектация. Идеальный выбор для повседневных поездок и дальних путешествий.',
        },
      }),
      prisma.car.create({
        data: {
          brand: 'BMW',
          model: 'X5',
          year: 2022,
          bodyType: 'SUV',
          engineType: 'DIESEL',
          engineVolume: 3.0,
          mileage: 28000,
          country: 'Германия',
          price: 85000,
          images: [],
          description: 'BMW X5 2022 года — премиальный внедорожник с мощным дизельным двигателем 3.0 л. Полный привод, роскошный интерьер, передовые технологии безопасности и Assistance. Статусный автомобиль для взыскательных покупателей.',
        },
      }),
      prisma.car.create({
        data: {
          brand: 'Mercedes',
          model: 'E-Class',
          year: 2024,
          bodyType: 'SEDAN',
          engineType: 'HYBRID',
          engineVolume: 2.0,
          mileage: 5000,
          country: 'Германия',
          price: 92000,
          images: [],
          description: 'Mercedes-Benz E-Class 2024 года — новый флагман бизнес-седанов с гибридной силовой установкой. Интеллектуальные системы помощи водителю, мультимедийная система MBUX, премиальная отделка салона.',
        },
      }),
      prisma.car.create({
        data: {
          brand: 'Honda',
          model: 'CR-V',
          year: 2023,
          bodyType: 'SUV',
          engineType: 'PETROL',
          engineVolume: 1.5,
          mileage: 12000,
          country: 'Япония',
          price: 32000,
          images: [],
          description: 'Honda CR-V 2023 года — компактный кроссовер с турбированным двигателем 1.5 л. Вместительный багажник, экономичный расход топлива, высокая надёжность и комфорт для всей семьи.',
        },
      }),
      prisma.car.create({
        data: {
          brand: 'Hyundai',
          model: 'Tucson',
          year: 2024,
          bodyType: 'SUV',
          engineType: 'PETROL',
          engineVolume: 2.0,
          mileage: 3000,
          country: 'Южная Корея',
          price: 28000,
          images: [],
          description: 'Hyundai Tucson 2024 года — стильный кроссовер с современным дизайном. Двигатель 2.0 л, богатое оснащение, просторный салон и большой багажник. Отличное соотношение цены и качества.',
        },
      }),
      prisma.car.create({
        data: {
          brand: 'Kia',
          model: 'K5',
          year: 2023,
          bodyType: 'SEDAN',
          engineType: 'PETROL',
          engineVolume: 2.5,
          mileage: 8000,
          country: 'Южная Корея',
          price: 25000,
          images: [],
          description: 'Kia K5 2023 года — динамичный и стильный седан с яркой внешностью. Мощный мотор 2.5 л, спортивная управляемость, передовые технологии и просторный салон с качественными материалами.',
        },
      }),
      prisma.car.create({
        data: {
          brand: 'Audi',
          model: 'A6',
          year: 2022,
          bodyType: 'SEDAN',
          engineType: 'PETROL',
          engineVolume: 3.0,
          mileage: 35000,
          country: 'Германия',
          price: 78000,
          images: [],
          description: 'Audi A6 2022 года — бизнес-седан премиум-класса с полным приводом Quattro. Двигатель V6 3.0 л, виртуальная приборная панель, кожа наппа, адаптивная подвеска. Безупречный комфорт и динамика.',
        },
      }),
      prisma.car.create({
        data: {
          brand: 'Lexus',
          model: 'RX',
          year: 2024,
          bodyType: 'SUV',
          engineType: 'HYBRID',
          engineVolume: 2.5,
          mileage: 2000,
          country: 'Япония',
          price: 120000,
          images: [],
          description: 'Lexus RX 2024 года — роскошный гибридный кроссовер нового поколения. Уникальный дизайн, бесшумный салон, система полного привода E-Four, инновационные системы безопасности и премиальный комфорт.',
        },
      }),
    ]);

    console.log('Cars created:', cars.length);

    const parts = await Promise.all([
      prisma.part.create({
        data: {
          name: 'Двигатель в сборе 2.5 л',
          category: 'ENGINE',
          brand: 'Toyota',
          article: 'ENG-TOY-25-001',
          compatibility: ['Toyota', 'Lexus'],
          country: 'Япония',
          price: 2000,
          inStock: true,
          images: [],
          description: 'Двигатель в сборе 2.5 л для автомобилей Toyota и Lexus. Оригинальная запчасть, гарантия качества. Подходит для моделей Camry, RX и других с аналогичным объёмом.',
        },
      }),
      prisma.part.create({
        data: {
          name: 'Амортизатор передний',
          category: 'SUSPENSION',
          brand: 'BMW',
          article: 'SUS-BMW-F-002',
          compatibility: ['BMW'],
          country: 'Германия',
          price: 350,
          inStock: true,
          images: [],
          description: 'Передний амортизатор для BMW X5 и X3. Газомасляная конструкция, обеспечивает отличную управляемость и комфорт. Оригинальная деталь с гарантией.',
        },
      }),
      prisma.part.create({
        data: {
          name: 'Крыло переднее левое',
          category: 'BODY',
          brand: 'Mercedes',
          article: 'BDY-MER-FL-003',
          compatibility: ['Mercedes'],
          country: 'Германия',
          price: 580,
          inStock: true,
          images: [],
          description: 'Переднее левое крыло для Mercedes-Benz E-Class. Оригинальная деталь кузова, идеально подходит по размерам. Грунтованное, готово к покраске.',
        },
      }),
      prisma.part.create({
        data: {
          name: 'Блок управления двигателем',
          category: 'ELECTRICS',
          brand: 'Honda',
          article: 'ELC-HON-ECU-004',
          compatibility: ['Honda'],
          country: 'Япония',
          price: 750,
          inStock: true,
          images: [],
          description: 'Электронный блок управления двигателем (ЭБУ) для Honda CR-V и Civic. Оригинальный контроллер, обеспечивает корректную работу всех систем двигателя.',
        },
      }),
      prisma.part.create({
        data: {
          name: 'Масляный фильтр',
          category: 'CONSUMABLES',
          brand: 'Hyundai',
          article: 'CON-HYN-OF-005',
          compatibility: ['Hyundai', 'Kia'],
          country: 'Южная Корея',
          price: 50,
          inStock: true,
          images: [],
          description: 'Оригинальный масляный фильтр для двигателей Hyundai и Kia. Высокоэффективная фильтрация, надёжная защита двигателя от загрязнений. Рекомендуемая замена при каждом ТО.',
        },
      }),
      prisma.part.create({
        data: {
          name: 'Тормозные колодки передние',
          category: 'BRAKES',
          brand: 'Audi',
          article: 'BRK-AUD-FP-006',
          compatibility: ['Audi', 'Volkswagen', 'Skoda'],
          country: 'Германия',
          price: 120,
          inStock: true,
          images: [],
          description: 'Передние тормозные колодки для Audi A6, A4 и Q5. Керамический состав, низкий уровень шума, эффективное торможение. Соответствуют оригинальным спецификациям.',
        },
      }),
      prisma.part.create({
        data: {
          name: 'Коробка автоматическая 8-ступенчатая',
          category: 'TRANSMISSION',
          brand: 'BMW',
          article: 'TRN-BMW-AT8-007',
          compatibility: ['BMW'],
          country: 'Германия',
          price: 1800,
          inStock: true,
          images: [],
          description: '8-ступенчатая автоматическая коробка передач ZF для BMW 3, 5 и 7 серии. Восстановленная по стандартам производителя, с гарантией 12 месяцев.',
        },
      }),
      prisma.part.create({
        data: {
          name: 'Радиатор охлаждения основной',
          category: 'COOLING',
          brand: 'Toyota',
          article: 'CLG-TOY-RD-008',
          compatibility: ['Toyota', 'Lexus'],
          country: 'Япония',
          price: 280,
          inStock: true,
          images: [],
          description: 'Основной радиатор охлаждения двигателя для Toyota Camry и Lexus RX. Алюминиевый двухрядный, высокая теплоотдача. Оригинальная запчасть, точная замена.',
        },
      }),
    ]);

    console.log('Parts created:', parts.length);

    const calculatorSettings = await Promise.all([
      prisma.calculatorSettings.upsert({
        where: { country: 'Япония' },
        update: {},
        create: {
          country: 'Япония',
          dutyRate: 0.25,
          logisticsCost: 150000,
          brokerFee: 30000,
          commissionRate: 0.05,
        },
      }),
      prisma.calculatorSettings.upsert({
        where: { country: 'Германия' },
        update: {},
        create: {
          country: 'Германия',
          dutyRate: 0.21,
          logisticsCost: 200000,
          brokerFee: 40000,
          commissionRate: 0.05,
        },
      }),
      prisma.calculatorSettings.upsert({
        where: { country: 'Южная Корея' },
        update: {},
        create: {
          country: 'Южная Корея',
          dutyRate: 0.2,
          logisticsCost: 180000,
          brokerFee: 35000,
          commissionRate: 0.05,
        },
      }),
      prisma.calculatorSettings.upsert({
        where: { country: 'США' },
        update: {},
        create: {
          country: 'США',
          dutyRate: 0.25,
          logisticsCost: 250000,
          brokerFee: 45000,
          commissionRate: 0.05,
        },
      }),
    ]);

    console.log('Calculator settings created:', calculatorSettings.length);

    const news = await Promise.all([
      prisma.news.create({
        data: {
          title: 'Параллельный импорт автомобилей: новые возможности для покупателей в 2024 году',
          content: 'Рынок параллельного импорта автомобилей продолжает активно развиваться в России. Благодаря параллельному импорту покупатели получили доступ к широкому ассортименту автомобилей из Японии, Южной Кореи, Германии и других стран по конкурентным ценам. В 2024 году ожидается упрощение процедур ввоза и расширение списка доступных моделей. По данным аналитиков, объём параллельного импорта автомобилей вырос на 35% по сравнению с предыдущим годом. Особенно популярны модели из Японии — Toyota Camry и Lexus RX, а также немецкие премиум-бренды BMW и Mercedes-Benz. Специалисты отмечают, что правильный подбор автомобиля с учётом таможенных пошлин и логистических расходов позволяет сэкономить до 20-30% от стоимости аналогичных моделей на внутреннем рынке.',
          authorId: admin.id,
        },
      }),
      prisma.news.create({
        data: {
          title: 'Запчасти по параллельному импорту: как обеспечить качество и надёжность',
          content: 'Вопрос качества запасных частей, ввозимых по параллельному импорту, остаётся одним из ключевых для автовладельцев. Эксперты рекомендуют приобретать оригинальные запчасти у проверенных поставщиков, которые обеспечивают полную прослеживаемость происхождения деталей. На нашем сайте представлены только оригинальные запчасти от производителей из Японии, Германии и Южной Кореи с гарантией подлинности. Каждая деталь проходит проверку по артикулу и серийному номеру. Наиболее востребованными категориями остаются двигатели в сборе, элементы подвески, электронные блоки управления и кузовные детали. Напоминаем, что использование неоригинальных запчастей может привести к снижению ресурса агрегатов и потере гарантии. Выбирайте проверенных поставщиков и оригинальные комплектующие для вашего автомобиля.',
          authorId: admin.id,
        },
      }),
    ]);

    console.log('News created:', news.length);
    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
