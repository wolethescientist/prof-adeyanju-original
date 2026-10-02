import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticleLayout from "@/app/components/article/ArticleLayout";
import { AwardCard, AwardPlate } from "@/app/components/cards";
import Seal, { RECIPIENT_NAME } from "@/app/components/Seal";
import { describe, getAward, getAwardCards } from "@/app/lib/articles";
import { formatDate } from "@/app/lib/format";

/* Rendered ahead of time for every published award, and refreshed whenever
   the CMS saves one. Awards added later render on their first visit. */
export const revalidate = 300;

export async function generateStaticParams() {
  return (await getAwardCards()).map((award) => ({ slug: award.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const award = await getAward((await params).slug);
  if (!award) return {};
  const description = describe(award.summary, award.body) || `${award.title}, ${award.year}.`;
  return {
    title: `${award.title} — Prof. Ibrahim Adepoju Adeyanju`,
    description,
    openGraph: {
      title: award.title,
      description,
      type: "article",
      images: award.cover ? [award.cover.src] : undefined,
    },
  };
}

export default async function AwardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [award, all] = await Promise.all([getAward(slug), getAwardCards()]);
  if (!award) notFound();

  const presented = formatDate(award.awardedOn);
  const others = all.filter((item) => item.id !== award.id).slice(0, 3);

  return (
    <ArticleLayout
      trail={[
        { label: "Recognition", href: "/recognition" },
        { label: "Awards", href: "/recognition#awards" },
      ]}
      eyebrow={
        <div className="flex items-center gap-3">
          <Seal recipient={award.recipient} />
          <p className="font-mono text-[0.72rem] font-medium uppercase tracking-[0.18em] text-gold-ink">
            Award · {award.year}
            <span className="block text-muted-foreground mt-0.5">
              Awarded to {RECIPIENT_NAME[award.recipient]}
            </span>
          </p>
        </div>
      }
      title={award.title}
      summary={award.summary}
      details={[
        { label: "Awarded to", value: RECIPIENT_NAME[award.recipient] },
        { label: "Year", value: award.year },
        ...(presented ? [{ label: "Presented on", value: presented }] : []),
        ...(award.awardedBy ? [{ label: "Presented by", value: award.awardedBy }] : []),
      ]}
      cover={award.cover}
      coverFallback={<AwardPlate year={award.year} awardedBy={award.awardedBy} large />}
      body={award.body}
      gallery={award.gallery}
      attachment={award.attachment}
      more={
        others.length > 0
          ? {
              title: "More recognition",
              href: "/recognition#awards",
              linkLabel: "All awards",
              children: others.map((item) => <AwardCard key={item.id} award={item} />),
            }
          : null
      }
    />
  );
}
