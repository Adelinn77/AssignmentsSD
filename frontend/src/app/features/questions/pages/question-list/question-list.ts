import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { QuestionService } from '../../services/question.service';
import { Question, Status } from '../../models/question.model';

@Component({
  selector: 'app-question-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './question-list.html',
  styleUrl: './question-list.scss'
})
export class QuestionList implements OnInit {
  private questionService = inject(QuestionService);

  questions = signal<Question[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  showAddQuestionPanel = signal<boolean>(false);

  newQuestionTitle = signal<string>('');
  newQuestionText = signal<string>('');
  newQuestionTags = signal<string>('');
  selectedImages = signal<{file: File, url: string}[]>([]);

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

  openAddQuestionPanel(): void {
    this.showAddQuestionPanel.set(true);
    this.errorMessage.set(null);
  }

  closeAddQuestionPanel(): void {
    this.showAddQuestionPanel.set(false);
    this.resetForm();
  }

  resetForm(): void {
    this.newQuestionTitle.set('');
    this.newQuestionText.set('');
    this.newQuestionTags.set('');
    this.selectedImages().forEach(img => URL.revokeObjectURL(img.url));
    this.selectedImages.set([]);
  }

  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const filesArray = Array.from(input.files);
      const newImages = filesArray.map(file => ({
        file,
        url: URL.createObjectURL(file)
      }));

      this.selectedImages.update(prev => [...prev, ...newImages]);

      input.value = '';
    }
  }

  removeImage(index: number): void {
    this.selectedImages.update(images => images.filter((_, i) => i !== index));
  }

  // postQuestion(): void {
  //   const title = this.newQuestionTitle();
  //   const text = this.newQuestionText();
  //   const tagsString = this.newQuestionTags();
  //
  //   if (!title || !text) {
  //     this.errorMessage.set('Title and text are required.');
  //     return;
  //   }
  //
  //   const tags = tagsString
  //     .split(',')
  //     .map(tag => tag.trim())
  //     .filter(tag => tag.length > 0);
  //
  //   const newQuestion: Partial<Question> = {
  //     title,
  //     text,
  //     tags,
  //     status: Status.RECEIVED,
  //     authorName: 'ion_pop' // TODO: Replace with actual logged-in user
  //   };
  //
  //   this.isLoading.set(true);
  //   this.questionService.createQuestion(newQuestion).subscribe({
  //     next: (createdQuestion) => {
  //       this.questions.update(questions => [...questions, createdQuestion]);
  //       this.closeAddQuestionPanel();
  //       this.isLoading.set(false);
  //     },
  //     error: (err) => {
  //       console.error('Error creating question:', err);
  //       let errorMsg = 'Could not create question. Please try again.';
  //
  //       if (err.status === 409) {
  //         errorMsg = err.error || 'This title is already used by another question.';
  //       } else if (err.error) {
  //         errorMsg = typeof err.error === 'string' ? err.error : err.error.message || errorMsg;
  //       }
  //
  //       this.errorMessage.set(errorMsg);
  //       this.isLoading.set(false);
  //     }
  //   });
  // }


  postQuestion(): void {
    const title = this.newQuestionTitle();
    const text = this.newQuestionText();
    const tagsString = this.newQuestionTags();

    if (!title || !text) {
      this.errorMessage.set('Title and text are required.');
      return;
    }

    const tags = tagsString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const newQuestion: Partial<Question> = {
      title,
      text,
      tags,
      status: Status.RECEIVED,
      authorName: 'ion_pop' // TODO: Replace with actual logged-in user
    };

    this.isLoading.set(true);

    const imagesToUpload = this.selectedImages().map(img => img.file);
    const request$ = imagesToUpload.length > 0
      ? this.questionService.createQuestionWithImages(newQuestion, imagesToUpload)
      : this.questionService.createQuestion(newQuestion);

    request$.subscribe({
      next: (createdQuestion) => {
        this.questions.update(questions => [...questions, createdQuestion]);
        this.closeAddQuestionPanel();
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error creating question:', err);
        let errorMsg = 'Could not create question. Please try again.';

        if (err.status === 409) {
          errorMsg = err.error || 'This title is already used by another question.';
        } else if (err.error) {
          errorMsg = typeof err.error === 'string' ? err.error : err.error.message || errorMsg;
        }

        this.errorMessage.set(errorMsg);
        this.isLoading.set(false);
      }
    });
  }
}
