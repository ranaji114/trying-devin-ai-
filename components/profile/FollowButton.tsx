"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { toggleFollow } from "@/lib/actions/follows";

interface FollowButtonProps {
  profileId: string;
  username: string;
  initialFollowing: boolean;
}

export function FollowButton({ profileId, username, initialFollowing }: FollowButtonProps) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onClick() {
    setError(null);
    startTransition(async () => {
      const result = await toggleFollow(profileId, username);
      setFollowing(result.following);
      if (result.error) {
        setError(result.error);
        if (result.error.startsWith("Log in")) router.push(`/login?next=/profile/${username}`);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-1">
      <Button
        variant={following ? "secondary" : "primary"}
        onClick={onClick}
        disabled={pending}
        aria-pressed={following}
      >
        {following ? "Following" : "Follow"}
      </Button>
      {error ? (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
