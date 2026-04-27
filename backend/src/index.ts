import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';

import authRouter from './routes/auth';
import carRouter from './routes/cars';
import partRouter from './routes/parts';
import orderRouter from './routes/orders';
import userRouter from './routes/users';
import newsRouter from './routes/news';
import calculatorRouter from './routes/calculator';
import uploadRouter from './routes/upload';
import favoritesRouter from './routes/favorites';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/auth', authRouter);
app.use('/api/cars', carRouter);
app.use('/api/parts', partRouter);
app.use('/api/orders', orderRouter);
app.use('/api/users', userRouter);
app.use('/api/news', newsRouter);
app.use('/api/calculator', calculatorRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/favorites', favoritesRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
