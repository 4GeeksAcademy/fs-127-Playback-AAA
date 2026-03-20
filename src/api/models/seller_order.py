import enum
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from api.models import db


class SellerOrderStatus(enum.Enum):
    paid        = "paid"        # recién creado al confirmar el pago
    confirmed   = "confirmed"   # vendedor abre el pedido
    processing  = "processing"  # preparando el envío
    shipped     = "shipped"     # enviado con código de seguimiento
    delivered   = "delivered"   # entregado
    cancelled   = "cancelled"   # cancelado


class SellerOrder(db.Model):

    __tablename__ = "seller_order"

    id:            Mapped[int] = mapped_column(primary_key=True)
    status:        Mapped[SellerOrderStatus] = mapped_column( Enum(SellerOrderStatus), nullable=False, default=SellerOrderStatus.paid )
    tracking_code: Mapped[str] = mapped_column(String(100), nullable=True)
    carrier_name:  Mapped[str] = mapped_column(String(100), nullable=True)
    shipped_at:    Mapped[datetime] = mapped_column(DateTime(), nullable=True)
    cancellation_reason:    Mapped[str]      = mapped_column(String(500), nullable=True)  # ← NUEVO
    created_at:    Mapped[datetime] = mapped_column(DateTime(), default=datetime.now(timezone.utc))

    #---------------------ForeignKey

    order_id:  Mapped[int] = mapped_column(ForeignKey("order.id"),  nullable=False)
    seller_id: Mapped[int] = mapped_column(ForeignKey("seller.id"), nullable=False)

    #----------------------RelationShip

    order:  Mapped["Order"]  = relationship("Order",  back_populates="seller_orders")
    seller: Mapped["Seller"] = relationship("Seller", back_populates="seller_orders")

    def serialize(self):
        return {
            "id": self.id,
            "order_id": self.order_id,
            "seller_id": self.seller_id,
            "status": self.status.value,
            "tracking_code": self.tracking_code,
            "carrier_name": self.carrier_name,
            "shipped_at": self.shipped_at.isoformat() if self.shipped_at else None,
            "cancellation_reason": self.cancellation_reason,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
