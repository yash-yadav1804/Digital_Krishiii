from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.db.models.user import User
from app.db.session import get_db
from app.schemas.contract import (
    ContractCreate,
    ContractResponse,
    ContractUpdate,
)
from app.services.contract_service import (
    create_contract,
    delete_contract,
    get_contract,
    get_farmer_contracts,
    get_open_contracts,
    update_contract,
)

router = APIRouter(
    prefix="/contracts",
    tags=["Contracts"],
)


@router.post(
    "",
    response_model=ContractResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_contract_route(
    data: ContractCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await create_contract(
        db=db,
        farmer_id=current_user.id,
        data=data,
    )


@router.get(
    "/mine",
    response_model=list[ContractResponse],
)
async def list_my_contracts_route(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await get_farmer_contracts(
        db=db,
        farmer_id=current_user.id,
    )


@router.get(
    "/open",
    response_model=list[ContractResponse],
)
async def list_open_contracts_route(
    db: AsyncSession = Depends(get_db),
):
    return await get_open_contracts(db=db)


@router.get(
    "/{contract_id}",
    response_model=ContractResponse,
)
async def get_contract_route(
    contract_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    return await get_contract(
        db=db,
        contract_id=contract_id,
    )


@router.patch(
    "/{contract_id}",
    response_model=ContractResponse,
)
async def update_contract_route(
    contract_id: UUID,
    data: ContractUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await update_contract(
        db=db,
        farmer_id=current_user.id,
        contract_id=contract_id,
        data=data,
    )


@router.delete(
    "/{contract_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_contract_route(
    contract_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await delete_contract(
        db=db,
        farmer_id=current_user.id,
        contract_id=contract_id,
    )
