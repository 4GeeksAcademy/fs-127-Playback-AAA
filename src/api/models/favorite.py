
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from api.models import db
from api.models.product import Product
from api.models.user import User


class Favorite(db.Model):
    __tablename__ = 'favorite'
    #preguntar is poner Integer
    id: Mapped[int] = mapped_column(primary_key=True)

    #----------------------ForeignKey

    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)
    product_id: Mapped[int] = mapped_column(ForeignKey("product.id"), nullable=False)

    #----------------------RelationShip
    
    user: Mapped["User"] = relationship("User", back_populates="favorites")
    product: Mapped["Product"] = relationship("Product", back_populates="favorites")


    def __repr__(self):
        return f'<Favorite {self.id}>'

    def serialize(self):
        return {
            "id": self.id       
            }
    
    def serialize_with_user_id(self):
        data = self.serialize()
        data["user"] = self.user_id.serialize() if self.user_id else None
        return data
    
    def serialize_with_product_id(self):
        data = self.serialize()
        data["product"] = self.product_id.serialize() if self.product_id else None
        return data


