import { z } from "zod"

export const schema = z.object({
    // id numérico para DnD y selección
    id: z.number(),
    // id real del objetivo en backend
    goalId: z.string(),
    title: z.string(),
    category: z.string().optional().default("-"),
    status: z.enum(["pending", "in_progress", "completed", "archived"]),
    priority: z.enum(["low", "medium", "high"]),
    progress: z.number(),
    dueDate: z.string().optional(), // fecha formateada o ISO
    createdAt: z.string().optional(),
})

export type DatatableRow = z.infer<typeof schema>
