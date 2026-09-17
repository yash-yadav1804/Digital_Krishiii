import pytest

from tests.test_contract_bids import create_contract


@pytest.mark.asyncio
async def test_unauthenticated_user_cannot_create_bid(
    client,
    auth_headers,
):
    contract_id = await create_contract(
        client=client,
        headers=auth_headers,
        title="Unauthenticated Bid Test Contract",
    )

    response = await client.post(
        "/contract-bids",
        json={
            "contract_id": contract_id,
            "offered_quantity": 50,
            "offered_price_per_unit": 2400,
            "message": "Test bid",
        },
    )

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_buyer_cannot_view_farmer_contract_bids(
    client,
    auth_headers,
    buyer_headers,
):
    contract_id = await create_contract(
        client=client,
        headers=auth_headers,
        title="Buyer Permission Test Contract",
    )

    response = await client.get(
        f"/contract-bids/contract/{contract_id}",
        headers=buyer_headers,
    )

    assert response.status_code == 403
