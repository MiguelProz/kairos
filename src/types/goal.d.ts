// Tipo Goal (alineado con el backend)
type Goal = {
  _id: string;
  title: string;
  description?: string;
  category?: string;
  status: "pending" | "in_progress" | "completed" | "archived";
  priority: "low" | "medium" | "high";
  progress?: number;
  dueDate?: string;
  createdAt: string;
  updatedAt?: string;
};

export type { Goal };