import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to document journeys and save routes on TrekLog.",
};

export default function LoginPage() {
  return (
    <div className="container-page flex justify-center py-16">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="mt-2 text-sm text-muted">
          Log in to continue documenting and saving journeys.
        </p>
        <div className="card mt-8 p-6">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
