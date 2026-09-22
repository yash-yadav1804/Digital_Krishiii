import argparse
import asyncio
import sys
from datetime import date
from decimal import Decimal

from sqlalchemy import select

from app.core.security import hash_password
from app.db.models.buyer_profile import BuyerProfile
from app.db.models.contract import Contract
from app.db.models.contract_bid import ContractBid
from app.db.models.crop import Crop
from app.db.models.farmer_profile import FarmerProfile
from app.db.models.land import Land
from app.db.models.role import Role
from app.db.models.user import User
from app.db.models.user_role import UserRole
from app.db.seed import seed_default_roles
from app.db.session import async_session_factory


DEMO_USERS = {
    "farmer": ("farmer.demo@example.com", "DemoFarmer123!"),
    "buyer": ("buyer.demo@example.com", "DemoBuyer123!"),
    "admin": ("admin.demo@example.com", "DemoAdmin123!"),
}


async def get_or_create_user(session, email: str, password: str) -> User:
    result = await session.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if user:
        return user

    user = User(email=email, password_hash=hash_password(password), is_active=True)
    session.add(user)
    await session.flush()
    return user


async def assign_role(session, user: User, role_name: str) -> None:
    role = await session.scalar(select(Role).where(Role.name == role_name))
    if role is None:
        raise RuntimeError(f"Role {role_name!r} is missing")

    existing = await session.scalar(
        select(UserRole).where(UserRole.user_id == user.id, UserRole.role_id == role.id)
    )
    if existing is None:
        session.add(UserRole(user_id=user.id, role_id=role.id))


async def seed_demo_data() -> None:
    async with async_session_factory() as session:
        await seed_default_roles(session)

        farmer_email, farmer_password = DEMO_USERS["farmer"]
        buyer_email, buyer_password = DEMO_USERS["buyer"]
        admin_email, admin_password = DEMO_USERS["admin"]

        farmer = await get_or_create_user(session, farmer_email, farmer_password)
        buyer = await get_or_create_user(session, buyer_email, buyer_password)
        admin = await get_or_create_user(session, admin_email, admin_password)

        await assign_role(session, farmer, "farmer")
        await assign_role(session, buyer, "buyer")
        await assign_role(session, admin, "admin")

        farmer_profile = await session.scalar(
            select(FarmerProfile).where(FarmerProfile.user_id == farmer.id)
        )
        if farmer_profile is None:
            session.add(
                FarmerProfile(
                    user_id=farmer.id,
                    full_name="Ramesh Patel",
                    phone_number="+91 98765 12001",
                    village="Sehore",
                    district="Sehore",
                    state="Madhya Pradesh",
                    land_details="Wheat and soybean farm with drip irrigation and borewell backup.",
                )
            )

        buyer_profile = await session.scalar(
            select(BuyerProfile).where(BuyerProfile.user_id == buyer.id)
        )
        if buyer_profile is None:
            session.add(
                BuyerProfile(
                    user_id=buyer.id,
                    full_name="Neha Sharma",
                    company_name="Central Grain Procurement",
                    phone_number="+91 98765 12002",
                    city="Indore",
                    state="Madhya Pradesh",
                    business_description="Regional buyer sourcing wheat, soybean and pulses from verified farms.",
                )
            )

        existing_lands = (
            await session.scalars(select(Land).where(Land.farmer_id == farmer.id))
        ).all()
        if not existing_lands:
            north_field = Land(
                farmer_id=farmer.id,
                land_name="Sehore North Field",
                village="Sehore",
                district="Sehore",
                state="Madhya Pradesh",
                area_acres=Decimal("18.50"),
                soil_type="Black cotton soil",
                irrigation_type="Borewell + drip",
            )
            river_plot = Land(
                farmer_id=farmer.id,
                land_name="Riverbank Plot",
                village="Ashta",
                district="Sehore",
                state="Madhya Pradesh",
                area_acres=Decimal("11.25"),
                soil_type="Sandy loam",
                irrigation_type="Canal",
            )
            session.add_all([north_field, river_plot])
            await session.flush()
        else:
            north_field = existing_lands[0]
            river_plot = existing_lands[1] if len(existing_lands) > 1 else existing_lands[0]

        existing_crops = (
            await session.scalars(select(Crop).where(Crop.farmer_id == farmer.id))
        ).all()
        if not existing_crops:
            wheat = Crop(
                farmer_id=farmer.id,
                land_id=north_field.id,
                crop_name="Wheat",
                season="Rabi",
                sowing_date=date(2026, 11, 10),
                expected_harvest_date=date(2027, 3, 20),
                expected_yield=Decimal("92.00"),
            )
            soybean = Crop(
                farmer_id=farmer.id,
                land_id=river_plot.id,
                crop_name="Soybean",
                season="Kharif",
                sowing_date=date(2026, 7, 5),
                expected_harvest_date=date(2026, 10, 5),
                expected_yield=Decimal("68.00"),
            )
            session.add_all([wheat, soybean])
            await session.flush()
        else:
            wheat = existing_crops[0]
            soybean = existing_crops[1] if len(existing_crops) > 1 else existing_crops[0]

        contracts = (
            await session.scalars(select(Contract).where(Contract.farmer_id == farmer.id))
        ).all()
        if not contracts:
            open_contract = Contract(
                farmer_id=farmer.id,
                land_id=north_field.id,
                crop_id=wheat.id,
                title="Sehore Premium Wheat Supply — Rabi 2027",
                description="Farm-gate wheat supply with moisture inspection, weighed pickup and a 15-day delivery window.",
                quantity=Decimal("92.00"),
                price_per_unit=Decimal("2450.00"),
                start_date=date(2027, 3, 20),
                end_date=date(2027, 4, 5),
                status="OPEN",
            )
            accepted_contract = Contract(
                farmer_id=farmer.id,
                buyer_id=buyer.id,
                land_id=river_plot.id,
                crop_id=soybean.id,
                title="Sehore Soybean Procurement — Kharif 2026",
                description="Bulk soybean procurement with quality grading at farm gate and buyer-arranged transport.",
                quantity=Decimal("68.00"),
                price_per_unit=Decimal("5150.00"),
                start_date=date(2026, 10, 5),
                end_date=date(2026, 10, 20),
                status="ACCEPTED",
            )
            session.add_all([open_contract, accepted_contract])
            await session.flush()
        else:
            open_contract = contracts[0]
            accepted_contract = contracts[1] if len(contracts) > 1 else contracts[0]

        existing_bid = await session.scalar(
            select(ContractBid).where(
                ContractBid.contract_id == open_contract.id,
                ContractBid.buyer_id == buyer.id,
            )
        )
        if existing_bid is None:
            session.add(
                ContractBid(
                    contract_id=open_contract.id,
                    buyer_id=buyer.id,
                    offered_quantity=Decimal("90.00"),
                    offered_price_per_unit=Decimal("2500.00"),
                    message="We can arrange farm-gate pickup within five days of harvest.",
                    status="PENDING",
                )
            )

        await session.commit()

        print("Demo data is ready.")
        print("Farmer:", farmer_email, "/", farmer_password)
        print("Buyer :", buyer_email, "/", buyer_password)
        print("Admin :", admin_email, "/", admin_password)
        print("Use the farmer account to review the contract and accept the buyer bid.")


if __name__ == "__main__":
    argparse.ArgumentParser(description="Seed realistic Digital Krishii demo data.").parse_args()

    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

    asyncio.run(seed_demo_data())
