from fastapi import APIRouter

from schemas import (
    StandardFinderAskRequest,
    StandardFinderRequest,
    StandardFinderResponse,
)

router = APIRouter(prefix="/standard-finder", tags=["Standard Finder"])


def _build_response(query: str) -> StandardFinderResponse:
    """PLACEHOLDER — teammate's RAG lookup goes here.
    Later: search ChromaDB -> get IS number + metadata."""
    return StandardFinderResponse(
        is_number="IS 17874",
        title="Placeholder: title for query containing " + repr(query),
        metadata={
            "pdf_name": "Standard_2111.pdf",
            "section": "Placeholder section",
            "page": 12,
            "clause": "4.2",
        },
        message="Placeholder result. Real RAG logic comes here.",
    )


# FORM version: /standard-finder
@router.post("", response_model=StandardFinderResponse)
def find_standard(body: StandardFinderRequest):
    query = " | ".join(
        filter(None, [
            body.product_name,
            body.product_category,
            body.intended_use,
            body.specifications,
        ])
    )
    return _build_response(query)


# MESSAGE-BAR version: /standard-finder/ask
@router.post("/ask", response_model=StandardFinderResponse)
def ask_standard(body: StandardFinderAskRequest):
    return _build_response(body.question)
