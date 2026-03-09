import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TransactionsService } from '../services/transactions.service';
import { Transaction as TransactionModel } from '../services/api.models';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.html',
  styleUrls: ['./transaction.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule]
})
export class Transaction {
  private readonly formBuilder = inject(FormBuilder);
  private readonly transactionsService = inject(TransactionsService);

  readonly transactions = signal<TransactionModel[]>([]);
  readonly isLoading = signal(true);
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal('');
  readonly form = this.formBuilder.nonNullable.group({
    date: [new Date().toISOString().slice(0, 10), [Validators.required]],
    description: ['', [Validators.required, Validators.maxLength(500)]],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    category: ['', [Validators.required]],
    type: ['expense' as const, [Validators.required]],
  });

  readonly orderedTransactions = computed(() =>
    [...this.transactions()].sort((left, right) => right.date.localeCompare(left.date)),
  );

  constructor() {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.transactionsService.list().subscribe({
      next: (transactions) => {
        this.transactions.set(transactions);
        this.isLoading.set(false);
      },
      error: (error: Error) => {
        this.errorMessage.set(error.message);
        this.isLoading.set(false);
      },
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.isSubmitting.set(true);
    this.errorMessage.set('');

    this.transactionsService
      .create({
        ...value,
        date: new Date(value.date).toISOString(),
      })
      .subscribe({
        next: (transaction) => {
          this.transactions.update((current) => [transaction, ...current]);
          this.isSubmitting.set(false);
          this.form.patchValue({
            description: '',
            amount: 0,
            category: '',
            type: 'expense',
          });
        },
        error: (error: Error) => {
          this.errorMessage.set(error.message);
          this.isSubmitting.set(false);
        },
      });
  }

  remove(id: string): void {
    this.transactionsService.delete(id).subscribe({
      next: () => {
        this.transactions.update((current) => current.filter((transaction) => transaction.id !== id));
      },
      error: (error: Error) => {
        this.errorMessage.set(error.message);
      },
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  formatDate(date: string): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  }
}
