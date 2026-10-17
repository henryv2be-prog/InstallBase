/** RSC → client props must be JSON-serializable; use string[] not Set. */
export function isFollowingUser(followingIds: readonly string[] | undefined, authorId: string) {
  return followingIds?.includes(authorId) ?? false;
}
