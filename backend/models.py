from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, ForeignKey
from sqlalchemy.sql import func
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    role = Column(String, nullable=False)          # "user" or "assistant"
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Standard(Base):
    __tablename__ = "standards"

    id = Column(Integer, primary_key=True, index=True)
    is_number = Column(String, index=True, nullable=False)
    title = Column(String, nullable=True)
    category = Column(String, nullable=True)
    pdf_name = Column(String, nullable=True)
    section = Column(String, nullable=True)
    page_number = Column(Integer, nullable=True)
    clause_number = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ComplianceCheck(Base):
    __tablename__ = "compliance_checks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    product_name = Column(String, nullable=False)
    result = Column(JSON, nullable=True)           # completed/missing lists
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class RoadmapProgress(Base):
    __tablename__ = "roadmap_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    product_name = Column(String, nullable=False)
    product_category = Column(String, nullable=True)
    intended_use = Column(String, nullable=True)
    specifications = Column(String, nullable=True)
    current_step = Column(Integer, default=1)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),          # refreshes timestamp on every UPDATE
    )

    references = Column(JSON, nullable=True)
