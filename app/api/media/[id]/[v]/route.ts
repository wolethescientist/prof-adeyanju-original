import { eq } from "drizzle-orm";
import { db } from "@/db";
import { media } from "@/db/schema";

/**
 * Serves an uploaded image out of the database.
 *
 * The second path segment is the file's checksum. It is not used to look the
 * image up — the id alone does that — it exists so that every version of a file has
 * its own URL and the response can be cached forever.
 *
 * The checksum sits in the path rather than a query string deliberately: it
 * lets `images.localPatterns` in next.config.ts pin `search: ""`, so the image
 * optimizer accepts these URLs without also accepting arbitrary query strings
 * that could be used to flood the optimizer's cache.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; v: string }> }
) {
  const { id } = await params;

  /* An invalid uuid would make Postgres throw rather than return no rows. */
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return new Response("Not found", { status: 404 });
  }

  const [row] = await db
    .select({
      data: media.data,
      mimeType: media.mimeType,
      byteSize: media.byteSize,
      checksum: media.checksum,
    })
    .from(media)
    .where(eq(media.id, id))
    .limit(1);

  if (!row) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(row.data), {
    headers: {
      "Content-Type": row.mimeType,
      "Content-Length": String(row.byteSize),
      "Cache-Control": "public, max-age=31536000, immutable",
      ETag: `"${row.checksum}"`,
    },
  });
}
