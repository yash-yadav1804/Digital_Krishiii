import pytest


@pytest.mark.asyncio
async def test_buyer_can_create_contract_bid(
    client,
    auth_headers,
    buyer_headers,
):
    land_response = await client.post(
        "/lands/",
        json={
            "land_name": "Bid Test Land",
            "village": "Sehore",
            "district": "Sehore",
            "state": "Madhya Pradesh",
            "area_acres": 5,
        },
        headers=auth_headers,
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
        headers=auth_headers,
    )

    assert crop_response.status_code in (200, 201)
    crop_id = crop_response.json()["id"]

    contract_response = await client.post(
        "/contracts",
        json={
            "land_id": land_id,
            "crop_id": crop_id,
            "title": "Bid Test Contract",
            "description": "Contract for testing bids",
            "quantity": 100,
            "price_per_unit": 2500,
            "start_date": "2026-10-01",
            "end_date": "2027-03-31",
        },
        headers=auth_headers,
    )

    assert contract_response.status_code == 201
    contract_id = contract_response.json()["id"]

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
