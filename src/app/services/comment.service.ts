import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CustomComment } from '../models/comment';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class CommentService {
  private baseUrl: string = `${environment.apiUrl}/comments`;
  constructor(private http: HttpClient) { }

  getCommentsByProductId(productId: number): Observable<CustomComment[]> {
    return this.http.get<CustomComment[]>(`${this.baseUrl}/product/${productId}`);
  }

  getCommentById(id: number): Observable<CustomComment | null> {
    return this.http.get<CustomComment>(`${this.baseUrl}/${id}`);
  }

  addComment(comment: CustomComment): Observable<CustomComment> {
    return this.http.post<CustomComment>(this.baseUrl, comment);
  }

  updateComment(id: number, comment: CustomComment): Observable<CustomComment> {
    return this.http.put<CustomComment>(`${this.baseUrl}/${id}`, comment);
  }

  deleteComment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
