"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

function loginErrorRedirect(message: string): never {
  redirect(`/login?error=${encodeURIComponent(message)}`);
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    loginErrorRedirect("Enter your email and password.");
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    loginErrorRedirect(
      error.message === "Invalid login credentials"
        ? "Email or password is wrong. Try again or create an account."
        : error.message
    );
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    loginErrorRedirect("Enter an email and password to create an account.");
  }

  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    loginErrorRedirect(error.message);
  }

  revalidatePath("/", "layout");
  redirect("/");
}
