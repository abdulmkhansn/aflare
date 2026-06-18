import { PROJECT_STAGES, PROJECT_STAGE_LABELS } from "@/lib/projects/stages";
import {
  errorTextClassName,
  fieldClassName,
  textareaFieldClassName,
  labelClassName,
  primaryButtonClassName,
  statusTextClassName,
} from "@/lib/ui/classes";

type ProjectFormValues = {
  name: string;
  oneLiner: string;
  stage: string;
  abstractDescription: string;
};

type ProjectFormProps = {
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
  projectId?: string;
  initialValues?: Partial<ProjectFormValues>;
  error?: string;
  successMessage?: string;
};

export function ProjectForm({
  action,
  submitLabel,
  projectId,
  initialValues,
  error,
  successMessage,
}: ProjectFormProps) {
  return (
    <form action={action} className="space-y-4">
      {projectId ? <input type="hidden" name="project_id" value={projectId} /> : null}

      {successMessage ? (
        <p className={statusTextClassName} role="status">
          {successMessage}
        </p>
      ) : null}

      {error ? (
        <p className={errorTextClassName} role="alert">
          {error}
        </p>
      ) : null}

      <div className="space-y-1.5">
        <label htmlFor="name" className={labelClassName}>
          Project name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={initialValues?.name ?? ""}
          className={fieldClassName}
          placeholder="Working title is fine"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="one_liner" className={labelClassName}>
          One-liner
        </label>
        <input
          id="one_liner"
          name="one_liner"
          type="text"
          required
          defaultValue={initialValues?.oneLiner ?? ""}
          className={fieldClassName}
          placeholder="What it is in one sentence"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="stage" className={labelClassName}>
          Stage
        </label>
        <select
          id="stage"
          name="stage"
          defaultValue={initialValues?.stage ?? "building"}
          className={fieldClassName}
        >
          {PROJECT_STAGES.map((stage) => (
            <option key={stage} value={stage}>
              {PROJECT_STAGE_LABELS[stage]}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="abstract_description" className={labelClassName}>
          Shareable description <span className="font-normal text-fg-muted">(optional)</span>
        </label>
        <textarea
          id="abstract_description"
          name="abstract_description"
          rows={4}
          defaultValue={initialValues?.abstractDescription ?? ""}
          className={textareaFieldClassName}
          placeholder="A public summary of what you are building. Leave out secrets, keys, and private details."
        />
        <p className="text-xs text-fg-muted">
          This is safe to share. Do not put credentials or unreleased specifics here.
        </p>
      </div>

      <button type="submit" className={primaryButtonClassName}>
        {submitLabel}
      </button>
    </form>
  );
}
