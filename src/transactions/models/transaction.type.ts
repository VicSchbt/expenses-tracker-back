import { TransactionType, Recurrence } from '@prisma/client';

export type Transaction = {
  id: string;
  userId: string;
  label: string;
  date: Date;
  value: number;
  type: TransactionType;
  categoryId: string | null;
  goalId: string | null;
  recurrence: Recurrence | null;
  isPaid: boolean | null;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

