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

  getAllQuestions(): Observable<Question[]> {
    return this.http.get<Question[]>(this.apiUrl);
  }

  getQuestionById(id: number): Observable<Question> {
    return this.http.get<Question>(`${this.apiUrl}/${id}`);
  }

  getQuestionsByAuthor(username: string): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.apiUrl}/author/${username}`);
  }

  likeQuestion(id: number): Observable<Question> {
    return this.http.put<Question>(`${this.apiUrl}/${id}/like`, {});
  }

  dislikeQuestion(id: number): Observable<Question> {
    return this.http.put<Question>(`${this.apiUrl}/${id}/dislike`, {});
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
