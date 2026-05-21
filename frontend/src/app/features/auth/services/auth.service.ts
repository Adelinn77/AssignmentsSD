import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

const CURRENT_USER_KEY = 'currentUsername';
const AUTH_TOKEN_KEY = 'userToken';
const CURRENT_ROLE_KEY = 'currentRole';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);

  isLoggedIn = signal<boolean>(this.checkInitialLoginState());
  currentUsername = signal<string | null>(localStorage.getItem(CURRENT_USER_KEY));
  currentRole = signal<string | null>(localStorage.getItem(CURRENT_ROLE_KEY));

  private checkInitialLoginState(): boolean {
    return localStorage.getItem(CURRENT_USER_KEY) !== null && localStorage.getItem(AUTH_TOKEN_KEY) !== null;
  }

  getCurrentUsername(): string | null {
    return localStorage.getItem(CURRENT_USER_KEY);
  }

  setCurrentUsername(username: string): void {
    localStorage.setItem(CURRENT_USER_KEY, username);
    this.currentUsername.set(username);
  }

  setCurrentRole(role: string | null | undefined): void {
    if (role) {
      localStorage.setItem(CURRENT_ROLE_KEY, role);
      this.currentRole.set(role);
    }
  }

  isAdmin(): boolean {
    return localStorage.getItem(CURRENT_ROLE_KEY) === 'ADMIN';
  }

  setAuthToken(token: string): void {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    this.isLoggedIn.set(true);
  }

  getAuthToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }

  logout(): void {
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(CURRENT_ROLE_KEY);

    this.isLoggedIn.set(false);
    this.currentUsername.set(null);
    this.currentRole.set(null);

    this.router.navigate(['/auth/login']);
  }
}
