"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { credentialsSchema, signupSchema } from "@/lib/validations/trip";

export interface AuthFormState {
  error?: string;
  message?: string;
}

function safeNext(next: FormDataEntryValue | null): string {
  const value = typeof next === "string" ? next : "";
  return value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export async function login(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your details and try again." };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "Incorrect email or password." };
  }

  revalidatePath("/", "layout");
  redirect(safeNext(formData.get("next")));
}

export async function signup(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    fullName: formData.get("fullName"),
    username: formData.get("username"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your details and try again." };
  }

  const supabase = createClient();
  const { data: existing } = await supabase
    .from("profiles")
    .select("username")
    .eq("username", parsed.data.username)
    .maybeSingle();

  if (existing) {
    return { error: "That username is already taken." };
  }

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { username: parsed.data.username, full_name: parsed.data.fullName },
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("registered")) {
      return { error: "An account with this email already exists. Try logging in." };
    }
    return { error: error.message };
  }

  if (!data.session) {
    return { message: "Check your inbox to confirm your email, then log in." };
  }

  revalidatePath("/", "layout");
  redirect("/create");
}

export async function logout(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
