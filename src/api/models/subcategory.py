from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from api.models import db


class Subcategory(db.Model):
    __tablename__ = 'subcategory'

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(80), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(String(500), nullable=True)
    image_url: Mapped[str] = mapped_column(String(255), nullable=True)
    position: Mapped[int] = mapped_column(default=0, nullable=False)

   # ----------------------ForeignKey

    category_id: Mapped[int] = mapped_column(
        ForeignKey("category.id"), nullable=False)

   # ----------------------RelationShip

    category: Mapped["Category"] = relationship(
        "Category", back_populates="subcategories")
    items: Mapped[list["Item"]] = relationship(
        "Item", back_populates="subcategory", cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Subcategory {self.id}: {self.name}>'

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "slug": self.slug,
            "description": self.description,
            "image_url": self.image_url,
            "position": self.position,
            "category_slug": self.category.slug if self.category else None
        }
