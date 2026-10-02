from datetime import datetime,timezone

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id")
    )

    token_hash: Mapped[str] = mapped_column()

    expires_at: Mapped[datetime] = mapped_column()

    revoked: Mapped[bool] = mapped_column(default=False)

    created_at: Mapped[datetime] = mapped_column(
    default=lambda: datetime.now(timezone.utc)
)