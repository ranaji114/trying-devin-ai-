"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { deleteTrip, updateTripStatus } from "@/lib/actions/trips";
import type { TripStatus } from "@/types/database";

interface TripOwnerActionsProps {
  tripId: string;
  status: TripStatus;
}

export function TripOwnerActions({ tripId, status }: TripOwnerActionsProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  function onToggleStatus() {
    setError(null);
    startTransition(async () => {
      const next: TripStatus = status === "published" ? "draft" : "published";
      const result = await updateTripStatus(tripId, next);
      if (result.error) setError(result.error);
      else router.refresh();
    });
  }

  function onDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteTrip(tripId);
      if (result.error) setError(result.error);
      else router.push("/explore");
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={onToggleStatus} disabled={pending}>
          {status === "published" ? "Unpublish" : "Publish"}
        </Button>
        {confirming ? (
          <>
            <Button variant="danger" size="sm" onClick={onDelete} disabled={pending}>
              Confirm delete
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
          </>
        ) : (
          <Button variant="danger" size="sm" onClick={() => setConfirming(true)} disabled={pending}>
            Delete
          </Button>
        )}
      </div>
      {error ? (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
