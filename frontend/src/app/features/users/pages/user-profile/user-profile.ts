import {Component, inject, Input, OnInit, signal} from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { CommonModule, JsonPipe } from '@angular/common';
import {ActivatedRoute, RouterLink} from '@angular/router';
import { Question } from '../../../questions/models/question.model';
import { QuestionService } from '../../../questions/services/question.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, JsonPipe, RouterLink],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss'
})
export class UserProfile implements OnInit {
  @Input() username!: string;

  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  private questionService = inject(QuestionService);

  user = signal<User | null>(null);
  userQuestions = signal<Question[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    const routeUsername = this.route.snapshot.paramMap.get('username');

    const targetUsername = routeUsername || this.username;

    if (targetUsername) {
      this.fetchData(targetUsername);
      this.fetchUserQuestions(targetUsername);
    }
  }

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

  fetchUserQuestions(username: string): void {
    this.questionService.getQuestionsByAuthor(username).subscribe({
      next: (data) => {
        this.userQuestions.set(data);
      },
      error: (err) => {
        console.error('API Error loading questions:', err);
      }
    });
  }
}
