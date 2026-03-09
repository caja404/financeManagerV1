export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  error?: string;
  meta?: unknown;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
}

export interface AuthPayload {
  token: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  name: string;
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  userId?: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: TransactionType;
  createdAt?: string;
  updatedAt?: string;
}

export interface TransactionInput {
  date: string;
  description: string;
  amount: number;
  category: string;
  type: TransactionType;
}