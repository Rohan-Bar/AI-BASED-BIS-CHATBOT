from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
import models
from schemas import (
    RoadmapRequest,
    RoadmapResponse,
    RoadmapHistoryResponse,
)
from dependencies import require_current_user

# ============================================================
# RAG IMPORT
# ============================================================

from ragbased.groqllm import RAGSearch

import traceback


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/roadmap",
    tags=["Certification Roadmap"]
)


# ============================================================
# ROADMAP CHECKPOINTS
# ============================================================

CHECKPOINT_NAMES = [
    "Identify Product",
    "Find Standard",
    "Check Compliance",
    "Prepare",
    "Get Certified",
]


# ============================================================
# LAZY RAG INITIALIZATION
# ============================================================

rag_search = None


def get_rag() -> RAGSearch:

    global rag_search

    if rag_search is None:
        rag_search = RAGSearch()

    return rag_search


# ============================================================
# CREATE CHECKPOINTS
# ============================================================

def _make_checkpoints(
    current_step: int,
    references: list | None = None
) -> list[dict]:

    references = references or []

    return [

        {
            "name": name,

            "step": i + 1,

            "status":
                "done"
                if (i + 1) < current_step
                else
                "current"
                if (i + 1) == current_step
                else
                "pending",

            "references": references,
        }

        for i, name in enumerate(CHECKPOINT_NAMES)
    ]


# ============================================================
# BUILD RAG REFERENCES
# ============================================================

def _get_rag_references(
    product_name: str,
    product_category: str | None = None,
    intended_use: str | None = None,
    specifications: str | None = None,
) -> list:

    """
    Search BIS documents using the RAG system and return
    relevant source references for the certification roadmap.
    """

    query_parts = [

        f"Product: {product_name}",

        f"Product category: {product_category}"
        if product_category
        else "",

        f"Intended use: {intended_use}"
        if intended_use
        else "",

        f"Specifications: {specifications}"
        if specifications
        else "",
    ]

    query = " | ".join(
        filter(
            None,
            query_parts
        )
    )

    try:

        rag_result = get_rag().search(
            query=query,
            top_k=5
        )

        rag_sources = rag_result.get(
            "sources",
            []
        )

        references = []

        for source in rag_sources:

            references.append(
                {
                    "source": source.get(
                        "source",
                        "Unknown"
                    ),

                    "page": source.get(
                        "page",
                        "Unknown"
                    )
                }
            )

        return references

    except Exception:

        traceback.print_exc()

        return []


# ============================================================
# GENERATE NEW ROADMAP
# ============================================================

@router.post(
    "",
    response_model=RoadmapResponse
)
def build_roadmap(
    body: RoadmapRequest
):

    # --------------------------------------------------------
    # Get BIS references using RAG
    # --------------------------------------------------------

    references = _get_rag_references(

        product_name=body.product_name,

        product_category=body.product_category,

        intended_use=body.intended_use,

        specifications=body.specifications,
    )

    # --------------------------------------------------------
    # Clamp current step to valid range (1..5)
    # --------------------------------------------------------

    current_step = max(
        1,
        min(
            body.current_step or 1,
            len(CHECKPOINT_NAMES)
        )
    )

    # --------------------------------------------------------
    # Return roadmap
    # --------------------------------------------------------

    return RoadmapResponse(

        product_name=body.product_name,

        current_step=current_step,

        checkpoints=_make_checkpoints(
            current_step=current_step,
            references=references
        ),
    )


# ============================================================
# SAVE ROADMAP PROGRESS
# ============================================================

@router.post(
    "/save",
    response_model=RoadmapResponse
)
def save_roadmap(

    body: RoadmapRequest,

    user: models.User = Depends(
        require_current_user
    ),

    db: Session = Depends(get_db),
):

    # --------------------------------------------------------
    # Get BIS references (computed ONCE, then persisted)
    # --------------------------------------------------------

    references = _get_rag_references(

        product_name=body.product_name,

        product_category=body.product_category,

        intended_use=body.intended_use,

        specifications=body.specifications,
    )

    # --------------------------------------------------------
    # Clamp current step to valid range (protects against
    # a spoofed current_step=99 corrupting the timeline)
    # --------------------------------------------------------

    current_step = max(
        1,
        min(
            body.current_step or 1,
            len(CHECKPOINT_NAMES)
        )
    )

    # --------------------------------------------------------
    # Save roadmap (references persisted for /history)
    # --------------------------------------------------------

    entry = models.RoadmapProgress(

        user_id=user.id,

        product_name=body.product_name,

        product_category=body.product_category,

        intended_use=body.intended_use,

        specifications=body.specifications,

        current_step=current_step,

        references=references,
    )

    db.add(entry)

    db.commit()

    db.refresh(entry)

    # --------------------------------------------------------
    # Return saved roadmap
    # --------------------------------------------------------

    return RoadmapResponse(

        product_name=entry.product_name,

        current_step=entry.current_step,

        checkpoints=_make_checkpoints(

            current_step=entry.current_step,

            references=references
        ),
    )


# ============================================================
# LOAD ROADMAP HISTORY
# ============================================================

@router.get(
    "/history",
    response_model=RoadmapHistoryResponse
)
def roadmap_history(

    user: models.User = Depends(
        require_current_user
    ),

    db: Session = Depends(get_db),
):

    rows = (

        db.query(
            models.RoadmapProgress
        )

        .filter(
            models.RoadmapProgress.user_id
            == user.id
        )

        .order_by(
            models.RoadmapProgress.updated_at.desc()
        )

        .all()
    )

    items = []

    # --------------------------------------------------------
    # Rebuild each saved roadmap
    #
    # References were persisted at save time, so NO RAG
    # call is needed here — history loads instantly.
    # --------------------------------------------------------

    for r in rows:

        items.append(

            RoadmapResponse(

                product_name=r.product_name,

                current_step=r.current_step,

                checkpoints=_make_checkpoints(

                    current_step=r.current_step,

                    references=r.references or []
                ),
            )
        )

    return RoadmapHistoryResponse(
        items=items
    )