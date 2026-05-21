export interface User {
  username: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  role?: 'USER' | 'ADMIN';
  accessRestricted?: boolean;
}
