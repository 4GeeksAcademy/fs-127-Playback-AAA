
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column,relationship
from api.models import db

class Category(db.Model):
    __tablename__ = 'category'

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(80), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[str] = mapped_column(String(500), nullable=False)
    image_url: Mapped[str] = mapped_column(String(255), nullable=True)
    position: Mapped[int] = mapped_column(default=0, nullable=False)

    #----------------------RelationShip

    subcategories: Mapped[list["Subcategory"]] = relationship("Subcategory", back_populates="category", cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Category {self.id}: {self.name}>'

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "slug": self.slug,
            "description": self.description,
            "image_url": self.image_url,
            "position": self.position,
            }


