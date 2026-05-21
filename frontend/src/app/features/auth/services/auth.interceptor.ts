import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = sessionStorage.getItem('userToken');

  if (token && !req.url.includes('/api/auth/')) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Basic ${token}`
      }
    });
    return next(clonedRequest);
  }

  return next(req);
};
