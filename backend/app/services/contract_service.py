from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.contract import Contract
from app.repositories import contract_repository
from app.repositories.crop_repository import get_crop_by_id
from app.repositories.land_repository import get_land_by_id
from app.schemas.contract import ContractCreate, ContractUpdate


async def create_contract(
    db: AsyncSession,
    farmer_id: UUID,
    data: ContractCreate,
) -> Contract:
    land = await get_land_by_id(
        db=db,
        land_id=data.land_id,
    )

    if land is None or land.farmer_id != farmer_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Land not found",
        )

    crop = await get_crop_by_id(
        db=db,
        crop_id=data.crop_id,
    )

    if crop is None or crop.farmer_id != farmer_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Crop not found",
        )

    if crop.land_id != data.land_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Crop does not belong to the selected land",
        )

    if data.end_date < data.start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End date must be after start date",
        )

    contract = Contract(
        farmer_id=farmer_id,
        land_id=data.land_id,
        crop_id=data.crop_id,
        title=data.title,
        description=data.description,
        quantity=data.quantity,
        price_per_unit=data.price_per_unit,
        start_date=data.start_date,
        end_date=data.end_date,
        status="OPEN",
    )

    return await contract_repository.create_contract(
        db=db,
        contract=contract,
    )


async def get_farmer_contracts(
    db: AsyncSession,
    farmer_id: UUID,
) -> list[Contract]:
    return await contract_repository.get_contracts_by_farmer(
        db=db,
        farmer_id=farmer_id,
    )


async def get_open_contracts(
    db: AsyncSession,
) -> list[Contract]:
    return await contract_repository.get_open_contracts(db=db)


async def get_buyer_contracts(
    db: AsyncSession,
    buyer_id: UUID,
) -> list[Contract]:
    return await contract_repository.get_contracts_by_buyer(db=db, buyer_id=buyer_id)


async def get_contract(
    db: AsyncSession,
    contract_id: UUID,
) -> Contract:
    contract = await contract_repository.get_contract_by_id(
        db=db,
        contract_id=contract_id,
    )

    if contract is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contract not found",
        )

    return contract


async def update_contract(
    db: AsyncSession,
    farmer_id: UUID,
    contract_id: UUID,
    data: ContractUpdate,
) -> Contract:
    contract = await get_contract(
        db=db,
        contract_id=contract_id,
    )

    if contract.farmer_id != farmer_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You cannot update this contract",
        )

    changes = data.model_dump(exclude_unset=True)
    if "status" in changes and hasattr(changes["status"], "value"):
        changes["status"] = changes["status"].value

    allowed_transitions = {
        "OPEN": {"OPEN", "CANCELLED", "ACCEPTED", "NEGOTIATING"},
        "ACCEPTED": {"ACCEPTED", "NEGOTIATING", "COMPLETED", "CANCELLED"},
        "NEGOTIATING": {"NEGOTIATING", "ACCEPTED", "COMPLETED", "CANCELLED"},
        "ACTIVE": {"ACTIVE", "COMPLETED", "CANCELLED"},
        "PENDING": {"PENDING", "OPEN", "CANCELLED"},
        "COMPLETED": {"COMPLETED"},
        "CANCELLED": {"CANCELLED"},
        "REJECTED": {"REJECTED"},
    }
    if "status" in changes:
        next_status = changes["status"]
        if next_status not in allowed_transitions.get(contract.status, {contract.status}):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid contract status transition: {contract.status} -> {next_status}",
            )

    for field, value in changes.items():
        setattr(contract, field, value)

    if contract.end_date < contract.start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End date must be after start date",
        )

    return await contract_repository.update_contract(
        db=db,
        contract=contract,
    )


async def delete_contract(
    db: AsyncSession,
    farmer_id: UUID,
    contract_id: UUID,
) -> None:
    contract = await get_contract(
        db=db,
        contract_id=contract_id,
    )

    if contract.farmer_id != farmer_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You cannot delete this contract",
        )

    await contract_repository.delete_contract(
        db=db,
        contract=contract,
    )
