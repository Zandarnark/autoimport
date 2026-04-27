import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

router.get('/settings', async (_req: Request, res: Response) => {
  try {
    const settings = await prisma.calculatorSettings.findMany();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error });
  }
});

router.post('/calculate', async (req: Request, res: Response) => {
  const { country, price, type } = req.body;

  try {
    const settings = await prisma.calculatorSettings.findFirst({ where: { country } });
    if (!settings) {
      res.status(404).json({ message: 'Настройки для указанной страны не найдены' });
      return;
    }

  const duty = price * settings.dutyRate;
  const commission = price * settings.commissionRate;
    const total = price + duty + settings.logisticsCost + settings.brokerFee + commission;

    res.json({
      price,
      duty,
      dutyRate: settings.dutyRate,
      logisticsCost: settings.logisticsCost,
      brokerFee: settings.brokerFee,
      commission,
      commissionRate: settings.commissionRate,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error });
  }
});

router.put('/settings/:id', protect, adminOnly, async (req: Request, res: Response) => {
  try {
    const settings = await prisma.calculatorSettings.update({
      where: { id: req.params.id as string },
      data: req.body,
    });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error });
  }
});

export default router;
