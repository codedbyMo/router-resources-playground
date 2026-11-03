import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import type { User } from './fixtures';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);

  /**
   * Resolves with the user, or with `undefined` when the API answers
   * 404, so the route loader can turn "no such user" into a redirect.
   * Any other failure (such as a 500) rejects, which is what cancels
   * a blocking navigation.
   */
  async findUser(id: string): Promise<User | undefined> {
    try {
      return await lastValueFrom(this.http.get<User>(`/api/users/${id}`));
    } catch (err) {
      if (err instanceof HttpErrorResponse && err.status === 404) {
        return undefined;
      }
      throw err;
    }
  }
}
