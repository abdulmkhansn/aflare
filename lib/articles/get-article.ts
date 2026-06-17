import { ARTICLE_SELECT, type ArticleWithAuthor } from "@/lib/articles/types";
import { createClient } from "@/utils/supabase/server";

export async function getArticle(id: string): Promise<ArticleWithAuthor | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("articles")
    .select(ARTICLE_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as ArticleWithAuthor | null) ?? null;
}

export async function isArticleMarkedHelpful(articleId: string, userId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("helpful_marks")
    .select("target_id")
    .eq("target_type", "article")
    .eq("target_id", articleId)
    .eq("marker_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data);
}
