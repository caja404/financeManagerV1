import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { ApiEnvelope, Transaction, TransactionInput } from './api.models';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class TransactionsService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  list(): Observable<Transaction[]> {
    return this.http
      .get<ApiEnvelope<Transaction[]>>(`${API_BASE_URL}/transactions`, {
        headers: this.authService.authHeaders(),
      })
      .pipe(
        map((response) => response.data),
        catchError((error: HttpErrorResponse) => throwError(() => new Error(this.getErrorMessage(error)))),
      );
  }

  create(payload: TransactionInput): Observable<Transaction> {
    return this.http
      .post<ApiEnvelope<Transaction>>(`${API_BASE_URL}/transactions`, payload, {
        headers: this.authService.authHeaders(),
      })
      .pipe(
        map((response) => response.data),
        catchError((error: HttpErrorResponse) => throwError(() => new Error(this.getErrorMessage(error)))),
      );
  }

  delete(id: string): Observable<void> {
    return this.http
      .delete<ApiEnvelope<{ message: string }>>(`${API_BASE_URL}/transactions/${id}`, {
        headers: this.authService.authHeaders(),
      })
      .pipe(
        map(() => undefined),
        catchError((error: HttpErrorResponse) => throwError(() => new Error(this.getErrorMessage(error)))),
      );
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    return error.error?.error ?? error.error?.message ?? 'Unable to reach the server.';
  }
}