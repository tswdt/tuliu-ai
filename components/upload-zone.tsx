"use client";

import { useState } from "react";

export function UploadZone() {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      // 1. 从后端获取预签名 URL (避免前端暴露 SecretKey)
      const res = await fetch("/api/cos/presign", {
        method: "POST",
        body: JSON.stringify({ filename: file.name })
      });
      const { url, key } = await res.json();

      // 2. 直接上传到 COS
      await fetch(url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type }
      });

      console.log("Upload Success:", key);
    } catch (err) {
      console.error("Upload Failed:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-12 border-2 border-dashed border-zinc-800 rounded-xl text-center">
      <input 
        type="file" 
        onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
        disabled={uploading}
      />
      <p className="mt-2 text-zinc-500">{uploading ? "上传中..." : "点击上传产品原图"}</p>
    </div>
  );
}
