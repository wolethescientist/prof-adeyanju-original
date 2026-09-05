/**
 * Builds the URL for an uploaded image.
 *
 * The checksum in the path makes every version of a file a distinct,
 * permanently cacheable URL — and keeps the URL free of query strings, which
 * is what lets next/image's localPatterns stay locked down.
 *
 * Deliberately free of server-only imports so the admin's client components
 * can use it too.
 */
export function mediaUrl(
  image: { id: string; checksum: string } | null | undefined
) {
  return image ? `/api/media/${image.id}/${image.checksum.slice(0, 12)}` : null;
}
