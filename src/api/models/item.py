from sqlalchemy import String, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from api.models import db

class Item(db.Model):
    __tablename__ = 'item'

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[dict] = mapped_column(JSON, nullable=False)
    slug: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[dict] = mapped_column(JSON, nullable=True)
    image_url: Mapped[str] = mapped_column(String(255), nullable=True)
    position: Mapped[int] = mapped_column(default=0, nullable=False)

    # ---------------------- ForeignKey
    subcategory_id: Mapped[int] = mapped_column(
        ForeignKey("subcategory.id"), nullable=False)

    # ---------------------- Relationship
    subcategory: Mapped["Subcategory"] = relationship(
        "Subcategory", back_populates="items")
    products: Mapped[list["Product"]] = relationship(
        "Product", back_populates="item", cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Item {self.id}: {self.name}>'

    def serialize(self, locale="es"):
        return {
            "id": self.id,
            "name": self.name.get(locale) or self.name.get("es"),
            "slug": self.slug,
            "description": self.description.get(locale) if self.description else None,
            "image_url": self.image_url,
            "position": self.position,
            "subcategory_slug": self.subcategory.slug if self.subcategory else None,
            "category_slug": self.subcategory.category.slug if self.subcategory and self.subcategory.category else None
        }