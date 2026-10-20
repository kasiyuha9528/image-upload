"use client";

import { useRef, useState } from "react";
import { CloudUpload, FolderPlus } from "lucide-react";
import { validateImage } from "@/lib/validateImage";
import { uploadImage } from "@/lib/uploadImage";
import type { GalleryImage } from "@/lib/listImages";

type Rejected = { name: string; reason: string };
type Props = { onUploaded: (images: GalleryImage[]) => void };

export default function DropZone({ onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [rejected, setRejected] = useState<Rejected[]>([]);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0 || isUploading) return;

    // await より前に配列へ変換する（input を空に戻しても影響されないように）
    const fileArray = Array.from(files);

    const okFiles: File[] = [];
    const ngFiles: Rejected[] = [];

    for (const file of fileArray) {
      const result = validateImage(file);
      if (result.ok) {
        okFiles.push(file);
      } else {
        ngFiles.push({ name: file.name, reason: result.reason });
      }
    }

    setIsUploading(true);

    const done: GalleryImage[] = [];
    for (const file of okFiles) {
      const result = await uploadImage(file);
      if (result.ok) {
        done.push({ name: result.path, url: result.url });
      } else {
        ngFiles.push({ name: file.name, reason: result.reason });
      }
    }

    onUploaded(done);
    setRejected(ngFiles);
    setIsUploading(false);
  }

  return (
    <div>
      {/* アイコンの線に使うグラデーションの定義（画面には表示されない） */}
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <linearGradient
            id="icon-gradient"
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="0"
            x2="24"
            y2="24"
          >
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      </svg>

      <div className="relative">
        {/* 枠のまわりのにじむ光 */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute -inset-2 rounded-3xl bg-linear-to-br from-cyan-400 to-purple-500 blur-xl transition-opacity ${
            isDragging ? "opacity-60" : "opacity-25"
          }`}
        />

        {/* グラデーションの外枠（内側との差の1pxが枠線に見える） */}
        <div className="relative rounded-2xl bg-linear-to-br from-cyan-400 via-blue-400 to-purple-500 p-px">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleFiles(e.dataTransfer.files);
            }}
            className={`rounded-2xl p-6 transition-colors ${
              isDragging ? "bg-neutral-800" : "bg-neutral-900"
            }`}
          >
            {/* 内側の点線 */}
            <div className="flex flex-col items-center rounded-xl border border-dashed border-gray-500 px-6 py-16 text-center">
              <FolderPlus
                size={72}
                strokeWidth={1.25}
                stroke="url(#icon-gradient)"
              />
              <CloudUpload
                size={72}
                strokeWidth={1.25}
                stroke="url(#icon-gradient)"
                className="mt-3"
              />

              <p className="mt-6 text-xl font-bold text-white">
                ここに画像をドラッグ＆ドロップ
              </p>

              <button
                type="button"
                disabled={isUploading}
                onClick={() => inputRef.current?.click()}
                className="mt-5 rounded-lg bg-linear-to-r from-cyan-400 to-purple-500 p-px disabled:opacity-50"
              >
                <span className="block rounded-[7px] bg-neutral-900 px-5 py-2 text-sm transition-colors hover:bg-neutral-800">
                  <span className="bg-linear-to-r from-cyan-300 to-purple-400 bg-clip-text text-transparent">
                    またはファイルを選択
                  </span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {isUploading && (
        <p className="mt-4 text-sm text-gray-300">アップロード中…</p>
      )}

      {!isUploading && rejected.length > 0 && (
        <ul className="mt-4 space-y-1 text-sm text-red-400">
          {rejected.map((r, i) => (
            <li key={`${r.name}-${i}`}>
              {r.name}：{r.reason}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
