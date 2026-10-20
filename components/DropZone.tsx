"use client";

import { useRef, useState } from "react";

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
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
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
        className={`cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
          isDragging
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
            : "border-gray-300 hover:border-gray-400 dark:border-gray-600"
        }`}
      >
        <p className="pointer-events-none text-base font-medium">
          ここに画像をドラッグ＆ドロップ
        </p>
        <p className="pointer-events-none mt-1 text-sm text-gray-500">
          またはクリックしてファイルを選択
        </p>
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
        <p className="mt-3 text-sm">
          {receivedCount} 枚のファイルを受け取りました（まだ保存はしません）
        </p>
      )}
    </div>
  );
}
