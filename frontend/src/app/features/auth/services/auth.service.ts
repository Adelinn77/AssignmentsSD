import { Injectable } from '@angular/core';

const CURRENT_USER_KEY = 'currentUsername';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  getCurrentUsername(): string | null {
    return localStorage.getItem(CURRENT_USER_KEY);
  }

  setCurrentUsername(username: string): void {
    localStorage.setItem(CURRENT_USER_KEY, username);
  }

  clearCurrentUsername(): void {
    localStorage.removeItem(CURRENT_USER_KEY);
  }

  isLoggedIn(): boolean {
    return this.getCurrentUsername() !== null;
  }
}
