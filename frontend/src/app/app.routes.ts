import { Routes } from '@angular/router';
import { QuestionList } from './features/questions/pages/question-list/question-list';
import { Login } from './features/auth/pages/login/login';
import { UserProfile } from './features/users/pages/user-profile/user-profile';
import { UserList } from './features/users/pages/user-list/user-list';

export const routes: Routes = [
  { path: 'questions', component: QuestionList },
  { path: 'auth/login', component: Login },
  { path: 'users/profile', component: UserProfile },
  { path: 'users', component: UserList },

  { path: '', redirectTo: '/questions', pathMatch: 'full' },

  { path: '**', redirectTo: '/questions' }
];
