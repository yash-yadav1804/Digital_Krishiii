from uuid import uuid4

import pytest


@pytest.mark.asyncio
async def test_create_crop(
    client,
    auth_headers,
):
    land_response = await client.post(
        "/lands/",
        json={
            "land_name": "Crop Test Farm",
            "village": "Sehore",
            "district": "Sehore",
            "state": "Madhya Pradesh",
            "area_acres": 5.5,
            "soil_type": "Black Soil",
            "irrigation_type": "Borewell",
        },
        headers=auth_headers,
    )

    assert land_response.status_code in (200, 201), (
        land_response.status_code,
        land_response.text,
    )

    land_id = land_response.json()["id"]

    crop_response = await client.post(
        "/api/v1/crops",
        json={
            "land_id": land_id,
            "crop_name": "Wheat",
            "season": "Rabi",
            "sowing_date": "2026-11-15",
            "expected_harvest_date": "2027-03-20",
            "expected_yield": 18.5,
        },
        headers=auth_headers,
    )

    assert crop_response.status_code == 201, (
        crop_response.status_code,
        crop_response.text,
    )

    data = crop_response.json()

    assert data["crop_name"] == "Wheat"
    assert data["land_id"] == land_id


@pytest.mark.asyncio
async def test_list_crops(
    client,
    auth_headers,
):
    response = await client.get(
        "/api/v1/crops",
        headers=auth_headers,
    )

    print("STATUS:", response.status_code)
    print("BODY:", response.json())

    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.mark.asyncio
async def test_get_crop_not_found(
    client,
    auth_headers,
):
    response = await client.get(
        f"/api/v1/crops/{uuid4()}",
        headers=auth_headers,
    )

    assert response.status_code == 404


@pytest.mark.asyncio
async def test_update_crop(
    client,
    auth_headers,
):
    land_response = await client.post(
        "/lands/",
        json={
            "land_name": "Update Crop Farm",
            "area_acres": 3.0,
        },
        headers=auth_headers,
    )

    assert land_response.status_code in (200, 201)

    land_id = land_response.json()["id"]

    create_response = await client.post(
        "/api/v1/crops",
        json={
            "land_id": land_id,
            "crop_name": "Rice",
            "season": "Kharif",
            "expected_yield": 10.0,
        },
        headers=auth_headers,
    )

    assert create_response.status_code == 201

    crop_id = create_response.json()["id"]

    update_response = await client.patch(
        f"/api/v1/crops/{crop_id}",
        json={
            "crop_name": "Updated Rice",
            "expected_yield": 12.5,
        },
        headers=auth_headers,
    )

    assert update_response.status_code == 200

    data = update_response.json()

    assert data["crop_name"] == "Updated Rice"
    assert data["expected_yield"] == "12.50"


@pytest.mark.asyncio
async def test_delete_crop(
    client,
    auth_headers,
):
    land_response = await client.post(
        "/lands/",
        json={
            "land_name": "Delete Crop Farm",
            "area_acres": 2.0,
        },
        headers=auth_headers,
    )

    assert land_response.status_code in (200, 201)

    land_id = land_response.json()["id"]

    create_response = await client.post(
        "/api/v1/crops",
        json={
            "land_id": land_id,
            "crop_name": "Soybean",
            "season": "Kharif",
        },
        headers=auth_headers,
    )

    assert create_response.status_code == 201

    crop_id = create_response.json()["id"]

    delete_response = await client.delete(
        f"/api/v1/crops/{crop_id}",
        headers=auth_headers,
    )

    assert delete_response.status_code == 204

    get_response = await client.get(
        f"/api/v1/crops/{crop_id}",
        headers=auth_headers,
    )

    assert get_response.status_code == 404


@pytest.mark.asyncio
async def test_farmer_cannot_create_crop_for_another_farmer_land(
    client,
    auth_headers,
):
    first_farmer_land_response = await client.post(
        "/lands/",
        json={
            "land_name": "First Farmer Land",
            "village": "Sehore",
            "district": "Sehore",
            "state": "Madhya Pradesh",
            "area_acres": 4.0,
        },
        headers=auth_headers,
    )

    assert first_farmer_land_response.status_code in (200, 201)

    land_id = first_farmer_land_response.json()["id"]

    second_farmer_email = f"second-farmer-{uuid4()}@example.com"
    second_farmer_password = "TestPassword123!"

    register_response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": second_farmer_email,
            "password": second_farmer_password,
        },
    )

    assert register_response.status_code in (200, 201)

    login_response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": second_farmer_email,
            "password": second_farmer_password,
        },
    )

    assert login_response.status_code == 200

    second_farmer_token = login_response.json()["access_token"]

    second_farmer_headers = {
        "Authorization": f"Bearer {second_farmer_token}",
    }

    crop_response = await client.post(
        "/api/v1/crops",
        json={
            "land_id": land_id,
            "crop_name": "Unauthorized Wheat",
            "season": "Rabi",
            "expected_yield": 10,
        },
        headers=second_farmer_headers,
    )

    assert crop_response.status_code == 404
    assert crop_response.json()["detail"] == "Land not found"
