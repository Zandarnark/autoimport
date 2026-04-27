import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/', protect, async (req: Request, res: Response) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user!.id },
      include: { car: true, part: true },
    });
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error });
  }
});

router.post('/', protect, async (req: Request, res: Response) => {
  const { itemType, carId, partId } = req.body;

  try {
    const existing = await prisma.favorite.findFirst({
      where: {
        userId: req.user!.id,
        itemType,
        carId: carId || null,
        partId: partId || null,
      },
    });
    if (existing) {
      res.status(409).json({ message: 'Уже в избранном', favorite: existing });
      return;
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId: req.user!.id,
        itemType,
        carId: carId || null,
        partId: partId || null,
      },
    });
    res.status(201).json(favorite);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error });
  }
});

router.delete('/:id', protect, async (req: Request, res: Response) => {
  const favId = req.params.id as string;
  try {
    const favorite = await prisma.favorite.findUnique({ where: { id: favId } });
    if (!favorite) {
      res.status(404).json({ message: 'Избранное не найдено' });
      return;
    }

    if (favorite.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
      res.status(403).json({ message: 'Доступ запрещён' });
      return;
    }

    await prisma.favorite.delete({ where: { id: favId } });
    res.json({ message: 'Удалено из избранного' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error });
  }
});

export default router;
