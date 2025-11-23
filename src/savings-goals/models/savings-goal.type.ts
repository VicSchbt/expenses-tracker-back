export type SavingsGoal = {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  dueDate: Date | null;
  createdAt: Date;
};

