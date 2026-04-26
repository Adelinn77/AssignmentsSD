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

  likeQuestion(id: number): Observable<Question> {
    return this.http.put<Question>(`${this.apiUrl}/${id}/like`, {});
  }

  dislikeQuestion(id: number): Observable<Question> {
    return this.http.put<Question>(`${this.apiUrl}/${id}/dislike`, {});
  }
}
