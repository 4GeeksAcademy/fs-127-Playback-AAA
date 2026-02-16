from sqlalchemy import String, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
from api.models import db


class Address(db.Model):
    __tablename__ = "addresses"

    # =========================
    # Columnas
    # =========================
    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False
    )

    address: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    address_type: Mapped[str] = mapped_column(
        String(50),
        default="shipping",
        nullable=False
    )

    full_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False
    )

    phone: Mapped[str] = mapped_column(
        String(30),
        nullable=False
    )

    city: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    province: Mapped[str] = mapped_column(
        String(100),
        nullable=True
    )

    municipality: Mapped[str] = mapped_column(
        String(100),
        nullable=True
    )

    postal_code: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    country: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(),
        default=datetime.now(timezone.utc)
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(),
        default=datetime.now(timezone.utc),
        onupdate=datetime.now(timezone.utc)
    )

    user: Mapped["User"] = relationship(
        "User",
        back_populates="addresses"
    )

    def __repr__(self):
        return f"<Address {self.id}: {self.full_name} - {self.city}, {self.country}>"

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "address": self.address,
            "address_type": self.address_type,
            "full_name": self.full_name,
            "phone": self.phone,
            "city": self.city,
            "province": self.province,
            "municipality": self.municipality,
            "postal_code": self.postal_code,
            "country": self.country,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }