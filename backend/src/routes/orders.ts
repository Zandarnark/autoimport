import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

const getId = (req: Request): string => req.params.id as string;

router.get('/', protect, async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  try {
    const where: any = {};
    if (req.user!.role !== 'ADMIN') {
      where.userId = req.user!.id;
    }

	const [items, total] = await Promise.all([
		prisma.order.findMany({
			where,
			skip,
			take: limit,
			orderBy: { createdAt: 'desc' },
			include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
		}),
		prisma.order.count({ where }),
	]);

	res.json({ items, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error });
  }
});

router.get('/:id', protect, async (req: Request, res: Response) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: getId(req) },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        statusHistory: { orderBy: { createdAt: 'asc' } },
        messages: { include: { sender: { select: { id: true, firstName: true, lastName: true, role: true } } }, orderBy: { createdAt: 'asc' } },
      },
    });

    if (!order) {
      res.status(404).json({ message: 'Заказ не найден' });
      return;
    }

    if (req.user!.role !== 'ADMIN' && order.userId !== req.user!.id) {
      res.status(403).json({ message: 'Доступ запрещён' });
      return;
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error });
  }
});

router.post('/', protect, async (req: Request, res: Response) => {
  const { type, carId, partId, customDescription, deliveryAddress, totalPrice } = req.body;

  try {
    const order = await prisma.order.create({
      data: {
        type,
        carId: carId || null,
        partId: partId || null,
        customDescription,
        deliveryAddress,
        totalPrice,
        userId: req.user!.id,
        status: 'NEW',
      },
    });

    await prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status: 'NEW',
        changedBy: req.user!.id,
      },
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error });
  }
});

router.put('/:id/status', protect, adminOnly, async (req: Request, res: Response) => {
  const { status, comment } = req.body;

  try {
    const order = await prisma.order.update({
      where: { id: getId(req) },
      data: { status },
    });

    await prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status,
        comment,
        changedBy: req.user!.id,
      },
    });

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error });
  }
});

router.post('/:id/messages', protect, async (req: Request, res: Response) => {
  const { text } = req.body;

  try {
    const order = await prisma.order.findUnique({ where: { id: getId(req) } });
    if (!order) {
      res.status(404).json({ message: 'Заказ не найден' });
      return;
    }

    if (req.user!.role !== 'ADMIN' && order.userId !== req.user!.id) {
      res.status(403).json({ message: 'Доступ запрещён' });
      return;
    }

    const message = await prisma.message.create({
      data: {
        orderId: getId(req),
        senderId: req.user!.id,
        text,
      },
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error });
  }
});

router.post('/:id/review', protect, async (req: Request, res: Response) => {
  const { rating, text } = req.body;

  try {
    const order = await prisma.order.findUnique({ where: { id: getId(req) } });
    if (!order) {
      res.status(404).json({ message: 'Заказ не найден' });
      return;
    }

    if (order.userId !== req.user!.id) {
      res.status(403).json({ message: 'Доступ запрещён' });
      return;
    }

    if (order.status !== 'COMPLETED') {
      res.status(400).json({ message: 'Отзыв можно оставить только для завершённого заказа' });
      return;
    }

    if (rating < 1 || rating > 5) {
      res.status(400).json({ message: 'Оценка должна быть от 1 до 5' });
      return;
    }

    const review = await prisma.review.create({
      data: {
        orderId: getId(req),
        userId: req.user!.id,
        rating,
        text,
      },
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error });
  }
});

export default router;
