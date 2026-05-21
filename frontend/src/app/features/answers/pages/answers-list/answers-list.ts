import { Component, OnInit, inject, signal, computed } from '@angular/core';
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
  authService = inject(AuthService);

  question = signal<Question | null>(null);
  answers = signal<Answer[]>([]);
  sortedAnswers = computed<Answer[]>(() => {
    return [...this.answers()].sort((a, b) => {
      const scoreA = (a.likes || 0) - (a.dislikes || 0);
      const scoreB = (b.likes || 0) - (b.dislikes || 0);

      return scoreB - scoreA;
    });
  });
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  showAddAnswerPanel = signal<boolean>(false);

  newAnswerText = signal<string>('');
  fullscreenImageUrl = signal<string | null>(null);
  selectedAnswerImages = signal<{file: File, url: string}[]>([]);

  isEditingQuestion = signal<boolean>(false);
  editTitle = signal<string>('');
  editText = signal<string>('');

  editingAnswer = signal<Answer | null>(null);
  editAnswerText = signal<string>('');

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
    this.questionService.getQuestionById(id, this.currentUsername || undefined).subscribe({
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
    this.answerService.getAnswersByQuestionId(questionId, this.currentUsername || undefined).subscribe({
      next: (data) => {
        this.answers.set(data);
      },
      error: (err) => {
        console.error('Error fetching answers:', err);
      }
    });
  }

  isQuestionAuthor(): boolean {
    const q = this.question();
    return this.currentUsername !== null && q !== null && this.currentUsername === q.authorName;
  }

  canManageQuestion(): boolean {
    return this.isQuestionAuthor() || this.authService.isAdmin();
  }

  startEditQuestion(): void {
    const q = this.question();
    if (!q) {
      return;
    }

    this.editTitle.set(q.title);
    this.editText.set(q.text);
    this.isEditingQuestion.set(true);
  }

  cancelEditQuestion(): void {
    this.isEditingQuestion.set(false);
  }

  saveEditQuestion(): void {
    const q = this.question();
    if (!q) {
      return;
    }

    const updated: Question = {
      ...q,
      title: this.editTitle(),
      text: this.editText()
    };

    this.questionService.updateQuestion(q.title, updated).subscribe({
      next: (saved) => {
        this.question.set(saved);
        this.isEditingQuestion.set(false);
      },
      error: (err) => {
        console.error('Error updating question:', err);
        alert('Could not update question: ' + (err.error || err.message));
      }
    });
  }

  deleteQuestion(): void {
    const q = this.question();
    if (!q) {
      return;
    }

    if (!confirm(`Are you sure you want to delete "${q.title}"?`)) {
      return;
    }

    this.questionService.deleteQuestion(q.title).subscribe({
      next: () => {
        this.router.navigate(['/questions']);
      },
      error: (err) => {
        console.error('Error deleting question:', err);
        alert('Could not delete question: ' + (err.error || err.message));
      }
    });
  }

  likeQuestion(): void {
    const q = this.question();
    if (!q) {
      return;
    }

    if (!this.currentUsername) {
      alert('You must be logged in to vote.');
      return;
    }

    this.questionService.likeQuestion(q.questionId, this.currentUsername).subscribe({
      next: (updatedQuestion) => {
        this.question.set(updatedQuestion);
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  dislikeQuestion(): void {
    const q = this.question();
    if (!q) {
      return;
    }

    if (!this.currentUsername) {
      alert('You must be logged in to vote.');
      return;
    }

    this.questionService.dislikeQuestion(q.questionId, this.currentUsername).subscribe({
      next: (updatedQuestion) => {
        this.question.set(updatedQuestion);
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  isAnswerAuthor(answer: Answer): boolean {
    return this.currentUsername !== null && this.currentUsername === answer.authorName;
  }

  canManageAnswer(answer: Answer): boolean {
    return this.isAnswerAuthor(answer) || this.authService.isAdmin();
  }

  startEditAnswer(answer: Answer): void {
    this.editingAnswer.set(answer);
    this.editAnswerText.set(answer.text);
  }

  cancelEditAnswer(): void {
    this.editingAnswer.set(null);
  }

  saveEditAnswer(): void {
    const original = this.editingAnswer();
    if (!original) {
      return;
    }

    const updated: Partial<Answer> = {
      ...original,
      text: this.editAnswerText()
    };

    this.answerService.updateAnswer(original.answerId, updated).subscribe({
      next: (savedAnswer) => {
        this.answers.update(list =>
          list.map(answer => answer.answerId === original.answerId ? savedAnswer : answer)
        );
        this.editingAnswer.set(null);
      },
      error: (err) => {
        console.error('Error updating answer:', err);
        alert('Could not update answer: ' + (err.error || err.message));
      }
    });
  }

  deleteAnswer(answer: Answer): void {
    if (!confirm('Are you sure you want to delete this answer?')) {
      return;
    }

    this.answerService.deleteAnswer(answer.answerId).subscribe({
      next: () => {
        const q = this.question();
        if (q) {
          this.loadQuestion(q.questionId);
          this.loadAnswers(q.questionId);
        }
      },
      error: (err) => {
        console.error('Error deleting answer:', err);
        alert('Could not delete answer: ' + (err.error || err.message));
      }
    });
  }

  likeAnswer(answerId: number): void {
    if (!this.currentUsername) {
      alert('You must be logged in to vote.');
      return;
    }

    this.answerService.likeAnswer(answerId, this.currentUsername).subscribe({
      next: (updatedAnswer) => {
        this.answers.update(list =>
          list.map(answer => answer.answerId === answerId ? updatedAnswer : answer)
        );
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  dislikeAnswer(answerId: number): void {
    if (!this.currentUsername) {
      alert('You must be logged in to vote.');
      return;
    }

    this.answerService.dislikeAnswer(answerId, this.currentUsername).subscribe({
      next: (updatedAnswer) => {
        this.answers.update(list =>
          list.map(answer => answer.answerId === answerId ? updatedAnswer : answer)
        );
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  acceptAnswer(answer: Answer): void {
    if (!this.currentUsername) {
      alert('You can t accept an answer if you are not the author of the question.');
      return;
    }

    this.answerService.acceptAnswer(answer.answerId, this.currentUsername).subscribe({
      next: (updatedAnswer) => {
        this.answers.update(list =>
          list.map(answerItem => {
            if (answerItem.answerId === updatedAnswer.answerId) {
              return updatedAnswer;
            }
            return { ...answerItem, accepted: false };
          })
        );

        const q = this.question();
        if (q) {
          this.question.set({ ...q, status: 'RESOLVED' });
        }
      },
      error: (err) => {
        console.error('Error accepting answer:', err);
        alert('Could not accept answer: ' + (err.error || err.message));
      }
    });
  }

  getStatusClass(status: string | undefined): string {
    if (!status) {
      return '';
    }

    switch (status) {
      case 'RECEIVED':
        return 'status-received';
      case 'IN_PROGRESS':
        return 'status-in-progress';
      case 'RESOLVED':
        return 'status-resolved';
      default:
        return '';
    }
  }

  getStatusLabel(status: string | undefined): string {
    if (!status) {
      return 'N/A';
    }

    switch (status) {
      case 'RECEIVED':
        return 'Received';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'RESOLVED':
        return 'Resolved';
      default:
        return status;
    }
  }

  openAddAnswerPanel(): void {
    this.showAddAnswerPanel.set(true);
    this.errorMessage.set(null);
  }

  closeAddAnswerPanel(): void {
    this.showAddAnswerPanel.set(false);
    this.resetAnswerForm();
  }

  resetAnswerForm(): void {
    this.newAnswerText.set('');
    this.selectedAnswerImages().forEach(image => URL.revokeObjectURL(image.url));
    this.selectedAnswerImages.set([]);
  }

  postAnswer(): void {
    const text = this.newAnswerText();
    const q = this.question();

    if (!text) {
      this.errorMessage.set('Answer text is required.');
      return;
    }

    if (!q) {
      this.errorMessage.set('Question not found.');
      return;
    }

    const newAnswer: Partial<Answer> = {
      questionId: q.questionId,
      text,
      authorName: this.currentUsername ?? undefined
    };

    this.isLoading.set(true);

    const imagesToUpload = this.selectedAnswerImages().map(image => image.file);

    const request$ = imagesToUpload.length > 0
      ? this.answerService.createAnswerWithImages(newAnswer, imagesToUpload)
      : this.answerService.createAnswer(newAnswer);

    request$.subscribe({
      next: (createdAnswer) => {
        this.answers.update(answers => [...answers, createdAnswer]);
        this.closeAddAnswerPanel();
        this.isLoading.set(false);
        this.loadQuestion(q.questionId);
      },
      error: (err) => {
        console.error('Error creating answer:', err);

        let errorMsg = 'Could not create answer. Please try again.';

        if (err.error) {
          errorMsg = typeof err.error === 'string' ? err.error : err.error.message || errorMsg;
        }

        this.errorMessage.set(errorMsg);
        this.isLoading.set(false);
      }
    });
  }

  onAnswerImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files) {
      const filesArray = Array.from(input.files);
      const newImages = filesArray.map(file => ({
        file,
        url: URL.createObjectURL(file)
      }));

      this.selectedAnswerImages.update(previousImages => [...previousImages, ...newImages]);
      input.value = '';
    }
  }

  removeAnswerImage(index: number): void {
    this.selectedAnswerImages.update(images => {
      const updatedImages = [...images];
      URL.revokeObjectURL(updatedImages[index].url);
      updatedImages.splice(index, 1);
      return updatedImages;
    });
  }

  openFullscreen(imageUrl: string): void {
    this.fullscreenImageUrl.set(imageUrl);
  }

  closeFullscreen(): void {
    this.fullscreenImageUrl.set(null);
  }
}
