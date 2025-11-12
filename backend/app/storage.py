from typing import List, Dict
from sqlmodel import SQLModel, Field, Session as SQLSession, create_engine, select
import os, uuid

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./ai_support.db")
engine = create_engine(DATABASE_URL, echo=False)

class Message(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    session_id: str
    role: str
    content: str

SQLModel.metadata.create_all(engine)

class Session:
    def __init__(self, id: str):
        self.id = id
    def history(self) -> List[Dict[str, str]]:
        with SQLSession(engine) as s:
            rows = s.exec(select(Message).where(Message.session_id==self.id).order_by(Message.id)).all()
            return [{"role": r.role, "content": r.content} for r in rows]

def get_session(session_id: str | None):
    return Session(session_id or str(uuid.uuid4()))

def append_message(session_id: str, role: str, content: str):
    with SQLSession(engine) as s:
        s.add(Message(session_id=session_id, role=role, content=content))
        s.commit()
