"use client";

import { useEffect, useState } from "react";
import DropZone from "@/components/DropZone";
import ImageGallery from "@/components/ImageGallery";
import { GALLERY_LIMIT, listImages, type GalleryImage } from "@/lib/listImages";

// 先に並べたものを優先して、同じ名前を除き、表示枚数に収める
function mergeImages(primary: GalleryImage[], secondary: GalleryImage[]) {
  const seen = new Set<string>();
  const merged: GalleryImage[] = [];
  for (const image of [...primary, ...secondary]) {
    if (!seen.has(image.name)) {
      seen.add(image.name);
      merged.push(image);
    }
  }
  return merged.slice(0, GALLERY_LIMIT);
}

export default function ImageUploader() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // 画面を開いたとき、保存済みの画像を取得する
  useEffect(() => {
    let cancelled = false;
    listImages().then((result) => {
      if (cancelled) return;
      if (result.ok) {
        // 取得中にアップロードされた画像（state にある分）を優先して残す
        setImages((prev) => mergeImages(prev, result.images));
      } else {
        setLoadError(result.reason);
      }
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // アップロード成功分を、一覧の先頭に足す（再読み込み不要）
  function handleUploaded(newImages: GalleryImage[]) {
    setImages((prev) => mergeImages([...newImages].reverse(), prev));
  }

  return (
    <div className="space-y-10">
      <DropZone onUploaded={handleUploaded} />

      <section>
        <h2 className="text-lg font-bold">アップロード済み</h2>
        <div className="mt-3">
          {isLoading && <p className="text-sm text-gray-400">読み込み中…</p>}
          {loadError && <p className="text-sm text-red-400">{loadError}</p>}
          {!isLoading && !loadError && images.length === 0 && (
            <p className="text-sm text-gray-400">まだ画像がありません</p>
          )}
          {images.length > 0 && <ImageGallery images={images} />}
        </div>
      </section>
    </div>
  );
}
