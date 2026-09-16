"""create farmer profiles

Revision ID: a2a7af9a615c
Revises: 7dc998b27f21
Create Date: 2026-09-15 16:20:16.283742
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "a2a7af9a615c"
down_revision: Union[str, Sequence[str], None] = "7dc998b27f21"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "farmer_profiles",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("full_name", sa.String(length=150), nullable=False),
        sa.Column("phone_number", sa.String(length=20), nullable=True),
        sa.Column("village", sa.String(length=150), nullable=True),
        sa.Column("district", sa.String(length=150), nullable=True),
        sa.Column("state", sa.String(length=150), nullable=True),
        sa.Column("land_details", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id"),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table("farmer_profiles")
