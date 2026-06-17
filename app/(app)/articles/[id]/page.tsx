import { notFound } from "next/navigation";

import { ArticleReader } from "@/components/article-reader";
import { getArticle, isArticleMarkedHelpful } from "@/lib/articles/get-article";
import { parseHelpfulError } from "@/lib/comments/parse-comment-params";
import { pageTitle } from "@/lib/app/brand";
import { requireOnboarded } from "@/utils/auth/session";

type ArticlePageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ helpfulError?: string }>;
};

export async function generateMetadata({ params }: ArticlePageProps) {
  const { id } = await params;
  const article = await getArticle(id);

  if (!article) {
    return { title: pageTitle("Article") };
  }

  return { title: pageTitle(article.title) };
}

export default async function ArticlePage({ params, searchParams }: ArticlePageProps) {
  const auth = await requireOnboarded();
  const { id } = await params;
  const query = await searchParams;
  const helpfulError = parseHelpfulError(query);

  const article = await getArticle(id);

  if (!article) {
    notFound();
  }

  const isMarkedHelpful = await isArticleMarkedHelpful(article.id, auth.userId);

  return (
    <ArticleReader
      article={article}
      currentUserId={auth.userId}
      isMarkedHelpful={isMarkedHelpful}
      helpfulError={helpfulError}
    />
  );
}
