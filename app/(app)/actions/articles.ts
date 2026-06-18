"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  excerptFromHtml,
  serializeDocumentBody,
  type ArticleDocumentBody,
} from "@/lib/articles/types";
import { requireOnboarded } from "@/utils/auth/session";
import { createClient } from "@/utils/supabase/server";

function readTrimmed(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function redirectWithArticleError(message: string): never {
  redirect(`/articles/new?error=${encodeURIComponent(message)}`);
}

export async function publishArticle(formData: FormData) {
  const auth = await requireOnboarded();
  const mode = readTrimmed(formData, "mode");
  const title = readTrimmed(formData, "title");

  if (!title) {
    redirectWithArticleError("Add a title before publishing.");
  }

  const supabase = await createClient();

  let body = "";
  let excerpt: string | null = null;
  let coverImageUrl = readTrimmed(formData, "cover_image_url") || null;

  if (mode === "document") {
    const docUrl = readTrimmed(formData, "doc_url");
    const docType = readTrimmed(formData, "doc_type");
    const description = readTrimmed(formData, "description");

    if (!docUrl || (docType !== "pdf" && docType !== "docx")) {
      redirectWithArticleError("Upload a PDF or Word document before publishing.");
    }

    const payload: ArticleDocumentBody = {
      kind: "document",
      doc_url: docUrl,
      doc_type: docType,
    };

    if (description) {
      payload.description = description;
    }

    body = serializeDocumentBody(payload);
    excerpt = description || null;
    coverImageUrl = null;
  } else {
    const bodyHtml = readTrimmed(formData, "body_html");

    if (!bodyHtml || bodyHtml === "<p></p>") {
      redirectWithArticleError("Write something before publishing.");
    }

    body = bodyHtml;
    excerpt = excerptFromHtml(bodyHtml) || null;
  }

  const { data: article, error: articleError } = await supabase
    .from("articles")
    .insert({
      author_id: auth.userId,
      title,
      body,
      excerpt,
      cover_image_url: coverImageUrl,
      category: null,
    })
    .select("id")
    .single();

  if (articleError || !article) {
    redirectWithArticleError(articleError?.message ?? "Couldn't save the article.");
  }

  const postBody = excerpt || title;

  const { error: postError } = await supabase.from("posts").insert({
    author_id: auth.userId,
    kind: "article",
    type: "update",
    body: postBody,
    project_id: null,
    article_id: article.id,
    structured_fields: null,
  });

  if (postError) {
    redirectWithArticleError(postError.message);
  }

  revalidatePath("/");
  revalidatePath(`/articles/${article.id}`);

  redirect("/?posted=1");
}
