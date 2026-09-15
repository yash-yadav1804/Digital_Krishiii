from uuid import UUID

from fastapi import APIRouter, Depends, status

from app.api.dependencies import get_user_service, require_role
from app.db.models.user import User
from app.schemas.admin import AdminUserResponse, UpdateUserStatusRequest
from app.services.user_service import UserService

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)


@router.get(
    "/ping",
)
async def admin_ping(
    current_user: User = Depends(require_role("admin")),
):
    return {
        "message": "Welcome to the admin area",
        "user_id": str(current_user.id),
    }


@router.get(
    "/users",
    response_model=list[AdminUserResponse],
    dependencies=[Depends(require_role("admin"))],
)
async def list_users(
    user_service: UserService = Depends(get_user_service),
):
    users = await user_service.get_all_users()

    return [
        AdminUserResponse(
            id=user.id,
            email=user.email,
            is_active=user.is_active,
            roles=[role.name for role in user.roles],
        )
        for user in users
    ]


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
        "user_id": str(user_id),
        "is_active": request.is_active,
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
        "user_id": str(user_id),
        "role": role_name,
    }


@router.delete(
    "/users/{user_id}/roles/{role_name}",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(require_role("admin"))],
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
        "user_id": str(user_id),
        "role": role_name,
    }
