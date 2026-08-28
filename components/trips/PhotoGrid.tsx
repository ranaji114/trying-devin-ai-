import Image from "next/image";
import type { TripMedia } from "@/types";

export function PhotoGrid({ media, title }: { media: TripMedia[]; title: string }) {
  if (media.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {media.map((item, index) => (
        <div
          key={item.id}
          className="relative aspect-[4/3] overflow-hidden rounded-lg border border-line bg-background"
        >
          <Image
            src={item.public_url}
            alt={`${title} — photo ${index + 1}`}
            fill
            sizes="(min-width: 640px) 320px, 45vw"
            className="object-cover transition-transform duration-300 hover:scale-[1.02]"
          />
        </div>
      ))}
    </div>
  );
}
