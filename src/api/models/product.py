
from sqlalchemy import String, DateTime, Float, Integer, ForeignKey, Text,JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from api.models import db


class Product(db.Model):
    __tablename__ = 'product'
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[dict] = mapped_column(JSON, nullable=False)        
    description: Mapped[dict] = mapped_column(JSON, nullable=True) 
    price: Mapped[float] = mapped_column(Float(), nullable=False, default=0.0)
    image_url: Mapped[str] = mapped_column(Text(), nullable=True)
    size: Mapped[str] = mapped_column(String(), nullable=True)
    weight: Mapped[float] = mapped_column(Float(), nullable=True)
    stock: Mapped[int] = mapped_column(Integer(), nullable=False, default=0)
    discount: Mapped[float] = mapped_column(Float(), nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(), nullable=True)

    # ----------------------ForeignKey

    item_id: Mapped[int] = mapped_column(ForeignKey("item.id"), nullable=False)

    # ----------------------RelationShip
    item: Mapped["Item"] = relationship("Item", back_populates="products")
    order_details: Mapped[list["OrderDetail"]] = relationship(
        "OrderDetail", back_populates="product", cascade="all, delete-orphan")
    reviews: Mapped[list["Review"]] = relationship(
        "Review", back_populates="product", cascade="all, delete-orphan")
    favorites: Mapped[list["Favorite"]] = relationship(
        "Favorite", back_populates="product", cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Product {self.id}: {self.name}>'

    def serialize(self, locale="es"):  
        return {
            "id": self.id,
            "name": self.name.get(locale) or self.name.get("es"),
            "description": self.description.get(locale) if self.description else None,
            "price": self.price,
            "image_url": self.image_url,
            "size": self.size,
            "weight": self.weight,
            "stock": self.stock,
            "discount": self.discount,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "item": self.item.slug if self.item else None,
            "subcategory": self.item.subcategory.slug if self.item and self.item.subcategory else None,
            "category": self.item.subcategory.category.slug if self.item and self.item.subcategory and self.item.subcategory.category else None
        }

    def to_dict(self, locale="es"):  
        avg_rating = round(sum(r.rating for r in self.reviews) /
                           len(self.reviews), 1) if self.reviews else 0
        return {
            "id": self.id,
            "name": self.name.get(locale) or self.name.get("es"),
            "description": self.description.get(locale) if self.description else None,
            "price": self.price,
            "image_url": self.image_url,
            "size": self.size,
            "weight": self.weight,
            "stock": self.stock,
            "discount": self.discount,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "item": self.item.slug if self.item else None,
            "subcategory": self.item.subcategory.slug if self.item and self.item.subcategory else None,
            "category": self.item.subcategory.category.slug if self.item and self.item.subcategory and self.item.subcategory.category else None,
            "rating": avg_rating,
            "Review": len(self.reviews),
            "reviews": [
                {
                    "id": r.id,
                    "rating": r.rating,
                    "title": r.title,
                    "comment": r.comment,
                    "user": r.user.name if r.user else None,
                    "created_at": r.created_at.isoformat() if r.created_at else None,
                }
                for r in self.reviews if r.is_visible
            ],
        }
