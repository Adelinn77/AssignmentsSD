// features/users/services/user.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Use the central API URL from environment configuration
  private apiUrl = `${environment.apiUrl}/users`;
  private http = inject(HttpClient);

  /**
   * Fetch a user by their unique username from the Spring Boot backend
   * Maps to @GetMapping("/{username}") in UserController.java
   */
  getUserByUsername(username: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${username}`);
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }
}
