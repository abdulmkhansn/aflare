import { POST_TYPES, getPostTypeLabel } from "@/lib/posts/post-types";
import {
  cardClassName,
  errorTextClassName,
  fieldClassName,
  labelClassName,
  primaryButtonClassName,
  sectionTitleClassName,
  statusTextClassName,
} from "@/lib/ui/classes";

type ProjectOption = {
  id: string;
  name: string;
};

type PostComposeFormProps = {
  action: (formData: FormData) => Promise<void>;
  projects?: ProjectOption[];
  projectId?: string;
  posted?: boolean;
  error?: string;
  redirectField?: string;
};

export function PostComposeForm({
  action,
  projects,
  projectId,
  posted,
  error,
  redirectField,
}: PostComposeFormProps) {
  const showProjectSelect = !projectId && projects && projects.length > 0;
  const singleProject = projects?.length === 1 ? projects[0] : null;
  const resolvedProjectId = projectId ?? singleProject?.id;

  return (
    <div className={cardClassName}>
      <h2 className={sectionTitleClassName}>Post an update</h2>

      {posted ? (
        <p className={`mt-2 ${statusTextClassName}`} role="status">
          Posted.
        </p>
      ) : null}

      {error ? (
        <p className={`mt-2 ${errorTextClassName}`} role="alert">
          {error}
        </p>
      ) : null}

      <form action={action} className="mt-4 space-y-4">
        {redirectField ? <input type="hidden" name="redirect_to" value={redirectField} /> : null}

        {resolvedProjectId ? (
          <input type="hidden" name="project_id" value={resolvedProjectId} />
        ) : null}

        {showProjectSelect && projects.length > 1 ? (
          <div className="space-y-1.5">
            <label htmlFor="project_id" className={labelClassName}>
              Project
            </label>
            <select id="project_id" name="project_id" required className={fieldClassName}>
              <option value="">Pick a project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div className="space-y-1.5">
          <label htmlFor="type" className={labelClassName}>
            Type
          </label>
          <select id="type" name="type" defaultValue="update" className={fieldClassName}>
            {POST_TYPES.map((type) => (
              <option key={type} value={type}>
                {getPostTypeLabel(type)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="body" className={labelClassName}>
            Update
          </label>
          <textarea
            id="body"
            name="body"
            rows={4}
            required
            className={fieldClassName}
            placeholder="What changed, what you learned, or where you are stuck."
          />
        </div>

        <button type="submit" className={primaryButtonClassName}>
          Post
        </button>
      </form>
    </div>
  );
}
