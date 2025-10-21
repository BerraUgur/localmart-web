import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, pipe } from 'rxjs';
import { Mail } from '../models/mail';
import { tap } from 'rxjs/operators';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root'
})
export class MailService {
  private baseUrl: string = 'http://localhost:5203/auth/send-mail';

  constructor(private http: HttpClient, private logger: LoggerService) {}

  sendMail(mail: Mail): Observable<Mail> {
    this.logger.info('Sending mail:', mail);
    return this.http.post<Mail>(this.baseUrl, mail).pipe(
      tap({
        next: (response) => this.logger.info('Mail sent successfully:', response),
        error: (error) => this.logger.error('Error sending mail:', error)
      })
    );
  }
}