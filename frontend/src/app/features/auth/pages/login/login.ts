import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);

  username = signal<string>('');
  password = signal<string>('');

  login(): void {
    const name = this.username().trim();
    if (!name) {
      alert('Please enter a username.');
      return;
    }
    this.authService.setCurrentUsername(name);
    this.router.navigate(['/questions']);
  }
}
