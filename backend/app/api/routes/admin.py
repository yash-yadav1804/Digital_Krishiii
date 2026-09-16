from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.user import User
from app.api.dependencies import require_role

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)


@router.get("/users/")
async def get_all_users(
    db: AsyncSession = Depends(get_db),
    current_user: Annotated[
        User,
        Depends(require_role("admin")),
    ] = None,
):
    result = await db.execute(select(User))

    users = result.scalars().all()

    return [
        {
            "id": str(user.id),
            "email": user.email,
            "is_active": user.is_active,
        }
        for user in users
    ]
