"use client";

import { useRef, useState } from "react";
import { CloudUpload, FolderPlus } from "lucide-react";

export default function DropZone() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [receivedCount, setReceivedCount] = useState<number | null>(null);

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setReceivedCount(files.length);
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
                onClick={() => inputRef.current?.click()}
                className="mt-5 rounded-lg bg-linear-to-r from-cyan-400 to-purple-500 p-px"
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

      {receivedCount !== null && (
        <p className="mt-4 text-sm text-gray-300">
          {receivedCount} 枚のファイルを受け取りました（まだ保存はしません）
        </p>
      )}
    </div>
  );
}
