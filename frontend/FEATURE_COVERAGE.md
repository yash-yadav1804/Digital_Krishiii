# Digital Krishii — Frontend/Backend Feature Coverage

This document records the frontend surfaces mapped to the current FastAPI backend.

## Architecture

```text
React UI
  ↓
role-aware pages/routes
  ↓
feature service modules
  ↓
shared Axios client + JWT interceptor
  ↓
FastAPI route
  ↓
service layer
  ↓
repository layer
  ↓
SQLAlchemy
  ↓
PostgreSQL
```

The frontend does not bypass the API or access the database directly.

## Feature matrix

| Domain | Backend capability | Frontend surface |
|---|---|---|
| Authentication | register/login/current user | Login, Register, AuthContext |
| Farmer profile | create/read/update/admin listing | Profile, Admin Profile Directory |
| Buyer profile | create/read/update/list | Profile, Admin Profile Directory |
| Lands | CRUD | My Lands |
| Crops | CRUD | My Crops |
| Land listings | create/read/update/delete/open | Lease Lands |
| Lease requests | buyer create/list, farmer review/decision | Lease Marketplace, My Lease Requests, Lease Lands requests |
| Contracts | create/read/update/delete/open/assigned | Contracts, Marketplace, My Contracts, Contract Detail |
| Contract bids | create/list/update decision | Marketplace, My Bids, Contracts |
| Negotiations | list/create/accept/reject | Contract Detail |
| Equipment | provider CRUD, available marketplace | Equipment |
| Equipment requests | farmer create/list, provider review/decision | Equipment, Equipment Requests |
| Notifications | list/read/read-all | Notifications + dashboard previews |
| Reviews | create/list by user | Reviews |
| Support | create/list/update admin | Support |
| Admin | users/status/roles | Admin, Profile Directory |
| Image uploads | authenticated image upload | Profile, land, crop, contract, bid, listing, equipment, negotiation |
| Role-aware workspace | farmer/buyer/admin/provider | Navbar, protected routes, role dashboards |

## Important backend constraints respected by the frontend

- Only farmers create/manage lands and crops.
- Only farmers create/manage contracts.
- Only buyers place contract bids.
- Only farmers accept/reject contract bids.
- Negotiations require a contract participant and an assigned buyer.
- Only buyers create lease requests.
- Only farmers accept/reject lease requests.
- Equipment providers manage equipment.
- Farmers request equipment rentals.
- Equipment providers accept/reject equipment requests.
- Reviews are only valid for completed contracts and contract participants.
- Admin-only operations remain protected by backend authorization.

## No database access from the browser

All frontend data access goes through the existing Axios API client. JWT authentication is attached centrally by the request interceptor.
