"""add image urls to marketplace entities

Revision ID: f8a1b2c3d4e5
Revises: e7f0a1b2c3d4
Create Date: 2026-09-21
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "f8a1b2c3d4e5"
down_revision: str | Sequence[str] | None = "e7f0a1b2c3d4"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    for table in (
        "contract_bids",
        "contract_negotiations",
        "lands",
        "crops",
        "contracts",
        "land_listings",
        "equipment",
        "farmer_profiles",
        "buyer_profiles",
    ):
        op.add_column(table, sa.Column("image_url", sa.String(length=1000), nullable=True))


def downgrade() -> None:
    for table in (
        "contract_negotiations",
        "contract_bids",
        "buyer_profiles",
        "farmer_profiles",
        "equipment",
        "land_listings",
        "contracts",
        "crops",
        "lands",
    ):
        op.drop_column(table, "image_url")
