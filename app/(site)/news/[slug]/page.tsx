import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticleLayout from "@/app/components/article/ArticleLayout";
import { NewsCard } from "@/app/components/cards";
import { describe } from "@/app/lib/articles";
import { RECIPIENT_NAME } from "@/app/lib/format";
import { getNewsCards, getNewsItem } from "@/app/lib/news";
import type { NewsCategory } from "@/db/schema";
import { NEWS_CATEGORY_INFO } from "@/lib/cms/news";

export const revalidate = 300;

/* What the "Source" and link are called, for each kind of update. */
const SOURCE_LABEL: Record<NewsCategory, string> = {
  award: "Presented by",
  invitation: "Hosted by",
  press: "Publication",
  announcement: "Source",
};
const LINK_LABEL: Record<NewsCategory, string> = {
  award: "Visit the link",
  invitation: "Event page",
  press: "Read the original article",
  announcement: "Visit the link",
};

export async function generateStaticParams() {
  return (await getNewsCards()).map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const item = await getNewsItem((await params).slug);
  if (!item) return {};
  const description = describe(item.summary, item.body) || item.title;
  return {
    title: `${item.title} — News & Awards`,
    description,
    openGraph: {
      title: item.title,
      description,
      type: "article",
      images: item.cover ? [item.cover.src] : undefined,
    },
  };
}

export default async function NewsItemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [item, all] = await Promise.all([getNewsItem(slug), getNewsCards()]);
  if (!item) notFound();

  const others = all.filter((other) => other.id !== item.id).slice(0, 3);

  return (
    <ArticleLayout
      trail={[{ label: "News & Awards", href: "/news" }]}
      eyebrow={
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-primary">{NEWS_CATEGORY_INFO[item.category].label}</span>
          {item.when && <> · {item.when}</>}
        </p>
      }
      title={item.title}
      summary={item.summary}
      details={[
        ...(item.recipient ? [{ label: "Awarded to", value: RECIPIENT_NAME[item.recipient] }] : []),
        ...(item.source ? [{ label: SOURCE_LABEL[item.category], value: item.source }] : []),
      ]}
      cover={item.cover}
      body={item.body}
      gallery={item.gallery}
      attachment={item.attachment}
      external={item.link ? { href: item.link, label: LINK_LABEL[item.category] } : null}
      more={
        others.length > 0
          ? {
              title: "More news",
              href: "/news",
              linkLabel: "All news & awards",
              children: others.map((other) => <NewsCard key={other.id} item={other} />),
            }
          : null
      }
    />
  );
}
