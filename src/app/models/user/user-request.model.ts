export interface UserRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'ADMIN' | 'EMPLOYEE';
}
