import { AlertCircle, Compass } from "lucide-react";
import { ButtonLink } from "./Button";
import { cn } from "@/lib/utils/cn";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("card flex flex-col items-center px-6 py-14 text-center", className)}>
      <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg border border-line bg-background">
        <Compass className="h-5 w-5 text-muted" aria-hidden />
      </span>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-muted">{description}</p>
      {actionLabel && actionHref ? (
        <ButtonLink href={actionHref} className="mt-6">
          {actionLabel}
        </ButtonLink>
      ) : null}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function ErrorState({
  title = "Something went wrong.",
  description = "Please try again.",
  action,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="card flex flex-col items-center px-6 py-14 text-center"
    >
      <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg border border-red-100 bg-red-50">
        <AlertCircle className="h-5 w-5 text-red-500" aria-hidden />
      </span>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-muted">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function TripCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton aspect-video rounded-none" />
      <div className="space-y-3 p-4">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3 w-1/2" />
        <div className="skeleton h-3 w-1/3" />
      </div>
    </div>
  );
}

export function TripGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      aria-busy="true"
      aria-label="Loading journeys"
    >
      {Array.from({ length: count }).map((_, index) => (
        <TripCardSkeleton key={index} />
      ))}
    </div>
  );
}
