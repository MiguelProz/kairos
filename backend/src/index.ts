import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth';
import goalsRoutes from './routes/goals';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/goals', goalsRoutes);

// Servir frontend estático (Vite build) desde / (SPA)
// En runtime, este archivo vive en backend/dist; el build del front queda en /app/dist
// __dirname apunta a /app/backend/dist, así que ../../dist llega a /app/dist
const frontendDistPath = path.resolve(__dirname, '../../dist');
app.use(express.static(frontendDistPath));

// Fallback SPA: cualquier ruta no-API devuelve index.html
app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Not found' });
    res.sendFile(path.join(frontendDistPath, 'index.html'));
});

const PORT = Number(process.env.PORT) || 3000;
const MONGO_URI = process.env.MONGO_URI || '';

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('MongoDB conectado');
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Servidor app (API+front) en http://0.0.0.0:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Error conectando a MongoDB:', err);
    });
