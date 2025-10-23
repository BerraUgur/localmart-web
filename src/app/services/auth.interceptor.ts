import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoggerService } from './logger.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const logger = inject(LoggerService);
  const token = localStorage.getItem('token');
  if (token != null) {
    logger.debug('Adding token to request');
    const authReq = req.clone({
      headers: req.headers.set(
        'Authorization',
        `Bearer ${token}`
      )
    });
    logger.info('Token added to request:', authReq.headers.get('Authorization'));
    return next(authReq);
  }
  return next(req);
};
