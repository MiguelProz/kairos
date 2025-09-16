// Script para insertar un usuario en MongoDB con contraseña hasheada
// Uso: npx ts-node scripts/createUser.ts <email> <password>

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../src/user.model';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tu_basededatos';

async function main() {
    const [, , email, password] = process.argv;
    if (!email || !password) {
        console.error('Uso: npx ts-node scripts/createUser.ts <email> <password>');
        process.exit(1);
    }
    await mongoose.connect(MONGO_URI);
    const hash = await bcrypt.hash(password, 10);
    const exists = await User.findOne({ email });
    if (exists) {
        console.error('El usuario ya existe');
        process.exit(1);
    }
    await User.create({ email, password: hash });
    console.log('Usuario creado:', email);
    await mongoose.disconnect();
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
