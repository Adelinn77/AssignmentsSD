import {Injectable, inject, signal} from '@angular/core';
import { Router } from '@angular/router';

const CURRENT_USER_KEY = 'currentUsername';
const AUTH_TOKEN_KEY = 'userToken';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);

  isLoggedIn = signal<boolean>(this.checkInitialLoginState());
  currentUsername = signal<string | null>(sessionStorage.getItem(CURRENT_USER_KEY));

  private checkInitialLoginState(): boolean {
    return sessionStorage.getItem(CURRENT_USER_KEY) !== null && sessionStorage.getItem(AUTH_TOKEN_KEY) !== null;
  }

  getCurrentUsername(): string | null {
    return sessionStorage.getItem(CURRENT_USER_KEY);
  }

  setCurrentUsername(username: string): void {
    sessionStorage.setItem(CURRENT_USER_KEY, username);
    this.currentUsername.set(username);
  }

  setAuthToken(token: string): void {
    sessionStorage.setItem(AUTH_TOKEN_KEY, token);
    this.isLoggedIn.set(true);
  }

  getAuthToken(): string | null {
    return sessionStorage.getItem(AUTH_TOKEN_KEY);
  }

  logout(): void {
    sessionStorage.removeItem(CURRENT_USER_KEY);
    sessionStorage.removeItem(AUTH_TOKEN_KEY);

    this.isLoggedIn.set(false);
    this.currentUsername.set(null);

    this.router.navigate(['/auth/login']);
  }

}
