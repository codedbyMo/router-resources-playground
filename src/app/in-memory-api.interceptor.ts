import { HttpErrorResponse, HttpResponse, type HttpInterceptorFn } from '@angular/common/http';
import { delay, of, throwError } from 'rxjs';
import {
  PRODUCT_FIXTURES,
  REPORT_FIXTURE,
  USER_FIXTURES,
  type Product,
  type ReportData,
  type User,
} from './fixtures';

function error(status: number, statusText: string, url: string) {
  return throwError(() => new HttpErrorResponse({ status, statusText, url })).pipe(delay(300));
}

/**
 * Serves the declared fixtures for the app's fake API so the router
 * resources run with no backend:
 *
 * - GET /api/users/:id      200 with the user, 404 for unknown ids,
 *                           500 for id "500" (a stand-in server failure)
 * - GET /api/products/:sku  200 with the product, 404 for unknown skus
 * - GET /api/reports/summary  200 with the report, deliberately slow so
 *                           the non-blocking loading state is visible
 *
 * Delays make blocking vs non-blocking navigation observable: a blocking
 * route holds the previous page until its delay elapses, while the
 * reports page activates immediately and fills in when data lands.
 */
export const inMemoryApiInterceptor: HttpInterceptorFn = (req, next) => {
  const userMatch = /^\/api\/users\/(.+)$/.exec(req.url);
  if (userMatch) {
    const id = decodeURIComponent(userMatch[1]);
    if (id === '500') {
      return error(500, 'Internal Server Error', req.url);
    }
    const user = USER_FIXTURES[id];
    if (!user) {
      return error(404, 'Not Found', req.url);
    }
    return of(new HttpResponse<User>({ status: 200, body: user })).pipe(delay(500));
  }

  const productMatch = /^\/api\/products\/(.+)$/.exec(req.url);
  if (productMatch) {
    const product = PRODUCT_FIXTURES[decodeURIComponent(productMatch[1])];
    if (!product) {
      return error(404, 'Not Found', req.url);
    }
    return of(new HttpResponse<Product>({ status: 200, body: product })).pipe(delay(500));
  }

  if (req.url === '/api/reports/summary') {
    return of(new HttpResponse<ReportData>({ status: 200, body: REPORT_FIXTURE })).pipe(
      delay(1200),
    );
  }

  return next(req);
};
