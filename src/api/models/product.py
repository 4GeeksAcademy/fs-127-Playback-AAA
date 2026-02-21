
from sqlalchemy import String, DateTime, Float, Integer, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from api.models import db


class Product(db.Model):
    __tablename__ = 'product'
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(String(1000), nullable=True)
    price: Mapped[float] = mapped_column(Float(), nullable=False, default=0.0)
    image_url: Mapped[str] = mapped_column(Text(), nullable=True)
    size: Mapped[str] = mapped_column(String(), nullable=True)
    weight: Mapped[float] = mapped_column(Float(), nullable=True)
    stock: Mapped[int] = mapped_column(Integer(), nullable=False, default=0)
    discount: Mapped[float] = mapped_column(Float(), nullable=False, default=0)
    created_at:Mapped[datetime] = mapped_column(DateTime(), nullable=True)

    #----------------------ForeignKey

    item_id: Mapped[int] = mapped_column(ForeignKey("item.id"), nullable=False)

    #----------------------RelationShip
    item: Mapped["Item"] = relationship("Item", back_populates="products")
    order_details: Mapped[list["OrderDetail"]] = relationship("OrderDetail", back_populates="product", cascade="all, delete-orphan")
    reviews: Mapped[list["Review"]] = relationship("Review", back_populates="product", cascade="all, delete-orphan")
    favorites: Mapped[list["Favorite"]] = relationship("Favorite", back_populates="product", cascade="all, delete-orphan")


   
    def __repr__(self):
        return f'<Product {self.id}: {self.name}>'

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "price": self.price,
            "image_url": self.image_url,
            "size": self.size,
            "weight": self.weight,
            "stock": self.stock,
            "discount": self.discount,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "item": self.item.slug if self.item else None,
            "subcategory": self.subcategory.slug if self.subcategory else None,
            "category": self.subcategory.category.slug if self.subcategory and self.subcategory.category else None
        }
    
    def to_dict(self):
        avg_rating = round(sum(r.rating for r in self.reviews) / len(self.reviews), 1) if self.reviews else 0
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "price": self.price,
            "image_url": self.image_url,
            "size": self.size,
            "weight": self.weight,
            "stock": self.stock,
            "discount": self.discount,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "rating": avg_rating,        # promedio calculado de todas sus reviews
            "Review": len(self.reviews), # cantidad de reviews
        }
