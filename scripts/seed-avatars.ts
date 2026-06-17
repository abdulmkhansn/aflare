import type { SupabaseClient } from "@supabase/supabase-js";

/** Returns a random synthetic face JPEG per request (person does not exist). */
const SYNTHETIC_FACE_URL = "https://thispersondoesnotexist.com/";

export const SEED_AVATARS_BUCKET = "seed-avatars";

const FETCH_DELAY_MS = 1500;
const MIN_IMAGE_BYTES = 1024;

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function fetchSyntheticFace(): Promise<Buffer | null> {
  try {
    const response = await fetch(SYNTHETIC_FACE_URL, {
      headers: {
        "User-Agent": "KindlingSeedScript/1.0",
        Accept: "image/jpeg,image/*,*/*",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("image")) {
      return null;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length < MIN_IMAGE_BYTES) {
      return null;
    }

    return buffer;
  } catch {
    return null;
  }
}

export async function ensureSeedAvatarsBucket(supabase: SupabaseClient) {
  const { data: buckets, error } = await supabase.storage.listBuckets();

  if (error) {
    throw new Error(`listBuckets: ${error.message}`);
  }

  if (buckets?.some((bucket) => bucket.name === SEED_AVATARS_BUCKET)) {
    return;
  }

  const { error: createError } = await supabase.storage.createBucket(SEED_AVATARS_BUCKET, {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
  });

  if (createError) {
    throw new Error(`createBucket: ${createError.message}`);
  }
}

type BuilderAvatarInput = {
  emailLocal: string;
  displayName: string;
};

export type SeedAvatarResult = {
  urlsBySlug: Map<string, string | null>;
  uploadedCount: number;
  fallbackNames: string[];
};

export async function uploadSeedAvatars(
  supabase: SupabaseClient,
  builders: BuilderAvatarInput[]
): Promise<SeedAvatarResult> {
  const urlsBySlug = new Map<string, string | null>();
  const fallbackNames: string[] = [];
  let uploadedCount = 0;

  for (let index = 0; index < builders.length; index += 1) {
    const builder = builders[index];
    const objectPath = `${builder.emailLocal}.jpg`;

    if (index > 0) {
      await sleep(FETCH_DELAY_MS);
    }

    const image = await fetchSyntheticFace();

    if (!image) {
      console.log(`  Avatar fallback (initials): ${builder.displayName} (fetch failed)`);
      urlsBySlug.set(builder.emailLocal, null);
      fallbackNames.push(builder.displayName);
      continue;
    }

    const { error: uploadError } = await supabase.storage
      .from(SEED_AVATARS_BUCKET)
      .upload(objectPath, image, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      console.log(
        `  Avatar fallback (initials): ${builder.displayName} (upload failed: ${uploadError.message})`
      );
      urlsBySlug.set(builder.emailLocal, null);
      fallbackNames.push(builder.displayName);
      continue;
    }

    const { data } = supabase.storage.from(SEED_AVATARS_BUCKET).getPublicUrl(objectPath);
    urlsBySlug.set(builder.emailLocal, data.publicUrl);
    uploadedCount += 1;
    console.log(`  Avatar uploaded: ${builder.displayName} → ${objectPath}`);
  }

  return { urlsBySlug, uploadedCount, fallbackNames };
}

export async function deleteSeedAvatarsStorage(supabase: SupabaseClient) {
  const { data: files, error: listError } = await supabase.storage
    .from(SEED_AVATARS_BUCKET)
    .list("", { limit: 1000 });

  if (listError) {
    const message = listError.message.toLowerCase();
    if (message.includes("not found") || message.includes("bucket")) {
      return { deletedObjects: 0, bucketRemoved: false };
    }
    throw new Error(`list seed-avatars: ${listError.message}`);
  }

  const objectPaths = (files ?? [])
    .map((file) => file.name)
    .filter((name) => name.length > 0);

  if (objectPaths.length === 0) {
    const { error: deleteBucketError } = await supabase.storage.deleteBucket(SEED_AVATARS_BUCKET);
    return {
      deletedObjects: 0,
      bucketRemoved: !deleteBucketError,
    };
  }

  const { error: removeError } = await supabase.storage
    .from(SEED_AVATARS_BUCKET)
    .remove(objectPaths);

  if (removeError) {
    throw new Error(`remove seed-avatars objects: ${removeError.message}`);
  }

  const { error: deleteBucketError } = await supabase.storage.deleteBucket(SEED_AVATARS_BUCKET);

  return {
    deletedObjects: objectPaths.length,
    bucketRemoved: !deleteBucketError,
  };
}
