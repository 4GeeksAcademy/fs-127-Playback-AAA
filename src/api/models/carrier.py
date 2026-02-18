from sqlalchemy import String, Integer, Boolean
from sqlalchemy.orm import Mapped, mapped_column,relationship
from api.models import db

    
class Carrier(db.Model):
    __tablename__ = "carrier"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    code: Mapped[str] = mapped_column(String(50),unique=True,nullable=False)
    tracking_url_template: Mapped[str] = mapped_column(String(255),nullable=True)
    estimated_days: Mapped[int] = mapped_column(Integer,nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean,default=True)

    #----------------------RelationShip

    shipments: Mapped[list["Shipment"]] = relationship("Shipment", back_populates="carrier", cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Carrier {self.id}: {self.name}>'

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "code": self.code,
            "tracking_url_template": self.tracking_url_template,
            "estimated_days": self.estimated_days,
            "is_active": self.is_active,           
        }
