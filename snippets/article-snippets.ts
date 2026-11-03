/**
 * Every route-configuration code block from the post "Router Resources
 * in Angular 22.2: Data Fetching That Follows the Route" (post #23),
 * collected in one file so the exact snippets readers see can be
 * type-checked against the pinned Angular 22.2.4 typings:
 *
 *   npm run typecheck:snippets
 *
 * The first group mirrors src/app/app.routes.ts and src/app/app.config.ts
 * verbatim. The second group covers the variants the post takes from the
 * official guide (rxResource, the abortSignal fetch pattern, precise
 * query-parameter tracking, the async resources function) with small
 * local stubs declared in this file, plus the whole-params-object
 * anti-pattern the guide warns about. The components themselves live in
 * src/app and are checked, templates included, by the AOT build with
 * strictTemplates enabled.
 */
import { httpResource } from '@angular/common/http';
import { Injector, inject, resource } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import {
  RedirectCommand,
  ResolveFn,
  Router,
  nonBlocking,
  provideRouter,
  withComponentInputBinding,
  withRouterResources,
  type Routes,
} from '@angular/router';
import type { Observable } from 'rxjs';
import { USER_FIXTURES, type Product, type User } from '../src/app/fixtures';
import { HomeComponent } from '../src/app/home.component';
import { LegacyUserProfileComponent } from '../src/app/legacy-user-profile.component';
import { ProductPageComponent } from '../src/app/product-page.component';
import { ReportService } from '../src/app/report.service';
import { ReportsComponent } from '../src/app/reports.component';
import { UserProfileComponent } from '../src/app/user-profile.component';
import { UserService } from '../src/app/user.service';

// ----- Setup: enabling router resources (from src/app/app.config.ts) -----

export const routerProviders = provideRouter(
  [] as Routes,
  withComponentInputBinding(),
  withRouterResources(),
);

// ----- The classic resolver version (from src/app/app.routes.ts) -----

const userResolver: ResolveFn<User> = async (route) => {
  const userService = inject(UserService);
  const user = await userService.findUser(route.paramMap.get('id')!);
  if (!user) {
    throw new Error(`No user with id ${route.paramMap.get('id')}`);
  }
  return user;
};

export const legacyRoutes: Routes = [
  {
    path: 'legacy/users/:id',
    component: LegacyUserProfileComponent,
    resolve: { user: userResolver },
  },
];

// ----- Blocking resource() (from src/app/app.routes.ts) -----

export const userRoutes: Routes = [
  {
    path: 'users/:id',
    component: UserProfileComponent,
    resources: (ctx) => {
      const userService = inject(UserService);
      const router = inject(Router);

      return {
        user: resource({
          params: () => ctx.params()['id'],
          loader: async ({ params: id }) => {
            const user = await userService.findUser(id);
            if (!user) {
              throw new RedirectCommand(router.parseUrl('/not-found'));
            }
            return user;
          },
        }),
      };
    },
  },
];

// ----- Blocking httpResource (from src/app/app.routes.ts) -----

export const productRoutes: Routes = [
  {
    path: 'products/:sku',
    component: ProductPageComponent,
    resources: (ctx) => ({
      product: httpResource<Product>(
        () => ({ url: `/api/products/${ctx.params()['sku']}` }),
      ),
    }),
  },
];

// ----- Non-blocking resource (from src/app/app.routes.ts) -----

export const reportRoutes: Routes = [
  {
    path: 'reports',
    component: ReportsComponent,
    resources: (ctx) => {
      const reportService = inject(ReportService);

      return {
        reportData: nonBlocking(
          resource({
            // The ?? '' matters: a params function that returns
            // undefined leaves the resource idle and the loader never
            // runs, and an absent query parameter reads as undefined.
            params: () => ctx.queryParams()['fail'] ?? '',
            loader: ({ params: fail }) => reportService.getSummary(fail === '1'),
          }),
        ),
      };
    },
  },
];

// ----- Guide variant: rxResource in a route -----

declare function fetchUserObservable(id: string): Observable<User>;

export const rxUserRoutes: Routes = [
  {
    path: 'user/:id',
    component: UserProfileComponent,
    resources: (ctx) => ({
      user: rxResource({
        params: () => ctx.params()['id'],
        stream: ({ params: id }) => fetchUserObservable(id),
      }),
    }),
  },
];

// ----- Guide variant: forward the abortSignal to fetch -----

declare function fetchUser(id: string, init?: RequestInit): Promise<User>;

export const fetchUserRoutes: Routes = [
  {
    path: 'user/:id',
    component: UserProfileComponent,
    resources: (ctx) => ({
      user: resource({
        params: () => ctx.params()['id'],
        loader: ({ params: id, abortSignal }) => fetchUser(id, { signal: abortSignal }),
      }),
    }),
  },
];

// ----- Guide variant: track one query parameter precisely -----

declare function fetchProducts(category: string | string[] | undefined): Promise<Product[]>;

export const catalogRoutes: Routes = [
  {
    path: 'catalog',
    component: HomeComponent,
    resources: (ctx) => ({
      products: resource({
        // Tracks only the 'category' query parameter
        params: () => ctx.queryParams()['category'],
        loader: ({ params: category }) => fetchProducts(category),
      }),
    }),
  },
];

// ----- Guide variant: the async resources function -----

export const asyncUserRoutes: Routes = [
  {
    path: 'user/:id',
    component: UserProfileComponent,
    resources: async (ctx) => {
      const injector = inject(Injector);
      const { fetchUserData } = await import('./user-api');

      return {
        user: resource({
          params: () => ctx.params()['id'],
          loader: ({ params: id }) => fetchUserData(id),
          injector,
        }),
      };
    },
  },
];

// ----- Anti-pattern: returning the whole params object -----

export const wholeObjectRoutes: Routes = [
  {
    path: 'users/:id',
    component: UserProfileComponent,
    resources: (ctx) => {
      const userService = inject(UserService);

      return {
        user: resource({
          // Tracks the entire params object. The router creates a new
          // object on every navigation, so this refetches even when the
          // id itself did not change.
          params: () => ctx.params(),
          loader: async ({ params }) => {
            const user = await userService.findUser(params['id']);
            if (!user) {
              throw new Error(`No user with id ${params['id']}`);
            }
            return user;
          },
        }),
      };
    },
  },
];

// Referenced so the fixture import is not dropped as unused; the rx
// stub above stands in for an Observable-based user API.
export const fixturePeek = USER_FIXTURES['1'];
