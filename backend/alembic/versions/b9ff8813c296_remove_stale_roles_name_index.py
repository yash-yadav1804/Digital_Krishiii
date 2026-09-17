"""remove stale roles name index

Revision ID: b9ff8813c296
Revises: a2a7af9a615c
Create Date: 2026-09-15 16:28:52.879513
"""

from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "b9ff8813c296"
down_revision: str | Sequence[str] | None = "a2a7af9a615c"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.drop_index("ix_roles_name", table_name="roles")


def downgrade() -> None:
    """Downgrade schema."""
    op.create_index(
        "ix_roles_name",
        "roles",
        ["name"],
        unique=False,
    )
