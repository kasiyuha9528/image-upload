import ImageUploader from "@/components/ImageUploader";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">画像アップロード</h1>
      <p className="mt-2 text-sm text-gray-500">
        jpg / png / webp、5MB 未満。複数枚まとめてアップロードできます。
      </p>
      <div className="mt-6">
        <ImageUploader />
      </div>
    </main>
  );
}
