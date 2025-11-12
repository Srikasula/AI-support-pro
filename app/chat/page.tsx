"use client";
import { useState } from "react";
type Msg = { role: "user" | "assistant"; text: string };

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [log, setLog] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);

  async function send() {
    const q = input.trim();
    if (!q) return;
    setInput("");
    setLog((l) => [...l, { role: "user", text: q }, { role: "assistant", text: "" }]);
    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "text/event-stream" },
      body: JSON.stringify({ query: q, history: [] }),
    });
    if (!res.body) { setLoading(false); return; }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let running = true;

    while (running) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      for (const line of chunk.split("\n")) {
        if (line.startsWith("event: end")) { running = false; break; }
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data?.type === "token" && data.text) {
              setLog((l) => {
                const copy = [...l];
                const i = copy.findLastIndex((m) => m.role === "assistant");
                if (i >= 0) copy[i] = { ...copy[i], text: copy[i].text + data.text };
                return copy;
              });
            }
          } catch {}
        }
      }
    }
    setLoading(false);
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">AI Support Pro (Your Data)</h1>
      <div className="border rounded-2xl p-4 min-h-[300px] space-y-3">
        {log.length === 0 && <div className="text-gray-500">Ask anything about your uploaded docs…</div>}
        {log.map((m, idx) => (
          <div key={idx} className={m.role === "user" ? "text-right" : "text-left"}>
            <div className={`inline-block px-3 py-2 rounded-2xl ${m.role === "user" ? "bg-gray-900 text-white" : "bg-gray-100"}`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input className="flex-1 border rounded-xl px-3 py-2" placeholder="Type your question…" value={input}
          onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} />
        <button onClick={send} disabled={loading} className="border rounded-xl px-4 py-2">
          {loading ? "Thinking…" : "Send"}
        </button>
      </div>
      <p className="text-xs text-gray-500">Answers come from your local knowledge base (Chroma).</p>
    </div>
  );
}
