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

  getAnswersByQuestionId(questionId: number): Observable<Answer[]> {
    return this.http.get<Answer[]>(`${this.apiUrl}/question/${questionId}`);
  }

  likeAnswer(id: number): Observable<Answer> {
    return this.http.put<Answer>(`${this.apiUrl}/${id}/like`, {});
  }

  dislikeAnswer(id: number): Observable<Answer> {
    return this.http.put<Answer>(`${this.apiUrl}/${id}/dislike`, {});
  }

  createAnswer(answer: Partial<Answer>): Observable<Answer> {
    return this.http.post<Answer>(this.apiUrl, answer);
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
