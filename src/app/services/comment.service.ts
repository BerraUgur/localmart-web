import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoggerService } from './logger.service';
import { Observable } from 'rxjs';
import { CustomComment } from '../models/comment';

@Injectable({
  providedIn: 'root'
})

export class CommentService {
  private baseUrl: string = 'http://localhost:5203/comments';
  constructor(private http: HttpClient, private logger: LoggerService) { }

  getCommentsByProductId(productId: number): Observable<CustomComment[]> {
    this.logger.info('Fetching comments by product id', productId);
    return this.http.get<CustomComment[]>(`${this.baseUrl}/product/${productId}`);
  }

  getCommentById(id: number): Observable<CustomComment | null> {
    this.logger.info('Fetching comment by id', id);
    return this.http.get<CustomComment>(`${this.baseUrl}/${id}`);
  }

  addComment(comment: CustomComment): Observable<CustomComment> {
    this.logger.info('Adding comment', comment);
    return this.http.post<CustomComment>(this.baseUrl, comment);
  }

  updateComment(id: number, comment: CustomComment): Observable<CustomComment> {
    this.logger.info('Updating comment', id, comment);
    return this.http.put<CustomComment>(`${this.baseUrl}/${id}`, comment);
  }

  deleteComment(id: number): Observable<void> {
    this.logger.info('Deleting comment', id);
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
