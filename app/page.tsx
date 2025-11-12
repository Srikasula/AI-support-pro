"use client";
import { useEffect, useRef, useState } from "react";

type Role = "user" | "assistant";
type Source = { source: string; snippet?: string };
type Msg = { role: Role; content: string; sources?: Source[] };

/** Clean up noisy model output */
function cleanAnswer(text: string): string {
  // remove boilerplate like "Answer (from your documents):"
  let t = text.replace(/^Answer\s*\(from your documents\):\s*/i, "");
  // strip inline "(source: ...)" tags the backend already reports separately
  t = t.replace(/\(source:[^)]+\)/gi, "");
  // collapse whitespace/newlines
  t = t.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  return t;
}

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
  const listRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  async function handleSend() {
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: "user" as const, content: userMsg }]);
    setInput("");

    try {
      const res = await fetch(`${base}/chat_text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMsg, history: [] }),
      });

      const raw = await res.text();
      if (!res.ok) {
        setMessages(prev => [
          ...prev,
          { role: "assistant" as const, content: `Error ${res.status}: ${raw}` },
        ]);
        return;
      }

      let data: any;
      try { data = JSON.parse(raw); } catch { data = { text: raw }; }

      // De-duplicate sources by path
      const uniqueSources: Source[] = Array.isArray(data?.sources)
        ? Array.from(
            new Map<string, Source>(
              (data.sources as Source[]).map(s => [s.source, s])
            ).values()
          )
        : [];

      const cleaned = cleanAnswer(data?.text ?? "");
      setMessages(prev => [
        ...prev,
        {
          role: "assistant" as const,
          content: cleaned || "(no reply)",
          sources: uniqueSources,
        },
      ]);
    } catch (e: any) {
      setMessages(prev => [
        ...prev,
        { role: "assistant" as const, content: `Network error: ${e?.message || String(e)}` },
      ]);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <h1 className="text-xl font-semibold">AI Support Assistant</h1>
          <p className="text-xs text-gray-500">Backend: {base}</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4">
        <div
          ref={listRef}
          className="mt-4 mb-4 h-[65vh] overflow-y-auto rounded-xl border bg-white p-3"
        >
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-24">
              Ask about your uploaded PDFs/resume. Example:{" "}
              <em>“Summarize his experience at Verizon in 3 bullets.”</em>
            </div>
          )}

          {messages.map((m: Msg, i: number) => {
            const isUser = m.role === "user";
            return (
              <div key={i} className={`my-3 flex ${isUser ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl shadow-sm p-3 ${isUser ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"}`}>
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</div>

                  {!isUser && m.sources?.length ? (
                    <div className="mt-2 border-l-2 pl-3 border-gray-300">
                      <div className="text-xs font-semibold mb-1 opacity-80">Sources</div>
                      <ul className="text-xs space-y-1">
                        {m.sources.map((s, idx) => (
                          <li key={idx} className="break-all">
                            <code className="px-1 py-0.5 rounded bg-black/10">
                              {s.source.split("/").slice(-1)[0]}
                            </code>
                            {s.snippet ? <> — <span className="opacity-80">{s.snippet}</span></> : null}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        <div className="sticky bottom-3 bg-gray-50">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask something… (press Enter to send)"
              className="flex-1 border rounded-xl p-3 bg-white"
            />
            <button
              onClick={handleSend}
              className="px-5 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
            >
              Send
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
