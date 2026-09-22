from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user, require_role
from app.db.models.user import User
from app.db.session import get_db
from app.schemas.support_ticket import (
    SupportTicketAdminUpdate,
    SupportTicketCreate,
    SupportTicketResponse,
)
from app.services.support_ticket_service import SupportTicketService

router = APIRouter(prefix="/support", tags=["Support"])


def get_support_service(db: AsyncSession = Depends(get_db)) -> SupportTicketService:
    return SupportTicketService(db)


@router.post("", response_model=SupportTicketResponse, status_code=status.HTTP_201_CREATED)
async def create_ticket(
    data: SupportTicketCreate,
    current_user: User = Depends(get_current_user),
    service: SupportTicketService = Depends(get_support_service),
):
    return await service.create(user_id=current_user.id, data=data)


@router.get("/mine", response_model=list[SupportTicketResponse])
async def list_my_tickets(
    current_user: User = Depends(get_current_user),
    service: SupportTicketService = Depends(get_support_service),
):
    return await service.get_mine(current_user.id)


@router.get("/all", response_model=list[SupportTicketResponse])
async def list_all_tickets_admin(
    current_user: User = Depends(require_role("admin")),
    service: SupportTicketService = Depends(get_support_service),
):
    return await service.get_all()


@router.patch("/{ticket_id}", response_model=SupportTicketResponse)
async def admin_update_ticket(
    ticket_id: UUID,
    data: SupportTicketAdminUpdate,
    current_user: User = Depends(require_role("admin")),
    service: SupportTicketService = Depends(get_support_service),
):
    return await service.update_by_admin(ticket_id=ticket_id, data=data)
