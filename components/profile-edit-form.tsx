import Link from "next/link";

import { updateProfile } from "@/app/(app)/actions/profile";
import { AvatarUploadControl } from "@/components/avatar-upload-control";
import { formatTagLabel } from "@/lib/tags/format-tag-label";
import {
  cardClassName,
  errorTextClassName,
  fieldClassName,
  textareaFieldClassName,
  focusRingClassName,
  labelClassName,
  primaryButtonClassName,
  secondaryButtonClassName,
  statusTextClassName,
} from "@/lib/ui/classes";

type TagOption = {
  id: string;
  label: string;
};

type ProfileEditFormProps = {
  userId: string;
  displayName: string;
  bio: string;
  avatarUrl: string | null;
  tags: TagOption[];
  selectedBrings: string[];
  selectedOpenTo: string[];
  saved?: boolean;
  avatarSaved?: boolean;
  error?: string;
};

function TagGroup({
  title,
  helper,
  name,
  tags,
  selected,
}: {
  title: string;
  helper: string;
  name: "brings" | "open_to";
  tags: TagOption[];
  selected: string[];
}) {
  return (
    <fieldset className="space-y-3">
      <legend className={labelClassName}>{title}</legend>
      <p className="text-sm text-fg-muted">{helper}</p>
      {tags.length === 0 ? (
        <p className="text-sm text-fg-muted">No tags available yet.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {tags.map((tag) => (
            <li key={`${name}-${tag.id}`}>
              <label className="flex cursor-pointer items-center gap-2 rounded-md border border-border-subtle bg-surface-input px-3 py-2 text-sm text-fg transition-colors hover:border-fg/20 has-checked:border-ember/40 has-checked:bg-ember/10">
                <input
                  type="checkbox"
                  name={name}
                  value={tag.id}
                  defaultChecked={selected.includes(tag.id)}
                  className="h-4 w-4 rounded border-border-subtle text-ember focus-visible:ring-2 focus-visible:ring-teal"
                />
                {formatTagLabel(tag.label)}
              </label>
            </li>
          ))}
        </ul>
      )}
    </fieldset>
  );
}

export function ProfileEditForm({
  userId,
  displayName,
  bio,
  avatarUrl,
  tags,
  selectedBrings,
  selectedOpenTo,
  saved,
  avatarSaved,
  error,
}: ProfileEditFormProps) {
  const redirectTo = `/u/${userId}/edit`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-medium text-fg">Edit profile</h1>
          <p className="mt-1 text-sm text-fg-muted">
            Keep it honest. This is how people find you when they want to help.
          </p>
        </div>
        <Link href={`/u/${userId}`} className={secondaryButtonClassName}>
          Cancel
        </Link>
      </div>

      {saved ? (
        <p className={statusTextClassName} role="status">
          Profile saved.
        </p>
      ) : null}

      {avatarSaved ? (
        <p className={statusTextClassName} role="status">
          Photo updated.
        </p>
      ) : null}

      {error ? (
        <p className={errorTextClassName} role="alert">
          {error}
        </p>
      ) : null}

      <section className={cardClassName}>
        <h2 className="text-sm font-medium text-fg">Photo</h2>
        <p className="mt-1 text-xs text-fg-muted">
          Uploads go straight to storage from your browser. Nothing passes through our server.
        </p>
        <div className="mt-4">
          <AvatarUploadControl
            displayName={displayName}
            avatarUrl={avatarUrl}
            redirectTo={redirectTo}
          />
        </div>
      </section>

      <form action={updateProfile} className={`${cardClassName} space-y-6`}>
        <input type="hidden" name="redirect_to" value={redirectTo} />

        <div className="space-y-2">
          <label htmlFor="display_name" className={labelClassName}>
            Name
          </label>
          <input
            id="display_name"
            name="display_name"
            type="text"
            required
            defaultValue={displayName}
            className={fieldClassName}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="bio" className={labelClassName}>
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            defaultValue={bio}
            placeholder="What you're building, what you care about, what you'd like help with."
            className={textareaFieldClassName}
          />
        </div>

        <TagGroup
          title="What I bring"
          helper="Skills or experience you can offer other builders."
          name="brings"
          tags={tags}
          selected={selectedBrings}
        />

        <TagGroup
          title="Open to collaborating on"
          helper="Kinds of projects or problems you welcome help with."
          name="open_to"
          tags={tags}
          selected={selectedOpenTo}
        />

        <button type="submit" className={primaryButtonClassName}>
          Save profile
        </button>
      </form>
    </div>
  );
}
