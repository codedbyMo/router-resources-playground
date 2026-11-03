import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import type { ReportData } from './fixtures';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly http = inject(HttpClient);

  /**
   * Resolves with the report summary. Passing `fail: true` rejects on
   * purpose, so the non-blocking resource's error state is reachable
   * from the demo (open /reports?fail=1).
   */
  async getSummary(fail = false): Promise<ReportData> {
    if (fail) {
      throw new Error('Report generation failed (demo failure requested with ?fail=1).');
    }
    return lastValueFrom(this.http.get<ReportData>('/api/reports/summary'));
  }
}
