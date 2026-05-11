import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Tag {
  id: number;
  label: string;
}

@Injectable({
  providedIn: 'root'
})
export class TagService {
  private apiUrl = `${environment.apiUrl}/tags`;
  private http = inject(HttpClient);

  getAllTags(): Observable<Tag[]> {
    return this.http.get<Tag[]>(this.apiUrl);
  }

  getTagByLabel(label: string): Observable<Tag> {
    return this.http.get<Tag>(`${this.apiUrl}/label/${encodeURIComponent(label)}`);
  }

  createTag(tag: Partial<Tag>): Observable<Tag> {
    return this.http.post<Tag>(this.apiUrl, tag);
  }

  updateTag(id: number, tag: Partial<Tag>): Observable<Tag> {
    return this.http.put<Tag>(`${this.apiUrl}/${id}`, tag);
  }

  deleteTag(label: string): Observable<string> {
    return this.http.delete(`${this.apiUrl}/label/${encodeURIComponent(label)}`, {
      responseType: 'text'
    });
  }
}
