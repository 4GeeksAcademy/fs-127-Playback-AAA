from sqlalchemy import String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
from api.models import db


class Incident(db.Model):
    __tablename__ = 'incidents'

    # Columnas
    id: Mapped[int] = mapped_column(primary_key=True)

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(String(1000), nullable=False)

    status: Mapped[str] = mapped_column(
        Enum('open', 'in_progress', 'resolved', 'rejected', name='incident_status'),
        default='open',
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

    user_id: Mapped[int] = mapped_column(
        ForeignKey('users.id'),
        nullable=False
    )

    order_id: Mapped[int] = mapped_column(
        ForeignKey('orders.id'),
        nullable=True
    )

    # Relaciones
    user: Mapped["User"] = relationship(
        "User",
        back_populates="incidents"
    )

    order: Mapped["Order"] = relationship(
        "Order",
        back_populates="incidents"
    )

    def __repr__(self):
        return f'<Incident {self.id}: {self.title} ({self.status})>'

    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "status": self.status,
            "user_id": self.user_id,
            "order_id": self.order_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
