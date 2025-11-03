import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../environments/environment';
import { LoginRequest } from '../models/loginRequest';
import { LoginResponse } from '../models/loginResponse';
import { RegisterRequest } from '../models/registerRequest';
import { UpdateUserRequest } from '../models/userRequest';
import { User } from '../models/comment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiBaseUrl = `${environment.apiUrl}/auth/`;
  private readonly localStorage: Storage;
  private readonly jwtHelperService: JwtHelperService = new JwtHelperService();
  
  currentUserId?: number;
  currentRoles?: string;

  constructor(private readonly httpClient: HttpClient) {
    this.localStorage = window.localStorage;
    this.setUserStats();
  }

  login(user: LoginRequest): Observable<LoginResponse> {
    return this.httpClient.post<LoginResponse>(`${this.apiBaseUrl}login`, user);
  }

  register(user: RegisterRequest): Observable<void> {
    return this.httpClient.post<void>(`${this.apiBaseUrl}register`, user);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(environment.tokenKey);
  }

  getDecodedToken(): any {
    const token = localStorage.getItem("token");
    if (token) {
      return jwtDecode(token);
    }
    return null;
  }

  setCurrentUserId() {
    const decoded = this.getDecodedToken();
    if (decoded) {
      const propUserId = Object.keys(decoded).find(x => x.endsWith("/nameidentifier"));
      if (propUserId) {
        this.currentUserId = Number(decoded[propUserId]);
      }
    }
  }

  setRoles() {
    var decoded = this.getDecodedToken()
    var propUserId = Object.keys(decoded).filter(x => x.endsWith("/role"))[0];
    this.currentRoles = String(decoded[propUserId]);
  }
  getCurrentRoles(): string {
    // Return current user roles
    return this.currentRoles ?? "";
  }
  getCurrentUserId(): number {
    // Return current user id
    return this.currentUserId!;
  }

  async setUserStats() {
    if (this.loggedIn()) {
      this.setCurrentUserId()
      this.setRoles()
    }
  }

  logout() {
    this.localStorage.removeItem("token");
  }

  loggedIn(): boolean {
    let isExpired = this.jwtHelperService.isTokenExpired(localStorage.getItem("token"));
    return !isExpired;
  }

  updateUser(userId: number, updateUserRequest: UpdateUserRequest): Observable<void> {
    return this.httpClient.put<void>(`${this.apiBaseUrl}${userId}/update`, updateUserRequest);
  }

  deleteUser(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiBaseUrl}${id}`);
  }

  getUserList(): Observable<User[]> {
    return this.httpClient.get<User[]>(`${this.apiBaseUrl}userlist`);
  }

  getUser(userId: number): Observable<User> {
    return this.httpClient.get<User>(`${this.apiBaseUrl}${userId}`);
  }
  
  resetPassword(email: string, token: string, newPassword: string): Observable<any> {
    return this.httpClient.post(`${this.apiBaseUrl}reset-password`, { email, token, newPassword });
  }

  requestPasswordReset(email: string): Observable<any> {
    return this.httpClient.post(`${this.apiBaseUrl}forgot-password`, { email });
  }
}
