from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
from typing import List, Dict, Any
import json, uuid
from pathlib import Path

from app.rag import get_or_create_vectorstore, rag_answer_with_citations

app = FastAPI(title="AI Support Pro")
# ✅ Updated CORS settings (allow only localhost)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

vs = get_or_create_vectorstore()

class ChatRequest(BaseModel):
    query: str
    history: List[Dict[str, str]] = []

def sse(event: str = None, data: Any = None) -> bytes:
    parts = []
    if event:
        parts.append(f"event: {event}")
    if data is not None:
        if not isinstance(data, (str, bytes)):
            data = json.dumps(data, ensure_ascii=False)
        parts.append(f"data: {data}")
    return ("\n".join(parts) + "\n\n").encode("utf-8")

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/chat")  # streaming (SSE)
async def chat(req: ChatRequest):
    session_id = str(uuid.uuid4())
    def stream():
        yield sse("begin", {"session_id": session_id})
        for chunk in rag_answer_with_citations(req.query, req.history or [], vs):
            yield sse("message", chunk)
        yield sse("end", {"session_id": session_id})
    return StreamingResponse(stream(), media_type="text/event-stream")

@app.post("/chat_text")  # non-streaming (easy to test)
async def chat_text(req: ChatRequest):
    session_id = str(uuid.uuid4())
    answer_text = []
    sources = []
    for chunk in rag_answer_with_citations(req.query, req.history or [], vs):
        if isinstance(chunk, dict) and chunk.get("type") == "source":
            sources.append(chunk.get("payload", {}))
        elif isinstance(chunk, dict) and chunk.get("type") == "token":
            answer_text.append(chunk.get("text", ""))
        elif isinstance(chunk, str):
            answer_text.append(chunk)
    text = "".join(answer_text).strip() or "I couldn't find anything relevant in the knowledge base."
    return JSONResponse({"session_id": session_id, "text": text, "sources": sources})

@app.post("/upload")  # upload & ingest
async def upload(files: List[UploadFile] = File(...)):
    allowed = {".txt", ".md", ".pdf"}  # extend later for pdf/docx
    base = Path(__file__).resolve().parent.parent / "knowledge_base" / "uploads"
    base.mkdir(parents=True, exist_ok=True)

    saved, total_chunks = [], 0
    for f in files:
        ext = Path(f.filename).suffix.lower()
        if ext not in allowed:
            raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}. Allowed: {sorted(allowed)}")

        safe = Path(f.filename).name
        dest = base / safe
        i = 1
        while dest.exists():
            dest = base / (Path(safe).stem + f"_{i}" + Path(safe).suffix)
            i += 1

        data = await f.read()
        dest.write_bytes(data)

        added = vs.add_path(str(dest))
        total_chunks += added
        saved.append(dest.name)

    return {"saved": saved, "chunks_added": total_chunks}
