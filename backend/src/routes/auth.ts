import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { protect } from '../middleware/auth';

const router = Router();

const generateToken = (id: string, role: string): string => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
};

router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Введите корректный email'),
    body('password').isLength({ min: 6 }).withMessage('Пароль минимум 6 символов'),
    body('firstName').notEmpty().withMessage('Введите имя'),
    body('lastName').notEmpty().withMessage('Введите фамилию'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

const { email, password, firstName, lastName, nickname, phone } = req.body;

    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        res.status(400).json({ message: 'Пользователь уже существует' });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          firstName,
          lastName,
          nickname,
          phone,
        },
      });

      const token = generateToken(user.id, user.role);

      res.status(201).json({ token, user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, nickname: user.nickname, avatar: user.avatar, role: user.role } });
    } catch (error) {
      res.status(500).json({ message: 'Ошибка сервера', error });
    }
  }
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Введите корректный email'),
    body('password').notEmpty().withMessage('Введите пароль'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password } = req.body;

    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        res.status(400).json({ message: 'Пользователь не найден' });
        return;
      }

      if (user.blocked) {
        res.status(403).json({ message: 'Аккаунт заблокирован' });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        res.status(400).json({ message: 'Неверный пароль' });
        return;
      }

      const token = generateToken(user.id, user.role);

res.json({
      token,
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, nickname: user.nickname, avatar: user.avatar, role: user.role },
    });
    } catch (error) {
      res.status(500).json({ message: 'Ошибка сервера', error });
    }
  }
);

router.get('/me', protect, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { id: true, email: true, firstName: true, lastName: true, nickname: true, avatar: true, phone: true, role: true, blocked: true } });
    if (!user) {
      res.status(404).json({ message: 'Пользователь не найден' });
      return;
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error });
  }
});

router.put('/me', protect, async (req: Request, res: Response) => {
  const { firstName, lastName, nickname, phone } = req.body;

  try {
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { firstName, lastName, nickname, phone },
      select: { id: true, email: true, firstName: true, lastName: true, nickname: true, avatar: true, phone: true, role: true },
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error });
  }
});

router.put('/me/avatar', protect, async (req: Request, res: Response) => {
  const { avatar } = req.body;
  if (!avatar) {
    res.status(400).json({ message: 'URL аватара обязателен' });
    return;
  }

  try {
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { avatar },
      select: { id: true, email: true, firstName: true, lastName: true, nickname: true, avatar: true, phone: true, role: true },
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error });
  }
});

export default router;
