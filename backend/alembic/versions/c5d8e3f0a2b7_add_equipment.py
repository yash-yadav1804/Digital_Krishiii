"""add equipment and equipment requests

Revision ID: c5d8e3f0a2b7
Revises: b8c4d2e9f1a6
Create Date: 2026-09-19

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "c5d8e3f0a2b7"
down_revision: str | Sequence[str] | None = "b8c4d2e9f1a6"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "equipment",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("provider_id", sa.Uuid(), nullable=False),
        sa.Column("name", sa.String(length=150), nullable=False),
        sa.Column("category", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("condition", sa.String(length=100), nullable=True),
        sa.Column("location", sa.String(length=200), nullable=True),
        sa.Column("rental_price_per_day", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("is_available", sa.Boolean(), server_default="true", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["provider_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_equipment_provider_id", "equipment", ["provider_id"])

    op.create_table(
        "equipment_requests",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("equipment_id", sa.Uuid(), nullable=False),
        sa.Column("farmer_id", sa.Uuid(), nullable=False),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=False),
        sa.Column("agreed_rate_per_day", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("message", sa.Text(), nullable=True),
        sa.Column("status", sa.String(length=30), server_default="PENDING", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.CheckConstraint("end_date >= start_date", name="ck_equipment_requests_date_range"),
        sa.ForeignKeyConstraint(["equipment_id"], ["equipment.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["farmer_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_equipment_requests_equipment_id", "equipment_requests", ["equipment_id"])
    op.create_index("ix_equipment_requests_farmer_id", "equipment_requests", ["farmer_id"])
    op.create_index("ix_equipment_requests_status", "equipment_requests", ["status"])


def downgrade() -> None:
    op.drop_index("ix_equipment_requests_status", table_name="equipment_requests")
    op.drop_index("ix_equipment_requests_farmer_id", table_name="equipment_requests")
    op.drop_index("ix_equipment_requests_equipment_id", table_name="equipment_requests")
    op.drop_table("equipment_requests")
    op.drop_index("ix_equipment_provider_id", table_name="equipment")
    op.drop_table("equipment")
