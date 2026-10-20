"use client";

import { useRef, useState } from "react";
import type { GalleryImage } from "@/lib/listImages";

type CopyState = { name: string; ok: boolean } | null;

export default function ImageGallery({ images }: { images: GalleryImage[] }) {
  const [copyState, setCopyState] = useState<CopyState>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function copyUrl(image: GalleryImage) {
    let ok = true;
    try {
      await navigator.clipboard.writeText(image.url);
    } catch (error) {
      console.error("copy error:", error);
      ok = false;
    }
    setCopyState({ name: image.name, ok });
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopyState(null), 2000);
  }

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {images.map((image) => (
        <li key={image.name}>
          <button
            type="button"
            onClick={() => copyUrl(image)}
            title="クリックで公開URLをコピー"
            aria-label="この画像の公開URLをコピー"
            className="group relative block aspect-square w-full overflow-hidden rounded-lg border border-gray-700"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.url}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover"
            />
            <span className="absolute inset-x-0 bottom-0 bg-black/60 px-2 py-1 text-xs text-gray-200 opacity-0 transition-opacity group-hover:opacity-100">
              クリックでURLをコピー
            </span>
            {copyState?.name === image.name && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/70 text-sm text-white">
                {copyState.ok ? "コピーしました" : "コピー失敗"}
              </span>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}
