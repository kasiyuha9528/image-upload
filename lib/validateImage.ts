export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB = 5,242,880 バイト
export const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];
export const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type ValidationResult = { ok: true } | { ok: false; reason: string };

function getExtension(fileName: string): string {
  const dotIndex = fileName.lastIndexOf(".");
  if (dotIndex <= 0) return "";
  return fileName.slice(dotIndex + 1).toLowerCase();
}

function formatMB(bytes: number): string {
  return (bytes / 1024 / 1024).toFixed(2);
}

export function validateImage(file: File): ValidationResult {
  const extension = getExtension(file.name);

  if (
    !ALLOWED_EXTENSIONS.includes(extension) ||
    !ALLOWED_MIME_TYPES.includes(file.type)
  ) {
    return {
      ok: false,
      reason: "対応していない形式です（jpg / png / webp のみ）",
    };
  }

  if (file.size === 0) {
    return { ok: false, reason: "空のファイルです" };
  }

  if (file.size >= MAX_FILE_SIZE) {
    return {
      ok: false,
      reason: `5MB 以上のため受け付けられません（${formatMB(file.size)} MB）`,
    };
  }

  return { ok: true };
}
