from sqlalchemy import String,DateTime, Float,Integer,Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
from api.models import db
import enum

from api.models.user import User

class Payment(enum.Enum):
    credit_card = "credit_card"
    bizum = "bizum"

class Status(enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    processing = "processing"
    shipped = "shipped"
    delivered = "delivered"
    cancelled = "cancelled"


class Order(db.Model):
    __tablename__ = 'order'
    id: Mapped[int] = mapped_column(primary_key=True)
    total_price: Mapped[float] = mapped_column(Float, nullable=False)
    tax: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    subtotal: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    payment_method:Mapped[Payment] = mapped_column(Enum(Payment), nullable=False)
    shipping_cost: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    status:Mapped[Status] = mapped_column(Enum(Status), nullable=False)
    created_at: Mapped[datetime] = mapped_column( DateTime(),default=datetime.now(timezone.utc))

    user_id: Mapped["User"] = relationship("User", back_populates="product")


    def serialize(self):
        return {
            "id": self.id,
            "total_price": self.total_price,
            "tax": self.tax,
            "subtotal": self.subtotal,
            "payment_method": self.payment_method,
            "subtotal": self.subtotal,
            "shipping_cost": self.shipping_cost,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def serialize_with_user_id(self):
        data = self.serialize()
        data["user"] = self.user_id.serialize() if self.user_id else None
        return data
