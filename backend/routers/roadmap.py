from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
import models
from schemas import RoadmapRequest, RoadmapResponse, RoadmapHistoryResponse
from dependencies import get_current_user, require_current_user


router = APIRouter(prefix="/roadmap", tags=["Certification Roadmap"])

CHECKPOINT_NAMES = [
    "Identify Product",
    "Find Standard",
    "Check Compliance",
    "Prepare",
    "Get Certified",
]


def _make_checkpoints(current_step: int) -> list[dict]:
    return [
        {
            "name": name,
            "step": i + 1,
            "status": "done" if (i + 1) < current_step
                      else "current" if (i + 1) == current_step
                      else "pending",
            "references": [],          # filled later from teammate's logic
        }
        for i, name in enumerate(CHECKPOINT_NAMES)
    ]


# Generate a new roadmap (placeholder, no login needed for demo)
@router.post("", response_model=RoadmapResponse)
def build_roadmap(body: RoadmapRequest):
    return RoadmapResponse(
        product_name=body.product_name,
        current_step=1,
        checkpoints=_make_checkpoints(1),
    )


# Save progress — MANDATORY login (this is what "remembers when you log in again")
@router.post("/save", response_model=RoadmapResponse)
def save_roadmap(
    body: RoadmapRequest,
    user: models.User = Depends(require_current_user),
    db: Session = Depends(get_db),
):
    entry = models.RoadmapProgress(
        user_id=user.id,
        product_name=body.product_name,
        product_category=body.product_category,
        intended_use=body.intended_use,
        specifications=body.specifications,
        current_step=1,   # will come from body/frontend once steps update
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)

    return RoadmapResponse(
        product_name=entry.product_name,
        current_step=entry.current_step,
        checkpoints=_make_checkpoints(entry.current_step),
    )


# Load saved roadmaps for logged-in user — MANDATORY login
@router.get("/history", response_model=RoadmapHistoryResponse)
def roadmap_history(
    user: models.User = Depends(require_current_user),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(models.RoadmapProgress)
        .filter(models.RoadmapProgress.user_id == user.id)
        .order_by(models.RoadmapProgress.updated_at.desc())
        .all()
    )
    return RoadmapHistoryResponse(
        items=[
            RoadmapResponse(
                product_name=r.product_name,
                current_step=r.current_step,
                checkpoints=_make_checkpoints(r.current_step),
            )
            for r in rows
        ]
    )
