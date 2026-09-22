from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.contract import Contract


async def create_contract(
    db: AsyncSession,
    contract: Contract,
) -> Contract:
    db.add(contract)
    await db.commit()
    await db.refresh(contract)
    return contract


async def get_contract_by_id(
    db: AsyncSession,
    contract_id: UUID,
) -> Contract | None:
    result = await db.execute(select(Contract).where(Contract.id == contract_id))
    return result.scalar_one_or_none()


async def get_contracts_by_farmer(
    db: AsyncSession,
    farmer_id: UUID,
) -> list[Contract]:
    result = await db.execute(
        select(Contract).where(Contract.farmer_id == farmer_id).order_by(Contract.created_at.desc())
    )
    return list(result.scalars().all())


async def get_open_contracts(
    db: AsyncSession,
) -> list[Contract]:
    result = await db.execute(
        select(Contract).where(Contract.status == "OPEN").order_by(Contract.created_at.desc())
    )
    return list(result.scalars().all())


async def get_contracts_by_buyer(
    db: AsyncSession,
    buyer_id: UUID,
) -> list[Contract]:
    result = await db.execute(
        select(Contract).where(Contract.buyer_id == buyer_id).order_by(Contract.created_at.desc())
    )
    return list(result.scalars().all())


async def update_contract(
    db: AsyncSession,
    contract: Contract,
) -> Contract:
    await db.commit()
    await db.refresh(contract)
    return contract


async def delete_contract(
    db: AsyncSession,
    contract: Contract,
) -> None:
    await db.delete(contract)
    await db.commit()
