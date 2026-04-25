import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuestionService } from '../../services/question.service';
import { Question } from '../../models/question.model';

@Component({
  selector: 'app-question-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './question-list.html',
  styleUrl: './question-list.scss'
})
export class QuestionList implements OnInit {
  private questionService = inject(QuestionService);

  questions = signal<Question[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadQuestions();
  }

  loadQuestions(): void {
    this.isLoading.set(true);
    this.questionService.getAllQuestions().subscribe({
      next: (data) => {
        this.questions.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching questions:', err);
        this.errorMessage.set('Could not load questions. Please try again later.');
        this.isLoading.set(false);
      }
    });
  }
}
