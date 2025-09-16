export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  owner: string;
  ownerId: string;
  dueDate: string;
  createdAt: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}