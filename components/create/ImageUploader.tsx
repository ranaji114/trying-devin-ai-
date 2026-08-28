"use client";

import { useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Star, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { PhotoInput } from "@/lib/validations/trip";
import { cn } from "@/lib/utils/cn";

const BUCKET = "trip-media";
const MAX_BYTES = 5 * 1024 * 1024;

interface ImageUploaderProps {
  userId: string;
  photos: PhotoInput[];
  onChange: (photos: PhotoInput[]) => void;
}

export function ImageUploader({ userId, photos, onChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFilesSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;

    setError(null);
    setUploading(true);
    const supabase = createClient();
    const uploaded: PhotoInput[] = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        setError("Only image files can be uploaded.");
        continue;
      }
      if (file.size > MAX_BYTES) {
        setError(`${file.name} is larger than 5 MB.`);
        continue;
      }

      const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${userId}/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        setError(`Could not upload ${file.name}. ${uploadError.message}`);
        continue;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(BUCKET).getPublicUrl(path);

      uploaded.push({
        publicUrl,
        storagePath: path,
        isCover: photos.length === 0 && uploaded.length === 0,
      });
    }

    setUploading(false);
    if (uploaded.length > 0) onChange([...photos, ...uploaded]);
  }

  async function removePhoto(target: PhotoInput) {
    const supabase = createClient();
    if (target.storagePath) {
      await supabase.storage.from(BUCKET).remove([target.storagePath]);
    }
    const remaining = photos.filter((photo) => photo.publicUrl !== target.publicUrl);
    if (target.isCover && remaining.length > 0) remaining[0] = { ...remaining[0], isCover: true };
    onChange(remaining);
  }

  function setCover(target: PhotoInput) {
    onChange(photos.map((photo) => ({ ...photo, isCover: photo.publicUrl === target.publicUrl })));
  }

  return (
    <div className="space-y-4">
      <label
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-line bg-surface px-6 py-10 text-center transition-colors hover:border-accent",
          uploading && "pointer-events-none opacity-70",
        )}
      >
        {uploading ? (
          <Loader2 className="h-5 w-5 animate-spin text-accent" aria-hidden />
        ) : (
          <ImagePlus className="h-5 w-5 text-muted" aria-hidden />
        )}
        <span className="mt-3 text-sm font-medium">
          {uploading ? "Uploading…" : "Add photos from your journey"}
        </span>
        <span className="mt-1 text-xs text-muted">JPG or PNG, up to 5 MB each</span>
        <input
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={onFilesSelected}
          disabled={uploading}
        />
      </label>

      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}

      {photos.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((photo) => (
            <li
              key={photo.publicUrl}
              className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-line bg-background"
            >
              <Image
                src={photo.publicUrl}
                alt=""
                fill
                sizes="(min-width: 640px) 240px, 45vw"
                className="object-cover"
              />
              {photo.isCover ? (
                <span className="absolute left-2 top-2 rounded-md bg-accent px-2 py-0.5 text-[11px] font-medium text-white">
                  Cover
                </span>
              ) : null}
              <div className="absolute inset-x-2 bottom-2 flex justify-end gap-1.5">
                {!photo.isCover ? (
                  <button
                    type="button"
                    onClick={() => setCover(photo)}
                    aria-label="Use as cover image"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface/95 text-muted hover:text-accent"
                  >
                    <Star className="h-4 w-4" aria-hidden />
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => removePhoto(photo)}
                  aria-label="Remove photo"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface/95 text-muted hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
