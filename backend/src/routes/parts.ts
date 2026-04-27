import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

const getId = (req: Request): string => req.params.id as string;

router.get('/', async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (req.query.category) where.category = req.query.category as string;
  if (req.query.brand) where.brand = { contains: req.query.brand as string, mode: 'insensitive' };
  if (req.query.article) where.article = { contains: req.query.article as string, mode: 'insensitive' };
  if (req.query.country) where.country = { contains: req.query.country as string, mode: 'insensitive' };

  if (req.query.inStock !== undefined) {
    where.inStock = req.query.inStock === 'true';
  }

  if (req.query.minPrice || req.query.maxPrice) {
    where.price = {};
    if (req.query.minPrice) where.price.gte = parseFloat(req.query.minPrice as string);
    if (req.query.maxPrice) where.price.lte = parseFloat(req.query.maxPrice as string);
  }

  if (req.query.search) {
    where.OR = [
      { name: { contains: req.query.search as string, mode: 'insensitive' } },
      { article: { contains: req.query.search as string, mode: 'insensitive' } },
    ];
  }

  try {
	const [items, total] = await Promise.all([
		prisma.part.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
		prisma.part.count({ where }),
	]);

	res.json({ items, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const part = await prisma.part.findUnique({ where: { id: getId(req) } });
    if (!part) {
      res.status(404).json({ message: 'Запчасть не найдена' });
      return;
    }
    res.json(part);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error });
  }
});

router.post('/', protect, adminOnly, async (req: Request, res: Response) => {
  try {
    const part = await prisma.part.create({ data: req.body });
    res.status(201).json(part);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error });
  }
});

router.put('/:id', protect, adminOnly, async (req: Request, res: Response) => {
  try {
    const part = await prisma.part.update({ where: { id: getId(req) }, data: req.body });
    res.json(part);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error });
  }
});

router.delete('/:id', protect, adminOnly, async (req: Request, res: Response) => {
  try {
    await prisma.part.delete({ where: { id: getId(req) } });
    res.json({ message: 'Запчасть удалена' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error });
  }
});

export default router;
