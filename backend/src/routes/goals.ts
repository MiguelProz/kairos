import { Router } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Goal, { IGoal } from '../goal.model';

dotenv.config();

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecreto';

function getUserIdFromAuthHeader(auth?: string | null) {
    if (!auth) return null;
    const token = auth.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
        return decoded.id;
    } catch {
        return null;
    }
}

// Crear objetivo
router.post('/', async (req, res) => {
    const userId = getUserIdFromAuthHeader(req.headers.authorization);
    if (!userId) return res.status(401).json({ error: 'No autorizado' });
    try {
        const goal = await Goal.create({ ...req.body, user: userId });
        res.status(201).json(goal);
    } catch (err) {
        res.status(400).json({ error: 'Datos inválidos', detail: (err as Error).message });
    }
});

// Listar objetivos del usuario (con filtros opcionales)
router.get('/', async (req, res) => {
    const userId = getUserIdFromAuthHeader(req.headers.authorization);
    if (!userId) return res.status(401).json({ error: 'No autorizado' });
    const { status, priority, q } = req.query as { status?: IGoal['status']; priority?: IGoal['priority']; q?: string };
    type GoalFilter = Partial<Pick<IGoal, 'status' | 'priority' | 'user'>> & { $text?: { $search: string } };
    const query: GoalFilter = { user: userId as unknown as IGoal['user'] };
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (q) query.$text = { $search: q };
    try {
        const goals = await Goal.find(query).sort({ updatedAt: -1 });
        res.json(goals);
    } catch {
        res.status(500).json({ error: 'Error listando objetivos' });
    }
});

// Obtener un objetivo
router.get('/:id', async (req, res) => {
    const userId = getUserIdFromAuthHeader(req.headers.authorization);
    if (!userId) return res.status(401).json({ error: 'No autorizado' });
    try {
        const goal = await Goal.findOne({ _id: req.params.id, user: userId });
        if (!goal) return res.status(404).json({ error: 'No encontrado' });
        res.json(goal);
    } catch {
        res.status(400).json({ error: 'ID inválido' });
    }
});

// Actualizar un objetivo
router.put('/:id', async (req, res) => {
    const userId = getUserIdFromAuthHeader(req.headers.authorization);
    if (!userId) return res.status(401).json({ error: 'No autorizado' });
    try {
        const goal = await Goal.findOneAndUpdate(
            { _id: req.params.id, user: userId },
            req.body,
            { new: true, runValidators: true }
        );
        if (!goal) return res.status(404).json({ error: 'No encontrado' });
        res.json(goal);
    } catch {
        res.status(400).json({ error: 'Datos inválidos' });
    }
});

// Borrar un objetivo
router.delete('/:id', async (req, res) => {
    const userId = getUserIdFromAuthHeader(req.headers.authorization);
    if (!userId) return res.status(401).json({ error: 'No autorizado' });
    try {
        const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: userId });
        if (!goal) return res.status(404).json({ error: 'No encontrado' });
        res.json({ ok: true });
    } catch {
        res.status(400).json({ error: 'ID inválido' });
    }
});

export default router;
