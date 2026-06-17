import { ArticleEditorForm } from "@/components/article-editor-form";
import { PageHeader } from "@/components/page-header";

type NewArticlePageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function NewArticlePage({ searchParams }: NewArticlePageProps) {
  const params = await searchParams;
  const error = params.error ? decodeURIComponent(params.error) : undefined;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Write an article"
        description="Share a long-form write-up or attach a PDF or Word document."
      />
      <ArticleEditorForm error={error} />
    </div>
  );
}
