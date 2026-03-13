from sqlalchemy import String, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from api.models import db

class Subcategory(db.Model):
    __tablename__ = 'subcategory'

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[dict] = mapped_column(JSON, nullable=False)
    slug: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[dict] = mapped_column(JSON, nullable=True)
    image_url: Mapped[str] = mapped_column(String(255), nullable=True)
    position: Mapped[int] = mapped_column(default=0, nullable=False)

    # ---------------------- ForeignKey
    category_id: Mapped[int] = mapped_column(
        ForeignKey("category.id"), nullable=False)

    # ---------------------- Relationship
    category: Mapped["Category"] = relationship(
        "Category", back_populates="subcategories")
    items: Mapped[list["Item"]] = relationship(
        "Item", back_populates="subcategory", cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Subcategory {self.id}: {self.name}>'

    def serialize(self, locale="es"):
        return {
            "id": self.id,
            "name": self.name.get(locale) or self.name.get("es"),
            "slug": self.slug,
            "description": self.description.get(locale) if self.description else None,
            "image_url": self.image_url,
            "position": self.position,
            "category_slug": self.category.slug if self.category else None
        }