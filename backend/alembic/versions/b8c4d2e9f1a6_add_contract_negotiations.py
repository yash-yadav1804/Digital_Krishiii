"""add contract negotiations

Revision ID: b8c4d2e9f1a6
Revises: a21b3c8d7e4f
Create Date: 2026-09-19

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "b8c4d2e9f1a6"
down_revision: str | Sequence[str] | None = "a21b3c8d7e4f"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "contract_negotiations",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("contract_id", sa.Uuid(), nullable=False),
        sa.Column("sender_id", sa.Uuid(), nullable=False),
        sa.Column("proposed_quantity", sa.Numeric(precision=12, scale=2), nullable=True),
        sa.Column("proposed_price_per_unit", sa.Numeric(precision=12, scale=2), nullable=True),
        sa.Column("proposed_start_date", sa.Date(), nullable=True),
        sa.Column("proposed_end_date", sa.Date(), nullable=True),
        sa.Column("proposed_terms", sa.Text(), nullable=True),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("status", sa.String(length=30), server_default="PENDING", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.CheckConstraint("proposed_quantity IS NULL OR proposed_quantity > 0", name="ck_contract_negotiations_quantity_positive"),
        sa.CheckConstraint("proposed_price_per_unit IS NULL OR proposed_price_per_unit > 0", name="ck_contract_negotiations_price_positive"),
        sa.CheckConstraint("proposed_end_date IS NULL OR proposed_start_date IS NULL OR proposed_end_date >= proposed_start_date", name="ck_contract_negotiations_date_range"),
        sa.ForeignKeyConstraint(["contract_id"], ["contracts.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["sender_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_contract_negotiations_contract_id", "contract_negotiations", ["contract_id"])
    op.create_index("ix_contract_negotiations_sender_id", "contract_negotiations", ["sender_id"])
    op.create_index("ix_contract_negotiations_status", "contract_negotiations", ["status"])


def downgrade() -> None:
    op.drop_index("ix_contract_negotiations_status", table_name="contract_negotiations")
    op.drop_index("ix_contract_negotiations_sender_id", table_name="contract_negotiations")
    op.drop_index("ix_contract_negotiations_contract_id", table_name="contract_negotiations")
    op.drop_table("contract_negotiations")
