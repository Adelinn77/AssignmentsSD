import { Routes } from '@angular/router';
import { QuestionList } from './features/questions/pages/question-list/question-list';
import { QuestionAnswer } from './features/questions/pages/question-answers/question-answers';
import { Login } from './features/auth/pages/login/login';
import { UserProfile } from './features/users/pages/user-profile/user-profile';

export const routes: Routes = [
  { path: 'questions', component: QuestionList },
  { path: 'questions/:id', component: QuestionAnswer },
  { path: 'auth/login', component: Login },
  { path: 'users/:username', component: UserProfile },

  { path: '', redirectTo: '/questions', pathMatch: 'full' },

  { path: '**', redirectTo: '/questions' }
];
