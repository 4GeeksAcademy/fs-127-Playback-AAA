from sqlalchemy import String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
from api.models import db
from api.models.order import Order
from api.models.user import User


class Incident(db.Model): 
    _tablename_ = 'incident'

    # Columnas
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(String(1000), nullable=False)
    status: Mapped[str] = mapped_column(
        Enum('open', 'in_progress', 'resolved', 'rejected', name='incident_status'),
        default='open',
        nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    #----------------------ForeignKey

    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)
    seller_order_id: Mapped[int] = mapped_column(ForeignKey("seller_order.id"), nullable=False)

    #----------------------RelationShip
    
    user: Mapped["User"] = relationship("User", back_populates="incidents")
    seller_order: Mapped["SellerOrder"] = relationship("SellerOrder", back_populates="incidents")
    messages: Mapped[list["IncidentMessage"]] = relationship("IncidentMessage", back_populates="incident", cascade="all, delete-orphan")

    def _repr_(self):
        return f'<Incident {self.id}: {self.title} ({self.status})>'

    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "status": self.status,
            "user_id": self.user_id,
            "seller_order_id": self.seller_order_id,
            "order_id": self.seller_order.order_id if self.seller_order else None,
            "seller_id": self.seller_order.seller_id if self.seller_order else None,
            "seller_name": self.seller_order.seller.store_name if self.seller_order and self.seller_order.seller else None,
            "buyer_name": f"{self.user.name} {self.user.last_name}" if self.user else None,
            "buyer_image": self.user.image_url if self.user else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }