export interface UserResponse {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'ADMIN' | 'EMPLOYEE';
  profileImageUrl?: string;
}
