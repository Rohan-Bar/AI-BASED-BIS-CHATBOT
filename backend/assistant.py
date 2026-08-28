from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
import models
from schemas import ChatRequest, ChatResponse, Source

router = APIRouter(prefix="/assistant", tags=["AI Assistant"])

DUMMY_SOURCES = [
    Source(standard="IS 17874", clause="4.2", page=12, url="https://bis.gov.in"),
]


@router.post("/chat", response_model=ChatResponse)
def chat(body: ChatRequest, db: Session = Depends(get_db)):
    # save user's message
    user_msg = models.ChatMessage(user_id=body.user_id, role="user", content=body.message)
    db.add(user_msg)

    # PLACEHOLDER — teammate's RAG function goes here:
    answer = f"This is a placeholder answer for: '{body.message}'. RAG logic comes here."

    bot_msg = models.ChatMessage(user_id=body.user_id, role="assistant", content=answer)
    db.add(bot_msg)
    db.commit()

    return ChatResponse(answer=answer, sources=DUMMY_SOURCES)
