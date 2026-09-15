import asyncio
import sys
from sqlalchemy import select

from app.db.models.role import Role
from app.db.models.user import User
from app.db.models.user_role import UserRole
from app.db.session import async_session_factory

USER_EMAIL = "farmer1@example.com"


async def make_admin() -> None:
    async with async_session_factory() as session:
        user_result = await session.execute(
            select(User).where(User.email == USER_EMAIL)
        )
        user = user_result.scalar_one_or_none()

        if user is None:
            print(f"User not found: {USER_EMAIL}")
            return

        role_result = await session.execute(select(Role).where(Role.name == "admin"))
        admin_role = role_result.scalar_one_or_none()

        if admin_role is None:
            print("Admin role does not exist.")
            return

        existing_assignment = await session.execute(
            select(UserRole).where(
                UserRole.user_id == user.id,
                UserRole.role_id == admin_role.id,
            )
        )

        if existing_assignment.scalar_one_or_none() is not None:
            print("User already has the admin role.")
            return

        session.add(
            UserRole(
                user_id=user.id,
                role_id=admin_role.id,
            )
        )

        await session.commit()
        print(f"Admin role assigned to {USER_EMAIL}")


if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

    asyncio.run(make_admin())
