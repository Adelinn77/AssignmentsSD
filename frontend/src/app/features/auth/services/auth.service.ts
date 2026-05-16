import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

const CURRENT_USER_KEY = 'currentUsername';
const AUTH_TOKEN_KEY = 'userToken';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);

  getCurrentUsername(): string | null {
    return localStorage.getItem(CURRENT_USER_KEY);
  }

  setCurrentUsername(username: string): void {
    localStorage.setItem(CURRENT_USER_KEY, username);
  }

  setAuthToken(token: string): void {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }

  getAuthToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }

  logout(): void {
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return localStorage.getItem(CURRENT_USER_KEY) !== null && localStorage.getItem(AUTH_TOKEN_KEY) !== null;
  }
}
