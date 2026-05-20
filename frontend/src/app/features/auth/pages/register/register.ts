import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private router = inject(Router);

  username = signal<string>('');
  email = signal<string>('');
  password = signal<string>('');
  firstName = signal<string>('');
  lastName = signal<string>('');
  phone = signal<string>('');

  isLoading = signal<boolean>(false);
  errorMsg = signal<string | null>(null);

  register(): void {
    const username = this.username().trim();
    const email = this.email().trim();
    const password = this.password().trim();
    const firstName = this.firstName().trim();
    const lastName = this.lastName().trim();
    const phone = this.phone().trim();

    if (!username || !email || !password || !phone) {
      this.errorMsg.set('Username, email, password and phone number are required.');
      return;
    }

    this.errorMsg.set(null);
    this.isLoading.set(true);

    const body = { username, email, password, firstName, lastName, phone };

    this.http
      .post('http://localhost:8080/api/auth/register', body, { responseType: 'text' })
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          alert('Account created successfully! Now you can log in.');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.isLoading.set(false);
          if (err.status === 400) {
            this.errorMsg.set(err.error || 'Username already taken!');
          } else {
            this.errorMsg.set('Error occurred while creating the account. Please try again later.');
          }
        },
      });
  }
}
