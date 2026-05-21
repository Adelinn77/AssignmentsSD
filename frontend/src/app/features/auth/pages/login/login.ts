import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);
  private http = inject(HttpClient);

  username = signal<string>('');
  password = signal<string>('');
  errorMsg = signal<string | null>(null);
  isLoading = signal<boolean>(false);

  login(): void {
    const name = this.username().trim();
    const pass = this.password().trim();

    if (!name || !pass) {
      this.errorMsg.set('Your username and password are required.');
      return;
    }

    this.isLoading.set(true);
    this.errorMsg.set(null);

    sessionStorage.removeItem('userToken');

    const credentials = btoa(`${name}:${pass}`);
    const headers = new HttpHeaders({
      Authorization: `Basic ${credentials}`,
    });

    this.http
      .get(`http://localhost:8080/api/users/${name}`, { headers, responseType: 'json' })
      .subscribe({
        next: () => {
          this.authService.setAuthToken(credentials);
          this.authService.setCurrentUsername(name);

          this.isLoading.set(false);
          this.router.navigate(['/questions']);
        },
        error: (err) => {
          this.isLoading.set(false);
          if (err.status === 401) {
            this.errorMsg.set('Username or password is incorrect. Please try again.');
          } else {
            this.errorMsg.set('Error connecting to the server. Please try again later.');
          }
        },
      });
  }
}
