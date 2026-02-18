
from sqlalchemy import String,DateTime, Float,Integer,ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from api.models import db
from api.models.category import Category


class Product(db.Model):
    __tablename__ = 'product'
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(String(1000), nullable=True)
    price: Mapped[float] = mapped_column(Float(), nullable=False, default=0.0)
    image_url: Mapped[str] = mapped_column(String(500), nullable=True)
    code_product: Mapped[int] = mapped_column(Integer(), nullable=False,unique=True) 
    size: Mapped[str] = mapped_column(String(), nullable=True)
    weight: Mapped[float] = mapped_column(Float(), nullable=True)
    stock: Mapped[int] = mapped_column(Integer(), nullable=False, default=0)
    discount: Mapped[float] = mapped_column(Float(), nullable=False, default=0)
    create_at:Mapped[datetime] = mapped_column(DateTime(), nullable=False, default=0)

   #----------------------ForeignKey

    category_id: Mapped[int] = mapped_column(ForeignKey("category.id"), nullable=False)

    #----------------------RelationShip
    category: Mapped["Category"] = relationship("Category", back_populates="products")
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
            "code_product": self.code_product,
            "size": self.size,
            "weight": self.weight,
            "stock": self.stock,
            "discount": self.discount,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
    
    def serialize_with_categoria_id(self):
        data = self.serialize()
        data["category"] = self.categoria_id.serialize() if self.categoria_id else None
        return data