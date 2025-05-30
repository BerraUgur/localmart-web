import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { LoginResponse } from './loginResponse';
import { LoginRequest } from './loginRequest';
import { RegisterRequest } from './registerRequest';
import { UpdateUserRequest } from './userRequest';
import { Observable } from 'rxjs';
import { User } from './comment';
import { jwtDecode } from "jwt-decode";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  localStorage: Storage;
  jwtHelperService:JwtHelperService = new JwtHelperService();
  currentUserId?: number;
  currentRoles?: string;
  NewPath= "http://localhost:5203/auth/"
  
  constructor(private httpClient:HttpClient) {this.setUserStats(),this.localStorage = window.localStorage;}

  login(user:LoginRequest){
    return this.httpClient.post<LoginResponse>(this.NewPath+"login",user);
  }

  Register(user:RegisterRequest){
    return this.httpClient.post(this.NewPath+"register",user) 
  }

  isAuthencation(){
    if(localStorage.getItem("token")){
      return true;
    }

    else{
      return false;
    }
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


  // setCurrentUserId() {
  //   var decoded = this.getDecodedToken()
  //   var propUserId = Object.keys(decoded).filter(x => x.endsWith("/nameidentifier"))[0];
  //   this.currentUserId = Number(decoded[propUserId]);
  // }
  setRoles() {
    var decoded = this.getDecodedToken()
    var propUserId = Object.keys(decoded).filter(x => x.endsWith("/role"))[0];
    this.currentRoles = String(decoded[propUserId]);
  }
  getCurrentRoles(): string {
    console.log(this.currentRoles);
    
    return this.currentRoles ?? "";
  }
  getCurrentUserId(): number {
    console.log(this.currentUserId);
    return this.currentUserId!;
  }
  // getDecodedToken() {
  //   try {
  //     return this.jwtHelperService.decodeToken(this.localStorage.getItem("token") ?? "");
  //   }
  //   catch (Error) {
  //     return null;
  //   }
  // }
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
    return this.httpClient.put<void>(this.NewPath+userId+"/update", updateUserRequest);
  }

  deleteUser(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.NewPath}${id}`);
  }

  getUserList(): Observable<User[]> {
    return this.httpClient.get<User[]>(this.NewPath+"userlist");
  }

  getUser(userId : number): Observable<User> {
    return this.httpClient.get<User>(this.NewPath+userId);
  }
}
