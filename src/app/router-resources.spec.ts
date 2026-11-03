import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter, withComponentInputBinding, withRouterResources } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { routes } from './app.routes';
import { inMemoryApiInterceptor } from './in-memory-api.interceptor';

/**
 * Runtime smoke tests for the playground's router resources. These run
 * the real routes through RouterTestingHarness against the same
 * in-memory API the dev server uses, and assert the navigation
 * behaviour the post describes: blocking resources hold activation
 * until the value is bound, parameter changes refetch, a missing user
 * redirects, a server error cancels the navigation, an httpResource
 * works as a route resource, and the non-blocking reports page renders
 * its loading state first.
 *
 * The test providers deliberately omit withFetch(): the in-memory
 * interceptor answers every /api request, so no real transport runs.
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('router resources playground routes', () => {
  let harness: RouterTestingHarness;
  let router: Router;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter(routes, withComponentInputBinding(), withRouterResources()),
        provideHttpClient(withInterceptors([inMemoryApiInterceptor])),
      ],
    });
    router = TestBed.inject(Router);
    harness = await RouterTestingHarness.create();
  });

  it('blocks activation until the user resource resolves, then binds the value as an input', async () => {
    await harness.navigateByUrl('/users/1');
    expect(router.url).toBe('/users/1');
    expect(harness.routeNativeElement?.textContent).toContain('Ada Lovelace');
    expect(harness.routeNativeElement?.textContent).toContain('Admin');
  });

  it('refetches when the route parameter changes on the reused component', async () => {
    await harness.navigateByUrl('/users/1');
    expect(harness.routeNativeElement?.textContent).toContain('Ada Lovelace');

    await harness.navigateByUrl('/users/2');
    expect(router.url).toBe('/users/2');
    expect(harness.routeNativeElement?.textContent).toContain('Grace Hopper');
  });

  it('redirects to /not-found when the loader throws a RedirectCommand', async () => {
    await harness.navigateByUrl('/users/999');
    expect(router.url).toBe('/not-found');
    expect(harness.routeNativeElement?.textContent).toContain('Not found');
  });

  it('cancels the navigation when a blocking resource errors', async () => {
    await harness.navigateByUrl('/users/1');

    await harness.navigateByUrl('/users/500').catch(() => undefined);

    // The failed navigation leaves the previous route in place.
    expect(router.url).toBe('/users/1');
    expect(harness.routeNativeElement?.textContent).toContain('Ada Lovelace');
  });

  it('binds an httpResource route resource value as an input', async () => {
    await harness.navigateByUrl('/products/kb-01');
    expect(router.url).toBe('/products/kb-01');
    expect(harness.routeNativeElement?.textContent).toContain('Mechanical Keyboard');
  });

  it('activates the reports page immediately and renders loading before the value', async () => {
    await harness.navigateByUrl('/reports');
    expect(router.url).toBe('/reports');

    // The page is already active while the resource is still in
    // flight: poll briefly and require the loading state to appear
    // before any value does.
    let sawLoadingBeforeValue = false;
    for (let i = 0; i < 20; i++) {
      harness.fixture.detectChanges();
      const text = harness.routeNativeElement?.textContent ?? '';
      if (text.includes('Loading...') && !text.includes('Catalog summary')) {
        sawLoadingBeforeValue = true;
        break;
      }
      await sleep(50);
    }
    expect(sawLoadingBeforeValue).toBe(true);

    await sleep(1600);
    harness.fixture.detectChanges();

    expect(harness.routeNativeElement?.textContent).toContain('Catalog summary');
  });

  it('exposes the resource error state on the non-blocking reports page', async () => {
    await harness.navigateByUrl('/reports?fail=1');
    // The loader rejects immediately; give the error a tick to land.
    await sleep(100);
    harness.fixture.detectChanges();
    expect(harness.routeNativeElement?.textContent).toContain('Error loading report.');
  });
});
