import pdfplumber
from fastapi import APIRouter, UploadFile, File, Form, Depends
from sqlalchemy.orm import Session

from database import get_db
import models
from schemas import ComplianceResponse, RequiredItem

router = APIRouter(prefix="/compliance", tags=["Compliance Checker"])


def _extract_pdf(file: UploadFile) -> str:
    with pdfplumber.open(file.file) as pdf:
        return "\n".join(p.extract_text() or "" for p in pdf.pages)


@router.post("/check", response_model=ComplianceResponse)
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
    # ---- 1. Extract uploaded document text (if any) ----
    doc_text = ""
    if file is not None:
        if not (file.filename and file.filename.lower().endswith(".pdf")):
            return ComplianceResponse(
                product_name=product_name,
                similarity_percentage=0.0,
                message="Unsupported file — please upload a PDF",
            )
        doc_text = _extract_pdf(file)

    # ---- 2. Build the user's current-state profile ----
    user_profile = " | ".join(filter(None, [
        product_name, product_use, intended_use,
        manufacturer_type, product_specification,
        existing_certification,
    ]))

    # ---- 3. PLACEHOLDER — teammate's RAG + LLM logic replaces this block ----
    requirements = [
        RequiredItem(
            requirement="Placeholder: product must conform to applicable IS standard",
            standard="IS 17874", clause="4.2", page=12, pdf_name="Standard_2111.pdf",
            status="missing",
        ),
        RequiredItem(
            requirement="Placeholder: factory audit by BIS officials",
            standard="IS 17874", clause="7.1", page=30, pdf_name="Standard_2111.pdf",
            status="missing",
        ),
        RequiredItem(
            requirement="Placeholder: sample testing at BIS-recognized lab",
            status="missing",
        ),
        RequiredItem(
            requirement="Placeholder: application fee submission",
            status="missing",
        ),
    ]

    met = [r for r in requirements if r.status == "met"]
    missing = [r for r in requirements if r.status == "missing"]

    # Placeholder similarity — teammate replaces with real embedding similarity
    similarity = round(len(met) / len(requirements) * 100, 1) if requirements else 0.0

    # ---- 4. Save the check to the database ----
    db.add(models.ComplianceCheck(
        user_id=None,                       # wire real user via token later
        product_name=product_name,
        result={
            "user_profile": user_profile,
            "doc_text_chars": len(doc_text),
            "similarity_percentage": similarity,
            "met_count": len(met),
            "missing_count": len(missing),
            "requirements": [r.model_dump() for r in requirements],
        },
    ))
    db.commit()

    return ComplianceResponse(
        product_name=product_name,
        similarity_percentage=similarity,
        requirements=requirements,
        met_count=len(met),
        missing_count=len(missing),
        message=f"Placeholder result: {len(missing)} items still needed for final certification. Real RAG logic comes here.",
    )
