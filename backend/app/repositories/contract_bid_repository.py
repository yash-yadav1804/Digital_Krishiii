from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.contract_bid import ContractBid


async def create_bid(
    db: AsyncSession,
    bid: ContractBid,
) -> ContractBid:
    db.add(bid)
    await db.commit()
    await db.refresh(bid)
    return bid


async def get_bid_by_id(
    db: AsyncSession,
    bid_id: UUID,
) -> ContractBid | None:
    result = await db.execute(select(ContractBid).where(ContractBid.id == bid_id))
    return result.scalar_one_or_none()


async def get_bids_by_buyer(
    self,
    buyer_id: int,
) -> list[ContractBid]:
    result = await self.db.execute(
        select(ContractBid).where(ContractBid.buyer_id == buyer_id).order_by(ContractBid.id.desc())
    )
    return list(result.scalars().all())


async def get_bids_by_contract(
    db: AsyncSession,
    contract_id: UUID,
) -> list[ContractBid]:
    result = await db.execute(select(ContractBid).where(ContractBid.contract_id == contract_id))

    return list(result.scalars().all())


async def update_bid(
    db: AsyncSession,
    bid: ContractBid,
) -> ContractBid:
    await db.commit()
    await db.refresh(bid)
    return bid
