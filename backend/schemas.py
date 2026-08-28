from pydantic import BaseModel


# ---------- Auth ----------

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    token: str
    user: dict


# ---------- AI Assistant / Home (chat) ----------

class ChatRequest(BaseModel):
    message: str
    user_id: int | None = None


class Source(BaseModel):
    standard: str | None = None
    clause: str | None = None
    page: int | None = None
    url: str | None = None


class ChatResponse(BaseModel):
    answer: str
    sources: list[Source] = []


# ---------- Standard Finder ----------

class StandardFinderAskRequest(BaseModel):
    question: str                                  # message-bar version


class StandardFinderRequest(BaseModel):
    product_name: str
    product_category: str | None = None
    intended_use: str | None = None
    specifications: str | None = None


class StandardFinderResponse(BaseModel):
    is_number: str | None = None
    title: str | None = None
    metadata: dict = {}                            # pdf_name, section, page, clause
    message: str


# ---------- Compliance Checker ----------

class ComplianceRequest(BaseModel):
    product_name: str
    product_use: str | None = None
    intended_use: str | None = None
    manufacturer_type: str | None = None
    product_specification: str | None = None
    existing_certification: str | None = None


class RequiredItem(BaseModel):
    requirement: str
    standard: str | None = None
    clause: str | None = None
    page: int | None = None
    pdf_name: str | None = None
    status: str = "missing"


class ComplianceResponse(BaseModel):
    product_name: str
    similarity_percentage: float
    requirements: list[RequiredItem] = []
    met_count: int = 0
    missing_count: int = 0
    message: str


# ---------- Certification Roadmap ----------

class RoadmapRequest(BaseModel):
    product_name: str
    product_category: str | None = None
    intended_use: str | None = None
    specifications: str | None = None
    current_status: str | None = None


class RoadmapResponse(BaseModel):
    product_name: str
    current_step: int
    checkpoints: list[dict] = []


class RoadmapHistoryResponse(BaseModel):
    items: list[RoadmapResponse] = []
