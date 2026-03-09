import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionsService } from '../services/transactions.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.html',
  styleUrls: ['./reports.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class Reports {
  private readonly transactionsService = inject(TransactionsService);

  readonly isLoading = signal(true);
  readonly errorMessage = signal('');
  readonly totals = signal({ income: 0, expense: 0 });
  readonly topCategories = signal<Array<{ category: string; amount: number }>>([]);
  readonly netCashflow = computed(() => this.totals().income - this.totals().expense);

  constructor() {
    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.transactionsService.list().subscribe({
      next: (transactions) => {
        const income = transactions
          .filter((transaction) => transaction.type === 'income')
          .reduce((sum, transaction) => sum + transaction.amount, 0);
        const expense = transactions
          .filter((transaction) => transaction.type === 'expense')
          .reduce((sum, transaction) => sum + transaction.amount, 0);
        const grouped = new Map<string, number>();

        for (const transaction of transactions) {
          const currentAmount = grouped.get(transaction.category) ?? 0;
          grouped.set(transaction.category, currentAmount + transaction.amount);
        }

        this.totals.set({ income, expense });
        this.topCategories.set(
          [...grouped.entries()]
            .map(([category, amount]) => ({ category, amount }))
            .sort((left, right) => right.amount - left.amount)
            .slice(0, 5),
        );
        this.isLoading.set(false);
      },
      error: (error: Error) => {
        this.errorMessage.set(error.message);
        this.isLoading.set(false);
      },
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }
}
