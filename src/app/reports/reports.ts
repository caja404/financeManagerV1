import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reports',
  template: `
    <div class="placeholder-page">
      <h1>Reports</h1>
      <p>Financial reports and analytics coming soon...</p>
    </div>
  `,
  styles: [`
    .placeholder-page {
      padding: 4rem 2rem;
      text-align: center;
      color: rgba(255, 255, 255, 0.7);
    }
    h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }
  `],
  standalone: true,
  imports: [CommonModule]
})
export class Reports {}
