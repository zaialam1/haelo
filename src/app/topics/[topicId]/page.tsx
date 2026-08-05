import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { TopicPlanetPage } from "@/components/topics/TopicPlanetPage";
import { getTopicCatalog } from "@/lib/topics/catalog";
import { getPlanetPageData } from "@/lib/topics/reflections";
import { createClient } from "@/lib/supabase/server";

type TopicPageProps = {
  params: Promise<{ topicId: string }>;
};

export async function generateMetadata({
  params,
}: TopicPageProps): Promise<Metadata> {
  const { topicId } = await params;
  const topic = getTopicCatalog(topicId);
  const name = topic?.label ?? "Topic";
  return {
    title: `${name} — Haelo`,
    description:
      topic?.tagline ?? `Explore ${name} in your conversation universe.`,
  };
}

export default async function TopicDetailPage({ params }: TopicPageProps) {
  const { topicId } = await params;
  const topic = getTopicCatalog(topicId);
  if (!topic) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/topics/${topicId}`)}`);
  }

  const model = await getPlanetPageData(user.id, topicId);
  if (!model) notFound();

  return (
    <main className="min-h-full">
      <TopicPlanetPage model={model} />
    </main>
  );
}
