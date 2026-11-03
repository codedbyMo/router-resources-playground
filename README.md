# Router Resources 23 Playground

Companion playground for the blog post "Router Resources in Angular 22.2:
Data Fetching That Follows the Route" (post #23 in the 2026 queue). A
small routed Angular 22 app in which the routes, not the components,
fetch the data: a blocking `resource()`, a blocking `httpResource`, a
classic resolver kept for contrast, and a `nonBlocking()` resource.

## Versions (pinned exactly)

- Angular 22.2.4 (`@angular/core`, `@angular/common`, `@angular/compiler`,
  `@angular/platform-browser`, `@angular/router`, `@angular/cli`,
  `@angular/build`, `@angular/compiler-cli`)
- TypeScript 6.0.3 (the range `@angular/compiler-cli` 22.2.4 requires)
- RxJS 7.8.2, tslib 2.8.1
- Vitest 4.1.12 and jsdom 30.1.3 for the runtime smoke tests
- Node 24 (verified on Node 24.22.1, npm 11)

All dependencies are pinned in `package.json` and locked in
`package-lock.json`; install with `npm ci` so you get exactly these
versions.

Router resources are a developer preview API in Angular 22.2 (the
`@developerPreview 22.2` tag is on `Route.resources`,
`ResourceContext`, `withRouterResources()`, and `nonBlocking()` in the
22.2.4 typings). The API surface may still change before it stabilizes.

## Run it

Requires Node 24 (see Versions above).

```bash
npm ci
npm start
```

Open http://localhost:4200. No backend is needed: an HTTP interceptor
(`src/app/in-memory-api.interceptor.ts`) serves the declared fixtures
from `src/app/fixtures.ts`, with delays so the difference between
blocking and non-blocking navigation is visible. Special ids exercise
the failure paths: user `999` answers 404 (the loader redirects to
`/not-found`), user `500` answers 500 (the navigation is cancelled),
and `/reports?fail=1` makes the non-blocking resource land in its error
state.

## Verify it

```bash
npm ci
npm run typecheck           # tsc --noEmit over the app (src/)
npm run typecheck:snippets  # tsc --noEmit over snippets/article-snippets.ts
npm run build               # AOT build, strictTemplates enabled
npm test                    # runtime smoke tests (Vitest + RouterTestingHarness)
```

Verified from a clean copy on November 3, 2026 (Node 24.22.1):
`npm ci` installed from the lockfile with no errors, both typechecks
passed, the AOT build completed, and all 7 runtime tests passed.

`snippets/article-snippets.ts` collects every route-configuration code
block from the post so the exact code readers see is checked against
the Angular 22.2.4 typings. The blocks in the first group mirror
`src/app/app.routes.ts` and `src/app/app.config.ts`; the second group
covers the variants the post takes from the official guide
(`rxResource`, the `abortSignal` fetch pattern, precise query-parameter
tracking, the async `resources` function) with small local stubs.

`src/app/router-resources.spec.ts` runs the real routes through
`RouterTestingHarness` against the same in-memory API and asserts the
navigation behavior the post describes: blocking activation binds the
resolved value, a parameter change refetches on the reused component, a
`RedirectCommand` lands on `/not-found`, a blocking error cancels the
navigation and keeps the previous page, an `httpResource` works as a
route resource, and the reports page renders its loading state before
its value and its error state when the loader fails.

One behavior the tests pin down: a resource whose `params` function
returns `undefined` never loads (its status stays `'idle'`). The
reports resource reads an optional query parameter, so its params
function normalizes the absent case with `?? ''`. Without that, the
plain `/reports` page would sit in the idle state forever.
