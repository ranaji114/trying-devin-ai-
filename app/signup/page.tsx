import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create a TrekLog account and document your first journey.",
};

export default function SignupPage() {
  return (
    <div className="container-page flex justify-center py-16">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-semibold">Create your TrekLog</h1>
        <p className="mt-2 text-sm text-muted">
          Document your journeys and guide the next traveler.
        </p>
        <div className="card mt-8 p-6">
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
