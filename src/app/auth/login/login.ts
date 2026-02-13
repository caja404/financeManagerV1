import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink]
})
export class Login {
  email = '';
  password = '';
  error = '';
  isLoading = false;

  constructor(private router: Router) {}

  onSubmit() {
    this.error = '';
    this.isLoading = true;

    // Simulate API call
    setTimeout(() => {
      if (this.email === 'user@example.com' && this.password === 'password') {
        this.router.navigate(['/']);
      } else {
        this.error = 'Invalid email or password';
        this.isLoading = false;
      }
    }, 800);
  }
}