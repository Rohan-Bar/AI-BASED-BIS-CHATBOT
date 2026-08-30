from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
import models
from schemas import ChatRequest, ChatResponse, Source

# ============================================================
# RAG IMPORT (lazy — see get_rag below)
# ============================================================

from ragbased.groqllm import RAGSearch

import traceback


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/assistant",
    tags=["AI Assistant"]
)


# ============================================================
# LAZY RAG INITIALIZATION
# (server boots even if ChromaDB/model is missing —
#  only the chat endpoint fails, not the whole app)
# ============================================================

rag_search = None


def get_rag() -> RAGSearch:
    global rag_search
    if rag_search is None:
        rag_search = RAGSearch()
    return rag_search


# ============================================================
# CHAT ENDPOINT
# ============================================================

@router.post(
    "/chat",
    response_model=ChatResponse
)
def chat(
    body: ChatRequest,
    db: Session = Depends(get_db)
):

    # ========================================================
    # SAVE USER MESSAGE
    # ========================================================

    user_msg = models.ChatMessage(
        user_id=body.user_id,
        role="user",
        content=body.message
    )

    db.add(user_msg)

    # ========================================================
    # RAG SEARCH
    # ========================================================

    try:

        rag_result = get_rag().search(
            query=body.message,
            top_k=5
        )

        answer = rag_result["answer"]
        rag_sources = rag_result.get("sources", [])

    except Exception:

        traceback.print_exc()

        answer = (
            "Sorry, I was unable to process your "
            "question at the moment."
        )
        rag_sources = []

    # ========================================================
    # SAVE ASSISTANT MESSAGE
    # ========================================================

    bot_msg = models.ChatMessage(
        user_id=body.user_id,
        role="assistant",
        content=answer
    )

    db.add(bot_msg)
    db.commit()

    # ========================================================
    # CONVERT RAG SOURCES TO API SOURCES
    # ========================================================

    sources = []

    for source in rag_sources:

        sources.append(
            Source(
                standard=source.get("source", "Unknown"),
                clause=str(source.get("clause", "")),
                page=int(source.get("page", 0) or 0),
                url="https://bis.gov.in"
            )
        )

    # ========================================================
    # RETURN RESPONSE
    # ========================================================

    return ChatResponse(
        answer=answer,
        sources=sources
    )