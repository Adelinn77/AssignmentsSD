import { Component, inject, OnInit, signal } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { CommonModule, JsonPipe } from '@angular/common';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, JsonPipe],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss'
})
export class UserProfile implements OnInit {
  private userService = inject(UserService);

  user = signal<User | null>(null);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.fetchData('ion_pop');
  }

  /**
   * Triggers the service call to retrieve user details
   */
  fetchData(username: string): void {
    this.isLoading.set(true);
    this.userService.getUserByUsername(username).subscribe({
      next: (data) => {
        this.user.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set('Failed to load user profile. Please try again.');
        this.isLoading.set(false);
        console.error('API Error:', err);
      }
    });
  }
}
