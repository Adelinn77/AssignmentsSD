import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Answer } from '../models/answer.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnswerService {
  private apiUrl = `${environment.apiUrl}/answers`;
  private http = inject(HttpClient);

  getAnswersByQuestionId(questionId: number, viewer?: string): Observable<Answer[]> {
    const url = viewer ? `${this.apiUrl}/question/${questionId}?viewer=${encodeURIComponent(viewer)}` : `${this.apiUrl}/question/${questionId}`;
    return this.http.get<Answer[]>(url);
  }

  likeAnswer(id: number, username: string): Observable<Answer> {
    return this.http.put<Answer>(`${this.apiUrl}/${id}/like?username=${encodeURIComponent(username)}`, {});
  }

  dislikeAnswer(id: number, username: string): Observable<Answer> {
    return this.http.put<Answer>(`${this.apiUrl}/${id}/dislike?username=${encodeURIComponent(username)}`, {});
  }

  createAnswer(answer: Partial<Answer>): Observable<Answer> {
    return this.http.post<Answer>(this.apiUrl, answer);
  }

  updateAnswer(id: number, answer: Partial<Answer>): Observable<Answer> {
    return this.http.put<Answer>(`${this.apiUrl}/${id}`, answer);
  }

  deleteAnswer(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
  }

  createAnswerWithImages(answer: Partial<Answer>, images: File[]): Observable<Answer> {
    const formData = new FormData();

    formData.append('answer', new Blob([JSON.stringify(answer)], { type: 'application/json' }));

    images.forEach((image) => {
      formData.append('images', image);
    });

    return this.http.post<Answer>(`${this.apiUrl}/with-images`, formData);
  }
}
