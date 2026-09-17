import uuid
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.db.models.crop import Crop
    from app.db.models.user import User


class Land(Base):
    __tablename__ = "lands"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4,
    )

    farmer_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    land_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    village: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )

    district: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )

    state: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )

    area_acres: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )

    soil_type: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    irrigation_type: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    farmer: Mapped["User"] = relationship(
        back_populates="lands",
    )

    crops: Mapped[list["Crop"]] = relationship(
        back_populates="land",
        cascade="all, delete-orphan",
    )
