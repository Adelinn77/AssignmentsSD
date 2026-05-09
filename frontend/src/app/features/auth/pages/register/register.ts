import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../users/services/user.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private router = inject(Router);

  username  = signal<string>('');
  email     = signal<string>('');
  firstName = signal<string>('');
  lastName  = signal<string>('');
  phone     = signal<string>('');

  isLoading  = signal<boolean>(false);
  errorMsg   = signal<string | null>(null);

  register(): void {
    const username  = this.username().trim();
    const email     = this.email().trim();
    const firstName = this.firstName().trim();
    const lastName  = this.lastName().trim();
    const phone     = this.phone().trim();

    if (!username || !email) {
      this.errorMsg.set('Username and email are required.');
      return;
    }

    this.errorMsg.set(null);
    this.isLoading.set(true);

    this.userService.createUser({ username, email, firstName, lastName, phone }).subscribe({
      next: () => {
        this.authService.setCurrentUsername(username);
        this.isLoading.set(false);
        this.router.navigate(['/questions']);
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.status === 409) {
          this.errorMsg.set(err.error || 'Username or email already exists.');
        } else if (err.error) {
          this.errorMsg.set(typeof err.error === 'string' ? err.error : err.error.message || 'Registration failed.');
        } else {
          this.errorMsg.set('Could not create account. Please try again.');
        }
      }
    });
  }
}
