import { httpResource } from '@angular/common/http';
import { inject, resource } from '@angular/core';
import { RedirectCommand, ResolveFn, Router, nonBlocking, type Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { LegacyUserProfileComponent } from './legacy-user-profile.component';
import { NotFoundComponent } from './not-found.component';
import { ProductPageComponent } from './product-page.component';
import { ReportService } from './report.service';
import { ReportsComponent } from './reports.component';
import { UserProfileComponent } from './user-profile.component';
import { UserService } from './user.service';
import type { Product, User } from './fixtures';

// The classic resolver version of the user route, kept for contrast.
// The component receives the already fetched user as an input signal
// via withComponentInputBinding().
const userResolver: ResolveFn<User> = async (route) => {
  const userService = inject(UserService);
  const user = await userService.findUser(route.paramMap.get('id')!);
  if (!user) {
    throw new Error(`No user with id ${route.paramMap.get('id')}`);
  }
  return user;
};

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'not-found', component: NotFoundComponent },
  {
    path: 'legacy/users/:id',
    component: LegacyUserProfileComponent,
    resolve: { user: userResolver },
  },
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
  {
    path: 'products/:sku',
    component: ProductPageComponent,
    resources: (ctx) => ({
      product: httpResource<Product>(
        () => ({ url: `/api/products/${ctx.params()['sku']}` }),
      ),
    }),
  },
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
