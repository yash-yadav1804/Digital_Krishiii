from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions.user import UserAlreadyExistsError
from app.core.security import verify_password
from app.core.security.password import hash_password
from app.db.models.role import Role
from app.db.models.user import User
from app.db.models.user_role import UserRole
from app.repositories.role_repository import RoleRepository
from app.repositories.user_repository import UserRepository
from app.repositories.user_role_repository import UserRoleRepository


class UserService:
    def __init__(self, session: AsyncSession):
        self.session = session

        self.user_repository = UserRepository(session)
        self.role_repository = RoleRepository(session)
        self.user_role_repository = UserRoleRepository(session)

    async def register_user(
        self,
        email: str,
        password: str,
        role_name: str = "farmer",
    ) -> User:
        normalized_email = email.strip().lower()
        normalized_role_name = role_name.strip().lower()

        allowed_registration_roles = {
            "farmer",
            "buyer",
            "contractor",
        }

        if normalized_role_name not in allowed_registration_roles:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=("Invalid role. Allowed registration roles are: farmer, buyer, contractor"),
            )

        existing_user = await self.user_repository.get_by_email(normalized_email)

        if existing_user is not None:
            raise UserAlreadyExistsError("Email is already registered")

        user = User(
            email=normalized_email,
            password_hash=hash_password(password),
            is_active=True,
        )

        self.session.add(user)
        await self.session.flush()

        role = await self.role_repository.find_by_name(normalized_role_name)

        if role is None:
            raise RuntimeError(f"Role '{normalized_role_name}' is not configured")

        await self.user_role_repository.assign_role(
            user_id=user.id,
            role_id=role.id,
        )

        await self.session.commit()

        # Return a role-loaded user so FastAPI does not trigger an async lazy load
        # while serializing the registration response.
        registered_user = await self.user_repository.get_by_id(user.id)
        if registered_user is None:
            raise RuntimeError("Registered user could not be loaded")

        return registered_user

    async def authenticate_user(
        self,
        email: str,
        password: str,
    ) -> User:
        normalized_email = email.strip().lower()

        result = await self.session.execute(select(User).where(User.email == normalized_email))

        user = result.scalar_one_or_none()

        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        if not verify_password(
            password,
            user.password_hash,
        ):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive",
            )

        return user

    async def get_all_users(self) -> list[User]:
        return await self.user_repository.get_all()

    async def user_has_role(
        self,
        user_id: UUID,
        role_name: str,
    ) -> bool:
        normalized_role_name = role_name.strip().lower()

        result = await self.session.execute(
            select(UserRole)
            .join(Role, Role.id == UserRole.role_id)
            .where(
                UserRole.user_id == user_id,
                func.lower(Role.name) == normalized_role_name,
            )
        )

        return result.scalar_one_or_none() is not None

    async def assign_role_to_user(
        self,
        user_id: UUID,
        role_name: str,
    ) -> bool:
        normalized_role_name = role_name.strip().lower()

        user = await self.user_repository.get_by_id(user_id)

        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        role = await self.role_repository.find_by_name(normalized_role_name)

        if role is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Role not found",
            )

        existing_assignment_result = await self.session.execute(
            select(UserRole).where(
                UserRole.user_id == user_id,
                UserRole.role_id == role.id,
            )
        )

        existing_assignment = existing_assignment_result.scalar_one_or_none()

        if existing_assignment is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User already has this role",
            )

        await self.user_role_repository.assign_role(
            user_id=user_id,
            role_id=role.id,
        )

        await self.session.commit()

        return True

    async def remove_role_from_user(
        self,
        current_user_id: UUID,
        target_user_id: UUID,
        role_name: str,
    ) -> bool:
        normalized_role_name = role_name.strip().lower()

        if current_user_id == target_user_id and normalized_role_name == "admin":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An admin cannot remove their own admin role",
            )

        target_user = await self.user_repository.get_by_id(target_user_id)

        if target_user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        role_result = await self.session.execute(
            select(Role).where(func.lower(Role.name) == normalized_role_name)
        )

        role = role_result.scalar_one_or_none()

        if role is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Role not found",
            )

        assignment_result = await self.session.execute(
            select(UserRole).where(
                UserRole.user_id == target_user_id,
                UserRole.role_id == role.id,
            )
        )

        assignment = assignment_result.scalar_one_or_none()

        if assignment is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User does not have this role",
            )

        await self.session.delete(assignment)
        await self.session.commit()

        return True

    async def update_user_status(
        self,
        current_user_id: UUID,
        target_user_id: UUID,
        is_active: bool,
    ) -> User:
        if current_user_id == target_user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An admin cannot deactivate their own account",
            )

        user = await self.user_repository.get_by_id(target_user_id)

        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        user.is_active = is_active

        await self.session.commit()
        await self.session.refresh(user)

        return user
