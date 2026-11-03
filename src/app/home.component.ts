import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  template: `
    <h2>Pick a route</h2>
    <p>Every link below loads its data through the router, not the component.</p>
    <ul>
      <li><a routerLink="/users/1">User 1 (blocking resource)</a></li>
      <li><a routerLink="/users/2">User 2 (blocking resource)</a></li>
      <li><a routerLink="/users/999">User 999 (missing: redirects to /not-found)</a></li>
      <li><a routerLink="/users/500">User 500 (server error: navigation is cancelled)</a></li>
      <li><a routerLink="/legacy/users/1">User 1 (classic resolver, for contrast)</a></li>
      <li><a routerLink="/products/kb-01">Keyboard (blocking httpResource)</a></li>
      <li><a routerLink="/products/ms-02">Mouse (blocking httpResource)</a></li>
      <li><a routerLink="/reports">Reports (non-blocking resource)</a></li>
      <li><a routerLink="/reports" [queryParams]="{ fail: '1' }">Reports, failing (error state)</a></li>
    </ul>
  `,
})
export class HomeComponent {}
