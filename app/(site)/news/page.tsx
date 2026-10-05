import type { Metadata } from "next";
import NewsFeed from "@/app/components/NewsFeed";
import { PageHeader } from "@/app/components/ui";
import { getNewsCards } from "@/app/lib/news";

export const metadata: Metadata = {
  title: "News & Awards — Prof. Ibrahim Adepoju Adeyanju",
  description:
    "Awards, invitations, lectures and press coverage for Prof. Ibrahim Adeyanju and Galaxy Backbone.",
};

export const revalidate = 300;

export default async function NewsPage() {
  const items = await getNewsCards();

  return (
    <>
      <PageHeader
        title="News & Awards"
        intro="Awards, invitations to speak and lecture, and press coverage for Prof. Adeyanju and Galaxy Backbone. Open any item to read more."
      />

      <section className="py-14">
        <div className="mx-auto max-w-6xl px-6">
          {items.length > 0 ? (
            <NewsFeed items={items} />
          ) : (
            <p className="text-muted-foreground">Nothing has been posted yet. Please check back soon.</p>
          )}
        </div>
      </section>
    </>
  );
}
