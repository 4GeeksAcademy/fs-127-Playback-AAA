from sqlalchemy import String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
from api.models import db
from api.models.user import User


class Address(db.Model):
    __tablename__ = "address"

    # =========================
    # Columnas
    # =========================
    id: Mapped[int] = mapped_column(primary_key=True)
    address: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    phone: Mapped[str] = mapped_column(String(30), nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    province: Mapped[str] = mapped_column(String(100), nullable=True)
    municipality: Mapped[str] = mapped_column(String(100), nullable=True)
    postal_code: Mapped[str] = mapped_column(String(20), nullable=False)
    community_code = db.Column(db.String(10), nullable=True)
    community = db.Column(db.String(150), nullable=True)
    province_code = db.Column(db.String(10), nullable=True)
    country: Mapped[str] = mapped_column(String(100), nullable=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean(), nullable=False, default=False)
    deleted_at: Mapped[datetime] = mapped_column(DateTime(), nullable=True, default=None)
    created_at: Mapped[datetime] = mapped_column(DateTime(), default=datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(), default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))

    #----------------------ForeignKey

    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)

    #----------------------RelationShip
    
    user: Mapped["User"] = relationship("User", back_populates="addresses")

    def __repr__(self):
        return f"<Address {self.id}: {self.full_name} - {self.city}, {self.country}>"

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "address": self.address,
            "full_name": self.full_name,
            "phone": self.phone,
            "city": self.city,
            "province": self.province,
            "municipality": self.municipality,
            "postal_code": self.postal_code,
            "community_code": self.community_code,
            "community": self.community,
            "province_code": self.province_code,
            "country": self.country,
            "is_deleted": self.is_deleted,
            "deleted_at": self.deleted_at.isoformat() if self.deleted_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }