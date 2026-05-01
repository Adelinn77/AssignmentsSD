import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { QuestionService } from '../../../questions/services/question.service';
import { AnswerService } from '../../services/answer.service';
import { Question } from '../../../questions/models/question.model';
import { Answer } from '../../models/answer.model';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-question-answer',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './answers-list.html',
  styleUrl: './answers-list.scss'
})
export class AnswersList implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private questionService = inject(QuestionService);
  private answerService = inject(AnswerService);
  private authService = inject(AuthService);

  question = signal<Question | null>(null);
  answers = signal<Answer[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  isEditingQuestion = signal<boolean>(false);
  editTitle = signal<string>('');
  editText = signal<string>('');

  currentUsername = this.authService.getCurrentUsername();

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadQuestion(id);
      this.loadAnswers(id);
    }
  }

  loadQuestion(id: number): void {
    this.isLoading.set(true);
    this.questionService.getQuestionById(id).subscribe({
      next: (data) => { this.question.set(data); this.isLoading.set(false); },
      error: (err) => {
        console.error('Error fetching question:', err);
        this.errorMessage.set('Could not load question. Please try again later.');
        this.isLoading.set(false);
      }
    });
  }

  loadAnswers(questionId: number): void {
    this.answerService.getAnswersByQuestionId(questionId).subscribe({
      next: (data) => { this.answers.set(data); },
      error: (err) => { console.error('Error fetching answers:', err); }
    });
  }

  isQuestionAuthor(): boolean {
    const q = this.question();
    return this.currentUsername !== null && q !== null && this.currentUsername === q.authorName;
  }

  startEditQuestion(): void {
    const q = this.question();
    if (!q) return;
    this.editTitle.set(q.title);
    this.editText.set(q.text);
    this.isEditingQuestion.set(true);
  }

  cancelEditQuestion(): void { this.isEditingQuestion.set(false); }

  saveEditQuestion(): void {
    const q = this.question();
    if (!q) return;
    const updated: Question = { ...q, title: this.editTitle(), text: this.editText() };
    this.questionService.updateQuestion(q.title, updated).subscribe({
      next: (saved) => { this.question.set(saved); this.isEditingQuestion.set(false); },
      error: (err) => { console.error('Error updating question:', err); alert('Could not update question: ' + (err.error || err.message)); }
    });
  }

  deleteQuestion(): void {
    const q = this.question();
    if (!q) return;
    if (!confirm(`Are you sure you want to delete "${q.title}"?`)) return;
    this.questionService.deleteQuestion(q.title).subscribe({
      next: () => { this.router.navigate(['/questions']); },
      error: (err) => { console.error('Error deleting question:', err); alert('Could not delete question: ' + (err.error || err.message)); }
    });
  }

  likeQuestion(): void {
    const q = this.question();
    if (q) this.questionService.likeQuestion(q.questionId).subscribe({ next: (u) => this.question.set(u), error: (e) => console.error(e) });
  }

  dislikeQuestion(): void {
    const q = this.question();
    if (q) this.questionService.dislikeQuestion(q.questionId).subscribe({ next: (u) => this.question.set(u), error: (e) => console.error(e) });
  }

  likeAnswer(answerId: number): void {
    this.answerService.likeAnswer(answerId).subscribe({
      next: (u) => { this.answers.update(list => list.map(a => a.answerId === answerId ? u : a)); },
      error: (e) => console.error(e)
    });
  }

  dislikeAnswer(answerId: number): void {
    this.answerService.dislikeAnswer(answerId).subscribe({
      next: (u) => { this.answers.update(list => list.map(a => a.answerId === answerId ? u : a)); },
      error: (e) => console.error(e)
    });
  }

  getStatusClass(status: string | undefined): string {
    if (!status) return '';
    switch (status) {
      case 'RECEIVED': return 'status-received';
      case 'IN_PROGRESS': return 'status-in-progress';
      case 'RESOLVED': return 'status-resolved';
      default: return '';
    }
  }

  getStatusLabel(status: string | undefined): string {
    if (!status) return 'N/A';
    switch (status) {
      case 'RECEIVED': return 'Received';
      case 'IN_PROGRESS': return 'In Progress';
      case 'RESOLVED': return 'Resolved';
      default: return status;
    }
  }
}
