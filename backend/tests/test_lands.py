import uuid

from httpx import AsyncClient


async def test_create_land(
    client: AsyncClient,
    auth_headers: dict[str, str],
):
    response = await client.post(
        "/lands/",
        headers=auth_headers,
        json={
            "land_name": "Test Farm",
            "village": "Sehore",
            "district": "Sehore",
            "state": "Madhya Pradesh",
            "area_acres": 5.5,
            "soil_type": "Black Soil",
            "irrigation_type": "Borewell",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["land_name"] == "Test Farm"
    assert data["area_acres"] == "5.50"
    assert "id" in data
    assert "farmer_id" in data


async def test_get_my_lands(
    client: AsyncClient,
    auth_headers: dict[str, str],
):
    response = await client.get(
        "/lands/",
        headers=auth_headers,
    )

    assert response.status_code == 200
    assert isinstance(response.json(), list)


async def test_get_land_not_found(
    client: AsyncClient,
    auth_headers: dict[str, str],
):
    missing_land_id = uuid.uuid4()

    response = await client.get(
        f"/lands/{missing_land_id}",
        headers=auth_headers,
    )

    assert response.status_code == 404
