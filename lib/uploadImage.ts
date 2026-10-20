import { supabase } from "@/lib/supabase";
import { getExtension } from "@/lib/validateImage";

export const IMAGE_BUCKET = "images";

export type UploadResult =
  | { ok: true; path: string; url: string }
  | { ok: false; reason: string };

export async function uploadImage(file: File): Promise<UploadResult> {
  // ファイル名はランダム ID + 拡張子（日本語名や同名ファイルの衝突を防ぐ）
  const path = `${crypto.randomUUID()}.${getExtension(file.name)}`;

  const { error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(path, file, { contentType: file.type });

  if (error) {
    console.error("upload error:", error);
    return {
      ok: false,
      reason: `アップロードに失敗しました（${error.message}）`,
    };
  }

  const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);
  return { ok: true, path, url: data.publicUrl };
}
