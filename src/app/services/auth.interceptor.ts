import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoggerService } from './logger.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const logger = inject(LoggerService);
  const token = localStorage.getItem('token');
  if (token != null) {
    const authReq = req.clone({
      headers: req.headers.set(
        'Authorization',
        `Bearer ${token}`
      )
    });
    logger.logInfo('Token added to request:', { token: authReq.headers.get('Authorization') });
    return next(authReq);
  }
  return next(req);
};
