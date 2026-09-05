import { eq } from "drizzle-orm";
import { db } from "@/db";
import { media } from "@/db/schema";

/**
 * Serves an uploaded image out of the database.
 *
 * Callers build the URL with `mediaUrl()`, which appends the file's checksum
 * as `?v=`. That makes each version of a file a distinct URL, so the response
 * can be cached immutably — the browser and the CDN only re-fetch when the
 * image genuinely changes.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
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
