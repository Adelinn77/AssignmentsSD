import {Component, inject, Input, OnInit, signal} from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { CommonModule, JsonPipe } from '@angular/common';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, JsonPipe],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss'
})
export class UserProfile implements OnInit {
  @Input() username!: string;

  private route = inject(ActivatedRoute);
  private userService = inject(UserService);


  user = signal<User | null>(null);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    const routeUsername = this.route.snapshot.paramMap.get('username');

    // This correctly holds "ion_pop" from the URL
    const targetUsername = routeUsername || this.username;

    // MODIFIED: Check targetUsername instead of this.username
    if (targetUsername) {
      // MODIFIED: Pass targetUsername to the fetch function
      this.fetchData(targetUsername);
    }
  }

  /**
   * Triggers the service call to retrieve user details
   * (Remains exactly as you wrote it)
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
