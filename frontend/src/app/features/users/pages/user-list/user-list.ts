import { Component, inject, OnInit, signal } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [],
  templateUrl: './user-list.html',
  styleUrl: './user-list.scss',
})
export class UserList implements OnInit {
  private userService = inject(UserService);
  authService = inject(AuthService);

  users = signal<User[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.fetchAllUsers();
  }

  fetchAllUsers(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set('Could not load users. Please try again later.');
        this.isLoading.set(false);
        console.error('API Error:', err);
      },
    });
  }

  blockUser(user: User): void {
    this.userService.blockUser(user.username).subscribe({
      next: (updatedUser) => {
        this.users.update((list) =>
          list.map((u) => u.username === updatedUser.username ? updatedUser : u)
        );
      },
      error: (err) => {
        this.errorMessage.set(err.error || 'Could not block user.');
      },
    });
  }

  unblockUser(user: User): void {
    this.userService.unblockUser(user.username).subscribe({
      next: (updatedUser) => {
        this.users.update((list) =>
          list.map((u) => u.username === updatedUser.username ? updatedUser : u)
        );
      },
      error: (err) => {
        this.errorMessage.set(err.error || 'Could not unblock user.');
      },
    });
  }
}
