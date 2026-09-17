from uuid import uuid4

import pytest


async def create_contract(client, headers, title="Test Contract"):
    land_response = await client.post(
        "/lands/",
        json={
            "land_name": f"Bid Test Land {uuid4()}",
            "village": "Sehore",
            "district": "Sehore",
            "state": "Madhya Pradesh",
            "area_acres": 5,
        },
        headers=headers,
    )

    assert land_response.status_code in (200, 201)
    land_id = land_response.json()["id"]

    crop_response = await client.post(
        "/api/v1/crops",
        json={
            "land_id": land_id,
            "crop_name": "Wheat",
            "season": "Rabi",
            "expected_yield": 20,
        },
        headers=headers,
    )

    assert crop_response.status_code in (200, 201)
    crop_id = crop_response.json()["id"]

    contract_response = await client.post(
        "/contracts",
        json={
            "land_id": land_id,
            "crop_id": crop_id,
            "title": title,
            "description": "Contract for testing bids",
            "quantity": 100,
            "price_per_unit": 2500,
            "start_date": "2026-10-01",
            "end_date": "2027-03-31",
        },
        headers=headers,
    )

    assert contract_response.status_code == 201

    return contract_response.json()["id"]


async def create_bid(client, buyer_headers, contract_id):
    response = await client.post(
        "/contract-bids",
        json={
            "contract_id": contract_id,
            "offered_quantity": 50,
            "offered_price_per_unit": 2400,
            "message": "I would like to purchase this crop",
        },
        headers=buyer_headers,
    )

    assert response.status_code == 201
    return response.json()


@pytest.mark.asyncio
async def test_buyer_can_create_contract_bid(
    client,
    auth_headers,
    buyer_headers,
):
    contract_id = await create_contract(
        client=client,
        headers=auth_headers,
        title="Buyer Bid Test Contract",
    )

    bid_response = await client.post(
        "/contract-bids",
        json={
            "contract_id": contract_id,
            "offered_quantity": 50,
            "offered_price_per_unit": 2400,
            "message": "I would like to purchase this crop",
        },
        headers=buyer_headers,
    )

    assert bid_response.status_code == 201
    assert bid_response.json()["status"] == "PENDING"
    assert bid_response.json()["buyer_id"] is not None


@pytest.mark.asyncio
async def test_farmer_can_view_bids_for_own_contract(
    client,
    auth_headers,
    buyer_headers,
):
    contract_id = await create_contract(
        client=client,
        headers=auth_headers,
        title="Own Contract View Test",
    )

    await create_bid(
        client=client,
        buyer_headers=buyer_headers,
        contract_id=contract_id,
    )

    response = await client.get(
        f"/contract-bids/contract/{contract_id}",
        headers=auth_headers,
    )

    assert response.status_code == 200
    assert len(response.json()) == 1


@pytest.mark.asyncio
async def test_farmer_cannot_view_another_farmers_contract_bids(
    client,
    auth_headers,
    buyer_headers,
    second_farmer_headers,
):
    contract_id = await create_contract(
        client=client,
        headers=auth_headers,
        title="Private Contract View Test",
    )

    await create_bid(
        client=client,
        buyer_headers=buyer_headers,
        contract_id=contract_id,
    )

    response = await client.get(
        f"/contract-bids/contract/{contract_id}",
        headers=second_farmer_headers,
    )

    assert response.status_code == 403
    assert response.json()["detail"] == ("You cannot view bids for this contract")


@pytest.mark.asyncio
async def test_farmer_can_accept_bid_for_own_contract(
    client,
    auth_headers,
    buyer_headers,
):
    contract_id = await create_contract(
        client=client,
        headers=auth_headers,
        title="Accept Bid Test Contract",
    )

    bid = await create_bid(
        client=client,
        buyer_headers=buyer_headers,
        contract_id=contract_id,
    )

    response = await client.patch(
        f"/contract-bids/{bid['id']}",
        json={
            "status": "ACCEPTED",
        },
        headers=auth_headers,
    )

    assert response.status_code == 200
    assert response.json()["status"] == "ACCEPTED"


@pytest.mark.asyncio
async def test_farmer_cannot_update_bid_for_another_farmers_contract(
    client,
    auth_headers,
    buyer_headers,
    second_farmer_headers,
):
    contract_id = await create_contract(
        client=client,
        headers=auth_headers,
        title="Private Contract Update Test",
    )

    bid = await create_bid(
        client=client,
        buyer_headers=buyer_headers,
        contract_id=contract_id,
    )

    response = await client.patch(
        f"/contract-bids/{bid['id']}",
        json={
            "status": "REJECTED",
        },
        headers=second_farmer_headers,
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "You cannot update this bid"


@pytest.mark.asyncio
async def test_buyer_cannot_view_contract_bids(
    client,
    auth_headers,
    buyer_headers,
):
    contract_id = await create_contract(
        client=client,
        headers=auth_headers,
        title="Buyer Permission Test",
    )

    response = await client.get(
        f"/contract-bids/contract/{contract_id}",
        headers=buyer_headers,
    )

    assert response.status_code == 403


@pytest.mark.asyncio
async def test_buyer_cannot_update_contract_bid(
    client,
    auth_headers,
    buyer_headers,
):
    contract_id = await create_contract(
        client=client,
        headers=auth_headers,
        title="Buyer Update Permission Test",
    )

    bid = await create_bid(
        client=client,
        buyer_headers=buyer_headers,
        contract_id=contract_id,
    )

    response = await client.patch(
        f"/contract-bids/{bid['id']}",
        json={
            "status": "ACCEPTED",
        },
        headers=buyer_headers,
    )

    assert response.status_code == 403
