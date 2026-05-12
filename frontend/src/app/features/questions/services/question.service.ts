import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Question } from '../models/question.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  private apiUrl = `${environment.apiUrl}/questions`;
  private http = inject(HttpClient);

  getAllQuestions(viewer?: string): Observable<Question[]> {
    const url = viewer ? `${this.apiUrl}?viewer=${encodeURIComponent(viewer)}` : this.apiUrl;
    return this.http.get<Question[]>(url);
  }

  getQuestionById(id: number, viewer?: string): Observable<Question> {
    const url = viewer ? `${this.apiUrl}/${id}?viewer=${encodeURIComponent(viewer)}` : `${this.apiUrl}/${id}`;
    return this.http.get<Question>(url);
  }

  getQuestionsByAuthor(username: string): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.apiUrl}/author/${username}`);
  }

  updateQuestion(currentTitle: string, question: Question): Observable<Question> {
    return this.http.put<Question>(`${this.apiUrl}/title/${encodeURIComponent(currentTitle)}`, question);
  }

  deleteQuestion(title: string): Observable<string> {
    return this.http.delete(`${this.apiUrl}/title/${encodeURIComponent(title)}`, { responseType: 'text' });
  }

  likeQuestion(id: number, username: string): Observable<Question> {
    return this.http.put<Question>(`${this.apiUrl}/${id}/like?username=${encodeURIComponent(username)}`, {});
  }

  dislikeQuestion(id: number, username: string): Observable<Question> {
    return this.http.put<Question>(`${this.apiUrl}/${id}/dislike?username=${encodeURIComponent(username)}`, {});
  }

  createQuestion(question: Partial<Question>): Observable<Question> {
    return this.http.post<Question>(this.apiUrl, question);
  }

  createQuestionWithImages(question: Partial<Question>, images: File[]): Observable<Question> {
    const formData = new FormData();

    // Append the question as JSON
    formData.append('question', new Blob([JSON.stringify(question)], { type: 'application/json' }));

    // Append each image file
    images.forEach((image) => {
      formData.append('images', image);
    });

    return this.http.post<Question>(`${this.apiUrl}/with-images`, formData);
  }
}
