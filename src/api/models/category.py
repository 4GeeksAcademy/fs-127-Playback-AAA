from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import JSON
from api.models import db

class Category(db.Model):
    __tablename__ = 'category'

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[dict] = mapped_column(JSON, nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[dict] = mapped_column(JSON, nullable=True)
    image_url: Mapped[str] = mapped_column(String(255), nullable=True)
    position: Mapped[int] = mapped_column(default=0, nullable=False)

    # ---------------------- Relationship
    subcategories: Mapped[list["Subcategory"]] = relationship(
        "Subcategory", back_populates="category", cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Category {self.id}: {self.name}>'

    def serialize(self, locale="es"):
        return {
            "id": self.id,
            "name": self.name.get(locale) or self.name.get("es"),
            "slug": self.slug,
            "description": self.description.get(locale) if self.description else None,
            "image_url": self.image_url,
            "position": self.position,
        }