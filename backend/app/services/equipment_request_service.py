from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.equipment_request import EquipmentRequest
from app.repositories.equipment_repository import EquipmentRepository
from app.repositories.equipment_request_repository import EquipmentRequestRepository
from app.schemas.equipment_request import (
    EquipmentRequestCreate,
    EquipmentRequestStatus,
    EquipmentRequestUpdate,
)
from app.services.notification_service import create_notification


class EquipmentRequestService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.equipment = EquipmentRepository(db)
        self.requests = EquipmentRequestRepository(db)

    async def create(self, *, farmer_id: UUID, data: EquipmentRequestCreate) -> EquipmentRequest:
        equipment = await self.equipment.get_by_id(data.equipment_id)
        if equipment is None or not equipment.is_available:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Available equipment not found")
        if equipment.provider_id == farmer_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot request your own equipment")
        request = EquipmentRequest(farmer_id=farmer_id, **data.model_dump(), status="PENDING")
        create_notification(
            self.db, user_id=equipment.provider_id, title="New equipment request",
            message=f"A farmer requested '{equipment.name}'.", notification_type="EQUIPMENT_REQUEST", related_id=equipment.id,
        )
        return await self.requests.create(request)

    async def get_mine(self, farmer_id: UUID) -> list[EquipmentRequest]:
        return await self.requests.get_by_farmer(farmer_id)

    async def get_for_equipment(self, *, equipment_id: UUID, provider_id: UUID) -> list[EquipmentRequest]:
        equipment = await self.equipment.get_by_id(equipment_id)
        if equipment is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Equipment not found")
        if equipment.provider_id != provider_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have permission to view these requests")
        return await self.requests.get_by_equipment(equipment_id)

    async def update(self, *, request_id: UUID, provider_id: UUID, data: EquipmentRequestUpdate) -> EquipmentRequest:
        request = await self.requests.get_by_id(request_id)
        if request is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Equipment request not found")
        equipment = await self.equipment.get_by_id(request.equipment_id)
        if equipment is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Equipment not found")
        if equipment.provider_id != provider_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have permission to update this request")
        if request.status != "PENDING":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only pending equipment requests can be updated")
        if data.status not in {EquipmentRequestStatus.ACCEPTED, EquipmentRequestStatus.REJECTED}:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Status must be ACCEPTED or REJECTED")
        request.status = data.status.value
        create_notification(
            self.db, user_id=request.farmer_id, title=f"Equipment request {data.status.value.lower()}",
            message=f"Your request for '{equipment.name}' was {data.status.value.lower()}.", notification_type="EQUIPMENT_REQUEST_DECISION", related_id=equipment.id,
        )
        return await self.requests.update(request)
