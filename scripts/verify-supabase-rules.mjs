// Supabase 側の二重チェック（バケットの制限とポリシー）を確かめるスクリプト
// 実行：node --env-file=.env.local scripts/verify-supabase-rules.mjs
// ※ 実行するたびに、images バケットにテスト用ファイルが2つ残ります。管理画面から手動で削除してください。
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error("環境変数がありません。--env-file=.env.local を付けて実行してください。");
  process.exit(1);
}

const bucket = createClient(url, key).storage.from("images");
const id = crypto.randomUUID();
const MB = 1024 * 1024;
let failed = 0;

function report(label, expectRejected, rejected, detail) {
  const pass = expectRejected === rejected;
  if (!pass) failed += 1;
  console.log(`[${pass ? "OK" : "NG"}] ${label}`);
  console.log(`      結果：${rejected ? `拒否された（${detail}）` : "受け付けられた"}`);
}

async function checkUpload(label, expectRejected, name, size, contentType) {
  const { error } = await bucket.upload(`verify-${id}-${name}`, new Uint8Array(size), { contentType });
  report(label, expectRejected, Boolean(error), error?.message);
}

// 1. 比較用：条件に合うファイルは、受け付けられる
await checkUpload("比較用：1KB の png", false, "ok-small.png", 1024, "image/png");
// 2. 境界：5MB より1バイト小さい jpg は、受け付けられる
await checkUpload("境界：5,242,879 バイトの jpg", false, "ok-5242879.jpg", 5 * MB - 1, "image/jpeg");
// 3. 5MB ちょうどの jpg は、拒否される
await checkUpload("サイズ超過：5,242,880 バイトの jpg", true, "ng-5242880.jpg", 5 * MB, "image/jpeg");
// 4. 形式違いは、拒否される
await checkUpload("形式違い：gif", true, "ng-image.gif", 1024, "image/gif");
await checkUpload("形式違い：pdf", true, "ng-document.pdf", 1024, "application/pdf");

// 5. 上書き（UPDATE）は、拒否される
const smallPath = `verify-${id}-ok-small.png`;
const upd = await bucket.update(smallPath, new Uint8Array(10), { contentType: "image/png" });
report("上書き（UPDATE）", true, Boolean(upd.error), upd.error?.message);

// 6. 削除（DELETE）は、できない（ファイルが残っていればOK）
await bucket.remove([smallPath]);
const publicUrl = bucket.getPublicUrl(smallPath).data.publicUrl;
const stillThere = (await fetch(publicUrl, { method: "HEAD" })).ok;
report("削除（DELETE）", true, stillThere, "削除後も、ファイルが残っている");

console.log(failed === 0 ? "\nすべて期待どおりでした" : `\n期待と違う結果が ${failed} 件ありました`);
process.exitCode = failed === 0 ? 0 : 1;
