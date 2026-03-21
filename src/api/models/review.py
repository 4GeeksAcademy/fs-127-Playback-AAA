from sqlalchemy import String, Integer, Boolean, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
from api.models import db
from api.models.order import Order
from api.models.product import Product
from api.models.user import User


class Review(db.Model):
    __tablename__ = 'review'

    # Columnas
    id: Mapped[int] = mapped_column(primary_key=True)
    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=True)
    comment: Mapped[str] = mapped_column(String(2000), nullable=True)
    is_visible: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # ----------------------ForeignKey

    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)
    product_id: Mapped[int] = mapped_column(ForeignKey("product.id"), nullable=False)
    order_id: Mapped[int] = mapped_column(ForeignKey("order.id"), nullable=False)

    __table_args__ = (
        CheckConstraint('rating >= 1 AND rating <= 5', name='check_rating_range'),
    )

    # ----------------------RelationShip
    user: Mapped["User"] = relationship("User", back_populates="reviews")
    product: Mapped["Product"] = relationship("Product", back_populates="reviews")
    order: Mapped["Order"] = relationship("Order", back_populates="reviews")

    def __repr__(self):
        return f'<Review {self.id}: {self.rating}/5 - User {self.user_id} Product {self.product_id}>'

    def serialize(self):
        return {
            "id": self.id,
            "rating": self.rating,
            "title": self.title,
            "comment": self.comment,
            "is_visible": self.is_visible,
            "user_id": self.user_id,
            "product_id": self.product_id,
            "order_id": self.order_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
