import { Component, input, type Resource } from '@angular/core';
import type { ReportData } from './fixtures';

@Component({
  selector: 'app-reports',
  template: `
    <h2>Reports</h2>
    @if (reportData().isLoading()) {
      <p>Loading...</p>
    } @else if (reportData().error()) {
      <p>Error loading report.</p>
    } @else if (reportData().hasValue()) {
      <p>{{ reportData().value().title }}</p>
      <p>
        Generated {{ reportData().value().generatedAt }}:
        {{ reportData().value().totalUsers }} users,
        {{ reportData().value().totalProducts }} products.
      </p>
    }
  `,
})
export class ReportsComponent {
  // Non-blocking: the input receives the full Resource object, so the
  // template owns the loading and error states.
  readonly reportData = input.required<Resource<ReportData>>();
}
