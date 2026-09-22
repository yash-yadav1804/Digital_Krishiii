from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import require_role
from app.db.models.user import User
from app.db.session import get_db
from app.schemas.equipment_request import (
    EquipmentRequestCreate,
    EquipmentRequestResponse,
    EquipmentRequestUpdate,
)
from app.services.equipment_request_service import EquipmentRequestService

router = APIRouter(prefix="/equipment-requests", tags=["Equipment Requests"])


def get_request_service(db: AsyncSession = Depends(get_db)) -> EquipmentRequestService:
    return EquipmentRequestService(db)


@router.post("", response_model=EquipmentRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_equipment_request(
    data: EquipmentRequestCreate,
    current_user: User = Depends(require_role("farmer")),
    service: EquipmentRequestService = Depends(get_request_service),
):
    return await service.create(farmer_id=current_user.id, data=data)


@router.get("/mine", response_model=list[EquipmentRequestResponse])
async def list_my_equipment_requests(
    current_user: User = Depends(require_role("farmer")),
    service: EquipmentRequestService = Depends(get_request_service),
):
    return await service.get_mine(current_user.id)


@router.get("/equipment/{equipment_id}", response_model=list[EquipmentRequestResponse])
async def list_equipment_requests(
    equipment_id: UUID,
    current_user: User = Depends(require_role("equipment_provider")),
    service: EquipmentRequestService = Depends(get_request_service),
):
    return await service.get_for_equipment(equipment_id=equipment_id, provider_id=current_user.id)


@router.patch("/{request_id}", response_model=EquipmentRequestResponse)
async def update_equipment_request(
    request_id: UUID,
    data: EquipmentRequestUpdate,
    current_user: User = Depends(require_role("equipment_provider")),
    service: EquipmentRequestService = Depends(get_request_service),
):
    return await service.update(request_id=request_id, provider_id=current_user.id, data=data)
