import { NextResponse } from "next/server";

import {
  ensurePostImagesBucket,
  POST_IMAGE_MAX_BYTES,
  POST_IMAGES_BUCKET,
} from "@/lib/storage/post-images";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Use a JPEG, PNG, GIF, or WebP image." },
      { status: 400 }
    );
  }

  if (file.size > POST_IMAGE_MAX_BYTES) {
    return NextResponse.json({ error: "Images must be 5MB or smaller." }, { status: 400 });
  }

  const admin = createAdminClient();

  if (admin) {
    try {
      await ensurePostImagesBucket(admin);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Couldn't prepare image storage.";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  const extension = file.type.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
  const objectPath = `${user.id}/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(POST_IMAGES_BUCKET)
    .upload(objectPath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data } = supabase.storage.from(POST_IMAGES_BUCKET).getPublicUrl(objectPath);

  return NextResponse.json({ url: data.publicUrl });
}
