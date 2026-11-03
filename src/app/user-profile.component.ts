import { Component, inject, input } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import type { User } from './fixtures';

@Component({
  selector: 'app-user-profile',
  imports: [RouterLink],
  template: `
    <h2>{{ user().name }}</h2>
    <p>Role: {{ user().role }}</p>
    <p>
      <button type="button" (click)="refreshUser()">Refresh</button>
      <a routerLink="/users/1">User 1</a> |
      <a routerLink="/users/2">User 2</a> |
      <a routerLink="/users/3">User 3</a>
    </p>
  `,
})
export class UserProfileComponent {
  // The router binds only the value for blocking resources.
  readonly user = input.required<User>();

  private readonly route = inject(ActivatedRoute);

  refreshUser() {
    // Reloads only this specific resource without renavigating the route.
    this.route.resources?.['user']?.reload();
  }
}
