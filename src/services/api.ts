import type { User, Goal } from '../types';

// Mock API service using localStorage to simulate MongoDB functionality
class ApiService {
  private readonly USERS_KEY = 'goals_app_users';
  private readonly GOALS_KEY = 'goals_app_goals';
  private readonly CURRENT_USER_KEY = 'goals_app_current_user';

  // User management
  async login(username: string, password: string): Promise<User | null> {
    const users = this.getUsers();
    const user = users.find(u => u.username === username);
    
    // Simple password check (in real app this would be hashed)
    if (user && password === 'password') { // Basic auth for demo
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
      return user;
    }
    return null;
  }

  async register(username: string, email: string, _password: string): Promise<User | null> {
    const users = this.getUsers();
    
    // Check if user already exists
    if (users.find(u => u.username === username || u.email === email)) {
      return null;
    }

    const newUser: User = {
      id: Date.now().toString(),
      username,
      email
    };

    users.push(newUser);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(newUser));
    
    return newUser;
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(this.CURRENT_USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  logout(): void {
    localStorage.removeItem(this.CURRENT_USER_KEY);
  }

  // Goal management
  async createGoal(goal: Omit<Goal, 'id' | 'createdAt'>): Promise<Goal> {
    const goals = this.getGoalsFromStorage();
    const newGoal: Goal = {
      ...goal,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    goals.push(newGoal);
    localStorage.setItem(this.GOALS_KEY, JSON.stringify(goals));
    
    return newGoal;
  }

  async getGoals(): Promise<Goal[]> {
    return this.getGoalsFromStorage();
  }

  async getGoalsByUser(userId: string): Promise<Goal[]> {
    const goals = this.getGoalsFromStorage();
    return goals.filter(goal => goal.ownerId === userId);
  }

  async updateGoal(goalId: string, updates: Partial<Goal>): Promise<Goal | null> {
    const goals = this.getGoalsFromStorage();
    const goalIndex = goals.findIndex(g => g.id === goalId);
    
    if (goalIndex === -1) return null;

    goals[goalIndex] = { ...goals[goalIndex], ...updates };
    localStorage.setItem(this.GOALS_KEY, JSON.stringify(goals));
    
    return goals[goalIndex];
  }

  async deleteGoal(goalId: string): Promise<boolean> {
    const goals = this.getGoalsFromStorage();
    const filteredGoals = goals.filter(g => g.id !== goalId);
    
    if (filteredGoals.length === goals.length) return false;

    localStorage.setItem(this.GOALS_KEY, JSON.stringify(filteredGoals));
    return true;
  }

  // Private helper methods
  private getUsers(): User[] {
    const usersStr = localStorage.getItem(this.USERS_KEY);
    return usersStr ? JSON.parse(usersStr) : [];
  }

  private getGoalsFromStorage(): Goal[] {
    const goalsStr = localStorage.getItem(this.GOALS_KEY);
    return goalsStr ? JSON.parse(goalsStr) : [];
  }
}

export const apiService = new ApiService();