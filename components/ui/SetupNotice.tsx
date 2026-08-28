import { Settings2 } from "lucide-react";

/** Shown when Supabase environment variables are missing. */
export function SetupNotice() {
  return (
    <div className="card px-6 py-10">
      <div className="flex items-start gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line bg-background">
          <Settings2 className="h-5 w-5 text-muted" aria-hidden />
        </span>
        <div className="space-y-2">
          <h3 className="text-base font-semibold">Connect TrekLog to Supabase</h3>
          <p className="text-sm text-muted">
            Copy <code className="rounded bg-background px-1">.env.example</code> to{" "}
            <code className="rounded bg-background px-1">.env.local</code>, add your Supabase
            project URL and anon key, run the SQL in{" "}
            <code className="rounded bg-background px-1">supabase/migrations/0001_init.sql</code>,
            then restart the dev server.
          </p>
        </div>
      </div>
    </div>
  );
}
