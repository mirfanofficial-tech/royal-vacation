import { ApiClient } from "./http";
import type {
  AuthResponse,
  HealthResponse,
  LoginRequest,
  Property,
  PropertyCreate,
  PropertyUpdate,
} from "./types";

export class RoyalVacationApi extends ApiClient {
  health() {
    return this.get<HealthResponse>("/api/v1/health");
  }

  auth = {
    login: (body: LoginRequest) =>
      this.post<AuthResponse>("/api/v1/auth/login", body),
    me: () => this.get<AuthResponse["user"]>("/api/v1/auth/me"),
  };

  properties = {
    list: () => this.get<Property[]>("/api/v1/properties"),
    get: (id: string) => this.get<Property>(`/api/v1/properties/${id}`),
    create: (body: PropertyCreate) =>
      this.post<Property>("/api/v1/properties", body),
    update: (id: string, body: PropertyUpdate) =>
      this.patch<Property>(`/api/v1/properties/${id}`, body),
    remove: (id: string) =>
      this.delete<{ ok: boolean }>(`/api/v1/properties/${id}`),
  };
}

export * from "./http";
export * from "./types";
