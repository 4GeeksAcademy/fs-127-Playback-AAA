from sqlalchemy import String, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
from api.models import db


class IncidentMessage(db.Model):
    __tablename__ = 'incident_message'

    id: Mapped[int] = mapped_column(primary_key=True)
    body: Mapped[str] = mapped_column(Text, nullable=True)
    image_url: Mapped[str] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )

    # ── ForeignKeys ──────────────────────────────────────────────────────────
    incident_id: Mapped[int] = mapped_column(ForeignKey("incident.id"), nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)

    # ── Relationships — strings para evitar importación circular ─────────────
    incident = relationship("Incident", back_populates="messages")
    user = relationship("User", back_populates="incident_messages")

    def __repr__(self):
        return f'<IncidentMessage {self.id} incident={self.incident_id}>'

    def serialize(self):
        return {
            "id": self.id,
            "body": self.body,
            "image_url": self.image_url,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "incident_id": self.incident_id,
            "user_id": self.user_id,
            "user": {
                "id": self.user.id,
                "name": self.user.name,
                "last_name": self.user.last_name,
                "image_url": self.user.image_url,
                "role": self.user.role.value if self.user.role else None,
            } if self.user else None,
        }