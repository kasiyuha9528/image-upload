import { supabase } from "@/lib/supabase";
import { IMAGE_BUCKET } from "@/lib/uploadImage";
import { ALLOWED_EXTENSIONS, getExtension } from "@/lib/validateImage";

// ★ 一覧に表示する最大枚数。変えたいときは、この数字だけを直す
export const GALLERY_LIMIT = 24;

export type GalleryImage = { name: string; url: string };

export type ListResult =
  | { ok: true; images: GalleryImage[] }
  | { ok: false; reason: string };

export async function listImages(): Promise<ListResult> {
  const { data, error } = await supabase.storage.from(IMAGE_BUCKET).list("", {
    limit: GALLERY_LIMIT,
    sortBy: { column: "created_at", order: "desc" },
  });

  if (error) {
    console.error("list error:", error);
    return {
      ok: false,
      reason: `一覧の取得に失敗しました（${error.message}）`,
    };
  }

  const images = data
    // フォルダ（id が null）と、対応していない拡張子のファイルは除く
    .filter(
      (item) =>
        item.id !== null &&
        ALLOWED_EXTENSIONS.includes(getExtension(item.name))
    )
    .map((item) => ({
      name: item.name,
      url: supabase.storage.from(IMAGE_BUCKET).getPublicUrl(item.name).data
        .publicUrl,
    }));

  return { ok: true, images };
}
