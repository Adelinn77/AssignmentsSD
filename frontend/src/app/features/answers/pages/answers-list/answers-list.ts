import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { QuestionService } from '../../../questions/services/question.service';
import { AnswerService } from '../../services/answer.service';
import { Question } from '../../../questions/models/question.model';
import { Answer } from '../../models/answer.model';

@Component({
  selector: 'app-question-answer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './answers-list.html',
  styleUrl: './answers-list.scss'
})
export class AnswersList implements OnInit {
  private route = inject(ActivatedRoute);
  private questionService = inject(QuestionService);
  private answerService = inject(AnswerService);

  question = signal<Question | null>(null);
  answers = signal<Answer[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

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
      next: (data) => {
        this.question.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching question:', err);
        this.errorMessage.set('Could not load question. Please try again later.');
        this.isLoading.set(false);
      }
    });
  }

  loadAnswers(questionId: number): void {
    this.answerService.getAnswersByQuestionId(questionId).subscribe({
      next: (data) => {
        this.answers.set(data);
      },
      error: (err) => {
        console.error('Error fetching answers:', err);
      }
    });
  }

  likeQuestion(): void {
    const q = this.question();
    if (q) {
      this.questionService.likeQuestion(q.questionId).subscribe({
        next: (updated) => this.question.set(updated),
        error: (err) => console.error('Error liking question:', err)
      });
    }
  }

  dislikeQuestion(): void {
    const q = this.question();
    if (q) {
      this.questionService.dislikeQuestion(q.questionId).subscribe({
        next: (updated) => this.question.set(updated),
        error: (err) => console.error('Error disliking question:', err)
      });
    }
  }

  likeAnswer(answerId: number): void {
    this.answerService.likeAnswer(answerId).subscribe({
      next: (updated) => {
        this.answers.update(list =>
          list.map(a => a.answerId === answerId ? updated : a)
        );
      },
      error: (err) => console.error('Error liking answer:', err)
    });
  }

  dislikeAnswer(answerId: number): void {
    this.answerService.dislikeAnswer(answerId).subscribe({
      next: (updated) => {
        this.answers.update(list =>
          list.map(a => a.answerId === answerId ? updated : a)
        );
      },
      error: (err) => console.error('Error disliking answer:', err)
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
