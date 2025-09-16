import mongoose, { Schema, Document, Types } from 'mongoose';

export type GoalStatus = 'pending' | 'in_progress' | 'completed' | 'archived';
export type GoalPriority = 'low' | 'medium' | 'high';
export type GoalVisibility = 'private' | 'public';

export interface IGoalMilestone {
    title: string;
    done: boolean;
    dueDate?: Date;
    notes?: string;
}

export interface IGoalReminder {
    date: Date;
    message?: string;
    sent: boolean;
}

export interface IGoal extends Document {
    user: Types.ObjectId;
    title: string;
    description?: string;
    category?: string; // e.g., health, career, learning, finance, personal
    status: GoalStatus;
    priority: GoalPriority;
    startDate?: Date;
    dueDate?: Date;
    progress: number; // 0-100
    tags: string[];
    milestones: IGoalMilestone[];
    reminders: IGoalReminder[];
    visibility: GoalVisibility;
    targetValue?: number; // objetivo cuantitativo opcional
    currentValue?: number; // progreso cuantitativo opcional
    unit?: string; // unidad para target/current (p. ej. "km", "lecturas")
    streakCount?: number; // racha de días cumplidos
    createdAt: Date;
    updatedAt: Date;
}

const MilestoneSchema = new Schema<IGoalMilestone>({
    title: { type: String, required: true, trim: true },
    done: { type: Boolean, default: false },
    dueDate: { type: Date },
    notes: { type: String, trim: true, default: '' },
}, { _id: false });

const ReminderSchema = new Schema<IGoalReminder>({
    date: { type: Date, required: true },
    message: { type: String, trim: true, default: '' },
    sent: { type: Boolean, default: false },
}, { _id: false });

const GoalSchema: Schema<IGoal> = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    category: { type: String, trim: true, default: '' },
    status: { type: String, enum: ['pending', 'in_progress', 'completed', 'archived'], default: 'pending', index: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium', index: true },
    startDate: { type: Date },
    dueDate: { type: Date },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    tags: { type: [String], default: [] },
    milestones: { type: [MilestoneSchema], default: [] },
    reminders: { type: [ReminderSchema], default: [] },
    visibility: { type: String, enum: ['private', 'public'], default: 'private' },
    targetValue: { type: Number },
    currentValue: { type: Number },
    unit: { type: String, trim: true, default: '' },
    streakCount: { type: Number, default: 0 },
}, { timestamps: true });

GoalSchema.index({ user: 1, status: 1, priority: 1 });
GoalSchema.index({ user: 1, title: 'text', description: 'text', tags: 'text', category: 'text' });

const Goal = mongoose.model<IGoal>('Goal', GoalSchema);
export default Goal;
