import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, String, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Crop(Base):
    __tablename__ = "crops"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4,
    )

    farmer_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    land_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("lands.id", ondelete="CASCADE"),
        nullable=False,
    )

    crop_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    season: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    sowing_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    expected_harvest_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    expected_yield: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=text("now()"),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=text("now()"),
        nullable=False,
    )

    farmer = relationship("User", back_populates="crops")

    land = relationship("Land", back_populates="crops")
