import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

const getId = (req: Request): string => req.params.id as string;

router.get('/', protect, adminOnly, async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  try {
	const [items, total] = await Promise.all([
		prisma.user.findMany({
			skip,
			take: limit,
			orderBy: { createdAt: 'desc' },
			select: { id: true, email: true, firstName: true, lastName: true, phone: true, role: true, blocked: true, createdAt: true },
		}),
		prisma.user.count(),
	]);

	res.json({ items, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error });
  }
});

router.put('/:id/role', protect, adminOnly, async (req: Request, res: Response) => {
  const { role } = req.body;

  try {
    const user = await prisma.user.update({
      where: { id: getId(req) },
      data: { role },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error });
  }
});

router.put('/:id/block', protect, adminOnly, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: getId(req) } });
    if (!user) {
      res.status(404).json({ message: 'Пользователь не найден' });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: getId(req) },
      data: { blocked: !user.blocked },
      select: { id: true, email: true, firstName: true, lastName: true, blocked: true },
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error });
  }
});

export default router;
