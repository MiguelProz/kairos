import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import goalsRoutes from './routes/goals';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/goals', goalsRoutes);

const PORT = 4000;
const MONGO_URI = process.env.MONGO_URI || '';

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('MongoDB conectado');
        app.listen(PORT, () => {
            console.log(`Servidor backend en http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Error conectando a MongoDB:', err);
    });
