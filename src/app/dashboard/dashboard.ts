import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TransactionsService } from '../services/transactions.service';
import { Transaction } from '../services/api.models';

interface Summary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class Dashboard {
  private readonly router = inject(Router);
  private readonly transactionsService = inject(TransactionsService);

  readonly recentTransactions = signal<Transaction[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');
  readonly summary = computed<Summary>(() => {
    const transactions = this.recentTransactions();
    const totalIncome = transactions
      .filter((transaction) => transaction.type === 'income')
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    const totalExpenses = transactions
      .filter((transaction) => transaction.type === 'expense')
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      transactionCount: transactions.length,
    };
  });

  constructor() {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.transactionsService.list().subscribe({
      next: (transactions) => {
        this.recentTransactions.set(transactions.slice(0, 5));
        this.isLoading.set(false);
      },
      error: (error: Error) => {
        this.errorMessage.set(error.message);
        this.isLoading.set(false);
      },
    });
  }

  formatDate(date: string): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  navigateToTransactions(): void {
    void this.router.navigate(['/transactions']);
  }

  navigateToReports(): void {
    void this.router.navigate(['/reports']);
  }
}
