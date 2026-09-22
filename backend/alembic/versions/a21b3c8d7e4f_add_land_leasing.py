"""add land listings and lease requests

Revision ID: a21b3c8d7e4f
Revises: c39e2d19a4bf
Create Date: 2026-09-19

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "a21b3c8d7e4f"
down_revision: str | Sequence[str] | None = "c39e2d19a4bf"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "land_listings",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("land_id", sa.Uuid(), nullable=False),
        sa.Column("farmer_id", sa.Uuid(), nullable=False),
        sa.Column("listing_type", sa.String(length=30), server_default="LEASE", nullable=False),
        sa.Column("rate_per_acre", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("min_duration_months", sa.Integer(), nullable=False),
        sa.Column("max_duration_months", sa.Integer(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("status", sa.String(length=30), server_default="OPEN", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.CheckConstraint("min_duration_months > 0", name="ck_land_listings_min_duration_positive"),
        sa.CheckConstraint("max_duration_months >= min_duration_months", name="ck_land_listings_duration_range"),
        sa.ForeignKeyConstraint(["farmer_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["land_id"], ["lands.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_land_listings_land_id", "land_listings", ["land_id"])
    op.create_index("ix_land_listings_farmer_id", "land_listings", ["farmer_id"])
    op.create_index("ix_land_listings_status", "land_listings", ["status"])

    op.create_table(
        "lease_requests",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("listing_id", sa.Uuid(), nullable=False),
        sa.Column("buyer_id", sa.Uuid(), nullable=False),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=False),
        sa.Column("offered_rate_per_acre", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("message", sa.Text(), nullable=True),
        sa.Column("status", sa.String(length=30), server_default="PENDING", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.CheckConstraint("end_date > start_date", name="ck_lease_requests_date_range"),
        sa.ForeignKeyConstraint(["buyer_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["listing_id"], ["land_listings.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_lease_requests_listing_id", "lease_requests", ["listing_id"])
    op.create_index("ix_lease_requests_buyer_id", "lease_requests", ["buyer_id"])
    op.create_index("ix_lease_requests_status", "lease_requests", ["status"])


def downgrade() -> None:
    op.drop_index("ix_lease_requests_status", table_name="lease_requests")
    op.drop_index("ix_lease_requests_buyer_id", table_name="lease_requests")
    op.drop_index("ix_lease_requests_listing_id", table_name="lease_requests")
    op.drop_table("lease_requests")
    op.drop_index("ix_land_listings_status", table_name="land_listings")
    op.drop_index("ix_land_listings_farmer_id", table_name="land_listings")
    op.drop_index("ix_land_listings_land_id", table_name="land_listings")
    op.drop_table("land_listings")
