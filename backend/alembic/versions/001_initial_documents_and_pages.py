"""Initial documents and pages tables

Revision ID: 001_initial
Revises:
Create Date: 2026-07-03
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "001_initial"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    document_status = postgresql.ENUM(
        "pending", "processing", "ready", "failed", name="document_status", create_type=True
    )
    page_status = postgresql.ENUM(
        "pending", "processing", "ready", "failed", name="page_status", create_type=True
    )

    op.create_table(
        "documents",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("filename", sa.String(512), nullable=False),
        sa.Column("original_filename", sa.String(512), nullable=False),
        sa.Column("file_path", sa.String(1024), nullable=False),
        sa.Column("file_size", sa.Integer(), nullable=False),
        sa.Column("mime_type", sa.String(128), nullable=False, server_default="application/pdf"),
        sa.Column("page_count", sa.Integer(), nullable=True),
        sa.Column("status", document_status, nullable=False, server_default="pending"),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("task_id", sa.String(255), nullable=True),
        sa.Column("storage_backend", sa.String(32), nullable=False, server_default="local"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    op.create_table(
        "pages",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("document_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("documents.id", ondelete="CASCADE"), nullable=False),
        sa.Column("page_number", sa.Integer(), nullable=False),
        sa.Column("width", sa.Float(), nullable=True),
        sa.Column("height", sa.Float(), nullable=True),
        sa.Column("thumbnail_path", sa.String(1024), nullable=True),
        sa.Column("status", page_status, nullable=False, server_default="pending"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("document_id", "page_number", name="uq_document_page_number"),
    )
    op.create_index("ix_pages_document_id", "pages", ["document_id"])


def downgrade() -> None:
    op.drop_index("ix_pages_document_id", table_name="pages")
    op.drop_table("pages")
    op.drop_table("documents")
    op.execute("DROP TYPE IF EXISTS page_status")
    op.execute("DROP TYPE IF EXISTS document_status")
