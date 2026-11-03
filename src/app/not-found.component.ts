import { Component } from '@angular/core';

@Component({
  selector: 'app-not-found',
  template: `
    <h2>Not found</h2>
    <p>The router sent you here: the resource loader threw a RedirectCommand.</p>
  `,
})
export class NotFoundComponent {}
