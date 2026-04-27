import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

const getId = (req: Request): string => req.params.id as string;

router.get('/', async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  try {
	const [items, total] = await Promise.all([
		prisma.news.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' }, include: { author: { select: { id: true, firstName: true, lastName: true } } } }),
		prisma.news.count(),
	]);

	res.json({ items, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const newsItem = await prisma.news.findUnique({ where: { id: getId(req) }, include: { author: { select: { id: true, firstName: true, lastName: true } } } });
    if (!newsItem) {
      res.status(404).json({ message: 'Новость не найдена' });
      return;
    }
    res.json(newsItem);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error });
  }
});

router.post('/', protect, adminOnly, async (req: Request, res: Response) => {
  try {
    const newsItem = await prisma.news.create({ data: req.body });
    res.status(201).json(newsItem);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error });
  }
});

router.put('/:id', protect, adminOnly, async (req: Request, res: Response) => {
  try {
    const newsItem = await prisma.news.update({ where: { id: getId(req) }, data: req.body });
    res.json(newsItem);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error });
  }
});

router.delete('/:id', protect, adminOnly, async (req: Request, res: Response) => {
  try {
    await prisma.news.delete({ where: { id: getId(req) } });
    res.json({ message: 'Новость удалена' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error });
  }
});

export default router;
