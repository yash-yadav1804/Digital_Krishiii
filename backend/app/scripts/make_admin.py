import argparse
import asyncio
import sys

from sqlalchemy import select

from app.db.models.role import Role
from app.db.models.user import User
from app.db.models.user_role import UserRole
from app.db.session import async_session_factory


async def make_admin(user_email: str) -> None:
    normalized_email = user_email.strip().lower()

    async with async_session_factory() as session:
        user_result = await session.execute(
            select(User).where(User.email == normalized_email)
        )
        user = user_result.scalar_one_or_none()

        if user is None:
            print(f"User not found: {normalized_email}")
            return

        role_result = await session.execute(select(Role).where(Role.name == "admin"))
        admin_role = role_result.scalar_one_or_none()

        if admin_role is None:
            print("Admin role does not exist. Start the API once so default roles are seeded.")
            return

        existing_assignment = await session.execute(
            select(UserRole).where(
                UserRole.user_id == user.id,
                UserRole.role_id == admin_role.id,
            )
        )

        if existing_assignment.scalar_one_or_none() is not None:
            print(f"{normalized_email} already has the admin role.")
            return

        session.add(UserRole(user_id=user.id, role_id=admin_role.id))
        await session.commit()
        print(f"Admin role assigned to {normalized_email}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Assign the admin role to an existing user.")
    parser.add_argument("email", help="Email address of the existing user")
    args = parser.parse_args()

    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

    asyncio.run(make_admin(args.email))
