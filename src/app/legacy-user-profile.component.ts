import { Component, input } from '@angular/core';
import type { User } from './fixtures';

@Component({
  selector: 'app-legacy-user-profile',
  template: `
    <h2>{{ user().name }}</h2>
    <p>Role: {{ user().role }} (loaded by a classic resolver)</p>
  `,
})
export class LegacyUserProfileComponent {
  // With withComponentInputBinding(), the resolved value lands in the
  // input with the same name as the resolve key.
  readonly user = input.required<User>();
}
