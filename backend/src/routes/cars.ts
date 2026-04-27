import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (req.query.brand) where.brand = { contains: req.query.brand as string, mode: 'insensitive' };
  if (req.query.model) where.model = { contains: req.query.model as string, mode: 'insensitive' };
  if (req.query.year) where.year = parseInt(req.query.year as string);
  if (req.query.bodyType) where.bodyType = req.query.bodyType as string;
  if (req.query.engineType) where.engineType = req.query.engineType as string;
  if (req.query.country) where.country = { contains: req.query.country as string, mode: 'insensitive' };

  if (req.query.minPrice || req.query.maxPrice) {
    where.price = {};
    if (req.query.minPrice) where.price.gte = parseFloat(req.query.minPrice as string);
    if (req.query.maxPrice) where.price.lte = parseFloat(req.query.maxPrice as string);
  }

  if (req.query.minYear || req.query.maxYear) {
    where.year = where.year || {};
    if (req.query.minYear) where.year.gte = parseInt(req.query.minYear as string);
    if (req.query.maxYear) where.year.lte = parseInt(req.query.maxYear as string);
  }

  if (req.query.search) {
    where.OR = [
      { brand: { contains: req.query.search as string, mode: 'insensitive' } },
      { model: { contains: req.query.search as string, mode: 'insensitive' } },
    ];
  }

  try {
    const [items, total] = await Promise.all([
      prisma.car.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.car.count({ where }),
    ]);

    res.json({ items, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const car = await prisma.car.findUnique({ where: { id: req.params.id as string } });
    if (!car) {
      res.status(404).json({ message: 'Автомобиль не найден' });
      return;
    }
    res.json(car);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error });
  }
});

router.post('/', protect, adminOnly, async (req: Request, res: Response) => {
  try {
    const car = await prisma.car.create({ data: req.body });
    res.status(201).json(car);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error });
  }
});

router.put('/:id', protect, adminOnly, async (req: Request, res: Response) => {
  try {
    const car = await prisma.car.update({ where: { id: req.params.id as string }, data: req.body });
    res.json(car);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error });
  }
});

router.delete('/:id', protect, adminOnly, async (req: Request, res: Response) => {
  try {
    await prisma.car.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'Автомобиль удалён' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error });
  }
});

export default router;
