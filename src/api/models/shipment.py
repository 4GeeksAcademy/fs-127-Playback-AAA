import enum
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from api.models import db


class ShipmentStatus(enum.Enum):
    PENDING = "pending"
    SHIPPED = "shipped"
    IN_TRANSIT = "in_transit"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class Shipment(db.Model):
    __tablename__ = "shipments"

    id: Mapped[int] = mapped_column(primary_key=True)

    order_id: Mapped[int] = mapped_column(
        ForeignKey("orders.id"),
        nullable=False
    )

    carrier_id: Mapped[int] = mapped_column(
        ForeignKey("carriers.id"),
        nullable=True
    )

    shipping_code: Mapped[str] = mapped_column(String(100), nullable=False)

    tracking_number: Mapped[str] = mapped_column(String(100), nullable=True)

    estimated_delivery_date: Mapped[datetime] = mapped_column(DateTime, nullable=True)

    shipping_date: Mapped[datetime] = mapped_column(DateTime, nullable=True)

    delivery_date: Mapped[datetime] = mapped_column(DateTime, nullable=True)

    shipment_status: Mapped[ShipmentStatus] = mapped_column(
        Enum(ShipmentStatus),
        default=ShipmentStatus.PENDING,
        nullable=False
    )

    order: Mapped["Order"] = relationship("Order")

    carrier: Mapped["Carrier"] = relationship("Carrier")
