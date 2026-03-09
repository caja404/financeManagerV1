import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { ApiEnvelope, AuthPayload, LoginPayload, RegisterPayload, User } from './api.models';

const TOKEN_KEY = 'finance-monitor.token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly token = signal<string | null>(this.readStoredToken());
  readonly user = signal<User | null>(null);
  readonly isAuthenticated = computed(() => this.token() !== null);

  constructor() {
    if (this.token()) {
      this.loadCurrentUser().subscribe({
        error: () => undefined,
      });
    }
  }

  login(payload: LoginPayload): Observable<User> {
    return this.http.post<ApiEnvelope<AuthPayload>>(`${API_BASE_URL}/auth/login`, payload).pipe(
      tap((response) => this.persistSession(response.data)),
      map((response) => response.data.user),
      catchError((error: HttpErrorResponse) => throwError(() => new Error(this.getErrorMessage(error)))),
    );
  }

  register(payload: RegisterPayload): Observable<User> {
    return this.http
      .post<ApiEnvelope<AuthPayload>>(`${API_BASE_URL}/auth/register`, payload)
      .pipe(
        tap((response) => this.persistSession(response.data)),
        map((response) => response.data.user),
        catchError((error: HttpErrorResponse) =>
          throwError(() => new Error(this.getErrorMessage(error))),
        ),
      );
  }

  loadCurrentUser(): Observable<User | null> {
    if (!this.token()) {
      return of(null);
    }

    return this.http
      .get<ApiEnvelope<User>>(`${API_BASE_URL}/auth/me`, {
        headers: this.authHeaders(),
      })
      .pipe(
        tap((response) => this.user.set(response.data)),
        map((response) => response.data),
        catchError((error: HttpErrorResponse) => {
          this.clearSession(false);
          return throwError(() => new Error(this.getErrorMessage(error)));
        }),
      );
  }

  authHeaders(): HttpHeaders {
    const token = this.token();

    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }

  logout(redirect = true): void {
    this.clearSession(redirect);
  }

  private persistSession(payload: AuthPayload): void {
    localStorage.setItem(TOKEN_KEY, payload.token);
    this.token.set(payload.token);
    this.user.set(payload.user);
  }

  private clearSession(redirect: boolean): void {
    localStorage.removeItem(TOKEN_KEY);
    this.token.set(null);
    this.user.set(null);

    if (redirect) {
      void this.router.navigate(['/login']);
    }
  }

  private readStoredToken(): string | null {
    return typeof localStorage === 'undefined' ? null : localStorage.getItem(TOKEN_KEY);
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    return error.error?.error ?? error.error?.message ?? 'Unable to reach the server.';
  }
}