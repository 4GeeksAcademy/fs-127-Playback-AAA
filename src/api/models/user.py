import bcrypt
import enum
from sqlalchemy import String, Boolean, DateTime, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
from api.models import db


# ─── Enums ──────

class RoleName(enum.Enum):
    buyer  = "buyer"
    seller = "seller"
    admin  = "admin"


# Permisos asociados a cada rol
ROLE_PERMISSIONS = {
    RoleName.buyer: [
        "order:view",
    ],
    RoleName.seller: [
        "product:create",
        "product:edit",
        "product:delete",
        "order:view",
    ],
    RoleName.admin: [
        "product:create",
        "product:edit",
        "product:delete",
        "order:view",
        "order:manage",
        "user:manage",
        "role:manage",
    ],
}


class User(db.Model):

    __tablename__ = 'user'

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(80), nullable=False)
    last_name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    image_url: Mapped[str] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean(), default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(), default=datetime.now(timezone.utc))
    role: Mapped[RoleName] = mapped_column(Enum(RoleName), nullable=True, default=RoleName.buyer)

    #----------------------RelationShip

    addresses: Mapped[list["Address"]] = relationship("Address", back_populates="user", cascade="all, delete-orphan")
    orders: Mapped[list["Order"]] = relationship("Order", back_populates="user", cascade="all, delete-orphan")
    reviews: Mapped[list["Review"]] = relationship("Review", back_populates="user", cascade="all, delete-orphan")
    incidents: Mapped[list["Incident"]] = relationship("Incident", back_populates="user", cascade="all, delete-orphan")
    favorites: Mapped[list["Favorite"]] = relationship("Favorite", back_populates="user", cascade="all, delete-orphan")
    seller: Mapped["Seller"] = relationship("Seller", back_populates="user", uselist=False, cascade="all, delete-orphan")

    def set_password(self, password):
        """Hashea un password en texto plano y lo almacena."""
        password_bytes = password.encode('utf-8')
        hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
        self.password = hashed.decode('utf-8')

    def check_password(self, password):
        """Verifica un password en texto plano contra el hash almacenado."""
        password_bytes = password.encode('utf-8')
        hashed_bytes = self.password.encode('utf-8')
        return bcrypt.checkpw(password_bytes, hashed_bytes)

    def get_permissions(self):
        """Devuelve la lista de permisos del rol actual."""
        return ROLE_PERMISSIONS.get(self.role, [])

    def __repr__(self):
        return f'<User {self.id}: {self.email}>'

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "last_name": self.last_name,
            "email": self.email,
            "image_url": self.image_url,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "role": self.role.value if self.role else None,
            "permissions": self.get_permissions()
        }