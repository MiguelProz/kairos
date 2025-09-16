import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
    email: string;
    password: string;
    name: string;
    nickname: string;
    bio?: string;
    avatarUrl?: string;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema<IUser> = new Schema({
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    nickname: { type: String, required: true, unique: true, trim: true, lowercase: true },
    bio: { type: String, default: '' },
    avatarUrl: { type: String, default: '' },
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        next(err as any);
    }
});

UserSchema.methods.comparePassword = async function (candidatePassword: string) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser>('User', UserSchema);
export default User;