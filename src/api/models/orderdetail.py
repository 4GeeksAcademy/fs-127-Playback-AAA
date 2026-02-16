from sqlalchemy import Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from api.models import db
from api.models.order import Order
from api.models.product import Product


class OrderDetail(db.Model):
    __tablename__ = "order_detail"

    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"),nullable=False)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"),nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)


    order_id: Mapped["Order"] = relationship(
        "Order",
        back_populates="orderdetail",
        uselist=False,
        cascade="all, delete-orphan"
    )

    
    product_id: Mapped["Product"] = relationship(
        "Product",
        back_populates="orderdetail",
        uselist=False,
        cascade="all, delete-orphan"
    )

    def serialize(self):
        return {
            "id": self.id,
            "order_id": self.order_id,
            "product_id": self.product_id,
            "quantity": self.quantity,   
        }