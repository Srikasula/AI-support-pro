"use client";
import { useState } from "react";

export default function UploadPage() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [status, setStatus] = useState("");
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

  async function handleUpload() {
    if (!files || files.length === 0) {
      setStatus("Please select at least one PDF or text file.");
      return;
    }
    const form = new FormData();
    Array.from(files).forEach(f => form.append("files", f));

    try {
      const res = await fetch(`${base}/upload`, { method: "POST", body: form });
      const data = await res.json();
      if (res.ok) setStatus(`✅ Uploaded: ${data.saved?.join(", ")} (chunks: ${data.chunks_added})`);
      else setStatus(`❌ ${data.detail || data.error || "Upload failed"}`);
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    }
  }

  return (
    <div className="max-w-xl mx-auto p-8 space-y-4">
      <h1 className="text-2xl font-bold">📄 Upload Documents</h1>
      <input
        type="file"
        accept=".pdf,.txt,.md"
        multiple
        onChange={e => setFiles(e.target.files)}
        className="block w-full border rounded p-2"
      />
      <button onClick={handleUpload} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Upload & Index
      </button>
      {status && <p className="text-gray-700">{status}</p>}
    </div>
  );
}

