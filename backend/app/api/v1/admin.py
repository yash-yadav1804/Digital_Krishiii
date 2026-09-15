from uuid import UUID

from fastapi import APIRouter, Depends, status

from app.api.dependencies import require_role
from app.db.models.user import User
from app.schemas.admin import (
    AdminUserResponse,
    UpdateUserStatusRequest,
)
from app.services.user_service import UserService
from app.api.dependencies import get_user_service

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)


@router.get(
    "/ping",
    dependencies=[Depends(require_role("admin"))],
)
async def admin_ping():
    return {"message": "admin access granted"}


@router.get(
    "/users",
    response_model=list[AdminUserResponse],
    dependencies=[Depends(require_role("admin"))],
)
async def list_users(
    user_service: UserService = Depends(get_user_service),
):
    users = await user_service.get_all_users()

    response = []

    for user in users:
        response.append(
            AdminUserResponse(
                id=user.id,
                email=user.email,
                is_active=user.is_active,
                roles=[role.name for role in user.roles],
            )
        )

    return response


@router.patch(
    "/users/{user_id}/status",
    dependencies=[Depends(require_role("admin"))],
)
async def update_user_status(
    user_id: UUID,
    request: UpdateUserStatusRequest,
    current_user: User = Depends(require_role("admin")),
    user_service: UserService = Depends(get_user_service),
):
    await user_service.update_user_status(
        current_user_id=current_user.id,
        target_user_id=user_id,
        is_active=request.is_active,
    )

    return {
        "message": "user status updated",
    }


@router.post(
    "/users/{user_id}/roles/{role_name}",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(require_role("admin"))],
)
async def assign_role(
    user_id: UUID,
    role_name: str,
    user_service: UserService = Depends(get_user_service),
):
    await user_service.assign_role_to_user(
        user_id=user_id,
        role_name=role_name,
    )

    return {
        "message": "Role assigned successfully",
    }


@router.delete(
    "/users/{user_id}/roles/{role_name}",
    status_code=status.HTTP_200_OK,
)
async def remove_role(
    user_id: UUID,
    role_name: str,
    current_user: User = Depends(require_role("admin")),
    user_service: UserService = Depends(get_user_service),
):
    await user_service.remove_role_from_user(
        current_user_id=current_user.id,
        target_user_id=user_id,
        role_name=role_name,
    )

    return {
        "message": "Role removed successfully",
    }
