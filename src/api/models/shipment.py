import enum
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from api.models import db
from api.models.carrier import Carrier
from api.models.order import Order


class ShipmentStatus(enum.Enum):
    PENDING = "pending"
    SHIPPED = "shipped"
    IN_TRANSIT = "in_transit"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class Shipment(db.Model):
    __tablename__ = "shipment"

    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"),nullable=False)
    carrier_id: Mapped[int] = mapped_column(ForeignKey("carriers.id"),nullable=False)
    shipping_code: Mapped[str] = mapped_column(String(100), nullable=False)
    tracking_number: Mapped[str] = mapped_column(String(100), nullable=True)
    estimated_delivery_date: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    shipping_date: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    delivery_date: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    shipment_status: Mapped[ShipmentStatus] = mapped_column(Enum(ShipmentStatus),default=ShipmentStatus.PENDING,nullable=False)

    order_id: Mapped["Order"] = relationship(
        "Order",
        back_populates="shipment",
        uselist=False,
        cascade="all, delete-orphan"
    )

    carrier_id: Mapped["Carrier"] = relationship(
        "Carrier",
        back_populates="shipment",
        uselist=False,
        cascade="all, delete-orphan"
    )

    def serialize(self):
        return {
            "id": self.id,
            "order_id": self.order_id,
            "carrier_id": self.carrier_id,
            "shipping_code": self.shipping_code,
            "tracking_number": self.tracking_number,
            "estimated_delivery_date": self.estimated_delivery_date,
            "shipping_date": self.shipping_date,
            "delivery_date": self.delivery_date,
            "shipment_status": self.shipment_status,      
        }