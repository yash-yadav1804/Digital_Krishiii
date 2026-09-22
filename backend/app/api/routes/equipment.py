from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user, require_role
from app.db.models.user import User
from app.db.session import get_db
from app.schemas.equipment import (
    EquipmentCreate,
    EquipmentResponse,
    EquipmentUpdate,
)
from app.services.equipment_service import EquipmentService

router = APIRouter(prefix="/equipment", tags=["Equipment"])


def get_equipment_service(db: AsyncSession = Depends(get_db)) -> EquipmentService:
    return EquipmentService(db)


@router.post("", response_model=EquipmentResponse, status_code=status.HTTP_201_CREATED)
async def create_equipment(
    data: EquipmentCreate,
    current_user: User = Depends(require_role("equipment_provider")),
    service: EquipmentService = Depends(get_equipment_service),
):
    return await service.create(provider_id=current_user.id, data=data)


@router.get("/available", response_model=list[EquipmentResponse])
async def list_available_equipment(
    current_user: User = Depends(get_current_user),
    service: EquipmentService = Depends(get_equipment_service),
):
    return await service.get_available()


@router.get("/mine", response_model=list[EquipmentResponse])
async def list_my_equipment(
    current_user: User = Depends(require_role("equipment_provider")),
    service: EquipmentService = Depends(get_equipment_service),
):
    return await service.get_mine(current_user.id)


@router.patch("/{equipment_id}", response_model=EquipmentResponse)
async def update_equipment(
    equipment_id: UUID,
    data: EquipmentUpdate,
    current_user: User = Depends(require_role("equipment_provider")),
    service: EquipmentService = Depends(get_equipment_service),
):
    return await service.update(equipment_id=equipment_id, provider_id=current_user.id, data=data)


@router.delete("/{equipment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_equipment(
    equipment_id: UUID,
    current_user: User = Depends(require_role("equipment_provider")),
    service: EquipmentService = Depends(get_equipment_service),
):
    await service.delete(equipment_id=equipment_id, provider_id=current_user.id)
