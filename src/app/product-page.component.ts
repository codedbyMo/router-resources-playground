import { Component, input } from '@angular/core';
import type { Product } from './fixtures';

@Component({
  selector: 'app-product-page',
  template: `
    <h2>{{ product().name }}</h2>
    <p>SKU: {{ product().sku }}</p>
    <p>Price: {{ product().price }}</p>
  `,
})
export class ProductPageComponent {
  // Blocking httpResource: the input receives the resolved product,
  // never the resource object or a loading state.
  readonly product = input.required<Product>();
}
