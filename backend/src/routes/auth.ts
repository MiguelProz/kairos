import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../user.model';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecreto';

// Registro
router.post('/register', async (req, res) => {
    const { email, password, name, nickname, bio, avatarUrl } = req.body as { email: string; password: string; name: string; nickname: string; bio?: string; avatarUrl?: string };
    if (!email || !password || !name || !nickname) return res.status(400).json({ error: 'Faltan datos' });
    try {
        const exists = await User.findOne({ $or: [{ email }, { nickname }] });
        if (exists) return res.status(409).json({ error: 'Email o nickname ya en uso' });
        const user = new User({ email, password, name, nickname, bio, avatarUrl });
        await user.save();
        res.status(201).json({ message: 'Usuario creado' });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Faltan datos' });
    try {
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Obtener usuario autenticado
router.get('/me', async (req, res) => {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: 'No autorizado' });
    const token = auth.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
        const user = await User.findById(decoded.id).select('-password');
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json(user);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
        res.status(401).json({ error: 'Token inválido' });
    }
});

// Actualizar usuario autenticado (email y/o contraseña)
router.put('/me', async (req, res) => {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: 'No autorizado' });
    const token = auth.split(' ')[1];
    const { email, currentPassword, newPassword, name, nickname, bio, avatarUrl } = req.body as { email?: string; currentPassword?: string; newPassword?: string; name?: string; nickname?: string; bio?: string; avatarUrl?: string };

    if (!email && !newPassword && !name && !nickname && bio === undefined && avatarUrl === undefined) {
        return res.status(400).json({ error: 'No hay cambios para aplicar' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

        // Cambiar email si se envía
        if (email && email !== user.email) {
            const exists = await User.findOne({ email });
            if (exists) return res.status(409).json({ error: 'Email ya está en uso' });
            user.email = email;
        }

        // Cambiar name
        if (name) user.name = name;

        // Cambiar nickname (único)
        if (nickname && nickname !== user.nickname) {
            const nickExists = await User.findOne({ nickname });
            if (nickExists) return res.status(409).json({ error: 'Nickname ya está en uso' });
            user.nickname = nickname;
        }

        // Cambiar bio y avatarUrl si se pasan
        if (bio !== undefined) user.bio = bio;
        if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

        // Cambiar contraseña si se envía
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ error: 'Falta la contraseña actual' });
            }
            const ok = await user.comparePassword(currentPassword);
            if (!ok) return res.status(401).json({ error: 'Contraseña actual incorrecta' });
            user.password = newPassword; // será hasheada por el pre-save
        }

        await user.save();
        const safeUser = await User.findById(user._id).select('-password');
        res.json(safeUser);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
        res.status(401).json({ error: 'Token inválido' });
    }
});

export default router;
