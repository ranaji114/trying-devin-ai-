import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <div className="container-page flex flex-col items-center py-24 text-center">
      <p className="text-sm font-medium text-accent">404</p>
      <h1 className="mt-3 text-2xl font-semibold sm:text-3xl">This route does not exist</h1>
      <p className="mt-3 max-w-md text-sm text-muted">
        The page or journey you are looking for may have been unpublished or removed.
      </p>
      <div className="mt-8 flex gap-3">
        <ButtonLink href="/explore">Explore journeys</ButtonLink>
        <ButtonLink href="/" variant="secondary">
          Back home
        </ButtonLink>
      </div>
    </div>
  );
}
