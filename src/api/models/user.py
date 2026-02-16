import bcrypt
from sqlalchemy import String, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from api.models import db

class User(db.Model):
    __tablename__='users'

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[string] = mapped_column (string(80), unique=False, nullable=False)
    last_name: Mapped[string] = mapped 