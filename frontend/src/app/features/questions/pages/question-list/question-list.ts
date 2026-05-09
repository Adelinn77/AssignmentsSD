import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { QuestionService } from '../../services/question.service';
import { Question } from '../../models/question.model';
import { AuthService } from '../../../auth/services/auth.service';
import { Status } from '../../models/question.model';

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
  showAddQuestionPanel = signal<boolean>(false);

  newQuestionTitle = signal<string>('');
  newQuestionText = signal<string>('');
  newQuestionTags = signal<string>('');
  selectedImages = signal<{ file: File, url: string }[]>([]);

  // Filters
  searchTitle = signal<string>('');
  selectedTag = signal<string>('');
  selectedUser = signal<string>('');
  onlyMyQuestions = signal<boolean>(false);

  // Edit state
  editingQuestion = signal<Question | null>(null);
  editTitle = signal<string>('');
  editText = signal<string>('');

  currentUsername = this.authService.getCurrentUsername();

  allTags = computed<string[]>(() => {
    const tagsSet = new Set<string>();

    this.questions().forEach(question => {
      question.tags?.forEach(tag => {
        const cleanTag = tag.trim();

        if (cleanTag.length > 0) {
          tagsSet.add(cleanTag);
        }
      });
    });

    return Array.from(tagsSet).sort();
  });

  allUsers = computed<string[]>(() => {
    const usersSet = new Set<string>();

    this.questions().forEach(question => {
      const author = question.authorName?.trim();

      if (author) {
        usersSet.add(author);
      }
    });

    return Array.from(usersSet).sort();
  });

  filteredQuestions = computed<Question[]>(() => {
    const titleFilter = this.searchTitle().trim().toLowerCase();
    const tagFilter = this.selectedTag().trim().toLowerCase();
    const userFilter = this.selectedUser().trim().toLowerCase();
    const currentUser = this.currentUsername?.trim().toLowerCase() ?? '';
    const onlyMine = this.onlyMyQuestions();

    return this.questions().filter(question => {
      const title = question.title?.toLowerCase() ?? '';
      const author = question.authorName?.toLowerCase() ?? '';
      const tags = question.tags ?? [];

      const matchesTitle =
        titleFilter === '' || title.includes(titleFilter);

      const matchesTag =
        tagFilter === '' ||
        tags.some(tag => tag.toLowerCase() === tagFilter);

      const matchesUser =
        userFilter === '' || author === userFilter;

      const matchesOnlyMyQuestions =
        !onlyMine || (currentUser !== '' && author === currentUser);

      return matchesTitle && matchesTag && matchesUser && matchesOnlyMyQuestions;
    });
  });

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

  updateSearchTitle(value: string): void {
    this.searchTitle.set(value);
  }

  updateSelectedTag(value: string): void {
    this.selectedTag.set(value);
  }

  updateSelectedUser(value: string): void {
    this.selectedUser.set(value);
  }

  updateOnlyMyQuestions(value: boolean): void {
    this.onlyMyQuestions.set(value);
  }

  resetFilters(): void {
    this.searchTitle.set('');
    this.selectedTag.set('');
    this.selectedUser.set('');
    this.onlyMyQuestions.set(false);
  }

  isAuthor(question: Question): boolean {
    return this.currentUsername !== null && this.currentUsername === question.authorName;

    // Dacă vrei temporar să apară edit/delete pentru toate întrebările, folosește:
    // return true;
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

    if (!original) {
      return;
    }

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
    if (!confirm(`Are you sure you want to delete "${question.title}"?`)) {
      return;
    }

    this.questionService.deleteQuestion(question.title).subscribe({
      next: () => {
        this.questions.update(list =>
          list.filter(q => q.questionId !== question.questionId)
        );
      },
      error: (err) => {
        console.error('Error deleting question:', err);
        alert('Could not delete question: ' + (err.error || err.message));
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
    this.selectedImages.update(images =>
      images.filter((_, i) => i !== index)
    );
  }

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
      authorName: this.currentUsername || 'ion_pop'
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
          errorMsg = typeof err.error === 'string'
            ? err.error
            : err.error.message || errorMsg;
        }

        this.errorMessage.set(errorMsg);
        this.isLoading.set(false);
      }
    });
  }
}
