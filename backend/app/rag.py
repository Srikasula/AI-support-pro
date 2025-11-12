import os, glob, uuid
from typing import List, Dict, Any, Iterable
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain.docstore.document import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
import chromadb
from chromadb.config import Settings

# PDF
from pypdf import PdfReader

CHROMA_DIR = os.getenv("CHROMA_DB_DIR", ".chroma")

class VectorStore:
    def __init__(self, persist_dir: str):
        self.client = chromadb.PersistentClient(path=persist_dir, settings=Settings(allow_reset=True))
        self.collection = self.client.get_or_create_collection("knowledgebase")

    def _embedder(self):
        return HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

    def add_docs(self, docs: List[Document]) -> int:
        if not docs: return 0
        emb = self._embedder()
        texts = [d.page_content for d in docs]
        metas = [d.metadata for d in docs]
        ids = [str(uuid.uuid4()) for _ in docs]
        vecs = emb.embed_documents(texts)
        self.collection.add(embeddings=vecs, documents=texts, metadatas=metas, ids=ids)
        return len(docs)

    def _read_pdf(self, path: str) -> str:
        try:
            reader = PdfReader(path)
            pieces = []
            for page in reader.pages:
                txt = page.extract_text() or ""
                pieces.append(txt)
            return "\n".join(pieces)
        except Exception as e:
            return ""  # silently skip unreadable PDFs

    def add_path(self, path: str) -> int:
        files = []
        if os.path.isdir(path):
            files = glob.glob(os.path.join(path, "**", "*.*"), recursive=True)
        elif os.path.isfile(path):
            files = [path]

        splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)
        docs: List[Document] = []

        for f in files:
            fl = f.lower()
            if fl.endswith((".md", ".txt")):
                try:
                    with open(f, "r", encoding="utf-8", errors="ignore") as fh:
                        text = fh.read()
                except Exception:
                    text = ""
            elif fl.endswith(".pdf"):
                text = self._read_pdf(f)
            else:
                continue  # unsupported type

            if not text.strip():
                continue

            chunks = splitter.split_text(text)
            docs.extend([Document(page_content=c, metadata={"source": f}) for c in chunks])

        return self.add_docs(docs)

    def similar(self, query: str, k: int = 5) -> List[Dict[str, Any]]:
        emb = self._embedder()
        qvec = emb.embed_query(query)
        res = self.collection.query(query_embeddings=[qvec], n_results=k, include=["documents","metadatas","distances"])
        out=[]
        for i in range(len(res["ids"][0])):
            out.append({"text":res["documents"][0][i], "meta":res["metadatas"][0][i], "distance":res["distances"][0][i]})
        return out

def get_or_create_vectorstore() -> VectorStore:
    os.makedirs(CHROMA_DIR, exist_ok=True)
    return VectorStore(CHROMA_DIR)

def rag_answer_with_citations(query: str, history, vectorstore: VectorStore) -> Iterable[Dict[str, Any]]:
    # Fully local/extractive answer (no LLM)
    hits = vectorstore.similar(query, k=5)
    for h in hits:
        yield {"type":"source", "payload":{"source":h["meta"].get("source","knowledgebase"), "snippet":h["text"][:240]}}

    if not hits:
        yield {"type":"token", "text": "I couldn't find anything relevant in the knowledge base."}
        return

    top = hits[:2]
    yield {"type":"token", "text": "Answer (from your documents): "}
    import os as _os
    combined = "\n\n".join(
        [f"• {t['text'].strip()}\n(source: {_os.path.basename(t['meta'].get('source','kb'))})" for t in top]
    )
    for i in range(0, len(combined), 180):
        yield {"type":"token", "text": combined[i:i+180]}
