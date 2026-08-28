"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { login, signup, type AuthFormState } from "@/lib/actions/auth";

const INITIAL_STATE: AuthFormState = {};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Please wait…" : label}
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useFormState(login, INITIAL_STATE);
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <input type="hidden" name="next" value={next} />
      <Input label="Email" name="email" type="email" autoComplete="email" required />
      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />
      {state.error ? (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      <SubmitButton label="Log in" />
      <p className="text-center text-sm text-muted">
        New to TrekLog?{" "}
        <Link href="/signup" className="font-medium text-accent hover:text-accent-hover">
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function SignupForm() {
  const [state, formAction] = useFormState(signup, INITIAL_STATE);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <Input label="Full name" name="fullName" autoComplete="name" required />
      <Input
        label="Username"
        name="username"
        autoComplete="username"
        hint="Lowercase letters, numbers and underscores."
        required
      />
      <Input label="Email" name="email" type="email" autoComplete="email" required />
      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        hint="At least 8 characters."
        required
      />
      {state.error ? (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {state.message ? (
        <p className="rounded-lg border border-line bg-background px-3 py-2 text-sm text-ink">
          {state.message}
        </p>
      ) : null}
      <SubmitButton label="Create account" />
      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-accent hover:text-accent-hover">
          Log in
        </Link>
      </p>
    </form>
  );
}
