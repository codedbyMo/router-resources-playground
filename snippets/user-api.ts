import { USER_FIXTURES, type User } from '../src/app/fixtures';

/**
 * Stand-in for a lazily imported user API module, used by the async
 * `resources` function variant in article-snippets.ts.
 */
export async function fetchUserData(id: string): Promise<User> {
  const user = USER_FIXTURES[id];
  if (!user) {
    throw new Error(`No user with id ${id}`);
  }
  return user;
}
