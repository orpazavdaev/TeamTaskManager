export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'member';
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

