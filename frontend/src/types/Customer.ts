export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  password?: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  id: number;
  token?: string;
  customerId: number;
  name: string;
  email: string;
}
