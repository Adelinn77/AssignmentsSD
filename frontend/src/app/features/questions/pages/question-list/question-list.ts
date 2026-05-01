import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { QuestionService } from '../../services/question.service';
import { Question } from '../../models/question.model';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-question-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './question-list.html',
  styleUrl: './question-list.scss'
})
export class QuestionList implements OnInit {
  private questionService = inject(QuestionService);
  private authService = inject(AuthService);

  questions = signal<Question[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  // Edit state
  editingQuestion = signal<Question | null>(null);
  editTitle = signal<string>('');
  editText = signal<string>('');

  currentUsername = this.authService.getCurrentUsername();

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

  isAuthor(question: Question): boolean {
    return this.currentUsername !== null && this.currentUsername === question.authorName;
  }

  startEdit(question: Question): void {
    this.editingQuestion.set(question);
    this.editTitle.set(question.title);
    this.editText.set(question.text);
  }

  cancelEdit(): void {
    this.editingQuestion.set(null);
  }

  saveEdit(): void {
    const original = this.editingQuestion();
    if (!original) return;

    const updated: Question = {
      ...original,
      title: this.editTitle(),
      text: this.editText()
    };

    this.questionService.updateQuestion(original.title, updated).subscribe({
      next: (savedQuestion) => {
        this.questions.update(list =>
          list.map(q => q.questionId === original.questionId ? savedQuestion : q)
        );
        this.editingQuestion.set(null);
      },
      error: (err) => {
        console.error('Error updating question:', err);
        alert('Could not update question: ' + (err.error || err.message));
      }
    });
  }

  deleteQuestion(question: Question): void {
    if (!confirm(`Are you sure you want to delete "${question.title}"?`)) return;

    this.questionService.deleteQuestion(question.title).subscribe({
      next: () => {
        this.questions.update(list => list.filter(q => q.questionId !== question.questionId));
      },
      error: (err) => {
        console.error('Error deleting question:', err);
        alert('Could not delete question: ' + (err.error || err.message));
      }
    });
  }
}
