export type UserRole = "customer" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface HealthResponse {
  status: "ok";
  service: string;
  version: string;
}

export interface Property {
  id: string;
  name: string;
  description?: string;
  city: string;
  country: string;
  address?: string;
  property_type: string;
  price_per_night: number;
  currency: string;
  rating?: number;
  image_url?: string;
  amenities?: string[];
}

export interface PropertyCreate {
  name: string;
  description?: string;
  city: string;
  country: string;
  address?: string;
  property_type: string;
  price_per_night: number;
  currency?: string;
  image_url?: string;
  amenities?: string[];
}

export interface PropertyUpdate {
  name?: string;
  description?: string;
  city?: string;
  country?: string;
  address?: string;
  property_type?: string;
  price_per_night?: number;
  currency?: string;
  image_url?: string;
  amenities?: string[];
}
