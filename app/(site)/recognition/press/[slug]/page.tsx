import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticleLayout from "@/app/components/article/ArticleLayout";
import { PressCard } from "@/app/components/cards";
import { describe, getPressArticle, getPressCards } from "@/app/lib/articles";
import { formatDate } from "@/app/lib/format";

export const revalidate = 300;

export async function generateStaticParams() {
  return (await getPressCards()).map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const item = await getPressArticle((await params).slug);
  if (!item) return {};
  const description = describe(item.summary, item.body) || `Coverage in ${item.outlet}.`;
  return {
    title: `${item.title} — ${item.outlet}`,
    description,
    openGraph: {
      title: item.title,
      description,
      type: "article",
      images: item.cover ? [item.cover.src] : undefined,
    },
  };
}

export default async function PressPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [item, all] = await Promise.all([getPressArticle(slug), getPressCards()]);
  if (!item) notFound();

  const published = formatDate(item.publishedOn);
  const others = all.filter((other) => other.id !== item.id).slice(0, 3);

  return (
    <ArticleLayout
      trail={[
        { label: "Recognition", href: "/recognition" },
        { label: "In the press", href: "/recognition#press" },
      ]}
      eyebrow={
        <p className="font-mono text-[0.72rem] font-medium uppercase tracking-[0.18em] text-primary">
          {item.outlet}
          {published && <span className="text-muted-foreground"> · {published}</span>}
        </p>
      }
      title={item.title}
      summary={item.summary}
      details={[
        { label: "Publication", value: item.outlet },
        ...(published ? [{ label: "Published", value: published }] : []),
      ]}
      cover={item.cover}
      body={item.body}
      gallery={item.gallery}
      attachment={item.attachment}
      external={item.original ? { href: item.original, label: `Read it on ${item.outlet}` } : null}
      more={
        others.length > 0
          ? {
              title: "More coverage",
              href: "/recognition#press",
              linkLabel: "All press",
              children: others.map((other) => <PressCard key={other.id} item={other} />),
            }
          : null
      }
    />
  );
}
