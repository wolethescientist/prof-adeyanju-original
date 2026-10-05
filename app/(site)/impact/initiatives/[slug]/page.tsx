import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticleLayout from "@/app/components/article/ArticleLayout";
import JsonLd from "@/app/components/JsonLd";
import { InitiativeCard } from "@/app/components/cards";
import { describe, getInitiative, getInitiativeCards } from "@/app/lib/articles";
import { resolveIcon } from "@/app/lib/icons";
import { DEFAULT_SHARE_IMAGE } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";
import { articleSchema, breadcrumbSchema } from "@/lib/structured-data";

export const revalidate = 300;

export async function generateStaticParams() {
  return (await getInitiativeCards()).map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const item = await getInitiative((await params).slug);
  if (!item) return {};
  const description = describe(item.summary, item.body);
  const path = `/impact/initiatives/${item.slug}`;
  return {
    title: item.title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      siteName: SITE_NAME,
      locale: "en_NG",
      url: path,
      title: item.title,
      description,
      modifiedTime: item.updatedAt.toISOString(),
      images: [item.cover ? { url: item.cover.src, alt: item.cover.alt } : DEFAULT_SHARE_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: item.title,
      description,
      images: [item.cover?.src ?? DEFAULT_SHARE_IMAGE.url],
    },
  };
}

export default async function InitiativePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [item, all] = await Promise.all([getInitiative(slug), getInitiativeCards()]);
  if (!item) notFound();

  const Icon = resolveIcon(item.icon);
  const others = all.filter((other) => other.id !== item.id).slice(0, 3);

  return (
    <>
    <JsonLd
      data={[
        articleSchema({
          type: "Article",
          path: item.href,
          headline: item.title,
          description: describe(item.summary, item.body),
          image: item.cover?.src ?? null,
          modified: item.updatedAt,
        }),
        breadcrumbSchema([
          { name: "Impact", path: "/impact" },
          { name: item.title, path: item.href },
        ]),
      ]}
    />
    <ArticleLayout
      trail={[
        { label: "Impact", href: "/impact" },
        { label: "Initiatives", href: "/impact#initiatives" },
      ]}
      eyebrow={
        <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-sm font-semibold text-secondary-foreground">
          <Icon className="size-4" aria-hidden="true" />
          Initiative at Galaxy Backbone
        </span>
      }
      title={item.title}
      summary={item.summary}
      details={[]}
      cover={item.cover}
      body={item.body}
      gallery={item.gallery}
      attachment={item.attachment}
      more={
        others.length > 0
          ? {
              title: "Other initiatives",
              href: "/impact#initiatives",
              linkLabel: "All initiatives",
              children: others.map((other) => <InitiativeCard key={other.id} item={other} />),
            }
          : null
      }
    />
    </>
  );
}
