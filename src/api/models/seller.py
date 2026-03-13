import enum
from sqlalchemy import String, Text, Enum, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
from api.models import db


# ─── Enums ────────────────────────────────────────────────────────────────────

class SellerStatus(enum.Enum):
    pending  = "pending"
    verified = "verified"
    rejected = "rejected"


class Seller(db.Model):

    __tablename__ = 'seller'

    id: Mapped[int] = mapped_column(primary_key=True)
    store_name: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str] = mapped_column(Text(), nullable=True)
    phone: Mapped[str] = mapped_column(String(20), nullable=True)
    nif_cif: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    logo_url: Mapped[str] = mapped_column(String(500), nullable=True)
    origin_address: Mapped[str] = mapped_column(String(255), nullable=False)
    origin_city: Mapped[str] = mapped_column(String(100), nullable=False)
    origin_zip: Mapped[str] = mapped_column(String(10), nullable=False)
    origin_country: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[SellerStatus] = mapped_column(Enum(SellerStatus), nullable=False, default=SellerStatus.pending)
    rejection_reason: Mapped[str] = mapped_column(Text(), nullable=True)
    stripe_account_id: Mapped[str] = mapped_column(String(120), nullable=True)
    stripe_onboarding_completed: Mapped[bool] = mapped_column(Boolean(), nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(), default=datetime.now(timezone.utc))

    #---------------------ForeignKey

    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False, unique=True)

    #----------------------RelationShip

    user: Mapped["User"] = relationship("User", back_populates="seller")
    products: Mapped[list["Product"]] = relationship("Product", back_populates="seller", cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Seller {self.id}: {self.store_name} ({self.status.value})>'

    def serialize(self):
        return {
            "id": self.id,
            "stripe_account_id": self.stripe_account_id,
            "stripe_onboarding_completed": self.stripe_onboarding_completed,
            "store_name": self.store_name,
            "description": self.description,
            "phone": self.phone,
            "nif_cif": self.nif_cif,
            "logo_url": self.logo_url,
            "origin_address": self.origin_address,
            "origin_city": self.origin_city,
            "origin_zip": self.origin_zip,
            "origin_country": self.origin_country,
            "status": self.status.value,
            "rejection_reason": self.rejection_reason,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "user": self.user.serialize() if self.user else None,
        }
        
    def serialize_full(self, locale="es"):
        """Datos completos incluyendo productos — solo para perfil detallado."""
        return {
            "id": self.id,
            "stripe_account_id": self.stripe_account_id,
            "stripe_onboarding_completed": self.stripe_onboarding_completed,
            "store_name": self.store_name,
            "description": self.description,
            "phone": self.phone,
            "nif_cif": self.nif_cif,
            "logo_url": self.logo_url,
            "origin_address": self.origin_address,
            "origin_city": self.origin_city,
            "origin_zip": self.origin_zip,
            "origin_country": self.origin_country,
            "status": self.status.value,
            "rejection_reason": self.rejection_reason,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "user": self.user.serialize() if self.user else None,
            "products": [p.serialize(locale) for p in self.products],
        }

    def serialize_public(self):
        """Solo datos públicos visibles en la tienda."""
        return {
            "id": self.id,
            "store_name": self.store_name,
            "description": self.description,
            "logo_url": self.logo_url,
            "origin_city": self.origin_city,
            "origin_country": self.origin_country,
        }