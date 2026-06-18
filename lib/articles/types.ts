export type ArticleRow = {
  id: string;
  author_id: string;
  title: string;
  body: string;
  excerpt: string | null;
  cover_image_url: string | null;
  category: string | null;
  helpful_count: number;
  created_at: string;
};

export type ArticleDocumentBody = {
  kind: "document";
  doc_url: string;
  doc_type: "pdf" | "docx";
  description?: string;
};

export type ParsedArticleBody =
  | { kind: "html"; html: string }
  | ({ kind: "document" } & ArticleDocumentBody);

export function serializeDocumentBody(payload: ArticleDocumentBody): string {
  return JSON.stringify(payload);
}

export function parseArticleBody(body: string): ParsedArticleBody {
  const trimmed = body.trim();

  if (trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed) as Partial<ArticleDocumentBody>;

      if (
        parsed.kind === "document" &&
        typeof parsed.doc_url === "string" &&
        (parsed.doc_type === "pdf" || parsed.doc_type === "docx")
      ) {
        return {
          kind: "document",
          doc_url: parsed.doc_url,
          doc_type: parsed.doc_type,
          description: typeof parsed.description === "string" ? parsed.description : undefined,
        };
      }
    } catch {
      // fall through to html
    }
  }

  return { kind: "html", html: body };
}

export function isDocumentArticle(body: string): boolean {
  return parseArticleBody(body).kind === "document";
}

export function excerptFromHtml(html: string, maxLength = 160): string {
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) {
    return "";
  }

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 3).trim()}...`;
}

export const ARTICLE_SELECT = `
  id,
  author_id,
  title,
  body,
  excerpt,
  cover_image_url,
  category,
  helpful_count,
  created_at,
  profiles:author_id ( display_name, avatar_url, deleted, verified_builder )
`;

export type ArticleWithAuthor = ArticleRow & {
  profiles:
    | { display_name: string | null; avatar_url: string | null; deleted?: boolean | null; verified_builder?: boolean | null }
    | { display_name: string | null; avatar_url: string | null; deleted?: boolean | null; verified_builder?: boolean | null }[]
    | null;
};

export function resolveArticleAuthor(article: ArticleWithAuthor) {
  return Array.isArray(article.profiles) ? article.profiles[0] : article.profiles;
}

export type FeedArticleSummary = {
  id: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  helpful_count: number;
  body: string;
};

export function resolveFeedArticle(post: {
  article_id: string | null;
  articles:
    | FeedArticleSummary
    | FeedArticleSummary[]
    | null;
}): FeedArticleSummary | null {
  if (!post.article_id || !post.articles) {
    return null;
  }

  return Array.isArray(post.articles) ? post.articles[0] ?? null : post.articles;
}
