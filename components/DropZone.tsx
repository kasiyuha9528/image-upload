"use client";

import { useRef, useState } from "react";
import { CloudUpload, FolderPlus } from "lucide-react";
import { validateImage } from "@/lib/validateImage";
import { uploadImage } from "@/lib/uploadImage";

type Rejected = { name: string; reason: string };
type Uploaded = { name: string; url: string };
type CopyState = { url: string; ok: boolean } | null;

export default function DropZone() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploaded, setUploaded] = useState<Uploaded[]>([]);
  const [rejected, setRejected] = useState<Rejected[]>([]);
  const [hasChecked, setHasChecked] = useState(false);
  const [copyState, setCopyState] = useState<CopyState>(null);

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
    setCopyState(null);

    const done: Uploaded[] = [];
    for (const file of okFiles) {
      const result = await uploadImage(file);
      if (result.ok) {
        done.push({ name: file.name, url: result.url });
      } else {
        ngFiles.push({ name: file.name, reason: result.reason });
      }
    }

    setUploaded(done);
    setRejected(ngFiles);
    setHasChecked(true);
    setIsUploading(false);
  }

  async function copyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopyState({ url, ok: true });
    } catch (error) {
      console.error("copy error:", error);
      setCopyState({ url, ok: false });
    }
  }

  return (
    <div>
      {/* アイコンの線に使うグラデーションの定義（画面には表示されない） */}
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <linearGradient id="icon-gradient" x1="0" y1="0" x2="1" y2="1">
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

      {hasChecked && !isUploading && (
        <div className="mt-4 space-y-3 text-sm">
          {uploaded.length > 0 && (
            <ul className="space-y-2">
              {uploaded.map((u) => (
                <li
                  key={u.url}
                  className="rounded-lg border border-gray-700 p-3"
                >
                  <p className="text-gray-200">{u.name}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <a
                      href={u.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-w-0 flex-1 truncate text-cyan-300 underline"
                    >
                      {u.url}
                    </a>
                    <button
                      type="button"
                      onClick={() => copyUrl(u.url)}
                      className="shrink-0 rounded border border-gray-600 px-2 py-1 text-xs hover:bg-neutral-800"
                    >
                      {copyState?.url === u.url
                        ? copyState.ok
                          ? "コピーしました"
                          : "コピー失敗"
                        : "URLをコピー"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {rejected.length > 0 && (
            <ul className="space-y-1 text-red-400">
              {rejected.map((r, i) => (
                <li key={`${r.name}-${i}`}>
                  {r.name}：{r.reason}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
