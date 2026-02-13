import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Transaction {
  id: number;
  date: Date;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
}

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
  standalone: true,
  imports: [CommonModule]
})
export class Dashboard implements OnInit {
  summary: Summary = {
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    transactionCount: 0
  };

  recentTransactions: Transaction[] = [];
  isLoading = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  private loadDashboardData() {
    // Simulate API call
    setTimeout(() => {
      this.recentTransactions = [
        {
          id: 1,
          date: new Date('2024-02-04'),
          description: 'Salary Payment',
          amount: 5000,
          category: 'Salary',
          type: 'income'
        },
        {
          id: 2,
          date: new Date('2024-02-03'),
          description: 'Grocery Shopping',
          amount: -150.50,
          category: 'Food',
          type: 'expense'
        },
        {
          id: 3,
          date: new Date('2024-02-02'),
          description: 'Electric Bill',
          amount: -85.00,
          category: 'Utilities',
          type: 'expense'
        },
        {
          id: 4,
          date: new Date('2024-02-01'),
          description: 'Freelance Project',
          amount: 1200,
          category: 'Freelance',
          type: 'income'
        },
        {
          id: 5,
          date: new Date('2024-01-31'),
          description: 'Gas Station',
          amount: -45.00,
          category: 'Transport',
          type: 'expense'
        }
      ];

      this.calculateSummary();
      this.isLoading = false;
    }, 800);
  }

  private calculateSummary() {
    this.summary.totalIncome = this.recentTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    this.summary.totalExpenses = Math.abs(
      this.recentTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)
    );

    this.summary.balance = this.summary.totalIncome - this.summary.totalExpenses;
    this.summary.transactionCount = this.recentTransactions.length;
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(amount));
  }

  getTransactionClass(type: string): string {
    return type === 'income' ? 'transaction-income' : 'transaction-expense';
  }

  navigateToTransactions() {
    this.router.navigate(['/transactions']);
  }

  navigateToReports() {
    this.router.navigate(['/reports']);
  }
}
