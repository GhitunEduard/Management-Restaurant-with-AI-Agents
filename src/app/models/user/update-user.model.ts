export interface UpdateUserRequest {
  name?: string;
  phone?: string;
  role?: 'ADMIN' | 'EMPLOYEE';
}
