from sqlalchemy import String, Integer, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from api.models import db

    
class Carrier(db.Model):
    __tablename__ = "carriers"

    id: Mapped[int] = mapped_column(primary_key=True)

    name: Mapped[str] = mapped_column(String(100), nullable=False)

    code: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False
    )

    tracking_url_template: Mapped[str] = mapped_column(
        String(255),
        nullable=True
    )

    estimated_days: Mapped[int] = mapped_column(
        Integer,
        nullable=True
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True
    )
