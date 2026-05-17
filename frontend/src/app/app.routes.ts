import { Routes } from '@angular/router';
import { QuestionList } from './features/questions/pages/question-list/question-list';
import { AnswersList } from './features/answers/pages/answers-list/answers-list';
import { Login } from './features/auth/pages/login/login';
import { Register } from './features/auth/pages/register/register';
import { UserProfile } from './features/users/pages/user-profile/user-profile';
import { UserList } from './features/users/pages/user-list/user-list';
import {authGuard} from './features/auth/services/auth.guard';
import {guestGuard} from './features/auth/services/guest.guard';

export const routes: Routes = [
  { path: 'questions', component: QuestionList, canActivate: [authGuard] },
  { path: 'answers/question/:id', component: AnswersList, canActivate: [authGuard] },
  { path: 'users/profile', component: UserProfile, canActivate: [authGuard] },
  { path: 'users', component: UserList, canActivate: [authGuard] },
  { path: 'users/:username', component: UserProfile, canActivate: [authGuard] },

  { path: 'auth/login', component: Login, canActivate: [guestGuard] },
  { path: 'auth/register', component: Register, canActivate: [guestGuard] },

  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },

  { path: '**', redirectTo: '/auth/login' }
];
