import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticleLayout from "@/app/components/article/ArticleLayout";
import { InitiativeCard } from "@/app/components/cards";
import { describe, getInitiative, getInitiativeCards } from "@/app/lib/articles";
import { resolveIcon } from "@/app/lib/icons";

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
  return {
    title: `${item.title} — Impact at Galaxy Backbone`,
    description,
    openGraph: {
      title: item.title,
      description,
      type: "article",
      images: item.cover ? [item.cover.src] : undefined,
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
    <ArticleLayout
      trail={[
        { label: "Impact", href: "/impact" },
        { label: "Initiatives", href: "/impact#initiatives" },
      ]}
      eyebrow={
        <p className="flex items-center gap-2.5 font-mono text-[0.72rem] font-medium uppercase tracking-[0.18em] text-primary">
          <span className="grid size-8 place-items-center rounded-lg bg-secondary">
            <Icon className="size-4" aria-hidden="true" />
          </span>
          Initiative at Galaxy Backbone
        </p>
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
  );
}
