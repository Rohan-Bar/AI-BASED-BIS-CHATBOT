from fastapi import APIRouter

from schemas import (
    StandardFinderAskRequest,
    StandardFinderRequest,
    StandardFinderResponse,
)

# ============================================================
# RAG IMPORT
# ============================================================

from ragbased.groqllm import RAGSearch

import re
import traceback


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/standard-finder",
    tags=["Standard Finder"]
)


# ============================================================
# LAZY RAG INITIALIZATION
# (server boots even if ChromaDB/model is missing —
#  only this feature fails gracefully, not the whole app)
# ============================================================

rag_search = None


def get_rag() -> RAGSearch:
    global rag_search

    if rag_search is None:
        rag_search = RAGSearch()

    return rag_search


# ============================================================
# HELPERS
# ============================================================

def _extract_is_number(text: str) -> str:
    """
    Pull the IS / IS-IEC number out of the LLM answer,
    e.g. 'IS 9873', 'IS/IEC 62368-1 : 2020', 'IS 9873 Part 1'.
    """

    match = re.search(
        r"\bIS\s?/?\s?IEC?\s?\d{3,5}"
        r"(?:\s*[:\-]\s*\d{4})?"
        r"(?:\s*(?:Part\s?)?\d+)?",
        text,
        re.IGNORECASE
    )

    return match.group(0).strip() if match else "Not found"


def _build_response(query: str) -> StandardFinderResponse:

    try:

        # ----------------------------------------------------
        # Search BIS documents using RAG
        # ----------------------------------------------------

        rag_result = get_rag().search(
            query=query,
            top_k=5
        )

        answer = rag_result.get(
            "answer",
            ""
        )

        sources = rag_result.get(
            "sources",
            []
        )

        # ----------------------------------------------------
        # No relevant information
        # ----------------------------------------------------

        if not sources:

            return StandardFinderResponse(
                is_number="Not found",
                title="No relevant BIS standard found",
                metadata={},
                message=answer
            )

        # ----------------------------------------------------
        # Use the best retrieved source
        # ----------------------------------------------------

        best_source = sources[0]

        source_name = best_source.get(
            "source",
            "Unknown"
        )

        page = best_source.get(
            "page",
            "Unknown"
        )

        # ----------------------------------------------------
        # Response metadata
        # ----------------------------------------------------

        metadata = {
            "pdf_name": source_name,
            "page": page,
            "retrieved_sources": [
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
                for source in sources
            ]
        }

        # ----------------------------------------------------
        # Extract real IS number from the answer
        # ----------------------------------------------------

        is_number = _extract_is_number(answer)

        # ----------------------------------------------------
        # Return Standard Finder response
        # ----------------------------------------------------

        return StandardFinderResponse(
            is_number=is_number,
            title="Relevant BIS Standard",
            metadata=metadata,
            message=answer
        )

    except Exception:

        traceback.print_exc()

        return StandardFinderResponse(
            is_number="Not found",
            title="Unable to search BIS standards",
            metadata={},
            message=(
                "Sorry, I was unable to search the "
                "BIS documents at the moment."
            )
        )


# ============================================================
# FORM VERSION
# /standard-finder
# ============================================================

@router.post(
    "",
    response_model=StandardFinderResponse
)
def find_standard(
    body: StandardFinderRequest
):

    query = " | ".join(
        filter(
            None,
            [
                body.product_name,
                body.product_category,
                body.intended_use,
                body.specifications,
            ]
        )
    )

    return _build_response(query)


# ============================================================
# MESSAGE-BAR VERSION
# /standard-finder/ask
# ============================================================

@router.post(
    "/ask",
    response_model=StandardFinderResponse
)
def ask_standard(
    body: StandardFinderAskRequest
):
    return _build_response(
        body.question
    )