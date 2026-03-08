from sqlalchemy import DateTime, Float, Enum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
from api.models import db
import enum

from api.models.user import User

class Payment(enum.Enum):
    credit_card = "credit_card"
    bizum = "bizum"

class Status(enum.Enum):
    pending = "pending"         #--Está en el carrito
    processing = "processing"   #--Se está procesando el pago
    paid = "paid"               #--Pago confirmado
    confirmed = "confirmed"     #--Vendedor recibe/abre el aviso
    shipped = "shipped"         #--Vendedor confirma envió con el código de envío
    delivered = "delivered"     #--Entregado
    cancelled = "cancelled"     #--Cancelado


class Order(db.Model):
    __tablename__ = 'order'
    id: Mapped[int] = mapped_column(primary_key=True)
    total_price: Mapped[float] = mapped_column(Float, nullable=False)
    tax: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    subtotal: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    payment_method:Mapped[Payment] = mapped_column(Enum(Payment), nullable=False)
    shipping_cost: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    status:Mapped[Status] = mapped_column(Enum(Status), nullable=False)
    stripe_payment_intent_id: Mapped[str] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column( DateTime(),default=datetime.now(timezone.utc))

    #---------------------ForeignKey

    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)
    shipping_address_id: Mapped[int] = mapped_column(ForeignKey("address.id"), nullable=True)
    billing_address_id: Mapped[int] = mapped_column(ForeignKey("address.id"), nullable=True)

    #----------------------RelationShip
    user: Mapped["User"] = relationship("User", back_populates="orders")
    order_details: Mapped[list["OrderDetail"]] = relationship("OrderDetail", back_populates="order", cascade="all, delete-orphan")
    shipment: Mapped["Shipment"] = relationship("Shipment", back_populates="order", uselist=False, cascade="all, delete-orphan")
    reviews: Mapped[list["Review"]] = relationship("Review", back_populates="order", cascade="all, delete-orphan")
    incidents: Mapped[list["Incident"]] = relationship("Incident", back_populates="order", cascade="all, delete-orphan")
    shipping_address: Mapped["Address"] = relationship("Address", foreign_keys=[shipping_address_id])
    billing_address: Mapped["Address"] = relationship("Address", foreign_keys=[billing_address_id])


    def serialize(self):
        return {
            "id": self.id,
            "total_price": self.total_price,
            "tax": self.tax,
            "payment_method": self.payment_method.value,
            "subtotal": self.subtotal,
            "shipping_cost": self.shipping_cost,
            "status": self.status.value,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "shipping_address": self.shipping_address.serialize() if self.shipping_address else None,
            "billing_address": self.billing_address.serialize() if self.billing_address else None,
            "stripe_payment_intent_id": self.stripe_payment_intent_id,
        }

    def serialize_with_user_id(self):
        data = self.serialize()
        data["user"] = self.user_id.serialize() if self.user_id else None
        return data