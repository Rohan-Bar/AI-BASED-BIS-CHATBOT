import pdfplumber
from fastapi import APIRouter, UploadFile, File, Form, Depends
from sqlalchemy.orm import Session

from database import get_db
import models
from schemas import ComplianceResponse, RequiredItem

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
    prefix="/compliance",
    tags=["Compliance Checker"]
)


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
# CONFIG
# ============================================================

# Max characters of the uploaded PDF sent to the LLM.
# Prevents context-length errors on large test reports.

MAX_DOC_CHARS = 6000


# ============================================================
# PDF EXTRACTION
# ============================================================

def _extract_pdf(file: UploadFile) -> str:
    """
    Extract text from uploaded PDF.
    """

    with pdfplumber.open(file.file) as pdf:

        pages = []

        for page in pdf.pages:

            text = page.extract_text() or ""

            if text.strip():
                pages.append(text.strip())

        return "\n\n".join(pages)


# ============================================================
# EXTRACT REQUIREMENTS FROM LLM RESPONSE
# ============================================================

def _extract_requirements(
    answer: str,
    sources: list
) -> list:

    requirements = []

    if not answer:
        return requirements

    # --------------------------------------------------------
    # Split numbered requirements
    #
    # Examples:
    # 1. [FULFILLED] Test report is available.
    # 2. [MISSING] Factory inspection is required.
    # --------------------------------------------------------

    pattern = r"(?:^|\n)\s*\d+[\.\)]\s*(.*?)(?=\n\s*\d+[\.\)]|\Z)"

    matches = re.findall(
        pattern,
        answer,
        re.DOTALL
    )

    # --------------------------------------------------------
    # If numbered format was not detected,
    # try line-by-line fallback
    # --------------------------------------------------------

    if not matches:

        matches = [
            line.strip()
            for line in answer.splitlines()
            if line.strip()
        ]

    # --------------------------------------------------------
    # Process each requirement
    # --------------------------------------------------------

    for index, item in enumerate(matches):

        item = item.strip()

        if not item:
            continue

        # ----------------------------------------------------
        # Detect status marker
        # ----------------------------------------------------

        if item.startswith("[FULFILLED]"):

            status = "met"

            item = item.replace(
                "[FULFILLED]",
                "",
                1
            ).strip()

        elif item.startswith("[MISSING]"):

            status = "missing"

            item = item.replace(
                "[MISSING]",
                "",
                1
            ).strip()

        else:

            # No marker → safe default
            status = "missing"

        # ----------------------------------------------------
        # Requirement text
        # ----------------------------------------------------

        requirement_text = item

        if not requirement_text:
            continue

        # ----------------------------------------------------
        # Attach source information
        # (approximate mapping — requirement i → source i)
        # ----------------------------------------------------

        source_name = None
        page = None

        if sources:

            source_index = min(
                index,
                len(sources) - 1
            )

            source = sources[source_index]

            source_name = source.get(
                "source"
            )

            page = source.get(
                "page"
            )

        # ----------------------------------------------------
        # Create RequiredItem
        # ----------------------------------------------------

        requirements.append(
            RequiredItem(
                requirement=requirement_text,
                standard=None,
                clause=None,
                page=page,
                pdf_name=source_name,
                status=status
            )
        )

    return requirements


# ============================================================
# COMPLIANCE ENDPOINT
# ============================================================

@router.post(
    "/check",
    response_model=ComplianceResponse
)
async def check_compliance(

    product_name: str = Form(...),

    product_use: str | None = Form(None),

    intended_use: str | None = Form(None),

    manufacturer_type: str | None = Form(None),

    product_specification: str | None = Form(None),

    existing_certification: str | None = Form(None),

    file: UploadFile | None = File(None),

    db: Session = Depends(get_db),
):

    # ========================================================
    # 1. EXTRACT UPLOADED PDF
    # ========================================================

    doc_text = ""

    if file is not None:

        # ----------------------------------------------------
        # Validate file type
        # ----------------------------------------------------

        if not (
            file.filename
            and
            file.filename.lower().endswith(".pdf")
        ):

            return ComplianceResponse(
                product_name=product_name,
                similarity_percentage=0.0,
                requirements=[],
                met_count=0,
                missing_count=0,
                message=(
                    "Unsupported file — "
                    "please upload a PDF."
                )
            )

        try:

            doc_text = _extract_pdf(file)

        except Exception:

            traceback.print_exc()

            return ComplianceResponse(
                product_name=product_name,
                similarity_percentage=0.0,
                requirements=[],
                met_count=0,
                missing_count=0,
                message=(
                    "Unable to read the uploaded PDF."
                )
            )

    # ========================================================
    # 2. BUILD USER PRODUCT PROFILE
    # ========================================================

    user_profile = " | ".join(
        filter(
            None,
            [
                product_name,
                product_use,
                intended_use,
                manufacturer_type,
                product_specification,
                existing_certification,
            ]
        )
    )

    # ========================================================
    # 3. BUILD RAG QUERY
    #
    # NOTE:
    # The product profile is placed FIRST and the document
    # text is CAPPED, so the embedded retrieval query stays
    # meaningful and the LLM context stays within limits.
    # ========================================================

    doc_section = (
        doc_text[:MAX_DOC_CHARS]
        if doc_text
        else "No document was uploaded."
    )

    rag_query = f"""
You are performing a BIS compliance assessment.

PRODUCT INFORMATION:
{user_profile}

UPLOADED DOCUMENT INFORMATION:
{doc_section}

TASK:

Identify the BIS compliance requirements that are relevant
to this product.

Use ONLY the retrieved BIS document context provided by
the RAG system.

Return the requirements as numbered points.

Do not invent requirements.

For every requirement, determine whether there is actual
evidence that the user/product already satisfies it.

IMPORTANT:

Start EACH numbered requirement with one of these exact
markers:

[FULFILLED]
if the product information or uploaded document provides
clear evidence that the requirement is already satisfied.

[MISSING]
if there is no evidence that the requirement is satisfied.

IMPORTANT RULES:

1. Do not assume that a requirement is fulfilled merely
   because the user entered a product name.

2. Do not assume certification, testing, calibration,
   inspection, documentation or approval has been completed
   unless evidence is provided.

3. If evidence is unclear or insufficient, use [MISSING].

4. Use only requirements supported by the retrieved BIS
   documents.

5. Do not invent IS numbers, clauses, testing requirements,
   certification requirements or documentation requirements.

6. Keep each requirement concise.

7. Return numbered requirements only.

Example:

1. [FULFILLED] The uploaded document contains a valid test report.
2. [MISSING] The manufacturer must maintain an inspection and
   testing plan.
3. [MISSING] Required factory inspection must be completed.

"""

    # ========================================================
    # 4. RAG SEARCH
    # ========================================================

    try:

        rag_result = get_rag().search(
            query=rag_query,
            top_k=5
        )

        answer = rag_result.get(
            "answer",
            ""
        )

        rag_sources = rag_result.get(
            "sources",
            []
        )

    except Exception:

        traceback.print_exc()

        return ComplianceResponse(
            product_name=product_name,
            similarity_percentage=0.0,
            requirements=[],
            met_count=0,
            missing_count=0,
            message=(
                "Sorry, I was unable to perform the "
                "compliance assessment at the moment."
            )
        )

    # ========================================================
    # 5. EXTRACT REQUIREMENTS
    # ========================================================

    requirements = _extract_requirements(
        answer=answer,
        sources=rag_sources
    )

    # ========================================================
    # 6. HANDLE NO REQUIREMENTS
    # ========================================================

    if not requirements:

        return ComplianceResponse(
            product_name=product_name,
            similarity_percentage=0.0,
            requirements=[],
            met_count=0,
            missing_count=0,
            message=(
                "I could not identify sufficient BIS "
                "compliance requirements from the provided "
                "information."
            )
        )

    # ========================================================
    # 7. COUNT FULFILLED / MISSING
    # ========================================================

    met = [
        requirement
        for requirement in requirements
        if requirement.status == "met"
    ]

    missing = [
        requirement
        for requirement in requirements
        if requirement.status == "missing"
    ]

    # ========================================================
    # 8. CALCULATE COMPLIANCE PERCENTAGE
    # (LLM-estimated status, not measured similarity)
    # ========================================================

    similarity = round(
        (
            len(met)
            /
            len(requirements)
        )
        * 100,
        1
    )

    # ========================================================
    # 9. PREPARE DATABASE RESULT
    # ========================================================

    result_data = {

        "user_profile": user_profile,

        "doc_text_chars": len(doc_text),

        "similarity_percentage": similarity,

        "met_count": len(met),

        "missing_count": len(missing),

        "requirements": [
            requirement.model_dump()
            for requirement in requirements
        ],

        "sources": rag_sources,
    }

    # ========================================================
    # 10. SAVE ASSESSMENT
    # ========================================================

    try:

        db.add(
            models.ComplianceCheck(

                user_id=None,

                product_name=product_name,

                result=result_data
            )
        )

        db.commit()

    except Exception:

        traceback.print_exc()

        db.rollback()

        # Assessment can still be returned to frontend
        # even if database saving fails.

    # ========================================================
    # 11. BUILD FINAL MESSAGE
    # ========================================================

    message = (
        f"Compliance assessment completed. "
        f"{len(met)} of {len(requirements)} requirements "
        f"are currently fulfilled. "
        f"{len(missing)} requirements are still missing."
    )

    # ========================================================
    # 12. RETURN RESPONSE
    # ========================================================

    return ComplianceResponse(

        product_name=product_name,

        similarity_percentage=similarity,

        requirements=requirements,

        met_count=len(met),

        missing_count=len(missing),

        message=message
    )