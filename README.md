# 🌾 Digital Krishii

### Digital Agriculture & Contract Farming Platform

[![Live Demo](https://img.shields.io/badge/Live%20Demo-AWS%20Amplify-orange?style=for-the-badge&logo=amazon-aws&logoColor=white)](https://main.d35kaajrrt35e3.amplifyapp.com)
[![Backend API](https://img.shields.io/badge/Backend-FastAPI%20%7C%20AWS%20ECS-orange?style=for-the-badge&logo=amazon-aws&logoColor=white)](https://di-aa9e728129cd4cb38418fc3b013a5fd5.ecs.ap-south-1.on.aws)
[![Repository](https://img.shields.io/badge/Source-GitHub-black?style=for-the-badge&logo=github)](https://github.com/yash-yadav1804/Digital_Krishiii)

> A full-stack AgriTech platform that brings farmer management, land management, crop tracking, contract farming, agricultural marketplace listings, equipment discovery, and administration into one digital workspace.

---

## 🚀 Live Application

### 🌐 Frontend
**https://main.d35kaajrrt35e3.amplifyapp.com**

### ⚡ Backend API
**https://di-aa9e728129cd4cb38418fc3b013a5fd5.ecs.ap-south-1.on.aws**

### 📚 API Documentation
**https://di-aa9e728129cd4cb38418fc3b013a5fd5.ecs.ap-south-1.on.aws/docs**

---

## 📖 About

**Digital Krishii** is a full-stack agricultural management and marketplace platform designed to provide farmers and administrators with a centralized digital workspace.

The platform combines multiple agricultural workflows into a single application, including:

- Farmer profile management
- Agricultural land management
- Crop tracking
- Contract farming
- Buyer bidding and negotiation
- Land lease and rental listings
- Agricultural equipment discovery
- Notifications
- Reviews
- Support operations
- Role-based administration

The application is built with a modern frontend/backend architecture and deployed on AWS using containerized backend infrastructure.

---

## 🎯 Problem Statement

Agricultural workflows are often distributed across manual and disconnected processes such as farm management, land records, crop planning, contract negotiation, equipment access, and buyer communication.

Digital Krishii aims to centralize these activities into one software platform where users can manage agricultural operations and marketplace interactions digitally.

---

# ✨ Features

## 👨‍🌾 Farmer Workspace

The farmer workspace provides a centralized dashboard for agricultural operations.

### Dashboard

Farmers can view:

- Total land
- Active crops
- Contracts
- Pending activities
- Recent crop activity
- Quick actions

### 🌱 Land Management

- Add agricultural properties
- View registered lands
- Track land area
- Manage soil information
- Track irrigation types
- View property locations
- Manage land status

### 🌾 Crop Management

- Create and track crop cycles
- Manage crop-related information
- Monitor crop activity across fields

### 🤝 Contract Management

Farmers can:

- Create contracts
- Manage farming contracts
- View active and completed contracts
- Track contract values
- Invite buyers
- Review bids
- Negotiate terms

Contract information includes:

- Product / crop
- Quantity
- Price per unit
- Contract period
- Total value
- Status
- Bids

### 🏞️ Land Marketplace

Farmers can list agricultural land for:

- Lease
- Rental

Listings include:

- Listing type
- Price per acre
- Duration
- Property information
- Soil type
- Irrigation information
- Requests

### 🚜 Equipment Marketplace

Users can discover agricultural equipment such as:

- Tractors
- Harvesters
- Farming machinery
- Agricultural tools

Equipment information includes:

- Equipment type
- Condition
- Location
- Description
- Rental price

---

# 👨‍💼 Admin Workspace

Digital Krishii provides a dedicated administration workspace for platform management.

### Admin Dashboard

Administrators can access:

- Admin overview
- User management
- Profile directory
- Marketplace
- Notifications
- Support
- Reviews
- Settings

### User & Role Management

The backend implements role-based access control for platform users.

Supported roles include:

```text
ADMIN
FARMER
```

Administrators can manage users and their assigned roles.

---

# 🔐 Authentication & Authorization

The application uses **JWT-based authentication** with role-based authorization.

```text
User
  │
  ▼
Login
  │
  ▼
Credential Validation
  │
  ▼
JWT Access Token
  │
  ▼
Frontend
  │
  ▼
Authorization Header
  │
  ▼
FastAPI Authentication Layer
  │
  ▼
Current User
  │
  ▼
Role Validation
  │
  ├───────────────┐
  ▼               ▼
FARMER          ADMIN
  │               │
  ▼               ▼
Farmer APIs     Admin APIs
```

Protected API endpoints validate authentication and authorization before performing restricted operations.

---

# 🏗️ System Architecture

```text
                    ┌──────────────────────┐
                    │      End Users       │
                    │ Farmers / Admins     │
                    └──────────┬───────────┘
                               │
                             HTTPS
                               │
                               ▼
                    ┌──────────────────────┐
                    │    AWS Amplify       │
                    │                      │
                    │   React + Vite       │
                    └──────────┬───────────┘
                               │
                            REST API
                               │
                               ▼
                ┌───────────────────────────────┐
                │       AWS ECS Fargate         │
                │                               │
                │        FastAPI Backend        │
                │                               │
                │ Authentication                │
                │ Authorization                 │
                │ Business Logic                │
                │ REST APIs                     │
                └───────────────┬───────────────┘
                                │
                           SQLAlchemy
                                │
                                ▼
                     ┌─────────────────────┐
                     │    PostgreSQL       │
                     │      AWS RDS        │
                     └─────────────────────┘
```

---

# ☁️ AWS Production Architecture

The production application uses AWS services for frontend hosting, containerized backend deployment, database hosting, and infrastructure management.

```text
                         Internet
                            │
                            ▼
                 ┌─────────────────────┐
                 │    AWS Amplify      │
                 │  React Frontend     │
                 └──────────┬──────────┘
                            │
                          HTTPS
                            │
                            ▼
                 ┌─────────────────────┐
                 │ ECS Express Service │
                 │                     │
                 │   AWS ECS Fargate   │
                 │                     │
                 │ FastAPI + Docker    │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │    Amazon RDS       │
                 │    PostgreSQL       │
                 └─────────────────────┘
```

### AWS Services Used

| Service | Purpose |
|---|---|
| **AWS Amplify** | React frontend hosting and deployment |
| **Amazon ECS Fargate** | Backend container execution |
| **Amazon ECR** | Docker image registry |
| **Amazon RDS** | PostgreSQL database |
| **AWS IAM** | Access control and task permissions |
| **Application Load Balancer** | Backend traffic routing |
| **AWS ECS Exec** | Production container administration |

---

# 🛠️ Technology Stack

## Frontend

- React.js
- Vite
- JavaScript
- Axios
- React Router
- HTML5
- CSS

## Backend

- Python
- FastAPI
- SQLAlchemy
- Pydantic
- Alembic
- Psycopg
- JWT Authentication

## Database

- PostgreSQL
- SQLAlchemy ORM
- Alembic Migrations

## DevOps & Cloud

- Docker
- Git
- GitHub
- Amazon ECR
- AWS ECS Fargate
- AWS Amplify
- Amazon RDS
- AWS IAM
- Application Load Balancer

---

# 🧩 Backend Architecture

The backend follows a modular architecture separating API routes, authentication, authorization, database models, schemas, and application logic.

```text
API Routes
    │
    ▼
Dependencies
    │
    ├── Authentication
    └── Authorization
    │
    ▼
Business Logic
    │
    ▼
SQLAlchemy ORM
    │
    ▼
PostgreSQL
```

This structure improves maintainability, modularity, and extensibility.

---

# 🗄️ Database Architecture

Digital Krishii uses **PostgreSQL** as its relational database and **SQLAlchemy** as the ORM.

Database schema changes are managed using **Alembic**.

```text
FastAPI
   │
   ▼
SQLAlchemy ORM
   │
   ▼
PostgreSQL
   │
   ▼
Amazon RDS
```

Alembic provides version-controlled database migrations across environments.

---

# 🐳 Docker & Containerization

The backend is containerized using Docker.

### Build

```bash
docker build -t digital-krishii-backend .
```

### Run Locally

```bash
docker run -p 8000:8000 digital-krishii-backend
```

The production Docker image is stored in **Amazon ECR** and deployed using **AWS ECS Fargate**.

---

# 🔄 Deployment Workflow

## Backend

```text
Developer
    │
    ▼
GitHub
    │
    ▼
Docker Build
    │
    ▼
Amazon ECR
    │
    ▼
AWS ECS Fargate
    │
    ▼
Production API
```

## Frontend

```text
React + Vite
    │
    ▼
GitHub
    │
    ▼
AWS Amplify
    │
    ▼
Production Frontend
```

---

# 🩺 Health Check

The backend exposes a dedicated health endpoint:

```http
GET /health
```

Response:

```json
{
  "status": "ok"
}
```

This endpoint is used by the production infrastructure for backend health monitoring and service health checks.

---

# 📚 API Documentation

FastAPI provides interactive API documentation using Swagger UI.

### Swagger UI

```text
/docs
```

### OpenAPI

```text
/openapi.json
```

Production Swagger:

https://di-aa9e728129cd4cb38418fc3b013a5fd5.ecs.ap-south-1.on.aws/docs

---

# 📸 Application Screenshots

## 🔐 Login

![Digital Krishii Login](screenshots/login.png)

---

## 👨‍💼 Admin Dashboard

![Admin Dashboard](screenshots/admin-dashboard.png)

The admin workspace provides centralized access to user management, marketplace activity, support, notifications, reviews, and settings.

---

## 👨‍🌾 Farmer Dashboard

![Farmer Dashboard](screenshots/farmer-dashboard.png)

The farmer workspace provides access to land, crops, contracts, marketplace features, equipment, notifications, reviews, and account settings.

---

## 👤 Farmer Profile

![Farmer Profile](screenshots/profile.png)

The profile workspace centralizes account identity, contact information, location, role information, and agricultural details.

---

## 🤝 Contract Management

![Contracts](screenshots/contracts.png)

The contract workspace allows farmers to create and manage contracts, view contract statistics, and review buyer bids.

---

## 🏞️ Land Management

![Land Management](screenshots/lands.png)

Farmers can manage agricultural properties, track total land area, soil information, irrigation type, location, and land status.

---

## 🏷️ Land Listings

![Land Listings](screenshots/land-listings.png)

The marketplace supports agricultural land lease and rental listings with pricing, duration, property information, and requests.

---

## 🚜 Equipment Marketplace

![Equipment Marketplace](screenshots/equipment.png)

Users can explore agricultural machinery and equipment with details such as type, condition, location, description, and rental price.

---

# 📂 Project Structure

```text
Digital_Krishiii/
│
├── backend/
│   │
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── scripts/
│   │   └── main.py
│   │
│   ├── alembic/
│   ├── tests/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── alembic.ini
│
├── frontend/
│   │
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── screenshots/
│   ├── login.png
│   ├── admin-dashboard.png
│   ├── farmer-dashboard.png
│   ├── profile.png
│   ├── contracts.png
│   ├── lands.png
│   ├── land-listings.png
│   └── equipment.png
│
└── README.md
```

---

# ⚙️ Local Development

## Prerequisites

Install the following:

- Python 3.x
- Node.js
- npm
- PostgreSQL
- Git
- Docker

---

## 1. Clone Repository

```bash
git clone https://github.com/yash-yadav1804/Digital_Krishiii.git

cd Digital_Krishiii
```

---

# Backend Setup

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv .venv
```

### Windows

```powershell
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run database migrations:

```bash
alembic upgrade head
```

Start FastAPI:

```bash
uvicorn app.main:app --reload
```

Backend:

```text
http://localhost:8000
```

Swagger:

```text
http://localhost:8000/docs
```

---

# Frontend Setup

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Start the development server:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# 🔑 Environment Variables

## Backend

```env
DATABASE_URL=your_database_url
JWT_SECRET_KEY=your_secret_key
CORS_ORIGINS=http://localhost:5173
```

## Frontend

```env
VITE_API_BASE_URL=http://localhost:8000
```

> ⚠️ Never commit `.env` files, database credentials, JWT secrets, AWS credentials, or other sensitive information to GitHub.

---

# 🧪 Testing

Run the backend test suite using:

```bash
pytest
```

Testing is used during development to validate backend functionality and application behavior.

---

# 🔒 Security

The application includes:

- JWT-based authentication
- Role-based authorization
- Protected API endpoints
- Environment-based configuration
- CORS configuration
- HTTPS production communication
- AWS IAM permissions
- ECS Exec for controlled production administration

Production secrets should be managed using a secure secret-management solution instead of source control.

---

# 📈 Future Improvements

- Advanced contract bidding
- Digital contract signing
- Dedicated buyer workspace
- Payment integration
- Notifications and alerts
- Agricultural analytics
- Mobile application
- Advanced admin analytics
- AWS Secrets Manager
- Automated CI/CD pipeline
- Enhanced application monitoring and observability

---

# 🏆 Project Highlights

- Full-stack **React + FastAPI** application
- RESTful API architecture
- JWT authentication
- Role-based access control
- PostgreSQL database
- SQLAlchemy ORM
- Alembic database migrations
- Dockerized backend
- AWS ECS Fargate deployment
- Amazon ECR container registry
- Amazon RDS PostgreSQL
- AWS Amplify frontend deployment
- Production health checks
- Separate Farmer and Admin workspaces
- Agricultural marketplace workflows

---

# 🎓 Project Recognition

**Digital Krishii was selected for RGPV incubation funding.**

---

# 👨‍💻 Developer

## Raj Mahajan

**B.Tech Computer Science & Engineering**

### GitHub
https://github.com/yash-yadav1804

### Project Repository
https://github.com/yash-yadav1804/Digital_Krishiii

---

# 🌾 Digital Krishii

### One workspace for farms, crops, contracts, land, equipment, and agricultural marketplace activity.

**Built with React, FastAPI, PostgreSQL, Docker, and AWS.**
