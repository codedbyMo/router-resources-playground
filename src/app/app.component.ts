import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterOutlet],
  template: `
    <h1>Router Resources Playground</h1>
    <nav><a routerLink="/">Home</a></nav>
    <router-outlet />
  `,
})
export class AppComponent {}
