import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  if (token != null) {
    console.log('Adding token to request');
    const authReq = req.clone({
      headers: req.headers.set(
        'Authorization',
        `Bearer ${token}`
      )
    });
    console.log('Token added to request:', authReq.headers.get('Authorization'));
  
    return next(authReq);
  }
  return next(req);
};
