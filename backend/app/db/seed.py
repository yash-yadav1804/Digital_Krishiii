from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.role import Role

DEFAULT_ROLES = [
    "admin",
    "farmer",
    "contractor",
    "equipment_provider",
    "input_supplier",
    "field_officer",
]


async def seed_default_roles(session: AsyncSession) -> None:
    result = await session.execute(select(Role).where(Role.name.in_(DEFAULT_ROLES)))

    existing_role_names = {role.name for role in result.scalars().all()}

    missing_roles = [
        Role(name=role_name)
        for role_name in DEFAULT_ROLES
        if role_name not in existing_role_names
    ]

    if missing_roles:
        session.add_all(missing_roles)
        await session.commit()
