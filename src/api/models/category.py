
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column,relationship
from api.models import db

class Category(db.Model):
    __tablename__ = 'category'

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(80), nullable=False)
    description: Mapped[str] = mapped_column(String(500), nullable=False)

    #----------------------RelationShip

    products: Mapped[list["Product"]] = relationship("Product", back_populates="category", cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Category {self.id}: {self.name}>'

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            }


